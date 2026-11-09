import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Check,
  ExternalLink,
  Ban,
  Wallet,
  Megaphone,
  CalendarDays,
  FileSignature,
  Briefcase,
  RefreshCw,
  FileText,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Trophy,
} from 'lucide-react';
import { Language } from '../../types';
import { ui } from '../../ui/tokens';
import { RUBROS } from '../../constants/rubros';
import { SalesView, ProposalsView } from './SalesViews';
import { DocsView } from './DocsView';

// CRM interno de 4haus (solo el equipo). Empieza vacío y se llena con datos reales:
// solicitudes de llamada, pedidos de código, códigos canjeados y negocios buscados.

type Kind = 'creador' | 'empresa';
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
  consent: 'pidio-contacto' | 'negocio-publico' | 'ninguno';
  origin: { type: string; refId?: string; sourceUrl?: string };
  createdAt: string;
  updatedAt: string;
}

const STAGES: Record<Kind, { id: string; es: string; en: string }[]> = {
  creador: [
    { id: 'nuevo', es: 'Nuevo', en: 'New' },
    { id: 'contactado', es: 'Contactado', en: 'Contacted' },
    { id: 'codigo-enviado', es: 'Código enviado', en: 'Code sent' },
    { id: 'activo', es: 'Activo', en: 'Active' },
    { id: 'vendio', es: 'Vendió su 1.ª web', en: 'First sale' },
    { id: 'perdido', es: 'Perdido', en: 'Lost' },
  ],
  empresa: [
    { id: 'nuevo', es: 'Nuevo', en: 'New' },
    { id: 'llamada', es: 'Llamada', en: 'Call' },
    { id: 'propuesta', es: 'Propuesta', en: 'Proposal' },
    { id: 'ganado', es: 'Ganado', en: 'Won' },
    { id: 'perdido', es: 'Perdido', en: 'Lost' },
  ],
};



type Tab = 'panel' | 'leads' | 'pipeline' | 'buscar' | 'ventas' | 'propuestas' | 'documentos';

interface Props {
  lang: Language;
  themeMode?: 'light' | 'dark';
}

