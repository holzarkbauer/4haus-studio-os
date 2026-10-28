import { useState, type FormEvent } from 'react';
import { WhaleLogo } from './WhaleLogo';
import { Youtube, MessageSquare, Mail, ArrowRight, Check } from 'lucide-react';
import { InstagramIcon, FacebookIcon, LinkedInIcon, XIcon } from './SocialIcons';
import { translations } from '../i18n/translations';
import { Language, PageId } from '../types';

interface FooterProps {
  lang: Language;
  onNavigate?: (page: PageId) => void;
  onOpenBooking: () => void;
}

export function Footer({ lang, onNavigate, onOpenBooking }: FooterProps) {
  const t = translations[lang].footer;
  const [footerEmail, setFooterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (footerEmail) {
      setSubscribed(true);
    }
  };

  const whatsappMessage = lang === 'en'
    ? encodeURIComponent("Hi José, reaching out from 4haus.us website.")
    : encodeURIComponent("Hola José, te escribo desde el sitio web 4haus.us.");

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <footer className="bg-black/60 backdrop-blur-2xl border-t border-white/10 pt-16 pb-12 text-left text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-white/[0.08]">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <button 
              onClick={() => onNavigate?.('home')}
              className="focus:outline-none cursor-pointer"
            >
              <WhaleLogo className="h-7 w-7 text-white" />
            </button>
            <p className="text-sm text-zinc-300 font-light leading-relaxed max-w-sm">
              {t.tagline}
            </p>
            <p className="text-xs text-zinc-400 font-mono">
              José Trujillo • Founder & Architect
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href="https://www.instagram.com/josetrujillo.ia/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-pink-400 transition-colors"
                aria-label="Instagram Profile"
                title="Instagram @josetrujillo.ia"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61582005755057"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-blue-400 transition-colors"
                aria-label="Facebook Profile"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Jose_eaglelife"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="X Profile"
                title="X @Jose_eaglelife"
              >
                <XIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/jos%C3%A9-trujillo-74a414334/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-sky-400 transition-colors"
                aria-label="LinkedIn Profile"
                title="LinkedIn José Trujillo"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@savedtheday"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="YouTube Channel"
                title="YouTube"
              >
                <Youtube className="w-4 h-4 text-red-500" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="WhatsApp Direct"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="mailto:4hausmaestro@gmail.com"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Email Contact"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              {t.navTitle}
            </div>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate?.('services')} className="hover:text-white transition-colors cursor-pointer text-left">Services</button></li>
              <li><button onClick={() => onNavigate?.('home')} className="hover:text-white transition-colors cursor-pointer text-left">Resource Hub</button></li>
              <li><button onClick={() => onNavigate?.('process')} className="hover:text-white transition-colors cursor-pointer text-left">How We Work</button></li>
              <li><button onClick={() => onNavigate?.('results')} className="hover:text-white transition-colors cursor-pointer text-left">Case Studies</button></li>
              <li><button onClick={() => onNavigate?.('about')} className="hover:text-white transition-colors cursor-pointer text-left">About José</button></li>
              <li><button onClick={() => onNavigate?.('faq')} className="hover:text-white transition-colors cursor-pointer text-left">FAQ</button></li>
              <li><button onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors cursor-pointer text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              {t.resourcesTitle}
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="https://amooo-tienda.ai.studio" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>AMOOO Store Demo</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Live</span>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@savedtheday" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  YouTube (@savedtheday)
                </a>
              </li>
              <li><a href="#resources" className="hover:text-white transition-colors">Daniel AI Second Brain</a></li>
              <li><a href="#resources" className="hover:text-white transition-colors">MusicBox Vintage Audio</a></li>
              <li><a href="#resources" className="hover:text-white transition-colors">Founder Incubator</a></li>
            </ul>
          </div>

          {/* Direct Contact & Newsletter Capture Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
              {t.contactTitle}
            </div>
            <p className="text-xs text-zinc-300">
              Direct inbox:{' '}
              <a href="mailto:4hausmaestro@gmail.com" className="text-white hover:underline">
                4hausmaestro@gmail.com
              </a>
            </p>

            <div className="pt-2">
              <span className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                {lang === 'en' ? "Join 4haus Automation Brief" : "Boletín de Automatización 4haus"}
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs py-2">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'en' ? "Subscribed!" : "¡Registrado!"}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-1.5">
                  <input
                    type="email"
                    required
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold text-center transition-colors block"
              >
                {lang === 'en' ? "Schedule Diagnostic Call" : "Agendar Llamada de Diagnóstico"}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Meta */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <div>
            © {new Date().getFullYear()} 4haus.us — {t.allRights}
          </div>
          <div className="text-center sm:text-right text-[11px] text-zinc-400">
            {t.disclaimer}
          </div>
        </div>

      </div>
    </footer>
  );
}
