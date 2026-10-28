import { ArrowRight, MessageSquare, Zap } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface FinalCTAProps {
  lang: Language;
  onOpenBooking: () => void;
}

export function FinalCTA({ lang, onOpenBooking }: FinalCTAProps) {
  const t = translations[lang].finalCta;

  const whatsappMessage = lang === 'en'
    ? encodeURIComponent("Hi José, I'd like to book a diagnostic call with 4haus.us for AI automation.")
    : encodeURIComponent("Hola José, me gustaría agendar una llamada de diagnóstico con 4haus.us para automatización con IA.");

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <section className="py-20 sm:py-28 bg-transparent relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="p-8 sm:p-14 lg:p-16 rounded-[36px] sm:rounded-[44px] bg-black/55 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
          {/* Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-[11px] font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />
            <span>{t.kicker}</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            {t.headline}
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed mb-10">
            {t.subheadline}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black font-semibold text-sm sm:text-base px-8 py-4 rounded-full transition-all duration-200 shadow-[0_0_35px_rgba(255,255,255,0.22)] active:scale-98 cursor-pointer"
            >
              <span>{t.primaryBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm sm:text-base px-6 py-4 rounded-full transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{t.secondaryBtn}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
