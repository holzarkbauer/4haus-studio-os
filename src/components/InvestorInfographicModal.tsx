import React, { useEffect, useState } from 'react';
import {
  X,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Mic,
  BookOpen,
  Presentation,
  CheckCircle2,
  ArrowUpRight,
  MessageSquareQuote,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  DocumentPresentationMode,
  ProjectPreloadPayload,
  StudioWorkspaceState,
} from '../types/leadNichoTypes';
import {
  buildKeynoteSlidesSpec,
  generateAndDownloadStrategyDossierPdf,
} from '../utils/dossierPdfGenerator';
import { GuidedMessage } from './GuidedPromptHero';

export type InfographicModalTab =
  | 'speaker_guide'
  | 'overview'
  | 'hormozi'
  | 'economics'
  | 'roadmap';

interface InvestorInfographicModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  projectData?: ProjectPreloadPayload | null;
  workspace?: StudioWorkspaceState | null;
  messages?: GuidedMessage[];
  customPrompt?: string;
  initialTab?: InfographicModalTab;
}

export function InvestorInfographicModal({
  isOpen,
  onClose,
  userId,
  projectData,
  workspace,
  messages = [],
  customPrompt,
  initialTab = 'overview',
}: InvestorInfographicModalProps) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState<boolean>(
    initialTab === 'speaker_guide'
  );
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShowPresenterNotes(initialTab === 'speaker_guide');
      if (initialTab === 'hormozi') {
        setCurrentSlideIdx(3);
      } else if (initialTab === 'economics' || initialTab === 'roadmap') {
        setCurrentSlideIdx(4);
      } else {
        setCurrentSlideIdx(0);
      }
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlideIdx((prev) => Math.min(prev + 1, 4));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bp = workspace?.businessProfile;
  const niche = workspace?.nicheProfiles?.[0];

  const businessName =
    projectData?.businessName || bp?.businessName || '4haus Real Estate & Growth';
  const industry =
    projectData?.industry || bp?.industry || 'Inmobiliaria Prime & Activos High-Ticket';
  const targetLocation =
    projectData?.targetLocation || bp?.targetLocation || 'Madrid, Marbella, CDMX & Miami';
  const averageTicket =
    projectData?.averageTicket || bp?.averageTicket || '450.000 € – 2.500.000 €';
  const targetAudience =
    projectData?.targetAudience ||
    niche?.priorityAudience ||
    bp?.targetAudience ||
    'Propietarios Patrimoniales, Family Offices & Decisores';
  const goal90Days =
    projectData?.goal90Days ||
    bp?.goal90Days ||
    '12 Exclusivas Cualificadas & 36 Reuniones con Inversores en 90 Días';

  const slides = buildKeynoteSlidesSpec(
    businessName,
    industry,
    targetLocation,
    averageTicket,
    targetAudience,
    goal90Days
  );

  const activeSlide = slides[currentSlideIdx] || slides[0];

  const handleDownloadPdfByMode = async (mode: DocumentPresentationMode) => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await generateAndDownloadStrategyDossierPdf({
        userId,
        workspace,
        projectData,
        messages,
        forcedMode: mode,
        customPrompt:
          mode === 'speaker-script'
            ? 'Presentación detallada y explicativa dirigida a José como expositor de la presentación ($100M Offers)'
            : customPrompt ||
              'Presentación Ejecutiva Keynote de 5 láminas fundamentada en Hormozi $100M Offers',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-7xl rounded-2xl bg-[#0B0F17] border border-slate-800 text-white shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Deck Studio Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0F1623] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400 tracking-wide">
                  PRESENTACIÓN EJECUTIVA KEYNOTE (5 LÁMINAS 16:9)
                </span>
                <span>·</span>
                <span>{businessName}</span>
                <span>·</span>
                <span className="hidden sm:inline">{targetLocation}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Lámina 0{activeSlide.slideIndex} de 0{activeSlide.totalSlides}:{' '}
                {activeSlide.headline}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Presenter Mode for José */}
            <button
              type="button"
              onClick={() => setShowPresenterNotes((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showPresenterNotes
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-slate-800/90 text-amber-300 border-amber-400/30 hover:bg-slate-800'
              }`}
              title="Activa o desactiva tu Teleprompter y Guion de Expositor debajo de cada lámina"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>
                {showPresenterNotes
                  ? 'Guion del Expositor: ACTIVO (Vista José)'
                  : 'Ver Guion del Expositor (Para José)'}
              </span>
            </button>

            {/* Download 5-Slide Deck with Presenter Notes */}
            <button
              type="button"
              onClick={() => handleDownloadPdfByMode('speaker-script')}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title="Descarga las 5 láminas 16:9 incluyendo tu guion literal y defensa de objeciones en cada página"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>PDF con Guion (5 Láminas)</span>
            </button>

            {/* Download Clean 5-Slide Keynote Deck for Investor */}
            <button
              type="button"
              onClick={() => handleDownloadPdfByMode('infographic-dashboard')}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              title="Descarga el Deck Editorial limpio de 5 láminas en formato horizontal 16:9 para enviar o proyectar al inversionista"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Descargar Presentación (PDF 5 Láminas)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Selector Strip */}
        <div className="flex items-center justify-between gap-2 px-5 py-2.5 bg-[#0B0F17] border-b border-slate-800/80 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => {
              const active = idx === currentSlideIdx;
              const shortTitles = [
                '01. Tesis & Visión',
                '02. Diagnóstico vs. 4haus',
                '03. Ecosistema 3 Capas',
                '04. Oferta $100M (Hormozi)',
                '05. Proyección 90D & Garantía',
              ];
              return (
                <button
                  key={s.slideIndex}
                  type="button"
                  onClick={() => setCurrentSlideIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {shortTitles[idx] || `Lámina 0${s.slideIndex}`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentSlideIdx((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlideIdx === 0}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
              title="Lámina anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-2 tabular-nums">
              0{activeSlide.slideIndex} / 0{activeSlide.totalSlides}
            </span>
            <button
              type="button"
              onClick={() => setCurrentSlideIdx((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlideIdx === slides.length - 1}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
              title="Siguiente lámina"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Scrollable Stage: High-Contrast Editorial Keynote Canvas */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-[#0B0F17]">
          {/* THE 16:9 EDITORIAL SLIDE CANVAS (Alabaster & Deep Obsidian Architectural Style) */}
          <div className="w-full max-w-6xl mx-auto rounded-2xl bg-[#F8FAFC] text-slate-900 shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between min-h-[520px]">
            {/* Top Emerald/Slate Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-900" />

            {/* Slide Inner Padding */}
            <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col justify-between space-y-6">
              {/* Slide Editorial Header */}
              <div className="space-y-3 border-b border-slate-200 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tracking-wider uppercase">
                  <span className="text-emerald-700 font-bold">
                    {activeSlide.categoryKicker}
                  </span>
                  <span className="text-slate-400 tabular-nums">
                    {businessName} · LÁMINA 0{activeSlide.slideIndex} / 0{activeSlide.totalSlides}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 leading-tight">
                  {activeSlide.headline}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 max-w-4xl leading-relaxed">
                  {activeSlide.subheadline}
                </p>
              </div>

              {/* =============================================================== */}
              {/* SLIDE 1 BODY: HERO VISION (SPLIT DARK METRIC + 3 CLEAN PILLARS) */}
              {/* =============================================================== */}
              {activeSlide.layoutType === 'hero-vision' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
                  {/* Left 5 Cols: Deep Obsidian Hero Metric Card */}
                  <div className="lg:col-span-5 rounded-2xl bg-slate-950 text-white p-7 flex flex-col justify-between border border-slate-800 shadow-lg">
                    <div className="space-y-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                        INDICADOR NORTE DE INVERSIÓN
                      </span>
                      <div className="text-5xl sm:text-6xl font-black tracking-tight text-white tabular-nums pt-1">
                        {activeSlide.heroStat?.value || '12.4x'}
                      </div>
                      <div className="text-base font-bold text-amber-300">
                        {activeSlide.heroStat?.label}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 pt-2 leading-relaxed border-t border-slate-800">
                        {activeSlide.heroStat?.subtext}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Mercados Activos</span>
                        <span className="font-bold text-white">{targetLocation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Payback Estimado</span>
                        <span className="font-bold text-emerald-400">&lt; 35 Días</span>
                      </div>
                    </div>
                  </div>

                  {/* Right 7 Cols: 3 Clean Architectural Pillar Cards */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-3.5">
                    {activeSlide.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                            {block.tag}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {block.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {block.description}
                          </p>
                        </div>
                        {block.metric && (
                          <div className="shrink-0 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-right">
                            <span className="text-xs sm:text-sm font-mono font-black text-slate-900 tabular-nums whitespace-nowrap">
                              {block.metric}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 2 BODY: SPLIT DIAGNOSIS (TRADITIONAL VS. 4HAUS)           */}
              {/* =============================================================== */}
              {activeSlide.layoutType === 'split-diagnosis' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch my-auto">
                  {activeSlide.blocks.map((block, idx) => {
                    const isWinner = idx === 1;
                    return (
                      <div
                        key={idx}
                        className={`p-6 sm:p-7 rounded-2xl flex flex-col justify-between border ${
                          isWinner
                            ? 'bg-slate-950 text-white border-emerald-500/40 shadow-xl'
                            : 'bg-white text-slate-900 border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-2 border-b pb-3 border-current/10">
                            <span
                              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                                isWinner ? 'text-emerald-400' : 'text-rose-600'
                              }`}
                            >
                              {block.tag}
                            </span>
                            <span
                              className={`text-sm sm:text-base font-mono font-black tabular-nums ${
                                isWinner ? 'text-amber-300' : 'text-rose-600'
                              }`}
                            >
                              {block.metric}
                            </span>
                          </div>

                          <div>
                            <h3
                              className={`text-lg sm:text-xl font-bold ${
                                isWinner ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {block.title}
                            </h3>
                            <p
                              className={`text-xs sm:text-sm mt-1 ${
                                isWinner ? 'text-slate-300' : 'text-slate-600'
                              }`}
                            >
                              {block.description}
                            </p>
                          </div>

                          <ul className="space-y-2.5 pt-2">
                            {(block.bullets || []).map((b, bIdx) => (
                              <li
                                key={bIdx}
                                className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
                              >
                                <span
                                  className={`font-mono font-bold text-xs mt-0.5 ${
                                    isWinner ? 'text-emerald-400' : 'text-rose-500'
                                  }`}
                                >
                                  0{bIdx + 1}.
                                </span>
                                <span className={isWinner ? 'text-slate-200' : 'text-slate-700'}>
                                  {b}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 3 & 5 BODY: 3-COLUMN ARCHITECTURAL PILLARS / 90D ROADMAP  */}
              {/* =============================================================== */}
              {(activeSlide.layoutType === 'architecture-pillars' ||
                activeSlide.layoutType === 'financial-roi-roadmap') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch my-auto">
                  {activeSlide.blocks.map((block, idx) => {
                    const isFeatured = idx === 2;
                    return (
                      <div
                        key={idx}
                        className={`p-6 rounded-2xl flex flex-col justify-between border ${
                          isFeatured
                            ? 'bg-slate-950 text-white border-emerald-500/40 shadow-xl'
                            : 'bg-white text-slate-900 border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                                isFeatured ? 'text-emerald-400' : 'text-emerald-700'
                              }`}
                            >
                              {block.tag}
                            </span>
                          </div>

                          {block.metric && (
                            <div
                              className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
                                isFeatured ? 'text-amber-300' : 'text-slate-950'
                              }`}
                            >
                              {block.metric}
                            </div>
                          )}

                          <h3
                            className={`text-base sm:text-lg font-bold leading-snug ${
                              isFeatured ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {block.title}
                          </h3>

                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isFeatured ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {block.description}
                          </p>

                          <div
                            className={`pt-3 border-t space-y-2 ${
                              isFeatured ? 'border-slate-800' : 'border-slate-200'
                            }`}
                          >
                            {(block.bullets || []).map((item, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-xs leading-relaxed"
                              >
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                    isFeatured ? 'text-emerald-400' : 'text-emerald-600'
                                  }`}
                                />
                                <span className={isFeatured ? 'text-slate-200' : 'text-slate-700'}>
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 4 BODY: HORMOZI $100M VALUE MATRIX & STACK                */}
              {/* =============================================================== */}
              {activeSlide.layoutType === 'hormozi-value-matrix' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
                  {/* Left 5 Cols: The 4 Value Equation Levers */}
                  <div className="lg:col-span-5 rounded-2xl bg-slate-950 text-white p-6 flex flex-col justify-between border border-slate-800">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                          ECUACIÓN DE VALOR ($100M OFFERS)
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                          4 Palancas que Eliminan la Fricción de Compra
                        </h3>
                      </div>

                      <div className="space-y-3.5 pt-1">
                        {[
                          {
                            label: '1. Resultado Soñado',
                            tag: '98% MAXIMIZADO ↑↑',
                            w: 'w-[98%]',
                            color: 'bg-emerald-400',
                          },
                          {
                            label: '2. Certeza Percibida de Logro',
                            tag: '94% VERIFICABLE ↑↑',
                            w: 'w-[94%]',
                            color: 'bg-teal-400',
                          },
                          {
                            label: '3. Tiempo de Espera (45s IA)',
                            tag: '-85% ESPERA ↓↓',
                            w: 'w-[15%]',
                            color: 'bg-sky-400',
                          },
                          {
                            label: '4. Esfuerzo Operativo del Socio',
                            tag: '0% LLAVE EN MANO ↓↓',
                            w: 'w-[8%]',
                            color: 'bg-amber-400',
                          },
                        ].map((d, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-200">{d.label}</span>
                              <span className="font-mono text-emerald-400 font-bold">{d.tag}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className={`h-full ${d.w} ${d.color} rounded-full`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Valor Percibido Total Apilado:</span>
                      <span className="font-mono text-base font-black text-amber-300">
                        19.500 €
                      </span>
                    </div>
                  </div>

                  {/* Right 7 Cols: 2x2 Grid of Core Stack Assets */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeSlide.blocks.map((block, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase">
                              {block.tag}
                            </span>
                            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                              {block.metric}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {block.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {block.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Slide Executive Takeaway Strip */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono font-bold text-[11px] uppercase">
                    Síntesis
                  </span>
                  <span>{activeSlide.keyTakeawayBanner}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-slate-500 font-mono text-[11px]">
                  <span>Usa las flechas ← → para cambiar de lámina</span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* JOSÉ'S PRESENTER TELEPROMPTER & OBJECTION DEFENSE DOCK (OPTIONAL)   */}
          {/* =================================================================== */}
          {showPresenterNotes && (
            <div className="w-full max-w-6xl mx-auto rounded-2xl bg-[#111827] border border-amber-400/40 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                    TELEPROMPTER PRIVADO PARA JOSÉ · {activeSlide.speakerNotes.slideNumber}
                  </span>
                </div>
                <span className="text-xs text-emerald-300 font-mono">
                  Qué señalar: {activeSlide.speakerNotes.visualCueForInvestor}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 7 Cols: Verbatim Script for José */}
                <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-emerald-400 font-bold">
                    <MessageSquareQuote className="w-4 h-4" />
                    <span>QUÉ DECIR LITERALMENTE AL EXPONER ESTA LÁMINA:</span>
                  </div>
                  <p className="text-sm sm:text-base text-white leading-relaxed italic font-medium">
                    {activeSlide.speakerNotes.whatJoseSaysVerbatim}
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-amber-300 font-mono">
                    <strong>Frase puente sugerida:</strong>{' '}
                    {activeSlide.speakerNotes.transitionPhrase}
                  </div>
                </div>

                {/* Right 5 Cols: Psychology & Objection Handling */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="text-[11px] font-mono uppercase text-sky-400 font-bold">
                      POR QUÉ FUNCIONA PSICOLÓGICAMENTE:
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSlide.speakerNotes.whyItWorksPsychology}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-amber-300 font-bold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>SI EL INVERSIONISTA PREGUNTA EN ESTA LÁMINA:</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      "{activeSlide.speakerNotes.investorQuestionAndAnswer.question}"
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      <strong className="text-emerald-400">Tu respuesta:</strong>{' '}
                      {activeSlide.speakerNotes.investorQuestionAndAnswer.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
