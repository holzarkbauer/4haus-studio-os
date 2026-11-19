import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  Bot, 
  Globe, 
  ShoppingBag, 
  BookOpen, 
  Mic2, 
  Zap, 
  Layers, 
  Check, 
  Play, 
  Radio, 
  Volume2, 
  ChevronRight,
  ChevronLeft,
  FileText,
  Video,
  Music2,
  Wand2,
  Scissors,
  Share2,
  Download,
  Plus
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/languages';
import { getWorkbenchTranslations } from '../i18n/workbenchTranslations';
import { GuidedPromptHero, GuidedMessage } from './GuidedPromptHero';
import type { StartExtras } from './GuidedPromptHero';
import { LeadNichoEngine, GrowthStepId } from './LeadNichoEngine';
import { ProjectPreloadPayload } from '../types/leadNichoTypes';
import { UserDashboard } from './UserDashboard';
import { HomeTemplatesShowcase } from './HomeTemplatesShowcase';
import { CaptarClientesFlow } from './CaptarClientesFlow';
import { WebsiteStudio } from './WebsiteStudio';
import { LibraryTemplates } from './website/LibraryTemplates';
import { VoiceStudio } from './VoiceStudio';
import { UserHistory } from './UserHistory';
import { CreatorProgram } from './CreatorProgram';
import { AdminGate } from './crm/AdminGate';
import { LegalPage } from './legal/LegalPage';
import { motion } from 'motion/react';

// Identificadores de "Captar clientes" (los antiguos siguen funcionando para Daniel y otros botones)
const GROWTH_IDS = ['growth-os', 'negocio-perfil', 'prospectos-crm', 'campanas-ia', 'landings-brief', 'conexiones-api'];
import type { User } from 'firebase/auth';

interface HomeWorkbenchProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  activeSidebarItem: string;
  onSelectSidebarItem: (id: string) => void;
  onOpenLivePreview: (url: string, title: string) => void;
  onOpenDanielModal: () => void;
  onOpenMusicBox: () => void;
  onOpenSpotify: () => void;
  onOpenThemeModal: () => void;
  onOpenCalculatorModal: () => void;
  onOpenClockModal: () => void;
  onOpenHaustoreModal: () => void;
  onOpenBooksModal: () => void;
  onOpenPlans: () => void;
  onOpenTeamDashboard: (tab?: any) => void;
  onOpenNewsletter: () => void;
  onOpenTutorials: () => void;
  onOpenBooking?: () => void;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  currentUser?: User | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
  onLogout?: () => void;
  growthStep?: GrowthStepId;
  onSelectGrowthStep?: (step: GrowthStepId) => void;
  preloadData?: ProjectPreloadPayload | null;
  onUpdatePreloadData?: (data: ProjectPreloadPayload) => void;
  guidedMessages?: GuidedMessage[];
  onUpdateGuidedMessages?: (msgs: GuidedMessage[]) => void;
}

