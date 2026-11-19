// Créditos para crear webs.
//
// Cada web gasta créditos según su nivel:
//   - Básica   (landing de una página)            → 1 crédito
//   - Completa (web con todas sus secciones)      → 2 créditos
//   - Avanzada (web larga, efectos y plantillas)  → 3 créditos
//
// Prueba de 7 días: TRIAL_CREDITS créditos (7 por defecto) que vencen a los 7 días de la
// primera web. Además hay un freno de dinero (TRIAL_MAX_USD, 0,80 USD por defecto): si una
// persona gasta en IA más que eso durante su prueba, se le pide mejorar su plan aunque le
// queden créditos. Así una prueba de 1 USD no puede costarle más que eso a 4haus.
//
// Los administradores (ADMIN_UIDS) no gastan créditos; siguen contando contra el tope diario.
import { loadServerDoc, saveServerDoc } from './storage.ts';

export type SiteLevel = 'basica' | 'completa' | 'avanzada';

export const LEVELS: Record<SiteLevel, { credits: number; firstTokens: number; maxTokens: number; label: string }> = {
  basica: { credits: 1, firstTokens: 12000, maxTokens: 16000, label: 'Básica' },
  completa: { credits: 2, firstTokens: 20000, maxTokens: 28000, label: 'Completa' },
  avanzada: { credits: 3, firstTokens: 30000, maxTokens: 40000, label: 'Avanzada' },
};

export function parseLevel(v: unknown): SiteLevel {
  return v === 'basica' || v === 'avanzada' ? v : 'completa';
}

const TRIAL_CREDITS = () => Number(process.env.TRIAL_CREDITS || 7);
const TRIAL_DAYS = () => Number(process.env.TRIAL_DAYS || 7);
const TRIAL_MAX_USD = () => Number(process.env.TRIAL_MAX_USD || 0.8);

interface Wallet {
  startedAt: string | null;
  used: number;
  spentUsd: number;
}

const wallets = new Map<string, Wallet>();

async function walletFor(uid: string): Promise<Wallet> {
  const cached = wallets.get(uid);
  if (cached) return cached;
  const saved = await loadServerDoc<Wallet>(`siteCredits-${uid}`);
  const w: Wallet = { startedAt: saved?.startedAt || null, used: Number(saved?.used) || 0, spentUsd: Number(saved?.spentUsd) || 0 };
  wallets.set(uid, w);
  return w;
}

function save(uid: string, w: Wallet) {
  saveServerDoc(`siteCredits-${uid}`, { ...w, updatedAt: new Date().toISOString() });
}

export interface CreditStatus {
  unlimited: boolean;
  total: number;
  left: number;
  /** Fecha en que vence la prueba (si ya empezó). */
  endsAt: string | null;
  expired: boolean;
  /** Se alcanzó el freno de dinero de la prueba. */
  overBudget: boolean;
}

export async function creditStatus(uid: string, unlimited: boolean): Promise<CreditStatus> {
  if (unlimited) return { unlimited: true, total: 0, left: 0, endsAt: null, expired: false, overBudget: false };
  const w = await walletFor(uid);
  const endsAt = w.startedAt ? new Date(new Date(w.startedAt).getTime() + TRIAL_DAYS() * 86400000).toISOString() : null;
  const expired = Boolean(endsAt && Date.now() > new Date(endsAt).getTime());
  return {
    unlimited: false,
    total: TRIAL_CREDITS(),
    left: expired ? 0 : Math.max(0, TRIAL_CREDITS() - w.used),
    endsAt,
    expired,
    overBudget: w.spentUsd >= TRIAL_MAX_USD(),
  };
}

/** Mensaje de "mejora tu plan" si no puede crear una web de este nivel; null si sí puede. */
export async function upgradeReason(uid: string, unlimited: boolean, level: SiteLevel): Promise<string | null> {
  const s = await creditStatus(uid, unlimited);
  if (s.unlimited) return null;
  if (s.expired) return 'Terminaron tus 7 días de prueba. Mejora tu plan para seguir creando webs.';
  if (s.overBudget) return 'Usaste todo lo incluido en tu prueba. Mejora tu plan para seguir creando webs.';
  const need = LEVELS[level].credits;
  if (s.left < need) {
    return s.left > 0
      ? `Te quedan ${s.left} crédito(s) y esta web necesita ${need}. Elige un nivel más simple o mejora tu plan.`
      : 'Usaste todos los créditos de tu prueba. Mejora tu plan para seguir creando webs.';
  }
  return null;
}

/** Descuenta los créditos al empezar (se devuelven si la web falla). */
export async function chargeCredits(uid: string, unlimited: boolean, level: SiteLevel) {
  if (unlimited) return;
  const w = await walletFor(uid);
  if (!w.startedAt) w.startedAt = new Date().toISOString();
  w.used += LEVELS[level].credits;
  save(uid, w);
}

export async function refundCredits(uid: string, unlimited: boolean, level: SiteLevel) {
  if (unlimited) return;
  const w = await walletFor(uid);
  w.used = Math.max(0, w.used - LEVELS[level].credits);
  save(uid, w);
}

/** Suma lo que costó en IA (webs y cambios) para el freno de dinero de la prueba. */
export async function addCreditSpend(uid: string, unlimited: boolean, costUsd: number) {
  if (unlimited || !costUsd) return;
  const w = await walletFor(uid);
  w.spentUsd += costUsd;
  save(uid, w);
}

/** Para las pruebas automáticas. */
export function _resetCreditsForTests() {
  wallets.clear();
}
