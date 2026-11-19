// Creador de webs de 4haus Studio.
//
// Flujo: el usuario describe su web → Claude Sonnet la diseña como un único archivo HTML con
// portada 3D (three.js) → el usuario la ve en vivo con una marca de "Vista previa" → pide
// cambios (Claude modifica solo lo necesario) → descarga el archivo limpio al pagar.
//
// La generación tarda 1–3 minutos, así que funciona como "trabajo en curso": el servidor
// responde enseguida y la pantalla consulta el estado cada pocos segundos.
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { aiBudgetAvailable, recordAiSpend, priceFor } from './daniel.ts';
import { loadJsonDoc, saveJsonDoc, loadServerDoc, saveServerDoc } from './storage.ts';
import { ClaudeApiError, KnownAiError, classifyAiError, noteAiFailure, noteAiSuccess, type AiErrorCode } from './aiErrors.ts';
import { LEVELS, parseLevel, upgradeReason, chargeCredits, refundCredits, addCreditSpend, creditStatus, type SiteLevel } from './siteCredits.ts';
import { getTemplate, templateBrief } from './templates.ts';

const MODEL = 'claude-sonnet-5-5';
// Solo para pruebas locales con un servidor simulado; en producción queda vacío.
const API_URL = `${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`;
const COLLECTION = 'serverSites';
const SITES_DIR = path.resolve(process.cwd(), 'data', 'sites');
const DAILY_GENERATIONS = Number(process.env.SITES_DAILY_GENERATIONS || 3);
const DAILY_EDITS = Number(process.env.SITES_DAILY_EDITS || 20);
const MAX_SITES_PER_USER = 20;
// Visitantes sin registro: 1 maqueta de muestra por navegador, con frenos contra abuso.
const ANON_DAILY_BUDGET_USD = Number(process.env.ANON_DAILY_BUDGET_USD || 3);
const ANON_PER_IP_DAILY = Number(process.env.ANON_PER_IP_DAILY || 2);
const ANON_ID = /^anon_[a-z0-9]{6,40}$/i;

if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR, { recursive: true });

export interface SiteChange {
  instruction: string;
  summary: string;
  at: string;
}

