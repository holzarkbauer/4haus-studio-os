import React, { useRef, useEffect } from 'react';
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
  Check,
  User,
  HelpCircle,
  LogOut,
  Gift,
  BookOpen
} from 'lucide-react';
import { Sun, Moon, Globe, Headphones, LogIn } from 'lucide-react';
import { Language } from '../types';
import { AVAILABLE_LANGUAGES } from '../i18n/languages';
import type { User as FirebaseUser } from 'firebase/auth';

interface MyTeamDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenPlans: () => void;
  onOpenSettings: () => void;
  // Opciones que antes estaban sueltas en la barra superior
  currentUser?: FirebaseUser | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
  onGoogleLogout?: () => void;
  themeMode?: 'light' | 'dark';
  onToggleThemeMode?: () => void;
  onSetLang?: (lang: Language) => void;
  onOpenSupport?: () => void;
}

export function MyTeamDropdown({
  isOpen,
  onClose,
  lang,
  onOpenPlans,
  onOpenSettings,
  currentUser = null,
  isLoggingIn = false,
  onGoogleLogin,
  onGoogleLogout,
  themeMode = 'light',
  onToggleThemeMode,
  onSetLang,
  onOpenSupport,
}: MyTeamDropdownProps) {
  const isEn = lang === 'en';
  const isDark = themeMode === 'dark';
  const rowClass =
    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left cursor-pointer';
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-88 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-4 z-50 text-left text-zinc-900 dark:text-white animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Cuenta: iniciar sesión o datos del usuario */}
      <div className="pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
        {currentUser ? (
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{currentUser.displayName || currentUser.email}</div>
            {currentUser.displayName && currentUser.email && (
              <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoogleLogin?.();
            }}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isLoggingIn ? (isEn ? 'Connecting...' : 'Conectando...') : isEn ? 'Sign in with Google' : 'Iniciar sesión con Google'}</span>
          </button>
        )}
      </div>

      {/* Team Header & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">My Team</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
              Free
            </span>
            <span className="text-zinc-400 text-xs">↕</span>
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">1 Miembros • 1 Asientos</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="Ajustes"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Credits Meter Bar */}
      <div className="py-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-900 dark:text-white font-mono">8000/8000</span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Créditos restantes</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div className="w-full h-full bg-zinc-900 dark:bg-white rounded-full" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono pt-1">
          <span>oct 15, 2026</span>
          <span>Próxima recarga de créditos</span>
        </div>
      </div>

      {/* Action Buttons: Actualizar & Ajustes */}
      <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => {
            onClose();
            onOpenPlans();
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Actualizar</span>
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>Ajustes</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="py-2 space-y-0.5 text-xs text-zinc-700 dark:text-zinc-300">
        
        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-indigo-600 dark:text-indigo-400 font-medium transition-colors text-left cursor-pointer"
        >
          <Gift className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>Gana como afiliado</span>
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left cursor-pointer"
        >
          <User className="w-4 h-4 shrink-0 text-zinc-400" />
          <span>Mi Perfil</span>
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left cursor-pointer"
        >
          <BookOpen className="w-4 h-4 shrink-0 text-zinc-400" />
          <span>Diccionarios de pronunciación</span>
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left cursor-pointer"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-zinc-400" />
          <span>Obtener créditos gratis</span>
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-zinc-400" />
          <span>Ayuda</span>
        </button>
      </div>

      {/* Preferencias y comunidad (antes estaban en la barra superior) */}
      <div className="py-2 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5 text-xs">
        {onToggleThemeMode && (
          <button type="button" onClick={onToggleThemeMode} className={rowClass}>
            {isDark ? <Sun className="w-4 h-4 shrink-0 text-amber-400" /> : <Moon className="w-4 h-4 shrink-0 text-zinc-400" />}
            <span>{isDark ? (isEn ? 'Light mode' : 'Modo claro') : isEn ? 'Dark mode' : 'Modo oscuro'}</span>
          </button>
        )}

        {onSetLang && (
          <label className={`${rowClass} cursor-default`}>
            <Globe className="w-4 h-4 shrink-0 text-zinc-400" />
            <span className="flex-1">{isEn ? 'Language' : 'Idioma'}</span>
            <select
              value={lang}
              onChange={(e) => onSetLang(e.target.value as Language)}
              className="bg-transparent text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {AVAILABLE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-zinc-900">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </label>
        )}

        <a
          href="https://discord.com/channels/1550307428313342052/1550307428313342054"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className={rowClass}
        >
          <svg className="w-4 h-4 shrink-0 fill-current text-indigo-500" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span>{isEn ? 'Discord community' : 'Comunidad en Discord'}</span>
        </a>

        {onOpenSupport && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSupport();
            }}
            className={rowClass}
          >
            <Headphones className="w-4 h-4 shrink-0 text-zinc-400" />
            <span>{isEn ? 'Support and contact' : 'Soporte y contacto'}</span>
          </button>
        )}
      </div>

      {/* Logout (solo con sesión iniciada) */}
      {currentUser && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => {
              onClose();
              onGoogleLogout?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left cursor-pointer font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Cierre de sesión</span>
          </button>
        </div>
      )}

    </div>
  );
}
