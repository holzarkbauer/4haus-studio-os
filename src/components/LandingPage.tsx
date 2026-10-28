import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Globe,
  Code2,
  Bot,
  Zap,
  Layout,
  Workflow,
  CheckCircle2,
  Rocket,
  Sun,
  Moon,
  Monitor,
  Database,
  ShieldCheck,
  Sparkles,
  Play,
} from 'lucide-react';
import { SoundWaveLogo } from './SoundWaveLogo';
import { Language } from '../types';
import { LanguageDropdown } from './LanguageDropdown';
import { AVAILABLE_LANGUAGES } from '../i18n/languages';

import heroAppleStudioImg from '../assets/images/apple_style_hero_studio_1791624467893.jpg';
import bentoWebEngineImg from '../assets/images/apple_bento_web_engine_1791624476388.jpg';
import bentoDanielAiImg from '../assets/images/apple_bento_daniel_ai_1791624485612.jpg';
import bentoGrowthCrmImg from '../assets/images/apple_bento_growth_crm_1791624494223.jpg';

interface LandingPageProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  themeMode?: 'light' | 'dark';
  onToggleThemeMode?: () => void;
  onOpenApp: () => void;
  onOpenPlans: () => void;
  onOpenBooking: () => void;
  onOpenAboutModal?: (tab?: any) => void;
}