export function CrmApp({ lang, themeMode = 'light' }: Props) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const L = isEn ? 'en' : 'es';

  const [tab, setTab] = useState<Tab>('panel');
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<CrmContact> | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/studio/admin/crm');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('No pude cargar el CRM.', 'Could not load the CRM.'));
      setContacts((data as any).contacts || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save(c: Partial<CrmContact>): Promise<CrmContact | null> {
    const res = await fetch('/api/studio/admin/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as any).error || t('No pude guardar.', 'Could not save.'));
      return null;
    }
    const saved = (data as any).contact as CrmContact;
    setContacts((list) => [saved, ...list.filter((x) => x.id !== saved.id)]);
    return saved;
  }

  const stageLabel = (c: Pick<CrmContact, 'kind' | 'stage'>) => STAGES[c.kind].find((st) => st.id === c.stage)?.[L] || c.stage;

  const [globalQuery, setGlobalQuery] = useState('');
  type NavItem = { id?: Tab; label: string; icon: any };
  const nav: { group: string; items: NavItem[] }[] = [
    { group: 'General', items: [{ id: 'panel', label: t('Panel', 'Dashboard'), icon: LayoutDashboard }, { id: 'leads', label: t('Leads (todos)', 'Leads (all)'), icon: Users }] },
    { group: t('Clientes', 'Clients'), items: [{ id: 'pipeline', label: 'Pipeline', icon: KanbanSquare }, { id: 'buscar', label: t('Buscar clientes', 'Find clients'), icon: Search }] },
    { group: t('Ventas', 'Sales'), items: [{ id: 'ventas', label: t('Ventas y comisiones', 'Sales & commissions'), icon: Wallet }, { id: 'propuestas', label: t('Propuestas', 'Proposals'), icon: FileSignature }] },
    { group: 'Marketing', items: [{ label: t('Campañas', 'Campaigns'), icon: Megaphone }, { label: t('Agenda', 'Calendar'), icon: CalendarDays }] },
    { group: t('Equipo', 'Team'), items: [{ label: t('Colaboradores', 'Collaborators'), icon: Briefcase }, { id: 'documentos', label: t('Documentos', 'Documents'), icon: FileText }] },
  ];
  const current = nav.flatMap((g) => g.items).find((i) => i.id === tab);
  const border = isDark ? 'border-white/10' : 'border-black/[0.08]';

  const navButton = (item: NavItem) => {
    const Icon = item.icon;
    const active = item.id === tab;
    const soon = !item.id;
    return (
      <button
        key={item.label}
        type="button"
        disabled={soon}
        onClick={() => item.id && setTab(item.id)}
        aria-current={active ? 'page' : undefined}
        className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-left cursor-pointer disabled:cursor-default ${
          active ? (isDark ? 'text-black font-semibold' : 'text-white font-semibold') : soon ? s.faint : isDark ? 'text-zinc-300 hover:bg-white/5' : 'text-[#1D1D1F] hover:bg-black/[0.03]'
        }`}
      >
        {active && <motion.span layoutId="crm-nav" className={`absolute inset-0 rounded-xl ${isDark ? 'bg-white' : 'bg-[#1D1D1F]'}`} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
        <Icon className="w-4 h-4 relative shrink-0" />
        <span className="relative truncate flex-1">{item.label}</span>
        {soon && <span className={`relative text-[10px] px-1.5 py-0.5 rounded-md ${s.soft}`}>{t('Pronto', 'Soon')}</span>}
      </button>
    );
  };

  return (
    <div className={`w-full flex rounded-2xl border overflow-hidden min-h-[82vh] ${border} ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
      {/* Menú del CRM, agrupado como el backoffice de AMOOO */}
      <aside className={`hidden md:flex w-60 shrink-0 flex-col border-r ${border}`}>
        <div className={`h-14 px-4 flex items-center gap-2 border-b ${border}`}>
          <span className="text-[15px] font-bold tracking-tight">4HAUS</span>
          <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md border ${border} ${s.muted}`}>CRM</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {nav.map((g) => (
            <div key={g.group} className="space-y-0.5">
              <div className={`px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider ${s.faint}`}>{g.group}</div>
              {g.items.map(navButton)}
            </div>
          ))}
        </div>
        <div className={`p-4 border-t text-xs ${border}`}>
          <div className="font-semibold">{t('Equipo 4haus', '4haus team')}</div>
          <div className={s.faint}>{t('Administrador', 'Administrator')}</div>
        </div>
      </aside>

      <div className={`flex-1 min-w-0 flex flex-col ${isDark ? 'bg-black/40' : 'bg-[#FAFAFA]'}`}>
        {/* Barra superior: ruta, buscador global y acciones */}
        <div className={`h-14 px-4 sm:px-6 flex items-center gap-3 border-b ${border} ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
          <div className={`hidden sm:block text-xs whitespace-nowrap ${s.muted}`}>
            CRM <span className="mx-1">›</span> <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{current?.label}</span>
          </div>
          <form
            className="flex-1 flex justify-center"
            onSubmit={(e) => {
              e.preventDefault();
              setTab('leads');
            }}
          >
            <label className={`w-full max-w-md flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${border} ${isDark ? 'bg-white/5' : 'bg-[#F5F5F7]'}`}>
              <Search className={`w-3.5 h-3.5 ${s.faint}`} />
              <input
                value={globalQuery}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  if (e.target.value && tab !== 'leads') setTab('leads');
                }}
                placeholder={t('Buscar creadores, empresas, ciudades…', 'Search creators, companies, cities…')}
                className="flex-1 bg-transparent outline-none"
                aria-label={t('Buscar en el CRM', 'Search the CRM')}
              />
            </label>
          </form>
          <button type="button" onClick={load} className={s.iconButton} aria-label={t('Actualizar', 'Refresh')} title={t('Actualizar', 'Refresh')}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={() => setEditing({ kind: 'empresa', stage: 'nuevo' })} className={`${s.primaryButton} !px-3.5 !py-1.5 !text-xs`}>
            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('Añadir contacto', 'Add contact')}</span>
          </button>
        </div>

        {/* En el celular el menú pasa a una fila deslizable */}
        <nav className={`md:hidden flex gap-1 overflow-x-auto p-2 border-b ${border}`} aria-label="CRM">
          {nav.flatMap((g) => g.items).filter((i) => i.id).map((i) => (
            <button key={i.label} type="button" onClick={() => setTab(i.id!)} className={s.chip(tab === i.id)}>
              {i.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 p-4 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError(null)} className="p-1 cursor-pointer" aria-label={t('Cerrar', 'Close')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {loading && contacts.length === 0 ? (
                <SkeletonRows isDark={isDark} />
              ) : tab === 'panel' ? (
                <Panel contacts={contacts} isDark={isDark} t={t} stageLabel={stageLabel} onOpen={setEditing} onGo={setTab} />
              ) : tab === 'leads' ? (
                <Leads contacts={contacts} isDark={isDark} t={t} stageLabel={stageLabel} onOpen={setEditing} q={globalQuery} setQ={setGlobalQuery} />
              ) : tab === 'documentos' ? (
                <DocsView isDark={isDark} t={t} L={L} />
              ) : tab === 'ventas' ? (
                <SalesView isDark={isDark} t={t} L={L} />
              ) : tab === 'propuestas' ? (
                <ProposalsView isDark={isDark} t={t} L={L} />
              ) : tab === 'pipeline' ? (
                <Pipeline contacts={contacts} isDark={isDark} t={t} L={L} onOpen={setEditing} onMove={(c, stage) => save({ id: c.id, kind: c.kind, stage })} />
              ) : (
                <Prospect isDark={isDark} t={t} onSave={save} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div key={editing.id || 'new'} className="fixed inset-0 z-[70] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Editor
              value={editing}
              isDark={isDark}
              t={t}
              L={L}
              onClose={() => setEditing(null)}
              onSave={async (c) => {
                const ok = await save(c);
                if (ok) setEditing(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type T = (es: string, en: string) => string;

function SkeletonRows({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`h-16 rounded-2xl animate-pulse ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]'}`} />
      ))}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
function needsAttention(c: CrmContact) {
  if (c.doNotContact || ['perdido', 'ganado', 'vendio'].includes(c.stage)) return false;
  if (c.nextActionAt && c.nextActionAt <= today()) return true;
  const days = (Date.now() - new Date(c.createdAt).getTime()) / 86_400_000;
  return c.stage === 'nuevo' && !c.nextAction && days >= 2;
}

const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function Alert({ tone, title, desc, onClick, onClose }: { key?: string; tone: 'amber' | 'red'; title: string; desc: string; onClick?: () => void; onClose: () => void }) {
  const c = tone === 'red' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-900';
  return (
    <motion.div layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-xl border-l-4 border p-3.5 flex gap-2.5 ${c}`}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <button type="button" onClick={onClick} className="flex-1 text-left cursor-pointer">
        <div className="text-[13px] font-semibold">{title}</div>
        <div className="text-xs opacity-80">{desc}</div>
      </button>
      <button type="button" onClick={onClose} className="p-1 h-fit opacity-60 hover:opacity-100 cursor-pointer" aria-label="Cerrar">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

function Bars({ rows, isDark, color = '#0071E3' }: { rows: { label: string; value: number; sub?: string }[]; isDark: boolean; color?: string }) {
  const s = ui(isDark);
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className="text-[13px]">
          <div className="flex justify-between gap-2">
            <span className="truncate">{r.label}</span>
            <span className="font-semibold">{r.sub ?? r.value}</span>
          </div>
          <div className={`h-1.5 mt-1.5 rounded-full ${s.soft}`}>
            <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${(r.value / max) * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function LineChart({ series, labels, isDark }: { series: { name: string; color: string; values: number[] }[]; labels: string[]; isDark: boolean }) {
  const W = 640;
  const H = 200;
  const P = { l: 28, r: 20, t: 10, b: 22 };
  const max = Math.max(1, ...series.flatMap((x) => x.values));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, labels.length - 1);
  const y = (v: number) => H - P.b - (v / top) * (H - P.t - P.b);
  const grid = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const text = isDark ? '#71717a' : '#86868B';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Contactos nuevos por día">
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={P.l} x2={W - P.r} y1={y(k * step)} y2={y(k * step)} stroke={grid} />
          <text x={P.l - 6} y={y(k * step) + 3} fontSize="9" textAnchor="end" fill={text}>{k * step}</text>
        </g>
      ))}
      {labels.map((l, i) => (i % 5 === 0 || i === labels.length - 1 ? <text key={l} x={x(i)} y={H - 6} fontSize="9" textAnchor="middle" fill={text}>{l}</text> : null))}
      {series.map((sr) => {
        const d = sr.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
        return (
          <g key={sr.name}>
            <path d={`${d} L${x(sr.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={sr.color} opacity="0.08" />
            <motion.path d={d} fill="none" stroke={sr.color} strokeWidth="2" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
          </g>
        );
      })}
    </svg>
  );
}

function Panel({ contacts, isDark, t, stageLabel, onOpen, onGo }: { contacts: CrmContact[]; isDark: boolean; t: T; stageLabel: (c: CrmContact) => string; onOpen: (c: CrmContact) => void; onGo: (tab: Tab) => void }) {
  const s = ui(isDark);
  const [hidden, setHidden] = useState<string[]>([]);
  const creators = contacts.filter((c) => c.kind === 'creador');
  const companies = contacts.filter((c) => c.kind === 'empresa');
  const openCompanies = companies.filter((c) => !['ganado', 'perdido'].includes(c.stage));
  const now = Date.now();
  const inRange = (c: CrmContact, from: number, to: number) => {
    const ts = new Date(c.createdAt).getTime();
    return ts >= from && ts < to;
  };
  const last30 = contacts.filter((c) => inRange(c, now - 30 * DAY, now + DAY)).length;
  const prev30 = contacts.filter((c) => inRange(c, now - 60 * DAY, now - 30 * DAY)).length;
  const change = prev30 ? Math.round(((last30 - prev30) / prev30) * 100) : null;

  const overdue = contacts.filter((c) => !c.doNotContact && c.nextActionAt && c.nextActionAt <= today() && !['perdido', 'ganado', 'vendio'].includes(c.stage));
  const stale = contacts.filter((c) => needsAttention(c) && !overdue.includes(c));
  const waiting = creators.filter((c) => c.stage === 'codigo-enviado' && c.origin?.type !== 'manual');

  const kpis = [
    { label: t('Contactos nuevos (30 días)', 'New contacts (30 days)'), value: String(last30), sub: prev30 ? t(`vs. 30 días anteriores: ${prev30}`, `vs. previous 30 days: ${prev30}`) : t('Sin periodo anterior', 'No previous period'), change, icon: Users, tint: 'bg-blue-50 text-[#0071E3]' },
    { label: t('Creadores activos', 'Active creators'), value: String(creators.filter((c) => ['activo', 'vendio'].includes(c.stage)).length), sub: t(`${creators.length} creadores en total`, `${creators.length} creators total`), icon: Sparkles, tint: 'bg-violet-50 text-violet-600' },
    { label: t('Valor en pipeline', 'Pipeline value'), value: `${openCompanies.reduce((a, c) => a + (c.valueUsd || 0), 0).toLocaleString('en-US')} USD`, sub: t(`${openCompanies.length} empresas en curso`, `${openCompanies.length} open companies`), icon: DollarSign, tint: 'bg-emerald-50 text-emerald-600' },
    { label: t('Empresas ganadas', 'Companies won'), value: String(companies.filter((c) => c.stage === 'ganado').length), sub: `${companies.filter((c) => c.stage === 'ganado').reduce((a, c) => a + (c.valueUsd || 0), 0).toLocaleString('en-US')} USD`, icon: Trophy, tint: 'bg-orange-50 text-orange-600' },
  ];

  const days = Array.from({ length: 30 }, (_, i) => new Date(now - (29 - i) * DAY));
  const perDay = (kind: Kind) => days.map((d) => contacts.filter((c) => c.kind === kind && c.createdAt.slice(0, 10) === dayKey(d)).length);
  const labels = days.map((d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);

  const bySource = Object.entries(contacts.reduce<Record<string, number>>((acc, c) => ((acc[c.source || t('Sin origen', 'No source')] = (acc[c.source || t('Sin origen', 'No source')] || 0) + 1), acc), {})).sort((a, b) => b[1] - a[1]);
  const stageRows = (kind: Kind) => STAGES[kind].map((st) => ({ label: st[isDarkL(t)], value: contacts.filter((c) => c.kind === kind && c.stage === st.id).length }));

  if (contacts.length === 0) {
    return (
      <div className={`${s.card} p-10 text-center space-y-2`}>
        <p className={s.heading}>{t('Aún no hay contactos', 'No contacts yet')}</p>
        <p className={`text-sm ${s.muted}`}>
          {t('Aparecerán solos cuando una empresa agende una llamada o un creador pida su código. También puedes buscar negocios en "Buscar clientes".', 'They appear automatically when a company books a call or a creator requests a code. You can also find businesses in "Find clients".')}
        </p>
        <button type="button" onClick={() => onGo('buscar')} className={`${s.primaryButton} mt-2`}>
          <Search className="w-4 h-4" /> {t('Buscar clientes', 'Find clients')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {overdue.length > 0 && !hidden.includes('overdue') && (
          <Alert key="overdue" tone="red" title={t(`${overdue.length} contacto(s) con la próxima acción vencida`, `${overdue.length} contact(s) with an overdue next step`)} desc={t('Revísalos hoy para no perder la oportunidad.', 'Review them today.')} onClick={() => onOpen(overdue[0])} onClose={() => setHidden((h) => [...h, 'overdue'])} />
        )}
        {stale.length > 0 && !hidden.includes('stale') && (
          <Alert key="stale" tone="amber" title={t(`${stale.length} contacto(s) nuevo(s) sin seguimiento`, `${stale.length} new contact(s) without follow-up`)} desc={t('Llevan más de 2 días sin próxima acción. Asígnales una.', 'Over 2 days without a next step.')} onClick={() => onOpen(stale[0])} onClose={() => setHidden((h) => [...h, 'stale'])} />
        )}
        {waiting.length > 0 && !hidden.includes('waiting') && (
          <Alert key="waiting" tone="amber" title={t(`${waiting.length} creador(es) esperando aprobación`, `${waiting.length} creator(s) awaiting approval`)} desc={t('Canjearon su código. Apruébalos en la sección Creadores.', 'They redeemed their code. Approve them in Creators.')} onClick={() => window.dispatchEvent(new CustomEvent('4haus:navigate', { detail: 'creadores' }))} onClose={() => setHidden((h) => [...h, 'waiting'])} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }} className={`${s.card} p-5`}>
              <div className="flex justify-between items-start">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${k.tint}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {k.change !== undefined && k.change !== null && (
                  <span className={`text-[11px] font-semibold ${k.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {k.change >= 0 ? '↗' : '↘'} {Math.abs(k.change)}%
                  </span>
                )}
              </div>
              <div className={`text-xs mt-3 ${s.muted}`}>{k.label}</div>
              <div className={`text-2xl font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{k.value}</div>
              <div className={`text-[11px] mt-1 ${s.faint}`}>{k.sub}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className={`${s.card} p-5 xl:col-span-2`}>
          <h3 className={s.heading}>{t('Contactos nuevos por día', 'New contacts per day')}</h3>
          <p className={`text-xs mb-3 ${s.faint}`}>{t('Últimos 30 días', 'Last 30 days')}</p>
          <LineChart labels={labels} isDark={isDark} series={[{ name: 'creadores', color: '#7C3AED', values: perDay('creador') }, { name: 'empresas', color: '#0071E3', values: perDay('empresa') }]} />
          <div className={`flex justify-center gap-5 text-[11px] mt-2 ${s.muted}`}>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-600" /> {t('Creadores', 'Creators')}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0071E3]" /> {t('Empresas', 'Companies')}</span>
          </div>
        </div>
        <div className={`${s.card} p-5`}>
          <h3 className={s.heading}>{t('Pipeline de empresas', 'Company pipeline')}</h3>
          <p className={`text-xs mb-4 ${s.faint}`}>{t('Por etapa', 'By stage')}</p>
          <Bars isDark={isDark} rows={stageRows('empresa')} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className={`${s.card} p-5`}>
          <h3 className={`${s.heading} mb-4`}>{t('Creadores por etapa', 'Creators by stage')}</h3>
          <Bars isDark={isDark} rows={stageRows('creador')} color="#7C3AED" />
        </div>
        <div className={`${s.card} p-5`}>
          <h3 className={`${s.heading} mb-4`}>{t('De dónde llegan', 'Where they come from')}</h3>
          <Bars isDark={isDark} rows={bySource.map(([label, value]) => ({ label, value }))} color="#10B981" />
        </div>
        <div className={`${s.card} p-5`}>
          <h3 className={`${s.heading} mb-3`}>{t('Próximas acciones', 'Next steps')}</h3>
          {contacts.filter((c) => c.nextAction && !c.doNotContact).length === 0 ? (
            <p className={`text-sm ${s.muted}`}>{t('Sin acciones pendientes.', 'Nothing pending.')}</p>
          ) : (
            <ul className="space-y-1">
              {contacts
                .filter((c) => c.nextAction && !c.doNotContact)
                .sort((a, b) => (a.nextActionAt || '9').localeCompare(b.nextActionAt || '9'))
                .slice(0, 5)
                .map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => onOpen(c)} className={`w-full text-left p-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/[0.03]'}`}>
                      <div className="text-[13px] font-semibold truncate">{c.name || c.company}</div>
                      <div className={`text-xs truncate ${s.muted}`}>{c.nextAction}{c.nextActionAt ? ` · ${c.nextActionAt}` : ''}</div>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`${s.card} overflow-hidden`}>
        <div className="p-5 pb-3 flex justify-between items-end">
          <div>
            <h3 className={s.heading}>{t('Actividad reciente', 'Recent activity')}</h3>
            <p className={`text-xs ${s.faint}`}>{t('Movimientos más recientes', 'Latest changes')}</p>
          </div>
          <button type="button" onClick={() => onGo('leads')} className="text-xs font-semibold text-[#0071E3] cursor-pointer">{t('Ver todos ›', 'See all ›')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className={`text-left text-xs ${s.muted} ${s.soft}`}>
              <tr>
                {[t('Etapa', 'Stage'), t('Fecha', 'Date'), t('Nombre', 'Name'), t('Tipo', 'Type'), t('Origen', 'Source'), t('Valor', 'Value')].map((h) => (
                  <th key={h} className="px-5 py-2.5 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.slice(0, 8).map((c) => (
                <tr key={c.id} onClick={() => onOpen(c)} className={`cursor-pointer border-t ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-black/[0.05] hover:bg-black/[0.02]'}`}>
                  <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stageTint(c.stage)}`}>{stageLabel(c)}</span></td>
                  <td className={`px-5 py-3 whitespace-nowrap ${s.muted}`}>{c.updatedAt.slice(0, 10)}</td>
                  <td className="px-5 py-3 font-medium whitespace-nowrap">{c.name || c.company}</td>
                  <td className={`px-5 py-3 ${s.muted}`}>{c.kind === 'creador' ? t('Creador', 'Creator') : t('Empresa', 'Company')}</td>
                  <td className={`px-5 py-3 whitespace-nowrap ${s.muted}`}>{c.source}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{c.valueUsd ? `${c.valueUsd.toLocaleString('en-US')} USD` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const isDarkL = (t: T): 'es' | 'en' => (t('es', 'en') as 'es' | 'en');
function stageTint(stage: string) {
  if (['ganado', 'activo', 'vendio'].includes(stage)) return 'bg-emerald-50 text-emerald-700';
  if (stage === 'perdido') return 'bg-zinc-100 text-zinc-500';
  if (['propuesta', 'codigo-enviado', 'llamada'].includes(stage)) return 'bg-blue-50 text-[#0071E3]';
  return 'bg-amber-50 text-amber-800';
}

function Leads({ contacts, isDark, t, stageLabel, onOpen, q, setQ }: { contacts: CrmContact[]; isDark: boolean; t: T; stageLabel: (c: CrmContact) => string; onOpen: (c: CrmContact) => void; q: string; setQ: (v: string) => void }) {
  const s = ui(isDark);
  const [kind, setKind] = useState<'todos' | Kind>('todos');
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        (kind === 'todos' || c.kind === kind) &&
        (!needle || [c.name, c.company, c.contact, c.instagram, c.city, c.rubro].join(' ').toLowerCase().includes(needle)),
    );
  }, [contacts, q, kind]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Buscar por nombre, ciudad, rubro…', 'Search by name, city, industry…')} className={`${s.input} sm:max-w-sm`} aria-label={t('Buscar', 'Search')} />
        <div className="flex gap-2 items-center">
          {(['todos', 'creador', 'empresa'] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={s.chip(kind === k)}>
              {k === 'todos' ? t('Todos', 'All') : k === 'creador' ? t('Creadores', 'Creators') : t('Empresas', 'Companies')}
            </button>
          ))}
        </div>
      </div>
      <div className={`${s.card} overflow-hidden`}>
        {list.length === 0 ? (
          <p className={`p-6 text-sm ${s.muted}`}>{t('No hay contactos con ese filtro.', 'No contacts match.')}</p>
        ) : (
          <ul className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onOpen(c)} className={`w-full text-left px-5 py-3.5 grid grid-cols-12 gap-3 items-center cursor-pointer transition-colors ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}>
                  <div className="col-span-12 sm:col-span-4 min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                      {c.doNotContact && <Ban className="w-3.5 h-3.5 text-red-600 shrink-0" aria-label={t('No contactar', 'Do not contact')} />}
                      {c.name || c.company}
                    </div>
                    <div className={`text-xs truncate ${s.muted}`}>{[c.company && c.name ? c.company : '', c.instagram && `@${c.instagram}`, c.city].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className={`col-span-4 sm:col-span-2 text-xs ${s.muted}`}>{c.kind === 'creador' ? t('Creador', 'Creator') : t('Empresa', 'Company')}</div>
                  <div className="col-span-4 sm:col-span-2 text-xs font-medium">{stageLabel(c)}</div>
                  <div className={`col-span-4 sm:col-span-2 text-xs truncate ${s.faint}`}>{c.source}</div>
                  <div className={`hidden sm:block sm:col-span-2 text-xs truncate ${s.muted}`}>{c.nextAction || '—'}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Pipeline({ contacts, isDark, t, L, onOpen, onMove }: { contacts: CrmContact[]; isDark: boolean; t: T; L: 'es' | 'en'; onOpen: (c: CrmContact) => void; onMove: (c: CrmContact, stage: string) => void }) {
  const s = ui(isDark);
  const [kind, setKind] = useState<Kind>('creador');
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const list = contacts.filter((c) => c.kind === kind && !c.doNotContact);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['creador', 'empresa'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={s.chip(kind === k)}>
            {k === 'creador' ? t('Creadores', 'Creators') : t('Empresas', 'Companies')}
          </button>
        ))}
        <span className={`text-xs self-center ${s.faint}`}>{t('Arrastra las tarjetas para cambiar de etapa.', 'Drag cards to change stage.')}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES[kind].map((st) => {
          const items = list.filter((c) => c.stage === st.id);
          return (
            <div
              key={st.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(st.id);
              }}
              onDragLeave={() => setOver((o) => (o === st.id ? null : o))}
              onDrop={() => {
                const c = contacts.find((x) => x.id === dragId);
                if (c && c.stage !== st.id) onMove(c, st.id);
                setDragId(null);
                setOver(null);
              }}
              className={`w-60 shrink-0 rounded-2xl p-3 space-y-2 transition-colors ${over === st.id ? (isDark ? 'bg-white/10' : 'bg-black/[0.06]') : s.soft}`}
            >
              <div className="flex justify-between text-xs font-semibold px-1">
                <span>{st[L]}</span>
                <span className={s.faint}>{items.length}</span>
              </div>
              {items.map((c) => (
                <motion.button
                  layout
                  key={c.id}
                  type="button"
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onClick={() => onOpen(c)}
                  className={`${s.card} w-full text-left p-3 cursor-grab active:cursor-grabbing`}
                >
                  <div className="text-sm font-semibold truncate">{c.name || c.company}</div>
                  <div className={`text-xs truncate ${s.muted}`}>{c.kind === 'empresa' ? c.company || c.contact : c.instagram ? `@${c.instagram}` : c.contact}</div>
                  {c.valueUsd > 0 && <div className={`text-xs mt-1 ${s.faint}`}>{c.valueUsd.toLocaleString('en-US')} USD</div>}
                </motion.button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  alreadyInCrm?: boolean;
}

function Prospect({ isDark, t, onSave }: { isDark: boolean; t: T; onSave: (c: Partial<CrmContact>) => Promise<CrmContact | null> }) {
  const s = ui(isDark);
  const [rubro, setRubro] = useState(RUBROS[0]);
  const [custom, setCustom] = useState('');
  const [city, setCity] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [idealClient, setIdealClient] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Found[] | null>(null);
  const [meta, setMeta] = useState<{ costUsd: number; remainingToday: number } | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/studio/admin/crm/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubro: custom.trim() || rubro, city, quantity, idealClient }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('No pude buscar.', 'Search failed.'));
      setResults((data as any).businesses || []);
      setMeta({ costUsd: (data as any).costUsd || 0, remainingToday: (data as any).remainingToday ?? 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function keep(b: Found) {
    const ok = await onSave({
      kind: 'empresa',
      stage: 'nuevo',
      company: b.name,
      contact: b.phone,
      instagram: b.instagram,
      website: b.website,
      city: b.city,
      rubro: b.rubro,
      source: 'Buscar clientes',
      notes: [b.whyFit, b.address].filter(Boolean).join(' · '),
      consent: 'negocio-publico',
      origin: { type: 'prospeccion', sourceUrl: b.sourceUrl },
    });
    if (ok) setSaved((x) => new Set(x).add(b.sourceUrl + b.name));
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <form onSubmit={run} className={`${s.card} p-5 space-y-4 lg:col-span-2 h-fit`}>
        <div>
          <span className={s.label}>{t('Rubro', 'Industry')}</span>
          <div className="flex flex-wrap gap-1.5">
            {RUBROS.map((r) => (
              <button key={r} type="button" onClick={() => { setRubro(r); setCustom(''); }} aria-pressed={!custom && rubro === r} className={s.chip(!custom && rubro === r)}>
                {r}
              </button>
            ))}
          </div>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('…u otro rubro', '…or another industry')} className={`${s.input} mt-2`} aria-label={t('Otro rubro', 'Other industry')} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label htmlFor="crm-city" className={s.label}>{t('Ciudad', 'City')}</label>
            <input id="crm-city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Miami, FL" className={s.input} />
          </div>
          <div>
            <label htmlFor="crm-qty" className={s.label}>{t('Cantidad', 'How many')}</label>
            <select id="crm-qty" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={s.input}>
              {[3, 5, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="crm-ideal" className={s.label}>{t('Cliente ideal (opcional)', 'Ideal client (optional)')}</label>
          <textarea id="crm-ideal" rows={2} value={idealClient} onChange={(e) => setIdealClient(e.target.value)} placeholder={t('Ej.: negocios con buenas reseñas pero sin web o con web antigua', 'E.g. well-reviewed businesses with no or outdated website')} className={`${s.input} resize-none`} />
        </div>
        <button type="submit" disabled={busy} className={`${s.primaryButton} w-full`}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {busy ? t('Buscando en la web…', 'Searching the web…') : t('Buscar negocios', 'Find businesses')}
        </button>
        <p className={`text-xs ${s.faint}`}>
          {t(
            'Solo se muestran negocios encontrados en la búsqueda y los datos que ellos publican. Antes de llamar o escribir a un celular en EE. UU., revisa la lista "No llamar"; en Perú, "Gracias… No insista".',
            'Only businesses found in the search and the data they publish are shown. Before calling or texting a US mobile, check the Do Not Call list.',
          )}
        </p>
      </form>

      <div className="lg:col-span-3 space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {busy && <SkeletonRows isDark={isDark} />}
        {results && results.length === 0 && (
          <div className={`${s.card} p-6 text-sm ${s.muted}`}>{t('No encontré negocios con respaldo en la búsqueda. Prueba otra ciudad o rubro.', 'No verified businesses found. Try another city or industry.')}</div>
        )}
        {results?.map((b, i) => {
          const key = b.sourceUrl + b.name;
          const isSaved = saved.has(key) || b.alreadyInCrm;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${s.card} p-4 space-y-2`}>
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <div className={s.heading}>{b.name}</div>
                  <div className={`text-xs ${s.muted}`}>{[b.rubro, b.city, b.address].filter(Boolean).join(' · ')}</div>
                </div>
                <button type="button" disabled={isSaved} onClick={() => keep(b)} className={`${s.secondaryButton} shrink-0 h-fit disabled:opacity-50`}>
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isSaved ? t('En Leads', 'In Leads') : t('Guardar en Leads', 'Save to Leads')}
                </button>
              </div>
              {b.whyFit && <p className="text-sm">{b.whyFit}</p>}
              <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${s.muted}`}>
                {b.website && <span>{b.website}</span>}
                {b.phone && <span>{b.phone}</span>}
                {b.instagram && <span>@{b.instagram}</span>}
                <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                  {t('Fuente', 'Source')} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          );
        })}
        {meta && (
          <p className={`text-xs ${s.faint}`}>
            {t('Costo de esta búsqueda', 'Cost of this search')}: ~{meta.costUsd.toFixed(3)} USD · {t('búsquedas restantes hoy', 'searches left today')}: {meta.remainingToday}
          </p>
        )}
        {!results && !busy && (
          <div className={`${s.card} p-6 text-sm ${s.muted}`}>
            {t('Elige un rubro y una ciudad. Claude busca en la web y te muestra cada negocio con su fuente.', 'Pick an industry and city. Claude searches the web and shows each business with its source.')}
          </div>
        )}
      </div>
    </div>
  );
}

function Editor({ value, isDark, t, L, onClose, onSave }: { value: Partial<CrmContact>; isDark: boolean; t: T; L: 'es' | 'en'; onClose: () => void; onSave: (c: Partial<CrmContact>) => Promise<void> }) {
  const s = ui(isDark);
  const [c, setC] = useState<Partial<CrmContact>>(value);
  const [busy, setBusy] = useState(false);
  const kind: Kind = c.kind === 'creador' ? 'creador' : 'empresa';
  const set = (k: keyof CrmContact, v: any) => setC((x) => ({ ...x, [k]: v }));
  const field = (k: keyof CrmContact, label: string, type = 'text') => (
    <div>
      <label htmlFor={`crm-${k}`} className={s.label}>{label}</label>
      <input id={`crm-${k}`} type={type} value={(c[k] as any) ?? ''} onChange={(e) => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} className={s.input} />
    </div>
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-label={t('Contacto', 'Contact')}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onSave({ ...c, kind });
          setBusy(false);
        }}
        className={`relative w-full max-w-md h-full overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#1D1D1F]'}`}
      >
        <div className="flex justify-between items-center">
          <h3 className={s.heading}>{c.id ? c.name || c.company : t('Nuevo contacto', 'New contact')}</h3>
          <button type="button" onClick={onClose} className={s.iconButton} aria-label={t('Cerrar', 'Close')}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {c.source && <p className={`text-xs ${s.faint}`}>{t('Origen', 'Source')}: {c.source}{c.origin?.sourceUrl ? ' · ' : ''}{c.origin?.sourceUrl && <a className="underline" href={c.origin.sourceUrl} target="_blank" rel="noopener noreferrer">{t('ver fuente', 'view source')}</a>}</p>}

        {!c.id && (
          <div className="flex gap-2">
            {(['empresa', 'creador'] as const).map((k) => (
              <button key={k} type="button" onClick={() => setC((x) => ({ ...x, kind: k, stage: 'nuevo' }))} aria-pressed={kind === k} className={s.chip(kind === k)}>
                {k === 'creador' ? t('Creador', 'Creator') : t('Empresa', 'Company')}
              </button>
            ))}
          </div>
        )}
        <div>
          <label htmlFor="crm-stage" className={s.label}>{t('Etapa', 'Stage')}</label>
          <select id="crm-stage" value={c.stage || 'nuevo'} onChange={(e) => set('stage', e.target.value)} className={s.input}>
            {STAGES[kind].map((st) => (
              <option key={st.id} value={st.id}>{st[L]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('name', t('Nombre', 'Name'))}
          {field('company', t('Negocio', 'Business'))}
          {field('contact', t('WhatsApp, teléfono o correo', 'Phone or email'))}
          {field('instagram', 'Instagram')}
          {field('website', 'Web')}
          {field('city', t('Ciudad', 'City'))}
          {field('rubro', t('Rubro', 'Industry'))}
          {field('valueUsd', t('Valor estimado (USD)', 'Estimated value (USD)'), 'number')}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">{field('nextAction', t('Próxima acción', 'Next step'))}</div>
          {field('nextActionAt', t('Fecha', 'Date'), 'date')}
        </div>
        <div>
          <label htmlFor="crm-notes" className={s.label}>{t('Notas', 'Notes')}</label>
          <textarea id="crm-notes" rows={4} value={c.notes || ''} onChange={(e) => set('notes', e.target.value)} className={`${s.input} resize-none`} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={Boolean(c.doNotContact)} onChange={(e) => set('doNotContact', e.target.checked)} />
          {t('No contactar (pidió no ser contactado o está en una lista de exclusión)', 'Do not contact')}
        </label>
        <button type="submit" disabled={busy} className={`${s.primaryButton} w-full`}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t('Guardar', 'Save')}
        </button>
      </motion.form>
    </>
  );
}
