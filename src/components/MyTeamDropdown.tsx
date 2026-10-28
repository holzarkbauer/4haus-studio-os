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
import { Language } from '../types';

interface MyTeamDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenPlans: () => void;
  onOpenSettings: () => void;
}

export function MyTeamDropdown({
  isOpen,
  onClose,
  lang,
  onOpenPlans,
  onOpenSettings,
}: MyTeamDropdownProps) {
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
      className="absolute right-0 top-14 w-80 sm:w-88 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-4 z-50 text-left text-zinc-900 dark:text-white animate-in fade-in slide-in-from-top-2 duration-150"
    >
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

      {/* Logout */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={onClose}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Cierre de sesión</span>
        </button>
      </div>

    </div>
  );
}
