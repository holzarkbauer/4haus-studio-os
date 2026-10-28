import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Search,
  Music,
  Disc3,
  SkipForward,
  Upload,
  CheckCircle2,
  Square,
  Trash2,
  FileDown,
} from 'lucide-react';
import { IOSAppIcon } from './IOSAppIcon';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useSpotify } from '../context/SpotifyContext';
import {
  danielVoice,
  DANIEL_FISH_AUDIO_TRANSCRIPT,
  DANIEL_MALE_VOICE_PRESETS,
} from '../utils/danielVoiceEngine';
import { generateAndDownloadStrategyDossierPdf } from '../utils/dossierPdfGenerator';

interface DanielModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export function DanielModal({ lang, isOpen, onClose, onOpenBooking }: DanielModalProps) {
  const t = translations[lang].hub.daniel;

  // Spotify Context Integration
  const {
    status: spotifyStatus,
    currentTrack,
    isPlaying: isMusicPlaying,
    playTrack,
    pausePlayback,
    resumePlayback,
    skipNext,
    searchSpotify,
  } = useSpotify();

  // Voice & KITT scanner state synchronized with unified danielVoice (Fish Audio)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCustomFishAudio, setHasCustomFishAudio] = useState(false);
  const [customAudioFilename, setCustomAudioFilename] = useState<string | null>(null);
  const [activeVoiceSource, setActiveVoiceSource] = useState<string | null>(null);
  const [scannerIndex, setScannerIndex] = useState(0);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [musicQuery, setMusicQuery] = useState('');
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [djMessage, setDjMessage] = useState<string | null>(null);
  const [fishRefId, setFishRefId] = useState(danielVoice.getReferenceId());
  const [voicePreset, setVoicePreset] = useState(danielVoice.getVoicePreset());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = danielVoice.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setHasCustomFishAudio(state.hasCustomAudio);
      setCustomAudioFilename(state.customAudioFilename);
      setActiveVoiceSource(state.activeSource);
      setVoicePreset(state.voicePreset);
    });
    return () => unsubscribe();
  }, []);

  // Audio scanning lights animation loop (8 red LEDs moving side to side)
  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setScannerIndex((prev) => {
        let next = prev + direction;
        if (next >= 7) {
          direction = -1;
          next = 7;
        } else if (next <= 0) {
          direction = 1;
          next = 0;
        }
        return next;
      });
    }, isSpeaking ? 75 : 180);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Stop speaking when modal closes
  useEffect(() => {
    if (!isOpen) {
      danielVoice.stop();
    }
  }, [isOpen]);

  const speakDanielVoice = (text: string, preferMasterSample = false) => {
    danielVoice.speak(text, lang === 'en' ? 'en' : 'es', { preferMasterSample });
  };

  const handleUploadFishMp3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await danielVoice.uploadFishAudioMaster(file);
    setActivePrompt('Presentación Fish Audio');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const prompts =
    lang === 'en'
      ? [
          {
            label: 'Fish Audio Identity',
            speech: 'I am your autonomous second brain, and I adapt to any area.',
            preferMaster: true,
          },
          {
            label: 'Speed Diagnosis',
            speech:
              'Scanning market telemetry. Human sales teams respond in four hours on average. 4haus autonomous agents respond in under forty-five seconds.',
            preferMaster: false,
          },
          {
            label: 'Growth & Niche Sync',
            speech:
              'I am synchronized with your Growth and Niche strategy squad. Every adjustment you make updates your business profile, ICPs, and campaigns in real time.',
            preferMaster: false,
          },
        ]
      : [
          {
            label: 'Saludo Personal a José',
            speech:
              'Hola José, ¿deseas que sigamos trabajando en tu estrategia de Growth y Niche y en la presentación de alto valor para el inversionista? Estoy aquí para servirte.',
            preferMaster: false,
          },
          {
            label: 'Código Moral (4 Pilares)',
            speech:
              'Hola José. Mi juicio opera bajo los cuatro pilares morales que definiste para mí: preservación de la vida y privacidad por diseño, desconfianza estructural fail-safe, veracidad y rigor técnico sin inventar datos, y transparencia total bajo tu autoridad.',
            preferMaster: false,
          },
          {
            label: 'Audio Fish Original (MP3)',
            speech: DANIEL_FISH_AUDIO_TRANSCRIPT,
            preferMaster: true,
          },
        ];

  const handleAskMusicPreference = () => {
    setActivePrompt('music_preference');
    const question =
      lang === 'en'
        ? 'What music would you like to listen to today? Tell me any song, artist, or genre, and I will stream it from Spotify while we refine your strategy.'
        : '¿Qué música te apetece escuchar hoy? Dime cualquier canción, artista o género musical y lo reproduciré desde Spotify mientras trabajamos en tu estrategia.';
    speakDanielVoice(question);
    setDjMessage(
      lang === 'en'
        ? 'Daniel is listening: type or tap a song below.'
        : 'Daniel te escucha: escribe o elige una canción abajo.'
    );
  };

  const handleExecuteMusicQuery = async (inputQuery?: string) => {
    const q = (inputQuery !== undefined ? inputQuery : musicQuery).trim();
    if (!q) {
      handleAskMusicPreference();
      return;
    }

    const lower = q.toLowerCase();

    if (lower === 'pause' || lower === 'pausa' || lower === 'parar' || lower === 'stop') {
      await pausePlayback();
      const msg = lang === 'en' ? 'Pausing Spotify playback.' : 'Pausando la música en Spotify.';
      speakDanielVoice(msg);
      setDjMessage(msg);
      return;
    }

    if (lower === 'resume' || lower === 'play' || lower === 'reanudar' || lower === 'continuar') {
      await resumePlayback();
      const msg =
        lang === 'en' ? 'Resuming playback on Spotify.' : 'Reanudando la reproducción en Spotify.';
      speakDanielVoice(msg);
      setDjMessage(msg);
      return;
    }

    if (lower === 'next' || lower === 'siguiente' || lower === 'skip') {
      await skipNext();
      const msg =
        lang === 'en'
          ? 'Skipping to the next track on Spotify.'
          : 'Saltando a la siguiente canción en Spotify.';
      speakDanielVoice(msg);
      setDjMessage(msg);
      return;
    }

    setIsSearchingMusic(true);
    setDjMessage(
      lang === 'en' ? `Extracting "${q}" from Spotify...` : `Extrayendo "${q}" de Spotify...`
    );

    try {
      const results = await searchSpotify(q);
      if (results.tracks && results.tracks.length > 0) {
        const topTrack = results.tracks[0];
        const artist = topTrack.artists[0]?.name || 'Spotify';
        const msg =
          lang === 'en'
            ? `Now playing "${topTrack.name}" by ${artist} from Spotify.`
            : `Reproduciendo "${topTrack.name}" de ${artist} desde Spotify.`;
        speakDanielVoice(msg);
        setDjMessage(msg);
        await playTrack(topTrack);
        setMusicQuery('');
      } else {
        const notFoundMsg =
          lang === 'en'
            ? `I could not locate "${q}" on Spotify. Try another title or artist.`
            : `No encontré "${q}" en Spotify. ¿Deseas probar con otro título o artista?`;
        speakDanielVoice(notFoundMsg);
        setDjMessage(notFoundMsg);
      }
    } catch {
      if (spotifyStatus !== 'connected' && spotifyStatus !== 'premium_required') {
        const noAuth =
          lang === 'en'
            ? "Your Spotify account is not linked yet. Click 'Connect Spotify' in the player to enable streaming."
            : "Tu cuenta de Spotify aún no está conectada. Haz clic en 'Conectar Spotify' para habilitar la reproducción.";
        speakDanielVoice(noAuth);
        setDjMessage(noAuth);
      } else {
        const errMsg =
          lang === 'en'
            ? 'Error communicating with Spotify API.'
            : 'Error al comunicar con la API de Spotify.';
        speakDanielVoice(errMsg);
        setDjMessage(errMsg);
      }
    } finally {
      setIsSearchingMusic(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/*"
        onChange={handleUploadFishMp3}
        className="hidden"
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F0F12] border border-white/20 p-6 sm:p-7 shadow-2xl overflow-hidden text-left my-auto">
        {/* Subtle red/emerald ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <IOSAppIcon type="daniel" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">Daniel 1.0</span>
                <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {hasCustomFishAudio ? 'Fish Audio Master MP3' : 'Fish Audio Voice Engine'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {lang === 'en'
                  ? 'Hello José, I am here to serve you · 4 Moral Pillars Active'
                  : '«Hola José, estoy aquí para servirte.» · Código Moral 40/40 Activo'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              danielVoice.stop();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Voice Bubble + Fish Audio Master Loader */}
        <div className="flex flex-col items-center justify-center py-5 px-4 bg-black/70 rounded-2xl border border-white/10 mb-5">
          {/* Glowing central voice bubble */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                danielVoice.stop();
              } else if (hasCustomFishAudio) {
                danielVoice.playFishAudioMaster();
              } else {
                speakDanielVoice(DANIEL_FISH_AUDIO_TRANSCRIPT, true);
              }
            }}
            className="relative w-24 h-24 flex items-center justify-center mb-4 cursor-pointer group"
            title="Haz clic para escuchar o detener la voz de Daniel"
          >
            <div
              className={`absolute inset-0 rounded-full border border-emerald-500/30 ${
                isSpeaking ? 'animate-ping opacity-60' : 'opacity-20'
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full border border-red-500/50 ${
                isSpeaking ? 'animate-pulse' : ''
              }`}
            />

            {/* The Central Bubble Orb */}
            <div
              className={`w-18 h-18 rounded-full bg-gradient-to-tr from-red-600 via-emerald-600 to-amber-400 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-transform duration-300 ${
                isSpeaking ? 'scale-110' : 'scale-100 group-hover:scale-105'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-black/70 flex items-center justify-center">
                {isSpeaking ? (
                  <Volume2 className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                )}
              </div>
            </div>
          </button>

          {/* 8-Segment LED Scanning Bar */}
          <div className="w-56 h-3.5 bg-zinc-950 rounded-full p-1 border border-red-950 flex items-center justify-between gap-1 shadow-inner">
            {[...Array(8)].map((_, idx) => {
              const distance = Math.abs(idx - scannerIndex);
              const brightness =
                distance === 0
                  ? 'bg-red-500 shadow-[0_0_10px_#FF0000] scale-110'
                  : distance === 1
                  ? 'bg-red-800 opacity-80'
                  : 'bg-red-950/40 opacity-40';
              return (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-sm transition-all duration-75 ${brightness}`}
                />
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-zinc-300 mt-2.5 flex items-center gap-1.5 text-center">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span>
              {isSpeaking
                ? activeVoiceSource === 'fish-master-mp3'
                  ? `Reproduciendo tu MP3 original de Fish Audio (${customAudioFilename})...`
                  : 'Transmitiendo con la voz de Daniel 1.0...'
                : hasCustomFishAudio
                ? `MP3 Fish Audio vinculado: ${customAudioFilename}`
                : 'Voz Fish Audio lista • Vincula tu MP3 abajo para audio 100% idéntico'}
            </span>
          </div>

          {/* Direct Fish Audio MP3 Upload & Reference ID Box */}
          <div className="mt-4 w-full pt-3 border-t border-white/10 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {hasCustomFishAudio
                    ? 'Actualizar archivo MP3 de Fish Audio'
                    : 'Subir tu MP3 de Fish Audio (Soy s......area..mp3)'}
                </span>
              </button>

              {hasCustomFishAudio && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      isSpeaking ? danielVoice.stop() : danielVoice.playFishAudioMaster()
                    }
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Parar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Oír MP3</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => danielVoice.clearFishAudioMaster()}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                    title="Eliminar audio guardado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {hasCustomFishAudio && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Tu audio Fish Audio está guardado permanentemente en el navegador y sincronizado con Daniel 1.0.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">Voz Masculina:</span>
                <select
                  value={voicePreset}
                  onChange={(e) => {
                    setVoicePreset(e.target.value);
                    danielVoice.setVoicePreset(e.target.value);
                    danielVoice.speak(DANIEL_FISH_AUDIO_TRANSCRIPT, 'es');
                  }}
                  className="flex-1 bg-zinc-900 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                >
                  {DANIEL_MALE_VOICE_PRESETS.map((vp) => (
                    <option key={vp.id} value={vp.id}>
                      {vp.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">Fish ID:</span>
                <input
                  type="text"
                  value={fishRefId}
                  onChange={(e) => {
                    setFishRefId(e.target.value);
                    danielVoice.setReferenceId(e.target.value);
                  }}
                  placeholder="Reference ID opcional"
                  className="flex-1 bg-zinc-900 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Voice Queries Buttons */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            {lang === 'en'
              ? 'Voice Diagnostics (Click to Speak):'
              : 'Diagnósticos de Voz (Haz clic para escuchar a Daniel):'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActivePrompt(p.label);
                  speakDanielVoice(p.speech, p.preferMaster);
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                  activePrompt === p.label && isSpeaking
                    ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Play className="w-3 h-3 fill-current shrink-0" />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daniel Spotify DJ & Music Intelligence Console */}
        <div className="p-4 rounded-2xl bg-black/75 border border-white/15 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-black text-[10px]">
                S
              </div>
              <span className="text-xs font-bold text-white tracking-tight">
                {lang === 'en'
                  ? 'Daniel DJ • Spotify Intelligence'
                  : 'Daniel DJ • Inteligencia Musical Spotify'}
              </span>
            </div>

            <button
              onClick={handleAskMusicPreference}
              className="flex items-center gap-1.5 text-[11px] font-mono text-[#1DB954] hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'en' ? 'Ask Music Preference' : '¿Qué música deseas?'}</span>
            </button>
          </div>

          {djMessage && (
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-zinc-200 flex items-start gap-2 animate-in fade-in duration-200">
              <Disc3 className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5 animate-spin" />
              <p className="leading-relaxed">{djMessage}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleExecuteMusicQuery();
                  }
                }}
                placeholder={
                  lang === 'en'
                    ? 'Ask Daniel: "Play In My Room", "Pause", "Hans Zimmer"...'
                    : 'Pídele a Daniel: "Pon In My Room", "Pausar", "Beach Boys"...'
                }
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
              />
            </div>

            <button
              onClick={() => handleExecuteMusicQuery()}
              disabled={isSearchingMusic}
              className="px-3.5 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSearchingMusic ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-black" />
              )}
              <span>{lang === 'en' ? 'Play' : 'Poner'}</span>
            </button>
          </div>

          {currentTrack && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentTrack.album?.images?.[0]?.url ? (
                  <img
                    src={currentTrack.album.images[0].url}
                    alt={currentTrack.name}
                    className="w-7 h-7 rounded-lg object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Music className="w-4 h-4 text-zinc-500" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentTrack.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {currentTrack.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleExecuteMusicQuery(isMusicPlaying ? 'pausa' : 'reanudar')}
                  className="p-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                  title={isMusicPlaying ? 'Pause' : 'Play'}
                >
                  {isMusicPlaying ? (
                    <Pause className="w-3 h-3 fill-black" />
                  ) : (
                    <Play className="w-3 h-3 fill-black ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => handleExecuteMusicQuery('siguiente')}
                  className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                  title="Next"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              speakDanielVoice(DANIEL_FISH_AUDIO_TRANSCRIPT, true);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-semibold text-xs py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>
              {lang === 'en'
                ? 'Hear Fish Audio Signature'
                : 'Escuchar Firma de Voz (Fish Audio)'}
            </span>
          </button>

          <button
            onClick={async () => {
              await generateAndDownloadStrategyDossierPdf({});
              speakDanielVoice(
                'He generado y descargado tu Dossier Ejecutivo en PDF con toda tu estrategia de Growth y Niche.',
                false
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Download PDF Dossier' : 'Descargar Dossier en PDF'}
            </span>
          </button>

          <button
            onClick={() => {
              danielVoice.stop();
              onClose();
              onOpenBooking();
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            <span>{lang === 'en' ? 'Inquire About Access' : 'Consultar Acceso'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
