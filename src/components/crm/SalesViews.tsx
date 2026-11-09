import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, X, Loader2, Wallet, Clock, BadgePercent, Gift, FileSignature } from 'lucide-react';
import { ui } from '../../ui/tokens';

// CRM 4haus: Ventas (con comisiones y referidos) y Propuestas.
// Los cálculos (tramos de comisión, 10% de referido, plazo de reembolso) los hace el servidor.

type T = (es: string, en: string) => string;

interface Product {
  name: string;
  price: number;
  initialPct: number;
  referral: boolean;
}
interface Sale {
  id: string;
  date: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerContact: string;
  priceUsd: number;
  paidUsd: number;
  status: 'pendiente' | 'inicial-pagada' | 'pagado' | 'reembolsado';
  paidInFullAt: string;
  sellerName: string;
  sellerType: '' | 'lobo' | 'oso' | 'leon' | 'aguila';
  commissionPct: number | null;
  commissionPaid: boolean;
  referrerName: string;
  referralCode: string;
  referralPaid: boolean;
  notes: string;
  initialUsd: number;
  balanceUsd: number;
  appliedCommissionPct: number;
  commissionUsd: number;
  commissionDue: boolean;
  referralUsd: number;
  referralDue: boolean;
}
interface Proposal {
  id: string;
  clientName: string;
  packageId: string;
  extras: string;
  amountUsd: number;
  status: 'borrador' | 'enviada' | 'negociacion' | 'aceptada' | 'rechazada';
  validUntil: string;
  notes: string;
  saleId: string;
  updatedAt: string;
}

const usd = (n: number) => `${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`;

const SALE_STATUS: Record<Sale['status'], { es: string; en: string; tint: string }> = {
  pendiente: { es: 'Pendiente', en: 'Pending', tint: 'bg-amber-50 text-amber-800' },
  'inicial-pagada': { es: 'Inicial pagada', en: 'Deposit paid', tint: 'bg-blue-50 text-[#0071E3]' },
  pagado: { es: 'Pagado', en: 'Paid', tint: 'bg-emerald-50 text-emerald-700' },
  reembolsado: { es: 'Reembolsado', en: 'Refunded', tint: 'bg-zinc-100 text-zinc-500' },
};
const PROPOSAL_STATUS: Record<Proposal['status'], { es: string; en: string; tint: string }> = {
  borrador: { es: 'Borrador', en: 'Draft', tint: 'bg-zinc-100 text-zinc-600' },
  enviada: { es: 'Enviada', en: 'Sent', tint: 'bg-blue-50 text-[#0071E3]' },
  negociacion: { es: 'En negociación', en: 'Negotiating', tint: 'bg-amber-50 text-amber-800' },
  aceptada: { es: 'Aceptada', en: 'Accepted', tint: 'bg-emerald-50 text-emerald-700' },
  rechazada: { es: 'Rechazada', en: 'Rejected', tint: 'bg-zinc-100 text-zinc-500' },
};
const SELLER: Record<string, { es: string; en: string }> = {
  '': { es: 'Sin vendedor', en: 'No seller' },
  lobo: { es: 'Lobo', en: 'Wolf' },
  oso: { es: 'Oso', en: 'Bear' },
  leon: { es: 'León', en: 'Lion' },
  aguila: { es: 'Águila', en: 'Eagle' },
};

async function api<R>(path: string, body?: unknown): Promise<R> {
  const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || 'No se pudo completar.');
  return data as R;
}