export interface Site {
  id: string;
  ownerId: string;
  title: string;
  brief: string;
  status: 'generating' | 'editing' | 'ready' | 'error';
  error?: string;
  html: string;
  previousHtml?: string;
  changes: SiteChange[];
  paid: boolean;
  /** Maqueta de muestra de un visitante sin registro (más corta). */
  sample?: boolean;
  /** Nivel elegido (define créditos y largo máximo). */
  level?: SiteLevel;
  templateId?: string;
  /** Lo que se le pidió a la IA (para poder reintentar sin volver a subir nada). */
  input?: { attachments: SiteAttachment[]; imageIds: string[] };
  errorCode?: AiErrorCode;
  /** Motivo exacto y acción sugerida: solo los ve un administrador. */
  adminError?: string;
  adminAction?: { label: string; url: string };
  costUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteAttachment {
  kind: 'texto' | 'zip' | 'datos';
  name: string;
  text: string;
}

type WorkspaceIO = {
  read: (userId: string) => any;
  write: (data: any, userId: string) => void;
};

// ---------------------------------------------------------------- almacenamiento
const cache = new Map<string, Site>();

function siteFile(id: string) {
  return path.join(SITES_DIR, `${id.replace(/[^a-zA-Z0-9_-]/g, '')}.json`);
}

function saveSite(site: Site, io: WorkspaceIO) {
  site.updatedAt = new Date().toISOString();
  cache.set(site.id, site);
  try {
    fs.writeFileSync(siteFile(site.id), JSON.stringify(site), 'utf-8');
  } catch (err) {
    console.error('[sites] No se pudo guardar el archivo local:', (err as Error).message);
  }
  saveJsonDoc(COLLECTION, site.id, site, site.ownerId);
  // Índice ligero dentro del espacio del usuario (sin el HTML, para no inflarlo).
  const ws = io.read(site.ownerId);
  const list: any[] = Array.isArray(ws.sites) ? ws.sites : [];
  const entry = { id: site.id, title: site.title, status: site.status, paid: site.paid, updatedAt: site.updatedAt };
  const idx = list.findIndex((s) => s.id === site.id);
  if (idx >= 0) list[idx] = entry;
  else list.unshift(entry);
  ws.sites = list.slice(0, MAX_SITES_PER_USER);
  io.write(ws, site.ownerId);
}

async function loadSite(id: string): Promise<Site | null> {
  if (cache.has(id)) return cache.get(id)!;
  try {
    const f = siteFile(id);
    if (fs.existsSync(f)) {
      const s = JSON.parse(fs.readFileSync(f, 'utf-8')) as Site;
      cache.set(id, s);
      return s;
    }
  } catch {
    /* se intenta en Firestore */
  }
  const remote = await loadJsonDoc<Site>(COLLECTION, id);
  if (remote) {
    cache.set(id, remote);
    try {
      fs.writeFileSync(siteFile(id), JSON.stringify(remote), 'utf-8');
    } catch {
      /* no es grave */
    }
  }
  return remote;
}

// ---------------------------------------------------------------- límites diarios por usuario
const usage = { day: '', loaded: false, per: {} as Record<string, { gen: number; edit: number }> };

async function usageFor(uid: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (usage.day !== today) {
    usage.day = today;
    usage.per = {};
    usage.loaded = false;
  }
  if (!usage.loaded) {
    const saved = await loadServerDoc<{ per?: Record<string, { gen: number; edit: number }> }>(`siteUsage-${today}`);
    if (saved?.per) usage.per = { ...saved.per, ...usage.per };
    usage.loaded = true;
  }
  usage.per[uid] = usage.per[uid] || { gen: 0, edit: 0 };
  return usage.per[uid];
}

function saveUsage() {
  saveServerDoc(`siteUsage-${usage.day}`, { per: usage.per, updatedAt: new Date().toISOString() });
}

// Gasto y conteo de visitantes sin registro (global y por dirección IP).
const anon = { day: '', loaded: false, spentUsd: 0, perIp: {} as Record<string, number> };

async function anonState() {
  const today = new Date().toISOString().slice(0, 10);
  if (anon.day !== today) Object.assign(anon, { day: today, loaded: false, spentUsd: 0, perIp: {} });
  if (!anon.loaded) {
    const saved = await loadServerDoc<{ spentUsd?: number; perIp?: Record<string, number> }>(`anonSites-${today}`);
    if (saved) {
      anon.spentUsd = Math.max(anon.spentUsd, Number(saved.spentUsd) || 0);
      anon.perIp = { ...(saved.perIp || {}), ...anon.perIp };
    }
    anon.loaded = true;
  }
  return anon;
}

function saveAnon() {
  saveServerDoc(`anonSites-${anon.day}`, { spentUsd: anon.spentUsd, perIp: anon.perIp, updatedAt: new Date().toISOString() });
}

// ---------------------------------------------------------------- Claude
const SYSTEM = `Eres el diseñador web principal de 4haus Studio. Creas páginas web de nivel premium que un emprendedor puede vender a su cliente.

ENTREGA
- Un único archivo HTML completo y autónomo: <!DOCTYPE html> … </html>, con su CSS en <style> y su JavaScript en <script type="module">.
- Responde EXACTAMENTE con este formato y nada más:
<titulo>nombre corto de la web</titulo>
<html_file>
...el archivo completo...
</html_file>

DISEÑO
- Estilo limpio y cinematográfico (referencia: páginas de producto de Apple): tipografía grande, mucho espacio, pocos colores, jerarquía clara.
- Tipografía de Google Fonts (máximo dos familias).
- Totalmente adaptable a móvil (desde 360 px de ancho) sin desplazamiento horizontal.
- Secciones típicas: portada, propuesta de valor, servicios o productos, proceso o beneficios, sección de confianza, preguntas frecuentes, llamada a la acción y pie de página. Adáptalas a lo que pide el usuario.

PORTADA 3D (si el pedido trae una PLANTILLA DE REFERENCIA, la plantilla manda en la portada y el objeto 3D es opcional)
- La portada tiene un objeto 3D protagonista hecho con three.js, cargado así:
  <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"}}</script>
- El objeto se crea con geometrías de three.js (no cargues modelos ni texturas externas) y reacciona al scroll (gira, se acerca o se desarma) con el scroll nativo de la página.
- Respeta prefers-reduced-motion. Si WebGL no está disponible, muestra un degradado elegante en su lugar.
- No uses GSAP ni otras librerías de animación de pago; usa JavaScript propio, IntersectionObserver y CSS.

CONTENIDO
- Escribe en el idioma del pedido (español por defecto), con textos reales y persuasivos para ese negocio.
- No inventes testimonios, cifras, premios, clientes ni datos de contacto. Donde hagan falta, deja marcadores visibles como [Testimonio real de un cliente] o [Tu teléfono].
- No uses imágenes ni videos externos (ni de Unsplash, ni de otras webs): usa formas, degradados y SVG propios.
- Si el pedido trae FOTOS DEL CLIENTE numeradas, puedes usarlas en la web escribiendo exactamente src="{{IMG_1}}", src="{{IMG_2}}", etc. (o url({{IMG_1}}) en CSS). El servidor las reemplaza por la foto real. No inventes otros números.
- Las imágenes de referencia de estilo sirven para copiar el ambiente, los colores y la composición, no para pegarlas.
- Los formularios muestran un mensaje de "gracias" al enviarse (sin servidor) y llevan un comentario indicando dónde conectarlos.

CALIDAD
- HTML semántico y accesible (contraste suficiente, textos alternativos, foco visible).
- Código ordenado y comentado brevemente en español, que cargue rápido.`;

type ClaudeMessage = { role: 'user' | 'assistant'; content: string | any[] };

async function claudeStream(system: string, messages: ClaudeMessage[] | string, maxTokens: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClaudeApiError(401, 'Falta la clave de Claude en el servidor.');
  const msgs: ClaudeMessage[] = typeof messages === 'string' ? [{ role: 'user', content: messages }] : messages;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, stream: true, messages: msgs }),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new ClaudeApiError(res.status, detail);
  }
  // Se recibe en partes (streaming) para no cortar respuestas largas.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let inTok = 0;
  let outTok = 0;
  let stopReason = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const dataLine = chunk.split('\n').find((l) => l.startsWith('data:'));
      if (!dataLine) continue;
      let ev: any;
      try {
        ev = JSON.parse(dataLine.slice(5).trim());
      } catch {
        continue;
      }
      if (ev.type === 'message_start') inTok = ev.message?.usage?.input_tokens || 0;
      else if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') text += ev.delta.text || '';
      else if (ev.type === 'message_delta') {
        outTok = ev.usage?.output_tokens || outTok;
        stopReason = ev.delta?.stop_reason || stopReason;
      } else if (ev.type === 'error') {
        const t = String(ev.error?.type || '');
        throw new ClaudeApiError(t === 'overloaded_error' ? 529 : t === 'rate_limit_error' ? 429 : 500, ev.error?.message || 'error');
      }
    }
  }
  return { text, costUsd: priceFor(MODEL, inTok, outTok), stopReason, outTok };
}

