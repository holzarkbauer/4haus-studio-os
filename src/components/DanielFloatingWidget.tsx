import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  Square,
  X,
  Send,
  Music,
  Building2,
  Target,
  LayoutTemplate,
  Users,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Upload,
  Play,
  Settings2,
  Trash2,
  FileDown,
} from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { WhaleLogo } from './WhaleLogo';
import { Language } from '../types';
import { GrowthStepId } from './LeadNichoEngine';
import { ProjectPreloadPayload } from '../types/leadNichoTypes';
import { GuidedMessage } from './GuidedPromptHero';
import { saveProjectToFirestore, syncWorkspaceMetaToFirestore } from '../services/firebaseAuth';
import {
  danielVoice,
  DANIEL_FISH_AUDIO_TRANSCRIPT,
  DANIEL_MALE_VOICE_PRESETS,
} from '../utils/danielVoiceEngine';
import { getWorkspaceId } from '../utils/workspaceId';
import { generateAndDownloadStrategyDossierPdf } from '../utils/dossierPdfGenerator';
import {
  DANIEL_MORAL_PILLARS,
  DEFAULT_LEARNED_LESSONS,
  buildDanielPersonalGreeting,
  evaluateSecurityAndConfidentiality,
} from '../utils/danielMoralCode';
import {
  DANIEL_SUPER_AGENT_DEPARTMENTS,
  OPEN_SOURCE_AGENT_REPOS,
  DEFAULT_SUPER_AGENT_PROFILE,
  SuperAgentDispatchResult,
} from '../utils/danielSuperAgentEngine';
import { ShieldCheck, BarChart3, BookOpen, Cpu, Layers } from 'lucide-react';
import {
  InvestorInfographicModal,
  InfographicModalTab,
} from './InvestorInfographicModal';
import { DocumentPresentationMode } from '../types/leadNichoTypes';

interface DanielFloatingWidgetProps {
  lang: Language;
  activeSection?: string;
  activeGrowthStep?: GrowthStepId;
  userId?: string | null;
  messages: GuidedMessage[];
  onUpdateMessages: (msgs: GuidedMessage[]) => void;
  onApplyStrategyChanges: (
    preloadData: ProjectPreloadPayload,
    targetSidebarItem?: string,
    targetGrowthStep?: GrowthStepId
  ) => void;
  onOpenFullModal: () => void;
  onOpenSpotify?: () => void;
}

