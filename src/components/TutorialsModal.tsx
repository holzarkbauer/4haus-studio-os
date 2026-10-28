import React, { useState } from 'react';
import { Play, BookOpen, Clock, Sparkles, X, CheckCircle, ArrowRight, Video } from 'lucide-react';
import { Language } from '../types';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function TutorialsModal({ isOpen, onClose, lang }: TutorialsModalProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<number | null>(null);

  if (!isOpen) return null;

  // 4 suggested topics for this month as requested
  const tutorials = [
    {
      id: 1,
      title: lang === 'en' 
        ? '1. Autonomous AI Agent Swarms with Daniel 1.0' 
        : '1. Enjambres de Agentes Autónomos con Daniel 1.0',
      duration: '14 min',
      level: lang === 'en' ? 'Intermediate' : 'Intermedio',
      tag: 'AI Agents',
      description: lang === 'en'
        ? 'How to configure Daniel to listen to webhook triggers, parse inbound client leads, and orchestrate automated calendar bookings.'
        : 'Cómo configurar a Daniel para escuchar webhooks, clasificar leads de clientes y coordinar citas de forma 100% desatendida.',
      steps: [
        'Connecting the trigger endpoint with Spotify & CRM webhooks',
        'Fine-tuning the system prompt with context injection',
        'Setting deterministic guardrails and escalation alerts',
      ],
    },
    {
      id: 2,
      title: lang === 'en'
        ? '2. Custom Voice Cloning & Real-Time Audio Synthesis'
        : '2. Clonación de Voz y Síntesis de Audio en Tiempo Real',
      duration: '18 min',
      level: lang === 'en' ? 'Advanced' : 'Avanzado',
      tag: 'Voice Engine',
      description: lang === 'en'
        ? 'Train high-fidelity voice profiles with 60 seconds of reference audio, then generate bilingual conversational audio in milliseconds.'
        : 'Entrena perfiles de voz de alta fidelidad con 60 segundos de audio y genera respuestas conversacionales bilingües en milisegundos.',
      steps: [
        'Audio normalization, pitch analysis and noise reduction',
        'Generating phonetic embeddings for English and Spanish',
        'Streaming chunk playback through Web Audio API',
      ],
    },
    {
      id: 3,
      title: lang === 'en'
        ? '3. High-Converting Landing Page Architecture & Live Clones'
        : '3. Arquitectura de Landing Pages de Alta Conversión y Clones',
      duration: '22 min',
      level: lang === 'en' ? 'Beginner / Pro' : 'Principiante / Pro',
      tag: 'Websites Library',
      description: lang === 'en'
        ? 'Design breakdown of Apple-grade product framing, interactive calculators, and live embedded preview modals.'
        : 'Desglose de diseño estilo Apple, calculadoras interactivas de ROI y ventanas de previsualización en vivo sin fricción.',
      steps: [
        'Visual hierarchy with crisp contrast on neutral canvases',
        'Reducing cognitive friction using minimal icon tooltips',
        'Responsive viewport calculations without layout shifts',
      ],
    },
    {
      id: 4,
      title: lang === 'en'
        ? '4. Team Wallet, Credit Metering & Enterprise Infrastructure'
        : '4. Billetera de Equipo, Medición de Créditos e Infraestructura',
      duration: '11 min',
      level: lang === 'en' ? 'Administration' : 'Administración',
      tag: 'Platform & Billing',
      description: lang === 'en'
        ? 'Managing credit quotas across multiple team members, configuring automated balance top-ups, and securing live API keys.'
        : 'Gestión de cuotas de crédito entre miembros del equipo, recargas automáticas de saldo y protección de claves de API en producción.',
      steps: [
        'Setting monthly threshold alerts and auto-refill triggers',
        'Restricting role permissions for team members vs developers',
        'Exporting CSV audit logs for financial accounting',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-zinc-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">
                {lang === 'en' ? 'Featured Tutorials of the Month' : 'Tutoriales Destacados de este Mes'}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {lang === 'en' ? '4 Recommended Masterclasses for October 2026' : '4 Masterclasses Recomendadas para Octubre 2026'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tutorial List */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {tutorials.map((tut, idx) => {
            const isSelected = selectedTutorial === tut.id;
            return (
              <div
                key={tut.id}
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-md'
                    : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-zinc-900 text-white">
                      {tut.tag}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tut.duration}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">• {tut.level}</span>
                  </div>

                  <button
                    onClick={() => setSelectedTutorial(isSelected ? null : tut.id)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isSelected ? (lang === 'en' ? 'Hide Curriculum' : 'Ocultar Temario') : (lang === 'en' ? 'Watch Guide' : 'Ver Guía')}</span>
                  </button>
                </div>

                <h4 className="text-base font-bold text-zinc-900 mb-1">{tut.title}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">{tut.description}</p>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-indigo-200/60 animate-in fade-in space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-semibold block">
                      {lang === 'en' ? 'Curriculum Modules:' : 'Módulos del Taller:'}
                    </span>
                    <div className="space-y-1.5">
                      {tut.steps.map((st, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-xs text-zinc-700">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