/** Une dos pedazos quitando lo que la IA haya repetido al continuar. Exportado para las pruebas. */
export function joinContinuation(prev: string, next: string): string {
  const max = Math.min(400, prev.length, next.length);
  for (let n = max; n >= 20; n--) {
    if (prev.endsWith(next.slice(0, n))) return prev + next.slice(n);
  }
  return prev + next;
}

/**
 * Pide la web y, si se corta por largo, pide que continúe donde quedó hasta llegar al máximo del
 * nivel. Devuelve el texto completo y lo que costó.
 */
export async function generateLong(
  system: string,
  userContent: string | any[],
  firstTokens: number,
  maxTokens: number,
  call: typeof claudeStream = claudeStream,
) {
  let out = await call(system, [{ role: 'user', content: userContent }], firstTokens);
  let text = out.text;
  let costUsd = out.costUsd;
  let used = out.outTok || firstTokens;
  let stop = out.stopReason;
  for (let i = 0; i < 2 && stop === 'max_tokens' && used < maxTokens; i++) {
    const room = Math.max(2000, Math.min(10000, maxTokens - used));
    const more = await call(
      system,
      [
        { role: 'user', content: userContent },
        { role: 'assistant', content: text },
        { role: 'user', content: 'Tu respuesta se cortó por largo. Continúa EXACTAMENTE desde el último carácter, sin repetir nada ni explicar, hasta cerrar </html_file>.' },
      ],
      room,
    );
    text = joinContinuation(text, more.text);
    costUsd += more.costUsd;
    used += more.outTok || room;
    stop = more.stopReason;
  }
  return { text, costUsd, stopReason: stop };
}

async function claudeEdits(html: string, instruction: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClaudeApiError(401, 'Falta la clave de Claude en el servidor.');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: `${SYSTEM}\n\nAHORA ESTÁS EDITANDO una web existente. Cambia solo lo necesario para cumplir el pedido, manteniendo el estilo. Devuelve los cambios con la herramienta "aplicar_cambios": cada "buscar" debe ser un fragmento copiado EXACTAMENTE del archivo actual y que aparezca una sola vez.`,
      messages: [{ role: 'user', content: `ARCHIVO ACTUAL:\n<html_file>\n${html}\n</html_file>\n\nCAMBIO PEDIDO: ${instruction}` }],
      tools: [
        {
          name: 'aplicar_cambios',
          description: 'Lista de reemplazos exactos sobre el archivo actual.',
          input_schema: {
            type: 'object',
            properties: {
              resumen: { type: 'string', description: 'Qué cambiaste, en una frase para el usuario.' },
              cambios: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { buscar: { type: 'string' }, reemplazar: { type: 'string' } },
                  required: ['buscar', 'reemplazar'],
                },
              },
            },
            required: ['resumen', 'cambios'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'aplicar_cambios' },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ClaudeApiError(res.status, detail);
  }
  const data: any = await res.json();
  const costUsd = priceFor(MODEL, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0);
  const call = (data.content || []).find((b: any) => b.type === 'tool_use');
  return { input: call?.input as { resumen?: string; cambios?: { buscar: string; reemplazar: string }[] } | undefined, costUsd };
}

