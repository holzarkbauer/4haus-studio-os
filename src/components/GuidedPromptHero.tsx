import React, { useState, useRef } from 'react';
import {
  Globe,
  Smartphone,
  LayoutGrid,
  Lightbulb,
  Paperclip,
  Bot,
  ChevronDown,
  SlidersHorizontal,
  Mic,
  Square,
  ArrowUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building2,
  Target,
  Send,
  LayoutTemplate,
  FileDown,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { Language } from '../types';
import { GrowthStepId } from './LeadNichoEngine';
import { ProjectPreloadPayload } from '../types/leadNichoTypes';
import { saveProjectToFirestore } from '../services/firebaseAuth';
import { generateAndDownloadStrategyDossierPdf } from '../utils/dossierPdfGenerator';
import {
  InvestorInfographicModal,
  InfographicModalTab,
} from './InvestorInfographicModal';
import { WhaleLogo } from './WhaleLogo';

export interface GuidedMessage {
  role: 'user' | 'assistant';
  content: string;
  questions?: string[];
  quickReplies?: string[];
  proposalSummary?: string;
  recommendedModule?: GrowthStepId;
  projectData?: ProjectPreloadPayload;
}

interface GuidedPromptHeroProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  userId?: string | null;
  messages?: GuidedMessage[];
  onUpdateMessages?: (msgs: GuidedMessage[]) => void;
  onApplyStrategyChanges?: (preloadData: ProjectPreloadPayload) => void;
  onNavigateToModule: (
    sidebarItem: string,
    growthStep?: GrowthStepId,
    preloadData?: ProjectPreloadPayload
  ) => void;
  onOpenPlans: () => void;
  onOpenDanielModal: () => void;
}

