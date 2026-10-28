import { useState, type FormEvent } from 'react';
import { 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { IOSAppIcon, type IOSIconType } from './IOSAppIcon';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useSpotify } from '../context/SpotifyContext';

interface ResourceHubProps {
  lang: Language;
  onOpenBooking: () => void;
  onOpenLivePreview: (url: string, title: string) => void;
  onOpenDanielModal: () => void;
  onOpenMusicBox: () => void;
  onOpenSpotify: () => void;
  onOpenThemeModal: () => void;
  onOpenCalculatorModal: () => void;
  onOpenClockModal: () => void;
  onOpenHaustoreModal: () => void;
  onOpenBooksModal: () => void;
}

export function ResourceHub({
  lang,
  onOpenBooking,
  onOpenLivePreview,
  onOpenDanielModal,
  onOpenMusicBox,
  onOpenSpotify,
  onOpenThemeModal,
  onOpenCalculatorModal,
  onOpenClockModal,
  onOpenHaustoreModal,
  onOpenBooksModal,
}: ResourceHubProps) {
  const t = translations[lang].hub;
  const { status, connectSpotify } = useSpotify();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleSpotifyClick = () => {
    if (status === 'connected') {
      onOpenSpotify();
    } else {
      connectSpotify();
    }
  };

  // Newsletter & notify states for bottom drawer
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setNewsletterSubscribed(true);
  };

  // The complete suite of iOS-style apps
  // strictly without text below them, organized in max 4 columns
  const apps: {
    id: string;
    name: string;
    functionDescription: string;
    iconType: IOSIconType;
    action: () => void;
    badge?: string;
  }[] = [
    {
      id: 'background',
      name: lang === 'en' ? 'Wallpapers & Video Background' : 'Fondos y Video de Pantalla',
      functionDescription: lang === 'en'
        ? 'Changes page video background (Waves, Stars, Resort). Scrubs forward & reverse with scrolling.'
        : 'Cambia el video de fondo (Olas, Estrellas, Costa). Avanza y retrocede dinámicamente con el scroll.',
      iconType: 'background',
      action: onOpenThemeModal,
      badge: lang === 'en' ? 'SCROLL' : 'SCROLL',
    },
    {
      id: 'daniel',
      name: 'Daniel AI',
      functionDescription: lang === 'en'
        ? 'Interactive AI assistant with voice synthesis inspired by Knight Rider’s K.I.T.T.'
        : 'Asistente de IA interactivo con síntesis de voz inspirada en K.I.T.T. de Knight Rider.',
      iconType: 'daniel',
      action: onOpenDanielModal,
      badge: 'K.I.T.T.',
    },
    {
      id: 'calculator',
      name: lang === 'en' ? 'ROI & Quote Calculator' : 'Calculadora de ROI y Cotización',
      functionDescription: lang === 'en'
        ? 'Simulates monthly cost savings, hours automated, and ROI when deploying custom AI systems.'
        : 'Simula el ahorro mensual, horas automatizadas y retorno de inversión al implementar sistemas de IA.',
      iconType: 'calculator',
      action: onOpenCalculatorModal,
    },
    {
      id: 'haustore',
      name: '4haustore',
      functionDescription: lang === 'en'
        ? 'Browse our marketplace of pre-built autonomous agents, prompt engines, and workflow modules.'
        : 'Explora nuestra tienda de agentes autónomos, prompts optimizados y módulos de automatización listos.',
      iconType: 'haustore',
      action: onOpenHaustoreModal,
    },
    {
      id: 'spotify',
      name: 'Spotify Audio Hub',
      functionDescription: lang === 'en'
        ? 'Connect to real Spotify to stream real songs, playlists, and artists via Spotify Web Playback SDK.'
        : 'Conecta a Spotify real para reproducir tus canciones, artistas y playlists mediante Spotify Web Playback SDK.',
      iconType: 'spotify',
      action: handleSpotifyClick,
      badge: 'SPOTIFY',
    },
    {
      id: 'musicbox',
      name: lang === 'en' ? 'My Songs / Library' : 'Mis Canciones / Biblioteca',
      functionDescription: lang === 'en'
        ? 'Access your personal audio files, uploaded tracks, California sound suite, and analog frequencies synthesizer.'
        : 'Accede a tus audios guardados, canciones subidas, suite California sound y sintetizador retro analógico.',
      iconType: 'music',
      action: onOpenMusicBox,
      badge: 'PROPIA',
    },
    {
      id: 'clock',
      name: lang === 'en' ? 'Productivity Clock' : 'Reloj de Productividad',
      functionDescription: lang === 'en'
        ? 'Tracks multi-timezone client hours, sprint stopwatch, and Pomodoro deep-work timer.'
        : 'Muestra husos horarios de clientes internacionales, cronómetro de proyectos y temporizador Pomodoro.',
      iconType: 'clock',
      action: onOpenClockModal,
    },
    {
      id: 'books',
      name: lang === 'en' ? 'Knowledge Library' : 'Biblioteca de Libros',
      functionDescription: lang === 'en'
        ? 'Free digital manuals, automation architectures, and enterprise engineering guides.'
        : 'Manuales digitales, guías maestras de arquitectura y frameworks de automatización empresarial.',
      iconType: 'books',
      action: onOpenBooksModal,
    },
    {
      id: 'youtube',
      name: 'YouTube Channel',
      functionDescription: lang === 'en'
        ? 'Opens official video channel featuring system breakdowns, live coding, and client demos.'
        : 'Abre nuestro canal oficial con tutoriales, arquitectura de agentes y casos de estudio en video.',
      iconType: 'youtube',
      action: () => window.open('https://www.youtube.com/@savedtheday', '_blank'),
    },
    {
      id: 'newsletter',
      name: lang === 'en' ? 'Weekly Dispatch' : 'Newsletter Semanal',
      functionDescription: lang === 'en'
        ? 'Subscribes you to weekly operational blueprints and new AI tool benchmarks.'
        : 'Recibe semanalmente estrategias prácticas de IA y análisis técnicos directamente a tu bandeja.',
      iconType: 'mailchimp',
      action: () => setShowDrawer(true),
    },
    {
      id: 'courses',
      name: lang === 'en' ? 'Free Courses' : 'Cursos Gratuitos',
      functionDescription: lang === 'en'
        ? 'Access zero-cost video courses on Zapier, Make, custom AI agents, and CRM sync.'
        : 'Cursos completos gratuitos sobre agentes de IA, n8n, Make y sincronización de leads.',
      iconType: 'hotmart',
      action: () => window.open('https://hotmart.com', '_blank'),
    },
    {
      id: 'crowdfunding',
      name: lang === 'en' ? 'Crowd Innovation' : 'Crowdfunding de IA',
      functionDescription: lang === 'en'
        ? 'Community fund supporting open-source automation templates and public experimental agents.'
        : 'Fondo colectivo para financiar herramientas abiertas y nuevas integraciones de automatización.',
      iconType: 'kickstarter',
      action: () => setShowDrawer(true),
    },
    {
      id: 'instagram',
      name: 'Instagram (@josetrujillo.ia)',
      functionDescription: lang === 'en'
        ? 'Official Instagram channel featuring behind-the-scenes system builds and short tutorials.'
        : 'Canal oficial de Instagram con flujos de trabajo de IA, detrás de cámaras y tutoriales cortos.',
      iconType: 'instagram',
      action: () => window.open('https://www.instagram.com/josetrujillo.ia/', '_blank'),
    },
    {
      id: 'facebook',
      name: 'Facebook Community',
      functionDescription: lang === 'en'
        ? 'Official Facebook profile for community discussions and business automation announcements.'
        : 'Perfil oficial de Facebook para actualizaciones de la comunidad y automatización de negocios.',
      iconType: 'facebook',
      action: () => window.open('https://www.facebook.com/profile.php?id=61582005755057', '_blank'),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn (José Trujillo)',
      functionDescription: lang === 'en'
        ? 'Connect on LinkedIn for enterprise AI architecture discussions and business consulting.'
        : 'Conecta en LinkedIn para proyectos de arquitectura de IA empresarial y consultoría.',
      iconType: 'linkedin',
      action: () => window.open('https://www.linkedin.com/in/jos%C3%A9-trujillo-74a414334/', '_blank'),
    },
    {
      id: 'x',
      name: 'X (@Jose_eaglelife)',
      functionDescription: lang === 'en'
        ? 'Follow real-time AI updates, technical threads, and system architecture thoughts on X.'
        : 'Sigue hilos técnicos de IA, anuncios y reflexiones de arquitectura de sistemas en tiempo real.',
      iconType: 'x',
      action: () => window.open('https://x.com/Jose_eaglelife', '_blank'),
    },
    {
      id: 'booking',
      name: lang === 'en' ? 'Strategy Session' : 'Agendar Consultoría',
      functionDescription: lang === 'en'
        ? 'Directly schedule a 30-minute private 1-on-1 architecture call with José.'
        : 'Agenda una llamada estratégica privada de 30 minutos 1 a 1 con José para tu empresa.',
      iconType: 'reminders',
      action: onOpenBooking,
      badge: '1-on-1',
    },
  ];

  return (
    <section id="resources" className="py-20 sm:py-28 relative text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-mono uppercase tracking-widest text-zinc-200 mb-4 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{t.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 drop-shadow-md">
            {t.headline}
          </h2>
          <p className="text-sm sm:text-base text-zinc-200 font-light leading-relaxed max-w-lg mx-auto drop-shadow">
            {lang === 'en' 
              ? 'Explore our interactive iOS suite. Hover over any icon to discover its function.' 
              : 'Explora nuestra suite interactiva iOS. Posiciona el cursor sobre cualquier icono para conocer su función.'}
          </p>
        </div>

        {/* 
          Resource Hub Icons ONLY - NO TEXT UNDER ICONS - MAX 4 COLUMNS
          Interactive speech bubble tooltip ("pequeño globo de texto") on hover
        */}
        <div className="relative rounded-[32px] sm:rounded-[40px] bg-black/45 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
          
          {/* Subtle iOS dock header label */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider">
                {lang === 'en' ? 'System Dock (4 Columns)' : 'Suite de Aplicaciones (4 Columnas)'}
              </span>
            </div>
            <span className="text-zinc-400 hidden sm:inline">
              {lang === 'en' ? 'Hover icon for details' : 'Pasa el cursor para ver detalles'}
            </span>
          </div>

          {/* 4 COLUMNS GRID OF ICONS ONLY */}
          <div className="grid grid-cols-4 gap-y-8 gap-x-4 sm:gap-x-8 justify-items-center max-w-lg mx-auto">
            {apps.map((app) => (
              <div 
                key={app.id} 
                className="relative group flex flex-col items-center"
                onMouseEnter={() => setActiveTooltip(app.id)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* 
                  Speech Bubble Tooltip ("Pequeño globo de texto")
                  Appears above the icon on hover with smooth fade & scale
                */}
                <div 
                  className={`absolute bottom-full mb-3 flex flex-col items-center pointer-events-none transition-all duration-200 z-50 ${
                    activeTooltip === app.id
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                  }`}
                  style={{ width: '220px' }}
                >
                  <div className="bg-[#161618]/95 text-white border border-white/25 px-4 py-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-center">
                    <div className="text-xs font-bold text-white tracking-tight flex items-center justify-center gap-1.5 mb-1 text-cyan-300">
                      <span>{app.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-light leading-snug">
                      {app.functionDescription}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-zinc-400 font-mono">
                      {lang === 'en' ? 'Click to open' : 'Clic para abrir'}
                    </div>
                  </div>
                  {/* Speech bubble pointer arrow */}
                  <div className="w-3 h-3 bg-[#161618] border-r border-b border-white/25 rotate-45 -mt-1.5 shadow-sm" />
                </div>

                {/* THE ICON ITSELF (NO TEXT BELOW) */}
                <button
                  onClick={app.action}
                  aria-label={app.name}
                  className="relative focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <IOSAppIcon type={app.iconType} size="lg" />
                  
                  {/* Badge if present */}
                  {app.badge && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold shadow-md border border-white/40">
                      {app.badge}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Drawer Expander for Newsletter / External Resources */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center">
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span>{showDrawer 
                ? (lang === 'en' ? 'Hide Resource Details' : 'Ocultar Detalles de Recursos')
                : (lang === 'en' ? 'View Newsletter & Community Links' : 'Ver Newsletter y Enlaces Comunitarios')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDrawer ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Collapsible details drawer */}
          {showDrawer && (
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
              {/* Newsletter card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left">
                <h4 className="text-sm font-bold text-white mb-1">
                  {lang === 'en' ? 'Weekly Automation Newsletter' : 'Newsletter Semanal de IA'}
                </h4>
                <p className="text-xs text-zinc-300 mb-3 font-light">
                  {lang === 'en' ? 'Get practical blueprints every Friday.' : 'Recibe blueprints prácticos cada viernes.'}
                </p>
                {newsletterSubscribed ? (
                  <p className="text-xs text-emerald-400 font-medium">✓ {lang === 'en' ? 'Subscribed!' : '¡Suscrito!'}</p>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white"
                    />
                    <button type="submit" className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs shrink-0 hover:bg-zinc-200">
                      {lang === 'en' ? 'Join' : 'Unirse'}
                    </button>
                  </form>
                )}
              </div>

              {/* YouTube & Video links */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {lang === 'en' ? 'Video Tutorials & Demos' : 'Tutoriales y Demostraciones'}
                  </h4>
                  <p className="text-xs text-zinc-300 font-light">
                    {lang === 'en' ? 'Watch our workflow implementations on YouTube.' : 'Mira nuestras automatizaciones en YouTube.'}
                  </p>
                </div>
                <a
                  href="https://www.youtube.com/@savedtheday"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 font-medium mt-3"
                >
                  <span>{lang === 'en' ? 'Visit Channel' : 'Visitar Canal'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
