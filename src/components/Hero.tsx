import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Play, 
  ExternalLink, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language, BackgroundTheme, PageId } from '../types';
import { InstagramIcon, FacebookIcon, LinkedInIcon, XIcon } from './SocialIcons';

interface HeroProps {
  lang: Language;
  setLang?: (lang: Language) => void;
  theme?: BackgroundTheme;
  onNavigate?: (page: PageId) => void;
  onOpenBooking: () => void;
  onOpenLivePreview: (url: string, title: string) => void;
}

export function Hero({ lang, setLang, theme = 'beach-waves', onNavigate, onOpenBooking, onOpenLivePreview }: HeroProps) {
  const t = translations[lang].hero;
  const navT = translations[lang].nav;
  const [activeSlide, setActiveSlide] = useState(0);

  const heroBackgrounds: Record<BackgroundTheme, string> = {
    'beach-waves': "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2600&auto=format&fit=crop",
    'night-stars': "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2600&auto=format&fit=crop",
    'beach-resort': "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2600&auto=format&fit=crop",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2600&auto=format&fit=crop",
    alpine: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2600&auto=format&fit=crop",
    obsidian: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2600&auto=format&fit=crop",
    aurora: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2600&auto=format&fit=crop",
  };

  const heroVideos: Partial<Record<BackgroundTheme, string>> = {
    'beach-waves': '/videos/waves.webm',
    beach: '/videos/waves.webm',
    'night-stars': '/videos/stars.webm',
    'beach-resort': '/videos/resort.webm',
  };

  const currentBg = heroBackgrounds[theme] || heroBackgrounds['beach-waves'];
  const currentVideo = heroVideos[theme];

  const showcaseProjects = [
    {
      id: "amooo",
      title: "AMOOO Store",
      locationTag: "amooo-tienda.ai.studio",
      country: lang === 'en' ? "E-Commerce & High-Conversion Web" : "E-Commerce y Web de Alta Conversión",
      client: "Melissa — Owner",
      url: "https://amooo-tienda.ai.studio",
      description: lang === 'en'
        ? "Bespoke digital storefront engineered for conversion and brand elegance with instant loading."
        : "Tienda digital a medida diseñada para máxima conversión y elegancia de marca con carga inmediata.",
      stat: lang === 'en' ? "100% Live in Production" : "100% Activa en Producción",
      // Turquoise alpine lake matching the reference image
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      isLiveUrl: true,
    },
    {
      id: "leads-engine",
      title: "WhatsApp Qualifier",
      locationTag: "api.whatsapp.com/4haus",
      country: lang === 'en' ? "Lead Engine 24/7" : "Pipeline Autónomo 24/7",
      client: "Real Estate & High-Ticket Services",
      url: "https://amooo-tienda.ai.studio",
      description: lang === 'en'
        ? "Filters inbound inquiries in under 60 seconds, pre-qualifies budget & intent, and books sales calls."
        : "Filtra consultas entrantes en menos de 60 segundos, pre-califica presupuesto e intención y agenda citas.",
      stat: lang === 'en' ? "< 45s Median Response" : "< 45s Respuesta Promedio",
      // Majestic mountain ridge
      image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1200&auto=format&fit=crop",
      isLiveUrl: false,
    },
    {
      id: "ops-n8n",
      title: "n8n + Claude Ops Engine",
      locationTag: "workflows.4haus.us",
      country: lang === 'en' ? "Autonomous Workflows" : "Flujos Autónomos",
      client: "Cross-Platform Operations",
      url: "https://amooo-tienda.ai.studio",
      description: lang === 'en'
        ? "Replaces manual CRM data entry, automated invoice tracking, and customer alerts across tools."
        : "Reemplaza el registro manual de datos en CRM, seguimiento de facturas y alertas entre herramientas.",
      stat: lang === 'en' ? "15+ Hours Saved / Week" : "15+ Horas Ahorradas / Sem",
      // Moody atmospheric alpine peak
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop",
      isLiveUrl: false,
    },
    {
      id: "daniel-brain",
      title: "Daniel AI Second Brain",
      locationTag: "daniel.4haus.us",
      country: lang === 'en' ? "Executive AI System" : "Sistema Ejecutivo IA",
      client: "Founder Knowledge & Decision Core",
      url: "https://amooo-tienda.ai.studio",
      description: lang === 'en'
        ? "Autonomous executive assistant that indexes business operations, assets, and decisions."
        : "Asistente ejecutivo autónomo que organiza procesos, decisiones y productos digitales.",
      stat: lang === 'en' ? "Staging Preview" : "En Pruebas Staging",
      // Celestial starry mountain summit
      image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1200&auto=format&fit=crop",
      isLiveUrl: false,
    }
  ];

  const currentProject = showcaseProjects[activeSlide];
  const nextProject = showcaseProjects[(activeSlide + 1) % showcaseProjects.length];

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % showcaseProjects.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + showcaseProjects.length) % showcaseProjects.length);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-28 overflow-hidden bg-transparent"
    >
      {/* Outer blurred panoramic backdrop creating the soft depth framing from reference image */}
      {currentVideo ? (
        <video
          src={currentVideo}
          poster={currentBg}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-110 opacity-30 pointer-events-none transition-all duration-700"
          aria-hidden="true"
        />
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-110 opacity-30 pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url('${currentBg}')`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Outer soft vignette */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Floating Canvas Frame - Exact Match to Attached Image */}
      <div className="relative w-full max-w-[1340px] min-h-[660px] lg:min-h-[720px] rounded-[26px] sm:rounded-[36px] lg:rounded-[42px] overflow-hidden border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.85)] z-10 flex flex-col justify-between bg-black/35 backdrop-blur-md pt-8 sm:pt-12 lg:pt-14">
        
        {/* Crisp Sharp Landscape Background inside the frame */}
        {currentVideo ? (
          <video
            src={currentVideo}
            poster={currentBg}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none opacity-50"
          />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
            style={{
              backgroundImage: `url('${currentBg}')`,
            }}
          />
        )}

        {/* Cinematic Scrim Gradient (Left dark for text contrast, top soft vignette for nav) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Central Content Grid */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 sm:px-10 lg:px-12 py-8 sm:py-12 my-auto">
          
          {/* Left Column: Location Kicker, Display Headline, Subtitle & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-2xl">
            
            {/* Location Tag / Kicker with MapPin icon */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/90 mb-4 sm:mb-5">
              <MapPin className="w-3.5 h-3.5 fill-white text-transparent shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs tracking-wider">
                {t.kicker}
              </span>
            </div>

            {/* Display Headline matching typography in image */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold text-white tracking-tight leading-[1.08] mb-5">
              <span className="block">{t.headlineLine1}</span>
              <span className="block">{t.headlineLine2}</span>
            </h1>

            {/* Subtitle matching style in image */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-200 font-light leading-relaxed mb-8 max-w-xl">
              {t.subheadline}
            </p>

            {/* CTA Buttons matching reference image */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-6">
              
              {/* Button 1: Dark frosted glass pill "Explore Now" */}
              <button
                onClick={() => onNavigate ? onNavigate('contact') : onOpenBooking()}
                className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/25 hover:border-white/50 text-white font-medium text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-[1.02] shadow-xl active:scale-98 cursor-pointer"
              >
                {t.ctaPrimary}
              </button>

              {/* Button 2: Circular outline play button + "Play the demo" */}
              <button
                onClick={() => onOpenLivePreview("https://amooo-tienda.ai.studio", "AMOOO Tienda — Live Client Build")}
                className="flex items-center gap-3 text-white hover:text-zinc-200 text-xs sm:text-sm font-medium transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/60 group-hover:border-white group-hover:bg-white/15 flex items-center justify-center transition-all backdrop-blur-xs shadow-sm">
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                </div>
                <span>{t.ctaSecondary}</span>
              </button>

            </div>

          </div>

          {/* Right Column: Destination Showcase Cards (Matching Reference Image Carousel) */}
          <div className="lg:col-span-5 relative flex items-center justify-start lg:justify-end mt-4 lg:mt-0">
            
            <div className="relative flex items-center gap-4 w-full justify-start lg:justify-end">
              
              {/* Primary Active Card (Tall portrait card with turquoise lake & destination pin) */}
              <div 
                onClick={() => onOpenLivePreview(currentProject.url, `${currentProject.title} — 4haus Production System`)}
                className="relative w-[270px] sm:w-[310px] h-[360px] sm:h-[410px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group cursor-pointer transition-all duration-300 hover:scale-[1.02] shrink-0"
              >
                {/* Background Image of the Destination / System */}
                <img
                  src={currentProject.image}
                  alt={currentProject.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle vignette over the card */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Live Pill badge on top */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentProject.stat}</span>
                </div>

                {/* Bottom destination pin badge matching reference screenshot */}
                <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-left">
                  <div className="flex items-center gap-1.5 text-white text-xs font-semibold tracking-tight">
                    <MapPin className="w-3.5 h-3.5 fill-white text-transparent shrink-0" />
                    <span className="truncate">{currentProject.title}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-light mt-0.5 truncate pl-5">
                    {currentProject.country}
                  </div>
                </div>

              </div>

              {/* Next Card Peek (Shows partially on the right just like in the screenshot!) */}
              <div 
                onClick={handleNext}
                className="relative hidden sm:block w-[70px] sm:w-[110px] h-[360px] sm:h-[410px] rounded-3xl overflow-hidden shadow-xl border border-white/15 opacity-60 hover:opacity-85 transition-all duration-300 cursor-pointer shrink-0"
              >
                <img
                  src={nextProject.image}
                  alt={nextProject.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-4 left-3 right-3 text-left">
                  <div className="flex items-center gap-1 text-white text-[11px] font-semibold truncate">
                    <MapPin className="w-3 h-3 fill-white text-transparent shrink-0" />
                    <span className="truncate">{nextProject.title}</span>
                  </div>
                </div>
              </div>

              {/* White Circular Slide Button (Positioned on the edge between cards) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next destination card"
                className="absolute right-12 sm:right-24 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-black stroke-[2.5]" />
              </button>

            </div>

          </div>

        </div>

        {/* Bottom Bar inside the Frame (Frosted cards on the left, social tags on the right) */}
        <div className="relative z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-6 sm:px-10 lg:px-12 pb-6 sm:pb-8">
          
          {/* Bottom Left: 2 Frosted Glass Metric/Pillar Cards (Matching "Excellence" & "Sustainable" in reference) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            
            {/* Card 1: Excellence */}
            <div className="px-4 py-3 sm:py-3.5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 flex items-center gap-2.5 max-w-sm shadow-lg">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight shrink-0">
                {t.badge1Title}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-light leading-snug">
                {t.badge1Text}
              </span>
            </div>

            {/* Card 2: Sustainable / Zero Leaks */}
            <div className="px-4 py-3 sm:py-3.5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 flex items-center gap-2.5 max-w-sm shadow-lg">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight shrink-0">
                {t.badge2Title}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-light leading-snug">
                {t.badge2Text}
              </span>
            </div>

          </div>

          {/* Bottom Right: Official Social Media Icons with original glyphs & exact user links */}
          <div className="flex items-center gap-2.5 sm:gap-3 md:self-end">
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/josetrujillo.ia/" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-pink-500/50 text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-sm active:scale-95"
              title="Instagram @josetrujillo.ia"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5 group-hover:text-pink-400 transition-colors" />
              <span className="text-[11px] font-medium font-mono text-zinc-400 group-hover:text-white">ig</span>
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/profile.php?id=61582005755057" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-blue-500/50 text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-sm active:scale-95"
              title="Facebook Profile"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-3.5 h-3.5 group-hover:text-blue-400 transition-colors" />
              <span className="text-[11px] font-medium font-mono text-zinc-400 group-hover:text-white">fb</span>
            </a>

            {/* X (Twitter) */}
            <a 
              href="https://x.com/Jose_eaglelife" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-white/50 text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-sm active:scale-95"
              title="X @Jose_eaglelife"
              aria-label="X"
            >
              <XIcon className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
              <span className="text-[11px] font-medium font-mono text-zinc-400 group-hover:text-white">tw</span>
            </a>

            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/in/jos%C3%A9-trujillo-74a414334/" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-sky-500/50 text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-sm active:scale-95"
              title="LinkedIn José Trujillo"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-3.5 h-3.5 group-hover:text-sky-400 transition-colors" />
              <span className="text-[11px] font-medium font-mono text-zinc-400 group-hover:text-white">in</span>
            </a>
          </div>

        </div>

      </div>

    </section>
  );
}
