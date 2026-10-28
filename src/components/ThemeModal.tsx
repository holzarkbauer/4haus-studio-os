import { X, Check, Sparkles, Film, Image as ImageIcon, Waves } from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { Language, BackgroundTheme } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentTheme: BackgroundTheme;
  onSelectTheme: (theme: BackgroundTheme) => void;
}

export function ThemeModal({
  isOpen,
  onClose,
  lang,
  currentTheme,
  onSelectTheme,
}: ThemeModalProps) {
  if (!isOpen) return null;

  // Normalized active theme check
  const activeId = currentTheme === 'beach' ? 'beach-waves' : currentTheme;

  const themes: {
    id: BackgroundTheme;
    name: string;
    description: string;
    badge: string;
    isVideo: boolean;
    previewUrl: string;
    videoSrc?: string;
  }[] = [
    {
      id: 'beach-waves',
      name: lang === 'en' ? 'Apple Beach Waves (Video 1)' : 'Olas Cenitales de Playa (Video 1)',
      description: lang === 'en' 
        ? 'Turquoise coastal surf crashing onto sand. Moves smoothly in 3D parallax as you scroll.'
        : 'Aguas turquesas rompiendo sobre arena blanca. Se desplaza en paralaje fluido con el scroll.',
      badge: lang === 'en' ? 'VIDEO SCROLL • ACTIVE' : 'VIDEO SCROLL • ACTIVO',
      isVideo: true,
      previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      videoSrc: '/videos/waves.webm',
    },
    {
      id: 'night-stars',
      name: lang === 'en' ? 'Starry Night Timelapse (Video 2)' : 'Cielo Nocturno y Estrellas (Video 2)',
      description: lang === 'en'
        ? 'Hypnotic night sky with rotating constellations and silhouettes of forest trees.'
        : 'Cielo nocturno hipnótico con constelaciones rotando y siluetas de copas de árboles.',
      badge: lang === 'en' ? 'VIDEO SCROLL' : 'VIDEO SCROLL',
      isVideo: true,
      previewUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
      videoSrc: '/videos/stars.webm',
    },
    {
      id: 'beach-resort',
      name: lang === 'en' ? 'Resort Coast & Umbrellas (Video 3)' : 'Costa Resort y Sombrillas (Video 3)',
      description: lang === 'en'
        ? 'Aerial coastline with turquoise swell, beach loungers, and white umbrella cabanas.'
        : 'Costa aérea con oleaje turquesa, sombrillas blancas de resort y rompiente de mar.',
      badge: lang === 'en' ? 'VIDEO SCROLL' : 'VIDEO SCROLL',
      isVideo: true,
      previewUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
      videoSrc: '/videos/resort.webm',
    },
    {
      id: 'alpine',
      name: lang === 'en' ? 'Alpine Horizon Ridge' : 'Crestas Alpinas y Niebla',
      description: lang === 'en'
        ? 'Atmospheric mountain summit with mountain morning mist and layered depth.'
        : 'Cumbres montañosas cinematográficas con niebla matutina alpina y profundidad.',
      badge: lang === 'en' ? 'PHOTO SCROLL' : 'FOTO SCROLL',
      isVideo: false,
      previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'obsidian',
      name: lang === 'en' ? 'Obsidian Studio (Apple Dark)' : 'Estudio Obsidiana (Apple Dark)',
      description: lang === 'en'
        ? 'Pure charcoal obsidian canvas with subtle ambient studio glow and maximum contrast.'
        : 'Lienzo puro carbón y obsidiana con resplandor suave de estudio y máximo contraste.',
      badge: lang === 'en' ? 'HIGH CONTRAST' : 'ALTO CONTRASTE',
      isVideo: false,
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'aurora',
      name: lang === 'en' ? 'Midnight Cyber Aurora' : 'Aurora Boreal de Medianoche',
      description: lang === 'en'
        ? 'Subtle deep emerald and indigo atmospheric light ribbons across dark skies.'
        : 'Ondulaciones atmosféricas en verde esmeralda e índigo profundo sobre cielo nocturno.',
      badge: lang === 'en' ? 'ATMOSPHERIC' : 'ATMO',
      isVideo: false,
      previewUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#111114] border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-left max-h-[90vh] flex flex-col">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <IOSAppIcon type="background" size="sm" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{lang === 'en' ? 'Wallpapers & Dynamic Backgrounds' : 'Fondos y Videos Dinámicos'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {lang === 'en' 
                  ? '3D Parallax: Video and horizon move smoothly as you scroll' 
                  : 'Paralaje 3D: El video y el horizonte se desplazan fluidamente al hacer scroll'}
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

        {/* Scrollable Theme Options Grid */}
        <div className="overflow-y-auto pr-1 py-1 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          {themes.map((theme) => {
            const isSelected = activeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`group relative rounded-2xl overflow-hidden border p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[170px] ${
                  isSelected
                    ? 'border-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)] ring-2 ring-white/50'
                    : 'border-white/10 bg-zinc-900/60 hover:border-white/25 hover:bg-zinc-900'
                }`}
              >
                {/* Background image or video preview */}
                {theme.isVideo && theme.videoSrc ? (
                  <video
                    src={theme.videoSrc}
                    poster={theme.previewUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-60 transition-opacity pointer-events-none"
                  />
                ) : (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-35 group-hover:opacity-50 transition-opacity pointer-events-none"
                    style={{ backgroundImage: `url('${theme.previewUrl}')` }}
                  />
                )}
                
                {/* Vignette scrim for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/35 pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {theme.isVideo ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        <Film className="w-3 h-3 text-cyan-400" />
                        <span>{theme.badge}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-black/60 border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {theme.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Bottom Title & Description */}
                <div className="relative z-10 pt-6">
                  <div className="text-sm font-bold text-white tracking-tight group-hover:text-white transition-colors flex items-center gap-1.5">
                    <span>{theme.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-light mt-1 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Footer Notice & Done Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs shrink-0">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {lang === 'en' ? 'Live scroll parallax enabled' : 'Paralaje de scroll en vivo activado'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors shadow-sm text-xs"
          >
            {lang === 'en' ? 'Apply & Close' : 'Aplicar y Cerrar'}
          </button>
        </div>

      </div>
    </div>
  );
}
