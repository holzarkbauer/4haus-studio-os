import React, { useState } from 'react';
import { 
  Home, 
  Mic2, 
  Compass, 
  FolderGit2, 
  Globe, 
  Bot, 
  ShoppingBag, 
  BookOpen, 
  History, 
  CreditCard, 
  Settings2, 
  Users, 
  BarChart3, 
  Rocket, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Mail, 
  Sparkles,
  ExternalLink,
  Layers,
  HelpCircle,
  Play,
  Info,
  Share2,
  Briefcase,
  User,
  Plus,
  Code2,
  Video,
  Scissors,
  Wand2,
  Music2,
  FileText,
  Target,
  Send,
  LayoutTemplate,
  Building2,
  Link2,
  X
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/languages';
import { getWorkbenchTranslations } from '../i18n/workbenchTranslations';
import { AboutSubModalType } from './AboutModal';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggleOpen?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeItem: string;
  onSelectItem: (id: string) => void;
  lang: Language;
  themeMode?: 'light' | 'dark';
  onOpenPlans: () => void;
  onOpenTeamDashboard: (tab?: any) => void;
  onOpenNewsletter: () => void;
  onOpenTutorials: () => void;
  onOpenAboutModal: (tab?: AboutSubModalType) => void;
}

export function AppSidebar({
  isOpen = false,
  onClose,
  onToggleOpen,
  isCollapsed,
  onToggleCollapse,
  activeItem,
  onSelectItem,
  lang,
  themeMode = 'light',
  onOpenPlans,
  onOpenTeamDashboard,
  onOpenNewsletter,
  onOpenTutorials,
  onOpenAboutModal,
}: AppSidebarProps) {
  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.es;
  const tContent = getWorkbenchTranslations(lang);
  const isDark = themeMode === 'dark';

  return (
    <>
      {/* Backdrop when menu is deployed so clicking anywhere outside closes it */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/25 dark:bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 flex flex-col justify-between border-r shrink-0 apple-glass-nav shadow-2xl ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        } ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-screen ${
          isDark 
            ? 'border-white/10 bg-[#0A0A0C]/95 text-[#F5F5F7]' 
            : 'border-black/[0.08] bg-white/95 text-[#1D1D1F]'
        }`}
      >
        {/* Logo de 4haus (cierra el menú) + controles de colapsar/cerrar */}
        <div className={`h-14 px-4 border-b flex items-center justify-between transition-colors shrink-0 ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <button
            type="button"
            onClick={onToggleOpen || onClose}
            className={`flex items-center gap-2.5 overflow-hidden cursor-pointer p-1.5 rounded-xl transition-colors ${
              isDark
                ? 'text-white hover:bg-zinc-900'
                : 'text-zinc-900 hover:bg-zinc-100'
            }`}
            title={lang === 'en' ? 'Close menu' : 'Cerrar menú'}
          >
            <img src="/Frame_3.svg" alt="" className="w-7 h-7 shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-semibold tracking-tight truncate">4haus Studio</span>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark 
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title={isCollapsed ? (lang === 'en' ? 'Show labels' : 'Ver nombres') : (lang === 'en' ? 'Icons only' : 'Solo iconos')}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

      {/* Main Navigation Sections with smooth scroll */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin">
        
        {/* Workspace Dropdown Button: [ | ] Creativo (Ref: Screenshot) */}
        {!isCollapsed && (
          <div className="px-1">
            <button 
              onClick={() => onSelectItem('inicio')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDark 
                  ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{tContent.sidebar.creative}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        )}

        {/* SECTION 1: HERRAMIENTAS (Inicio, Voz personalizada +, Descubrimiento, Biblioteca de recursos) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {t.coreTools}
            </div>
          )}

          {[
            { id: 'inicio', label: t.home, icon: Home },
            { id: 'websites', label: lang === 'en' ? 'Templates' : 'Plantillas', icon: LayoutTemplate },
            { id: 'voz', label: t.customVoice, icon: Mic2, hasPlus: true },
            { id: 'aprende', label: lang === 'en' ? 'Learn' : 'Aprende', icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <div key={item.id} className="relative flex items-center">
                <button
                  onClick={() => onSelectItem(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? isDark
                        ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                        : 'bg-zinc-900 text-white font-semibold shadow-xs'
                      : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                </button>
                {item.hasPlus && !isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem('voz');
                    }}
                    className={`absolute right-2.5 p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200 text-zinc-500'
                    }`}
                    title="Crear voz personalizada"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* SECTION 1.5: CRECIMIENTO & CAPTACIÓN POR NICHO (LeadNicho inside 4haus Studio) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <span>{lang === 'en' ? 'Business' : 'Negocio'}</span>
            </div>
          )}

          {[
            // Una sola entrada: los pasos (negocio, CRM, campañas, landing, conexiones) son pestañas dentro.
            { id: 'growth-os', label: lang === 'en' ? 'Win clients' : 'Captar clientes', icon: Target },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = [
              'growth-os',
              'negocio-perfil',
              'prospectos-crm',
              'campanas-ia',
              'landings-brief',
              'conexiones-api',
            ].includes(activeItem);
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                    : isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* SECTION 2: PRODUCTOS (Libreria de websites, AI Agents, Store, Knowledge library) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {t.products}
            </div>
          )}

          {[
            { id: 'ai-agents', label: t.aiAgents, icon: Bot, badge: undefined as string | undefined },
            { id: 'store', label: t.store, icon: ShoppingBag, badge: undefined as string | undefined },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? isDark
                      ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                      : 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {item.badge && !isCollapsed && (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-950/60 dark:text-red-400 px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SECTION 3: PLATAFORMA (Historia, Facturación, Configuración del equipo, Novedades, Tutoriales) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {t.platform}
            </div>
          )}

          {[
            { id: 'historia', label: t.userHistory, icon: History },
            { id: 'facturacion', label: t.billing, icon: CreditCard },
            { id: 'team-config', label: t.teamSettings, icon: Settings2 },
            { id: 'newsletter', label: t.newsletter, icon: Mail },
            { id: 'tutoriales', label: t.tutorials, icon: Play },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'newsletter') {
                    onOpenNewsletter();
                  } else if (item.id === 'tutoriales') {
                    onOpenTutorials();
                  } else if (item.id === 'facturacion') {
                    onOpenTeamDashboard('billing');
                  } else if (item.id === 'team-config') {
                    onOpenTeamDashboard('dashboard');
                  } else {
                    onSelectItem(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? isDark
                      ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                      : 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* SECTION 4: ABOUT (Redes Sociales, Case Studies, About Founder, Contact Us) */}
        <div className={`space-y-1 pt-2 border-t transition-colors ${
          isDark ? 'border-zinc-800' : 'border-zinc-100'
        }`}>
          {!isCollapsed && (
            <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
              isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              <span>{t.about}</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                isDark ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40' : 'bg-indigo-50 text-indigo-600'
              }`}>STUDIO</span>
            </div>
          )}

          {/* Main About Trigger Button */}
          <button
            onClick={() => onOpenAboutModal(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
              isDark 
                ? 'text-indigo-300 hover:bg-indigo-950/50' 
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
            title="About 4haus Studio"
          >
            <Info className={`w-4 h-4 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            {!isCollapsed && <span className="truncate">About 4haus Studio</span>}
          </button>

          {/* 4 Direct Sub-buttons within ABOUT */}
          {!isCollapsed && (
            <div className="pl-6 pr-1 space-y-0.5">
              <button
                onClick={() => onOpenAboutModal('social')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  isDark 
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={tContent.sidebar.socialMedia}
              >
                <Share2 className="w-3 h-3 shrink-0 text-pink-500" />
                <span className="truncate">{tContent.sidebar.socialMedia}</span>
              </button>

              <button
                onClick={() => onOpenAboutModal('cases')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  isDark 
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={tContent.sidebar.caseStudies}
              >
                <Briefcase className="w-3 h-3 shrink-0 text-emerald-500" />
                <span className="truncate">{tContent.sidebar.caseStudies}</span>
              </button>

              <button
                onClick={() => onOpenAboutModal('founder')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  isDark 
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={tContent.sidebar.aboutFounder}
              >
                <User className="w-3 h-3 shrink-0 text-indigo-500" />
                <span className="truncate">{tContent.sidebar.aboutFounder}</span>
              </button>

              <button
                onClick={() => onOpenAboutModal('contact')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer text-left ${
                  isDark 
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={tContent.sidebar.contactUs}
              >
                <Mail className="w-3 h-3 shrink-0 text-amber-500" />
                <span className="truncate">{tContent.sidebar.contactUs}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Section: Developer button + ACTUALIZA A... button (Pinned to the absolute bottom) */}
      <div className={`p-3 border-t transition-colors shrink-0 space-y-2 ${
        isDark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-zinc-50'
      }`}>
        {/* Developer Button */}
        <button
          onClick={() => onSelectItem('websites')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
            isDark 
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
          }`}
          title={tContent.sidebar.developer}
        >
          <Code2 className="w-4 h-4 shrink-0 text-indigo-500" />
          {!isCollapsed && <span className="truncate font-semibold">{tContent.sidebar.developer}</span>}
        </button>

        {/* Upgrade Plan Button */}
        <button
          onClick={onOpenPlans}
          className="w-full flex items-center justify-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-rose-500/90 hover:from-amber-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer group"
          title={tContent.sidebar.upgradeTitle}
        >
          <Rocket className="w-4 h-4 shrink-0 group-hover:-translate-y-0.5 group-hover:rotate-12 transition-transform" />
          {!isCollapsed && (
            <div className="text-left overflow-hidden leading-tight">
              <span className="block text-xs font-bold leading-tight uppercase tracking-wider">
                {tContent.sidebar.upgradeTitle}
              </span>
            </div>
          )}
        </button>
      </div>

      </aside>
    </>
  );
}
