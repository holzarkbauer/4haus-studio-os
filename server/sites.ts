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

const MODEL = 'claude-sonnet-5-5';
// Solo para pruebas locales con un servidor simulado; en producción queda vacío.
const API_URL = `${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`;
const COLLECTION = 'serverSites';
const SITES_DIR = path.resolve(process.cwd(), 'data', 'sites');
const DAILY_GENERATIONS = Number(process.env.SITES_DAILY_GENERATIONS || 3);
const DAILY_EDITS = Number(process.env.SITES_DAILY_EDITS || 20);
const MAX_SITES_PER_USER = 20;

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
  costUsd: number;
  createdAt: string;
  updatedAt: string;
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

PORTADA 3D
- La portada tiene un objeto 3D protagonista hecho con three.js, cargado así:
  <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"}}</script>
- El objeto se crea con geometrías de three.js (no cargues modelos ni texturas externas) y reacciona al scroll (gira, se acerca o se desarma) con el scroll nativo de la página.
- Respeta prefers-reduced-motion. Si WebGL no está disponible, muestra un degradado elegante en su lugar.
- No uses GSAP ni otras librerías de animación de pago; usa JavaScript propio, IntersectionObserver y CSS.

CONTENIDO
- Escribe en el idioma del pedido (español por defecto), con textos reales y persuasivos para ese negocio.
- No inventes testimonios, cifras, premios, clientes ni datos de contacto. Donde hagan falta, deja marcadores visibles como [Testimonio real de un cliente] o [Tu teléfono].
- No uses imágenes externas: usa formas, degradados y SVG propios.
- Los formularios muestran un mensaje de "gracias" al enviarse (sin servidor) y llevan un comentario indicando dónde conectarlos.

CALIDAD
- HTML semántico y accesible (contraste suficiente, textos alternativos, foco visible).
- Código ordenado y comentado brevemente en español, que cargue rápido.`;

async function claudeStream(system: string, userText: string, maxTokens: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Falta la clave de Claude en el servidor.');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, stream: true, messages: [{ role: 'user', content: userText }] }),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Claude API ${res.status}: ${detail.slice(0, 300)}`);
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
      } else if (ev.type === 'error') throw new Error(`Claude: ${ev.error?.message || 'error'}`);
    }
  }
  return { text, costUsd: priceFor(MODEL, inTok, outTok), stopReason };
}

