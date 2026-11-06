// CRM interno de 4haus (solo administradores: José y su equipo).
//
// Reúne en un solo lugar a las personas que llegan por la web y a los negocios que se buscan:
//   - solicitudes de llamada de empresas (serverLeads)
//   - solicitudes de código de creadores (serverAccessRequests)
//   - creadores que ya canjearon su código (serverAccessProfiles)
//   - negocios encontrados con "Buscar clientes" o añadidos a mano (serverCrmContacts)
// Lo que llega por la web aparece solo; cuando el administrador lo edita (etapa, notas, próxima
// acción) se guarda una copia en serverCrmContacts con el mismo id, y esa copia manda.
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { saveJsonDoc, listJsonDocs } from './storage.ts';
import { aiBudgetAvailable, recordAiSpend, priceFor, CLAUDE_WEB_SEARCH_USD } from './daniel.ts';

const COLLECTION = 'serverCrmContacts';
const DATA = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA, 'crm-contacts.json');
const SEARCHES_PER_DAY = Number(process.env.CRM_DAILY_SEARCHES || 20);
const MODEL = 'claude-sonnet-5-5';

export const STAGES = {
  creador: ['nuevo', 'contactado', 'codigo-enviado', 'activo', 'vendio', 'perdido'],
  empresa: ['nuevo', 'llamada', 'propuesta', 'ganado', 'perdido'],
} as const;
type Kind = keyof typeof STAGES;

const PACKAGE_PRICE: Record<string, number> = {
  'landing-3d': 500,
  'web-profesional': 1000,
  'web-ventas': 2000,
  'sistema-completo': 3000,
};

