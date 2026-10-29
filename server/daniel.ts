import type { Express, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { loadServerDoc, saveServerDoc } from './storage.ts';

// ============================================================================
// DANIEL · asistente de 4haus Studio
// Responde con un resumen corto + "entregables" (documentos en Markdown) que la
// app muestra en un panel a la derecha, al estilo de Claude.
//
// Proveedor: Claude (si hay ANTHROPIC_API_KEY) → Gemini (si hay GEMINI_API_KEY)
// → ninguno (respuesta honesta, sin inventar nada).
//
// Control de gasto: tope diario global en USD (DANIEL_DAILY_BUDGET_USD, por
// defecto 5) y límites diarios por espacio de trabajo. Los contadores viven en
// memoria y se reinician con el servidor; es una primera barrera, no la única.
// ============================================================================

type Mode = 'normal' | 'research';

interface Deliverable {
  id: string;
  title: string;
  kind: string;
  content: string;
}

interface Source {
  url: string;
  title: string;
}

interface DanielResult {
  reply: string;
  deliverables: Deliverable[];
  sources: Source[];
  provider: 'claude' | 'gemini' | 'none';
  model?: string;
  costUsd: number;
}

// Precios por millón de tokens (USD). Fuente: páginas oficiales de precios de
// Anthropic y de la API de Gemini, consultadas el 28-29/10/2026.
const PRICES: Record<string, { input: number; output: number }> = {
  'claude-haiku-5-5': { input: 0.1, output: 0.5 },
  'claude-sonnet-5-5': { input: 2, output: 10 },
  'gemini-3.8-flash': { input: 0.75, output: 3.75 },
};
const CLAUDE_WEB_SEARCH_USD = 10 / 1000;
const GEMINI_SEARCH_USD = 14 / 1000; // tras las búsquedas gratuitas del mes; se cuenta igual por prudencia

const DAILY_BUDGET_USD = Number(process.env.DANIEL_DAILY_BUDGET_USD || 5);
const PER_WORKSPACE_DAILY_REQUESTS = Number(process.env.DANIEL_DAILY_REQUESTS || 40);
const PER_WORKSPACE_DAILY_RESEARCH = Number(process.env.DANIEL_DAILY_RESEARCH || 5);

const usage = {
  day: new Date().toISOString().slice(0, 10),
  spentUsd: 0,
  perWorkspace: new Map<string, { requests: number; research: number }>(),
};

// El gasto del día también se guarda en Firestore: si Render duerme y reinicia el servidor,
// el contador no vuelve a cero (si no, el tope diario se podría saltar).
let loadedDay = '';
async function ensureUsageLoaded() {
  resetIfNewDay();
  if (loadedDay === usage.day) return;
  const saved = await loadServerDoc<{ spentUsd?: number; perWorkspace?: Record<string, { requests: number; research: number }> }>(
    `danielUsage-${usage.day}`,
  );
  if (saved) {
    usage.spentUsd = Math.max(usage.spentUsd, Number(saved.spentUsd) || 0);
    for (const [id, v] of Object.entries(saved.perWorkspace || {})) {
      const cur = usage.perWorkspace.get(id) || { requests: 0, research: 0 };
      usage.perWorkspace.set(id, {
        requests: Math.max(cur.requests, v.requests || 0),
        research: Math.max(cur.research, v.research || 0),
      });
    }
  }
  loadedDay = usage.day;
}

function saveUsage() {
  saveServerDoc(`danielUsage-${usage.day}`, {
    spentUsd: usage.spentUsd,
    perWorkspace: Object.fromEntries(usage.perWorkspace),
    updatedAt: new Date().toISOString(),
  });
}

function resetIfNewDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (usage.day !== today) {
    usage.day = today;
    usage.spentUsd = 0;
    usage.perWorkspace.clear();
  }
}

