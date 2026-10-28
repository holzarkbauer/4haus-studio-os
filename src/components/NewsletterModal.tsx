import React, { useState } from 'react';
import { Mail, Check, Sparkles, Send, Bell, ArrowRight, Shield } from 'lucide-react';
import { Language } from '../types';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function NewsletterModal({ isOpen, onClose, lang }: NewsletterModalProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-2xl text-zinc-900">
        
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">4haus Insider Dispatch</h3>
              <p className="text-xs text-zinc-500">Curated automations, agent prompts & blueprints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            {lang === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>

        {subscribed ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900">
              {lang === 'en' ? "You're on the insider list!" : "¡Estás en la lista exclusiva!"}
            </h4>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              {lang === 'en' 
                ? `A confirmation email has been sent to ${email}. You'll receive our weekly teardown every Tuesday.` 
                : `Te enviamos un correo de confirmación a ${email}. Recibirás nuestros reportes semanales cada martes.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              {lang === 'en'
                ? 'Join 4,200+ founders and engineers receiving weekly production case studies on autonomous AI agents, voice synthesis pipelines, and conversion architecture.'
                : 'Únete a más de 4,200 fundadores e ingenieros que reciben casos de estudio semanales sobre agentes autónomos, pipelines de voz con IA y arquitectura de conversión.'}
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">
                {lang === 'en' ? 'Work Email' : 'Correo Electrónico de Trabajo'}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jose@company.com"
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{lang === 'en' ? 'Subscribe' : 'Suscribirse'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono pt-2">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'en' ? 'Zero spam. Unsubscribe anytime with 1-click.' : 'Cero spam. Cancela en 1 clic cuando desees.'}</span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
