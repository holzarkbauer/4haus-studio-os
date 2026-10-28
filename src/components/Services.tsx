import { Bot, Globe, Cpu, Award, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface ServicesProps {
  lang: Language;
  onOpenBooking: () => void;
}

export function Services({ lang, onOpenBooking }: ServicesProps) {
  const t = translations[lang].services;

  const serviceIcons = [Bot, Globe, Cpu, Award];

  return (
    <section id="services" className="py-20 sm:py-28 bg-transparent relative">
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

        {/* 4 Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {t.items.map((service, idx) => {
            const Icon = serviceIcons[idx % serviceIcons.length];
            return (
              <div
                key={service.id}
                className="group relative rounded-3xl bg-black/50 backdrop-blur-xl border border-white/20 p-8 sm:p-10 hover:border-white/40 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-black/80 shadow-lg"
              >
                <div>
                  {/* Top Bar: Engine Tag & Icon */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <span className="text-xs font-mono font-semibold tracking-wider text-zinc-400">
                      {service.tag}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
                    {service.title}
                  </h3>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                    {service.description}
                  </p>

                  {/* Concrete Result Box */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-6">
                    <p className="text-xs sm:text-sm font-medium text-white">
                      {service.result}
                    </p>
                  </div>

                  {/* Key Implementation Points */}
                  <ul className="space-y-2 mb-8">
                    {service.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={onOpenBooking}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white hover:text-zinc-300 transition-colors group/btn"
                  >
                    <span>{lang === 'en' ? "Deploy This System" : "Implementar Este Sistema"}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {lang === 'en' ? "Sprint Timeline: 10-14d" : "Tiempo de entrega: 10-14d"}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
