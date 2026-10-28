import { useState } from 'react';
import { X, ExternalLink, RefreshCw, Shield, Maximize2 } from 'lucide-react';
import { Language } from '../types';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  lang: Language;
}

export function LivePreviewModal({ isOpen, onClose, url, title, lang }: LivePreviewModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl bg-[#111114] border border-white/15 shadow-2xl overflow-hidden">
        
        {/* Browser Mockup Window Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-white/10 shrink-0">
          
          {/* Window dots */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:opacity-80" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-semibold text-white ml-3 truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          </div>

          {/* URL address pill */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-1 text-xs text-zinc-400 max-w-sm truncate">
            <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="font-mono text-[11px] truncate">{url}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              title={lang === 'en' ? "Open in new browser tab" : "Abrir en nueva pestaña"}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-xs px-2.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{lang === 'en' ? "New Tab" : "Pestaña"}</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Live Iframe Container */}
        <div className="relative flex-1 w-full h-full bg-zinc-950">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
              <span className="text-xs font-mono">
                {lang === 'en' ? "Connecting to live production deployment..." : "Conectando con despliegue en producción..."}
              </span>
            </div>
          )}

          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

      </div>
    </div>
  );
}
