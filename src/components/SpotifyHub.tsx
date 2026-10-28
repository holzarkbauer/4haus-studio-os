import { useState, useEffect, type ChangeEvent } from 'react';
import { 
  Radio, 
  Search, 
  Play, 
  Pause, 
  ListMusic, 
  Heart, 
  ExternalLink, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  HelpCircle,
  Music2,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  User,
  Disc,
  Laptop,
  Smartphone,
  Speaker,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';
import { SpotifyTrack, SpotifyPlaylist, SpotifyArtist, SpotifyAlbum, SpotifyDevice } from '../types/spotify';
import { Language } from '../types';
import { getSpotifyRedirectUri } from '../services/spotifyAuth';
import * as spotifyApi from '../services/spotifyApi';

interface SpotifyHubProps {
  lang: Language;
  onClose?: () => void;
}

export function SpotifyHub({ lang, onClose }: SpotifyHubProps) {
  const {
    status,
    user,
    playlists,
    savedTracks,
    totalSavedTracks,
    totalPlaylists,
    currentTrack,
    isPlaying,
    progressMs,
    durationMs,
    volume,
    activeDeviceId,
    webPlayerDeviceId,
    availableDevices,
    isSdkReady,
    errorMessage,
    hasClientId,
    connectSpotify,
    disconnectSpotify,
    configureClientId,
    activatePlayer,
    playTrack,
    playPlaylist,
    togglePlay,
    pausePlayback,
    resumePlayback,
    skipNext,
    skipPrevious,
    seekTo,
    setVolumeLevel,
    searchSpotify,
    loadMoreSavedTracks,
    loadMorePlaylists,
    refreshLibrary,
    transferToWebPlayer,
    clearError,
  } = useSpotify();

  const [activeSubTab, setActiveSubTab] = useState<'library' | 'search' | 'playlists' | 'devices' | 'settings'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'tracks' | 'artists' | 'albums' | 'playlists'>('all');
  const [searchResults, setSearchResults] = useState<{
    tracks: SpotifyTrack[];
    playlists: SpotifyPlaylist[];
    artists: SpotifyArtist[];
    albums: SpotifyAlbum[];
  }>({
    tracks: [],
    playlists: [],
    artists: [],
    albums: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [customInputId, setCustomInputId] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(!hasClientId);
  
  // Selected detail views (playlist, artist, album)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [isLoadingPlaylistTracks, setIsLoadingPlaylistTracks] = useState(false);

  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [artistTracks, setArtistTracks] = useState<SpotifyTrack[]>([]);
  const [isLoadingArtistTracks, setIsLoadingArtistTracks] = useState(false);

  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [isLoadingAlbumTracks, setIsLoadingAlbumTracks] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const redirectUri = getSpotifyRedirectUri();
  const isConnected = status === 'connected' || status === 'premium_required';

  // Live search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ tracks: [], playlists: [], artists: [], albums: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchSpotify(searchQuery);
        setSearchResults(res);
      } catch {
        // silent
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, searchSpotify]);

  // Load tracks when a playlist is selected
  const handleSelectPlaylist = async (pl: SpotifyPlaylist) => {
    setSelectedPlaylist(pl);
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setIsLoadingPlaylistTracks(true);
    try {
      const tracks = await spotifyApi.getPlaylistTracks(pl.id, 50);
      setPlaylistTracks(tracks);
    } catch {
      setPlaylistTracks([]);
    } finally {
      setIsLoadingPlaylistTracks(false);
    }
  };

  // Load top tracks when an artist is selected
  const handleSelectArtist = async (artist: SpotifyArtist) => {
    setSelectedArtist(artist);
    setSelectedPlaylist(null);
    setSelectedAlbum(null);
    setIsLoadingArtistTracks(true);
    try {
      const tracks = await spotifyApi.getArtistTopTracks(artist.id);
      setArtistTracks(tracks);
    } catch {
      setArtistTracks([]);
    } finally {
      setIsLoadingArtistTracks(false);
    }
  };

  // Load tracks when an album is selected
  const handleSelectAlbum = async (album: SpotifyAlbum) => {
    setSelectedAlbum(album);
    setSelectedPlaylist(null);
    setSelectedArtist(null);
    setIsLoadingAlbumTracks(true);
    try {
      const tracks = await spotifyApi.getAlbumTracks(album.id);
      setAlbumTracks(tracks);
    } catch {
      setAlbumTracks([]);
    } finally {
      setIsLoadingAlbumTracks(false);
    }
  };

  const handleSaveClientId = () => {
    if (customInputId.trim()) {
      configureClientId(customInputId.trim());
      setShowKeyConfig(false);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seekTo(val);
  };

  const handleVolume = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolumeLevel(val);
  };

  const formatDuration = (ms: number) => {
    if (!ms || isNaN(ms)) return '0:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLoadMoreSaved = async () => {
    setIsLoadingMore(true);
    await loadMoreSavedTracks();
    setIsLoadingMore(false);
  };

  const handleLoadMorePlaylists = async () => {
    setIsLoadingMore(true);
    await loadMorePlaylists();
    setIsLoadingMore(false);
  };

  return (
    <div className="space-y-5 text-left text-zinc-100 font-sans">
      
      {/* Header Bar */}
      <header className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954] flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(29,185,84,0.4)] shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight">
                Spotify Audio Hub
              </h3>
              {isConnected && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  {lang === 'en' ? 'Connected' : 'Conectado'}
                </span>
              )}
              {isSdkReady && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Web Player Ready
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {user ? (
                <span>
                  {lang === 'en' ? 'User' : 'Usuario'}:{' '}
                  <strong className="text-white">{user.display_name}</strong>
                  {user.product && (
                    <span className="ml-1.5 uppercase font-mono text-[10px] text-[#1DB954]">
                      ({user.product})
                    </span>
                  )}
                  {user.country && (
                    <span className="ml-1 text-zinc-400 text-[10px] uppercase font-mono">
                      • {user.country}
                    </span>
                  )}
                </span>
              ) : (
                lang === 'en' 
                  ? 'Connect your Spotify account to search and stream tracks directly' 
                  : 'Conecta tu cuenta de Spotify para buscar y reproducir música directamente'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={refreshLibrary}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title={lang === 'en' ? "Refresh Library" : "Actualizar Biblioteca"}
                aria-label={lang === 'en' ? "Refresh Library" : "Actualizar Biblioteca"}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={disconnectSpotify}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Disconnect' : 'Desconectar'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connectSpotify}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shadow-lg shadow-[#1DB954]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>{lang === 'en' ? 'Connect Spotify' : 'Conectar con Spotify'}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title={lang === 'en' ? "Close" : "Cerrar"}
              aria-label={lang === 'en' ? "Close" : "Cerrar"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Error / Notice Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button onClick={clearError} className="text-amber-400 hover:text-white text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Embedded Player Console (Now Playing + Full Controls) */}
      <section 
        aria-label="Now Playing"
        className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-white/15 space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Track Info */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 flex items-center justify-center">
              {currentTrack?.album?.images?.[0]?.url ? (
                <img
                  src={currentTrack.album.images[0].url}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Music2 className="w-6 h-6 text-zinc-600" />
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-ping" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">
                {currentTrack?.name || (lang === 'en' ? 'No track currently playing' : 'Ninguna canción en reproducción')}
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                {currentTrack?.artists?.map(a => a.name).join(', ') || (lang === 'en' ? 'Select a song below to start playing' : 'Selecciona una canción abajo para reproducir')}
              </p>
              {currentTrack?.album?.name && (
                <p className="text-[10px] text-zinc-400 truncate font-mono">
                  {currentTrack.album.name}
                </p>
              )}
            </div>
          </div>

          {/* Controls: Skip, Play/Pause, Volume */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={skipPrevious}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={lang === 'en' ? 'Previous' : 'Anterior'}
                aria-label={lang === 'en' ? 'Previous' : 'Anterior'}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black transition-transform active:scale-90 shadow-lg shadow-[#1DB954]/30 cursor-pointer"
                title={isPlaying ? (lang === 'en' ? 'Pause' : 'Pausar') : (lang === 'en' ? 'Play' : 'Reproducir')}
                aria-label={isPlaying ? (lang === 'en' ? 'Pause' : 'Pausar') : (lang === 'en' ? 'Play' : 'Reproducir')}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
              </button>

              <button
                onClick={skipNext}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={lang === 'en' ? 'Next' : 'Siguiente'}
                aria-label={lang === 'en' ? 'Next' : 'Siguiente'}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolume}
                className="w-16 sm:w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                title="Volumen"
                aria-label="Volumen"
              />
            </div>
          </div>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="space-y-1">
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min="0"
              max={durationMs || 100}
              value={progressMs || 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              aria-label="Progreso de reproducción"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>{formatDuration(progressMs)}</span>
            <span>{formatDuration(durationMs)}</span>
          </div>
        </div>
      </section>

      {/* Developer Configuration Drawer */}
      {(!hasClientId || showKeyConfig) && (
        <section 
          aria-label="Spotify Developer Configuration"
          className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-white/15 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <KeyRound className="w-4 h-4 text-[#1DB954]" />
              <span>{lang === 'en' ? 'Spotify Developer App Configuration (PKCE)' : 'Configuración de Spotify Developer (PKCE)'}</span>
            </div>
            {hasClientId && (
              <button 
                onClick={() => setShowKeyConfig(false)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                {lang === 'en' ? 'Hide' : 'Ocultar'}
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {lang === 'en' 
              ? 'OAuth PKCE authenticates securely without a client secret. Register this exact redirect URI in your Spotify Dashboard:' 
              : 'OAuth PKCE autentica de forma segura sin client secret. Registra exactamente esta redirect URI en tu Spotify Dashboard:'}
          </p>

          <div className="bg-black/50 p-3 rounded-xl border border-white/10 text-xs font-mono space-y-1.5">
            <div className="text-zinc-400 flex items-center justify-between">
              <span>Redirect URI:</span>
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[#1DB954] hover:underline flex items-center gap-1"
              >
                Spotify Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <code className="text-white select-all block bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-white/10 break-all">
              {redirectUri}
            </code>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              placeholder={lang === 'en' ? 'Paste your Spotify Client ID here...' : 'Pega tu Spotify Client ID aquí...'}
              value={customInputId}
              onChange={(e) => setCustomInputId(e.target.value)}
              className="flex-1 w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
            />
            <button
              onClick={handleSaveClientId}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {lang === 'en' ? 'Save Client ID' : 'Guardar Client ID'}
            </button>
          </div>
        </section>
      )}

      {/* Main Navigation Tabs */}
      <nav aria-label="Spotify Hub Tabs" className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => {
            setActiveSubTab('library');
            setSelectedPlaylist(null);
            setSelectedArtist(null);
            setSelectedAlbum(null);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'library'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Liked Songs' : 'Canciones Guardadas'}</span>
          {totalSavedTracks > 0 && (
            <span className="text-[10px] opacity-70">({totalSavedTracks})</span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSubTab('playlists');
            setSelectedPlaylist(null);
            setSelectedArtist(null);
            setSelectedAlbum(null);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'playlists'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Playlists' : 'Mis Playlists'}</span>
          {totalPlaylists > 0 && (
            <span className="text-[10px] opacity-70">({totalPlaylists})</span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSubTab('search');
            setSelectedPlaylist(null);
            setSelectedArtist(null);
            setSelectedAlbum(null);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'search'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Search' : 'Búsqueda Global'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('devices')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'devices'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Devices' : 'Dispositivos'}</span>
          {availableDevices.length > 0 && (
            <span className="text-[10px] opacity-70">({availableDevices.length})</span>
          )}
        </button>

        {!showKeyConfig && (
          <button
            onClick={() => setShowKeyConfig(true)}
            className="ml-auto text-xs text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 p-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Config</span>
          </button>
        )}
      </nav>

      {/* DETAIL MODAL / VIEW: Playlist Tracks */}
      {selectedPlaylist && (
        <section aria-label={selectedPlaylist.name} className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/15 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                {selectedPlaylist.images?.[0]?.url ? (
                  <img
                    src={selectedPlaylist.images[0].url}
                    alt={selectedPlaylist.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ListMusic className="w-6 h-6 m-auto text-zinc-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#1DB954] uppercase">Playlist</span>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">{selectedPlaylist.name}</h4>
                <p className="text-xs text-zinc-400">{playlistTracks.length} {lang === 'en' ? 'tracks loaded' : 'canciones cargadas'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => playPlaylist(selectedPlaylist)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1DB954] text-black font-bold text-xs hover:bg-[#1ed760] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{lang === 'en' ? 'Play All' : 'Reproducir Todo'}</span>
              </button>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                title="Volver"
                aria-label="Volver"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoadingPlaylistTracks ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              <span className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin inline-block mr-2" />
              {lang === 'en' ? 'Loading tracks...' : 'Cargando canciones...'}
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {playlistTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, selectedPlaylist.uri)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-white/15 border-[#1DB954]'
                        : 'bg-zinc-950/60 hover:bg-white/10 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-zinc-400 w-5 text-right">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                          {track.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {track.artists?.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">{formatDuration(track.duration_ms)}</span>
                      <button className="p-1.5 rounded-full hover:bg-white/15 text-zinc-400 hover:text-white">
                        {isCurrent && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* DETAIL MODAL / VIEW: Artist Top Tracks */}
      {selectedArtist && (
        <section aria-label={selectedArtist.name} className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/15 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 shrink-0">
                {selectedArtist.images?.[0]?.url ? (
                  <img
                    src={selectedArtist.images[0].url}
                    alt={selectedArtist.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-6 h-6 m-auto text-zinc-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#1DB954] uppercase">Artist</span>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">{selectedArtist.name}</h4>
                <p className="text-xs text-zinc-400">{lang === 'en' ? 'Top tracks' : 'Canciones más populares'}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedArtist(null)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              title="Volver"
              aria-label="Volver"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoadingArtistTracks ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              <span className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin inline-block mr-2" />
              {lang === 'en' ? 'Loading top tracks...' : 'Cargando canciones populares...'}
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {artistTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-white/15 border-[#1DB954]'
                        : 'bg-zinc-950/60 hover:bg-white/10 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-zinc-400 w-5 text-right">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                          {track.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {track.album?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">{formatDuration(track.duration_ms)}</span>
                      <button className="p-1.5 rounded-full hover:bg-white/15 text-zinc-400 hover:text-white">
                        {isCurrent && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* DETAIL MODAL / VIEW: Album Tracks */}
      {selectedAlbum && (
        <section aria-label={selectedAlbum.name} className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/15 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                {selectedAlbum.images?.[0]?.url ? (
                  <img
                    src={selectedAlbum.images[0].url}
                    alt={selectedAlbum.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Disc className="w-6 h-6 m-auto text-zinc-600" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#1DB954] uppercase">Album</span>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">{selectedAlbum.name}</h4>
                <p className="text-xs text-zinc-400">{selectedAlbum.artists?.map(a => a.name).join(', ')}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedAlbum(null)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              title="Volver"
              aria-label="Volver"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoadingAlbumTracks ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              <span className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin inline-block mr-2" />
              {lang === 'en' ? 'Loading album tracks...' : 'Cargando pistas del álbum...'}
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {albumTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, selectedAlbum.uri)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-white/15 border-[#1DB954]'
                        : 'bg-zinc-950/60 hover:bg-white/10 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-zinc-400 w-5 text-right">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                          {track.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {track.artists?.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">{formatDuration(track.duration_ms)}</span>
                      <button className="p-1.5 rounded-full hover:bg-white/15 text-zinc-400 hover:text-white">
                        {isCurrent && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 1: USER LIKED / SAVED SONGS */}
      {activeSubTab === 'library' && !selectedPlaylist && !selectedArtist && !selectedAlbum && (
        <div className="space-y-4">
          {!isConnected ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-white/10 text-center space-y-3">
              <Heart className="w-10 h-10 text-pink-500 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-white">
                {lang === 'en' ? 'Connect to view your Saved Tracks' : 'Conecta para ver tus Canciones Guardadas'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {lang === 'en'
                  ? 'Access your saved Spotify tracks and stream them directly in this browser.'
                  : 'Accede a tus canciones favoritas guardadas en Spotify y reprodúcelas directamente en este navegador.'}
              </p>
              <button
                onClick={connectSpotify}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954] text-black font-bold text-xs hover:bg-[#1ed760] transition-transform active:scale-95 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{lang === 'en' ? 'Connect Spotify Now' : 'Conectar Spotify Ahora'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  <span>{lang === 'en' ? 'Liked / Saved Songs' : 'Canciones Guardadas / Favoritas'}</span>
                </h4>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {savedTracks.length} {totalSavedTracks > 0 ? `/ ${totalSavedTracks}` : ''} {lang === 'en' ? 'tracks' : 'canciones'}
                </span>
              </div>

              {savedTracks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-950/40 border border-white/10 text-center text-xs text-zinc-400">
                  {lang === 'en' ? 'No saved tracks found in your library.' : 'No se encontraron canciones guardadas en tu biblioteca.'}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                    {savedTracks.map((track) => {
                      const isCurrent = currentTrack?.id === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-white/15 border-[#1DB954]'
                              : 'bg-zinc-950/60 hover:bg-white/10 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                              {track.album?.images?.[0]?.url ? (
                                <img
                                  src={track.album.images[0].url}
                                  alt={track.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Music2 className="w-4 h-4 m-auto text-zinc-600" />
                              )}
                              {isCurrent && isPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                                {track.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {track.artists.map(a => a.name).join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                              {formatDuration(track.duration_ms)}
                            </span>
                            <button className="p-1.5 rounded-full hover:bg-white/15 text-zinc-400 hover:text-white">
                              {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalSavedTracks > savedTracks.length && (
                    <div className="text-center pt-2">
                      <button
                        onClick={handleLoadMoreSaved}
                        disabled={isLoadingMore}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <span>{lang === 'en' ? 'Loading...' : 'Cargando más...'}</span>
                        ) : (
                          <span>{lang === 'en' ? `Load more tracks (${savedTracks.length} of ${totalSavedTracks})` : `Cargar más canciones (${savedTracks.length} de ${totalSavedTracks})`}</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER PLAYLISTS */}
      {activeSubTab === 'playlists' && !selectedPlaylist && !selectedArtist && !selectedAlbum && (
        <div className="space-y-4">
          {!isConnected ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-white/10 text-center space-y-3">
              <ListMusic className="w-10 h-10 text-[#1DB954] mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-white">
                {lang === 'en' ? 'Connect to view your Playlists' : 'Conecta para ver tus Playlists'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {lang === 'en'
                  ? 'Connect Spotify to access all your created playlists and stream them.'
                  : 'Conecta Spotify para acceder a todas tus listas de reproducción y escucharlas.'}
              </p>
              <button
                onClick={connectSpotify}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954] text-black font-bold text-xs hover:bg-[#1ed760] transition-transform active:scale-95 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{lang === 'en' ? 'Connect Spotify' : 'Conectar con Spotify'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <ListMusic className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span>{lang === 'en' ? 'Your Playlists' : 'Tus Listas de Reproducción'}</span>
                </h4>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {playlists.length} {totalPlaylists > 0 ? `/ ${totalPlaylists}` : ''} {lang === 'en' ? 'playlists' : 'listas'}
                </span>
              </div>

              {playlists.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-950/40 border border-white/10 text-center text-xs text-zinc-400">
                  {lang === 'en' ? 'No playlists found in your account.' : 'No se encontraron listas en tu cuenta.'}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        onClick={() => handleSelectPlaylist(playlist)}
                        className="p-3 rounded-2xl bg-zinc-950/60 hover:bg-white/10 border border-white/10 hover:border-[#1DB954]/50 transition-all cursor-pointer group flex flex-col"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 mb-2.5">
                          {playlist.images?.[0]?.url ? (
                            <img
                              src={playlist.images[0].url}
                              alt={playlist.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <ListMusic className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-white truncate mb-0.5">
                          {playlist.name}
                        </h5>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {playlist.tracks?.total || 0} {lang === 'en' ? 'songs' : 'canciones'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {totalPlaylists > playlists.length && (
                    <div className="text-center pt-2">
                      <button
                        onClick={handleLoadMorePlaylists}
                        disabled={isLoadingMore}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <span>{lang === 'en' ? 'Loading...' : 'Cargando más...'}</span>
                        ) : (
                          <span>{lang === 'en' ? `Load more playlists (${playlists.length} of ${totalPlaylists})` : `Cargar más listas (${playlists.length} de ${totalPlaylists})`}</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GLOBAL SEARCH (Tracks, Artists, Albums, Playlists) */}
      {activeSubTab === 'search' && !selectedPlaylist && !selectedArtist && !selectedAlbum && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search songs, artists, albums, or playlists...' : 'Busca canciones, artistas, álbumes o playlists...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/70 border border-white/15 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
            />
            {isSearching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin block" />
              </div>
            )}
          </div>

          {/* Quick preset suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-zinc-400 mr-1">{lang === 'en' ? 'Suggestions:' : 'Sugerencias:'}</span>
            {['In My Room', 'Surfin U.S.A.', 'The Beach Boys', 'Hans Zimmer', 'Interstellar', 'California Dreamin'].map((preset) => (
              <button
                key={preset}
                onClick={() => setSearchQuery(preset)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Search Category Filter Pills */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            {(['all', 'tracks', 'artists', 'albums', 'playlists'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  searchFilter === cat
                    ? 'bg-[#1DB954] text-black'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat === 'all' && (lang === 'en' ? 'All' : 'Todo')}
                {cat === 'tracks' && (lang === 'en' ? 'Tracks' : 'Canciones')}
                {cat === 'artists' && (lang === 'en' ? 'Artists' : 'Artistas')}
                {cat === 'albums' && (lang === 'en' ? 'Albums' : 'Álbumes')}
                {cat === 'playlists' && (lang === 'en' ? 'Playlists' : 'Playlists')}
              </button>
            ))}
          </div>

          {/* Search Results Display */}
          <div className="space-y-6 pt-2">
            
            {/* 1. Tracks Results */}
            {(searchFilter === 'all' || searchFilter === 'tracks') && searchResults.tracks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {lang === 'en' ? 'Songs' : 'Canciones'}
                </h4>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {searchResults.tracks.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-white/15 border-[#1DB954]'
                            : 'bg-zinc-950/60 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                            {track.album?.images?.[0]?.url ? (
                              <img
                                src={track.album.images[0].url}
                                alt={track.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Music2 className="w-5 h-5 m-auto text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                              {track.name}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {track.artists?.map(a => a.name).join(', ')} • {track.album?.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                            {formatDuration(track.duration_ms)}
                          </span>
                          <button className="p-2 rounded-full bg-white/10 hover:bg-[#1DB954] hover:text-black text-white transition-colors cursor-pointer">
                            {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Artists Results */}
            {(searchFilter === 'all' || searchFilter === 'artists') && searchResults.artists.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {lang === 'en' ? 'Artists' : 'Artistas'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {searchResults.artists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => handleSelectArtist(artist)}
                      className="p-3 rounded-2xl bg-zinc-950/60 hover:bg-white/10 border border-white/10 cursor-pointer text-center group flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 mb-2 border border-white/10 group-hover:scale-105 transition-transform">
                        {artist.images?.[0]?.url ? (
                          <img
                            src={artist.images[0].url}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-8 h-8 m-auto text-zinc-600" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate max-w-full">{artist.name}</p>
                      <span className="text-[10px] text-[#1DB954] uppercase font-mono mt-0.5">{lang === 'en' ? 'Artist' : 'Artista'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Albums Results */}
            {(searchFilter === 'all' || searchFilter === 'albums') && searchResults.albums.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {lang === 'en' ? 'Albums' : 'Álbumes'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {searchResults.albums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => handleSelectAlbum(album)}
                      className="p-2.5 rounded-xl bg-zinc-950/60 hover:bg-white/10 border border-white/10 cursor-pointer group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900 mb-2">
                        {album.images?.[0]?.url ? (
                          <img
                            src={album.images[0].url}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Disc className="w-6 h-6 m-auto text-zinc-600" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate">{album.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{album.artists?.map(a => a.name).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Playlists Results */}
            {(searchFilter === 'all' || searchFilter === 'playlists') && searchResults.playlists.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {lang === 'en' ? 'Playlists' : 'Listas de Reproducción'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {searchResults.playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleSelectPlaylist(pl)}
                      className="p-2.5 rounded-xl bg-zinc-950/60 hover:bg-white/10 border border-white/10 cursor-pointer group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900 mb-2">
                        {pl.images?.[0]?.url ? (
                          <img
                            src={pl.images[0].url}
                            alt={pl.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ListMusic className="w-6 h-6 m-auto text-zinc-600" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate">{pl.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{pl.tracks?.total || 0} canciones</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.trim() && !isSearching && 
              searchResults.tracks.length === 0 && 
              searchResults.artists.length === 0 && 
              searchResults.albums.length === 0 && 
              searchResults.playlists.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-6">
                {lang === 'en' ? 'No results found on Spotify for this query.' : 'No se encontraron resultados en Spotify para esta búsqueda.'}
              </p>
            )}

          </div>
        </div>
      )}

      {/* TAB 4: DEVICES & CONNECT */}
      {activeSubTab === 'devices' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#1DB954]" />
                <span>{lang === 'en' ? 'Connected Spotify Devices' : 'Dispositivos Spotify Conectados'}</span>
              </h4>
              <button
                onClick={refreshLibrary}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Refresh' : 'Actualizar'}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === 'en'
                ? 'Select a device below or transfer playback directly to this browser player.'
                : 'Selecciona un dispositivo o transfiere la reproducción directamente al reproductor de este navegador.'}
            </p>

            {/* Web Player Status Card */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    4haus Studio Audio Hub (Web Player)
                    {activeDeviceId === webPlayerDeviceId && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </h5>
                  <p className="text-[10px] text-zinc-400">
                    {isSdkReady 
                      ? (lang === 'en' ? 'Ready for in-browser playback' : 'Listo para reproducir en este navegador') 
                      : (lang === 'en' ? 'Initializing Web Playback SDK...' : 'Inicializando Web Playback SDK...')}
                  </p>
                </div>
              </div>

              {webPlayerDeviceId && (
                <button
                  onClick={transferToWebPlayer}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#1DB954] hover:text-black text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                >
                  {lang === 'en' ? 'Play on this tab' : 'Reproducir aquí'}
                </button>
              )}
            </div>

            {/* Other Devices */}
            <div className="space-y-1.5 pt-2">
              {availableDevices.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => spotifyApi.transferPlayback(dev.id, true)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    dev.is_active
                      ? 'bg-white/15 border-[#1DB954]'
                      : 'bg-zinc-950/60 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {dev.type === 'Computer' ? <Laptop className="w-4 h-4 text-zinc-400" /> : <Smartphone className="w-4 h-4 text-zinc-400" />}
                    <div>
                      <h5 className="text-xs font-bold text-white">{dev.name}</h5>
                      <span className="text-[10px] text-zinc-400">{dev.type} • {dev.volume_percent}% vol</span>
                    </div>
                  </div>
                  {dev.is_active && (
                    <span className="text-[10px] font-mono text-[#1DB954] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
                      {lang === 'en' ? 'Playing' : 'Reproduciendo'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
