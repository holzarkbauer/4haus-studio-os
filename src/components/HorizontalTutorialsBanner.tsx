import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface TutorialItem {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  duration: string;
  videoSrc: string;
  poster: string;
}

interface HorizontalTutorialsBannerProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  onOpenTutorialsModal: () => void;
}

export function HorizontalTutorialsBanner({
  lang,
  themeMode = 'dark',
  onOpenTutorialsModal,
}: HorizontalTutorialsBannerProps) {
  const isDark = themeMode === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const tutorials: TutorialItem[] = [
    {
      id: 1,
      tag: lang === 'en' ? 'AI Agents · Autonomy' : 'Agentes Autónomos · Daniel 1.0',
      title: lang === 'en' 
        ? 'Autonomous AI Agent Swarms with Daniel 1.0' 
        : 'Enjambres de Agentes Autónomos con Daniel 1.0',
      subtitle: lang === 'en'
        ? 'Configure Daniel to listen to webhooks, qualify prospects in 45 seconds, and orchestrate calendar bookings.'
        : 'Aprende a configurar a Daniel para escuchar webhooks, calificar prospectos en 45 segundos y agendar citas en piloto automático.',
      duration: '14 min',
      videoSrc: '/videos/stars.webm',
      poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2600&auto=format&fit=crop',
    },
    {
      id: 2,
      tag: lang === 'en' ? 'Voice Studio · Low Latency' : 'Motor de Voz · Ultrarrápido',
      title: lang === 'en'
        ? 'Custom Voice Cloning & Real-Time Audio Synthesis'
        : 'Clonación de Voz y Síntesis de Audio en Tiempo Real',
      subtitle: lang === 'en'
        ? 'Calibrate neural voice models with 60 seconds of reference audio, generating bilingual low-latency speech.'
        : 'Calibra perfiles neuronales bilingües con 60 segundos de referencia para reproducir voz natural sin latencia perceptible.',
      duration: '18 min',
      videoSrc: '/videos/waves.webm',
      poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2600&auto=format&fit=crop',
    },
    {
      id: 3,
      tag: lang === 'en' ? 'Web Architecture · Apple 2025' : 'Ingeniería Web · Estándar Apple',
      title: lang === 'en'
        ? 'High-Converting Landing Architecture & Live Systems'
        : 'Arquitectura Web de Alta Conversión y Sistemas en Vivo',
      subtitle: lang === 'en'
        ? 'Breakdown of Apple-grade visual hierarchy, Core Web Vitals under 0.6s, and high-ticket conversion layouts.'
        : 'Desglose de jerarquía visual estilo Apple, Core Web Vitals inferiores a 0.6s y estructuras de alta conversión para clientes High-Ticket.',
      duration: '22 min',
      videoSrc: '/videos/resort.webm',
      poster: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2600&auto=format&fit=crop',
    },
    {
      id: 4,
      tag: lang === 'en' ? 'Growth CRM · $100M Offers' : 'CRM & Pipeline · Crecimiento',
      title: lang === 'en'
        ? 'LeadNicho Pipeline & Executive Keynote Automation'
        : 'Pipeline LeadNicho y Automatización de Keynotes',
      subtitle: lang === 'en'
        ? 'Filter high-liquidity buyer personas, sync Firestore CRM records, and export 5-slide executive PDF decks instantly.'
        : 'Filtra buyer personas con liquidez, sincroniza prospectos en Firestore y genera presentaciones Keynote ejecutivas en PDF.',
      duration: '12 min',
      videoSrc: '/videos/stars.webm',
      poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2600&auto=format&fit=crop',
    },
  ];

  const currentTutorial = tutorials[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tutorials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tutorials.length) % tutorials.length);
  };

  // Re-play video smoothly on slide change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <section 
      aria-label={lang === 'en' ? 'Live Tutorials' : 'Tutoriales en Vivo'}
      className="w-full relative rounded-3xl overflow-hidden border border-black/[0.08] dark:border-white/10 shadow-lg group select-none min-h-[190px] sm:min-h-[210px] md:h-[220px] transition-all"
    >
      {/* 1. BACKGROUND LIVE VIDEO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-zinc-950">
        <video
          ref={videoRef}
          key={currentTutorial.videoSrc}
          src={currentTutorial.videoSrc}
          poster={currentTutorial.poster}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110 transition-transform duration-700 ease-out"
        />
        {/* Apple 2025 Glass & Dark Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/75 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* 2. INNER CONTENT CONTAINER */}
      <div className="relative z-10 w-full h-full min-h-[190px] sm:min-h-[210px] md:h-[220px] flex items-center justify-between px-5 sm:px-8 py-5">
        
        {/* LEFT LATERAL CONTENT (Título y Subtítulo) */}
        <div className="flex flex-col justify-center max-w-xl sm:max-w-2xl lg:max-w-3xl pr-4 text-left">
          
          {/* Top Badge Row */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentTutorial.tag}</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-300 hidden sm:inline">
              {currentTutorial.duration}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              · {currentIndex + 1} / {tutorials.length}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm line-clamp-1 sm:line-clamp-2">
            {currentTutorial.title}
          </h2>

          {/* Subtitle */}
          <p className="mt-1 text-xs sm:text-sm text-zinc-200/90 leading-relaxed font-normal line-clamp-2 max-w-xl drop-shadow-xs">
            {currentTutorial.subtitle}
          </p>

          {/* Quick Action Button */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenTutorialsModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold tracking-tight shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current text-zinc-950" />
              <span>{lang === 'en' ? 'Watch Full Tutorial' : 'Ver tutorial completo'}</span>
            </button>
            <span className="text-[11px] text-zinc-400 hidden md:inline font-mono">
              {lang === 'en' ? 'Interactive walkthrough' : 'Guía práctica guiada'}
            </span>
          </div>

        </div>

        {/* RIGHT CONTROLS: PREV / NEXT ARROWS & PAGINATION */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg group/btn"
            title={lang === 'en' ? 'Previous tutorial' : 'Tutorial anterior'}
            aria-label={lang === 'en' ? 'Previous tutorial' : 'Tutorial anterior'}
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover/btn:-translate-x-0.5 transition-transform" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg group/btn"
            title={lang === 'en' ? 'Next tutorial' : 'Tutorial siguiente'}
            aria-label={lang === 'en' ? 'Next tutorial' : 'Tutorial siguiente'}
          >
            <ChevronRight className="w-5 h-5 text-white group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

        </div>

      </div>

      {/* 3. BOTTOM INDICATOR DOTS */}
      <div className="absolute bottom-2.5 right-6 z-20 hidden sm:flex items-center gap-1.5 pointer-events-auto">
        {tutorials.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex
                ? 'w-6 bg-white shadow-xs'
                : 'w-1.5 bg-white/35 hover:bg-white/60'
            }`}
            title={`Ir al tutorial ${idx + 1}`}
            aria-label={`Tutorial ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