/** Saca el título y el HTML de la respuesta de Claude. Exportado para las pruebas. */
export function extractSite(text: string): { title: string; html: string } | null {
  const title = (text.match(/<titulo>([\s\S]*?)<\/titulo>/i)?.[1] || '').trim();
  let html = text.match(/<html_file>([\s\S]*?)<\/html_file>/i)?.[1]?.trim() || '';
  if (!html) {
    const start = text.search(/<!DOCTYPE html>|<html[\s>]/i);
    const end = text.toLowerCase().lastIndexOf('</html>');
    if (start >= 0 && end > start) html = text.slice(start, end + 7);
  }
  if (!/<html[\s>]/i.test(html) || !/<\/html>/i.test(html)) return null;
  return { title: title.slice(0, 80) || 'Mi web', html };
}

/** Aplica reemplazos exactos; si alguno no encaja, devuelve null. Exportado para las pruebas. */
export function applyEdits(html: string, edits: { buscar: string; reemplazar: string }[]): string | null {
  let out = html;
  for (const e of edits) {
    if (!e.buscar) return null;
    const first = out.indexOf(e.buscar);
    if (first < 0 || out.indexOf(e.buscar, first + 1) >= 0) return null;
    out = out.slice(0, first) + e.reemplazar + out.slice(first + e.buscar.length);
  }
  return out;
}

/** Vista previa: misma web con una marca visible y sin indexar. Exportado para las pruebas. */
export function withWatermark(html: string): string {
  const badge =
    '<div aria-hidden="true" style="position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483647;' +
    'background:rgba(0,0,0,.78);color:#fff;font:600 12px/1 system-ui,sans-serif;padding:9px 14px;border-radius:999px;' +
    'pointer-events:none;letter-spacing:.02em">Vista previa · 4haus Studio</div>';
  let out = html.replace(/<head([^>]*)>/i, '<head$1><meta name="robots" content="noindex">');
  out = /<\/body>/i.test(out) ? out.replace(/<\/body>/i, `${badge}</body>`) : out + badge;
  return out;
}

// ---------------------------------------------------------------- fotos del cliente
// Cada foto se guarda aparte (Firestore admite ~1 MB por documento) y la web solo lleva
// {{IMG_1}}, {{IMG_2}}…; al mostrarla o descargarla se reemplazan por la foto real.
const ASSET_COLLECTION = 'siteAssets';
const ASSETS_DIR = path.join(SITES_DIR, 'assets');
const assetCache = new Map<string, string>();
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

function saveAsset(id: string, dataUrl: string, ownerId: string) {
  assetCache.set(id, dataUrl);
  try {
    fs.writeFileSync(path.join(ASSETS_DIR, `${id}.txt`), dataUrl, 'utf-8');
  } catch {
    /* queda en Firestore */
  }
  saveJsonDoc(ASSET_COLLECTION, id, { dataUrl }, ownerId);
}

async function loadAsset(id: string): Promise<string> {
  if (assetCache.has(id)) return assetCache.get(id)!;
  try {
    const f = path.join(ASSETS_DIR, `${id.replace(/[^a-zA-Z0-9_-]/g, '')}.txt`);
    if (fs.existsSync(f)) {
      const v = fs.readFileSync(f, 'utf-8');
      assetCache.set(id, v);
      return v;
    }
  } catch {
    /* se intenta en Firestore */
  }
  const doc = await loadJsonDoc<{ dataUrl: string }>(ASSET_COLLECTION, id);
  if (doc?.dataUrl) assetCache.set(id, doc.dataUrl);
  return doc?.dataUrl || '';
}

/** Reemplaza {{IMG_n}} por las fotos del cliente. Exportado para las pruebas. */
export function fillImages(html: string, images: string[]): string {
  return html.replace(/\{\{IMG_(\d+)\}\}/g, (m, n) => images[Number(n) - 1] || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
}

async function siteImages(site: Site): Promise<string[]> {
  const ids = site.input?.imageIds || [];
  return Promise.all(ids.map((id) => loadAsset(id)));
}

/** Arma el pedido para la IA: texto, adjuntos, plantilla y fotos. Exportado para las pruebas. */
export function buildRequest(
  site: Pick<Site, 'brief' | 'sample' | 'level'>,
  attachments: SiteAttachment[],
  images: string[],
  templateText: string,
): string | any[] {
  const level = LEVELS[site.level || 'completa'];
  const scope = site.sample
    ? 'VERSIÓN DE MUESTRA: solo la portada, 3 secciones clave y el pie de página, con el mismo nivel de diseño.'
    : site.level === 'basica'
      ? 'NIVEL BÁSICA: una landing de una sola página, con portada y 4 a 5 secciones.'
      : site.level === 'avanzada'
        ? 'NIVEL AVANZADA: web completa y rica en efectos, con todas las secciones que pida el negocio.'
        : 'NIVEL COMPLETA: web completa con las secciones típicas del negocio.';
  const parts: string[] = [`Crea esta web. ${scope} (Nivel ${level.label}.)`, `PEDIDO DEL USUARIO:\n${site.brief}`];
  for (const a of attachments) {
    const label = a.kind === 'zip' ? 'PÁGINA DE REFERENCIA (contenido de un zip, solo como guía de diseño y estructura; no copies sus imágenes ni enlaces)' : a.kind === 'datos' ? 'DATOS DEL NEGOCIO (úsalos tal cual; no inventes otros)' : 'TEXTO ADJUNTO';
    parts.push(`${label} — ${a.name}:\n<adjunto>\n${a.text}\n</adjunto>`);
  }
  if (templateText) parts.push(templateText);
  if (images.length) {
    parts.push(`FOTOS DEL CLIENTE: van ${images.length} imagen(es) adjuntas, numeradas en orden (IMG_1 a IMG_${images.length}). Úsalas como referencia de estilo y, si sirven para la web (fotos del negocio, de su trabajo o su logo), colócalas con {{IMG_n}}.`);
  }
  const text = parts.join('\n\n');
  if (!images.length) return text;
  const blocks: any[] = [];
  images.forEach((dataUrl, i) => {
    const m = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
    if (!m) return;
    blocks.push({ type: 'text', text: `IMG_${i + 1}:` });
    blocks.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } });
  });
  blocks.push({ type: 'text', text });
  return blocks;
}