function priceFor(model: string, inputTokens: number, outputTokens: number) {
  const p = PRICES[model];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

const SECTION_NAMES: Record<string, string> = {
  inicio: 'Inicio (el usuario describe lo que quiere crear)',
  'growth-os': 'Captar clientes (negocio, cliente ideal, prospectos y primer mensaje)',
  websites: 'Plantillas de páginas web',
  voz: 'Voz personalizada',
  aprende: 'Aprende (tutoriales y guías)',
  'ai-agents': 'Agentes de IA',
  store: 'Store',
};

function buildSystemPrompt(mode: Mode, section: string, businessProfile: any) {
  const business = businessProfile?.savedBy === 'guided-flow' || businessProfile?.businessName
    ? `Negocio del usuario (puede estar incompleto): nombre "${businessProfile?.businessName || ''}", vende "${businessProfile?.productType || ''}", a "${businessProfile?.targetAudience || ''}", en "${businessProfile?.targetLocation || ''}".`
    : 'Todavía no conoces el negocio del usuario.';

  return `Eres Daniel, el asistente de 4haus Studio, una plataforma donde personas sin conocimientos técnicos crean páginas web, captan clientes y venden servicios digitales.

Sección actual de la app: ${SECTION_NAMES[section] || section || 'desconocida'}.
${business}

Reglas:
- Responde en el idioma del usuario (por defecto, español).
- Sé breve en el chat: el RESUMEN tiene como máximo 3 frases. Todo el detalle va en los entregables.
- Nunca inventes cifras, clientes, testimonios, precios ni resultados. Si un dato no está confirmado, dilo o márcalo como supuesto.
- No digas que hiciste algo que no hiciste (no envías correos, no publicas webs, no cambias datos).
- Si te falta información esencial, haz como máximo 2 preguntas en el resumen y no generes entregables vacíos.
- Los entregables son documentos útiles y accionables en Markdown: títulos (##), listas, tablas simples. Sin emojis.
${mode === 'research'
  ? `- MODO INVESTIGACIÓN PROFUNDA: busca en la web antes de responder, contrasta varias fuentes y prioriza fuentes oficiales y recientes. El entregable principal es un informe detallado para un cliente exigente: conclusión al inicio, hallazgos con datos y fecha, comparativas en tablas, riesgos y recomendaciones. Cada dato que venga de la web debe poder rastrearse a una fuente. Termina el informe con una sección "## Fuentes" con enlaces Markdown.`
  : '- Entrega entre 1 y 3 documentos (por ejemplo: brief, plan paso a paso, textos para la web, mensaje para un cliente).'}

Formato de salida OBLIGATORIO (solo esto, sin texto fuera de las etiquetas):
<resumen>Resumen corto para el chat.</resumen>
<entregable titulo="Título claro" tipo="Brief | Plan | Textos | Mensaje | Informe | Checklist">
Contenido en Markdown.
</entregable>
(repite <entregable> para cada documento)`;
}

export function parseTagged(text: string): { reply: string; deliverables: Deliverable[] } {
  const replyMatch = text.match(/<resumen>([\s\S]*?)<\/resumen>/i);
  const deliverables: Deliverable[] = [];
  const re = /<entregable\s+titulo="([^"]*)"(?:\s+tipo="([^"]*)")?\s*>([\s\S]*?)<\/entregable>/gi;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    const content = m[3].trim();
    if (!content) continue;
    deliverables.push({
      id: `ent_${Date.now()}_${i++}`,
      title: m[1].trim() || 'Documento',
      kind: (m[2] || 'Documento').trim(),
      content,
    });
  }
  let reply = replyMatch ? replyMatch[1].trim() : '';
  if (!reply && deliverables.length === 0) {
    // El modelo no respetó el formato: se muestra como texto plano, recortado.
    reply = text.replace(/<[^>]+>/g, '').trim().slice(0, 1200);
  }
  return { reply, deliverables };
}

async function callClaude(apiKey: string, mode: Mode, system: string, messages: { role: string; content: string }[]) {
  const model = mode === 'research' ? 'claude-sonnet-5-5' : 'claude-haiku-5-5';
  const tools = mode === 'research' ? [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }] : undefined;

  let convo: any[] = messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  const textParts: string[] = [];
  const sources = new Map<string, Source>();
  let inputTokens = 0;
  let outputTokens = 0;
  let searches = 0;

  // Las búsquedas largas pueden devolver "pause_turn": se continúa hasta 3 veces.
  for (let round = 0; round < 3; round++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: mode === 'research' ? 8000 : 2500,
        system,
        messages: convo,
        ...(tools ? { tools } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Claude API ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data: any = await res.json();
    inputTokens += data.usage?.input_tokens || 0;
    outputTokens += data.usage?.output_tokens || 0;
    searches += data.usage?.server_tool_use?.web_search_requests || 0;

    for (const block of data.content || []) {
      if (block.type === 'text') {
        textParts.push(block.text || '');
        for (const c of block.citations || []) {
          if (c.url) sources.set(c.url, { url: c.url, title: c.title || c.url });
        }
      } else if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
        for (const r of block.content) {
          if (r.url && !sources.has(r.url)) sources.set(r.url, { url: r.url, title: r.title || r.url });
        }
      }
    }

    if (data.stop_reason !== 'pause_turn') break;
    convo = [...convo, { role: 'assistant', content: data.content }];
  }

  const costUsd = priceFor(model, inputTokens, outputTokens) + searches * CLAUDE_WEB_SEARCH_USD;
  return { text: textParts.join(''), sources: Array.from(sources.values()), model, costUsd };
}

