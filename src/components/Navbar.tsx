import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Globe, Sparkles } from 'lucide-react';
import { WhaleLogo } from './WhaleLogo';
import { translations } from '../i18n/translations';
import { Language, PageId } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenBooking: () => void;
}

export function Navbar({ lang, setLang, activePage, onNavigate, onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang].nav;

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: lang === 'en' ? 'Home' : 'Inicio' },
    { id: 'services', label: t.services },
    { id: 'process', label: t.process },
    { id: 'results', label: t.results },
    { id: 'about', label: t.about },
    { id: 'faq', label: t.faq },
    { id: 'contact', label: lang === 'en' ? 'Contact' : 'Contacto' },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/10 py-3 transition-all duration-200 shadow-2xl shadow-black/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center group focus:outline-none cursor-pointer" 
          aria-label="4haus.us Home"
        >
          <WhaleLogo className="h-7 w-7 text-white" showText={true} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md shadow-white/20'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Language Switcher + Call CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* EN / ES Language Toggle */}
          <div className="flex items-center bg-zinc-900/80 border border-white/15 rounded-full p-1 text-xs backdrop-blur-md">
            <button
              id="lang-btn-en"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 font-medium ${
                lang === 'en'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-es"
              onClick={() => setLang('es')}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 font-medium ${
                lang === 'es'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ES
            </button>
          </div>

          {/* Schedule Call Pill Button */}
          <button
            id="nav-schedule-btn"
            onClick={() => handleNavClick('contact')}
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-full text-xs transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.cta}</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0c0c0e]/95 backdrop-blur-2xl px-6 py-6 animate-in slide-in-from-top-4 duration-200 text-left">
          <div className="flex flex-col gap-2 mb-6">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-full p-1 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full ${lang === 'en' ? 'bg-white text-black font-semibold' : 'text-zinc-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1 rounded-full ${lang === 'es' ? 'bg-white text-black font-semibold' : 'text-zinc-400'}`}
              >
                ES
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('contact');
              }}
              className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2 rounded-full text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.cta}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