async function claudeEdits(html: string, instruction: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Falta la clave de Claude en el servidor.');
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
    throw new Error(`Claude API ${res.status}: ${detail.slice(0, 300)}`);
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

// ---------------------------------------------------------------- trabajos en segundo plano
async function runGeneration(site: Site, io: WorkspaceIO) {
  try {
    const out = await claudeStream(SYSTEM, `Crea esta web:\n${site.brief}`, 20000);
    recordAiSpend(out.costUsd, `web-generar ${site.id}`);
    site.costUsd += out.costUsd;
    const parsed = extractSite(out.text);
    if (!parsed) throw new Error(out.stopReason === 'max_tokens' ? 'La web salió demasiado larga y quedó incompleta.' : 'La respuesta no trajo una web completa.');
    site.title = parsed.title;
    site.html = parsed.html;
    site.status = 'ready';
    site.error = undefined;
  } catch (err) {
    console.error('[sites] Error al generar:', (err as Error).message);
    site.status = 'error';
    site.error = 'No pude terminar tu web esta vez. Inténtalo de nuevo; no se descontó tu cupo.';
    const u = await usageFor(site.ownerId);
    u.gen = Math.max(0, u.gen - 1);
    saveUsage();
  }
  saveSite(site, io);
}

async function runEdit(site: Site, instruction: string, io: WorkspaceIO) {
  const before = site.html;
  try {
    const { input, costUsd } = await claudeEdits(before, instruction);
    recordAiSpend(costUsd, `web-cambio ${site.id}`);
    site.costUsd += costUsd;
    let next = input?.cambios?.length ? applyEdits(before, input.cambios) : null;
    let summary = input?.resumen || 'Cambio aplicado.';
    if (!next) {
      // Los reemplazos no encajaron: se pide el archivo completo con el cambio.
      const full = await claudeStream(SYSTEM, `ARCHIVO ACTUAL:\n<html_file>\n${before}\n</html_file>\n\nAplica este cambio y devuelve el archivo completo: ${instruction}`, 20000);
      recordAiSpend(full.costUsd, `web-cambio-completo ${site.id}`);
      site.costUsd += full.costUsd;
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
  } catch (err) {
    console.error('[sites] Error al editar:', (err as Error).message);
    site.status = 'ready';
    site.error = 'No pude aplicar ese cambio. Tu web quedó como estaba; intenta describirlo de otra forma.';
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

function publicView(site: Site) {
  return {
    id: site.id,
    title: site.title,
    brief: site.brief,
    status: site.status,
    error: site.error,
    changes: site.changes,
    paid: site.paid,
    canUndo: Boolean(site.previousHtml),
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
    previewHtml: site.html ? withWatermark(site.html) : '',
  };
}

export function registerSiteRoutes(app: Express, io: WorkspaceIO) {
  // Todas estas rutas exigen sesión verificada (ver server/auth.ts).
  const ownerOf = (req: Request) => req.auth?.uid || '';

  app.get('/api/studio/sites', async (req: Request, res: Response) => {
    const uid = ownerOf(req);
    const ws = io.read(uid);
    const u = await usageFor(uid);
    res.json({
      sites: Array.isArray(ws.sites) ? ws.sites : [],
      limits: { generationsLeft: Math.max(0, DAILY_GENERATIONS - u.gen), editsLeft: Math.max(0, DAILY_EDITS - u.edit) },
      aiReady: Boolean(process.env.ANTHROPIC_API_KEY),
    });
  });

  app.post('/api/studio/sites', async (req: Request, res: Response) => {
    const uid = ownerOf(req);
    const brief = String(req.body?.brief || '').trim().slice(0, 4000);
    if (brief.length < 15) return res.status(400).json({ error: 'Cuéntame un poco más de tu web (qué negocio es y qué quieres mostrar).' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'El creador de webs aún no tiene conectada la IA. Vuelve a intentarlo pronto.' });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Hoy se alcanzó el límite de uso de IA de la plataforma. Vuelve mañana.' });
    const u = await usageFor(uid);
    if (u.gen >= DAILY_GENERATIONS) return res.status(429).json({ error: `Ya creaste ${DAILY_GENERATIONS} webs hoy. Puedes seguir ajustando las que tienes o volver mañana.` });
    u.gen += 1;
    saveUsage();

    const now = new Date().toISOString();
    const site: Site = {
      id: `site_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      ownerId: uid,
      title: 'Nueva web',
      brief,
      status: 'generating',
      html: '',
      changes: [],
      paid: false,
      costUsd: 0,
      createdAt: now,
      updatedAt: now,
    };
    saveSite(site, io);
    void runGeneration(site, io);
    res.json({ site: publicView(site) });
  });

  app.get('/api/studio/sites/:id', async (req: Request, res: Response) => {
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== ownerOf(req)) return res.status(404).json({ error: 'No encontré esa web.' });
    res.json({ site: publicView(site) });
  });

  app.post('/api/studio/sites/:id/edit', async (req: Request, res: Response) => {
    const uid = ownerOf(req);
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== uid) return res.status(404).json({ error: 'No encontré esa web.' });
    if (site.status !== 'ready' || !site.html) return res.status(409).json({ error: 'Espera a que termine el paso anterior.' });
    const instruction = String(req.body?.instruction || '').trim().slice(0, 1500);
    if (instruction.length < 4) return res.status(400).json({ error: 'Describe el cambio que quieres.' });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Hoy se alcanzó el límite de uso de IA de la plataforma. Vuelve mañana.' });
    const u = await usageFor(uid);
    if (u.edit >= DAILY_EDITS) return res.status(429).json({ error: `Llegaste a ${DAILY_EDITS} cambios hoy. Vuelve mañana para seguir.` });
    u.edit += 1;
    saveUsage();
    site.status = 'editing';
    site.error = undefined;
    saveSite(site, io);
    void runEdit(site, instruction, io);
    res.json({ site: publicView(site) });
  });

  app.post('/api/studio/sites/:id/undo', async (req: Request, res: Response) => {
    const site = await loadSite(String(req.params.id));
    if (!site || site.ownerId !== ownerOf(req)) return res.status(404).json({ error: 'No encontré esa web.' });
    if (site.status !== 'ready' || !site.previousHtml) return res.status(409).json({ error: 'No hay un cambio para deshacer.' });
    site.html = site.previousHtml;
    site.previousHtml = undefined;
    site.changes = [{ instruction: 'Deshacer', summary: 'Volví a la versión anterior.', at: new Date().toISOString() }, ...site.changes];
    saveSite(site, io);
    res.json({ site: publicView(site) });
  });

  app.get('/api/studio/sites/:id/download', async (req: Request, res: Response) => {
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
    res.send(site.html);
  });
}
