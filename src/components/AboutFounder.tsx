import { WhaleLogo } from './WhaleLogo';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { Check, Terminal, Layers, Globe, User, Upload } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';

interface AboutFounderProps {
  lang: Language;
  onOpenBooking: () => void;
}

export function AboutFounder({ lang, onOpenBooking }: AboutFounderProps) {
  const t = translations[lang].about;
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="about" className="py-20 sm:py-28 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Portrait / Emblem Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/20 p-8 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[460px]">
              
              {/* Top Bar with Whale mark */}
              <div className="flex items-center justify-between">
                <WhaleLogo className="h-8 w-8" showText={false} />
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  Founder & Architect
                </span>
              </div>

              {/* Central Minimalist Editorial Silhouette / Graphic */}
              <div className="my-auto py-8 text-center relative flex flex-col items-center justify-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-40 h-40 rounded-full border-2 border-white/30 p-1 shadow-2xl mb-5 overflow-hidden group bg-gradient-to-b from-zinc-800 to-zinc-950 cursor-pointer"
                  title={lang === 'en' ? 'Click to upload your portrait' : 'Clic para subir tu foto de fundador'}
                >
                  {customPhoto ? (
                    <img
                      id="about-founder-photo"
                      src={customPhoto}
                      alt="Founder & Systems Architect"
                      className="w-full h-full object-cover object-center rounded-full transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-zinc-900/90 text-zinc-400 group-hover:text-white transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover:bg-white/20 transition-colors">
                        <User className="w-8 h-8 text-white/90" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 group-hover:text-cyan-300">
                        <Upload className="w-3 h-3" />
                        {lang === 'en' ? 'Upload Photo' : 'Subir Foto'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 pointer-events-none" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="founder-photo-file-input"
                />

                <h3 className="text-2xl font-bold text-white tracking-tight">
                  José Trujillo
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Architect • Multi-Venture Founder • Systems Engineer
                </p>
              </div>

              {/* Bottom Philosophy Badge */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>4haus Studio</span>
                <span className="text-white font-semibold">System Builder</span>
              </div>

            </div>
          </div>

          {/* Right Column: Bio & Core Differentiator */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {t.tag}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {t.headline}
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
              <p>{t.bio1}</p>
              <p>{t.bio2}</p>
              <p className="text-white font-medium">{t.bio3}</p>
            </div>

            {/* Technical Pillars Badges */}
            <div className="pt-4">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                {lang === 'en' ? "Core Disciplines & Stack" : "Disciplinas y Stack Central"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {t.pills.map((pill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/50 border border-white/5 text-xs text-zinc-200"
                  >
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-3.5 px-7 rounded-full transition-colors"
              >
                {lang === 'en' ? "Talk Architecture with José" : "Hablar de Arquitectura con José"}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
