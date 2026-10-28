import React, { useRef, useEffect } from 'react';
import { Check, Globe, X } from 'lucide-react';
import { Language } from '../types';
import { AVAILABLE_LANGUAGES } from '../i18n/languages';

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

export function LanguageDropdown({
  isOpen,
  onClose,
  currentLang,
  onSelectLang,
}: LanguageDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  const currentOption = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-3 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-2.5 mb-1.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-white">
            Idiomas / Languages
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Languages */}
      <div className="max-h-72 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
        {AVAILABLE_LANGUAGES.map((langItem) => {
          const isSelected = currentLang === langItem.code;
          return (
            <button
              key={langItem.code}
              onClick={() => {
                onSelectLang(langItem.code);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">{langItem.flag}</span>
                <div className="text-left">
                  <div className="font-medium leading-tight">
                    {langItem.nativeName}
                  </div>
                  <div className={`text-[10px] leading-tight ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {langItem.name}
                  </div>
                </div>
              </div>

              {isSelected && (
                <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 px-2 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>Seleccionado: {currentOption?.nativeName || currentLang}</span>
        <span className="font-mono">13 idiomas</span>
      </div>
    </div>
  );
}