export function HomeWorkbench({
  lang,
  themeMode = 'light',
  activeSidebarItem,
  onSelectSidebarItem,
  onOpenLivePreview,
  onOpenDanielModal,
  onOpenMusicBox,
  onOpenSpotify,
  onOpenThemeModal,
  onOpenCalculatorModal,
  onOpenClockModal,
  onOpenHaustoreModal,
  onOpenBooksModal,
  onOpenPlans,
  onOpenTeamDashboard,
  onOpenNewsletter,
  onOpenTutorials,
  userId,
  userEmail,
  userName,
  currentUser = null,
  isLoggingIn = false,
  onGoogleLogin = () => {},
  onLogout = () => {},
  growthStep: externalGrowthStep,
  onSelectGrowthStep,
  preloadData: externalPreloadData,
  onUpdatePreloadData,
  guidedMessages,
  onUpdateGuidedMessages,
}: HomeWorkbenchProps) {
  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.es;
  const tContent = getWorkbenchTranslations(lang);
  const isDark = themeMode === 'dark';

  const [localGrowthStep, setLocalGrowthStep] = useState<GrowthStepId>('dashboard');
  const [localPreloadData, setLocalPreloadData] = useState<ProjectPreloadPayload | null>(null);
  // Prompt de la plantilla elegida en el inicio; se carga en la casilla principal.
  const [templatePrompt, setTemplatePrompt] = useState<string | null>(null);
  // "Captar clientes": paso a paso por defecto; la vista avanzada (LeadNicho completo) a un clic.
  const [showAdvancedGrowth, setShowAdvancedGrowth] = useState(false);
  // Pedido pendiente para el creador de webs (desde la casilla del inicio o una plantilla).
  const [webBrief, setWebBrief] = useState<string | null>(null);
  const [webExtras, setWebExtras] = useState<StartExtras | null>(null);
  const [webTemplate, setWebTemplate] = useState<string | null>(null);
  const startWebsite = (brief: string, extras?: StartExtras) => {
    setWebExtras(extras || null);
    // Con solo adjuntos (sin texto), se usa un pedido mínimo para que arranque igual.
    setWebBrief(brief || (extras && (extras.attachments.length || extras.images.length) ? 'Crea la web a partir de los adjuntos.' : brief));
    onSelectSidebarItem('crear-web');
  };
  useEffect(() => {
    if (!GROWTH_IDS.includes(activeSidebarItem)) setShowAdvancedGrowth(false);
  }, [activeSidebarItem]);

  const growthStep = externalGrowthStep !== undefined ? externalGrowthStep : localGrowthStep;
  const setGrowthStep = (step: GrowthStepId) => {
    if (onSelectGrowthStep) {
      onSelectGrowthStep(step);
    } else {
      setLocalGrowthStep(step);
    }
  };

  const preloadData = externalPreloadData !== undefined ? externalPreloadData : localPreloadData;
  const setPreloadData = (data: ProjectPreloadPayload) => {
    if (onUpdatePreloadData) {
      onUpdatePreloadData(data);
    } else {
      setLocalPreloadData(data);
    }
  };

  const handleNavigateFromHero = (
    sidebarItem: string,
    step?: GrowthStepId,
    incomingPreload?: ProjectPreloadPayload
  ) => {
    if (step) {
      setGrowthStep(step);
    }
    if (incomingPreload) {
      setPreloadData({ ...incomingPreload });
    }
    onSelectSidebarItem(sidebarItem);
  };

  return (
    <div className={`flex-1 min-h-screen overflow-x-hidden transition-colors duration-200 ${
      isDark ? 'bg-black text-[#F5F5F7]' : 'bg-[#F5F5F7] text-[#1D1D1F]'
    }`}>
      
      {/* Container with spacious padding */}
      {/* Cambio de sección suave: cada vista entra con un fundido y un desplazamiento corto. */}
      <motion.div
        key={GROWTH_IDS.includes(activeSidebarItem) ? 'growth' : activeSidebarItem || 'inicio'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left"
      >
        
        {/* =========================================================
            PRIMARY VIEW: INICIO (HOME)
            ========================================================= */}
        {(activeSidebarItem === 'inicio' || !activeSidebarItem) && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 0. CASILLA DE PROMPT GUIADO (estilo v0) */}
            <GuidedPromptHero
              lang={lang}
              themeMode={themeMode}
              userId={userId}
              messages={guidedMessages}
              onUpdateMessages={onUpdateGuidedMessages}
              onApplyStrategyChanges={(incomingPreload) => setPreloadData({ ...incomingPreload })}
              onNavigateToModule={handleNavigateFromHero}
              onOpenPlans={onOpenPlans}
              onOpenDanielModal={onOpenDanielModal}
              prefillPrompt={templatePrompt}
              onPrefillConsumed={() => setTemplatePrompt(null)}
              onStartWebsite={startWebsite}
            />

            {/* 1. PLANTILLAS CON SU PROMPT + FUNCIONES + LLAMADA FINAL */}
            <HomeTemplatesShowcase
              lang={lang}
              themeMode={themeMode}
              onUseTemplatePrompt={(prompt) => setTemplatePrompt(prompt)}
              onBrowseAll={() => onSelectSidebarItem('websites')}
            />
          </div>
        )}

        {/* VOZ: voz real con ElevenLabs (la clave vive solo en el servidor) */}
        {activeSidebarItem === 'voz' && (
          <VoiceStudio isDark={isDark} isEn={lang === 'en'} userId={userId} onGoogleLogin={onGoogleLogin} />
        )}

        {/* VIEW 3: PLANTILLAS (une la antigua Websites Library y la galería del Landing Builder) */}
        {activeSidebarItem === 'websites' && (
          <div className="space-y-8 animate-in fade-in duration-200 pt-4">
            <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {lang === 'en' ? 'Templates' : 'Plantillas'}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {lang === 'en'
                    ? 'Each template comes with its prompt. Pick one and adapt it to your client.'
                    : 'Cada plantilla trae su prompt. Elige una y adáptala a tu cliente.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGrowthStep('paso5-landing');
                  setShowAdvancedGrowth(true);
                  onSelectSidebarItem('growth-os');
                }}
                className={`self-start sm:self-auto px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark ? 'border-white/15 text-white hover:bg-white/5' : 'border-black/[0.1] text-zinc-900 bg-white hover:bg-black/[0.03]'
                }`}
              >
                {lang === 'en' ? 'Open landing builder' : 'Abrir constructor de landings'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <LibraryTemplates
              isDark={isDark}
              isEn={lang === 'en'}
              onUse={(id) => {
                setWebTemplate(id);
                onSelectSidebarItem('crear-web');
              }}
            />

            <HomeTemplatesShowcase
              lang={lang}
              themeMode={themeMode}
              galleryOnly
              onUseTemplatePrompt={(prompt) => startWebsite(prompt)}
            />
          </div>
        )}

        {/* DOCUMENTOS PÚBLICOS: condiciones de venta y términos de creadores (4haus.us/condiciones) */}
        {(activeSidebarItem === 'condiciones' || activeSidebarItem === 'terminos') && (
          <LegalPage docId={activeSidebarItem === 'condiciones' ? 'condiciones-venta' : 'terminos-creadores'} isDark={isDark} lang={lang === 'en' ? 'en' : 'es'} />
        )}

        {/* PROGRAMA DE CREADORES: pedir y canjear códigos; aprobación del administrador */}
        {activeSidebarItem === 'creadores' && (
          <CreatorProgram lang={lang} themeMode={themeMode} userId={userId} isLoggingIn={isLoggingIn} onGoogleLogin={onGoogleLogin} />
        )}

        {/* CREAR WEB: describe → maqueta con portada 3D → cambios → descarga */}
        {activeSidebarItem === 'crear-web' && (
          <WebsiteStudio
            lang={lang}
            themeMode={themeMode}
            userId={userId}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={onGoogleLogin}
            startBrief={webBrief}
            onStartConsumed={() => {
              setWebBrief(null);
              setWebExtras(null);
            }}
            startExtras={webExtras}
            startTemplateId={webTemplate}
            onOpenPlans={onOpenPlans}
          />
        )}

        {/* AGENTES DE IA: aún en construcción (no se muestran agentes que no existen) */}
        {activeSidebarItem === 'ai-agents' && (
          <div className="max-w-3xl space-y-3">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{lang === 'en' ? 'AI agents' : 'Agentes de IA'}</h2>
            <div className={`p-6 rounded-3xl border text-sm ${isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600'}`}>
              {lang === 'en'
                ? 'Coming soon: agents that answer your clients on WhatsApp and book appointments. Meanwhile, every website you create can include its contact form and booking button.'
                : 'Muy pronto: agentes que responden a tus clientes por WhatsApp y agendan citas. Mientras tanto, cada web que crees puede incluir su formulario de contacto y botón para agendar.'}
            </div>
          </div>
        )}

        {/* VIEW 5: STORE */}
        {activeSidebarItem === 'store' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-600 font-semibold mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span>{lang === 'en' ? 'Application Store' : 'Tienda de Aplicaciones'}</span>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Store</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en' ? 'Deploy pre-packaged software solutions directly to your infrastructure.' : 'Despliega soluciones listas para usar directamente en tu infraestructura.'}
              </p>
            </div>

            <div className={`p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-900'
            }`}>
              <div>
                <h3 className="text-xl font-bold">4haus Application Store</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  Explora templates, componentes y stacks pre-ensamblados para tu agencia o negocio.
                </p>
              </div>
              <button
                onClick={onOpenHaustoreModal}
                className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
              >
                {lang === 'en' ? 'Open Full Store' : 'Abrir Tienda Completa'}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 6: APRENDE (une Descubrimiento, Biblioteca de recursos y Knowledge Library) */}
        {['aprende', 'descubrimiento', 'recursos', 'knowledge'].includes(activeSidebarItem) && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto w-full pt-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {lang === 'en' ? 'Learn' : 'Aprende'}
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en'
                  ? 'Tutorials, guides and books to create and sell digital products.'
                  : 'Tutoriales, guías y libros para crear y vender productos digitales.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Play,
                  title: lang === 'en' ? 'Tutorials' : 'Tutoriales',
                  desc: lang === 'en' ? 'Step-by-step videos to use 4haus Studio.' : 'Videos paso a paso para usar 4haus Studio.',
                  action: onOpenTutorials,
                },
                {
                  icon: FileText,
                  title: lang === 'en' ? 'Sales guides and templates' : 'Guías y plantillas de venta',
                  desc: lang === 'en'
                    ? 'Playbooks and message templates to win clients.'
                    : 'Playbooks y plantillas de mensajes para conseguir clientes.',
                  action: () => {
                    setGrowthStep('paso6-recursos');
                    setShowAdvancedGrowth(true);
                    onSelectSidebarItem('growth-os');
                  },
                },
                {
                  icon: BookOpen,
                  title: lang === 'en' ? 'Recommended books' : 'Libros recomendados',
                  desc: lang === 'en'
                    ? 'Readings on systems, business and digital products.'
                    : 'Lecturas sobre sistemas, negocios y productos digitales.',
                  action: onOpenBooksModal,
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={card.action}
                    className={`text-left p-6 rounded-2xl border transition-all cursor-pointer min-h-[170px] flex flex-col gap-3 ${
                      isDark ? 'bg-[#1D1D1F] border-white/10 hover:border-white/25' : 'bg-white border-black/[0.08] hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
                    <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{card.title}</div>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{card.desc}</p>
                    <span className={`mt-auto text-xs font-semibold flex items-center gap-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {lang === 'en' ? 'Open' : 'Abrir'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 7: HISTORIA DE USUARIO */}
        {activeSidebarItem === 'historia' && (
          <UserHistory isDark={isDark} isEn={lang === 'en'} onOpenWebsites={() => onSelectSidebarItem('crear-web')} />
        )}

        {/* VIEW 9a: CAPTAR CLIENTES · paso a paso guiado por Daniel (vista por defecto) */}
        {activeSidebarItem === 'growth-os' && !showAdvancedGrowth && (
          <CaptarClientesFlow
            lang={lang}
            themeMode={themeMode}
            userId={userId}
            preloadData={preloadData}
            onOpenAdvanced={() => setShowAdvancedGrowth(true)}
          />
        )}

        {/* VIEW 9b: CAPTAR CLIENTES · vista avanzada (LeadNicho completo) */}
        {GROWTH_IDS.includes(activeSidebarItem) && (showAdvancedGrowth || activeSidebarItem !== 'growth-os') && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setShowAdvancedGrowth(false);
                setGrowthStep('dashboard');
                onSelectSidebarItem('growth-os');
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-zinc-900'} hover:underline`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Back to step by step' : 'Volver al paso a paso'}
            </button>
          <LeadNichoEngine
            lang={lang}
            themeMode={themeMode}
            userId={userId}
            userEmail={userEmail}
            userName={userName}
            preloadData={preloadData}
            initialStep={
              activeSidebarItem === 'negocio-perfil'
                ? 'paso1-negocio'
                : activeSidebarItem === 'prospectos-crm'
                ? 'paso3-prospectos'
                : activeSidebarItem === 'campanas-ia'
                ? 'paso4-campana'
                : activeSidebarItem === 'landings-brief'
                ? 'paso5-landing'
                : activeSidebarItem === 'conexiones-api'
                ? 'conexiones'
                : growthStep
            }
            onOpenDanielModal={onOpenDanielModal}
            onOpenTutorialsModal={onOpenTutorials}
            onOpenBooksModal={onOpenBooksModal}
            onOpenLivePreview={onOpenLivePreview}
          />
          </div>
        )}

        {/* CRM interno de 4haus (solo el equipo) */}
        {activeSidebarItem === 'crm' && <AdminGate lang={lang} themeMode={themeMode} userId={userId} isLoggingIn={isLoggingIn} onGoogleLogin={onGoogleLogin} />}

      </motion.div>

    </div>
  );
}
