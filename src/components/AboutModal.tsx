import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Share2, 
  Briefcase, 
  User, 
  Mail, 
  ExternalLink, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Send, 
  Check, 
  Linkedin, 
  Youtube, 
  Instagram, 
  Twitter,
  Building2,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles
} from 'lucide-react';
import { WhaleLogo } from './WhaleLogo';
import { InstagramIcon, FacebookIcon, LinkedInIcon, XIcon } from './SocialIcons';
import { Language } from '../types';

export type AboutSubModalType = 'social' | 'cases' | 'founder' | 'contact' | null;

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AboutSubModalType;
  lang: Language;
  onOpenBooking: () => void;
  onOpenLivePreview?: (url: string, title: string) => void;
}

export function AboutModal({
  isOpen,
  onClose,
  initialTab = null,
  lang,
  onOpenBooking,
  onOpenLivePreview,
}: AboutModalProps) {
  // Current active submodal inside ABOUT
  const [activeSubModal, setActiveSubModal] = useState<AboutSubModalType>(initialTab);
  
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveSubModal(initialTab);
      setContactSent(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isEs = lang === 'es';

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactEmail && contactName) {
      setContactSent(true);
      setTimeout(() => {
        setContactSent(false);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setActiveSubModal(null);
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="about-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          id="about-modal-container"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-md">
                <WhaleLogo className="w-5 h-5" showText={false} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">ABOUT 4HAUS</h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    STUDIO OS
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isEs ? 'Explora la visión, fundador, proyectos y canales oficiales' : 'Explore our vision, founder, client results and official channels'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN MENU BUTTONS (The 4 navigation sub-modals requested by user) */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* 4 Interactive Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Button 1: Redes Sociales */}
              <button
                onClick={() => setActiveSubModal('social')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  activeSubModal === 'social'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/80 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {isEs ? 'Redes Sociales' : 'Social Media'}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Instagram, YouTube, X, Discord
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Button 2: Case Studies */}
              <button
                onClick={() => setActiveSubModal('cases')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  activeSubModal === 'cases'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/80 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Case Studies
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {isEs ? 'Clientes, métricas y automatizaciones' : 'Client proof & system results'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Button 3: About the Founder */}
              <button
                onClick={() => setActiveSubModal('founder')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  activeSubModal === 'founder'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/80 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      About the Founder
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      José Trujillo • Systems Architect
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Button 4: Contact Us */}
              <button
                onClick={() => setActiveSubModal('contact')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  activeSubModal === 'contact'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/80 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Contact Us
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {isEs ? 'Escríbenos o agenda diagnóstico' : 'Direct contact & consultation'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
              </button>

            </div>

            {/* DYNAMIC POPUP / SUBWINDOW CONTENT DISPLAY */}
            <div className="pt-2">
              
              {/* SUB-MODAL 1: REDES SOCIALES */}
              {activeSubModal === 'social' && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-pink-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {isEs ? 'Canales Oficiales y Redes Sociales' : 'Official Channels & Social Profiles'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSubModal(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {isEs ? 'Cerrar vista' : 'Close view'}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isEs 
                      ? 'Sigue nuestras publicaciones sobre inteligencia artificial, automatización de sistemas, arquitectura de software y novedades exclusivas.'
                      : 'Follow our updates on autonomous AI architectures, engineering breakdowns, and system releases.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <a
                      href="https://www.instagram.com/josetrujillo.ia/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-pink-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/80 text-pink-600 flex items-center justify-center">
                          <InstagramIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-pink-600 transition-colors">
                            Instagram
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">@josetrujillo.ia</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-pink-600 transition-colors" />
                    </a>

                    <a
                      href="https://discord.com/channels/1550307428313342052/1550307428313342054"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            Discord Community
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">4haus.studio</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                    </a>

                    <a
                      href="https://www.youtube.com/@savedtheday"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-red-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/80 text-red-600 flex items-center justify-center">
                          <Youtube className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-red-600 transition-colors">
                            YouTube Channel
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">@savedtheday</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-600 transition-colors" />
                    </a>

                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                          <LinkedInIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            LinkedIn
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">José Trujillo</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </div>
                </div>
              )}

              {/* SUB-MODAL 2: CASE STUDIES */}
              {activeSubModal === 'cases' && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {isEs ? 'Casos de Éxito y Despliegues' : 'Client Case Studies & Metrics'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSubModal(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {isEs ? 'Cerrar vista' : 'Close view'}
                    </button>
                  </div>

                  {/* Case 1: AMOOO Luxury Fashion */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">
                        AMOOO • Luxury High-Volume E-Commerce
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                        +340% Conversión
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      "Automatizamos el 100% de la calificación de clientes potenciales por WhatsApp y voz sintética. Pasamos de perder ventas nocturnas a cerrar clientes en menos de 90 segundos."
                    </p>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-1">
                      <span>• Latencia: &lt;1.2s</span>
                      <span>• Cero fugas operativas</span>
                      <span>• 24/7 activo</span>
                    </div>
                  </div>

                  {/* Case 2: Legal & Architecture Firm */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">
                        Soluciones Legales & B2B Consulting
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold">
                        28 hrs/semana ahorradas
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Despliegue de un agente virtual con RAG documental que audita contratos preliminares y agenda sesiones con sincronización bidireccional de calendario.
                    </p>
                  </div>
                </div>
              )}

              {/* SUB-MODAL 3: ABOUT THE FOUNDER */}
              {activeSubModal === 'founder' && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {isEs ? 'Sobre el Fundador' : 'About the Founder'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSubModal(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {isEs ? 'Cerrar vista' : 'Close view'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shrink-0 shadow-md">
                      <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center text-white font-bold text-lg font-mono">
                        JT
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">José Trujillo</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Founder & Systems Architect at 4haus.us</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Especialista en IA aplicada, síntesis de voz, MCP y automatización empresarial.</div>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed">
                    <p>
                      {isEs
                        ? 'José Trujillo concibió 4haus como un estudio boutique de ingeniería de sistemas autónomos. Su filosofía combina diseño visual de alta precisión con pipelines de código robustos que eliminan la fricción manual en ventas y operaciones.'
                        : 'José Trujillo founded 4haus as a high-precision autonomous systems studio, combining sleek aesthetic craftsmanship with bulletproof AI pipelines that automate sales and lead capture without human bottlenecks.'}
                    </p>
                    <p>
                      {isEs
                        ? 'Cada despliegue se diseña a medida: desde modelos neuronales de voz en tiempo real hasta asistentes virtuales entrenados con el ADN operativo de tu empresa.'
                        : 'Every deployment is custom engineered: from low-latency neural voice clones to specialized autonomous agents embedded directly into production web apps.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-[11px] font-mono text-zinc-400">Lima, Perú • Operaciones Globales</span>
                    <button
                      onClick={onOpenBooking}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      {isEs ? 'Agendar con José' : 'Book with José'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-MODAL 4: CONTACT US */}
              {activeSubModal === 'contact' && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {isEs ? 'Contáctanos Directamente' : 'Contact Us Directly'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSubModal(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {isEs ? 'Cerrar vista' : 'Close view'}
                    </button>
                  </div>

                  {contactSent ? (
                    <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                        {isEs ? '¡Mensaje Enviado con Éxito!' : 'Message Sent Successfully!'}
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-300">
                        {isEs ? 'José Trujillo te responderá en menos de 4 horas hábiles.' : 'José Trujillo will respond within 4 business hours.'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            {isEs ? 'Nombre completo' : 'Full name'}
                          </label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={isEs ? 'Ej. Mateo Vargas' : 'e.g. Alex Morgan'}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                            {isEs ? 'Correo de trabajo' : 'Work email'}
                          </label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="correo@empresa.com"
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          {isEs ? 'Mensaje o requerimiento de automatización' : 'Message or requirement'}
                        </label>
                        <textarea
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder={isEs ? 'Cuéntanos sobre tu negocio o cuello de botella...' : 'Tell us about your company bottlenecks...'}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href="mailto:4hausmaestro@gmail.com"
                          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-mono"
                        >
                          4hausmaestro@gmail.com
                        </a>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onOpenBooking}
                            className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            {isEs ? 'Agendar Diagnóstico' : 'Book Diagnostic'}
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-black dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isEs ? 'Enviar Mensaje' : 'Send Message'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>4haus.us — Autonomous Intelligence Studio</span>
            <span className="font-mono">v2.4.0</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