export function GuidedPromptHero({
  lang,
  themeMode = 'light',
  userId,
  messages: externalMessages,
  onUpdateMessages,
  onApplyStrategyChanges,
  onNavigateToModule,
  onOpenPlans,
  onOpenDanielModal,
}: GuidedPromptHeroProps) {
  const isDark = themeMode === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<'app-web' | 'mobile' | 'crm-system' | 'niche-idea'>('app-web');
  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('Daniel 1.0');
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isInfographicOpen, setIsInfographicOpen] = useState<boolean>(false);
  const [infographicInitialTab, setInfographicInitialTab] =
    useState<InfographicModalTab>('overview');
  const [latestWorkspace, setLatestWorkspace] = useState<any>(null);
  const [localMessages, setLocalMessages] = useState<GuidedMessage[]>([]);
  const recognitionRef = useRef<any>(null);

  const messages = externalMessages !== undefined ? externalMessages : localMessages;
  const setMessages = (nextMsgs: GuidedMessage[]) => {
    if (onUpdateMessages) {
      onUpdateMessages(nextMsgs);
    } else {
      setLocalMessages(nextMsgs);
    }
  };

  const categories = [
    {
      id: 'app-web' as const,
      label: lang === 'en' ? 'Web App' : 'App web',
      icon: Globe,
      placeholder:
        lang === 'en'
          ? 'Build me a real estate portal or Netflix clone...'
          : 'Constrúyeme un clon de Netflix, una web inmobiliaria o un sistema de captación...',
    },
    {
      id: 'mobile' as const,
      label: lang === 'en' ? 'Mobile App' : 'App móvil',
      icon: Smartphone,
      placeholder:
        lang === 'en'
          ? 'Design a mobile booking and client loyalty app...'
          : 'Diseña una app móvil de reservas y seguimiento de clientes...',
    },
    {
      id: 'crm-system' as const,
      label: lang === 'en' ? 'CRM & Funnel' : 'Sistema & CRM',
      icon: LayoutGrid,
      placeholder:
        lang === 'en'
          ? 'Create a niche lead capture system with AI qualification...'
          : 'Créame un sistema de captación de clientes por nicho con CRM y campañas...',
    },
    {
      id: 'niche-idea' as const,
      label: lang === 'en' ? 'Niche Strategy' : 'Estrategia & Nicho',
      icon: Lightbulb,
      placeholder:
        lang === 'en'
          ? 'Help me define my niche, 3 buyer personas and value proposition...'
          : 'Ayúdame a definir mi nicho, 3 buyer personas y mi oferta de alto valor...',
    },
  ];

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  const handleSendPrompt = async (overrideText?: string) => {
    const textToSend = (overrideText ?? promptInput).trim();
    if (!textToSend || isThinking) return;

    const lowerDirect = textToSend.toLowerCase();
    if (
      lowerDirect === 'abrir guía detallada del expositor (para josé)' ||
      lowerDirect === 'abrir guia detallada del expositor'
    ) {
      setInfographicInitialTab('speaker_guide');
      setIsInfographicOpen(true);
      setPromptInput('');
      return;
    }

    if (
      lowerDirect === 'abrir dashboard infográfico visual en pantalla completa' ||
      lowerDirect === 'abrir dashboard infográfico visual (inversionista)' ||
      lowerDirect === 'ver dashboard infográfico'
    ) {
      setInfographicInitialTab('overview');
      setIsInfographicOpen(true);
      setPromptInput('');
      return;
    }

    const updatedMessages: GuidedMessage[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMessages);
    setPromptInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/studio/guided-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          messages: updatedMessages,
          projectType: activeCategoryObj.label,
          engineModel: selectedModel,
          userId: userId || 'default',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.updatedWorkspace) {
          setLatestWorkspace(data.updatedWorkspace);
        }
        const lowerSent = textToSend.toLowerCase();
        const wantsSpeaker =
          Boolean(data.openSpeakerGuideTab) ||
          data.presentationMode === 'speaker-script' ||
          lowerSent.includes('expositor') ||
          lowerSent.includes('explicativ') ||
          lowerSent.includes('detallad') ||
          lowerSent.includes('dirigida a mi') ||
          lowerSent.includes('dirigida a mí') ||
          lowerSent.includes('guion') ||
          lowerSent.includes('guión');

        const wantsInfographic =
          !wantsSpeaker &&
          (Boolean(data.openInfographicDashboard) ||
            lowerSent.includes('dashboard') ||
            lowerSent.includes('infografia') ||
            lowerSent.includes('infografía') ||
            lowerSent.includes('visual') ||
            lowerSent.includes('impacto'));

        const wantsPdf =
          wantsSpeaker ||
          wantsInfographic ||
          Boolean(data.downloadPdfDossier) ||
          lowerSent.includes('pdf') ||
          lowerSent.includes('dosier') ||
          lowerSent.includes('dossier');

        if (wantsSpeaker) {
          setInfographicInitialTab('speaker_guide');
          setIsInfographicOpen(true);
        } else if (wantsInfographic) {
          setInfographicInitialTab('overview');
          setIsInfographicOpen(true);
        }

        if (data.projectData && onApplyStrategyChanges && !wantsPdf) {
          onApplyStrategyChanges(data.projectData);
        }
        if (userId && data.projectData?.businessName && !wantsPdf) {
          const safeProjId = `proj_${data.projectData.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .slice(0, 48)}`;
          saveProjectToFirestore(userId, safeProjId, {
            name: data.projectData.businessName,
            industry: data.projectData.industry || activeCategoryObj.label,
            targetLocation: data.projectData.targetLocation || 'Global',
            objective:
              data.projectData.goal90Days ||
              data.proposalSummary ||
              'Propuesta generada desde el asistente de 4haus Studio',
            status: 'En Configuración',
          }).catch(() => {});
        }

        const nextHistory: GuidedMessage[] = [
          ...updatedMessages,
          {
            role: 'assistant',
            content: data.reply,
            questions: data.questions || [],
            quickReplies: data.quickReplies || [],
            proposalSummary: data.proposalSummary,
            recommendedModule: (data.recommendedModule as GrowthStepId) || 'paso1-negocio',
            projectData: data.projectData,
          },
        ];
        setMessages(nextHistory);

        if (wantsPdf) {
          await generateAndDownloadStrategyDossierPdf({
            userId,
            workspace: data.updatedWorkspace || null,
            projectData: data.projectData || null,
            messages: nextHistory,
            customPrompt: textToSend,
            forcedMode: wantsSpeaker ? 'speaker-script' : 'infographic-dashboard',
          });
        }
      }
    } catch (error) {
      console.error('Error in guided builder:', error);
    } finally {
      setIsThinking(false);
    }
  };

  // Real Microphone Voice Dictation (Continuous + Interim + Toggle Stop)
  const handleVoiceDictation = () => {
    if (isListeningVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      setVoiceFeedback(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceFeedback(
        lang === 'en'
          ? 'Voice dictation is not supported in this browser. Loaded sample idea.'
          : 'Tu navegador no soporta dictado directo; hemos cargado una idea base editable.'
      );
      setPromptInput((prev) =>
        prev
          ? prev
          : 'Quiero crear un sistema de captación para mi inmobiliaria con landing page, CRM de prospectos y campañas de email.'
      );
      setTimeout(() => setVoiceFeedback(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang === 'en' ? 'en-US' : 'es-ES';
      recognition.interimResults = true;
      recognition.continuous = false;

      const baseText = promptInput.trim();

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setVoiceFeedback(
          lang === 'en'
            ? 'Listening to your voice... Speak your project idea clearly.'
            : 'Escuchando por micrófono... Dicta tu idea y pulsa de nuevo para detener.'
        );
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPromptInput(baseText ? `${baseText} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        setVoiceFeedback(null);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
        setVoiceFeedback(null);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListeningVoice(false);
    }
  };

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="space-y-6">
      <InvestorInfographicModal
        isOpen={isInfographicOpen}
        onClose={() => setIsInfographicOpen(false)}
        userId={userId}
        projectData={latestAssistantMsg?.projectData || null}
        workspace={latestWorkspace}
        messages={messages}
        initialTab={infographicInitialTab}
      />
      <div
        className={`relative rounded-[32px] overflow-hidden border transition-all p-6 sm:p-10 lg:p-12 ${
          isDark
            ? 'bg-[#1D1D1F] border-white/10 text-[#F5F5F7] shadow-2xl'
            : 'bg-white border-black/[0.08] text-[#1D1D1F] shadow-sm'
        }`}
      >
        {/* Top Row inside Hero */}
        <div className="flex items-center justify-between gap-3 mb-8 sm:mb-10">
          <div
            className={`inline-flex items-center p-1 rounded-full border ${
              isDark ? 'bg-black/60 border-white/10' : 'bg-[#F5F5F7] border-black/[0.06]'
            }`}
          >
            <button
              type="button"
              onClick={() => onNavigateToModule('growth-os', 'dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                messages.length === 0
                  ? isDark
                    ? 'bg-white text-black shadow-xs'
                    : 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#86868B] hover:text-current'
              }`}
              title="Vista de Constructor y Propuesta"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">4haus Studio</span>
            </button>
            <button
              type="button"
              onClick={onOpenDanielModal}
              className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#86868B] hover:text-current transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Asistente de Voz Daniel 1.0"
            >
              <span className="w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/15 flex items-center justify-center p-0.5 shrink-0">
                <WhaleLogo className="w-3.5 h-3.5 text-black dark:text-white" showText={false} />
              </span>
              <span className="hidden sm:inline">Daniel 1.0</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border cursor-pointer whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'bg-black border-white/10 text-zinc-300 hover:text-white'
                    : 'bg-[#F5F5F7] border-black/[0.08] text-[#1D1D1F] hover:bg-zinc-200/70'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Nueva sesión</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenPlans}
              className="px-4 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Upgrade plan' : 'Mejorar plan'}
            </button>
          </div>
        </div>

        {/* Center Headline */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-tight text-[#0071E3]">
              4haus Intelligence · Copiloto Estratégico
            </p>
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${
                isDark ? 'text-white' : 'text-[#1D1D1F]'
              }`}
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              What do you want to create ?
            </h1>
          </div>

          {/* Category Selector Buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-white text-zinc-950 shadow-sm'
                        : 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80'
                      : isDark
                      ? 'bg-zinc-900/70 text-zinc-400 hover:text-white border border-zinc-800'
                      : 'bg-slate-200/75 text-zinc-600 hover:bg-white/80 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Guided Conversation History */}
          {messages.length > 0 && (
            <div
              className={`text-left rounded-3xl p-4 sm:p-6 border space-y-4 max-h-[460px] overflow-y-auto ${
                isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/95 border-zinc-200 shadow-sm'
              }`}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl space-y-3 ${
                    msg.role === 'user'
                      ? isDark
                        ? 'bg-zinc-900 border border-zinc-800 text-white ml-4 sm:ml-10'
                        : 'bg-sky-50/90 border border-sky-200/70 text-zinc-900 ml-4 sm:ml-10'
                      : isDark
                      ? 'bg-emerald-950/30 border border-emerald-800/50 text-zinc-100 mr-2 sm:mr-6'
                      : 'bg-zinc-50 border border-zinc-200/90 text-zinc-800 mr-2 sm:mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={msg.role === 'user' ? 'text-sky-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {msg.role === 'user' ? 'TU IDEA / RESPUESTA' : `ARQUITECTO IA 4HAUS (${selectedModel})`}
                    </span>
                    {msg.proposalSummary && (
                      <span className="text-zinc-400 truncate max-w-[240px]">{msg.proposalSummary}</span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>

                  {/* AI Clarifying Questions */}
                  {msg.questions && msg.questions.length > 0 && (
                    <div
                      className={`p-3.5 rounded-xl border space-y-1.5 ${
                        isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-emerald-500">
                        Preguntas clave para afinar tu propuesta:
                      </div>
                      <ul className="text-xs space-y-1.5 list-decimal pl-4">
                        {msg.questions.map((q, qIdx) => (
                          <li key={qIdx} className={isDark ? 'text-zinc-200' : 'text-zinc-700'}>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Clickable Replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase">
                        Haz clic para responder rápido o escribe debajo:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.quickReplies.map((qr, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleSendPrompt(qr)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                              isDark
                                ? 'bg-zinc-900 border-zinc-700 hover:border-emerald-500 text-zinc-200'
                                : 'bg-white border-zinc-300 hover:border-emerald-600 text-zinc-800'
                            }`}
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real Construction Tool Preload Bar: Clicking any tool pre-fills the project data into that module's form */}
                  {msg.role === 'assistant' && (
                    <div className="pt-3 border-t border-zinc-800/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-500">
                          Construcción Real · Pulsa una herramienta para precargar los datos de tu propuesta:
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToModule('growth-os', 'paso1-negocio', msg.projectData)
                          }
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all"
                        >
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Precargar Perfil del Negocio</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToModule('growth-os', 'paso5-landing', msg.projectData)
                          }
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isDark
                              ? 'bg-zinc-900 border-zinc-700 hover:border-emerald-500 text-white'
                              : 'bg-white border-zinc-300 hover:border-emerald-600 text-zinc-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <LayoutTemplate className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Precargar Brief de Landing Page</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToModule('growth-os', 'paso4-campana', msg.projectData)
                          }
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isDark
                              ? 'bg-zinc-900 border-zinc-700 hover:border-emerald-500 text-white'
                              : 'bg-white border-zinc-300 hover:border-emerald-600 text-zinc-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>Precargar Campaña de Email</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToModule('growth-os', 'paso2-nicho', msg.projectData)
                          }
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isDark
                              ? 'bg-zinc-900 border-zinc-700 hover:border-emerald-500 text-white'
                              : 'bg-white border-zinc-300 hover:border-emerald-600 text-zinc-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Generar Nicho & 3 ICPs</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setInfographicInitialTab('speaker_guide');
                            setIsInfographicOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-between gap-2 cursor-pointer transition-all shadow-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>Guía Detallada del Expositor (Para José · 3 Págs)</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setInfographicInitialTab('overview');
                            setIsInfographicOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-between gap-2 cursor-pointer transition-all shadow-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                            <span>Abrir Dashboard Infográfico Visual (Inversionista)</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            generateAndDownloadStrategyDossierPdf({
                              userId,
                              projectData: msg.projectData,
                              messages,
                            })
                          }
                          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all shadow-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileDown className="w-3.5 h-3.5 shrink-0" />
                            <span>Descargar Dashboard Infográfico en PDF Horizontal</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="p-3 text-xs font-mono text-emerald-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analizando tu respuesta y estructurando datos para precarga real...</span>
                </div>
              )}
            </div>
          )}

          {/* Main Prompt Box Card */}
          <div
            className={`rounded-3xl border p-4 sm:p-5 text-left transition-all shadow-sm ${
              isDark
                ? 'bg-zinc-900/95 border-zinc-800 focus-within:border-zinc-700'
                : 'bg-[#f8fafc] border-zinc-200/90 focus-within:border-zinc-300 focus-within:bg-white'
            }`}
          >
            {voiceFeedback && (
              <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {voiceFeedback}
                </span>
                {isListeningVoice && (
                  <button
                    type="button"
                    onClick={handleVoiceDictation}
                    className="text-[11px] font-bold underline cursor-pointer"
                  >
                    Detener
                  </button>
                )}
              </div>
            )}

            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder={
                messages.length === 0
                  ? activeCategoryObj.placeholder
                  : 'Responde a las preguntas de la IA o pulsa el micrófono para dictar...'
              }
              className={`w-full bg-transparent text-sm sm:text-base resize-none focus:outline-none leading-relaxed ${
                isDark
                  ? 'text-white placeholder:text-zinc-500'
                  : 'text-zinc-900 placeholder:text-zinc-400'
              }`}
            />

            {/* Bottom Prompt Toolbar */}
            <div className="flex items-center justify-between pt-3 mt-1">
              <div className="flex items-center gap-2 relative">
                <button
                  type="button"
                  onClick={() =>
                    setPromptInput((prev) =>
                      prev ? prev : 'Contexto de mi negocio: Inmobiliaria / Servicios de alto ticket. '
                    )
                  }
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`}
                  title="Añadir contexto del negocio"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-200 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-200/60'
                  }`}
                >
                  <Bot className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>{selectedModel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {showModelMenu && (
                  <div
                    className={`absolute bottom-11 left-8 z-30 w-52 rounded-2xl border p-1.5 shadow-lg text-left ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  >
                    {[
                      { id: 'E-1', desc: 'Arquitecto Guía 4haus (Rápido)' },
                      { id: 'Sonnet 5.5', desc: 'Estrategia & Copywriting Profundo' },
                      { id: 'Daniel 2.0', desc: 'Copiloto Ejecutivo de Sistemas' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowModelMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          selectedModel === m.id
                            ? isDark
                              ? 'bg-zinc-800 font-bold'
                              : 'bg-zinc-100 font-bold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div>{m.id}</div>
                        <div className="text-[10px] text-zinc-400">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right controls: Globe, Settings Sliders, Real Voice Mic Button, Submit Arrow */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToModule('websites')}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`}
                  title="Explorar plantillas web"
                >
                  <Globe className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToModule('growth-os', 'paso1-negocio')}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`}
                  title="Configurar parámetros del negocio"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleVoiceDictation}
                  className={`px-3 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isListeningVoice
                      ? 'bg-rose-600 text-white animate-pulse shadow-sm'
                      : isDark
                      ? 'text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800'
                      : 'text-zinc-700 hover:text-zinc-950 bg-zinc-200/70 hover:bg-zinc-200'
                  }`}
                  title={isListeningVoice ? 'Detener dictado por voz' : 'Dictar tu idea con el micrófono'}
                >
                  {isListeningVoice ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Grabando voz...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span className="hidden sm:inline">Dictar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendPrompt()}
                  disabled={!promptInput.trim() || isThinking}
                  className={`w-10 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    promptInput.trim()
                      ? 'bg-zinc-900 dark:bg-emerald-600 text-white shadow-xs hover:scale-105'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'bg-zinc-200/90 text-zinc-400'
                  }`}
                  title="Enviar prompt y recibir guía de la IA"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
