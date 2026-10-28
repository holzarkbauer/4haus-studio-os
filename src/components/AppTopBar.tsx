import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Globe, 
  Users, 
  ChevronDown,
  Columns,
  Headphones,
  Sparkles,
  Menu
} from 'lucide-react';
import { Language } from '../types';
import { MyTeamDropdown } from './MyTeamDropdown';
import { LanguageDropdown } from './LanguageDropdown';
import { AVAILABLE_LANGUAGES } from '../i18n/languages';
import { getWorkbenchTranslations } from '../i18n/workbenchTranslations';
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
  activeItem?: string;
  onNavigateToLanding?: () => void;
  currentUser?: User | null;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  isLoggingIn?: boolean;
}

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
  activeItem = 'inicio',
  onNavigateToLanding,
  currentUser,
  onGoogleLogin,
  onGoogleLogout,
  isLoggingIn = false,
}: AppTopBarProps) {
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const tContent = getWorkbenchTranslations(lang);
  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === lang) || AVAILABLE_LANGUAGES[0];
  const isDark = themeMode === 'dark';

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-black/[0.08] dark:border-white/10 bg-white/80 dark:bg-black/80 apple-glass-nav flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* Left Context: 3-Line Menu Trigger (replaces top-left logo) + 4haus.us navigation */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isSidebarOpen
                ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                : 'border-black/[0.08] dark:border-white/10 bg-[#F5F5F7] hover:bg-zinc-200/80 dark:bg-[#1D1D1F] dark:hover:bg-zinc-800 text-[#1D1D1F] dark:text-white'
            }`}
            title={lang === 'en' ? 'Open tools & navigation menu' : 'Desplegar menú de herramientas e iconos'}
            aria-label={lang === 'en' ? 'Toggle navigation menu' : 'Alternar menú de navegación'}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/10 bg-[#F5F5F7] hover:bg-zinc-200/70 dark:bg-[#1D1D1F] dark:hover:bg-zinc-800 text-[#1D1D1F] dark:text-white text-xs font-semibold transition-all cursor-pointer group whitespace-nowrap shrink-0"
            title="Volver al sitio web principal 4haus.us"
          >
            <span className="text-[#86868B] group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>4haus.us</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-[#86868B]">
          <span className="font-semibold text-[#1D1D1F] dark:text-white">{tContent.topBar.home}</span>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">{tContent.topBar.workspaceDesc}</span>
        </div>
      </div>

      {/* Right Controls: Light/Dark mode, Language selector, Discord, Support Headphones, My Team */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        
        {/* 1. Light / Dark Mode Toggle (4haus studio iluminación) */}
        <button
          onClick={onToggleThemeMode}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          title={isDark ? tContent.topBar.lightMode : tContent.topBar.darkMode}
          aria-label={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700" />
          )}
        </button>

        {/* 2. Multi-Language Selector Dropdown (13 Languages) */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Seleccionar idioma / Select Language"
          >
            <span className="text-sm leading-none">{currentLangObj.flag}</span>
            <span className="text-xs font-semibold">{currentLangObj.code.toUpperCase()}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Small Floating Window for 13 Languages */}
          <LanguageDropdown
            isOpen={isLanguageDropdownOpen}
            onClose={() => setIsLanguageDropdownOpen(false)}
            currentLang={lang}
            onSelectLang={onSetLang}
          />
        </div>

        {/* 3. Discord Community Link */}
        <a
          href="https://discord.com/channels/1550307428313342052/1550307428313342054"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
          title="4haus.studio Discord Channel"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </a>

        {/* 4. Support Headphones Button (Matches Image Reference) */}
        <button
          onClick={onOpenSupport}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          title={tContent.topBar.support}
        >
          <Headphones className="w-4 h-4" />
        </button>

        {/* 5. User Account Sign-In / Authenticated Workspace Controls */}
        {!currentUser ? (
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Iniciar sesión con Google para ver tus proyectos y prospectos"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isLoggingIn ? 'Conectando...' : (lang === 'en' ? 'Sign in with Google' : 'Iniciar sesión')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[140px]">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={onGoogleLogout}
                className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {lang === 'en' ? 'Private Workspace · Sign out' : 'Cuenta activa · Salir'}
              </button>
            </div>
          </div>
        )}

        {/* 6. User Avatar with Floating Right Dropdown */}
        <div className="relative flex items-center gap-2">
          {/* User Profile Avatar Pill */}
          <div 
            onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
            className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-gradient-to-br from-emerald-400 to-indigo-600 p-0.5 cursor-pointer shrink-0 shadow-xs hover:scale-105 transition-transform overflow-hidden"
            title={currentUser?.email || 'User Profile'}
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-[11px] font-bold text-white">
                {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : (
                  <Users className="w-3.5 h-3.5 text-zinc-300" />
                )}
              </div>
            )}
          </div>

          {/* Popout Dropdown Window on the right */}
          <MyTeamDropdown
            isOpen={isTeamDropdownOpen}
            onClose={() => setIsTeamDropdownOpen(false)}
            lang={lang}
            onOpenPlans={onOpenPlans}
            onOpenSettings={onOpenTeamModal}
          />
        </div>

      </div>

    </header>
  );
}
