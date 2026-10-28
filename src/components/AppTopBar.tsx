import React, { useEffect, useRef, useState } from 'react';
import { Users, ChevronDown, Menu } from 'lucide-react';
import { Language } from '../types';
import { MyTeamDropdown } from './MyTeamDropdown';
import { User } from 'firebase/auth';

interface AppTopBarProps {
  themeMode: 'light' | 'dark';
  onToggleThemeMode: () => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenTeamModal: () => void;
  onOpenPlans: () => void;
  onOpenSupport?: () => void;
  onOpenTutorials?: () => void;
  onNavigate?: (sidebarItemId: string) => void;
  activeItem?: string;
  onNavigateToLanding?: () => void;
  currentUser?: User | null;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  isLoggingIn?: boolean;
}

// Barra superior reducida (estilo v0): menú lateral + logo, cinco enlaces al centro y el avatar.
// Tema, idioma, Discord, soporte e inicio de sesión viven dentro del menú del avatar.
export function AppTopBar({
  themeMode,
  onToggleThemeMode,
  lang,
  onSetLang,
  isSidebarOpen = false,
  onToggleSidebar,
  onOpenTeamModal,
  onOpenPlans,
  onOpenSupport,
  onOpenTutorials,
  onNavigate,
  onNavigateToLanding,
  currentUser,
  onGoogleLogin,
  onGoogleLogout,
  isLoggingIn = false,
}: AppTopBarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTemplatesMenuOpen, setIsTemplatesMenuOpen] = useState(false);
  const templatesMenuRef = useRef<HTMLDivElement>(null);
  const isEn = lang === 'en';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (templatesMenuRef.current && !templatesMenuRef.current.contains(event.target as Node)) {
        setIsTemplatesMenuOpen(false);
      }
    }
    if (isTemplatesMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTemplatesMenuOpen]);

  const navLink =
    'px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-[#1D1D1F] dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap';

  const templateCategories = [
    { label: isEn ? 'Landing pages' : 'Landing pages', target: 'websites' },
    { label: isEn ? 'Online stores' : 'Tiendas online', target: 'websites' },
    { label: isEn ? 'Apps' : 'Apps', target: 'websites' },
    { label: isEn ? 'Dashboards' : 'Dashboards', target: 'websites' },
    { label: isEn ? 'Landing builder' : 'Constructor de landings', target: 'landings-brief' },
  ];

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-black/[0.08] dark:border-white/10 bg-white/85 dark:bg-black/80 apple-glass-nav grid grid-cols-[1fr_auto_1fr] items-center sticky top-0 z-30 transition-colors">
      {/* Izquierda: menú lateral + logo */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isSidebarOpen
                ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] dark:bg-white dark:text-black dark:border-white'
                : 'border-black/[0.08] dark:border-white/10 bg-white hover:bg-black/[0.03] dark:bg-[#1D1D1F] dark:hover:bg-zinc-800 text-[#1D1D1F] dark:text-white'
            }`}
            title={isEn ? 'Open tools menu' : 'Abrir menú de herramientas'}
            aria-label={isEn ? 'Toggle navigation menu' : 'Alternar menú de navegación'}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="text-[15px] font-bold tracking-tight text-[#1D1D1F] dark:text-white cursor-pointer whitespace-nowrap"
          title={isEn ? 'Back to 4haus.us' : 'Volver a 4haus.us'}
        >
          4haus Studio
        </button>
      </div>

      {/* Centro: los cinco enlaces */}
      <nav className="hidden md:flex items-center gap-1" aria-label={isEn ? 'Main' : 'Principal'}>
        <div className="relative" ref={templatesMenuRef}>
          <button type="button" onClick={() => setIsTemplatesMenuOpen(!isTemplatesMenuOpen)} className={`${navLink} flex items-center gap-1`}>
            {isEn ? 'Templates' : 'Plantillas'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTemplatesMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTemplatesMenuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-10 w-56 rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50">
              {templateCategories.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    setIsTemplatesMenuOpen(false);
                    onNavigate?.(cat.target);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-[#1D1D1F] dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/10 cursor-pointer"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={onOpenSupport} className={navLink}>
          {isEn ? 'Enterprise' : 'Empresas'}
        </button>
        <button type="button" onClick={onOpenPlans} className={navLink}>
          {isEn ? 'Pricing' : 'Precios'}
        </button>
        <span
          className="px-2.5 py-1.5 text-[13px] font-medium text-[#86868B] whitespace-nowrap cursor-default"
          title={isEn ? 'iOS app coming soon' : 'App de iOS: próximamente'}
        >
          iOS <span className="text-[10px] align-top">{isEn ? 'soon' : 'pronto'}</span>
        </span>
        <button type="button" onClick={onOpenTutorials} className={navLink}>
          {isEn ? 'Students' : 'Estudiantes'}
        </button>
      </nav>

      {/* Derecha: solo el avatar, con todo lo demás dentro */}
      <div className="relative flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-gradient-to-br from-emerald-400 to-indigo-600 p-0.5 cursor-pointer shrink-0 shadow-xs hover:scale-105 transition-transform overflow-hidden"
          title={currentUser?.email || (isEn ? 'Account' : 'Cuenta')}
          aria-label={isEn ? 'Open account menu' : 'Abrir menú de la cuenta'}
        >
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-[11px] font-bold text-white">
              {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : <Users className="w-3.5 h-3.5 text-zinc-300" />}
            </span>
          )}
        </button>

        <MyTeamDropdown
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          lang={lang}
          onOpenPlans={onOpenPlans}
          onOpenSettings={onOpenTeamModal}
          currentUser={currentUser}
          isLoggingIn={isLoggingIn}
          onGoogleLogin={onGoogleLogin}
          onGoogleLogout={onGoogleLogout}
          themeMode={themeMode}
          onToggleThemeMode={onToggleThemeMode}
          onSetLang={onSetLang}
          onOpenSupport={onOpenSupport}
        />
      </div>
    </header>
  );
}
