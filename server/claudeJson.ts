// Claude para las funciones de la app que piden una respuesta en JSON (cliente ideal, mensajes,
// constructor guiado, Super Agent, búsqueda de prospectos).
//
// Esas rutas se escribieron para Gemini (`ai.models.generateContent({ contents, config })`).
// Este adaptador ofrece la misma forma pero llama a Claude Haiku y obliga a que la respuesta
// siga el esquema pedido (con una herramienta "respond"). Así las rutas no cambian y todo el
// gasto entra en el mismo tope diario de Daniel.
import { aiBudgetAvailable, recordAiSpend, priceFor, CLAUDE_WEB_SEARCH_USD } from './daniel.ts';

const MODEL = 'claude-haiku-5-5';

// Gemini describe los tipos con mayúsculas (OBJECT, STRING...); JSON Schema usa minúsculas.
function toJsonSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return { type: 'object' };
  const out: any = {};
  if (schema.type) out.type = String(schema.type).toLowerCase();
  if (schema.description) out.description = schema.description;
  if (Array.isArray(schema.enum)) out.enum = schema.enum;
  if (schema.properties) {
    out.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([k, v]) => [k, toJsonSchema(v)]),
    );
  }
  if (Array.isArray(schema.required)) out.required = schema.required;
  if (schema.items) out.items = toJsonSchema(schema.items);
  return out;
}

interface GenerateArgs {
  model?: string;
  contents: string;
  config?: { responseSchema?: any; tools?: any[]; systemInstruction?: string; [k: string]: any };
}

async function generateContent({ contents, config }: GenerateArgs): Promise<{ text: string; candidates?: any[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Sin ANTHROPIC_API_KEY');
  if (!(await aiBudgetAvailable())) throw new Error('Tope diario de IA alcanzado');

  const wantsSearch = Array.isArray(config?.tools) && config!.tools.some((t) => t && 'googleSearch' in t);
  const schema = toJsonSchema(config?.responseSchema || { type: 'OBJECT' });
  if (schema.type !== 'object') schema.type = 'object';

  const tools: any[] = [
    { name: 'respond', description: 'Entrega la respuesta final con exactamente esta estructura.', input_schema: schema },
  ];
  if (wantsSearch) tools.unshift({ type: 'web_search_20250305', name: 'web_search', max_uses: 5 });

  const system = [
    'Respondes en español, de forma concreta y útil para un pequeño negocio.',
    'No inventes cifras, nombres, correos ni resultados. Si un dato no se conoce, déjalo vacío o dilo.',
    wantsSearch
      ? 'Usa la búsqueda web para verificar. Solo incluye un correo si aparece publicado en la fuente; si no, déjalo vacío. Al terminar, llama a la herramienta "respond".'
      : 'Entrega la respuesta llamando a la herramienta "respond".',
    config?.systemInstruction || '',
  ]
    .filter(Boolean)
    .join('\n');

  let convo: any[] = [{ role: 'user', content: contents }];
  let inputTokens = 0;
  let outputTokens = 0;
  let searches = 0;
  let answer: any = null;
  const foundUrls = new Set<string>();
  let forceRespond = !wantsSearch;

  for (let round = 0; round < 3 && !answer; round++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system,
        messages: convo,
        tools,
        // Sin búsqueda se obliga a usar "respond"; con búsqueda primero tiene que poder buscar.
        tool_choice: forceRespond ? { type: 'tool', name: 'respond' } : { type: 'auto' },
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

    for (const b of data.content || []) {
      if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
        for (const r of b.content) if (typeof r?.url === 'string') foundUrls.add(r.url);
      }
    }
    const call = (data.content || []).find((b: any) => b.type === 'tool_use' && b.name === 'respond');
    if (call) {
      answer = call.input;
      break;
    }
    if (data.stop_reason === 'pause_turn') {
      convo = [...convo, { role: 'assistant', content: data.content }];
      continue;
    }
    // Terminó sin llamar a "respond": se le pide la respuesta final, ahora obligatoria.
    convo = [
      ...convo,
      { role: 'assistant', content: data.content },
      { role: 'user', content: 'Entrega ya la respuesta final con la herramienta "respond".' },
    ];
    tools.splice(0, tools.length, tools[tools.length - 1]);
    forceRespond = true;
  }

  recordAiSpend(priceFor(MODEL, inputTokens, outputTokens) + searches * CLAUDE_WEB_SEARCH_USD, `json${wantsSearch ? '+web' : ''}`);
  if (!answer) throw new Error('Claude no devolvió la respuesta estructurada');
  // Mismo formato que las "fuentes" de Gemini, para que las rutas existentes las lean igual.
  const groundingChunks = Array.from(foundUrls).map((uri) => ({ web: { uri } }));
  return { text: JSON.stringify(answer), candidates: [{ groundingMetadata: { groundingChunks } }] };
}

/** Cliente con la misma forma que el de Gemini, respaldado por Claude. */
export const claudeJsonClient = { models: { generateContent } };