async function callGemini(apiKey: string, mode: Mode, system: string, messages: { role: string; content: string }[]) {
  const model = 'gemini-3.8-flash';
  const ai = new GoogleGenAI({ apiKey });
  const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const response: any = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: system,
      ...(mode === 'research' ? { tools: [{ googleSearch: {} }] } : {}),
    },
  });
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: Source[] = chunks
    .map((c: any) => c?.web)
    .filter((w: any) => w?.uri)
    .map((w: any) => ({ url: w.uri, title: w.title || w.uri }));
  const searches = (response.candidates?.[0]?.groundingMetadata?.webSearchQueries || []).length;
  const inTok = response.usageMetadata?.promptTokenCount || 0;
  const outTok = (response.usageMetadata?.candidatesTokenCount || 0) + (response.usageMetadata?.thoughtsTokenCount || 0);
  const costUsd = priceFor(model, inTok, outTok) + searches * GEMINI_SEARCH_USD;
  return { text: response.text || '', sources, model, costUsd };
}

export function registerDanielRoutes(app: Express, readWorkspace: (userId?: string | null) => any) {
  app.post('/api/studio/daniel', async (req: Request, res: Response) => {
    await ensureUsageLoaded();
    const workspaceId = String(req.headers['x-user-id'] || 'default').slice(0, 128);
    const mode: Mode = req.body?.mode === 'research' ? 'research' : 'normal';
    const section = String(req.body?.section || 'inicio').slice(0, 60);
    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    // Solo los últimos 10 mensajes y con tamaño acotado, para controlar el costo.
    const messages = rawMessages
      .slice(-10)
      .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content || '').slice(0, 6000) }))
      .filter((m: any) => m.content.trim());

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Falta el mensaje del usuario.' });
    }

    // Límites
    const ws = usage.perWorkspace.get(workspaceId) || { requests: 0, research: 0 };
    if (ws.requests >= PER_WORKSPACE_DAILY_REQUESTS || (mode === 'research' && ws.research >= PER_WORKSPACE_DAILY_RESEARCH)) {
      return res.status(429).json({
        reply:
          mode === 'research'
            ? 'Llegaste al límite de investigaciones profundas de hoy. Vuelve mañana o usa el modo normal.'
            : 'Llegaste al límite de mensajes de hoy. Vuelve mañana.',
        deliverables: [],
        sources: [],
        provider: 'none',
        limited: true,
      });
    }
    if (usage.spentUsd >= DAILY_BUDGET_USD) {
      return res.status(429).json({
        reply: 'Daniel alcanzó el presupuesto diario de IA de la plataforma. Vuelve a intentarlo mañana.',
        deliverables: [],
        sources: [],
        provider: 'none',
        limited: true,
      });
    }

    const workspace = readWorkspace(workspaceId);
    const system = buildSystemPrompt(mode, section, workspace?.businessProfile);

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let result: DanielResult;
    try {
      if (anthropicKey) {
        const out = await callClaude(anthropicKey, mode, system, messages);
        result = { ...parseTagged(out.text), sources: out.sources, provider: 'claude', model: out.model, costUsd: out.costUsd };
      } else if (geminiKey) {
        const out = await callGemini(geminiKey, mode, system, messages);
        result = { ...parseTagged(out.text), sources: out.sources, provider: 'gemini', model: out.model, costUsd: out.costUsd };
      } else {
        result = {
          reply: 'Ahora mismo no tengo conexión con la IA, así que no puedo preparar entregables. Inténtalo de nuevo en unos minutos.',
          deliverables: [],
          sources: [],
          provider: 'none',
          costUsd: 0,
        };
      }
    } catch (err: any) {
      console.error('Daniel error:', err?.message);
      return res.status(502).json({
        reply: 'No pude completar la respuesta por un error con el servicio de IA. Inténtalo de nuevo.',
        deliverables: [],
        sources: [],
        provider: 'none',
      });
    }

    // Registrar consumo
    if (result.provider !== 'none') {
      usage.spentUsd += result.costUsd;
      ws.requests += 1;
      if (mode === 'research') ws.research += 1;
      usage.perWorkspace.set(workspaceId, ws);
      saveUsage();
      console.log(
        `[daniel] ${usage.day} ws=${workspaceId} mode=${mode} model=${result.model} costo=${result.costUsd.toFixed(4)} USD total_dia=${usage.spentUsd.toFixed(4)} USD`
      );
    }

    res.json({
      reply: result.reply,
      deliverables: result.deliverables,
      sources: result.sources,
      provider: result.provider,
      model: result.model,
      mode,
    });
  });
}
