import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  SpotifyUser, 
  SpotifyTrack, 
  SpotifyPlaylist, 
  SpotifyDevice,
  SpotifyConnectionStatus 
} from '../types/spotify';
import { 
  getSpotifyClientId, 
  setSpotifyClientId as saveCustomClientId,
  initiateSpotifyLogin, 
  handleSpotifyAuthCallback, 
  getValidAccessToken, 
  getStoredTokens, 
  clearStoredTokens 
} from '../services/spotifyAuth';
import * as spotifyApi from '../services/spotifyApi';

interface SpotifyContextType {
  status: SpotifyConnectionStatus;
  user: SpotifyUser | null;
  playlists: SpotifyPlaylist[];
  savedTracks: SpotifyTrack[];
  totalSavedTracks: number;
  totalPlaylists: number;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  volume: number; // 0 to 100
  activeDeviceId: string | null;
  webPlayerDeviceId: string | null;
  availableDevices: SpotifyDevice[];
  isSdkReady: boolean;
  errorMessage: string | null;
  hasClientId: boolean;
  connectSpotify: () => Promise<void>;
  disconnectSpotify: () => void;
  configureClientId: (clientId: string) => void;
  activatePlayer: () => Promise<void>;
  playTrack: (track: SpotifyTrack | string, contextUri?: string) => Promise<void>;
  playPlaylist: (playlist: SpotifyPlaylist | string) => Promise<void>;
  togglePlay: () => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  setVolumeLevel: (volumePercent: number) => Promise<void>;
  searchSpotify: (query: string) => Promise<spotifyApi.SpotifySearchResponse>;
  loadMoreSavedTracks: () => Promise<void>;
  loadMorePlaylists: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  transferToWebPlayer: () => Promise<void>;
  clearError: () => void;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SpotifyConnectionStatus>('idle');
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [totalPlaylists, setTotalPlaylists] = useState(0);
  const [savedTracks, setSavedTracks] = useState<SpotifyTrack[]>([]);
  const [totalSavedTracks, setTotalSavedTracks] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolume] = useState(80);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [webPlayerDeviceId, setWebPlayerDeviceId] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<SpotifyDevice[]>([]);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasClientId, setHasClientId] = useState(() => !!getSpotifyClientId());

  const playerRef = useRef<SpotifyWebPlayer | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const clearError = () => setErrorMessage(null);

  const configureClientId = (newId: string) => {
    saveCustomClientId(newId);
    setHasClientId(!!newId.trim());
  };

  /**
   * Activates audio element for Web Playback SDK (required for browser autoplay policies)
   */
  const activatePlayer = useCallback(async () => {
    if (playerRef.current && typeof playerRef.current.activateElement === 'function') {
      try {
        await playerRef.current.activateElement();
      } catch (err) {
        console.warn('activateElement notice:', err);
      }
    }
  }, []);

  /**
   * Loads user profile and library playlists / saved tracks
   */
  const loadUserData = useCallback(async () => {
    try {
      const profile = await spotifyApi.getCurrentUserProfile();
      setUser(profile);

      // Check for Premium status
      if (profile.product && profile.product !== 'premium') {
        setStatus('premium_required');
      } else {
        setStatus('connected');
      }

      // Fetch user playlists and liked songs in parallel
      const [playlistsRes, savedRes, devices] = await Promise.all([
        spotifyApi.getUserPlaylists(20, 0).catch(() => ({ items: [], total: 0 })),
        spotifyApi.getUserSavedTracks(25, 0).catch(() => ({ items: [], total: 0 })),
        spotifyApi.getAvailableDevices().catch(() => []),
      ]);

      setPlaylists(playlistsRes.items);
      setTotalPlaylists(playlistsRes.total);
      setSavedTracks(savedRes.items);
      setTotalSavedTracks(savedRes.total);
      setAvailableDevices(devices);

      const activeDev = devices.find(d => d.is_active) || devices[0];
      if (activeDev) {
        setActiveDeviceId(activeDev.id);
      }
    } catch (err: any) {
      console.warn('Error loading Spotify user data:', err);
      if (err.message === 'SESSION_EXPIRED' || err.message === 'NOT_AUTHENTICATED') {
        setStatus('session_expired');
        setErrorMessage('Tu sesión de Spotify ha expirado. Por favor reconecta tu cuenta.');
      }
    }
  }, []);

  /**
   * Dynamically loads the Spotify Web Playback SDK script safely
   */
  const loadSpotifySdkScript = useCallback((): Promise<boolean> => {
    if (typeof window === 'undefined') return Promise.resolve(false);
    if (window.Spotify) return Promise.resolve(true);

    return new Promise((resolve) => {
      const existing = document.getElementById('spotify-player-sdk-script');
      if (existing) {
        if (window.Spotify) {
          resolve(true);
        } else {
          const originalReady = window.onSpotifyWebPlaybackSDKReady;
          window.onSpotifyWebPlaybackSDKReady = () => {
            if (originalReady) originalReady();
            resolve(true);
          };
        }
        return;
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve(true);
      };

      const script = document.createElement('script');
      script.id = 'spotify-player-sdk-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = (e) => {
        console.warn('Could not load Spotify Web Playback SDK script (possibly network or iframe restrictions):', e);
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }, []);

  /**
   * Initializes the Spotify Web Playback SDK player in the browser
   */
  const initWebPlaybackSdk = useCallback(async () => {
    if (typeof window === 'undefined' || playerRef.current) return;

    try {
      const loaded = await loadSpotifySdkScript();
      if (!loaded || !window.Spotify) {
        return;
      }

      const setupPlayer = () => {
        if (!window.Spotify) return;

        try {
          const player = new window.Spotify.Player({
            name: '4haus Studio Audio Hub',
            getOAuthToken: async (cb) => {
              const token = await getValidAccessToken();
              if (token) cb(token);
            },
            volume: 0.8,
          });

          player.addListener('ready', ({ device_id }) => {
            setWebPlayerDeviceId(device_id);
            setActiveDeviceId(device_id);
            setIsSdkReady(true);
            // Silently transfer playback state to this web player so user can start playback instantly
            spotifyApi.transferPlayback(device_id, false).catch(() => {});
          });

          player.addListener('not_ready', () => {
            setIsSdkReady(false);
          });

          player.addListener('playback_error', ({ message }) => {
            console.warn('Spotify SDK Playback Error:', message);
            setErrorMessage(`Error de reproducción: ${message}`);
          });

          player.addListener('player_state_changed', (state) => {
            if (!state) return;

            setIsPlaying(!state.paused);
            setProgressMs(state.position);
            setDurationMs(state.duration);

            const currentSdkTrack = state.track_window?.current_track;
            if (currentSdkTrack) {
              const formatted: SpotifyTrack = {
                id: currentSdkTrack.id || '',
                name: currentSdkTrack.name,
                uri: currentSdkTrack.uri,
                duration_ms: currentSdkTrack.duration_ms,
                artists: currentSdkTrack.artists.map((a: any) => ({
                  id: a.uri?.split(':')?.[2] || '',
                  name: a.name,
                  uri: a.uri,
                })),
                album: {
                  id: currentSdkTrack.album?.uri?.split(':')?.[2] || '',
                  name: currentSdkTrack.album?.name || '',
                  images: currentSdkTrack.album?.images || [],
                  uri: currentSdkTrack.album?.uri,
                },
              };
              setCurrentTrack(formatted);
            }
          });

          player.addListener('initialization_error', ({ message }) => {
            console.warn('Spotify SDK Initialization Error:', message);
          });

          player.addListener('authentication_error', ({ message }) => {
            setStatus('session_expired');
            setErrorMessage('Error de autenticación con Spotify: sesión expirada.');
          });

          player.addListener('account_error', () => {
            setStatus('premium_required');
            setErrorMessage(
              'Se requiere una cuenta de Spotify Premium para reproducir audio directo en el navegador mediante el Web Playback SDK. Si tu cuenta es gratuita, puedes controlar la reproducción en tu app de Spotify externa.'
            );
          });

          player.connect().catch((err) => {
            console.warn('Spotify player connection notice:', err);
          });
          playerRef.current = player;
        } catch (err) {
          console.warn('Failed to construct Spotify player:', err);
        }
      };

      if (window.Spotify) {
        setupPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = setupPlayer;
      }
    } catch (err) {
      console.warn('Notice while setting up Spotify Web Playback SDK:', err);
    }
  }, [loadSpotifySdkScript]);

  /**
   * Initial mount: checks for OAuth redirect params or existing tokens
   */
  useEffect(() => {
    let isMounted = true;

    async function checkAuthFlow() {
      // 1. Check if returning from Spotify OAuth callback with `?code=`
      if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
        setStatus('connecting');
        try {
          const tokens = await handleSpotifyAuthCallback();
          if (tokens && isMounted) {
            setStatus('connected');
            await loadUserData();
            initWebPlaybackSdk();
          }
        } catch (err: any) {
          if (isMounted) {
            setStatus('error');
            setErrorMessage(err.message || 'Error al conectar con Spotify.');
          }
        }
        return;
      }

      // 2. Check for existing stored session
      const existing = getStoredTokens();
      if (existing) {
        const validToken = await getValidAccessToken();
        if (validToken && isMounted) {
          await loadUserData();
          initWebPlaybackSdk();
        } else if (isMounted) {
          setStatus('session_expired');
        }
      }
    }

    checkAuthFlow();

    return () => {
      isMounted = false;
    };
  }, [loadUserData, initWebPlaybackSdk]);

  /**
   * Polls playback state periodically to stay in sync with Spotify Connect devices
   */
  useEffect(() => {
    if (status !== 'connected' && status !== 'premium_required') {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    const poll = async () => {
      try {
        const state = await spotifyApi.getPlaybackState();
        if (state && state.item) {
          setCurrentTrack(state.item);
          setIsPlaying(state.is_playing);
          setProgressMs(state.progress_ms);
          setDurationMs(state.item.duration_ms);
          if (state.device) {
            setVolume(state.device.volume_percent ?? 80);
            if (!activeDeviceId) {
              setActiveDeviceId(state.device.id);
            }
          }
        }
      } catch {
        // Silently ignore transient network poll errors
      }
    };

    poll();
    pollTimerRef.current = window.setInterval(poll, 4000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [status, activeDeviceId]);

  /**
   * Smooth progress bar increment while playing
   */
  useEffect(() => {
    if (!isPlaying) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    progressTimerRef.current = window.setInterval(() => {
      setProgressMs((prev) => {
        if (durationMs > 0 && prev >= durationMs) return prev;
        return prev + 1000;
      });
    }, 1000);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, durationMs]);

  /**
   * Initiates Spotify Connect Login
   */
  const connectSpotify = async () => {
    setStatus('connecting');
    setErrorMessage(null);
    try {
      await initiateSpotifyLogin();
    } catch (err: any) {
      setStatus('error');
      if (err.message === 'MISSING_CLIENT_ID') {
        setErrorMessage(
          'Debes configurar tu Spotify Client ID antes de conectar. Ingrésalo en la configuración de Spotify.'
        );
      } else {
        setErrorMessage(err.message || 'No se pudo iniciar el inicio de sesión con Spotify.');
      }
    }
  };

  /**
   * Disconnects Spotify and clears session
   */
  const disconnectSpotify = () => {
    if (playerRef.current) {
      try {
        playerRef.current.disconnect();
      } catch {}
      playerRef.current = null;
    }
    clearStoredTokens();
    setStatus('idle');
    setUser(null);
    setPlaylists([]);
    setSavedTracks([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    setActiveDeviceId(null);
  };

  /**
   * Transfers playback to the Web Playback SDK player in this application
   */
  const transferToWebPlayer = useCallback(async () => {
    if (!webPlayerDeviceId) return;
    try {
      await activatePlayer();
      await spotifyApi.transferPlayback(webPlayerDeviceId, true);
      setActiveDeviceId(webPlayerDeviceId);
    } catch (err: any) {
      console.warn('transferToWebPlayer notice:', err);
    }
  }, [webPlayerDeviceId, activatePlayer]);

  /**
   * Plays a track directly on the Web Playback SDK player in this application
   */
  const playTrack = async (trackOrUri: SpotifyTrack | string, contextUri?: string) => {
    clearError();
    try {
      // 1. Activate element on user gesture to comply with browser autoplay policies
      await activatePlayer();

      const uri = typeof trackOrUri === 'string' ? trackOrUri : trackOrUri.uri;
      if (typeof trackOrUri !== 'string') {
        setCurrentTrack(trackOrUri);
      }

      // 2. Ensure target device is web player if ready
      const targetDevice = webPlayerDeviceId || activeDeviceId || undefined;

      // 3. Start playback on target device
      await spotifyApi.playSpotify({
        deviceId: targetDevice,
        contextUri: contextUri,
        uris: contextUri ? undefined : [uri],
      });

      if (targetDevice) {
        setActiveDeviceId(targetDevice);
      }
      setIsPlaying(true);
    } catch (err: any) {
      if (err.message?.includes('FORBIDDEN') || err.message?.includes('Premium')) {
        setStatus('premium_required');
        setErrorMessage('Se requiere Spotify Premium para reproducir audio directo con el Web Playback SDK.');
      } else if (err.message === 'DEVICE_NOT_FOUND') {
        setErrorMessage('Dispositivo Spotify no disponible aún. Asegúrate de tener Spotify activo o espera unos segundos a que inicialice el reproductor web.');
      } else {
        setErrorMessage(err.message || 'Error al iniciar la canción.');
      }
    }
  };

  /**
   * Plays a playlist directly on this application
   */
  const playPlaylist = async (playlistOrUri: SpotifyPlaylist | string) => {
    clearError();
    try {
      await activatePlayer();
      const uri = typeof playlistOrUri === 'string' ? playlistOrUri : playlistOrUri.uri;
      const targetDevice = webPlayerDeviceId || activeDeviceId || undefined;

      await spotifyApi.playSpotify({
        deviceId: targetDevice,
        contextUri: uri,
      });

      if (targetDevice) {
        setActiveDeviceId(targetDevice);
      }
      setIsPlaying(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar la lista de reproducción.');
    }
  };

  /**
   * Loads more saved tracks (pagination)
   */
  const loadMoreSavedTracks = async () => {
    try {
      const nextOffset = savedTracks.length;
      if (totalSavedTracks > 0 && nextOffset >= totalSavedTracks) return;
      const res = await spotifyApi.getUserSavedTracks(25, nextOffset);
      if (res.items.length > 0) {
        setSavedTracks((prev) => [...prev, ...res.items]);
        setTotalSavedTracks(res.total);
      }
    } catch (err) {
      console.warn('Error loading more saved tracks:', err);
    }
  };

  /**
   * Loads more playlists (pagination)
   */
  const loadMorePlaylists = async () => {
    try {
      const nextOffset = playlists.length;
      if (totalPlaylists > 0 && nextOffset >= totalPlaylists) return;
      const res = await spotifyApi.getUserPlaylists(20, nextOffset);
      if (res.items.length > 0) {
        setPlaylists((prev) => [...prev, ...res.items]);
        setTotalPlaylists(res.total);
      }
    } catch (err) {
      console.warn('Error loading more playlists:', err);
    }
  };

  /**
   * Toggle play / pause
   */
  const togglePlay = async () => {
    if (isPlaying) {
      await pausePlayback();
    } else {
      await resumePlayback();
    }
  };

  const pausePlayback = async () => {
    try {
      if (playerRef.current && isSdkReady) {
        await playerRef.current.pause();
      } else {
        await spotifyApi.pausePlayback(activeDeviceId || undefined);
      }
      setIsPlaying(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo pausar.');
    }
  };

  const resumePlayback = async () => {
    try {
      if (playerRef.current && isSdkReady) {
        await playerRef.current.resume();
      } else {
        await spotifyApi.resumePlayback(activeDeviceId || undefined);
      }
      setIsPlaying(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo reanudar.');
    }
  };

  const skipNext = async () => {
    try {
      if (playerRef.current && isSdkReady) {
        await playerRef.current.nextTrack();
      } else {
        await spotifyApi.skipToNext(activeDeviceId || undefined);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al saltar a la siguiente canción.');
    }
  };

  const skipPrevious = async () => {
    try {
      if (playerRef.current && isSdkReady) {
        await playerRef.current.previousTrack();
      } else {
        await spotifyApi.skipToPrevious(activeDeviceId || undefined);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al volver a la canción anterior.');
    }
  };

  const seekTo = async (posMs: number) => {
    setProgressMs(posMs);
    try {
      if (playerRef.current && isSdkReady) {
        await playerRef.current.seek(posMs);
      } else {
        await spotifyApi.seekPlayback(posMs, activeDeviceId || undefined);
      }
    } catch {}
  };

  const setVolumeLevel = async (volPercent: number) => {
    setVolume(volPercent);
    try {
      if (playerRef.current && isSdkReady) {
        await playerRef.current.setVolume(volPercent / 100);
      } else {
        await spotifyApi.setPlaybackVolume(volPercent, activeDeviceId || undefined);
      }
    } catch {}
  };

  const searchSpotify = async (query: string) => {
    return spotifyApi.searchSpotify(query, ['track', 'playlist', 'artist', 'album'], 20);
  };

  const refreshLibrary = async () => {
    await loadUserData();
  };

  return (
    <SpotifyContext.Provider
      value={{
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
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
