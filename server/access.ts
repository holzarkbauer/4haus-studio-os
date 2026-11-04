// Códigos de acceso y Programa de creadores.
//
// - Los 580 códigos viven solo en el Excel de José; el servidor guarda su huella SHA-256
//   (server/access-codes.json), así que ver el repositorio no permite usarlos.
// - Cada código se canjea UNA sola vez (Firestore crea el registro de forma atómica).
// - Tipos: A Águilas (socios), B Leones (externos), C Osos (in-house full comisión),
//   D Lobos (in-house sueldo + comisión), CR Creadores (con Instagram, los aprueba José).
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Express, Request, Response } from 'express';
import { createOnce, saveJsonDoc, loadJsonDoc, listJsonDocs } from './storage.ts';

export type AccessType = 'A' | 'B' | 'C' | 'D' | 'CR';
export const ACCESS_LABELS: Record<AccessType, string> = {
  A: 'Águila · Socio',
  B: 'León · Colaborador externo',
  C: 'Oso · In-house a full comisión',
  D: 'Lobo · In-house con sueldo + comisión',
  CR: 'Creador',
};

export interface AccessProfile {
  uid: string;
  type: AccessType;
  status: 'pending' | 'approved' | 'rejected';
  instagram: string;
  name: string;
  email: string;
  redeemedAt: string;
  reviewedAt?: string;
  updatedAt: string;
}

interface AccessRequest {
  id: string;
  name: string;
  instagram: string;
  contact: string;
  why: string;
  createdAt: string;
  updatedAt: string;
}

const DATA = path.resolve(process.cwd(), 'data');
const USED_FILE = path.join(DATA, 'access-used.json');
const PROFILES_FILE = path.join(DATA, 'access-profiles.json');
const REQUESTS_FILE = path.join(DATA, 'access-requests.json');

let hashes: Map<string, AccessType> | null = null;
function codeTable() {
  if (hashes) return hashes;
  hashes = new Map();
  try {
    const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'server', 'access-codes.json'), 'utf-8'));
    for (const c of raw.codigos || []) hashes.set(String(c.h), c.t as AccessType);
  } catch (err) {
    console.error('[access] No se pudo leer server/access-codes.json:', (err as Error).message);
  }
  return hashes;
}