export function LandingPage({
  lang,
  onSetLang,
  themeMode = 'light',
  onToggleThemeMode,
  onOpenApp,
  onOpenPlans,
  onOpenBooking,
  onOpenAboutModal,
}: LandingPageProps) {
  const isDark = themeMode === 'dark';
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Hero Interactive Studio Configurator State
  const [heroTab, setHeroTab] = useState<'web' | 'agents' | 'systems'>('web');
  const [selectedPreset, setSelectedPreset] = useState<'saas' | 'enterprise' | 'daniel' | 'ops'>('saas');
  const [heroLang, setHeroLang] = useState<'es' | 'en' | 'fr' | 'zh'>('es');
  const [heroPromptText, setHeroPromptText] = useState(
    'Diseñar una plataforma web de alta conversión con carga inferior a 0.6s, conectar a Daniel 1.0 para calificar inversores y propietarios en menos de 45 segundos, y sincronizar reuniones directamente en el calendario ejecutivo.'
  );
  const [isSimulatingBuild, setIsSimulatingBuild] = useState(false);
  const [buildStep, setBuildStep] = useState<string | null>(null);

  // Interactive Bento Tab State
  const [activeSolutionTab, setActiveSolutionTab] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === lang) || AVAILABLE_LANGUAGES[0];

  const handleSelectPreset = (presetKey: 'saas' | 'enterprise' | 'daniel' | 'ops') => {
    setSelectedPreset(presetKey);
    if (presetKey === 'saas') {
      setHeroPromptText(
        'Plataforma web con estética Apple 2025, Core Web Vitals 99/100 y portal de clientes con facturación automatizada y embudo de alta conversión.'
      );
    } else if (presetKey === 'enterprise') {
      setHeroPromptText(
        'Portal inmobiliario y patrimonial de alto ticket con Dossier Confidencial Off-Market, calificación automática de liquidez y CRM sincronizado.'
      );
    } else if (presetKey === 'daniel') {
      setHeroPromptText(
        'Agente autónomo Daniel 1.0 integrado como copiloto ejecutivo: respuesta en 45 segundos, voz natural personalizada y agendamiento 24/7.'
      );
    } else if (presetKey === 'ops') {
      setHeroPromptText(
        'Sistema operativo de crecimiento por nicho (Growth & Niche OS): detección de 3 Buyer Personas, campañas multicanal y presentaciones Keynote.'
      );
    }
  };

  const handleSimulateBuild = () => {
    if (isSimulatingBuild) return;
    setIsSimulatingBuild(true);
    setBuildStep('1. Compilando arquitectura Apple 2025 & Tailwind...');
    setTimeout(() => {
      setBuildStep('2. Sincronizando agente autónomo Daniel 1.0...');
    }, 800);
    setTimeout(() => {
      setBuildStep('3. Abriendo tu espacio de trabajo en Studio OS...');
      setTimeout(() => {
        setIsSimulatingBuild(false);
        setBuildStep(null);
        onOpenApp();
      }, 600);
    }, 1600);
  };

  const solutionItems = [
    {
      id: 'web',
      index: '01',
      title: 'Ingeniería Web de Precisión',
      desc: 'Interfaces inspiradas en el estándar visual de Cupertino: tipografía impecable, carga en menos de 0.6 segundos y estructuras diseñadas para convertir decisores de alto ticket.',
      stats: 'Lighthouse 99+ · <0.6s FCP · Diseño Editorial',
      image: bentoWebEngineImg,
    },
    {
      id: 'agents',
      index: '02',
      title: 'Agente Autónomo Daniel 1.0',
      desc: 'Tu copiloto ejecutivo con memoria contextual y código moral propio. Filtra prospectos en menos de 45 segundos, responde con tu voz maestra y agenda reuniones reales 24/7.',
      stats: 'Respuesta en 45s · Memoria Activa · Voz Maestra',
      image: bentoDanielAiImg,
    },
    {
      id: 'systems',
      index: '03',
      title: 'Growth & Niche OS ($100M Offers)',
      desc: 'Define tu nicho, activa 3 Buyer Personas con liquidez verificada, lanza secuencias por correo y genera presentaciones ejecutivas Keynote en PDF en un solo lugar.',
      stats: '12.4x LTV:CAC · 82% Margen · CRM en Vivo',
      image: bentoGrowthCrmImg,
    },
  ];

  const testimonials = [
    {
      author: 'Carlos Mendoza',
      role: 'Director General · Grupo Altea Prime Real Estate',
      metric: '+240% Reuniones Cualificadas en 60 Días',
      text: 'Pasamos de tardar horas en contestar portales inmobiliarios a filtrar propietarios e inversores en 45 segundos con 4haus Studio OS. El primer cierre amortizó todo el año.',
    },
    {
      author: 'Elena Rostova',
      role: 'Managing Partner · ScaleOps Venture Advisory',
      metric: '12.4x Retorno sobre Adquisición',
      text: 'La claridad visual de las presentaciones Keynote que genera Daniel 1.0 y la precisión del CRM por nicho transformaron por completo cómo presentamos tesis de inversión.',
    },
    {
      author: 'Javier Salvatierra',
      role: 'Founder · Fintech & B2B Capital Studio',
      metric: '82% Margen Operativo con IA',
      text: 'El diseño tiene la limpieza de Apple y la profundidad comercial de una consultora estratégica. Todo el equipo opera hoy desde un único sistema sin fricción manual.',
    },
  ];

  const faqs = [
    {
      q: '01. ¿Qué incluye exactamente el ecosistema 4haus Studio OS?',
      a: 'Integra tres pilares en una sola arquitectura: 1) Diseño y despliegue de páginas web de alta conversión con estética minimalista; 2) El Agente Autónomo Daniel 1.0 para atención, filtrado en 45 segundos y presentaciones ejecutivas; y 3) El motor Growth & Niche OS con CRM de prospectos, campañas multicanal y generador de ofertas $100M.',
    },
    {
      q: '02. ¿En qué se diferencia de una agencia tradicional o un creador web genérico?',
      a: 'Las agencias tradicionales entregan páginas lentas sin sistema comercial detrás. 4haus combina diseño industrial de nivel Apple 2025 con ingeniería en tiempo real (React, TypeScript, Firestore, Gmail API y voz personalizada) para que tu web capture, califique y agende clientes sin intervención manual.',
    },
    {
      q: '03. ¿Cómo funciona Daniel 1.0 dentro de mi flujo de trabajo diario?',
      a: 'Daniel 1.0 te acompaña en la esquina inferior derecha de cualquier sección. Recuerda tu última sesión, actualiza automáticamente los formularios de tu estrategia de nicho y genera al instante tanto presentaciones Keynote de 5 láminas para inversores como tu guía privada de expositor en PDF.',
    },
    {
      q: '04. ¿Somos propietarios del código, los datos y la cartera de clientes?',
      a: 'Sí, al 100%. Todos los prospectos en el CRM, configuraciones de nicho, plantillas, presentaciones exportadas y código fuente pertenecen íntegramente a tu empresa desde el primer día.',
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-black text-[#F5F5F7] selection:bg-[#0071E3] selection:text-white'
          : 'bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white'
      }`}
    >
      {/* =========================================================================
          1. APPLE 2025 GLOBAL NAVIGATION BAR (Strict 3-Zone Top Bar Contract)
          Zone 1: Single Brand Wordmark | Zone 2: 5 Single-Line Links | Zone 3: 1 Primary CTA
          ========================================================================= */}
      <header
        className={`sticky top-0 z-50 w-full h-14 apple-glass-nav border-b transition-colors ${
          isDark
            ? 'bg-black/75 border-white/10 text-[#F5F5F7]'
            : 'bg-white/75 border-black/[0.08] text-[#1D1D1F]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between gap-8">
          {/* Zone 1: Single Clean Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-base font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            4haus Studio
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#86868B]">
            <button
              type="button"
              onClick={() => scrollToSection('ecosistema')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-[#1D1D1F]'
              }`}
            >
              Ecosistema
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('arquitectura')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-[#1D1D1F]'
              }`}
            >
              Arquitectura
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('estudio')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-[#1D1D1F]'
              }`}
            >
              Studio OS
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('resultados')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-[#1D1D1F]'
              }`}
            >
              Resultados
            </button>
            <button
              type="button"
              onClick={onOpenPlans}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-[#1D1D1F]'
              }`}
            >
              Precios
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenApp}
              className="px-4 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold tracking-tight transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Abrir Studio OS
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. APPLE 2025 KEYNOTE HERO SECTION (Centered Display Typography + 16:9 Stage)
          ========================================================================= */}
      <section id="top" className="pt-14 pb-20 px-6 max-w-[1200px] mx-auto">
        {/* Quiet Workspace Utility Strip (Theme & Language Controls placed cleanly below nav) */}
        <div className="flex items-center justify-between gap-4 mb-12 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#0071E3]">4haus Studio 2025</span>
            <span aria-hidden="true">·</span>
            <span>Ingeniería Web, Daniel 1.0 &amp; Growth OS</span>
          </div>

          <div className="flex items-center gap-2.5">
            {onToggleThemeMode && (
              <button
                type="button"
                onClick={onToggleThemeMode}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'bg-[#1D1D1F] border-white/10 text-zinc-200 hover:bg-zinc-800'
                    : 'bg-white border-black/[0.08] text-[#1D1D1F] hover:bg-zinc-100'
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isDark ? 'Acabado Claro' : 'Acabado Oscuro'}</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'bg-[#1D1D1F] border-white/10 text-zinc-200 hover:bg-zinc-800'
                    : 'bg-white border-black/[0.08] text-[#1D1D1F] hover:bg-zinc-100'
                }`}
              >
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              <LanguageDropdown
                isOpen={isLanguageDropdownOpen}
                onClose={() => setIsLanguageDropdownOpen(false)}
                currentLang={lang}
                onSelectLang={(newLang) => {
                  onSetLang(newLang);
                  setIsLanguageDropdownOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        {/* Centered Apple Keynote Display Statement */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-14">
          <p className="text-xs sm:text-sm font-semibold tracking-tight text-[#0071E3]">
            Arquitectura Autónoma de Crecimiento · Edición 2025
          </p>

          <h1
            className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight leading-[1.05]"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Crea{' '}
            <span className="apple-intelligence-text">sin límites.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
            Páginas web de precisión milimétrica, el agente autónomo Daniel 1.0 que filtra oportunidades en 45 segundos y un sistema completo de captación High-Ticket.
          </p>

          {/* Single Primary CTA + Clean Text Secondary Link (Apple Keynote Pair) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6">
            <button
              type="button"
              onClick={onOpenApp}
              className="px-7 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-semibold tracking-tight shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Entrar a 4haus Studio OS
            </button>

            <button
              type="button"
              onClick={onOpenBooking}
              className="text-sm font-semibold text-[#0071E3] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Agendar sesión estratégica</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16:9 Flagship Hardware & Spatial UI Showcase Frame */}
        <div
          className={`relative rounded-[32px] overflow-hidden border transition-all ${
            isDark
              ? 'bg-[#1D1D1F] border-white/10 shadow-2xl'
              : 'bg-white border-black/[0.08] shadow-xl'
          }`}
        >
          <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-900">
            <img
              src={heroAppleStudioImg}
              alt="4haus Studio OS Apple 2025 Spatial Interface"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-12 text-left text-white">
              <div className="max-w-3xl space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                  <span>4haus Studio OS</span>
                  <span aria-hidden="true">·</span>
                  <span>Daniel 1.0 Co-Pilot</span>
                  <span aria-hidden="true">·</span>
                  <span>Ofertas Grand Slam ($100M)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Todo tu sistema comercial y de captación en una superficie impecable.
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  Desde la definición del nicho y los 3 perfiles de comprador hasta la generación de presentaciones ejecutivas Keynote en PDF y campañas reales por correo.
                </p>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Quantitative Proof Bar below the Hero Split */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x ${
              isDark
                ? 'bg-[#141416] divide-white/10 text-white'
                : 'bg-white divide-black/[0.06] text-[#1D1D1F]'
            }`}
          >
            {[
              {
                value: '12.4x',
                label: 'Retorno LTV : CAC proyectado en campañas High-Ticket',
              },
              {
                value: '45 seg',
                label: 'Tiempo de respuesta y filtrado 24/7 con Daniel 1.0',
              },
              {
                value: '82%',
                label: 'Margen bruto operativo mediante automatización IA',
              },
              {
                value: '< 35 d',
                label: 'Periodo estimado de recuperación de capital (Payback)',
              },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 sm:p-7 text-left space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-[#0071E3]">
                  {stat.value}
                </div>
                <p className="text-xs text-[#86868B] leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. APPLE 2025 BENTO GRID SHOWCASE (Asymmetric Architecture)
          ========================================================================= */}
      <section id="ecosistema" className="py-24 px-6 max-w-[1200px] mx-auto space-y-12">
        <div className="text-left max-w-3xl space-y-3">
          <p className="text-xs sm:text-sm font-semibold text-[#0071E3]">
            Ecosistema Integrado
          </p>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Tres motores diseñados para operar como uno solo.
          </h2>
          <p className="text-base text-[#86868B] leading-relaxed">
            Cada componente de 4haus está conectado en tiempo real para que tu estrategia, tu web y tu agente autónomo trabajen en perfecta sincronía.
          </p>
        </div>

        {/* Asymmetric Apple Bento Grid (2 Cols Span + 1 Col Span) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Large Bento Card 1 (7 Cols): Web & Funnel Architecture */}
          <div
            onClick={onOpenApp}
            className={`lg:col-span-7 rounded-[28px] overflow-hidden border flex flex-col justify-between cursor-pointer group transition-all ${
              isDark
                ? 'bg-[#1D1D1F] border-white/10 hover:border-white/20'
                : 'bg-white border-black/[0.08] hover:border-black/15'
            }`}
          >
            <div className="p-8 sm:p-10 space-y-3 text-left">
              <div className="text-xs font-semibold text-[#86868B]">
                01 · Páginas Web &amp; Landings de Conversión
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Estética de galería. Velocidad instantánea.
              </h3>
              <p className="text-sm text-[#86868B] max-w-xl leading-relaxed">
                Construimos portales inmobiliarios, páginas de captura Off-Market y plataformas B2B con carga inferior a 0.6 segundos y textos persuasivos listos para convertir.
              </p>
            </div>

            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="rounded-2xl overflow-hidden aspect-16/10 bg-zinc-900">
                <img
                  src={bentoWebEngineImg}
                  alt="Ingeniería Web de Alta Conversión"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Right Bento Card 2 (5 Cols): Daniel 1.0 Autonomous Co-Pilot */}
          <div
            onClick={onOpenApp}
            className="lg:col-span-5 rounded-[28px] overflow-hidden bg-[#1D1D1F] text-white border border-white/10 flex flex-col justify-between cursor-pointer group transition-all hover:border-white/25"
          >
            <div className="p-8 sm:p-10 space-y-3 text-left">
              <div className="text-xs font-semibold text-[#2997FF]">
                02 · Copiloto Personal de José
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Daniel 1.0. Inteligencia con criterio propio.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Entrenado con tu código moral 40/40, tu voz personalizada en MP3 y capacidad de crear presentaciones Keynote de 5 láminas o guiones de exposición al instante.
              </p>
            </div>

            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="rounded-2xl overflow-hidden aspect-4/3 bg-black">
                <img
                  src={bentoDanielAiImg}
                  alt="Daniel 1.0 Agente Autónomo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Bento Card 3 (12 Cols): Growth & Niche OS + Keynote Presentations */}
          <div
            onClick={onOpenApp}
            className={`lg:col-span-12 rounded-[28px] overflow-hidden border grid grid-cols-1 lg:grid-cols-12 items-center cursor-pointer group transition-all ${
              isDark
                ? 'bg-[#1D1D1F] border-white/10 hover:border-white/20'
                : 'bg-white border-black/[0.08] hover:border-black/15'
            }`}
          >
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-4 text-left">
              <div className="text-xs font-semibold text-[#0071E3]">
                03 · Growth &amp; Niche OS + Keynote Deck Engine
              </div>
              <h3 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
                Del diagnóstico de nicho al cierre con inversores en 7 pasos.
              </h3>
              <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
                Configura el perfil de tu negocio, detecta 3 Buyer Personas con liquidez, gestiona prospectos en Firestore y descarga presentaciones ejecutivas de 5 láminas fundamentadas en $100M Offers de Alex Hormozi.
              </p>
              <div className="pt-2 flex items-center gap-2 text-sm font-semibold text-[#0071E3]">
                <span>Abrir el flujo de 7 pasos en Studio OS</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8">
              <div className="rounded-2xl overflow-hidden aspect-16/10 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={bentoGrowthCrmImg}
                  alt="Growth & Niche OS Dashboard"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE STUDIO OS CONFIGURATOR (Clean Apple Hardware/Software Surface)
          ========================================================================= */}
      <section
        id="estudio"
        className={`py-24 px-6 border-y transition-colors ${
          isDark ? 'bg-[#0A0A0C] border-white/10' : 'bg-white border-black/[0.06]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold text-[#0071E3]">
                Banco de Trabajo Interactivo
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Configura tu arquitectura y pruébala en vivo.
              </h2>
            </div>

            {/* Clean Segmented Control (Functional Filter Buttons) */}
            <div
              className={`inline-flex p-1 rounded-full border text-xs font-semibold self-start ${
                isDark
                  ? 'bg-[#1D1D1F] border-white/10 text-zinc-400'
                  : 'bg-[#F5F5F7] border-black/[0.06] text-[#86868B]'
              }`}
            >
              {[
                { id: 'web', label: 'Páginas Web', preset: 'saas' as const },
                { id: 'agents', label: 'Daniel 1.0 IA', preset: 'daniel' as const },
                { id: 'systems', label: 'Growth & CRM', preset: 'ops' as const },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setHeroTab(t.id as any);
                    handleSelectPreset(t.preset);
                  }}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    heroTab === t.id
                      ? isDark
                        ? 'bg-white text-black shadow-xs'
                        : 'bg-white text-[#1D1D1F] shadow-xs'
                      : 'hover:text-current'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimalist Apple Studio Card */}
          <div
            className={`rounded-[28px] border overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x ${
              isDark
                ? 'bg-[#1D1D1F] border-white/10 divide-white/10'
                : 'bg-[#F5F5F7] border-black/[0.08] divide-black/[0.06]'
            }`}
          >
            {/* Left 4 Cols: Presets */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[#86868B]">
                  Selecciona un módulo base
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: 'saas',
                      name: '01. Web & Landing High-Ticket',
                      meta: 'Carga <0.6s · Diseño Cupertino',
                    },
                    {
                      id: 'daniel',
                      name: '02. Agente Autónomo Daniel 1.0',
                      meta: 'Respuesta 45s · Voz Personalizada',
                    },
                    {
                      id: 'enterprise',
                      name: '03. Inmobiliaria Prime & Off-Market',
                      meta: 'Dossier PDF · 3 Buyer Personas',
                    },
                    {
                      id: 'ops',
                      name: '04. Sistema Completo Growth OS',
                      meta: 'CRM Firestore · Oferta $100M',
                    },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectPreset(v.id as any)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                        selectedPreset === v.id
                          ? isDark
                            ? 'bg-black border-[#0071E3] text-white'
                            : 'bg-white border-[#0071E3] text-[#1D1D1F] shadow-xs'
                          : isDark
                          ? 'border-transparent hover:bg-white/5 text-zinc-400'
                          : 'border-transparent hover:bg-black/[0.03] text-[#86868B]'
                      }`}
                    >
                      <div className="text-xs font-bold">{v.name}</div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">{v.meta}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-current/10">
                <select
                  value={heroLang}
                  onChange={(e) => setHeroLang(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                    isDark
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-black/10 text-[#1D1D1F]'
                  }`}
                >
                  <option value="es">Mercado Hispano, España &amp; LatAm</option>
                  <option value="en">Mercado Global &amp; Estados Unidos</option>
                  <option value="fr">Mercado Europeo Francófono</option>
                  <option value="zh">Mercado Asiático Internacional</option>
                </select>
              </div>
            </div>

            {/* Right 8 Cols: Live Specification & Launch */}
            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#86868B]">
                  <span className="font-semibold">Instrucción estratégica para Studio OS</span>
                  <span className="font-mono tabular-nums">{heroPromptText.length} caracteres</span>
                </div>

                <textarea
                  rows={5}
                  value={heroPromptText}
                  onChange={(e) => setHeroPromptText(e.target.value)}
                  className={`w-full p-4 rounded-2xl border text-sm leading-relaxed focus:outline-none resize-none ${
                    isDark
                      ? 'bg-black border-white/10 text-white focus:border-[#0071E3]'
                      : 'bg-white border-black/[0.08] text-[#1D1D1F] focus:border-[#0071E3]'
                  }`}
                  placeholder="Describe el objetivo de tu negocio, nicho o presentación..."
                />
              </div>

              <div className="pt-4 border-t border-current/10 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#86868B]">
                  {buildStep ? (
                    <span className="text-[#0071E3] font-semibold">{buildStep}</span>
                  ) : (
                    <span>Sincronizado con Daniel 1.0 y tu base de datos en tiempo real</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSimulateBuild}
                  disabled={isSimulatingBuild}
                  className="px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold tracking-tight shadow-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>
                    {isSimulatingBuild ? 'Abriendo Studio OS...' : 'Ejecutar en 4haus Studio OS'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. ARCHITECTURAL DEEP DIVE (Numbered Chapters + Visual Stage)
          ========================================================================= */}
      <section id="arquitectura" className="py-24 px-6 max-w-[1200px] mx-auto space-y-12">
        <div className="text-left max-w-3xl space-y-3">
          <p className="text-xs sm:text-sm font-semibold text-[#0071E3]">
            Ingeniería de Detalle
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Cada capa pensada para multiplicar el valor de tu oferta.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            {solutionItems.map((item, idx) => {
              const active = activeSolutionTab === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSolutionTab(idx)}
                  className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
                    active
                      ? isDark
                        ? 'bg-[#1D1D1F] border-white/20 text-white'
                        : 'bg-white border-black/15 text-[#1D1D1F] shadow-sm'
                      : isDark
                      ? 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300'
                      : 'bg-transparent border-black/5 text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-[#0071E3] mb-1">
                    {item.index}.
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#86868B] mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-current/10 text-xs font-mono text-[#0071E3]">
                    {item.stats}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <div
              className={`h-full rounded-[32px] overflow-hidden border p-6 sm:p-8 flex flex-col justify-between ${
                isDark ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-black/[0.08]'
              }`}
            >
              <div className="rounded-2xl overflow-hidden aspect-16/10 bg-zinc-900">
                <img
                  src={solutionItems[activeSolutionTab].image}
                  alt={solutionItems[activeSolutionTab].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-500"
                />
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-left">
                <div>
                  <div className="text-xs text-[#86868B]">
                    Módulo Activo · {solutionItems[activeSolutionTab].stats}
                  </div>
                  <div className="text-lg font-bold mt-0.5">
                    {solutionItems[activeSolutionTab].title}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenApp}
                  className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  Probar este módulo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. QUANTIFIED PROOF & EXECUTIVE TESTIMONIALS (Claim-to-Proof Adjacency)
          ========================================================================= */}
      <section
        id="resultados"
        className={`py-24 px-6 border-t transition-colors ${
          isDark ? 'bg-[#0A0A0C] border-white/10' : 'bg-white border-black/[0.06]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto space-y-12 text-left">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-[#0071E3]">
              Impacto Verificable
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Resultados medidos en reuniones, velocidad y retorno.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-[28px] border flex flex-col justify-between space-y-6 ${
                  isDark
                    ? 'bg-[#1D1D1F] border-white/10 text-white'
                    : 'bg-[#F5F5F7] border-black/[0.06] text-[#1D1D1F]'
                }`}
              >
                <div className="space-y-4">
                  <div className="text-sm font-bold text-[#0071E3] tabular-nums">
                    {t.metric}
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">
                    "{t.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-current/10">
                  <div className="text-sm font-bold">{t.author}</div>
                  <div className="text-xs text-[#86868B] mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FREQUENTLY ASKED QUESTIONS (Clean Hairline Dividers)
          ========================================================================= */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-left space-y-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Preguntas frecuentes.
        </h2>

        <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-base font-bold tracking-tight">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868B] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="pt-3 pr-8 text-sm text-[#86868B] leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          8. FINAL APPLE KEYNOTE CALL TO ACTION
          ========================================================================= */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto">
        <div className="rounded-[32px] bg-[#1D1D1F] text-white p-10 sm:p-16 text-center space-y-6 border border-white/10 shadow-xl">
          <p className="text-xs font-semibold text-[#2997FF] uppercase tracking-wider">
            4haus Studio OS · Edición 2025
          </p>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Pon a Daniel 1.0 y tu nueva arquitectura de crecimiento a trabajar hoy.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Accede al banco de trabajo interactivo, personaliza tu estrategia de nicho y genera tus presentaciones Keynote en segundos.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenApp}
              className="px-8 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Abrir 4haus Studio OS
            </button>
            <button
              type="button"
              onClick={onOpenPlans}
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Explorar Planes y Precios
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. QUIET CUPERTINO FOOTER
          ========================================================================= */}
      <footer
        className={`pt-16 pb-12 border-t text-left text-xs text-[#86868B] transition-colors ${
          isDark ? 'border-white/10 bg-black' : 'border-black/[0.08] bg-[#F5F5F7]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 space-y-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="space-y-2.5">
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                Ecosistema
              </span>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Ingeniería Web
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Agente Daniel 1.0
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Growth &amp; Niche OS
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Presentaciones Keynote PDF
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                Soluciones
              </span>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Inmobiliaria Prime &amp; Activos
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Empresas B2B &amp; Consultoría
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Family Offices &amp; Inversión
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    SaaS &amp; Plataformas
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                Plataforma
              </span>
              <ul className="space-y-2">
                <li>
                  <button type="button" onClick={onOpenApp} className="hover:underline cursor-pointer">
                    Abrir /app Workbench
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenPlans} className="hover:underline cursor-pointer">
                    Planes y Licencias
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenBooking} className="hover:underline cursor-pointer">
                    Agendar Demostración
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className={`font-semibold block ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                Compañía
              </span>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenAboutModal && onOpenAboutModal()}
                    className="hover:underline cursor-pointer"
                  >
                    Acerca de 4haus Studio
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenAboutModal && onOpenAboutModal('cases')}
                    className="hover:underline cursor-pointer"
                  >
                    Casos de Estudio
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onOpenBooking} className="hover:underline cursor-pointer">
                    Contacto Directo
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark ? 'border-white/10' : 'border-black/[0.08]'
            }`}
          >
            <div>
              Copyright © 2026 4haus Studio Inc. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenAboutModal && onOpenAboutModal()}
                className="hover:underline cursor-pointer"
              >
                Privacidad
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenAboutModal && onOpenAboutModal()}
                className="hover:underline cursor-pointer"
              >
                Condiciones de Uso
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenAboutModal && onOpenAboutModal()}
                className="hover:underline cursor-pointer"
              >
                Seguridad
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
