import { useEffect, useState } from 'react';
import { WhaleLogo } from './WhaleLogo';

export type IOSIconType = 
  | 'mailchimp'
  | 'youtube'
  | 'books'
  | 'hotmart'
  | 'kickstarter'
  | 'music'
  | 'spotify'
  | 'daniel'
  | 'background'
  | 'calculator'
  | 'clock'
  | 'haustore'
  | 'notes'
  | 'reminders'
  | 'compass'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'x';

interface IOSAppIconProps {
  type: IOSIconType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IOSAppIcon({ type, size = 'md', className = '' }: IOSAppIconProps) {
  // Live clock state for real-time ticking clock icon
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (type !== 'clock') return;
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [type]);

  // Size dimensions
  const radiusClass = type === 'daniel' ? 'rounded-full' : {
    sm: 'rounded-[13px]',
    md: 'rounded-[18px] sm:rounded-[20px]',
    lg: 'rounded-[22px]',
  }[size];

  const dimensionClasses = {
    sm: `w-12 h-12 ${radiusClass}`,
    md: `w-16 h-16 sm:w-18 sm:h-18 ${radiusClass}`,
    lg: `w-20 h-20 ${radiusClass}`,
  }[size];

  // Render the specific iOS icon artwork
  const renderIconContent = () => {
    switch (type) {
      case 'mailchimp':
        // Official Mailchimp Freddie Monkey (from attached image)
        return (
          <div className="w-full h-full bg-[#FFE01B] p-2 flex items-center justify-center relative overflow-hidden text-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20 pointer-events-none" />
            <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-sm">
              <g fill="#000000">
                <path d="M43 14 C56 14 62 20 62 25 C58 25 50 25 43 27 C36 29 33 34 32 40 C31 30 35 14 43 14 Z" />
                <path d="M32 38 C32 26 40 16 52 14 C58 13 62 16 63 21 C64 26 58 29 48 29 C40 29 35 33 32 38 Z" />
                <circle cx="50" cy="52" r="28" />
                <circle cx="38" cy="49" r="8" />
                <ellipse cx="58" cy="55" rx="16" ry="14" />
              </g>
              <g fill="#FFE01B">
                <path d="M33 38 Q45 27 58 24 Q63 23 63 28 Q52 30 40 37 Z" />
                <circle cx="38" cy="49" r="4.5" fill="#000000" />
                <path d="M38 46 C40 46 41 48 40 51 C39 53 37 53 36 51" stroke="#FFE01B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                <path d="M48 42 C51 34 58 31 61 36 C64 40 60 48 60 48 C64 47 67 49 68 53 C69 57 65 60 62 60 C64 62 66 65 64 68 C61 72 52 71 50 67 C48 62 48 52 48 42 Z" />
                <path d="M50 40 C51 38 53 38 55 40" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <ellipse cx="59" cy="37" rx="1.6" ry="2.2" fill="#000000" />
                <ellipse cx="57" cy="42" rx="1.1" ry="1.4" fill="#000000" />
                <ellipse cx="61" cy="43" rx="1.1" ry="1.4" fill="#000000" />
                <path d="M51 49 C54 48 64 47 66 52 C65 57 56 61 51 55 Z" fill="#000000" />
                <path d="M53 50 C56 49 62 49 64 52 C60 53 56 53 53 50 Z" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
        );

      case 'youtube':
        // YouTube: iOS glossy red with play triangle
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#FF1A1A] via-[#E60000] to-[#B30000] p-2.5 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
            <div className="w-11 h-8 rounded-xl bg-white flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#E60000] ml-0.5">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            </div>
          </div>
        );

      case 'books':
        // Apple Books: Orange coral gradient with open white book (as in iPhone images 1 & 3)
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#FF9500] via-[#FA6400] to-[#E65100] p-3 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/30 pointer-events-none" />
            <svg viewBox="0 0 48 48" className="w-10 h-10 fill-white drop-shadow-sm">
              <path d="M24 16 C20 12 12 11 6 12 L6 36 C12 35 20 36 24 40 C28 36 36 35 42 36 L42 12 C36 11 28 12 24 16 Z" fill="white" />
              <path d="M24 16 L24 40" stroke="#FA6400" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'hotmart':
        // Hotmart: Fire / Flame gradient with energetic flame emblem
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#FF4E26] via-[#F02800] to-[#C41A00] p-3 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25 pointer-events-none" />
            <svg viewBox="0 0 48 48" className="w-10 h-10 fill-white drop-shadow-md">
              <path d="M24 4 C24 4 29 11 29 17 C29 18 29 19 28.8 20 C31 18.5 32 15 32 15 C32 15 38 21 38 29 C38 37 31.7 43 24 43 C16.3 43 10 37 10 29 C10 21 17 14 18 10 C18 10 17 14 19 17 C21 20 23 20 23 16 C23 12 24 4 24 4 Z" />
              <path d="M24 27 C24 27 27 30 27 33 C27 35.5 25.5 37 24 37 C22.5 37 21 35.5 21 33 C21 30 24 27 24 27 Z" fill="#FFC107" />
            </svg>
          </div>
        );

