import { Sparkles, Quote, ExternalLink, ArrowRight } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface SocialProofProps {
  lang: Language;
  onOpenLivePreview: (url: string, title: string) => void;
}

export function SocialProof({ lang, onOpenLivePreview }: SocialProofProps) {
  const t = translations[lang].results;

  const stats = [
    { number: t.stat1Number, label: t.stat1Label, desc: t.stat1Desc },
    { number: t.stat2Number, label: t.stat2Label, desc: t.stat2Desc },
    { number: t.stat3Number, label: t.stat3Label, desc: t.stat3Desc },
    { number: t.stat4Number, label: t.stat4Label, desc: t.stat4Desc },
  ];

  return (
    <section id="results" className="py-20 sm:py-28 bg-transparent relative">
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

        {/* 4 Stat Tiles Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/15 hover:border-white/35 transition-all text-left shadow-xl"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-mono mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-zinc-200 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-zinc-400 font-light">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Big Featured Hero Testimonial Card — Melissa, Owner at AMOOO */}
        <div className="relative rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/20 p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.04] blur-3xl rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Quote Content */}
            <div className="lg:col-span-8 text-left space-y-6">
              <Quote className="w-10 h-10 text-zinc-400 opacity-60" />
              
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-light text-white leading-relaxed tracking-tight">
                {t.testimonialQuote}
              </blockquote>

              <div className="pt-2 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-white to-zinc-400 text-black font-bold flex items-center justify-center text-sm shadow-md">
                  M
                </div>
                <div>
                  <div className="text-base font-bold text-white tracking-tight">
                    {t.testimonialAuthor}
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    {t.testimonialRole}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Live Case Study Launcher */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between space-y-5 text-left">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {t.livePreviewLabel}
                </span>
                <h4 className="text-lg font-bold text-white tracking-tight mt-3">
                  AMOOO Tienda
                </h4>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  amooo-tienda.ai.studio
                </p>
                <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                  {lang === 'en'
                    ? "Production e-commerce deployment built for seamless brand presentation and high conversion."
                    : "Plataforma de comercio electrónico en producción construida para presentación impecable y alta conversión."}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onOpenLivePreview("https://amooo-tienda.ai.studio", "AMOOO Tienda — Live Client Deployment")}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-xs py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  <span>{t.previewBtn}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <a
                  href="https://amooo-tienda.ai.studio"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-white py-2 transition-colors font-mono"
                >
                  <span>Open live link</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* Transparent Metric Telemetry Disclaimer */}
          <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-zinc-500 text-left">
            {t.disclaimer}
          </div>

        </div>

      </div>
    </section>
  );
}
