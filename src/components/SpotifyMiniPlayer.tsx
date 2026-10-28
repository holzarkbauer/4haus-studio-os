import { useState, type ChangeEvent } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Music, 
  Maximize2, 
  ChevronUp, 
  ChevronDown,
  AlertCircle,
  ExternalLink,
  Radio
} from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';
import { Language } from '../types';

interface SpotifyMiniPlayerProps {
  lang: Language;
  onOpenSpotify: () => void;
}

export function SpotifyMiniPlayer({ lang, onOpenSpotify }: SpotifyMiniPlayerProps) {
  const {
    status,
    user,
    currentTrack,
    isPlaying,
    progressMs,
    durationMs,
    volume,
    togglePlay,
    skipNext,
    skipPrevious,
    seekTo,
    setVolumeLevel,
    connectSpotify,
    hasClientId,
  } = useSpotify();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const handleSpotifyHubClick = () => {
    onOpenSpotify();
  };

  // If not connected and no track, show a discreet, elegant pill to connect or open
  const isConnected = status === 'connected' || status === 'premium_required';

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return '0:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seekTo(val);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolumeLevel(val);
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeLevel(prevVolume || 80);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolumeLevel(0);
    }
  };

  // Status Badge Label
  const getStatusBadge = () => {
    switch (status) {
      case 'connecting':
        return { text: lang === 'en' ? 'Connecting...' : 'Conectando...', color: 'text-amber-400 bg-amber-950/80 border-amber-500/30' };
      case 'connected':
        return { text: lang === 'en' ? 'Spotify Connected' : 'Spotify Conectado', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30' };
      case 'premium_required':
        return { text: lang === 'en' ? 'Spotify Premium required' : 'Spotify Premium requerido', color: 'text-amber-400 bg-amber-950/80 border-amber-500/30' };
      case 'session_expired':
        return { text: lang === 'en' ? 'Session expired — reconnect' : 'Sesión expirada — reconecta', color: 'text-rose-400 bg-rose-950/80 border-rose-500/30' };
      default:
        return { text: lang === 'en' ? 'Connect Spotify' : 'Conectar Spotify', color: 'text-zinc-400 bg-zinc-900 border-white/10' };
    }
  };

  const badge = getStatusBadge();

  // If user hasn't connected Spotify and no track is playing, do NOT render the standalone floating button
  // as requested: "quita el boton de spotify audio hub, es confuso, esa funcion se la pediremos al preguntarle a daniel el agente virtual dentro del boton : preguntar"
  if (!isConnected && !currentTrack) {
    return null;
  }

  const albumArt = currentTrack?.album?.images?.[0]?.url;
  const trackName = currentTrack?.name || (lang === 'en' ? 'No track playing' : 'Sin canción en reproducción');
  const artistName = currentTrack?.artists?.map(a => a.name).join(', ') || (user?.display_name ? `@${user.display_name}` : 'Spotify');

  return (
    <aside 
      id="spotify-persistent-player"
      aria-label="Spotify Player"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none"
    >
      <div className="rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/15 p-3 sm:p-4 shadow-2xl shadow-black/80 text-left">
        
        {/* Top Status & Controls Bar */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#1DB954] flex items-center justify-center text-black text-[9px] font-black">
              S
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.color}`}>
              {badge.text}
            </span>
            {user?.display_name && (
              <span className="text-[11px] text-zinc-400 hidden sm:inline truncate max-w-[120px]">
                {user.display_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenSpotify}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title={lang === 'en' ? "Open Spotify Hub" : "Abrir Spotify Hub"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Player Row */}
        <div className="flex items-center gap-3.5">
          
          {/* Album Artwork */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/15 shrink-0 group">
            {albumArt ? (
              <img 
                src={albumArt} 
                alt={trackName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Music className="w-6 h-6" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '100%' }} />
                  <span className="w-1 bg-[#1DB954] rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" style={{ height: '40%' }} />
                </div>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate tracking-tight">
              {trackName}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              {artistName}
            </p>
          </div>

          {/* Core Transport Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={skipPrevious}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black text-black" />
              ) : (
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={skipNext}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrubbing Progress Bar */}
        <div className="mt-2.5 flex items-center gap-2.5 text-[10px] font-mono text-zinc-400">
          <span className="w-8 text-right">{formatTime(progressMs)}</span>
          <input
            type="range"
            min={0}
            max={durationMs || 100}
            value={progressMs}
            onChange={handleSeek}
            aria-label="Spotify Track Progress"
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954] hover:bg-zinc-700 transition-colors"
          />
          <span className="w-8">{formatTime(durationMs)}</span>
        </div>

        {/* Expanded Drawer: Volume + Device selector info */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-zinc-400">
              <button onClick={handleToggleMute} className="hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Spotify Volume"
                className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              />
              <span className="text-[10px] font-mono w-6 text-right">{isMuted ? 0 : volume}%</span>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>4haus Web Audio</span>
              {currentTrack?.external_urls?.spotify && (
                <a
                  href={currentTrack.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-[#1DB954] transition-colors inline-flex items-center"
                  title="Open in Spotify App"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