// ---------------------------------------------------------------- trabajos en segundo plano
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Pausa antes de reintentar (en las pruebas se pone en 0). */
export const retryDelay = { ms: 6000 };

async function runGeneration(site: Site, io: WorkspaceIO, unlimited: boolean, call: typeof claudeStream = claudeStream) {
  const level = LEVELS[site.level || 'completa'];
  try {
    const images = await siteImages(site);
    const tpl = site.templateId ? await getTemplate(site.templateId) : null;
    const request = buildRequest(site, site.input?.attachments || [], images, tpl ? templateBrief(tpl) : '');
    const first = site.sample ? 10000 : level.firstTokens;
    const max = site.sample ? 14000 : level.maxTokens;
    let out: Awaited<ReturnType<typeof generateLong>> | null = null;
    let parsed: { title: string; html: string } | null = null;
    // Hasta 2 intentos: el segundo solo si la falla fue pasajera (servicio ocupado, red) o la
    // respuesta llegó sin una web completa.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        out = await generateLong(SYSTEM, request, first, max, call);
        recordAiSpend(out.costUsd, `web-generar-${site.sample ? 'muestra' : site.level} ${site.id} intento ${attempt}`);
        site.costUsd += out.costUsd;
        await addCreditSpend(site.ownerId, unlimited, out.costUsd);
        if (site.sample) {
          const a = await anonState();
          a.spentUsd += out.costUsd;
          saveAnon();
        }
        parsed = extractSite(out.text);
        if (parsed) break;
        if (out.stopReason === 'max_tokens') throw new KnownAiError('larga', `Se usó el máximo del nivel ${level.label}.`);
        throw new KnownAiError('formato', 'La respuesta no traía una web completa.');
      } catch (err) {
        const info = classifyAiError(err);
        console.error(`[sites] Error al generar (intento ${attempt}, ${info.code}):`, (err as Error).message);
        if (attempt === 2 || !info.transient) throw err;
        await wait(retryDelay.ms);
      }
    }
    if (!parsed) throw new KnownAiError('formato', 'La respuesta no traía una web completa.');
    site.title = parsed.title;
    site.html = parsed.html;
    site.status = 'ready';
    site.error = undefined;
    site.errorCode = undefined;
    site.adminError = undefined;
    site.adminAction = undefined;
    noteAiSuccess();
  } catch (err) {
    const info = classifyAiError(err);
    console.error('[sites] Error al generar:', info.code, (err as Error).message);
    noteAiFailure(info);
    site.status = 'error';
    site.error = info.userMessage;
    site.errorCode = info.code;
    site.adminError = info.adminMessage;
    site.adminAction = info.adminAction;
    if (!site.sample) {
      await refundCredits(site.ownerId, unlimited, site.level || 'completa');
      const u = await usageFor(site.ownerId);
      u.gen = Math.max(0, u.gen - 1);
      saveUsage();
    }
  }
  saveSite(site, io);
}

