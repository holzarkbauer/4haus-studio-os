// CRM 4haus: ventas (con comisiones y referidos) y propuestas. Solo administradores.
//
// Reglas del negocio (acordadas con José):
//   - Curso 2.000 USD: inicial 25%, el resto con tarjeta en cuotas del banco.
//   - Modelo de negocio (Base 10.000 / Pro 17.500 / Élite 25.000): inicial 50%, el resto con tarjeta.
//   - Referido: 10% del curso o del modelo; se paga cuando el comprador pagó todo y pasaron 14 días.
//   - Comisión por venta: Lobo 5 / 7,5 / 10% y Oso 15 / 20 / 25% según ventas del mes (1-3, 4-6, 7+).
//     Leones y Águilas no cobran comisión por venta, solo referidos.
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { saveJsonDoc, listJsonDocs } from './storage.ts';
import { isAdmin } from './crm.ts';

const DATA = path.resolve(process.cwd(), 'data');
const REFUND_DAYS = 14;

export const PRODUCTS: Record<string, { name: string; price: number; initialPct: number; referral: boolean }> = {
  curso: { name: 'Curso 4haus', price: 2000, initialPct: 25, referral: true },
  'modelo-base': { name: 'Modelo de negocio · Base', price: 10000, initialPct: 50, referral: true },
  'modelo-pro': { name: 'Modelo de negocio · Pro', price: 17500, initialPct: 50, referral: true },
  'modelo-elite': { name: 'Modelo de negocio · Élite', price: 25000, initialPct: 50, referral: true },
  'landing-3d': { name: 'Web · Landing 3D', price: 500, initialPct: 50, referral: false },
  'web-profesional': { name: 'Web · Profesional', price: 1000, initialPct: 50, referral: false },
  'web-ventas': { name: 'Web · Web + ventas', price: 2000, initialPct: 50, referral: false },
  'sistema-completo': { name: 'Web · Sistema completo', price: 3000, initialPct: 50, referral: false },
  otro: { name: 'Otro', price: 0, initialPct: 0, referral: false },
};
const SALE_STATUS = ['pendiente', 'inicial-pagada', 'pagado', 'reembolsado'] as const;
const PROPOSAL_STATUS = ['borrador', 'enviada', 'negociacion', 'aceptada', 'rechazada'] as const;
const SELLER_TYPES = ['', 'lobo', 'oso', 'leon', 'aguila'] as const;

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const money = (v: unknown) => Math.max(0, Math.min(10_000_000, Math.round((Number(v) || 0) * 100) / 100));
const newId = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function store<T extends { id: string; updatedAt: string }>(collection: string, file: string) {
  const local = path.join(DATA, file);
  const readLocal = (): Record<string, T> => {
    try {
      return fs.existsSync(local) ? JSON.parse(fs.readFileSync(local, 'utf-8')) : {};
    } catch {
      return {};
    }
  };
  return {
    async all(): Promise<T[]> {
      const map = new Map<string, T>();
      for (const x of [...(await listJsonDocs<T>(collection, 1000)), ...Object.values(readLocal())]) {
        const prev = map.get(x.id);
        if (!prev || prev.updatedAt < x.updatedAt) map.set(x.id, x);
      }
      return Array.from(map.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    save(x: T) {
      try {
        fs.mkdirSync(DATA, { recursive: true });
        const all = readLocal();
        all[x.id] = x;
        fs.writeFileSync(local, JSON.stringify(all, null, 2), 'utf-8');
      } catch (err) {
        console.error(`[crm] No se pudo guardar ${file}:`, (err as Error).message);
      }
      saveJsonDoc(collection, x.id, x, 'admin');
    },
  };
}

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  buyerName: string;
  buyerContact: string;
  contactId: string;
  priceUsd: number;
  paidUsd: number;
  status: (typeof SALE_STATUS)[number];
  paidInFullAt: string;
  sellerName: string;
  sellerType: (typeof SELLER_TYPES)[number];
  commissionPct: number | null; // null = se calcula según el tramo del mes
  commissionPaid: boolean;
  referrerName: string;
  referralCode: string;
  referralPaid: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  contactId: string;
  clientName: string;
  packageId: string;
  extras: string;
  amountUsd: number;
  status: (typeof PROPOSAL_STATUS)[number];
  validUntil: string;
  notes: string;
  saleId: string;
  createdAt: string;
  updatedAt: string;
}

const sales = store<Sale>('serverCrmSales', 'crm-sales.json');
const proposals = store<Proposal>('serverCrmProposals', 'crm-proposals.json');

function tierPct(type: string, count: number): number {
  const tiers = type === 'lobo' ? [5, 7.5, 10] : type === 'oso' ? [15, 20, 25] : [0, 0, 0];
  return count >= 7 ? tiers[2] : count >= 4 ? tiers[1] : count >= 1 ? tiers[0] : 0;
}

/** Calcula comisiones, referidos y montos por cobrar de cada venta. */
export function computeSales(list: Sale[], today = new Date().toISOString().slice(0, 10)) {
  // Ventas cerradas por vendedor y mes (no cuentan las reembolsadas).
  const counts = new Map<string, number>();
  for (const s of list) {
    if (!s.sellerName || s.status === 'reembolsado') continue;
    const key = `${s.sellerName.toLowerCase()}|${s.date.slice(0, 7)}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return list.map((s) => {
    const product = PRODUCTS[s.productId] || PRODUCTS.otro;
    const monthCount = s.sellerName ? counts.get(`${s.sellerName.toLowerCase()}|${s.date.slice(0, 7)}`) || 0 : 0;
    const pct = s.commissionPct ?? tierPct(s.sellerType, monthCount);
    const active = s.status !== 'reembolsado';
    const refundWindowOver = Boolean(s.paidInFullAt) && new Date(s.paidInFullAt).getTime() + REFUND_DAYS * 86_400_000 <= new Date(today).getTime();
    const referralUsd = active && product.referral && s.referrerName ? Math.round(s.priceUsd * 0.1 * 100) / 100 : 0;
    const commissionUsd = active ? Math.round(s.priceUsd * (pct / 100) * 100) / 100 : 0;
    return {
      ...s,
      initialUsd: Math.round(s.priceUsd * (product.initialPct / 100) * 100) / 100,
      balanceUsd: active ? Math.max(0, Math.round((s.priceUsd - s.paidUsd) * 100) / 100) : 0,
      monthCount,
      appliedCommissionPct: pct,
      commissionUsd,
      // Comisión y referido se pagan solo con la venta pagada completa y fuera del plazo de reembolso.
      commissionDue: commissionUsd > 0 && !s.commissionPaid && s.status === 'pagado' && refundWindowOver,
      referralUsd,
      referralDue: referralUsd > 0 && !s.referralPaid && s.status === 'pagado' && refundWindowOver,
    };
  });
}

function pickEnum<T extends readonly string[]>(v: unknown, list: T, fallback: T[number]): T[number] {
  return (list as readonly string[]).includes(String(v)) ? (String(v) as T[number]) : fallback;
}

function sanitizeSale(b: any, prev?: Sale): Sale | string {
  const now = new Date().toISOString();
  const productId = pickEnum(b?.productId, Object.keys(PRODUCTS) as unknown as readonly string[], prev?.productId || 'curso');
  const product = PRODUCTS[productId];
  const base: Sale =
    prev ||
    ({
      id: newId('sale'),
      date: now.slice(0, 10),
      productId,
      productName: product.name,
      buyerName: '',
      buyerContact: '',
      contactId: '',
      priceUsd: product.price,
      paidUsd: 0,
      status: 'pendiente',
      paidInFullAt: '',
      sellerName: '',
      sellerType: '',
      commissionPct: null,
      commissionPaid: false,
      referrerName: '',
      referralCode: '',
      referralPaid: false,
      notes: '',
      createdAt: now,
      updatedAt: now,
    } as Sale);
  const has = (k: string) => b?.[k] !== undefined;
  const s: Sale = {
    ...base,
    productId,
    productName: has('productName') ? clean(b.productName, 120) || product.name : prev && prev.productId === productId ? base.productName : product.name,
    date: has('date') && /^\d{4}-\d{2}-\d{2}$/.test(String(b.date)) ? String(b.date) : base.date,
    buyerName: has('buyerName') ? clean(b.buyerName, 120) : base.buyerName,
    buyerContact: has('buyerContact') ? clean(b.buyerContact, 160) : base.buyerContact,
    contactId: has('contactId') ? clean(b.contactId, 80) : base.contactId,
    priceUsd: has('priceUsd') ? money(b.priceUsd) : base.priceUsd,
    paidUsd: has('paidUsd') ? money(b.paidUsd) : base.paidUsd,
    status: has('status') ? pickEnum(b.status, SALE_STATUS, base.status) : base.status,
    sellerName: has('sellerName') ? clean(b.sellerName, 120) : base.sellerName,
    sellerType: has('sellerType') ? pickEnum(b.sellerType, SELLER_TYPES, base.sellerType) : base.sellerType,
    commissionPct: has('commissionPct') ? (b.commissionPct === null || b.commissionPct === '' ? null : Math.max(0, Math.min(100, Number(b.commissionPct) || 0))) : base.commissionPct,
    commissionPaid: has('commissionPaid') ? Boolean(b.commissionPaid) : base.commissionPaid,
    referrerName: has('referrerName') ? clean(b.referrerName, 120) : base.referrerName,
    referralCode: has('referralCode') ? clean(b.referralCode, 60) : base.referralCode,
    referralPaid: has('referralPaid') ? Boolean(b.referralPaid) : base.referralPaid,
    notes: has('notes') ? clean(b.notes, 2000) : base.notes,
    updatedAt: now,
  };
  // Leones y Águilas no cobran comisión por venta.
  if (s.sellerType === 'leon' || s.sellerType === 'aguila') s.commissionPct = 0;
  if (s.status === 'pagado') {
    if (!s.paidInFullAt) s.paidInFullAt = now.slice(0, 10);
    if (s.paidUsd < s.priceUsd) s.paidUsd = s.priceUsd;
  } else s.paidInFullAt = '';
  if (!s.buyerName) return 'Escribe el nombre del comprador.';
  if (s.paidUsd > s.priceUsd) return 'Lo pagado no puede ser mayor que el precio.';
  return s;
}

function sanitizeProposal(b: any, prev?: Proposal): Proposal | string {
  const now = new Date().toISOString();
  const base: Proposal =
    prev || { id: newId('prop'), contactId: '', clientName: '', packageId: 'web-profesional', extras: '', amountUsd: 1000, status: 'borrador', validUntil: '', notes: '', saleId: '', createdAt: now, updatedAt: now };
  const has = (k: string) => b?.[k] !== undefined;
  const p: Proposal = {
    ...base,
    contactId: has('contactId') ? clean(b.contactId, 80) : base.contactId,
    clientName: has('clientName') ? clean(b.clientName, 120) : base.clientName,
    packageId: has('packageId') ? pickEnum(b.packageId, Object.keys(PRODUCTS) as unknown as readonly string[], base.packageId) : base.packageId,
    extras: has('extras') ? clean(b.extras, 400) : base.extras,
    amountUsd: has('amountUsd') ? money(b.amountUsd) : base.amountUsd,
    status: has('status') ? pickEnum(b.status, PROPOSAL_STATUS, base.status) : base.status,
    validUntil: has('validUntil') && /^(\d{4}-\d{2}-\d{2})?$/.test(String(b.validUntil)) ? String(b.validUntil) : base.validUntil,
    notes: has('notes') ? clean(b.notes, 2000) : base.notes,
    updatedAt: now,
  };
  if (!p.clientName) return 'Escribe el nombre del cliente.';
  return p;
}

export function registerCrmSalesRoutes(app: Express) {
  const guard = (req: Request, res: Response) => {
    if (isAdmin(req)) return true;
    res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    return false;
  };

  app.get('/api/studio/admin/crm/sales', async (req, res) => {
    if (!guard(req, res)) return;
    res.json({ sales: computeSales(await sales.all()), products: PRODUCTS });
  });

  app.post('/api/studio/admin/crm/sales', async (req, res) => {
    if (!guard(req, res)) return;
    const id = clean(req.body?.id, 80);
    const prev = id ? (await sales.all()).find((s) => s.id === id) : undefined;
    if (id && !prev) return res.status(404).json({ error: 'No encontré esa venta.' });
    const s = sanitizeSale(req.body, prev);
    if (typeof s === 'string') return res.status(400).json({ error: s });
    sales.save(s);
    res.json({ sale: computeSales([...(await sales.all()).filter((x) => x.id !== s.id), s]).find((x) => x.id === s.id) });
  });

  app.get('/api/studio/admin/crm/proposals', async (req, res) => {
    if (!guard(req, res)) return;
    res.json({ proposals: await proposals.all() });
  });

  app.post('/api/studio/admin/crm/proposals', async (req, res) => {
    if (!guard(req, res)) return;
    const id = clean(req.body?.id, 80);
    const prev = id ? (await proposals.all()).find((p) => p.id === id) : undefined;
    if (id && !prev) return res.status(404).json({ error: 'No encontré esa propuesta.' });
    const p = sanitizeProposal(req.body, prev);
    if (typeof p === 'string') return res.status(400).json({ error: p });
    // Al aceptar, se crea la venta (una sola vez).
    if (p.status === 'aceptada' && !p.saleId) {
      const sale = sanitizeSale({ productId: p.packageId, buyerName: p.clientName, contactId: p.contactId, priceUsd: p.amountUsd, notes: p.extras ? `Extras: ${p.extras}` : '' });
      if (typeof sale !== 'string') {
        sales.save(sale);
        p.saleId = sale.id;
      }
    }
    proposals.save(p);
    res.json({ proposal: p });
  });
}