function Drawer({ title, isDark, t, onClose, children, onSubmit, busy }: { key?: string; title: string; isDark: boolean; t: T; onClose: () => void; children: React.ReactNode; onSubmit: () => void; busy: boolean }) {
  const s = ui(isDark);
  return (
    <motion.div className="fixed inset-0 z-[70] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={`relative w-full max-w-md h-full overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#1D1D1F]'}`}
      >
        <div className="flex justify-between items-center">
          <h3 className={s.heading}>{title}</h3>
          <button type="button" onClick={onClose} className={s.iconButton} aria-label={t('Cerrar', 'Close')}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
        <button type="submit" disabled={busy} className={`${s.primaryButton} w-full`}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t('Guardar', 'Save')}
        </button>
      </motion.form>
    </motion.div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tint, isDark, i }: { label: string; value: string; sub?: string; icon: any; tint: string; isDark: boolean; i: number }) {
  const s = ui(isDark);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${s.card} p-5`}>
      <span className={`w-9 h-9 rounded-full flex items-center justify-center ${tint}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className={`text-xs mt-3 ${s.muted}`}>{label}</div>
      <div className={`text-2xl font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{value}</div>
      {sub && <div className={`text-[11px] mt-1 ${s.faint}`}>{sub}</div>}
    </motion.div>
  );
}

export function SalesView({ isDark, t, L }: { isDark: boolean; t: T; L: 'es' | 'en' }) {
  const s = ui(isDark);
  const [list, setList] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Sale> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api<{ sales: Sale[]; products: Record<string, Product> }>('/api/studio/admin/crm/sales');
      setList(d.sales);
      setProducts(d.products);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      await api('/api/studio/admin/crm/sales', editing);
      setEditing(null);
      await load(); // recalcula tramos de comisión de todo el mes
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const month = new Date().toISOString().slice(0, 7);
  const active = list.filter((x) => x.status !== 'reembolsado');
  const collectedMonth = active.filter((x) => x.date.startsWith(month)).reduce((a, x) => a + x.paidUsd, 0);
  const receivable = active.reduce((a, x) => a + x.balanceUsd, 0);
  const commissionsDue = list.filter((x) => x.commissionDue).reduce((a, x) => a + x.commissionUsd, 0);
  const referralsDue = list.filter((x) => x.referralDue).reduce((a, x) => a + x.referralUsd, 0);
  const set = (k: keyof Sale, v: any) => setEditing((e) => ({ ...e, [k]: v }));
  const product = editing?.productId ? products[editing.productId] : undefined;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi i={0} isDark={isDark} icon={Wallet} tint="bg-emerald-50 text-emerald-600" label={t('Cobrado este mes', 'Collected this month')} value={usd(collectedMonth)} sub={t('Ventas fechadas este mes', 'Sales dated this month')} />
        <Kpi i={1} isDark={isDark} icon={Clock} tint="bg-amber-50 text-amber-700" label={t('Por cobrar', 'Receivable')} value={usd(receivable)} sub={t('Saldos pendientes de todas las ventas', 'Open balances')} />
        <Kpi i={2} isDark={isDark} icon={BadgePercent} tint="bg-blue-50 text-[#0071E3]" label={t('Comisiones por pagar', 'Commissions due')} value={usd(commissionsDue)} sub={t('Ventas pagadas y fuera del plazo de reembolso', 'Paid and past refund window')} />
        <Kpi i={3} isDark={isDark} icon={Gift} tint="bg-violet-50 text-violet-600" label={t('Referidos por pagar', 'Referrals due')} value={usd(referralsDue)} sub={t('10% del curso o del modelo de negocio', '10% of course or business model')} />
      </div>

      <div className={`${s.card} overflow-hidden`}>
        <div className="p-5 pb-3 flex justify-between items-end gap-3">
          <div>
            <h3 className={s.heading}>{t('Ventas', 'Sales')}</h3>
            <p className={`text-xs ${s.faint}`}>{t('Comisión: Lobo 5 / 7,5 / 10% y Oso 15 / 20 / 25% según sus ventas del mes. León y Águila: solo referidos.', 'Commission tiers by monthly sales; Lions and Eagles earn referrals only.')}</p>
          </div>
          <button type="button" onClick={() => setEditing({ productId: 'curso', priceUsd: products.curso?.price ?? 2000, paidUsd: 0, status: 'pendiente', date: new Date().toISOString().slice(0, 10), sellerType: '' })} className={`${s.primaryButton} !px-3.5 !py-1.5 !text-xs shrink-0`}>
            <Plus className="w-3.5 h-3.5" /> {t('Nueva venta', 'New sale')}
          </button>
        </div>
        {loading ? (
          <div className={`h-24 m-5 rounded-xl animate-pulse ${s.soft}`} />
        ) : list.length === 0 ? (
          <p className={`px-5 pb-6 text-sm ${s.muted}`}>{t('Aún no hay ventas. Registra la primera o acepta una propuesta.', 'No sales yet.')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className={`text-left text-xs ${s.muted} ${s.soft}`}>
                <tr>
                  {[t('Estado', 'Status'), t('Fecha', 'Date'), t('Producto', 'Product'), t('Comprador', 'Buyer'), t('Precio', 'Price'), t('Saldo', 'Balance'), t('Comisión', 'Commission'), t('Referido', 'Referral')].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((x) => (
                  <tr key={x.id} onClick={() => setEditing(x)} className={`cursor-pointer border-t ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-black/[0.05] hover:bg-black/[0.02]'}`}>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${SALE_STATUS[x.status].tint}`}>{SALE_STATUS[x.status][L]}</span></td>
                    <td className={`px-4 py-3 whitespace-nowrap ${s.muted}`}>{x.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{x.productName}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{x.buyerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{usd(x.priceUsd)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{x.balanceUsd ? usd(x.balanceUsd) : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {x.commissionUsd ? (
                        <>
                          {usd(x.commissionUsd)} <span className={s.faint}>{x.appliedCommissionPct}%</span>
                          {x.commissionPaid ? <span className="ml-1 text-emerald-600">· {t('pagada', 'paid')}</span> : x.commissionDue ? <span className="ml-1 text-[#0071E3] font-semibold">· {t('por pagar', 'due')}</span> : null}
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {x.referralUsd ? (
                        <>
                          {usd(x.referralUsd)} 
                          {x.referralPaid ? <span className="ml-1 text-emerald-600">· {t('pagado', 'paid')}</span> : x.referralDue ? <span className="ml-1 text-violet-600 font-semibold">· {t('por pagar', 'due')}</span> : null}
                        </>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <Drawer key={editing.id || 'new'} title={editing.id ? t('Venta', 'Sale') : t('Nueva venta', 'New sale')} isDark={isDark} t={t} onClose={() => setEditing(null)} onSubmit={save} busy={busy}>
            <div>
              <label htmlFor="sale-product" className={s.label}>{t('Producto', 'Product')}</label>
              <select id="sale-product" value={editing.productId} onChange={(e) => { const p = products[e.target.value]; setEditing((x) => ({ ...x, productId: e.target.value, priceUsd: p?.price ?? x?.priceUsd })); }} className={s.input}>
                {(Object.entries(products) as [string, Product][]).map(([id, p]) => (
                  <option key={id} value={id}>{p.name}{p.price ? ` · ${usd(p.price)}` : ''}</option>
                ))}
              </select>
              {product && product.initialPct > 0 && (
                <p className={`text-xs mt-1 ${s.faint}`}>{t(`Inicial ${product.initialPct}%: ${usd(((editing.priceUsd || 0) * product.initialPct) / 100)}; el resto con tarjeta.`, `Deposit ${product.initialPct}%.`)}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sale-buyer" className={s.label}>{t('Comprador', 'Buyer')}</label>
                <input id="sale-buyer" required value={editing.buyerName || ''} onChange={(e) => set('buyerName', e.target.value)} className={s.input} />
              </div>
              <div>
                <label htmlFor="sale-contact" className={s.label}>{t('Contacto', 'Contact')}</label>
                <input id="sale-contact" value={editing.buyerContact || ''} onChange={(e) => set('buyerContact', e.target.value)} className={s.input} />
              </div>
              <div>
                <label htmlFor="sale-date" className={s.label}>{t('Fecha', 'Date')}</label>
                <input id="sale-date" type="date" value={editing.date || ''} onChange={(e) => set('date', e.target.value)} className={s.input} />
              </div>
              <div>
                <label htmlFor="sale-status" className={s.label}>{t('Estado', 'Status')}</label>
                <select id="sale-status" value={editing.status} onChange={(e) => set('status', e.target.value)} className={s.input}>
                  {Object.entries(SALE_STATUS).map(([id, v]) => <option key={id} value={id}>{v[L]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="sale-price" className={s.label}>{t('Precio (USD)', 'Price (USD)')}</label>
                <input id="sale-price" type="number" min="0" step="0.01" value={editing.priceUsd ?? 0} onChange={(e) => set('priceUsd', Number(e.target.value))} className={s.input} />
              </div>
              <div>
                <label htmlFor="sale-paid" className={s.label}>{t('Pagado (USD)', 'Paid (USD)')}</label>
                <input id="sale-paid" type="number" min="0" step="0.01" value={editing.paidUsd ?? 0} onChange={(e) => set('paidUsd', Number(e.target.value))} className={s.input} />
              </div>
            </div>
            <div className={`rounded-xl p-3 space-y-3 ${s.soft}`}>
              <div className="text-xs font-semibold">{t('Vendedor y comisión', 'Seller and commission')}</div>
              <div className="grid grid-cols-2 gap-3">
                <input aria-label={t('Vendedor', 'Seller')} placeholder={t('Nombre del vendedor', 'Seller name')} value={editing.sellerName || ''} onChange={(e) => set('sellerName', e.target.value)} className={s.input} />
                <select aria-label={t('Tipo', 'Type')} value={editing.sellerType || ''} onChange={(e) => set('sellerType', e.target.value)} className={s.input}>
                  {Object.entries(SELLER).map(([id, v]) => <option key={id} value={id}>{v[L]}</option>)}
                </select>
                <input aria-label={t('Comisión %', 'Commission %')} type="number" min="0" max="100" step="0.5" placeholder={t('% auto', 'auto %')} value={editing.commissionPct ?? ''} onChange={(e) => set('commissionPct', e.target.value === '' ? null : Number(e.target.value))} className={s.input} />
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={Boolean(editing.commissionPaid)} onChange={(e) => set('commissionPaid', e.target.checked)} /> {t('Comisión pagada', 'Commission paid')}
                </label>
              </div>
            </div>
            <div className={`rounded-xl p-3 space-y-3 ${s.soft}`}>
              <div className="text-xs font-semibold">{t('Referido (10% del curso o del modelo)', 'Referral (10%)')}</div>
              <div className="grid grid-cols-2 gap-3">
                <input aria-label={t('Quién refirió', 'Referrer')} placeholder={t('Quién lo refirió', 'Referrer')} value={editing.referrerName || ''} onChange={(e) => set('referrerName', e.target.value)} className={s.input} />
                <input aria-label={t('Código de referido', 'Referral code')} placeholder={t('Código', 'Code')} value={editing.referralCode || ''} onChange={(e) => set('referralCode', e.target.value)} className={s.input} />
                <label className="flex items-center gap-2 text-xs cursor-pointer col-span-2">
                  <input type="checkbox" checked={Boolean(editing.referralPaid)} onChange={(e) => set('referralPaid', e.target.checked)} /> {t('Referido pagado', 'Referral paid')}
                </label>
              </div>
              <p className={`text-[11px] ${s.faint}`}>{t('Comisión y referido se marcan "por pagar" cuando la venta está pagada completa y pasaron 14 días.', 'Due once fully paid and 14 days have passed.')}</p>
            </div>
            <div>
              <label htmlFor="sale-notes" className={s.label}>{t('Notas', 'Notes')}</label>
              <textarea id="sale-notes" rows={3} value={editing.notes || ''} onChange={(e) => set('notes', e.target.value)} className={`${s.input} resize-none`} />
            </div>
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProposalsView({ isDark, t, L }: { isDark: boolean; t: T; L: 'es' | 'en' }) {
  const s = ui(isDark);
  const [list, setList] = useState<Proposal[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Proposal> | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, sl] = await Promise.all([
        api<{ proposals: Proposal[] }>('/api/studio/admin/crm/proposals'),
        api<{ products: Record<string, Product> }>('/api/studio/admin/crm/sales'),
      ]);
      setList(p.proposals);
      setProducts(sl.products);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      const d = await api<{ proposal: Proposal }>('/api/studio/admin/crm/proposals', editing);
      if (d.proposal.saleId && !editing.saleId) setNotice(t('Propuesta aceptada: se creó la venta en "Ventas y comisiones".', 'Accepted: a sale was created.'));
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const open = list.filter((p) => ['enviada', 'negociacion'].includes(p.status));
  const won = list.filter((p) => p.status === 'aceptada');
  const set = (k: keyof Proposal, v: any) => setEditing((e) => ({ ...e, [k]: v }));
  const decided = list.filter((p) => ['aceptada', 'rechazada'].includes(p.status)).length;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 p-3">{notice}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi i={0} isDark={isDark} icon={FileSignature} tint="bg-blue-50 text-[#0071E3]" label={t('Propuestas abiertas', 'Open proposals')} value={String(open.length)} sub={usd(open.reduce((a, p) => a + p.amountUsd, 0))} />
        <Kpi i={1} isDark={isDark} icon={Wallet} tint="bg-emerald-50 text-emerald-600" label={t('Aceptadas', 'Accepted')} value={String(won.length)} sub={usd(won.reduce((a, p) => a + p.amountUsd, 0))} />
        <Kpi i={2} isDark={isDark} icon={BadgePercent} tint="bg-violet-50 text-violet-600" label={t('Tasa de cierre', 'Close rate')} value={decided ? `${Math.round((won.length / decided) * 100)}%` : '—'} sub={t('Aceptadas entre aceptadas y rechazadas', 'Accepted / decided')} />
      </div>
      <div className={`${s.card} overflow-hidden`}>
        <div className="p-5 pb-3 flex justify-between items-end">
          <div>
            <h3 className={s.heading}>{t('Propuestas', 'Proposals')}</h3>
            <p className={`text-xs ${s.faint}`}>{t('Al marcar una propuesta como aceptada se crea su venta automáticamente.', 'Accepting a proposal creates its sale.')}</p>
          </div>
          <button type="button" onClick={() => setEditing({ packageId: 'web-profesional', amountUsd: products['web-profesional']?.price ?? 1000, status: 'borrador' })} className={`${s.primaryButton} !px-3.5 !py-1.5 !text-xs`}>
            <Plus className="w-3.5 h-3.5" /> {t('Nueva propuesta', 'New proposal')}
          </button>
        </div>
        {loading ? (
          <div className={`h-24 m-5 rounded-xl animate-pulse ${s.soft}`} />
        ) : list.length === 0 ? (
          <p className={`px-5 pb-6 text-sm ${s.muted}`}>{t('Aún no hay propuestas.', 'No proposals yet.')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className={`text-left text-xs ${s.muted} ${s.soft}`}>
                <tr>
                  {[t('Estado', 'Status'), t('Cliente', 'Client'), t('Paquete', 'Package'), t('Monto', 'Amount'), t('Válida hasta', 'Valid until'), t('Extras', 'Extras')].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} onClick={() => setEditing(p)} className={`cursor-pointer border-t ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-black/[0.05] hover:bg-black/[0.02]'}`}>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PROPOSAL_STATUS[p.status].tint}`}>{PROPOSAL_STATUS[p.status][L]}</span></td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{p.clientName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{products[p.packageId]?.name || p.packageId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{usd(p.amountUsd)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${s.muted}`}>{p.validUntil || '—'}</td>
                    <td className={`px-4 py-3 truncate max-w-[220px] ${s.muted}`}>{p.extras || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <Drawer key={editing.id || 'new'} title={editing.id ? t('Propuesta', 'Proposal') : t('Nueva propuesta', 'New proposal')} isDark={isDark} t={t} onClose={() => setEditing(null)} onSubmit={save} busy={busy}>
            <div>
              <label htmlFor="prop-client" className={s.label}>{t('Cliente', 'Client')}</label>
              <input id="prop-client" required value={editing.clientName || ''} onChange={(e) => set('clientName', e.target.value)} className={s.input} />
            </div>
            <div>
              <label htmlFor="prop-package" className={s.label}>{t('Paquete o producto', 'Package or product')}</label>
              <select id="prop-package" value={editing.packageId} onChange={(e) => { const p = products[e.target.value]; setEditing((x) => ({ ...x, packageId: e.target.value, amountUsd: p?.price ?? x?.amountUsd })); }} className={s.input}>
                {(Object.entries(products) as [string, Product][]).map(([id, p]) => <option key={id} value={id}>{p.name}{p.price ? ` · ${usd(p.price)}` : ''}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="prop-amount" className={s.label}>{t('Monto total (USD)', 'Total (USD)')}</label>
                <input id="prop-amount" type="number" min="0" step="0.01" value={editing.amountUsd ?? 0} onChange={(e) => set('amountUsd', Number(e.target.value))} className={s.input} />
              </div>
              <div>
                <label htmlFor="prop-valid" className={s.label}>{t('Válida hasta', 'Valid until')}</label>
                <input id="prop-valid" type="date" value={editing.validUntil || ''} onChange={(e) => set('validUntil', e.target.value)} className={s.input} />
              </div>
            </div>
            <div>
              <label htmlFor="prop-status" className={s.label}>{t('Estado', 'Status')}</label>
              <select id="prop-status" value={editing.status} onChange={(e) => set('status', e.target.value)} className={s.input} disabled={Boolean(editing.saleId)}>
                {Object.entries(PROPOSAL_STATUS).map(([id, v]) => <option key={id} value={id}>{v[L]}</option>)}
              </select>
              {editing.saleId && <p className={`text-xs mt-1 ${s.faint}`}>{t('Ya se creó su venta.', 'Its sale was created.')}</p>}
            </div>
            <div>
              <label htmlFor="prop-extras" className={s.label}>{t('Extras incluidos', 'Included extras')}</label>
              <input id="prop-extras" value={editing.extras || ''} onChange={(e) => set('extras', e.target.value)} placeholder={t('Ej.: chatbot, dominio, mantenimiento', 'E.g. chatbot, domain')} className={s.input} />
            </div>
            <div>
              <label htmlFor="prop-notes" className={s.label}>{t('Notas', 'Notes')}</label>
              <textarea id="prop-notes" rows={3} value={editing.notes || ''} onChange={(e) => set('notes', e.target.value)} className={`${s.input} resize-none`} />
            </div>
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}