async function runEdit(site: Site, instruction: string, io: WorkspaceIO, unlimited: boolean) {
  const before = site.html;
  try {
    const { input, costUsd } = await claudeEdits(before, instruction);
    recordAiSpend(costUsd, `web-cambio ${site.id}`);
    site.costUsd += costUsd;
    await addCreditSpend(site.ownerId, unlimited, costUsd);
    let next = input?.cambios?.length ? applyEdits(before, input.cambios) : null;
    let summary = input?.resumen || 'Cambio aplicado.';
    if (!next) {
      // Los reemplazos no encajaron: se pide el archivo completo con el cambio.
      const full = await generateLong(SYSTEM, `ARCHIVO ACTUAL:\n<html_file>\n${before}\n</html_file>\n\nAplica este cambio y devuelve el archivo completo: ${instruction}`, 24000, 40000);
      recordAiSpend(full.costUsd, `web-cambio-completo ${site.id}`);
      site.costUsd += full.costUsd;
      await addCreditSpend(site.ownerId, unlimited, full.costUsd);
      const parsed = extractSite(full.text);
      if (!parsed) throw new Error('El cambio no devolvió una web completa.');
      next = parsed.html;
      summary = input?.resumen || 'Cambio aplicado.';
    }
    site.previousHtml = before;
    site.html = next;
    site.changes = [{ instruction, summary, at: new Date().toISOString() }, ...site.changes].slice(0, 30);
    site.status = 'ready';
    site.error = undefined;
    site.errorCode = undefined;
    site.adminError = undefined;
    site.adminAction = undefined;
    noteAiSuccess();
  } catch (err) {
    const info = classifyAiError(err);
    console.error('[sites] Error al editar:', info.code, (err as Error).message);
    noteAiFailure(info);
    site.status = 'ready';
    site.error =
      info.code === 'desconocido' || info.code === 'formato'
        ? 'No pude aplicar ese cambio. Tu web quedó como estaba; intenta describirlo de otra forma.'
        : `${info.userMessage.replace('no se descontó tu cupo', 'tu web quedó como estaba')}`;
    site.errorCode = info.code;
    site.adminError = info.adminMessage;
    site.adminAction = info.adminAction;
    const u = await usageFor(site.ownerId);
    u.edit = Math.max(0, u.edit - 1);
    saveUsage();
  }
  saveSite(site, io);
}

