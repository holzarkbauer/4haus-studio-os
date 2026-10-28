import { useState, type FormEvent } from 'react';
import { X, Calendar, MessageSquare, Check, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function BookingModal({ isOpen, onClose, lang }: BookingModalProps) {
  const t = translations[lang].bookingModal;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [bottleneck, setBottleneck] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
    setTimeout(() => {
      // Keep state clear after closing
    }, 4000);
  };

  const whatsappMessage = lang === 'en'
    ? encodeURIComponent("Hi José, I'd like to book a 20-minute diagnostic session with 4haus.us to automate our lead capture and operations.")
    : encodeURIComponent("Hola José, me gustaría agendar una llamada de diagnóstico de 20 minutos con 4haus.us para automatizar nuestros leads y operaciones.");

  // WhatsApp Business link with pre-filled text
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111114] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {t.title}
              </h3>
              <p className="text-xs text-zinc-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-white">
              {lang === 'en' ? "Diagnostic Requested" : "Solicitud Recibida"}
            </h4>
            <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
              {t.successMsg}
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="bg-white text-black font-semibold text-xs py-3 px-6 rounded-full hover:bg-zinc-200 transition-colors"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t.nameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    {t.emailLabel} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    {t.companyLabel}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Prime Real Estate"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t.bottleneckLabel}
                </label>
                <textarea
                  rows={2}
                  value={bottleneck}
                  onChange={(e) => setBottleneck(e.target.value)}
                  placeholder={lang === 'en' ? "e.g. Weekend leads take 4 hours to respond, or manual follow-ups on WhatsApp" : "ej. Los leads de fin de semana tardan 4 horas en responderse, o seguimiento manual"}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-zinc-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold text-sm py-3.5 px-6 rounded-xl transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-98"
                >
                  <span>{t.submitBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Direct WhatsApp Alternative Option */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-zinc-400 mb-3 text-center">
                {t.whatsappOption}
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.openWhatsApp} ([[WhatsApp Business]])</span>
              </a>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                20-min Audit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                Zero Spam Guaranteed
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