      case 'kickstarter':
        // Kickstarter: Signature bold green gradient with rounded 'K' mark
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#05CE78] via-[#02B86B] to-[#018F52] p-3 flex items-center justify-center relative overflow-hidden text-white`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/30 pointer-events-none" />
            <div className="font-extrabold text-3xl tracking-tighter select-none font-sans drop-shadow-md">
              K
            </div>
          </div>
        );

      case 'music':
        // Apple Music: vibrant magenta-red gradient with double musical note (iOS Music icon)
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#FA2D55] via-[#FB4C6E] to-[#E0143E] p-3 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/30 pointer-events-none" />
            <svg viewBox="0 0 48 48" className="w-10 h-10 fill-white drop-shadow-md">
              <path d="M19 32.5 C19 35 16.8 37 14 37 C11.2 37 9 35 9 32.5 C9 30 11.2 28 14 28 C15.5 28 16.8 28.6 17.7 29.5 L18 13 L35 9 L35 28.5 C35 31 32.8 33 30 33 C27.2 33 25 31 25 28.5 C25 26 27.2 24 30 24 C31.5 24 32.8 24.6 33.7 25.5 L34 13 L19 16.5 L19 32.5 Z" />
            </svg>
          </div>
        );

      case 'spotify':
        // Spotify: authentic green background with 3 soundwaves
        return (
          <div className="w-full h-full bg-[#121212] p-2 flex items-center justify-center relative overflow-hidden text-[#1DB954]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
            <div className="w-11 h-11 rounded-full bg-[#1DB954] flex items-center justify-center text-black shadow-lg">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-black">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.348-1.435-5.304-1.76-8.785-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.077-.5 9.714 1.114.294.18.386.563.207.856zm1.225-2.723c-.226.368-.71.482-1.077.256-2.687-1.652-6.785-2.131-9.965-1.165-.413.125-.85-.107-.975-.521-.125-.413.107-.85.52-975 3.628-1.101 8.147-.57 11.24 1.328.368.226.483.71.257 1.077zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.494.15-1.018-.129-1.168-.623-.15-.495.13-1.019.624-1.169 3.532-1.072 9.404-.866 13.115 1.337.445.264.59.843.327 1.288-.264.444-.843.59-1.278.327z" />
              </svg>
            </div>
          </div>
        );

      case 'daniel':
        // Daniel 1.0: Circle with the 4haus Studio Logo
        return (
          <div className="w-full h-full bg-white dark:bg-zinc-900 p-2 flex items-center justify-center relative overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 shadow-inner">
            <div className="w-full h-full rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-2">
              <WhaleLogo className="w-full h-full text-black dark:text-white" showText={false} />
            </div>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
          </div>
        );

      case 'background':
        // Background Themes: iOS Wallpaper / Settings aesthetic (chromatic spectrum layers)
        return (
          <div className={`w-full h-full bg-gradient-to-tr from-[#3023AE] via-[#C86DD7] to-[#FAD961] p-3 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/35 pointer-events-none" />
            <svg viewBox="0 0 48 48" className="w-10 h-10 fill-white drop-shadow-md">
              {/* Overlapping chromatic mountain / wallpaper layers */}
              <circle cx="24" cy="24" r="17" fill="none" stroke="white" strokeWidth="2.5" />
              <path d="M12 32 C16 22 24 24 28 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="31" cy="18" r="3.5" fill="white" />
              <path d="M8 36 C18 27 28 29 40 36" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
        );

      case 'calculator':
        // iOS Calculator: dark charcoal face with orange math circle and grid buttons
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#2C2C2E] via-[#1C1C1E] to-[#0C0C0D] p-2.5 flex flex-col justify-between relative overflow-hidden border border-white/10`}>
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="w-3 h-3 rounded-full bg-[#A5A5A5] text-[7px] font-bold text-black flex items-center justify-center">C</div>
              <div className="w-3 h-3 rounded-full bg-[#A5A5A5] text-[7px] font-bold text-black flex items-center justify-center">±</div>
              <div className="w-3 h-3 rounded-full bg-[#A5A5A5] text-[7px] font-bold text-black flex items-center justify-center">%</div>
              <div className="w-3 h-3 rounded-full bg-[#FF9F0A] text-[7px] font-bold text-white flex items-center justify-center">÷</div>
            </div>
            {/* Middle row */}
            <div className="flex items-center justify-between">
              <div className="w-3 h-3 rounded-full bg-[#333333] text-[7px] font-bold text-white flex items-center justify-center">7</div>
              <div className="w-3 h-3 rounded-full bg-[#333333] text-[7px] font-bold text-white flex items-center justify-center">8</div>
              <div className="w-3 h-3 rounded-full bg-[#333333] text-[7px] font-bold text-white flex items-center justify-center">9</div>
              <div className="w-3 h-3 rounded-full bg-[#FF9F0A] text-[7px] font-bold text-white flex items-center justify-center">×</div>
            </div>
            {/* Bottom row */}
            <div className="flex items-center justify-between">
              <div className="w-7 h-3 rounded-full bg-[#333333] text-[7px] font-bold text-white flex items-center pl-2">0</div>
              <div className="w-3 h-3 rounded-full bg-[#333333] text-[7px] font-bold text-white flex items-center justify-center">.</div>
              <div className="w-3 h-3 rounded-full bg-[#FF9F0A] text-[7px] font-bold text-white flex items-center justify-center">=</div>
            </div>
          </div>
        );

      case 'clock': {
        // iOS Live Analog Clock: Real-time ticking hands matching current system time
        const seconds = time.getSeconds();
        const minutes = time.getMinutes();
        const hours = time.getHours() % 12;

        const secondDeg = seconds * 6;
        const minuteDeg = minutes * 6 + seconds * 0.1;
        const hourDeg = hours * 30 + minutes * 0.5;

        return (
          <div className={`w-full h-full bg-white p-1 flex items-center justify-center relative overflow-hidden shadow-inner text-black`}>
            {/* Dial background with hour markers */}
            <div className="relative w-full h-full rounded-full flex items-center justify-center">
              {/* Hour numbers or ticks */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-1 bg-zinc-400"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-19px)`,
                  }}
                />
              ))}

              {/* Hour hand */}
              <div
                className="absolute w-1 h-3.5 bg-black rounded-full origin-bottom"
                style={{
                  transform: `translateY(-50%) rotate(${hourDeg}deg)`,
                  bottom: '50%',
                }}
              />

              {/* Minute hand */}
              <div
                className="absolute w-0.5 h-5 bg-black rounded-full origin-bottom"
                style={{
                  transform: `translateY(-50%) rotate(${minuteDeg}deg)`,
                  bottom: '50%',
                }}
              />

              {/* Red/Orange Second hand */}
              <div
                className="absolute w-[1px] h-6 bg-[#FF3B30] origin-bottom transition-transform duration-100 ease-linear"
                style={{
                  transform: `translateY(-40%) rotate(${secondDeg}deg)`,
                  bottom: '50%',
                }}
              />

              {/* Center pivot pin */}
              <div className="absolute w-1.5 h-1.5 rounded-full bg-[#FF3B30] z-10" />
            </div>
          </div>
        );
      }

      case 'haustore':
        // 4haustore (App Store / Store): Brilliant iOS blue gradient with drafting tool 'A' + 4haus whale badge
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#1B82F6] via-[#1070EE] to-[#0A60DC] p-2 flex items-center justify-center relative overflow-hidden text-white`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/30 pointer-events-none" />
            <svg viewBox="0 0 48 48" className="w-10 h-10 fill-white drop-shadow-md">
              {/* iOS App Store Ruler/Pencil 'A' with subtle whale silhouette */}
              <path d="M22.5 7.5 C23.3 6 24.7 6 25.5 7.5 L40.5 35.5 C41.2 36.8 40.5 38.5 39 38.5 L34.5 38.5 C33.3 38.5 32.2 37.8 31.7 36.7 L28 29 L16 29 C14.5 29 13.5 27.5 14.2 26.2 L20.5 14 Z" />
              <path d="M12 38.5 L9 38.5 C7.5 38.5 6.8 36.8 7.5 35.5 L17.5 17" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M13 29 L35 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'notes':
        return (
          <div className={`w-full h-full bg-white flex flex-col justify-start relative overflow-hidden text-black`}>
            <div className="h-4 bg-[#FFCC00] w-full" />
            <div className="p-2 space-y-1">
              <div className="h-1 bg-zinc-200 rounded w-3/4" />
              <div className="h-1 bg-zinc-200 rounded w-full" />
              <div className="h-1 bg-zinc-200 rounded w-1/2" />
            </div>
          </div>
        );

      case 'reminders':
        return (
          <div className={`w-full h-full bg-white p-2.5 flex flex-col justify-around relative overflow-hidden text-black`}>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500" />
              <div className="h-1.5 bg-zinc-200 rounded flex-1" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500" />
              <div className="h-1.5 bg-zinc-200 rounded flex-1" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-500" />
              <div className="h-1.5 bg-zinc-200 rounded flex-1" />
            </div>
          </div>
        );

      case 'instagram':
        // Official Instagram Camera with authentic gradient
        return (
          <div className="w-full h-full bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] p-2 flex items-center justify-center relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/25 pointer-events-none" />
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-none stroke-white drop-shadow-md" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
        );

      case 'facebook':
        // Official Facebook Blue with white 'f'
        return (
          <div className="w-full h-full bg-[#1877F2] p-2 flex items-center justify-center relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20 pointer-events-none" />
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white drop-shadow-md">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );

      case 'linkedin':
        // Official LinkedIn Blue with white 'in'
        return (
          <div className="w-full h-full bg-[#0A66C2] p-2 flex items-center justify-center relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20 pointer-events-none" />
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white drop-shadow-md">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
            </svg>
          </div>
        );

      case 'x':
        // Official 𝕏 Matte Black with crisp white glyph
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#161618] to-[#000000] p-2.5 flex items-center justify-center relative overflow-hidden text-white border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/15 pointer-events-none" />
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white drop-shadow-md">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        );

      case 'compass':
      default:
        return (
          <div className={`w-full h-full bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0B] p-2.5 flex items-center justify-center relative overflow-hidden`}>
            <div className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-white rotate-45 rounded-full" />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative inline-block ${dimensionClasses} overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-white/25 transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0 select-none ${className}`}
    >
      {renderIconContent()}
    </div>
  );
}
