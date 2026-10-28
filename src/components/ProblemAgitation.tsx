import { Clock, DollarSign, Moon } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface ProblemAgitationProps {
  lang: Language;
}

export function ProblemAgitation({ lang }: ProblemAgitationProps) {
  const t = translations[lang].problem;

  const items = [
    {
      icon: Clock,
      title: t.bullet1Title,
      text: t.bullet1Text,
      stat: "78%",
      statDesc: lang === 'en' ? "Lost to first responder" : "Compran al primero",
    },
    {
      icon: DollarSign,
      title: t.bullet2Title,
      text: t.bullet2Text,
      stat: "15+ hrs",
      statDesc: lang === 'en' ? "Wasted per week" : "Perdidas por semana",
    },
    {
      icon: Moon,
      title: t.bullet3Title,
      text: t.bullet3Text,
      stat: "60+ hrs",
      statDesc: lang === 'en' ? "Weekend blackout delay" : "Retraso fin de semana",
    },
  ];

  return (
    <section id="problem" className="py-20 sm:py-28 bg-transparent relative">
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

        {/* 3 High-Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl bg-black/50 backdrop-blur-xl border border-white/15 p-8 hover:border-white/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-xl"
              >
                {/* Stat Callout on Top */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="p-3 rounded-xl bg-white/5 text-white group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white font-mono">{item.stat}</div>
                    <div className="text-[11px] text-zinc-400 font-medium">{item.statDesc}</div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