/** Normaliza lo que escribe la persona (espacios, minúsculas) antes de calcular la huella. */
export function normalizeCode(input: string) {
  return String(input || '').toUpperCase().replace(/\s+/g, '').trim();
}
export function hashCode(code: string) {
  return crypto.createHash('sha256').update(normalizeCode(code)).digest('hex');
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(file: string, value: unknown) {
  try {
    fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
  } catch (err) {
    console.error('[access] No se pudo guardar:', (err as Error).message);
  }
}

async function getProfile(uid: string): Promise<AccessProfile | null> {
  const local = readJson<Record<string, AccessProfile>>(PROFILES_FILE, {})[uid];
  if (local) return local;
  const remote = await loadJsonDoc<AccessProfile>('serverAccessProfiles', uid);
  if (remote) {
    const all = readJson<Record<string, AccessProfile>>(PROFILES_FILE, {});
    all[uid] = remote;
    writeJson(PROFILES_FILE, all);
  }
  return remote;
}

function saveProfile(p: AccessProfile) {
  p.updatedAt = new Date().toISOString();
  const all = readJson<Record<string, AccessProfile>>(PROFILES_FILE, {});
  all[p.uid] = p;
  writeJson(PROFILES_FILE, all);
  saveJsonDoc('serverAccessProfiles', p.uid, p, p.uid);
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const cleanIg = (v: unknown) => clean(v, 40).replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '');

function adminUids(): string[] {
  return String(process.env.ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Intentos fallidos por usuario (frena a quien intente adivinar códigos).
const failed = new Map<string, { day: string; n: number }>();
const MAX_FAILED_PER_DAY = 10;

export function registerAccessRoutes(app: Express) {
  // Pedir un código (landing del Programa de creadores). No requiere registro.
  const perIp = { day: '', n: {} as Record<string, number> };
  app.post('/api/studio/access/request', (req: Request, res: Response) => {
    const today = new Date().toISOString().slice(0, 10);
    if (perIp.day !== today) Object.assign(perIp, { day: today, n: {} });
    const ip = String(req.ip || 'sin-ip');
    if ((perIp.n[ip] || 0) >= 3) return res.status(429).json({ error: 'Ya recibimos tu solicitud. Te escribiremos pronto.' });
    const name = clean(req.body?.name, 80);
    const instagram = cleanIg(req.body?.instagram);
    const contact = clean(req.body?.contact, 120);
    if (name.length < 2 || instagram.length < 2 || contact.length < 6) {
      return res.status(400).json({ error: 'Escribe tu nombre, tu usuario de Instagram y un WhatsApp o correo.' });
    }
    const now = new Date().toISOString();
    const r: AccessRequest = { id: `req_${Date.now().toString(36)}${crypto.randomBytes(2).toString('hex')}`, name, instagram, contact, why: clean(req.body?.why, 600), createdAt: now, updatedAt: now };
    perIp.n[ip] = (perIp.n[ip] || 0) + 1;
    writeJson(REQUESTS_FILE, [r, ...readJson<AccessRequest[]>(REQUESTS_FILE, [])].slice(0, 2000));
    saveJsonDoc('serverAccessRequests', r.id, r, 'anon');
    res.json({ success: true });
  });

  // Ver mi tipo de cuenta.
  app.get('/api/studio/access/me', async (req: Request, res: Response) => {
    if (!req.auth?.verified || !req.auth.uid) return res.json({ profile: null, guest: true });
    const p = await getProfile(req.auth.uid);
    res.json({ profile: p ? { ...p, label: ACCESS_LABELS[p.type] } : null, admin: adminUids().includes(req.auth.uid) });
  });

  // Canjear un código: requiere sesión con Google.
  app.post('/api/studio/access/redeem', async (req: Request, res: Response) => {
    if (!req.auth?.verified || !req.auth.uid) return res.status(401).json({ error: 'Inicia sesión con Google para canjear tu código.', authRequired: true });
    const uid = req.auth.uid;
    const today = new Date().toISOString().slice(0, 10);
    const f = failed.get(uid);
    if (f && f.day === today && f.n >= MAX_FAILED_PER_DAY) return res.status(429).json({ error: 'Demasiados intentos. Vuelve a intentarlo mañana.' });
    if (await getProfile(uid)) return res.status(409).json({ error: 'Tu cuenta ya tiene un código activo.' });

    const instagram = cleanIg(req.body?.instagram);
    const h = hashCode(req.body?.code);
    const type = codeTable().get(h);
    const fail = (status: number, error: string) => {
      const cur = failed.get(uid);
      failed.set(uid, { day: today, n: cur && cur.day === today ? cur.n + 1 : 1 });
      return res.status(status).json({ error });
    };
    if (!type) return fail(400, 'Ese código no es válido. Revisa que esté completo.');
    if (type === 'CR' && instagram.length < 2) return res.status(400).json({ error: 'Escribe tu usuario de Instagram: lo revisamos para activar tu cuenta de creador.' });

    // Una sola vez: Firestore crea el registro solo si no existe.
    const now = new Date().toISOString();
    let first = await createOnce('serverAccessCodes', h, { uid, type, usedAt: now });
    if (first === null) {
      const used = readJson<Record<string, string>>(USED_FILE, {});
      first = !used[h];
      if (first) {
        used[h] = uid;
        writeJson(USED_FILE, used);
      }
    }
    if (!first) return fail(409, 'Ese código ya fue usado.');

    const profile: AccessProfile = {
      uid,
      type,
      // Los creadores esperan la revisión de su Instagram; el equipo y los socios quedan activos.
      status: type === 'CR' ? 'pending' : 'approved',
      instagram,
      name: clean(req.body?.name, 80),
      email: clean(req.body?.email, 120),
      redeemedAt: now,
      updatedAt: now,
    };
    saveProfile(profile);
    console.log(`[access] Código canjeado tipo=${type} uid=${uid}`);
    res.json({ profile: { ...profile, label: ACCESS_LABELS[type] } });
  });

  // ---- Solo administradores
  const isAdmin = (req: Request) => Boolean(req.auth?.uid && adminUids().includes(req.auth.uid));

  app.get('/api/studio/admin/access', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo administradores.' });
    const reqMap = new Map<string, AccessRequest>();
    for (const r of [...(await listJsonDocs<AccessRequest>('serverAccessRequests')), ...readJson<AccessRequest[]>(REQUESTS_FILE, [])]) reqMap.set(r.id, r);
    const profMap = new Map<string, AccessProfile>();
    for (const p of [...(await listJsonDocs<AccessProfile>('serverAccessProfiles')), ...Object.values(readJson<Record<string, AccessProfile>>(PROFILES_FILE, {}))]) profMap.set(p.uid, p);
    res.json({
      requests: Array.from(reqMap.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      profiles: Array.from(profMap.values())
        .map((p) => ({ ...p, label: ACCESS_LABELS[p.type] }))
        .sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt)),
    });
  });

  app.post('/api/studio/admin/access/:uid', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo administradores.' });
    const p = await getProfile(String(req.params.uid));
    if (!p) return res.status(404).json({ error: 'No encontré esa cuenta.' });
    const status = req.body?.status;
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Estado no válido.' });
    p.status = status;
    p.reviewedAt = new Date().toISOString();
    saveProfile(p);
    res.json({ profile: { ...p, label: ACCESS_LABELS[p.type] } });
  });
}
