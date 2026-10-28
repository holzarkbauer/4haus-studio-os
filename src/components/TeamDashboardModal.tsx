import React, { useState } from 'react';
import { 
  Building, 
  CreditCard, 
  Wallet, 
  Coins, 
  Settings, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Plus,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Clock,
  Key,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { Language } from '../types';

interface TeamDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenPlans: () => void;
  initialTab?: 'dashboard' | 'members' | 'usage' | 'plans' | 'billing' | 'wallet' | 'more';
}

export function TeamDashboardModal({
  isOpen,
  onClose,
  lang,
  onOpenPlans,
  initialTab = 'dashboard'
}: TeamDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'usage' | 'plans' | 'billing' | 'wallet' | 'more'>(initialTab);
  const [copiedKey, setCopiedKey] = useState(false);

  // Sync when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('4haus_live_sk_948f29402e88a101b7a2d9');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const tabs: { id: typeof activeTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: lang === 'en' ? 'Overview' : 'Resumen / Config', icon: Settings },
    { id: 'members', label: lang === 'en' ? 'Team Members' : 'Miembros', icon: Users },
    { id: 'usage', label: lang === 'en' ? 'Credits & Usage' : 'Uso de Créditos', icon: BarChart3 },
    { id: 'plans', label: lang === 'en' ? 'Plans & Tiers' : 'Planes', icon: Sparkles },
    { id: 'billing', label: lang === 'en' ? 'Billing History' : 'Facturación', icon: CreditCard },
    { id: 'wallet', label: lang === 'en' ? 'Team Wallet' : 'Billetera', icon: Wallet },
    { id: 'more', label: lang === 'en' ? 'Advanced' : 'Más', icon: ChevronRight },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#0f1015] border border-white/20 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left">
        
        {/* Top Header with Team Status */}
        <div className="px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">4haus Studio Team</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">ID: org_4haus_9281a</p>
            </div>
          </div>

          {/* Quick Metrics in Header */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-400">{lang === 'en' ? 'Credits:' : 'Créditos:'}</span>
              <span className="font-bold text-white">8,450 / 10,000</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'Cerrar'}
            </button>
          </div>
        </div>

        {/* Modal Body with Sidebar Tabs + Content Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sub-Navigation */}
          <div className="w-full md:w-56 p-3 sm:p-4 border-r border-white/10 bg-zinc-950/40 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* TAB: DASHBOARD (Exact 4 Metrics in requested order: Tipo de Plan, Billetera del equipo, Creditos restantes, Configuracion) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {lang === 'en' ? 'Team Configuration & State' : 'Configuración y Estado del Equipo'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? 'Overview of your enterprise workspace subscription, balance and credentials.' : 'Resumen del estado del usuario, suscripción y credenciales del equipo.'}
                  </p>
                </div>

                {/* 4 Metric Cards in EXACT ORDER requested by user */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Tipo de Plan */}
                  <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>{lang === 'en' ? 'Plan Type' : 'Tipo de Plan'}</span>
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-white">Starter Free</div>
                      <p className="text-[11px] text-zinc-400 mt-1 font-mono">Renews Nov 1, 2026</p>
                    </div>
                    <button
                      onClick={onOpenPlans}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'Upgrade Plan' : 'Cambiar a Plus'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 2. Billetera del Equipo */}
                  <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>{lang === 'en' ? 'Team Wallet' : 'Billetera del Equipo'}</span>
                        <Wallet className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-white">$145.00 USD</div>
                      <p className="text-[11px] text-emerald-400 mt-1 font-mono">+ Auto-refill active</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'Add Funds' : 'Recargar Saldo'}</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 3. Créditos Restantes */}
                  <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>{lang === 'en' ? 'Remaining Credits' : 'Créditos Restantes'}</span>
                        <Coins className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-extrabold text-white">8,450</div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '84.5%' }} />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">84.5% available</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('usage')}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'View Usage' : 'Ver Gráfico'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4. Configuración */}
                  <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>{lang === 'en' ? 'Configuration' : 'Configuración'}</span>
                        <Settings className="w-4 h-4 text-zinc-300" />
                      </div>
                      <div className="text-base font-bold text-white truncate">Live API & Webhooks</div>
                      <p className="text-[11px] text-zinc-400 mt-1 font-mono">Prod endpoint: Active</p>
                    </div>
                    <button
                      onClick={handleCopyApiKey}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{lang === 'en' ? 'Copied' : 'Copiado'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Copy API Key' : 'Copiar API Key'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Team Quick Settings Row */}
                <div className="rounded-2xl bg-zinc-900/40 border border-white/10 p-5 space-y-4">
                  <h5 className="text-sm font-bold text-white">{lang === 'en' ? 'Workspace Security & Environment' : 'Seguridad y Entorno del Workspace'}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-zinc-200 font-medium block">2FA Enforced</span>
                        <span className="text-[11px] text-zinc-400">All team members verified</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <Key className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-zinc-200 font-medium block">API Keys</span>
                        <span className="text-[11px] text-zinc-400">2 active production keys</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-zinc-200 font-medium block">Timezone</span>
                        <span className="text-[11px] text-zinc-400">UTC-05:00 America/Bogota</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MEMBERS */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      {lang === 'en' ? 'Team Members' : 'Miembros del Equipo'}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {lang === 'en' ? 'Manage roles, invitations, and access to 4haus workspace.' : 'Gestiona roles, invitaciones y accesos a 4haus studio.'}
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Invite Member' : 'Invitar Miembro'}</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden bg-zinc-900/60">
                  <div className="divide-y divide-white/5">
                    {[
                      { name: 'José Trujillo', email: 'jose@4haus.us', role: 'Owner & Architect', status: 'Active' },
                      { name: 'Daniel AI (Agent)', email: 'daniel.agent@4haus.us', role: 'Autonomous Executive', status: 'Online' },
                      { name: 'Engineering Core', email: 'dev@4haus.us', role: 'Developer', status: 'Active' },
                    ].map((m, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white">
                            {m.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{m.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{m.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-zinc-300 font-mono">{m.role}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USAGE (Indicator Graph for Credits Used) */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {lang === 'en' ? 'Credits Usage & Analytics' : 'Uso de Créditos y Analíticas'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? 'Visual consumption of credits across AI agents, website builders, and voice engines.' : 'Gráfico indicador de los créditos utilizados por el usuario y consumo acumulado.'}
                  </p>
                </div>

                {/* Simulated Chart Bars */}
                <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{lang === 'en' ? 'Weekly Consumption (Credits / Day)' : 'Consumo Semanal (Créditos / Día)'}</span>
                    <span className="font-mono text-cyan-400 font-semibold">Total: 1,550 used</span>
                  </div>

                  {/* Bar visualizer */}
                  <div className="grid grid-cols-7 gap-3 items-end h-40 pt-4 border-b border-white/10">
                    {[
                      { day: 'Mon', credits: 120, height: '35%' },
                      { day: 'Tue', credits: 240, height: '55%' },
                      { day: 'Wed', credits: 410, height: '90%' },
                      { day: 'Thu', credits: 190, height: '45%' },
                      { day: 'Fri', credits: 310, height: '70%' },
                      { day: 'Sat', credits: 160, height: '40%' },
                      { day: 'Sun', credits: 120, height: '30%' },
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.credits}
                        </div>
                        <div 
                          className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all duration-300 group-hover:brightness-125"
                          style={{ height: col.height }}
                        />
                        <span className="text-[11px] font-mono text-zinc-400 mt-1">{col.day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown by Service */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-zinc-400 block text-[11px]">AI Agents (Daniel & Assistants)</span>
                      <span className="text-white font-bold text-sm">620 credits (40%)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-zinc-400 block text-[11px]">Custom Voice Engine</span>
                      <span className="text-white font-bold text-sm">540 credits (35%)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-zinc-400 block text-[11px]">Websites Library Clones</span>
                      <span className="text-white font-bold text-sm">390 credits (25%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLANS (Link to Plans modal) */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {lang === 'en' ? 'Available Plans' : 'Planes Disponibles'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? 'Compare features and scale with 4haus Plus or Enterprise Pro.' : 'Compara características y potencia tu flujo con 4haus Plus o Pro.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-zinc-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                      {lang === 'en' ? 'Upgrade Tier' : 'Escala tu Plan'}
                    </span>
                    <h5 className="text-xl font-bold text-white">4haus Plus & Pro</h5>
                    <p className="text-xs text-zinc-300 max-w-lg">
                      {lang === 'en' 
                        ? 'Unlock full Voice Synthesis models, 15k+ monthly credits, and dedicated website builder pipelines.' 
                        : 'Desbloquea modelos de voz completa, más de 15,000 créditos mensuales y pipelines dedicados.'}
                    </p>
                  </div>
                  <button
                    onClick={onOpenPlans}
                    className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-indigo-500/30 cursor-pointer"
                  >
                    <span>{lang === 'en' ? 'View Pricing Matrix' : 'Ver Matriz de Precios'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {lang === 'en' ? 'Billing History & Invoices' : 'Historial de Facturación'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? 'Download past receipts and update payment methods.' : 'Descarga recibos anteriores y actualiza métodos de pago.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden bg-zinc-900/60 divide-y divide-white/5 text-xs">
                  {[
                    { id: 'INV-2026-003', date: 'Oct 01, 2026', amount: '$0.00', status: 'Paid', desc: 'Starter Plan - Monthly' },
                    { id: 'INV-2026-002', date: 'Sep 01, 2026', amount: '$50.00', status: 'Paid', desc: 'Team Wallet Top-up (5,000 credits)' },
                    { id: 'INV-2026-001', date: 'Aug 01, 2026', amount: '$0.00', status: 'Paid', desc: 'Workspace Activation' },
                  ].map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-mono font-semibold text-white">{inv.id}</div>
                        <div className="text-[11px] text-zinc-400">{inv.desc} • {inv.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-white font-bold">{inv.amount}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WALLET */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {lang === 'en' ? 'Team Wallet & Auto-Refill' : 'Billetera del Equipo y Recarga'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? 'Pre-paid balances for scalable on-demand compute and AI runs.' : 'Saldo pre-pago para ejecuciones automáticas de IA y cómputo.'}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{lang === 'en' ? 'Available Balance' : 'Saldo Disponible'}</span>
                    <span className="text-2xl font-bold text-white">$145.00 USD</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 px-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer">
                      +$25 USD
                    </button>
                    <button className="flex-1 py-2.5 px-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer">
                      +$50 USD
                    </button>
                    <button className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-500 text-white font-semibold text-xs hover:bg-indigo-400 transition-colors cursor-pointer">
                      +$100 USD (Bonus 5%)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MORE */}
            {activeTab === 'more' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {lang === 'en' ? 'Advanced Workspace Settings' : 'Opciones Avanzadas del Sistema'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? 'Audit logs, custom domain mapping and webhook endpoints.' : 'Registro de auditoría, dominios personalizados y webhooks.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
                    <h6 className="font-bold text-white">{lang === 'en' ? 'Custom Domain' : 'Dominio Personalizado'}</h6>
                    <p className="text-zinc-400 text-[11px]">{lang === 'en' ? 'Connect your agency brand (e.g. app.yourcompany.com).' : 'Conecta el dominio de tu marca para portales clientes.'}</p>
                    <button className="mt-2 text-indigo-400 hover:underline">{lang === 'en' ? 'Configure DNS →' : 'Configurar DNS →'}</button>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
                    <h6 className="font-bold text-white">{lang === 'en' ? 'Audit Trail' : 'Registro de Auditoría'}</h6>
                    <p className="text-zinc-400 text-[11px]">{lang === 'en' ? 'Review every command, execution and user action.' : 'Monitorea todas las acciones y ejecuciones del equipo.'}</p>
                    <button className="mt-2 text-indigo-400 hover:underline">{lang === 'en' ? 'View Logs →' : 'Ver Logs →'}</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
