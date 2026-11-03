// Solicitudes de llamada: después de ver su maqueta gratis, la empresa deja sus datos, elige
// un paquete y los extras que le interesan. José las revisa en el panel de administración.
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { saveJsonDoc, listJsonDocs } from './storage.ts';

const COLLECTION = 'serverLeads';
const FILE = path.resolve(process.cwd(), 'data', 'leads.json');
const PER_IP_DAILY = 5;

export const PACKAGES = ['landing-3d', 'web-profesional', 'web-ventas', 'sistema-completo'] as const;
export const UPGRADES = ['plantilla-premium', 'chatbot', 'agente-ia', 'backoffice', 'mantenimiento', 'dominio-hosting', 'idioma-extra'] as const;

export interface Lead {
  id: string;
  name: string;
  contact: string;
  business: string;
  packageId: string;
  upgrades: string[];
  message: string;
  siteId?: string;
  workspaceId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

const perIp = { day: '', count: {} as Record<string, number> };

function readLocal(): Lead[] {
  try {
    return fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, 'utf-8')) as Lead[]) : [];
  } catch {
    return [];
  }
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

function adminUids(): string[] {
  return String(process.env.ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function registerLeadRoutes(app: Express) {
  app.post('/api/studio/leads', (req: Request, res: Response) => {
    const today = new Date().toISOString().slice(0, 10);
    if (perIp.day !== today) Object.assign(perIp, { day: today, count: {} });
    const ip = String(req.ip || 'sin-ip');
    if ((perIp.count[ip] || 0) >= PER_IP_DAILY) return res.status(429).json({ error: 'Ya recibimos tus datos. Te contactaremos pronto.' });

    const name = clean(req.body?.name, 80);
    const contact = clean(req.body?.contact, 120);
    if (name.length < 2 || contact.length < 6) return res.status(400).json({ error: 'Escribe tu nombre y un WhatsApp o correo para contactarte.' });
    const packageId = PACKAGES.includes(req.body?.packageId) ? req.body.packageId : 'landing-3d';
    const upgrades = Array.isArray(req.body?.upgrades) ? req.body.upgrades.filter((u: string) => (UPGRADES as readonly string[]).includes(u)) : [];

    const now = new Date().toISOString();
    const lead: Lead = {
      id: `lead_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name,
      contact,
      business: clean(req.body?.business, 120),
      packageId,
      upgrades,
      message: clean(req.body?.message, 1000),
      siteId: clean(req.body?.siteId, 60) || undefined,
      workspaceId: req.auth?.workspaceId || '',
      verified: Boolean(req.auth?.verified),
      createdAt: now,
      updatedAt: now,
    };
    perIp.count[ip] = (perIp.count[ip] || 0) + 1;
    const all = [lead, ...readLocal()].slice(0, 1000);
    try {
      fs.writeFileSync(FILE, JSON.stringify(all, null, 2), 'utf-8');
    } catch (err) {
      console.error('[leads] No se pudo guardar el archivo local:', (err as Error).message);
    }
    saveJsonDoc(COLLECTION, lead.id, lead, lead.workspaceId || 'anon');
    console.log(`[leads] Nueva solicitud ${lead.id} paquete=${lead.packageId}`);
    res.json({ success: true });
  });

  // Solo administradores: ver las solicitudes de llamada.
  app.get('/api/studio/admin/leads', async (req: Request, res: Response) => {
    if (!req.auth?.uid || !adminUids().includes(req.auth.uid)) return res.status(403).json({ error: 'Solo administradores.' });
    const remote = await listJsonDocs<Lead>(COLLECTION);
    const byId = new Map<string, Lead>();
    for (const l of [...remote, ...readLocal()]) byId.set(l.id, l);
    res.json({ leads: Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  });
}
