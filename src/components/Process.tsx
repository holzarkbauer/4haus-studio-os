import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface ProcessProps {
  lang: Language;
  onOpenBooking: () => void;
}

export function Process({ lang, onOpenBooking }: ProcessProps) {
  const t = translations[lang].process;

  return (
    <section id="process" className="py-20 sm:py-28 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
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

        {/* 4-Step Minimalist Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {t.steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col justify-between group p-6 sm:p-7 rounded-3xl bg-black/45 backdrop-blur-xl border border-white/15 hover:border-white/35 transition-all duration-300 shadow-xl">
              
              {/* Top border line indicator */}
              <div className="w-full h-px bg-white/10 mb-6 relative">
                <div className="absolute top-0 left-0 h-px bg-cyan-400 w-12 group-hover:w-full transition-all duration-500" />
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-500 group-hover:text-cyan-400 transition-colors duration-300 font-mono block mb-3">
                  {step.number}
                </span>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 flex items-center gap-2 text-xs font-mono text-zinc-300 border-t border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'en' ? `Milestone 0${idx + 1}` : `Hito 0${idx + 1}`}</span>
              </div>

            </div>
          ))}

        </div>

        {/* Bottom Fast Track Notice */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-black/45 backdrop-blur-xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white">
              {lang === 'en' ? "Ready to map out your system architecture?" : "¿Listo para definir la arquitectura de tu sistema?"}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {lang === 'en' ? "Average delivery timeline: 10 to 14 business days from sign-off to production." : "Tiempo promedio de entrega: 10 a 14 días hábiles desde el diagnóstico hasta producción."}
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-3 px-6 rounded-full transition-colors shrink-0"
          >
            <span>{lang === 'en' ? "Start with a Diagnostic" : "Empezar con Diagnóstico"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
