import React, { useState } from 'react';
import { X, Check, Rocket, Zap, Shield, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectPlan?: (planId: string) => void;
}

export function PlansModal({ isOpen, onClose, lang, onSelectPlan }: PlansModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: lang === 'en' ? 'Current' : 'Actual',
      price: '$0',
      period: lang === 'en' ? '/forever' : '/siempre',
      description: lang === 'en' 
        ? 'Basic access to AI prompts, web tools & standard workflows.' 
        : 'Acceso básico a prompts de IA, utilidades web y flujos estándar.',
      features: [
        lang === 'en' ? '1,000 monthly credits' : '1,000 créditos mensuales',
        lang === 'en' ? 'Access to Knowledge Library' : 'Acceso a Knowledge Library',
        lang === 'en' ? 'Standard Daniel AI assistant' : 'Asistente Daniel AI estándar',
        lang === 'en' ? 'Single team member' : '1 miembro de equipo',
        lang === 'en' ? 'Community Discord support' : 'Soporte comunitario en Discord',
      ],
      cta: lang === 'en' ? 'Current Plan' : 'Plan Actual',
      popular: false,
      disabled: true,
    },
    {
      id: 'plus',
      name: '4haus Plus',
      badge: lang === 'en' ? 'Popular' : 'Popular',
      price: billingCycle === 'annual' ? '$29' : '$39',
      period: lang === 'en' ? '/month' : '/mes',
      description: lang === 'en'
        ? 'For creators and builders scaling automations and voice synthesis.'
        : 'Para creadores y builders escalando automatizaciones y síntesis de voz.',
      features: [
        lang === 'en' ? '15,000 monthly credits' : '15,000 créditos mensuales',
        lang === 'en' ? 'Custom Voice Synthesis Engine' : 'Motor de Voz Personalizada ultra-realista',
        lang === 'en' ? 'Full Websites Library clones & templates' : 'Biblioteca completa de Websites con plantillas',
        lang === 'en' ? 'Multi-agent orchestration' : 'Orquestación multi-agente',
        lang === 'en' ? 'Up to 5 team members' : 'Hasta 5 miembros de equipo',
        lang === 'en' ? 'Priority execution queue' : 'Cola de ejecución prioritaria',
      ],
      cta: lang === 'en' ? 'Upgrade to Plus' : 'Mejorar a Plus',
      popular: true,
      disabled: false,
    },
    {
      id: 'pro',
      name: '4haus Enterprise Pro',
      badge: lang === 'en' ? 'Ultra Power' : 'Poder Total',
      price: billingCycle === 'annual' ? '$89' : '$119',
      period: lang === 'en' ? '/month' : '/mes',
      description: lang === 'en'
        ? 'Unconstrained power, dedicated infrastructure & autonomous workflows.'
        : 'Poder sin restricciones, infraestructura dedicada y flujos autónomos.',
      features: [
        lang === 'en' ? '80,000 monthly credits + auto-refill' : '80,000 créditos mensuales + auto-recarga',
        lang === 'en' ? 'Dedicated fine-tuned autonomous agents' : 'Agentes autónomos dedicados y fine-tuned',
        lang === 'en' ? 'Enterprise CRM & Spotify Webhooks sync' : 'Sincronización empresarial CRM y Webhooks',
        lang === 'en' ? 'Unlimited team members & custom roles' : 'Miembros de equipo ilimitados y roles',
        lang === 'en' ? '1-on-1 Architectural support with José' : 'Soporte 1 a 1 de arquitectura con José',
        lang === 'en' ? 'Custom domain & white-label portals' : 'Dominio personalizado y portales marca blanca',
      ],
      cta: lang === 'en' ? 'Get Pro Access' : 'Obtener Acceso Pro',
      popular: false,
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0e0f12] border border-white/20 p-6 sm:p-10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'en' ? 'Choose Your 4haus Plan' : 'Elige tu Plan 4haus'}</span>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PLUS / PRO
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                {lang === 'en' 
                  ? 'Supercharge your automations, AI voice engines, and team wallet credits.' 
                  : 'Potencia tus automatizaciones, motores de voz con IA y saldo de créditos de equipo.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing cycle toggle */}
        <div className="py-6 flex items-center justify-center shrink-0">
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-full p-1 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'Monthly Billing' : 'Facturación Mensual'}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{lang === 'en' ? 'Annual Billing' : 'Facturación Anual'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                -25% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="overflow-y-auto pr-1 pb-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                p.popular
                  ? 'bg-gradient-to-b from-indigo-950/50 via-zinc-900/90 to-black border-2 border-indigo-500/60 shadow-xl shadow-indigo-500/10'
                  : 'bg-zinc-900/60 border border-white/10 hover:border-white/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                  {lang === 'en' ? 'Most Popular' : 'Más Elegido'}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-white">{p.name}</h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                    {p.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">{p.period}</span>
                </div>

                <p className="text-xs text-zinc-400 mb-6 leading-relaxed min-h-[36px]">
                  {p.description}
                </p>

                <div className="border-t border-white/10 pt-4 mb-6 space-y-2.5">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!p.disabled && onSelectPlan) {
                    onSelectPlan(p.id);
                  }
                }}
                disabled={p.disabled}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  p.popular
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:brightness-110 shadow-lg shadow-indigo-500/30'
                    : p.disabled
                    ? 'bg-white/10 text-zinc-400 cursor-default'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <span>{p.cta}</span>
                {!p.disabled && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Guarantee */}
        <div className="pt-4 mt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'en' ? '30-day money-back guarantee. No questions asked.' : 'Garantía de reembolso de 30 días sin preguntas.'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{lang === 'en' ? 'Instant activation' : 'Activación instantánea'}</span>
            <span>•</span>
            <span>{lang === 'en' ? 'Cancel anytime' : 'Cancela cuando quieras'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