// ---------------------------------------------------------------- rutas
function adminUids(): string[] {
  return String(process.env.ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function publicView(site: Site, admin = false) {
  const images = site.html ? await siteImages(site) : [];
  return {
    id: site.id,
    title: site.title,
    brief: site.brief,
    status: site.status,
    error: site.error,
    errorCode: site.errorCode,
    // El motivo exacto y la acción (p. ej. "Agregar saldo") solo para administradores.
    adminError: admin ? site.adminError : undefined,
    adminAction: admin ? site.adminAction : undefined,
    level: site.level || 'completa',
    templateId: site.templateId,
    canRetry: site.status === 'error' && (admin || (site.errorCode !== 'saldo' && site.errorCode !== 'limite' && site.errorCode !== 'clave')),
    changes: site.changes,
    paid: site.paid,
    sample: Boolean(site.sample),
    canUndo: Boolean(site.previousHtml),
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
    previewHtml: site.html ? withWatermark(fillImages(site.html, images)) : '',
  };
}

const MAX_IMAGES = 5;
const MAX_IMAGE_CHARS = 1_400_000; // ~1 MB por foto (el navegador ya la reduce)
const MAX_ATTACH_CHARS = 60_000; // por adjunto
const MAX_ATTACH_TOTAL = 120_000; // todos los adjuntos juntos

/** Revisa y limpia lo que manda el navegador. Exportado para las pruebas. */
export function parseInputs(body: any): { attachments: SiteAttachment[]; images: string[]; error?: string } {
  const attachments: SiteAttachment[] = [];
  let total = 0;
  for (const a of Array.isArray(body?.attachments) ? body.attachments.slice(0, 8) : []) {
    const kind = a?.kind === 'zip' || a?.kind === 'datos' ? a.kind : 'texto';
    const text = String(a?.text || '').slice(0, MAX_ATTACH_CHARS);
    if (!text.trim()) continue;
    total += text.length;
    if (total > MAX_ATTACH_TOTAL) return { attachments, images: [], error: 'Los adjuntos son demasiado largos. Quita alguno o acórtalo.' };
    attachments.push({ kind, name: String(a?.name || 'Adjunto').slice(0, 80), text });
  }
  const images: string[] = [];
  for (const img of Array.isArray(body?.images) ? body.images : []) {
    const data = String(img?.dataUrl || '');
    if (!/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(data)) return { attachments, images, error: 'Una de las imágenes no es válida (usa JPG, PNG o WEBP).' };
    if (data.length > MAX_IMAGE_CHARS) return { attachments, images, error: 'Una de las imágenes es muy pesada.' };
    images.push(data);
  }
  if (images.length > MAX_IMAGES) return { attachments, images, error: `Puedes adjuntar hasta ${MAX_IMAGES} imágenes.` };
  return { attachments, images };
}

export function registerSiteRoutes(app: Express, io: WorkspaceIO) {
  // Con sesión: el UID verificado. Sin sesión: el espacio anónimo del navegador (anon_xxxx).
  const ownerOf = (req: Request) => req.auth?.workspaceId || '';
  const isGuest = (req: Request) => !req.auth?.verified;
  const isAdminReq = (req: Request) => Boolean(req.auth?.verified && req.auth.uid && adminUids().includes(req.auth.uid));
  const needAccount = (res: Response) =>
    res.status(401).json({ error: 'Regístrate para seguir editando o descargar tu web.', authRequired: true });

  app.get('/api/studio/sites', async (req: Request, res: Response) => {
    const uid = ownerOf(req);
    const ws = io.read(uid);
    const sites = Array.isArray(ws.sites) ? ws.sites : [];
    const guest = isGuest(req);
    const u = await usageFor(uid);
    const admin = isAdminReq(req);
    res.json({
      sites,
      guest,
      admin,
      limits: guest
        ? { generationsLeft: sites.length ? 0 : 1, editsLeft: 0 }
        : { generationsLeft: Math.max(0, DAILY_GENERATIONS - u.gen), editsLeft: Math.max(0, DAILY_EDITS - u.edit) },
      credits: guest ? null : await creditStatus(uid, admin),
      levels: Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [k, { credits: v.credits, label: v.label }])),
      aiReady: Boolean(process.env.ANTHROPIC_API_KEY),
    });
  });

  // Al registrarse, la maqueta hecha como visitante pasa a su cuenta.
  app.post('/api/studio/sites/claim', async (req: Request, res: Response) => {
    if (isGuest(req)) return needAccount(res);
    const uid = ownerOf(req);
    const anonId = String(req.body?.anonId || '');
    if (!ANON_ID.test(anonId)) return res.status(400).json({ error: 'Identificador no válido.' });
    const guestWs = io.read(anonId);
    const entries: any[] = Array.isArray(guestWs.sites) ? guestWs.sites : [];
    // El navegador también envía los ids de sus maquetas, por si el servidor se reinició y
    // perdió el índice del visitante (cada una se comprueba: debe pertenecer a ese anon_xxxx).
    const ids = new Set<string>(entries.map((e) => String(e.id)));
    for (const id of Array.isArray(req.body?.siteIds) ? req.body.siteIds.slice(0, 5) : []) ids.add(String(id));
    let moved = 0;
    for (const id of ids) {
      const site = await loadSite(id);
      if (site && site.ownerId === anonId) {
        site.ownerId = uid;
        saveSite(site, io);
        moved += 1;
      }
    }
    guestWs.sites = [];
    io.write(guestWs, anonId);
    res.json({ moved });
  });

  app.post('/api/studio/sites', async (req: Request, res: Response) => {
    const uid = ownerOf(req);
    const brief = String(req.body?.brief || '').trim().slice(0, 4000);
    const inputs = parseInputs(req.body);
    if (inputs.error) return res.status(400).json({ error: inputs.error });
    if (brief.length < 15 && !inputs.attachments.length) return res.status(400).json({ error: 'Cuéntame un poco más de tu web (qué negocio es y qué quieres mostrar).' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'El creador de webs aún no tiene conectada la IA. Vuelve a intentarlo pronto.' });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Hoy se alcanzó el límite de uso de IA de la plataforma. Vuelve mañana.' });
    const guest = isGuest(req);
    const admin = isAdminReq(req);
    // Los visitantes sin registro solo hacen la muestra (nivel básica).
    const level: SiteLevel = guest ? 'basica' : parseLevel(req.body?.level);
    const templateId = String(req.body?.templateId || '');
    if (templateId && !(await getTemplate(templateId))) return res.status(400).json({ error: 'Esa plantilla ya no está disponible. Elige otra.' });
    if (guest) {
      const ws = io.read(uid);
      if (Array.isArray(ws.sites) && ws.sites.length > 0) {
        return res.status(403).json({ error: 'Ya creaste tu maqueta gratis. Agenda una llamada o regístrate para seguir.', guestLimit: true });
      }
      const a = await anonState();
      const ip = String(req.ip || 'sin-ip');
      if ((a.perIp[ip] || 0) >= ANON_PER_IP_DAILY || a.spentUsd >= ANON_DAILY_BUDGET_USD) {
        return res.status(429).json({ error: 'Hoy ya no quedan maquetas gratis. Regístrate o vuelve mañana.', guestLimit: true });
      }
      a.perIp[ip] = (a.perIp[ip] || 0) + 1;
      saveAnon();
    } else {
      const reason = await upgradeReason(uid, admin, level);
      if (reason) return res.status(402).json({ error: reason, upgradeRequired: true });
      const u = await usageFor(uid);
      if (u.gen >= DAILY_GENERATIONS && !admin) return res.status(429).json({ error: `Ya creaste ${DAILY_GENERATIONS} webs hoy. Puedes seguir ajustando las que tienes o volver mañana.` });
      u.gen += 1;
      saveUsage();
      await chargeCredits(uid, admin, level);
    }

    const now = new Date().toISOString();
    const id = `site_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    const imageIds = inputs.images.map((dataUrl, i) => {
      const assetId = `${id}_img${i + 1}`;
      saveAsset(assetId, dataUrl, uid);
      return assetId;
    });
    const site: Site = {
      id,
      ownerId: uid,
      title: 'Nueva web',
      brief: brief || inputs.attachments[0]?.name || 'Web',
      status: 'generating',
      html: '',
      changes: [],
      paid: false,
      sample: guest,
      level,
      templateId: templateId || undefined,
      input: { attachments: inputs.attachments, imageIds },
      costUsd: 0,
      createdAt: now,
      updatedAt: now,
    };
    saveSite(site, io);
    void runGeneration(site, io, admin);
    res.json({ site: await publicView(site, admin) });
  });

  // Reintentar una web que falló, con lo mismo que se pidió (sin volver a subir nada).
  app.post('/api/studio/sites/:id/retry', async (req: Request, res: Response) => {
    const uid = ownerOf(req);
    const admin = isAdminReq(req);
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== uid) return res.status(404).json({ error: 'No encontré esa web.' });
    if (site.status !== 'error') return res.status(409).json({ error: 'Esta web no necesita reintentarse.' });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Hoy se alcanzó el límite de uso de IA de la plataforma. Vuelve mañana.' });
    const level = req.body?.level ? parseLevel(req.body.level) : site.level || 'completa';
    if (site.sample) {
      const a = await anonState();
      if (a.spentUsd >= ANON_DAILY_BUDGET_USD) return res.status(429).json({ error: 'Hoy ya no quedan maquetas gratis. Regístrate o vuelve mañana.', guestLimit: true });
    } else {
      const reason = await upgradeReason(uid, admin, level);
      if (reason) return res.status(402).json({ error: reason, upgradeRequired: true });
      const u = await usageFor(uid);
      u.gen += 1;
      saveUsage();
      await chargeCredits(uid, admin, level);
      site.level = level;
    }
    site.status = 'generating';
    site.error = undefined;
    site.errorCode = undefined;
    site.adminError = undefined;
    site.adminAction = undefined;
    saveSite(site, io);
    void runGeneration(site, io, admin);
    res.json({ site: await publicView(site, admin) });
  });

  app.get('/api/studio/sites/:id', async (req: Request, res: Response) => {
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== ownerOf(req)) return res.status(404).json({ error: 'No encontré esa web.' });
    res.json({ site: await publicView(site, isAdminReq(req)) });
  });

  app.post('/api/studio/sites/:id/edit', async (req: Request, res: Response) => {
    if (isGuest(req)) return needAccount(res);
    const uid = ownerOf(req);
    const admin = isAdminReq(req);
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== uid) return res.status(404).json({ error: 'No encontré esa web.' });
    if (site.status !== 'ready' || !site.html) return res.status(409).json({ error: 'Espera a que termine el paso anterior.' });
    const instruction = String(req.body?.instruction || '').trim().slice(0, 1500);
    if (instruction.length < 4) return res.status(400).json({ error: 'Describe el cambio que quieres.' });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Hoy se alcanzó el límite de uso de IA de la plataforma. Vuelve mañana.' });
    const credits = await creditStatus(uid, admin);
    if (!credits.unlimited && (credits.expired || credits.overBudget)) {
      return res.status(402).json({ error: credits.expired ? 'Terminaron tus 7 días de prueba. Mejora tu plan para seguir haciendo cambios.' : 'Usaste todo lo incluido en tu prueba. Mejora tu plan para seguir haciendo cambios.', upgradeRequired: true });
    }
    const u = await usageFor(uid);
    if (u.edit >= DAILY_EDITS && !admin) return res.status(429).json({ error: `Llegaste a ${DAILY_EDITS} cambios hoy. Vuelve mañana para seguir.` });
    u.edit += 1;
    saveUsage();
    site.status = 'editing';
    site.error = undefined;
    saveSite(site, io);
    void runEdit(site, instruction, io, admin);
    res.json({ site: await publicView(site, admin) });
  });

  app.post('/api/studio/sites/:id/undo', async (req: Request, res: Response) => {
    if (isGuest(req)) return needAccount(res);
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== ownerOf(req)) return res.status(404).json({ error: 'No encontré esa web.' });
    if (site.status !== 'ready' || !site.previousHtml) return res.status(409).json({ error: 'No hay un cambio para deshacer.' });
    site.html = site.previousHtml;
    site.previousHtml = undefined;
    site.changes = [{ instruction: 'Deshacer', summary: 'Volví a la versión anterior.', at: new Date().toISOString() }, ...site.changes];
    saveSite(site, io);
    res.json({ site: await publicView(site, isAdminReq(req)) });
  });

  app.get('/api/studio/sites/:id/download', async (req: Request, res: Response) => {
    if (isGuest(req)) return needAccount(res);
    const uid = ownerOf(req);
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== uid) return res.status(404).json({ error: 'No encontré esa web.' });
    if (!site.html) return res.status(409).json({ error: 'La web aún no está lista.' });
    // Hasta conectar los pagos, solo descargan los administradores (para probar).
    if (!site.paid && !adminUids().includes(uid)) {
      return res.status(402).json({ error: 'La descarga desde 27 USD estará disponible muy pronto.', paymentRequired: true });
    }
    const name = site.title.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mi-web';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.html"`);
    res.send(fillImages(site.html, await siteImages(site)));
  });
}
