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
import { LeadNichoEngine, GrowthStepId } from './LeadNichoEngine';
import { ProjectPreloadPayload } from '../types/leadNichoTypes';
import { UserDashboard } from './UserDashboard';
import { HomeTemplatesShowcase } from './HomeTemplatesShowcase';
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

  // Voice synthesis state for 'voz' tab
  const [voiceText, setVoiceText] = useState(tContent.generationHistory.sampleText);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedVoiceModel, setSelectedVoiceModel] = useState('daniel-prime');

  // Update sample text when language changes
  useEffect(() => {
    setVoiceText(tContent.generationHistory.sampleText);
  }, [lang, tContent.generationHistory.sampleText]);

  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }
    window.speechSynthesis.cancel();
    setIsSynthesizing(true);
    const utterance = new SpeechSynthesisUtterance(voiceText);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'fr' ? 'fr-FR' : lang === 'zh' ? 'zh-CN' : 'es-ES';
    utterance.pitch = 0.85;
    utterance.rate = 1.0;
    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex-1 min-h-screen overflow-x-hidden transition-colors duration-200 ${
      isDark ? 'bg-black text-[#F5F5F7]' : 'bg-[#F5F5F7] text-[#1D1D1F]'
    }`}>
      
      {/* Container with spacious padding */}
      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        
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

        {/* VIEW 2: VOZ PERSONALIZADA (Custom Voice Synthesis) */}
        {activeSidebarItem === 'voz' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-600 font-semibold mb-1">
                <Mic2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Audio Synthesis Studio' : 'Estudio de Síntesis de Voz'}</span>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {lang === 'en' ? 'Custom Voice Engine' : 'Voz Personalizada'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en' 
                  ? 'Real-time bilingual speech synthesis calibrated with neural voice models.' 
                  : 'Síntesis de voz bilingüe en tiempo real calibrada con modelos neuronales.'}
              </p>
            </div>

            <div className={`p-6 rounded-3xl border shadow-xs space-y-5 ${
              isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'daniel-prime', name: 'Daniel 1.0 (Executive)', tag: 'K.I.T.T. Neural' },
                  { id: 'atlas-deep', name: 'Atlas Deep (Architect)', tag: 'Resonant Baritone' },
                  { id: 'nova-clarity', name: 'Nova Studio (Concise)', tag: 'Bilingual Pitch' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoiceModel(v.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedVoiceModel === v.id
                        ? isDark 
                          ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                          : 'border-indigo-600 bg-indigo-50/50 text-zinc-900'
                        : isDark
                          ? 'border-zinc-800 bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{v.name}</div>
                    <div className="text-[10px] font-mono text-indigo-500 mt-0.5">{v.tag}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  {lang === 'en' ? 'Prompt Text to Synthesize' : 'Texto para Síntesis en Vivo'}
                </label>
                <textarea
                  rows={4}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  className={`w-full rounded-2xl border p-4 text-xs focus:outline-none resize-none transition-colors ${
                    isDark 
                      ? 'border-zinc-800 bg-zinc-950 text-white focus:border-zinc-600' 
                      : 'border-zinc-200 bg-zinc-50/50 text-zinc-900 focus:border-zinc-400'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {lang === 'en' ? 'Engine: Web Speech Neural Bridge' : 'Motor: Web Speech Neural Bridge'}
                </div>
                <button
                  onClick={handleTestVoice}
                  disabled={isSynthesizing}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isSynthesizing 
                      ? (lang === 'en' ? 'Synthesizing...' : 'Sintetizando...') 
                      : (lang === 'en' ? 'Test Live Voice' : 'Probar Voz en Vivo')}
                  </span>
                </button>
              </div>
            </div>
          </div>
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

            <HomeTemplatesShowcase
              lang={lang}
              themeMode={themeMode}
              galleryOnly
              onUseTemplatePrompt={(prompt) => {
                setTemplatePrompt(prompt);
                onSelectSidebarItem('inicio');
              }}
            />
          </div>
        )}

        {/* VIEW 4: AI AGENTS */}
        {activeSidebarItem === 'ai-agents' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-600 font-semibold mb-1">
                <Bot className="w-4 h-4" />
                <span>{lang === 'en' ? 'Autonomous Swarms' : 'Enjambres Autónomos'}</span>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {lang === 'en' ? 'AI Agents' : 'Agentes de IA'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en'
                  ? 'Deploy autonomous copilots for lead capture, CRM synchronization, and client support.'
                  : 'Despliega copilotos autónomos para captura de leads, sincronización de CRM y soporte a clientes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Daniel 1.0 (Executive Brain)', desc: 'Autonomous sales qualification, audio bridge, and calendar booking.', status: 'Active 99.9%' },
                { name: 'Atlas Inbound Concierge', desc: 'WhatsApp & Telegram webhook router with 45-second latency.', status: 'Ready' },
                { name: 'Sentinel Lead Auditor', desc: 'Automated CRM data cleansing and customer enrichment pipeline.', status: 'Standby' },
                { name: 'K.I.T.T. Voice Dispatcher', desc: 'Real-time two-way voice assistant calibrated for high-ticket consultations.', status: 'Active' },
              ].map((agent, i) => (
                <div key={i} className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{agent.name}</span>
                    <span className="text-[10px] font-mono text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full font-medium">
                      {agent.status}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{agent.desc}</p>
                  <button
                    onClick={onOpenDanielModal}
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'en' ? 'Launch Agent Interface' : 'Abrir Interfaz de Agente'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <LeadNichoEngine
              lang={lang}
              themeMode={themeMode}
              initialStep="paso7-agentes"
              userId={userId}
              userEmail={userEmail}
              userName={userName}
              preloadData={preloadData}
              onOpenDanielModal={onOpenDanielModal}
              onOpenTutorialsModal={onOpenTutorials}
              onOpenBooksModal={onOpenBooksModal}
              onOpenLivePreview={onOpenLivePreview}
            />
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
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {lang === 'en' ? 'User History' : 'Historia de usuario'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en' ? 'Chronological timeline of your creations, audio generations, and deployments.' : 'Cronología de todo lo que has ido creando y generando hasta el momento.'}
              </p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-4 shadow-2xs ${
              isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              {[
                { time: '09-17 20:30', title: 'Generación de Voz Sintética', desc: 'Asistente Robótico Clásico • Modelo K.I.T.T. Neural' },
                { time: '09-17 18:45', title: 'Creación de Website', desc: 'Despliegue de página de Inicio con Canvas Blanco y Copiloto Daniel' },
                { time: '09-17 16:12', title: 'Calibración de Daniel 1.0', desc: 'Sincronización de motor neural y túnel de audio con Spotify' },
              ].map((item, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.title}</div>
                    <div className="text-[11px] text-zinc-400">{item.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 9: CRECIMIENTO & CAPTACIÓN POR NICHO (LeadNicho 7-Step OS inside 4haus Studio) */}
        {[
          'growth-os',
          'negocio-perfil',
          'prospectos-crm',
          'campanas-ia',
          'landings-brief',
          'conexiones-api',
        ].includes(activeSidebarItem) && (
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
        )}

      </div>

    </div>
  );
}
