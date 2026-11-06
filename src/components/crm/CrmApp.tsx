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
} from 'lucide-react';
import { Language } from '../../types';
import { ui } from '../../ui/tokens';

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

const RUBROS = [
  'Restaurantes',
  'Clínicas dentales',
  'Inmobiliarias',
  'Gimnasios',
  'Salones de belleza',
  'Estudios de abogados',
  'Contratistas (techos, HVAC, plomería)',
  'Hoteles y hospedajes',
  'Tiendas de ropa',
  'Academias y cursos',
];

type Tab = 'panel' | 'leads' | 'pipeline' | 'buscar';

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

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'panel', label: t('Panel', 'Dashboard'), icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
    { id: 'buscar', label: t('Buscar clientes', 'Find clients'), icon: Search },
  ];
  const upcoming = [
    { label: t('Ventas y comisiones', 'Sales & commissions'), icon: Wallet },
    { label: t('Campañas', 'Campaigns'), icon: Megaphone },
    { label: t('Agenda', 'Calendar'), icon: CalendarDays },
    { label: t('Propuestas', 'Proposals'), icon: FileSignature },
    { label: t('Equipo y documentos', 'Team & documents'), icon: Briefcase },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full pt-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className={s.title}>CRM 4haus</h2>
          <p className={`text-sm mt-1 ${s.muted}`}>
            {t('Creadores, empresas y negocios por contactar, en un solo lugar.', 'Creators, companies and prospects in one place.')}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className={s.secondaryButton} aria-label={t('Actualizar', 'Refresh')}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t('Actualizar', 'Refresh')}
          </button>
          <button type="button" onClick={() => setEditing({ kind: 'empresa', stage: 'nuevo' })} className={s.primaryButton}>
            <Plus className="w-4 h-4" /> {t('Añadir contacto', 'Add contact')}
          </button>
        </div>
      </div>

      <nav className={`flex flex-wrap gap-1 p-1 rounded-full w-fit ${s.soft}`} aria-label="CRM">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                active ? (isDark ? 'text-black' : 'text-white') : s.muted
              }`}
            >
              {active && (
                <motion.span
                  layoutId="crm-tab"
                  className={`absolute inset-0 rounded-full ${isDark ? 'bg-white' : 'bg-[#1D1D1F]'}`}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative" />
              <span className="relative">{tb.label}</span>
            </button>
          );
        })}
      </nav>

      {error && (
        <div className={`${s.card} p-4 flex items-start gap-2 text-sm`}>
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className={s.iconButton} aria-label={t('Cerrar', 'Close')}>
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
            <Panel contacts={contacts} isDark={isDark} t={t} stageLabel={stageLabel} onOpen={setEditing} />
          ) : tab === 'leads' ? (
            <Leads contacts={contacts} isDark={isDark} t={t} stageLabel={stageLabel} onOpen={setEditing} />
          ) : tab === 'pipeline' ? (
            <Pipeline contacts={contacts} isDark={isDark} t={t} L={L} onOpen={setEditing} onMove={(c, stage) => save({ id: c.id, kind: c.kind, stage })} />
          ) : (
            <Prospect isDark={isDark} t={t} onSave={save} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className={`pt-2 text-xs ${s.faint}`}>
        <span className="font-semibold">{t('Próximas secciones:', 'Coming next:')}</span>{' '}
        {upcoming.map((u, i) => (
          <span key={u.label}>
            {u.label}
            {i < upcoming.length - 1 ? ' · ' : ''}
          </span>
        ))}
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

function Panel({ contacts, isDark, t, stageLabel, onOpen }: { contacts: CrmContact[]; isDark: boolean; t: T; stageLabel: (c: CrmContact) => string; onOpen: (c: CrmContact) => void }) {
  const s = ui(isDark);
  const creators = contacts.filter((c) => c.kind === 'creador');
  const companies = contacts.filter((c) => c.kind === 'empresa');
  const openCompanies = companies.filter((c) => !['ganado', 'perdido'].includes(c.stage));
  const kpis = [
    { label: t('Creadores activos', 'Active creators'), value: creators.filter((c) => ['activo', 'vendio'].includes(c.stage)).length },
    { label: t('Creadores en proceso', 'Creators in progress'), value: creators.filter((c) => ['nuevo', 'contactado', 'codigo-enviado'].includes(c.stage)).length },
    { label: t('Empresas en curso', 'Open companies'), value: openCompanies.length, sub: `${openCompanies.reduce((a, c) => a + (c.valueUsd || 0), 0).toLocaleString('en-US')} USD` },
    { label: t('Empresas ganadas', 'Companies won'), value: companies.filter((c) => c.stage === 'ganado').length },
  ];
  const bySource = Object.entries(
    contacts.reduce<Record<string, number>>((acc, c) => {
      const k = c.source || t('Sin origen', 'No source');
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...bySource.map((x) => x[1]));
  const attention = contacts.filter(needsAttention).slice(0, 6);

  if (contacts.length === 0) {
    return (
      <div className={`${s.card} p-10 text-center space-y-2`}>
        <p className={s.heading}>{t('Aún no hay contactos', 'No contacts yet')}</p>
        <p className={`text-sm ${s.muted}`}>
          {t(
            'Aparecerán solos cuando una empresa agende una llamada o un creador pida su código. También puedes buscar negocios en "Buscar clientes".',
            'They appear automatically when a company books a call or a creator requests a code. You can also find businesses in "Find clients".',
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className={`${s.card} p-5`}
          >
            <div className={`text-xs ${s.muted}`}>{k.label}</div>
            <div className={`text-3xl font-bold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{k.value}</div>
            {k.sub && <div className={`text-xs mt-0.5 ${s.faint}`}>{k.sub} {t('estimado', 'estimated')}</div>}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className={`${s.card} p-5 space-y-3`}>
          <h3 className={s.heading}>{t('Requiere tu atención', 'Needs your attention')}</h3>
          {attention.length === 0 ? (
            <p className={`text-sm ${s.muted}`}>{t('Todo al día.', 'All caught up.')}</p>
          ) : (
            <ul className="space-y-2">
              {attention.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => onOpen(c)} className={`w-full text-left p-3 rounded-xl cursor-pointer transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/[0.03]'}`}>
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-semibold truncate">{c.name || c.company}</span>
                      <span className={`text-xs shrink-0 ${s.faint}`}>{stageLabel(c)}</span>
                    </div>
                    <div className={`text-xs ${s.muted}`}>
                      {c.nextAction ? `${c.nextAction}${c.nextActionAt ? ` · ${c.nextActionAt}` : ''}` : t('Nuevo sin próxima acción', 'New with no next step')}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${s.card} p-5 space-y-3`}>
          <h3 className={s.heading}>{t('De dónde llegan', 'Where they come from')}</h3>
          <ul className="space-y-2.5">
            {bySource.map(([k, n]) => (
              <li key={k} className="text-sm">
                <div className="flex justify-between">
                  <span className="truncate">{k}</span>
                  <span className={s.muted}>{n}</span>
                </div>
                <div className={`h-1.5 mt-1 rounded-full ${s.soft}`}>
                  <motion.div
                    className={`h-full rounded-full ${isDark ? 'bg-white' : 'bg-[#1D1D1F]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / max) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Leads({ contacts, isDark, t, stageLabel, onOpen }: { contacts: CrmContact[]; isDark: boolean; t: T; stageLabel: (c: CrmContact) => string; onOpen: (c: CrmContact) => void }) {
  const s = ui(isDark);
  const [q, setQ] = useState('');
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