export function DanielFloatingWidget({
  lang,
  activeSection = 'inicio',
  activeGrowthStep = 'dashboard',
  userId,
  messages,
  onUpdateMessages,
  onApplyStrategyChanges,
  onOpenFullModal,
  onOpenSpotify,
}: DanielFloatingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showMoralCode, setShowMoralCode] = useState(false);
  const [showSuperAgentConsole, setShowSuperAgentConsole] = useState(false);
  const [isDispatchingSuperAgent, setIsDispatchingSuperAgent] = useState(false);
  const [superAgentResult, setSuperAgentResult] = useState<SuperAgentDispatchResult | null>(null);
  const [isInfographicOpen, setIsInfographicOpen] = useState(false);
  const [infographicInitialTab, setInfographicInitialTab] =
    useState<InfographicModalTab>('overview');
  const [latestWorkspace, setLatestWorkspace] = useState<any>(null);
  const [lastSessionTopic, setLastSessionTopic] = useState<string>(
    () =>
      localStorage.getItem('daniel_last_session_topic_v1') ||
      'tu estrategia de Growth & Niche y la presentación de alto valor ($100M Offers) para el inversionista'
  );

  const feedEndRef = useRef<HTMLDivElement | null>(null);

  // Fish Audio & Voice Engine State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCustomFishAudio, setHasCustomFishAudio] = useState(false);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [activeVoiceSource, setActiveVoiceSource] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(danielVoice.getAutoSpeak());
  const [fishRefId, setFishRefId] = useState(danielVoice.getReferenceId());
  const [voicePreset, setVoicePreset] = useState(danielVoice.getVoicePreset());
  const [alwaysMasterMp3, setAlwaysMasterMp3] = useState(danielVoice.getAlwaysUseMasterMp3());

  const recognitionRef = useRef<any>(null);
  const fishFileInputRef = useRef<HTMLInputElement | null>(null);
  const handleSendInstructionRef = useRef<((text?: string) => void) | null>(null);

  useEffect(() => {
    const unsubscribe = danielVoice.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setHasCustomFishAudio(state.hasCustomAudio);
      setCustomAudioName(state.customAudioFilename);
      setActiveVoiceSource(state.activeSource);
      setVoicePreset(state.voicePreset);
      setAlwaysMasterMp3(state.alwaysUseMasterMp3);
    });
    return () => unsubscribe();
  }, []);

  // Cualquier pantalla puede pedirle algo a Daniel con:
  // window.dispatchEvent(new CustomEvent('daniel:ask', { detail: { text: '...' } }))
  // El widget se abre y envía la pregunta.
  useEffect(() => {
    const onAsk = (event: Event) => {
      const text = (event as CustomEvent<{ text?: string }>).detail?.text;
      setIsExpanded(true);
      if (text) handleSendInstructionRef.current?.(text);
    };
    window.addEventListener('daniel:ask', onAsk);
    return () => window.removeEventListener('daniel:ask', onAsk);
  }, []);

  const sectionLabels: Record<string, string> = {
    inicio: lang === 'en' ? 'Home & Strategy Architect' : 'Inicio & Arquitecto de Propuesta',
    'growth-os': lang === 'en' ? 'Growth & Niche OS' : 'Growth & Niche OS',
    'negocio-perfil': lang === 'en' ? 'Step 1 · Business Profile' : 'Paso 1 · Perfil del Negocio',
    'prospectos-crm': lang === 'en' ? 'Step 3 · Prospects CRM' : 'Paso 3 · CRM de Prospectos',
    'campanas-ia': lang === 'en' ? 'Step 4 · AI Campaigns' : 'Paso 4 · Campañas con IA',
    'landings-brief': lang === 'en' ? 'Step 5 · Landing Pages' : 'Paso 5 · Landing Pages',
    websites: lang === 'en' ? 'Websites Library' : 'Librería de Websites',
    'ai-agents': lang === 'en' ? 'Step 7 · AI Agents Team' : 'Paso 7 · Equipo de Agentes IA',
    recursos: lang === 'en' ? 'Step 6 · Resources' : 'Paso 6 · Biblioteca de Recursos',
    'conexiones-api': lang === 'en' ? 'External Connections' : 'Conexiones Externas',
  };

  const currentSectionLabel = sectionLabels[activeSection] || sectionLabels['growth-os'];

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  const handleDownloadPdfDossier = async (
    customWorkspace?: any,
    customProjectData?: ProjectPreloadPayload,
    customPromptText?: string,
    forcedMode?: DocumentPresentationMode
  ) => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const lastUserPrompt =
        customPromptText ||
        [...messages].reverse().find((m) => m.role === 'user')?.content ||
        '';
      const filename = await generateAndDownloadStrategyDossierPdf({
        userId,
        workspace: customWorkspace || null,
        projectData: customProjectData || latestAssistantMsg?.projectData || null,
        messages,
        customPrompt: lastUserPrompt,
        forcedMode,
      });
      setLastNotification(
        lang === 'en'
          ? `PDF downloaded: ${filename}`
          : `PDF generado y descargado a medida: ${filename}`
      );
      setTimeout(() => setLastNotification(null), 5000);
    } catch (err) {
      console.error('Error generating Dossier PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleFishAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await danielVoice.uploadFishAudioMaster(file);
    setLastNotification(
      lang === 'en'
        ? `Fish Audio master voice "${file.name}" saved on server & browser!`
        : `¡Tu voz original Fish Audio "${file.name}" quedó vinculada y activa!`
    );
    setTimeout(() => setLastNotification(null), 4500);
    if (fishFileInputRef.current) {
      fishFileInputRef.current.value = '';
    }
  };

  const handlePlaySignatureVoice = async () => {
    if (isSpeaking) {
      danielVoice.stop();
      return;
    }
    if (hasCustomFishAudio) {
      await danielVoice.playFishAudioMaster();
    } else {
      await danielVoice.speak(DANIEL_FISH_AUDIO_TRANSCRIPT, lang === 'en' ? 'en' : 'es', {
        preferMasterSample: true,
      });
    }
  };

  // Voice Dictation inside the bottom-right widget
  const handleToggleVoice = () => {
    if (isListeningVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setQuickQuery((prev) =>
        prev
          ? prev
          : 'Ajusta el nicho hacia propietarios e inversores de alto ticket en Madrid y Miami.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang === 'en' ? 'en-US' : 'es-CO';
      recognition.interimResults = true;
      recognition.continuous = false;
      const baseText = quickQuery.trim();

      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setQuickQuery(baseText ? `${baseText} ${transcript}` : transcript);
        }
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  const handleDispatchSuperAgentMission = async (customMission?: string) => {
    if (isDispatchingSuperAgent) return;
    setIsDispatchingSuperAgent(true);
    setShowSuperAgentConsole(true);
    try {
      const res = await fetch('/api/studio/super-agent-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          missionPrompt:
            customMission ||
            quickQuery ||
            lastSessionTopic ||
            'Coordinar los 12 departamentos de nuestra startup para escalar captación, arquitectura y cierre con inversores',
          ...DEFAULT_SUPER_AGENT_PROFILE,
          userId: userId || 'default',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dispatchResult) {
          setSuperAgentResult(data.dispatchResult);
          setLastNotification(
            '¡Super Agent activado! Los 12 departamentos han sincronizado su entrega en la Memoria Compartida.'
          );
          setTimeout(() => setLastNotification(null), 5000);
        }
      }
    } catch (err) {
      console.error('Error dispatching Super Agent mission:', err);
    } finally {
      setIsDispatchingSuperAgent(false);
    }
  };

  const handleSendInstruction = async (overrideText?: string) => {
    const rawText = (overrideText ?? quickQuery).trim();
    if (!rawText || isThinking) return;

    const lower = rawText.toLowerCase();

    if (
      lower === 'ejecutar misión del super agent (12 departamentos)' ||
      lower === 'activar super agent (12 departamentos)'
    ) {
      setQuickQuery('');
      await handleDispatchSuperAgentMission(lastSessionTopic);
      return;
    }

    if (lower === 'abrir paso 7 · centro de mando super agent') {
      setQuickQuery('');
      onApplyStrategyChanges(latestAssistantMsg?.projectData || {}, 'ai-agents', 'paso7-agentes');
      return;
    }

    // Update last session topic memory for José's personal greeting
    const cleanedTopic = rawText.length > 75 ? `${rawText.slice(0, 75)}...` : rawText;
    setLastSessionTopic(cleanedTopic);
    try {
      localStorage.setItem('daniel_last_session_topic_v1', cleanedTopic);
    } catch {
      // ignore storage errors
    }

    // Security & Confidentiality Protocol (Questions 16 & 17 of Daniel 1.0 Moral Code)
    const secCheck = evaluateSecurityAndConfidentiality(rawText);
    if (secCheck.safeResponse) {
      const secHistory: GuidedMessage[] = [
        ...messages,
        { role: 'user', content: rawText },
        {
          role: 'assistant',
          content: secCheck.safeResponse,
          proposalSummary: 'Protocolo de Confidencialidad y Autoridad · Código Moral Daniel 1.0',
        },
      ];
      onUpdateMessages(secHistory);
      setQuickQuery('');
      return;
    }

    // Direct Spotify shortcut if user specifically asks for music
    if (
      lower === 'spotify' ||
      lower === 'poner música' ||
      lower === 'play music' ||
      lower === 'abrir spotify'
    ) {
      if (onOpenSpotify) {
        setLastNotification(
          lang === 'en' ? 'Opening Spotify Audio Hub...' : 'Abriendo Spotify Audio Hub...'
        );
        setTimeout(() => {
          onOpenSpotify();
          setLastNotification(null);
        }, 400);
        setQuickQuery('');
        return;
      }
    }

    // Direct shortcut if user clicks "Abrir Guía Detallada del Expositor (Para José)"
    if (
      lower === 'abrir guía detallada del expositor (para josé)' ||
      lower === 'abrir guia detallada del expositor' ||
      lower === 'ver guía del expositor'
    ) {
      setInfographicInitialTab('speaker_guide');
      setIsInfographicOpen(true);
      setQuickQuery('');
      return;
    }

    // Direct shortcut if user clicks "Descargar PDF de la Guía del Expositor (3 Páginas)"
    if (
      lower === 'descargar pdf de la guía del expositor (3 páginas)' ||
      lower === 'descargar guía del expositor'
    ) {
      setQuickQuery('');
      await handleDownloadPdfDossier(
        latestWorkspace,
        latestAssistantMsg?.projectData,
        'Presentación detallada y explicativa dirigida a José como expositor',
        'speaker-script'
      );
      return;
    }

    // Direct shortcut if user clicks "Abrir Dashboard Infográfico Visual en Pantalla Completa"
    if (
      lower === 'abrir dashboard infográfico visual en pantalla completa' ||
      lower === 'abrir dashboard infográfico visual (inversionista)' ||
      lower === 'ver también el dashboard infográfico del inversionista' ||
      lower === 'ver el dashboard infográfico del inversionista' ||
      lower === 'ver dashboard infográfico' ||
      lower === 'abrir infografía'
    ) {
      setInfographicInitialTab('overview');
      setIsInfographicOpen(true);
      setQuickQuery('');
      return;
    }

    const wantsSpeakerGuide =
      lower.includes('expositor') ||
      lower.includes('explicativ') ||
      lower.includes('detallad') ||
      lower.includes('dirigida a mi') ||
      lower.includes('dirigida a mí') ||
      lower.includes('para mi') ||
      lower.includes('para mí') ||
      lower.includes('guion') ||
      lower.includes('guión') ||
      lower.includes('como exponer') ||
      lower.includes('cómo exponer') ||
      lower.includes('que decir') ||
      lower.includes('qué decir') ||
      lower.includes('argumentario') ||
      lower.includes('mismo dashboard') ||
      lower.includes('volvio a dar') ||
      lower.includes('volvió a dar');

    const wantsInfographic =
      !wantsSpeakerGuide &&
      (lower.includes('dashboard') ||
        lower.includes('infografia') ||
        lower.includes('infografía') ||
        lower.includes('visual') ||
        lower.includes('grafico') ||
        lower.includes('gráfico') ||
        lower.includes('impacto'));

    // Check if the user is asking Daniel 1.0 to generate/download a PDF presentation or dossier
    const wantsPdfDirectly =
      wantsSpeakerGuide ||
      wantsInfographic ||
      lower.includes('pdf') ||
      lower.includes('dosier') ||
      lower.includes('dossier') ||
      lower.includes('presentacion') ||
      lower.includes('presentación') ||
      lower.includes('hormozi') ||
      lower.includes('inversionista') ||
      (lower.includes('descarga') &&
        (lower.includes('estrategia') ||
          lower.includes('informe') ||
          lower.includes('dosier') ||
          lower.includes('dossier') ||
          lower.includes('presentacion') ||
          lower.includes('presentación')));

    const updatedMessages: GuidedMessage[] = [...messages, { role: 'user', content: rawText }];
    onUpdateMessages(updatedMessages);
    setQuickQuery('');
    setIsThinking(true);
    setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);

    try {
      const res = await fetch('/api/studio/guided-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getWorkspaceId(userId),
        },
        body: JSON.stringify({
          messages: updatedMessages,
          projectType: currentSectionLabel,
          currentSection: `${activeSection} (${activeGrowthStep})`,
          engineModel: 'Daniel 1.0 · Copiloto Personal de José',
          applyToWorkspace: true,
          userId: getWorkspaceId(userId),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.updatedWorkspace) {
          setLatestWorkspace(data.updatedWorkspace);
        }
        const assistantMsg: GuidedMessage = {
          role: 'assistant',
          content: data.reply,
          questions: data.questions || [],
          quickReplies: data.quickReplies || [],
          proposalSummary: data.proposalSummary,
          recommendedModule: (data.recommendedModule as GrowthStepId) || 'paso2-nicho',
          projectData: data.projectData,
        };

        const finalHistory = [...updatedMessages, assistantMsg];
        onUpdateMessages(finalHistory);
        setTimeout(() => feedEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        if (autoSpeak && data.reply) {
          danielVoice.speak(data.reply, lang === 'en' ? 'en' : 'es');
        }

        // Solo se abre la guía si el usuario la pidió o el servidor lo indica de forma explícita.
        const isSpeakerMode = wantsSpeakerGuide || Boolean(data.openSpeakerGuideTab);

        if (isSpeakerMode) {
          setInfographicInitialTab('speaker_guide');
          setIsInfographicOpen(true);
        } else if (wantsInfographic || data.openInfographicDashboard) {
          setInfographicInitialTab('overview');
          setIsInfographicOpen(true);
        }

        // Execute real PDF Presentation / Dossier download tailored to the exact prompt & mode
        if (wantsPdfDirectly || data.downloadPdfDossier) {
          const filename = await generateAndDownloadStrategyDossierPdf({
            userId,
            workspace: data.updatedWorkspace || null,
            projectData: data.projectData || latestAssistantMsg?.projectData || null,
            messages: finalHistory,
            customPrompt: rawText,
            forcedMode: isSpeakerMode ? 'speaker-script' : 'infographic-dashboard',
          });
          setLastNotification(
            isSpeakerMode
              ? `¡Presentación Keynote Comentada (5 Láminas + Guion para José) descargada: ${filename}!`
              : `¡Presentación Ejecutiva Keynote (5 Láminas 16:9) descargada en PDF: ${filename}!`
          );
          setTimeout(() => setLastNotification(null), 5500);
        } else if (data.projectData) {
          // Immediately propagate the refined strategy to the active forms & workspace
          onApplyStrategyChanges(data.projectData);

          if (userId && data.projectData.businessName) {
            syncWorkspaceMetaToFirestore(
              userId,
              data.projectData.businessName,
              data.projectData.industry || 'Growth & Niche',
              data.projectData.targetLocation || 'Global'
            ).catch(() => {});

            const safeProjId = `proj_${data.projectData.businessName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '_')
              .slice(0, 48)}`;
            saveProjectToFirestore(userId, safeProjId, {
              name: data.projectData.businessName,
              industry: data.projectData.industry || currentSectionLabel,
              targetLocation: data.projectData.targetLocation || 'Global',
              objective:
                data.projectData.goal90Days ||
                data.proposalSummary ||
                'Estrategia Growth & Niche actualizada con Daniel 1.0',
              status: 'Activo',
            }).catch(() => {});
          }

          setLastNotification(
            lang === 'en'
              ? 'Strategy & forms updated in real time across Growth & Niche.'
              : 'Estrategia y formularios actualizados en tiempo real en Growth & Niche.'
          );
          setTimeout(() => setLastNotification(null), 4000);
        }
      }
    } catch (err) {
      console.error('Error in Daniel 1.0 Growth Co-Pilot:', err);
      if (wantsPdfDirectly) {
        await handleDownloadPdfDossier();
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Referencia siempre actualizada para el evento 'daniel:ask'
  handleSendInstructionRef.current = handleSendInstruction;

  const contextualPrompts =
    lang === 'en'
      ? [
          'Generate the 5-Slide Executive Keynote Presentation ($100M Offers)',
          'Give me the Keynote Presentation with my Presenter Script & Notes (For José)',
          'Prepare the 4 answers to tough investor objections (Hormozi $100M)',
        ]
      : [
          'Generar Presentación Ejecutiva estilo Keynote (5 Láminas · $100M Offers)',
          'Dame la Presentación Keynote con mi Guion Detallado de Expositor (Para José)',
          'Preparar las 4 respuestas de defensa ante objeciones del inversionista',
        ];

  return (
    <>
      <InvestorInfographicModal
        isOpen={isInfographicOpen}
        onClose={() => setIsInfographicOpen(false)}
        userId={userId}
        projectData={latestAssistantMsg?.projectData || null}
        workspace={latestWorkspace}
        messages={messages}
        initialTab={infographicInitialTab}
      />
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
        {/* Hidden File Input for Fish Audio MP3 Master */}
        <input
          ref={fishFileInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/*"
          onChange={handleFishAudioUpload}
          className="hidden"
        />

        {/* Expanded Unified Daniel 1.0 + Growth & Niche Strategy Window */}
        {isExpanded && (
          <div className="mb-3 w-[355px] sm:w-[465px] max-h-[86vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 text-left animate-in fade-in slide-in-from-bottom-3 duration-200 text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                  <WhaleLogo className="w-6 h-6 text-black dark:text-white" showText={false} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                      isSpeaking ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold leading-none text-zinc-900 dark:text-white">
                      Daniel 1.0 · Copiloto de José
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {hasCustomFishAudio ? 'TU MP3 ACTIVO' : 'PROACTIVO'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block mt-0.5 truncate max-w-[180px]">
                    {currentSectionLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setInfographicInitialTab('speaker_guide');
                    setIsInfographicOpen(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black transition-colors cursor-pointer shadow-xs"
                  title="Abrir Guía Detallada y Explicativa para José como Expositor (Paso a Paso + PDF 3 Págs)"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Guía Expositor</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInfographicInitialTab('overview');
                    setIsInfographicOpen(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                  title="Abrir Dashboard Infográfico Visual para el Inversionista"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Infografía</span>
                </button>
              <button
                type="button"
                onClick={() => {
                  const next = !autoSpeak;
                  setAutoSpeak(next);
                  danielVoice.setAutoSpeak(next);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  autoSpeak
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={
                  autoSpeak
                    ? 'Voz automática activada'
                    : 'Activar lectura en voz alta de respuestas'
                }
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setShowSuperAgentConsole(!showSuperAgentConsole)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  showSuperAgentConsole
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/25'
                }`}
                title="Abrir Arquitectura Super Agent de Daniel 1.0 (12 Departamentos: MetaGPT + CrewAI + OpenHands + LangGraph + Google ADK)"
              >
                <Cpu className="w-3 h-3" />
                <span>Super Agent (12)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMoralCode(!showMoralCode)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showMoralCode
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Código Moral 40/40 y Memoria Contextual de Daniel 1.0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showVoiceSettings
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Configurar voz Fish Audio de Daniel"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateMessages([])}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={lang === 'en' ? 'Reset conversation' : 'Reiniciar hilo'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenFullModal}
                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-1.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Console ↗' : 'Voz ↗'}
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fish Audio Master Voice Bar (Play Signature + Load MP3) */}
          <div className="mt-2.5 px-3 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/70 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePlaySignatureVoice}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>{lang === 'en' ? 'Stop Voice' : 'Detener Voz'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>
                      {hasCustomFishAudio
                        ? lang === 'en'
                          ? 'Play Your Fish Audio MP3'
                          : 'Oír tu MP3 Fish Audio'
                        : lang === 'en'
                        ? 'Test Daniel Voice'
                        : 'Probar Voz de Daniel'}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fishFileInputRef.current?.click()}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-semibold transition-colors cursor-pointer ${
                    hasCustomFishAudio
                      ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                  }`}
                  title="Selecciona tu archivo Soy s......area..mp3 para que quede guardado en el servidor y navegador"
                >
                  <Upload className="w-3 h-3 text-emerald-500" />
                  <span>
                    {hasCustomFishAudio
                      ? lang === 'en'
                        ? 'Change MP3'
                        : 'Cambiar MP3'
                      : lang === 'en'
                      ? 'Select Soy s...area.mp3'
                      : 'Subir Soy s...area.mp3'}
                  </span>
                </button>
                {hasCustomFishAudio && (
                  <button
                    type="button"
                    onClick={() => danielVoice.clearFishAudioMaster()}
                    className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Eliminar MP3 guardado"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="truncate">
                {hasCustomFishAudio
                  ? `MP3 Fish Audio activo: ${customAudioName}`
                  : 'Suba su archivo "Soy s......area..mp3" arriba para usar su grabación exacta'}
              </span>
              {activeVoiceSource && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 ml-1">
                  ● {activeVoiceSource === 'fish-master-mp3' ? 'TU MP3 ORIGINAL' : 'VOZ ACTIVA'}
                </span>
              )}
            </div>

            {/* Voice Settings & Explanation Drawer */}
            {showVoiceSettings && (
              <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/70 space-y-2 animate-in fade-in duration-150">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-zinc-700 dark:text-zinc-200 leading-relaxed">
                  <strong>¿Por qué sonaba diferente tu voz?</strong> Un archivo MP3 contiene únicamente la grabación fija de la frase{' '}
                  <em>"{DANIEL_FISH_AUDIO_TRANSCRIPT}"</em>. Al pulsar <strong>"Subir Soy s...area.mp3"</strong>, guardamos tu MP3 en el servidor:
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>
                      Si activas <strong>"Usar siempre mi MP3 original"</strong> abajo, Daniel reproducirá siempre tu grabación exacta de Fish Audio.
                    </li>
                    <li>
                      Para leer textos nuevos distintos sin coste de API de Fish Audio, se usa la voz masculina neural seleccionada abajo.
                    </li>
                  </ul>
                </div>

                {hasCustomFishAudio && (
                  <label className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 cursor-pointer">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Usar siempre mi grabación MP3 original de Fish Audio al hablar
                    </span>
                    <input
                      type="checkbox"
                      checked={alwaysMasterMp3}
                      onChange={(e) => {
                        setAlwaysMasterMp3(e.target.checked);
                        danielVoice.setAlwaysUseMasterMp3(e.target.checked);
                      }}
                      className="accent-emerald-600"
                    />
                  </label>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 block">
                    Timbre Masculino Neural (para lectura de textos dinámicos nuevos):
                  </span>
                  <select
                    value={voicePreset}
                    onChange={(e) => {
                      setVoicePreset(e.target.value);
                      danielVoice.setVoicePreset(e.target.value);
                      danielVoice.speak(DANIEL_FISH_AUDIO_TRANSCRIPT, 'es');
                    }}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DANIEL_MALE_VOICE_PRESETS.map((vp) => (
                      <option key={vp.id} value={vp.id}>
                        {vp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={fishRefId}
                    onChange={(e) => {
                      setFishRefId(e.target.value);
                      danielVoice.setReferenceId(e.target.value);
                    }}
                    placeholder="ID de modelo Fish Audio (opcional, ej: 7f92f8...)"
                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-[10px] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Super Agent 12-Department Startup Squad & Orchestrator Drawer */}
          {showSuperAgentConsole && (
            <div className="mt-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/95 border border-indigo-500/35 space-y-2.5 text-[10px] animate-in fade-in duration-150 shrink-0 max-h-[260px] overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>DANIEL 1.0 · SUPER AGENT (12 DEPARTAMENTOS STARTUP)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono block">
                    Google ADK + MetaGPT + CrewAI + OpenHands + LangGraph · Memoria Compartida
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDispatchSuperAgentMission()}
                  disabled={isDispatchingSuperAgent}
                  className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isDispatchingSuperAgent ? 'Orquestando...' : '⚡ Ejecutar Misión'}
                </button>
              </div>

              {/* Open Source Engines Integrated */}
              <div className="flex flex-wrap gap-1">
                {OPEN_SOURCE_AGENT_REPOS.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[9px] font-mono text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors"
                    title={`${repo.name}: ${repo.description}`}
                  >
                    {repo.name} · {repo.badge}
                  </a>
                ))}
              </div>

              {superAgentResult ? (
                <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-zinc-800 dark:text-zinc-100">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                      <span>{superAgentResult.missionTitle}</span>
                      <span className="text-[9px] font-mono">40/40 Auditado</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed">
                      {superAgentResult.moralAuditNotes}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {superAgentResult.departmentOutputs.map((out) => (
                      <div
                        key={out.departmentId}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80"
                      >
                        <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                          <span>{out.departmentName}</span>
                          <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400">
                            {out.framework}
                          </span>
                        </div>
                        <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Entregable: {out.deliverableTitle} ({out.kpiOrMetric})
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">{out.diagnosis}</p>
                        {out.requiresHumanApproval && (
                          <div className="mt-1 text-[9px] font-mono text-amber-600 dark:text-amber-400">
                            🔒 Candado Humano: {out.approvalReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {DANIEL_SUPER_AGENT_DEPARTMENTS.map((dept) => (
                    <div
                      key={dept.id}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-700/70"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[9px] text-indigo-600 dark:text-indigo-400">
                          {dept.code} · {dept.frameworkInspiration}
                        </span>
                        <span className="text-[8px] px-1 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          {dept.category === 'core' ? 'Core' : 'Especialista'}
                        </span>
                      </div>
                      <div className="font-bold text-zinc-900 dark:text-white truncate mt-0.5">
                        {dept.name}
                      </div>
                      <div className="text-[9px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                        {dept.roleSummary}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Moral Code 40/40 & Contextual Memory Drawer */}
          {showMoralCode && (
            <div className="mt-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/90 border border-emerald-500/30 space-y-2 text-[10px] animate-in fade-in duration-150 shrink-0 max-h-[210px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Constitución Moral Daniel 1.0 (Etapa 1 · 40/40)</span>
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  Creador: José
                </span>
              </div>
              <div className="space-y-1.5">
                {DANIEL_MORAL_PILLARS.map((pillar) => (
                  <div
                    key={pillar.id}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-700/70"
                  >
                    <div className="font-bold text-zinc-900 dark:text-white">
                      Pilar {pillar.number}: {pillar.title}
                    </div>
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {pillar.foundation}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {pillar.mandate}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  Memoria de Aprendizaje Operativo (Trazabilidad Activa):
                </div>
                {DEFAULT_LEARNED_LESSONS.map((lesson) => (
                  <div key={lesson.id} className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    • {lesson.pattern}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real-Time Sync Notification */}
          {lastNotification && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lastNotification}</span>
            </div>
          )}

          {/* Conversation & Strategy Iteration Feed */}
          <div className="my-3 flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[290px]">
            {messages.length === 0 ? (
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-emerald-500/25 dark:border-emerald-500/20 text-xs text-zinc-800 dark:text-zinc-100 leading-relaxed space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>DANIEL 1.0 · ASISTENTE PERSONAL DE JOSÉ</span>
                    <span>MEMORIA ACTIVA</span>
                  </div>
                  <p className="font-medium">
                    {buildDanielPersonalGreeting({
                      userName: 'José',
                      lastTopic: lastSessionTopic,
                      lastSectionLabel: currentSectionLabel,
                      lang: lang === 'en' ? 'en' : 'es',
                    })}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {lang === 'en'
                      ? 'Tell me what adjustment we should apply today in your strategy, niche, ICPs, or custom PDF presentation.'
                      : 'Indícame qué ajuste aplicamos hoy en tu estrategia, nicho, ICPs o si deseas generar una nueva presentación ejecutiva en PDF.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block px-1">
                    {lang === 'en'
                      ? 'Quick Actions & PDF Dossier:'
                      : 'Acciones rápidas y descarga de Dossier PDF:'}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {contextualPrompts.map((cp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendInstruction(cp)}
                        className="text-left px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200/80 dark:border-zinc-700/70 hover:border-emerald-500/50 text-[11px] text-zinc-700 dark:text-zinc-200 transition-all flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span>{cp}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-sky-50 dark:bg-zinc-800 border border-sky-200/70 dark:border-zinc-700 text-zinc-900 dark:text-white ml-4'
                      : 'bg-zinc-50 dark:bg-emerald-950/25 border border-zinc-200/90 dark:border-emerald-800/40 text-zinc-800 dark:text-zinc-100 mr-2'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span
                      className={
                        msg.role === 'user'
                          ? 'text-sky-600 dark:text-sky-400 font-bold'
                          : 'text-emerald-600 dark:text-emerald-400 font-bold'
                      }
                    >
                      {msg.role === 'user' ? 'TÚ (JOSÉ)' : 'DANIEL 1.0 · TU ASISTENTE'}
                    </span>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInfographicInitialTab('speaker_guide');
                            setIsInfographicOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-bold"
                          title="Abrir tu Guía Detallada de Expositor (Paso a Paso)"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Guía Expositor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInfographicInitialTab('overview');
                            setIsInfographicOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
                          title="Abrir Dashboard Infográfico Visual en pantalla completa"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Infografía</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const prevUserMsg =
                              idx > 0 && messages[idx - 1]?.role === 'user'
                                ? messages[idx - 1].content
                                : undefined;
                            handleDownloadPdfDossier(undefined, msg.projectData, prevUserMsg);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold"
                          title="Descargar presentación en PDF según tu instrucción"
                        >
                          <FileDown className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            danielVoice.speak(msg.content, lang === 'en' ? 'en' : 'es')
                          }
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          title="Escuchar con la voz de Daniel"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Oír</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="leading-relaxed text-[11px] sm:text-xs whitespace-pre-line">{msg.content}</p>

                  {msg.questions && msg.questions.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {lang === 'en' ? 'Next refinement questions:' : 'Para seguir afinando:'}
                      </div>
                      <ul className="text-[11px] space-y-1 list-disc pl-4 text-zinc-600 dark:text-zinc-300">
                        {msg.questions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((qr, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleSendInstruction(qr)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 text-[10px] font-medium text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer text-left"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {isThinking && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Daniel 1.0 is analyzing & building your visual strategy...'
                    : 'Daniel 1.0 está analizando tu instrucción de forma proactiva...'}
                </span>
              </div>
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Direct Jump / Apply Bar for any Growth & Niche Module + Infographic & PDF Dossier Download */}
          <div className="pt-2 pb-2.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-emerald-500" />
                <span>
                  {lang === 'en' ? 'Visual Dashboard & Modules:' : 'Impacto Visual & Módulos:'}
                </span>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setInfographicInitialTab('speaker_guide');
                    setIsInfographicOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Guía Expositor (José)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadPdfDossier(
                      latestWorkspace,
                      latestAssistantMsg?.projectData,
                      'Guía detallada para José como expositor',
                      'speaker-script'
                    )
                  }
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  <FileDown className="w-3 h-3" />
                  <span>PDF Expositor</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInfographicInitialTab('overview');
                    setIsInfographicOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Infografía</span>
                </button>
                {onOpenSpotify && (
                  <button
                    type="button"
                    onClick={onOpenSpotify}
                    className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 cursor-pointer"
                  >
                    <Music className="w-3 h-3" />
                    <span>Spotify</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onApplyStrategyChanges(
                    latestAssistantMsg?.projectData || {},
                    'growth-os',
                    'paso1-negocio'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-[10px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">1. Perfil Negocio</span>
                </span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onApplyStrategyChanges(
                    latestAssistantMsg?.projectData || {},
                    'growth-os',
                    'paso2-nicho'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-[10px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1 truncate">
                  <Target className="w-3 h-3 shrink-0" />
                  <span className="truncate">2. Nicho & ICPs</span>
                </span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onApplyStrategyChanges(
                    latestAssistantMsg?.projectData || {},
                    'growth-os',
                    'paso3-prospectos'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-[10px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1 truncate">
                  <Users className="w-3 h-3 shrink-0" />
                  <span className="truncate">3. CRM Prospectos</span>
                </span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onApplyStrategyChanges(
                    latestAssistantMsg?.projectData || {},
                    'growth-os',
                    'paso4-campana'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-[10px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1 truncate">
                  <LayoutTemplate className="w-3 h-3 shrink-0" />
                  <span className="truncate">4. Campañas & Web</span>
                </span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* Upgraded Conversational Multi-Line Input with Voice Dictation & Instant Enter Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendInstruction();
            }}
            className="flex items-end gap-1.5 shrink-0 pt-1"
          >
            <textarea
              rows={2}
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendInstruction();
                }
              }}
              placeholder={
                lang === 'en'
                  ? 'Talk naturally to Daniel 1.0: ask for the visual Infographic Dashboard, adjust metrics, or dictate by voice...'
                  : 'Háblale a Daniel con naturalidad: pide el Dashboard Infográfico, ajusta métricas o dicta con el micrófono...'
              }
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isListeningVoice
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={lang === 'en' ? 'Dictate by voice' : 'Dictar indicación por voz'}
              >
                {isListeningVoice ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <button
                type="submit"
                disabled={!quickQuery.trim() || isThinking}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                title={lang === 'en' ? 'Send to Daniel 1.0 (Enter)' : 'Enviar a Daniel 1.0 (Enter)'}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Bottom-Right Circular Logo Trigger Button for Daniel 1.0 (Visible across all sections) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group relative w-14 h-14 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xl border border-zinc-200/90 dark:border-zinc-700/90 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
          isSpeaking ? 'ring-4 ring-emerald-500/40 animate-pulse' : ''
        }`}
        title={
          lang === 'en'
            ? 'Daniel 1.0 · Personal Assistant & Visual Infographic Strategy Co-Pilot'
            : 'Daniel 1.0 · Asistente Personal de José (Dashboard Infográfico + Voz Fish Audio)'
        }
        aria-label="Daniel 1.0"
      >
        <WhaleLogo className="w-8 h-8 text-black dark:text-white" showText={false} />

        {/* Active / Speaking Status Dot */}
        <span
          className={`absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
            isSpeaking
              ? 'bg-rose-500 animate-ping'
              : 'bg-emerald-500 animate-pulse'
          }`}
        />
      </button>
    </div>
    </>
  );
}