export interface CrmContact {
  id: string;
  kind: Kind;
  name: string;
  company: string;
  contact: string;
  instagram: string;
  website: string;
  city: string;
  rubro: string;
  stage: string;
  source: string;
  valueUsd: number;
  nextAction: string;
  nextActionAt: string;
  notes: string;
  doNotContact: boolean;
  // Cómo llegó el permiso para escribirle: él pidió contacto, o es un negocio buscado (solo canales del negocio).
  consent: 'pidio-contacto' | 'negocio-publico' | 'ninguno';
  origin: { type: 'lead' | 'access-request' | 'access-profile' | 'prospeccion' | 'manual'; refId?: string; sourceUrl?: string };
  createdAt: string;
  updatedAt: string;
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

function adminUids(): string[] {
  return String(process.env.ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
const isAdmin = (req: Request) => Boolean(req.auth?.verified && req.auth.uid && adminUids().includes(req.auth.uid));

function readJson<T>(file: string, fallback: T): T {
  try {
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readLocalContacts(): Record<string, CrmContact> {
  return readJson<Record<string, CrmContact>>(FILE, {});
}

function saveContact(c: CrmContact) {
  try {
    fs.mkdirSync(DATA, { recursive: true });
    const all = readLocalContacts();
    all[c.id] = c;
    fs.writeFileSync(FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[crm] No se pudo guardar el archivo local:', (err as Error).message);
  }
  saveJsonDoc(COLLECTION, c.id, c, 'admin');
}

function blank(partial: Partial<CrmContact> & Pick<CrmContact, 'id' | 'kind' | 'origin'>): CrmContact {
  const now = new Date().toISOString();
  return {
    name: '',
    company: '',
    contact: '',
    instagram: '',
    website: '',
    city: '',
    rubro: '',
    stage: 'nuevo',
    source: '',
    valueUsd: 0,
    nextAction: '',
    nextActionAt: '',
    notes: '',
    doNotContact: false,
    consent: 'ninguno',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

async function mergeById<T>(collection: string, localFile: string, key: (x: T) => string, local?: T[]): Promise<T[]> {
  const map = new Map<string, T>();
  for (const x of [...(await listJsonDocs<T>(collection, 500)), ...(local ?? readJson<T[]>(localFile, []))]) map.set(key(x), x);
  return Array.from(map.values());
}

/** Junta lo que llegó por la web con lo guardado en el CRM. */
async function allContacts(): Promise<CrmContact[]> {
  const stored = new Map<string, CrmContact>();
  for (const c of [...(await listJsonDocs<CrmContact>(COLLECTION, 1000)), ...Object.values(readLocalContacts())]) {
    const prev = stored.get(c.id);
    if (!prev || prev.updatedAt < c.updatedAt) stored.set(c.id, c);
  }

  const derived: CrmContact[] = [];
  const leads = await mergeById<any>('serverLeads', path.join(DATA, 'leads.json'), (l) => l.id);
  for (const l of leads) {
    derived.push(
      blank({
        id: l.id,
        kind: 'empresa',
        name: l.name || '',
        company: l.business || '',
        contact: l.contact || '',
        source: 'Agendar llamada (web)',
        valueUsd: PACKAGE_PRICE[l.packageId] || 0,
        notes: [l.packageId && `Paquete: ${l.packageId}`, l.upgrades?.length && `Extras: ${l.upgrades.join(', ')}`, l.message]
          .filter(Boolean)
          .join(' · '),
        consent: 'pidio-contacto',
        origin: { type: 'lead', refId: l.id },
        createdAt: l.createdAt,
        updatedAt: l.updatedAt || l.createdAt,
      }),
    );
  }

  const requests = await mergeById<any>('serverAccessRequests', path.join(DATA, 'access-requests.json'), (r) => r.id);
  const profilesLocal = Object.values(readJson<Record<string, any>>(path.join(DATA, 'access-profiles.json'), {}));
  const profiles = await mergeById<any>('serverAccessProfiles', '', (p) => p.uid, profilesLocal);
  const profileByIg = new Map<string, any>();
  for (const p of profiles) if (p.instagram) profileByIg.set(String(p.instagram).toLowerCase(), p);
  const usedProfiles = new Set<string>();

  for (const r of requests) {
    const p = r.instagram ? profileByIg.get(String(r.instagram).toLowerCase()) : null;
    if (p) usedProfiles.add(p.uid);
    derived.push(
      blank({
        id: r.id,
        kind: 'creador',
        name: r.name || p?.name || '',
        contact: r.contact || p?.email || '',
        instagram: r.instagram || '',
        stage: p ? (p.status === 'approved' ? 'activo' : 'codigo-enviado') : 'nuevo',
        source: 'Pidió código (web)',
        notes: [r.why, p && `Código canjeado: tipo ${p.type} (${p.status})`].filter(Boolean).join(' · '),
        consent: 'pidio-contacto',
        origin: { type: 'access-request', refId: r.id },
        createdAt: r.createdAt,
        updatedAt: p?.updatedAt || r.updatedAt || r.createdAt,
      }),
    );
  }
  for (const p of profiles) {
    if (usedProfiles.has(p.uid)) continue;
    derived.push(
      blank({
        id: `prof_${p.uid}`,
        kind: 'creador',
        name: p.name || '',
        contact: p.email || '',
        instagram: p.instagram || '',
        stage: p.status === 'approved' ? 'activo' : 'codigo-enviado',
        source: 'Canjeó código',
        notes: `Tipo ${p.type} (${p.status})`,
        consent: 'pidio-contacto',
        origin: { type: 'access-profile', refId: p.uid },
        createdAt: p.redeemedAt,
        updatedAt: p.updatedAt || p.redeemedAt,
      }),
    );
  }

  const out = new Map<string, CrmContact>();
  for (const d of derived) out.set(d.id, d);
  for (const s of stored.values()) out.set(s.id, s); // lo editado en el CRM manda
  return Array.from(out.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function sanitizeContact(body: any, existing?: CrmContact): CrmContact | string {
  const kind: Kind = body?.kind === 'creador' ? 'creador' : body?.kind === 'empresa' ? 'empresa' : existing?.kind || 'empresa';
  const stage = clean(body?.stage ?? existing?.stage ?? 'nuevo', 30);
  if (!(STAGES[kind] as readonly string[]).includes(stage)) return 'Etapa no válida para este tipo de contacto.';
  const base =
    existing ||
    blank({ id: `crm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, kind, origin: { type: 'manual' } });
  const pick = (k: keyof CrmContact, max: number) => (body?.[k] !== undefined ? clean(body[k], max) : (base[k] as string));
  const consent = ['pidio-contacto', 'negocio-publico', 'ninguno'].includes(body?.consent) ? body.consent : base.consent;
  const c: CrmContact = {
    ...base,
    kind,
    stage,
    name: pick('name', 100),
    company: pick('company', 140),
    contact: pick('contact', 160),
    instagram: pick('instagram', 60).replace(/^@/, ''),
    website: pick('website', 200),
    city: pick('city', 80),
    rubro: pick('rubro', 80),
    source: pick('source', 80),
    nextAction: pick('nextAction', 200),
    nextActionAt: pick('nextActionAt', 10),
    notes: pick('notes', 2000),
    valueUsd: body?.valueUsd !== undefined ? Math.max(0, Math.min(1_000_000, Number(body.valueUsd) || 0)) : base.valueUsd,
    doNotContact: body?.doNotContact !== undefined ? Boolean(body.doNotContact) : base.doNotContact,
    consent,
    updatedAt: new Date().toISOString(),
  };
  if (body?.origin?.type === 'prospeccion' && !existing) {
    c.origin = { type: 'prospeccion', sourceUrl: clean(body.origin.sourceUrl, 300) };
  }
  if (!c.name && !c.company) return 'Escribe al menos un nombre o el nombre del negocio.';
  return c;
}

// ---- Buscar clientes con Claude (búsqueda web)
const searches = { day: '', n: 0 };

interface Found {
  name: string;
  rubro: string;
  city: string;
  address: string;
  website: string;
  phone: string;
  instagram: string;
  whyFit: string;
  sourceUrl: string;
}

export async function searchBusinesses(input: { rubro: string; city: string; quantity: number; idealClient: string }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw Object.assign(new Error('Falta la clave de Anthropic en el servidor.'), { status: 503 });
  const base = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
  const system = `Eres el asistente de prospección de 4haus Studio. Buscas en la web negocios REALES que podrían necesitar una web, un chatbot o un agente de IA.
Reglas:
- Solo negocios que aparezcan en los resultados de tu búsqueda. Nunca inventes nombres, webs ni teléfonos.
- Solo datos que el propio negocio publica (su web, su perfil público de empresa). Nada de datos personales de particulares ni correos personales.
- Si un dato no aparece, deja el campo vacío.
- "sourceUrl" es la página exacta donde encontraste el negocio.
Responde SOLO con un JSON: {"businesses":[{"name":"","rubro":"","city":"","address":"","website":"","phone":"","instagram":"","whyFit":"","sourceUrl":""}]}`;
  const user = `Busca hasta ${input.quantity} negocios del rubro "${input.rubro}" en "${input.city}".${
    input.idealClient ? ` Cliente ideal: ${input.idealClient}.` : ''
  } En "whyFit" explica en una frase por qué encajan (p. ej. no tienen web, su web es antigua, no responden por chat).`;

  const res = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: user }],
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Claude API ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data: any = await res.json();
  const nSearch = data.usage?.server_tool_use?.web_search_requests || 0;
  const cost = priceFor(MODEL, data.usage?.input_tokens || 0, data.usage?.output_tokens || 0) + nSearch * CLAUDE_WEB_SEARCH_USD;
  recordAiSpend(cost, 'crm-buscar-clientes');

  // Páginas que de verdad salieron en la búsqueda: sirven para descartar lo que no tenga respaldo.
  const seen = new Set<string>();
  let text = '';
  for (const block of data.content || []) {
    if (block.type === 'text') {
      text += block.text || '';
      for (const c of block.citations || []) if (c.url) seen.add(String(c.url));
    } else if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content) if (r.url) seen.add(String(r.url));
    }
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  let parsed: any = {};
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    parsed = {};
  }
  const hostOf = (u: string) => {
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };
  const seenHosts = new Set(Array.from(seen).map(hostOf).filter(Boolean));
  const list: (Found & { verified: boolean })[] = (Array.isArray(parsed.businesses) ? parsed.businesses : [])
    .slice(0, input.quantity)
    .map((b: any) => {
      const f: Found = {
        name: clean(b?.name, 140),
        rubro: clean(b?.rubro, 80) || input.rubro,
        city: clean(b?.city, 80) || input.city,
        address: clean(b?.address, 200),
        website: clean(b?.website, 200),
        phone: clean(b?.phone, 40),
        instagram: clean(b?.instagram, 60).replace(/^@/, ''),
        whyFit: clean(b?.whyFit, 300),
        sourceUrl: clean(b?.sourceUrl, 300),
      };
      const verified = /^https?:\/\//.test(f.sourceUrl) && (seen.has(f.sourceUrl) || seenHosts.has(hostOf(f.sourceUrl)));
      return { ...f, verified };
    })
    .filter((f: Found & { verified: boolean }) => f.name && f.verified); // sin respaldo en la búsqueda, no se muestra
  return { businesses: list, costUsd: Math.round(cost * 1000) / 1000, searches: nSearch };
}

// Búsqueda para creadores (desde "Captar clientes"): requiere cuenta con sesión y tiene su propio límite diario.
const USER_SEARCHES_PER_DAY = Number(process.env.PROSPECT_DAILY_SEARCHES_PER_USER || 5);
const userSearches = new Map<string, { day: string; n: number }>();

export function registerCrmRoutes(app: Express) {
  app.post('/api/studio/prospects/search', async (req: Request, res: Response) => {
    const uid = req.auth?.verified ? req.auth.uid : null;
    if (!uid) return res.status(401).json({ error: 'Inicia sesión con Google para buscar negocios.' });
    const rubro = clean(req.body?.rubro, 80);
    const city = clean(req.body?.city, 80);
    const quantity = Math.max(1, Math.min(10, Number(req.body?.quantity) || 5));
    const idealClient = clean(req.body?.idealClient, 400);
    if (rubro.length < 2 || city.length < 2) return res.status(400).json({ error: 'Elige un rubro y escribe la ciudad.' });
    const today = new Date().toISOString().slice(0, 10);
    const used = userSearches.get(uid);
    const n = used && used.day === today ? used.n : 0;
    if (n >= USER_SEARCHES_PER_DAY) return res.status(429).json({ error: `Llegaste al límite de ${USER_SEARCHES_PER_DAY} búsquedas de hoy.` });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Se alcanzó el presupuesto diario de IA. Vuelve mañana.' });
    userSearches.set(uid, { day: today, n: n + 1 });
    try {
      const result = await searchBusinesses({ rubro, city, quantity, idealClient });
      res.json({ businesses: result.businesses, remainingToday: USER_SEARCHES_PER_DAY - n - 1 });
    } catch (err: any) {
      console.error('[prospectos] Búsqueda falló:', err.message);
      res.status(err.status || 502).json({ error: 'No pude completar la búsqueda. Intenta de nuevo en un momento.' });
    }
  });

  // ¿Esta cuenta es del equipo de 4haus? (para mostrar el CRM en el menú)
  app.get('/api/studio/admin/me', (req: Request, res: Response) => res.json({ admin: isAdmin(req) }));

  app.get('/api/studio/admin/crm', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    res.json({ contacts: await allContacts(), stages: STAGES });
  });

  app.post('/api/studio/admin/crm/contacts', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const id = clean(req.body?.id, 80);
    const existing = id ? (await allContacts()).find((c) => c.id === id) : undefined;
    if (id && !existing) return res.status(404).json({ error: 'No encontré ese contacto.' });
    const result = sanitizeContact(req.body, existing);
    if (typeof result === 'string') return res.status(400).json({ error: result });
    saveContact(result);
    res.json({ contact: result });
  });

  app.post('/api/studio/admin/crm/search', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const rubro = clean(req.body?.rubro, 80);
    const city = clean(req.body?.city, 80);
    const quantity = Math.max(1, Math.min(10, Number(req.body?.quantity) || 5));
    const idealClient = clean(req.body?.idealClient, 400);
    if (rubro.length < 2 || city.length < 2) return res.status(400).json({ error: 'Elige un rubro y escribe la ciudad.' });

    const today = new Date().toISOString().slice(0, 10);
    if (searches.day !== today) Object.assign(searches, { day: today, n: 0 });
    if (searches.n >= SEARCHES_PER_DAY) return res.status(429).json({ error: `Llegaste al límite de ${SEARCHES_PER_DAY} búsquedas de hoy.` });
    if (!(await aiBudgetAvailable())) return res.status(429).json({ error: 'Se alcanzó el presupuesto diario de IA. Vuelve mañana.' });
    searches.n += 1;

    try {
      const result = await searchBusinesses({ rubro, city, quantity, idealClient });
      // Marca los que ya están en el CRM para no duplicarlos.
      const existing = await allContacts();
      const known = new Set(existing.flatMap((c) => [c.company.toLowerCase(), c.website.toLowerCase()]).filter(Boolean));
      res.json({
        ...result,
        businesses: result.businesses.map((b) => ({ ...b, alreadyInCrm: known.has(b.name.toLowerCase()) || (b.website && known.has(b.website.toLowerCase())) })),
        remainingToday: SEARCHES_PER_DAY - searches.n,
      });
    } catch (err: any) {
      console.error('[crm] Búsqueda falló:', err.message);
      res.status(err.status || 502).json({ error: 'No pude completar la búsqueda. Intenta de nuevo en un momento.' });
    }
  });
}
