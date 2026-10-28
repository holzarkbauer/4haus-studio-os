import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface FAQProps {
  lang: Language;
  onOpenBooking: () => void;
}

export function FAQ({ lang, onOpenBooking }: FAQProps) {
  const t = translations[lang].faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-transparent relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            {t.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {t.headline}
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
            {t.subheadline}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 text-left">
          {t.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
                  isOpen
                    ? "bg-black/65 backdrop-blur-xl border-white/30 shadow-2xl"
                    : "bg-black/40 backdrop-blur-md border-white/15 hover:border-white/25"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-white tracking-tight pr-4">
                    {item.q}
                  </span>
                  <div className={`p-1.5 rounded-full bg-white/5 text-zinc-300 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/15 text-white' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-zinc-300 font-light leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom prompt */}
        <div className="mt-12 text-center text-xs text-zinc-400">
          <span>{lang === 'en' ? "Have a specific architectural requirement?" : "¿Tienes una necesidad técnica específica?"}</span>{' '}
          <button
            onClick={onOpenBooking}
            className="text-white font-semibold underline underline-offset-4 hover:text-zinc-300 transition-colors ml-1"
          >
            {lang === 'en' ? "Ask directly on your diagnostic call" : "Pregúntala en tu llamada de diagnóstico"}
          </button>
        </div>

      </div>
    </section>
  );
}
