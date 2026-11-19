// Errores de la IA explicados en palabras simples.
//
// Cada falla se clasifica en un motivo (saldo, límite de gasto, servicio ocupado, etc.).
// - El usuario ve un mensaje claro, sin detalles técnicos.
// - El administrador ve el motivo exacto y qué hacer (por ejemplo, "Agregar saldo").
// - Si el problema es de la cuenta (saldo, límite o clave), queda una alerta para el CRM.
import { loadServerDoc, saveServerDoc } from './storage.ts';

export type AiErrorCode = 'saldo' | 'limite' | 'clave' | 'ocupado' | 'red' | 'larga' | 'formato' | 'desconocido';

export interface AiErrorInfo {
  code: AiErrorCode;
  /** Se puede reintentar solo (falla pasajera). */
  transient: boolean;
  /** Mensaje para cualquier usuario. */
  userMessage: string;
  /** Motivo exacto para el administrador. */
  adminMessage: string;
  /** Acción sugerida al administrador (botón en pantalla). */
  adminAction?: { label: string; url: string };
}

export const BILLING_URL = 'https://console.anthropic.com/settings/billing';
export const LIMITS_URL = 'https://console.anthropic.com/settings/limits';

/** Error de la API de Claude con su código HTTP, para clasificarlo bien. */
export class ClaudeApiError extends Error {
  status: number;
  constructor(status: number, detail: string) {
    super(`Claude API ${status}: ${detail.slice(0, 400)}`);
    this.status = status;
  }
}

/** Error propio de 4haus con un motivo ya conocido (p. ej. la web salió demasiado larga). */
export class KnownAiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function classifyAiError(err: unknown): AiErrorInfo {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();
  const status = err instanceof ClaudeApiError ? err.status : 0;
  const known = err instanceof KnownAiError ? err.code : null;

  if (known === 'larga') {
    return {
      code: 'larga',
      transient: false,
      userMessage: 'Tu web salió más larga de lo que permite este nivel. Elige un nivel más alto o pide menos secciones.',
      adminMessage: `La web superó el máximo de texto del nivel elegido, incluso después de pedir que continuara. (${raw})`,
    };
  }
  if (known === 'formato') {
    return {
      code: 'formato',
      transient: true,
      userMessage: 'La IA no entregó una web completa esta vez. Vuelve a intentarlo; no se descontó tu cupo.',
      adminMessage: `La respuesta de la IA no traía un archivo HTML completo. (${raw})`,
    };
  }
  if (msg.includes('credit balance') || msg.includes('billing') || msg.includes('insufficient')) {
    return {
      code: 'saldo',
      transient: false,
      userMessage: 'La IA de 4haus no está disponible en este momento. Ya avisamos al equipo; inténtalo más tarde. No se descontó tu cupo.',
      adminMessage: 'Tu cuenta de Claude se quedó sin saldo. Agrega saldo para que las webs vuelvan a funcionar.',
      adminAction: { label: 'Agregar saldo', url: BILLING_URL },
    };
  }
  if (msg.includes('usage limit') || msg.includes('spend limit') || msg.includes('specified api usage')) {
    return {
      code: 'limite',
      transient: false,
      userMessage: 'La IA de 4haus no está disponible en este momento. Ya avisamos al equipo; inténtalo más tarde. No se descontó tu cupo.',
      adminMessage: 'Tu cuenta de Claude llegó al límite de gasto mensual que configuraste. Súbelo o espera al próximo mes.',
      adminAction: { label: 'Cambiar límite de gasto', url: LIMITS_URL },
    };
  }
  if (status === 401 || status === 403 || msg.includes('falta la clave') || msg.includes('authentication') || msg.includes('invalid x-api-key')) {
    return {
      code: 'clave',
      transient: false,
      userMessage: 'La IA de 4haus no está disponible en este momento. Ya avisamos al equipo. No se descontó tu cupo.',
      adminMessage: 'La clave de Claude (ANTHROPIC_API_KEY) en Render falta o no es válida. Crea una nueva en la consola de Claude y reemplázala en Render.',
      adminAction: { label: 'Abrir claves de Claude', url: 'https://console.anthropic.com/settings/keys' },
    };
  }
  if (status === 429 || status === 529 || status >= 500 || msg.includes('overloaded') || msg.includes('rate limit')) {
    return {
      code: 'ocupado',
      transient: true,
      userMessage: 'El servicio de IA está muy ocupado en este momento. Vuelve a intentarlo en unos minutos; no se descontó tu cupo.',
      adminMessage: `Claude respondió que está saturado o con un error temporal (código ${status || 'sin código'}).`,
    };
  }
  if (msg.includes('fetch failed') || msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('terminated') || msg.includes('socket')) {
    return {
      code: 'red',
      transient: true,
      userMessage: 'Se cortó la conexión con la IA. Vuelve a intentarlo; no se descontó tu cupo.',
      adminMessage: `Se cortó la conexión entre el servidor y Claude. (${raw})`,
    };
  }
  return {
    code: 'desconocido',
    transient: false,
    userMessage: 'No pude terminar tu web esta vez. Vuelve a intentarlo; no se descontó tu cupo.',
    adminMessage: `Error no identificado: ${raw}`,
  };
}

// ---------------------------------------------------------------- alerta para el CRM
export interface AiAlert {
  code: AiErrorCode;
  message: string;
  action?: { label: string; url: string };
  at: string;
}

let lastAlert: AiAlert | null = null;
let alertLoaded = false;

/** Guarda una alerta solo cuando el problema es de la cuenta (saldo, límite o clave). */
export function noteAiFailure(info: AiErrorInfo) {
  if (!['saldo', 'limite', 'clave'].includes(info.code)) return;
  lastAlert = { code: info.code, message: info.adminMessage, action: info.adminAction, at: new Date().toISOString() };
  alertLoaded = true;
  saveServerDoc('aiAlert', { ...lastAlert, active: true });
}

/** Cuando la IA vuelve a funcionar, la alerta se apaga sola. */
export function noteAiSuccess() {
  if (!lastAlert) return;
  lastAlert = null;
  saveServerDoc('aiAlert', { active: false, at: new Date().toISOString() });
}

export async function currentAiAlert(): Promise<AiAlert | null> {
  if (!alertLoaded) {
    const saved = await loadServerDoc<AiAlert & { active?: boolean }>('aiAlert');
    lastAlert = saved?.active ? { code: saved.code, message: saved.message, action: saved.action, at: saved.at } : null;
    alertLoaded = true;
  }
  return lastAlert;
}

// ---------------------------------------------------------------- ruta para el CRM
import type { Express, Request, Response } from 'express';
import { isAdmin } from './crm.ts';

export function registerAiStatusRoute(app: Express) {
  app.get('/api/studio/admin/ai-status', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    res.json({
      alert: await currentAiAlert(),
      claudeKey: Boolean(process.env.ANTHROPIC_API_KEY),
      voice: process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : process.env.FISH_AUDIO_API_KEY ? 'fish' : null,
      billingUrl: BILLING_URL,
    });
  });
}
