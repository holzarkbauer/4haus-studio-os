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
import { HorizontalTutorialsBanner } from './HorizontalTutorialsBanner';
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
            
            {/* 0. VENTANA PRINCIPAL DE PROMPT GUIADO POR IA ("Donde las ideas se hacen realidad") */}
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
            />

            {/* 1. SECCIÓN HORIZONTAL DE TUTORIALES CON VIDEO EN VIVO A TODO EL ANCHO (1/3 de la altura de la sección superior) */}
            <HorizontalTutorialsBanner
              lang={lang}
              themeMode={themeMode}
              onOpenTutorialsModal={onOpenTutorials}
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

        {/* VIEW 3: WEBSITES LIBRARY */}
        {activeSidebarItem === 'websites' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-600 font-semibold mb-1">
                <Globe className="w-4 h-4" />
                <span>{lang === 'en' ? 'Production Deployments' : 'Despliegues en Producción'}</span>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {lang === 'en' ? 'Websites Library' : 'Librería de Websites'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en'
                  ? 'Access live production landing pages, client clones, and conversion architectures.'
                  : 'Accede a landing pages en vivo, clones de clientes y arquitecturas de conversión.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: '4haus Enterprise OS', desc: 'Main conversion portal with video canvas and autonomous engine', url: 'https://4haus.studio' },
                { title: 'Haustore Marketplace', desc: 'Pre-built production codebases ready for one-click deployment', url: 'https://4haus.studio/store' },
                { title: 'Autonomous Swarm Hub', desc: 'Real-time multi-agent orchestrator with webhook telemetry', url: 'https://4haus.studio/agents' },
                { title: 'Systems Knowledge Vault', desc: 'Curated technical library on scaling and operational mastery', url: 'https://4haus.studio/knowledge' },
              ].map((site, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isDark ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold transition-colors ${
                        isDark ? 'text-white group-hover:text-indigo-400' : 'text-zinc-900 group-hover:text-indigo-600'
                      }`}>
                        {site.title}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        LIVE
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{site.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[200px]">{site.url}</span>
                    <button
                      onClick={() => onOpenLivePreview(site.url, site.title)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                      }`}
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <LeadNichoEngine
              lang={lang}
              themeMode={themeMode}
              initialStep="paso5-landing"
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

        {/* VIEW 6: KNOWLEDGE LIBRARY */}
        {activeSidebarItem === 'knowledge' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-indigo-600 font-semibold mb-1">
                <BookOpen className="w-4 h-4" />
                <span>{lang === 'en' ? 'Curated Architecture' : 'Arquitectura Curada'}</span>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Knowledge Library</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en' ? 'Essential reading for systems engineers and entrepreneurs.' : 'Lecturas fundamentales para ingenieros de sistemas y fundadores.'}
              </p>
            </div>

            <div className={`p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isDark 
                ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' 
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div>
                <h3 className="text-xl font-bold">Biblioteca de Libros Recomendados</h3>
                <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                  Obras de arquitectura de sistemas, filosofía de ingeniería, escala y alta eficiencia.
                </p>
              </div>
              <button
                onClick={onOpenBooksModal}
                className="px-5 py-2.5 rounded-xl bg-amber-900 text-white font-bold text-xs hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
              >
                {lang === 'en' ? 'Browse Books' : 'Ver Libros'}
              </button>
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

        {/* VIEW 8: DESCUBRIMIENTO & RECURSOS (Also includes Step 6 Library & Playbooks) */}
        {(activeSidebarItem === 'descubrimiento' || activeSidebarItem === 'recursos') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {activeSidebarItem === 'descubrimiento' ? 'Descubrimiento' : 'Biblioteca de recursos'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => onSelectSidebarItem('websites')}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Globe className="w-6 h-6 text-indigo-500 mb-2" />
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Sitios Web de Referencia</div>
                <div className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Explora arquitecturas web publicadas por 4haus Studio.</div>
              </div>
              <div 
                onClick={onOpenTutorials}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Play className="w-6 h-6 text-emerald-500 mb-2" />
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Tutoriales del Mes</div>
                <div className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Aprende a orquestar Claude con MCP y crear sitios web completos.</div>
              </div>
            </div>

            <LeadNichoEngine
              lang={lang}
              themeMode={themeMode}
              initialStep="paso6-recursos"
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
