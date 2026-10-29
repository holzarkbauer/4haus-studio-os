import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X, MessageCircle } from 'lucide-react';
import { Language } from '../types';

// Piezas comunes del formato "paso a paso" que comparten las herramientas del menú lateral:
// - StepProgress: barra "Paso 2 de 4" con los nombres de los pasos.
// - StepNav: botones Atrás / Siguiente.
// - DanielGuideBubble: globo junto al botón de Daniel que se abre solo en cada paso.

export function StepProgress({ steps, current, isDark }: { steps: string[]; current: number; isDark: boolean }) {
  return (
    <div className="space-y-3">
      <div className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-[#6E6E73]'}`}>
        {`Paso ${current + 1} de ${steps.length}`}
      </div>
      <div className="flex items-center gap-2">
        {steps.map((label, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={label} className="flex-1 min-w-0">
              <div
                className={`h-1 rounded-full transition-colors ${
                  done || active ? (isDark ? 'bg-white' : 'bg-[#1D1D1F]') : isDark ? 'bg-white/15' : 'bg-black/[0.08]'
                }`}
              />
              <div
                className={`mt-2 text-[11px] truncate flex items-center gap-1 ${
                  active ? (isDark ? 'text-white font-semibold' : 'text-[#1D1D1F] font-semibold') : isDark ? 'text-zinc-500' : 'text-[#86868B]'
                }`}
              >
                {done && <Check className="w-3 h-3 shrink-0" />}
                <span className="truncate">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepNav({
  lang,
  isDark,
  canBack,
  onBack,
  nextLabel,
  onNext,
  nextDisabled,
  busy,
}: {
  lang: Language;
  isDark: boolean;
  canBack: boolean;
  onBack: () => void;
  nextLabel: string;
  onNext: () => void;
  nextDisabled?: boolean;
  busy?: boolean;
}) {
  const isEn = lang === 'en';
  return (
    <div className="flex items-center justify-between pt-2">
      {canBack ? (
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${
            isDark ? 'text-zinc-300 hover:bg-white/5' : 'text-[#1D1D1F] hover:bg-black/[0.04]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {isEn ? 'Back' : 'Atrás'}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || busy}
        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
          isDark ? 'bg-white text-black' : 'bg-[#1D1D1F] text-white'
        }`}
      >
        {busy ? (isEn ? 'Working...' : 'Trabajando...') : nextLabel}
        {!busy && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

/** Pide algo a Daniel: abre su widget y envía la pregunta. */
export function askDaniel(text: string) {
  window.dispatchEvent(new CustomEvent('daniel:ask', { detail: { text } }));
}

export function DanielGuideBubble({
  lang,
  stepKey,
  message,
  helpQuestion,
}: {
  lang: Language;
  /** Cambia en cada paso: el globo vuelve a abrirse aunque se haya cerrado antes. */
  stepKey: string;
  message: string;
  helpQuestion: string;
}) {
  const isEn = lang === 'en';
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, [stepKey]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 right-6 z-40 w-[300px] max-w-[calc(100vw-3rem)] rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl p-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold text-[#86868B]">Daniel</div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-0.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
          aria-label={isEn ? 'Close tip' : 'Cerrar consejo'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-[#1D1D1F] dark:text-zinc-100">{message}</p>
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          askDaniel(helpQuestion);
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] dark:text-white hover:underline cursor-pointer"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {isEn ? 'Ask Daniel for help' : 'Pedirle ayuda a Daniel'}
      </button>
      {/* Pico del globo apuntando al botón de Daniel */}
      <span className="absolute -bottom-1.5 right-7 w-3 h-3 rotate-45 bg-white dark:bg-zinc-900 border-r border-b border-black/[0.08] dark:border-white/10" />
    </div>
  );
}
