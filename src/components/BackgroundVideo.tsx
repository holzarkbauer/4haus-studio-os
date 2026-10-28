import { useEffect, useState, useRef } from 'react';
import { Film, Play, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { BackgroundTheme, Language } from '../types';

interface BackgroundVideoProps {
  theme: BackgroundTheme;
  lang: Language;
  onOpenThemeModal?: () => void;
}

export function BackgroundVideo({ theme, lang, onOpenThemeModal }: BackgroundVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Normalize theme
  const activeTheme = theme === 'beach' ? 'beach-waves' : theme;

  // Video theme sources
  const videoSources: Record<string, { src: string; poster: string; title: string }> = {
    'beach-waves': {
      src: '/videos/waves.webm',
      poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2600&auto=format&fit=crop',
      title: lang === 'en' ? 'Apple Beach Waves' : 'Olas Cenitales de Playa',
    },
    'night-stars': {
      src: '/videos/stars.webm',
      poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2600&auto=format&fit=crop',
      title: lang === 'en' ? 'Starry Night Timelapse' : 'Timelapse Estelar Nocturno',
    },
    'beach-resort': {
      src: '/videos/resort.webm',
      poster: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2600&auto=format&fit=crop',
      title: lang === 'en' ? 'Aerial Coast & Umbrellas' : 'Bahía Resort & Costa',
    },
  };

  const isVideoTheme = activeTheme in videoSources;
  const currentVideoConfig = videoSources[activeTheme];

  // Ensure video plays continuously on mount / theme change
  useEffect(() => {
    if (videoRef.current && isVideoTheme) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [activeTheme, isVideoTheme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black" aria-hidden="true">
      
      {/* 1. VIDEO BACKGROUND REPLACING BLACK BACKGROUND - Continuous Normal Playback */}
      {isVideoTheme && currentVideoConfig ? (
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            src={currentVideoConfig.src}
            poster={currentVideoConfig.poster}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center scale-105"
            style={{
              filter: 'brightness(0.72) contrast(1.12) saturate(1.1)',
            }}
          />

          {/* Gentle cinematic glass overlay: allows clear video visibility while keeping text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        </div>
      ) : (
        /* Static image theme fallbacks */
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('${
                activeTheme === 'alpine'
                  ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2600&auto=format&fit=crop'
                  : activeTheme === 'aurora'
                  ? 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2600&auto=format&fit=crop'
                  : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2600&auto=format&fit=crop'
              }')`,
              filter: 'brightness(0.65) contrast(1.1)',
            }}
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Floating Interactive Badge (Bottom Right) with theme changer */}
      {onOpenThemeModal && (
        <div 
          onClick={onOpenThemeModal}
          className="fixed bottom-5 right-5 z-40 pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-[11px] font-mono text-zinc-200 shadow-2xl transition-all cursor-pointer group hover:scale-105 active:scale-95"
          title={lang === 'en' ? 'Click to change background theme' : 'Clic para cambiar tema de fondo'}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">
            {isVideoTheme && currentVideoConfig ? currentVideoConfig.title : activeTheme.toUpperCase()}
          </span>
          <span className="text-[10px] text-cyan-300 group-hover:underline pl-1 border-l border-white/15">
            {lang === 'en' ? 'Themes' : 'Temas'}
          </span>
        </div>
      )}

    </div>
  );
}
