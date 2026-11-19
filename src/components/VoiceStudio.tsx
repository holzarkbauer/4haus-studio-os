import React, { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Mic2, Pause, Play, Volume2 } from 'lucide-react';
import { ui } from '../ui/tokens';

// Sección "Voz": convierte un texto en audio con una voz real (ElevenLabs) y permite
// escucharlo y descargarlo en MP3. La clave vive solo en el servidor.

interface Voice {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
}

interface Props {
  isDark: boolean;
  isEn: boolean;
  userId?: string | null;
  onGoogleLogin?: () => void;
}

export function VoiceStudio({ isDark, isEn, userId, onGoogleLogin }: Props) {
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [engine, setEngine] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState('');
  const [maxText, setMaxText] = useState(800);
  const [charsLeft, setCharsLeft] = useState<number | null>(null);
  const [text, setText] = useState(isEn ? 'Hi, I am the virtual assistant of your business. How can I help you today?' : 'Hola, soy el asistente virtual de tu negocio. ¿En qué te puedo ayudar hoy?');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  async function loadVoices() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/voice/voices');
      const data: any = await res.json().catch(() => ({}));
      setEngine(data.engine ?? null);
      setMaxText(Number(data.maxText) || 800);
      setCharsLeft(typeof data.charsLeft === 'number' ? data.charsLeft : null);
      const list: Voice[] = Array.isArray(data.voices) ? data.voices : [];
      setVoices(list);
      setVoiceId((v) => v || list[0]?.id || '');
      if (!res.ok && data.error) setError(data.error);
    } catch {
      setError(t('No pude conectar con el servidor de voz.', 'Could not reach the voice server.'));
    } finally {
      setLoading(false);
    }
  }

  // Texto que llega desde la casilla del inicio (categoría Voz).
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('4haus_voice_text');
      if (pending) {
        setText(pending);
        sessionStorage.removeItem('4haus_voice_text');
      }
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  useEffect(() => {
    loadVoices();
    return () => {
      previewRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function togglePreview(v: Voice) {
    if (!v.previewUrl) return;
    if (previewing === v.id) {
      previewRef.current?.pause();
      setPreviewing(null);
      return;
    }
    previewRef.current?.pause();
    const a = new Audio(v.previewUrl);
    a.onended = () => setPreviewing(null);
    a.play().catch(() => setPreviewing(null));
    previewRef.current = a;
    setPreviewing(v.id);
  }

  async function generate() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/studio/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) {
        const data: any = await res.json().catch(() => ({}));
        throw new Error(data.error || t('No pude generar la voz.', 'Could not generate the voice.'));
      }
      const blob = await res.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
      if (charsLeft !== null) setCharsLeft(Math.max(0, charsLeft - text.length));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const voice = voices.find((v) => v.id === voiceId);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className={`flex items-center gap-2 text-xs font-medium mb-1 ${s.faint}`}>
          <Mic2 className="w-4 h-4" /> {t('Estudio de voz', 'Voice studio')}
        </div>
        <h2 className={s.title}>{t('Voz para tu negocio', 'A voice for your business')}</h2>
        <p className={s.muted}>
          {t('Escribe un texto, elige una voz y descarga el audio en MP3: para tu asistente, anuncios o videos.', 'Write a text, choose a voice and download the MP3: for your assistant, ads or videos.')}
        </p>
      </div>

      {!loading && !engine && (
        <div className={`${s.card} p-4 text-sm ${s.muted}`}>{t('La voz estará disponible muy pronto.', 'Voice will be available very soon.')}</div>
      )}

      {!userId && (
        <div className={`${s.card} p-4 flex flex-wrap items-center justify-between gap-3`}>
          <p className={`text-sm ${s.muted}`}>{t('Inicia sesión para generar voces.', 'Sign in to generate voices.')}</p>
          {onGoogleLogin && (
            <button type="button" onClick={onGoogleLogin} className={s.primaryButton}>
              {t('Iniciar sesión con Google', 'Sign in with Google')}
            </button>
          )}
        </div>
      )}

      {engine && (
        <div className={`${s.card} p-5 space-y-5`}>
          <div className="space-y-2">
            <h3 className={s.heading}>{t('Elige una voz', 'Choose a voice')}</h3>
            {loading ? (
              <p className={`text-sm ${s.muted}`}><Loader2 className="inline w-4 h-4 animate-spin mr-1" />{t('Cargando voces…', 'Loading voices…')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1" role="radiogroup" aria-label={t('Voces', 'Voices')}>
                {voices.map((v) => {
                  const active = v.id === voiceId;
                  return (
                    <div
                      key={v.id}
                      className={`flex items-center gap-2 rounded-2xl border p-3 transition-colors ${active ? (isDark ? 'border-white bg-white/10' : 'border-[#1D1D1F] bg-black/[0.03]') : isDark ? 'border-white/10' : 'border-black/10'}`}
                    >
                      <button type="button" role="radio" aria-checked={active} onClick={() => setVoiceId(v.id)} className="flex-1 min-w-0 text-left cursor-pointer">
                        <span className={`block text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{v.name}</span>
                        {v.description && <span className={`block text-[11px] truncate ${s.faint}`}>{v.description}</span>}
                      </button>
                      {v.previewUrl && (
                        <button type="button" onClick={() => togglePreview(v)} aria-label={t(`Escuchar muestra de ${v.name}`, `Play sample of ${v.name}`)} className={s.ghostButton}>
                          {previewing === v.id ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="voice-text" className={s.heading}>{t('Texto', 'Text')}</label>
            <textarea id="voice-text" rows={4} value={text} maxLength={maxText} onChange={(e) => setText(e.target.value)} className={`${s.input} resize-none`} />
            <div className={`flex flex-wrap justify-between gap-2 text-xs ${s.faint}`}>
              <span>{text.length} / {maxText}</span>
              {charsLeft !== null && <span>{t(`Te quedan ${charsLeft} caracteres hoy`, `${charsLeft} characters left today`)}</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={generate} disabled={busy || !userId || !voiceId || text.trim().length < 2} className={s.primaryButton}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {busy ? t('Generando…', 'Generating…') : t('Generar voz', 'Generate voice')}
            </button>
            {voice && <span className={`text-xs ${s.faint}`}>{t('Voz: ', 'Voice: ')}{voice.name}</span>}
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          {audioUrl && (
            <div className={`rounded-2xl p-4 space-y-3 ${s.soft}`}>
              <audio controls src={audioUrl} className="w-full" />
              <a href={audioUrl} download={`voz-4haus-${Date.now()}.mp3`} className={s.secondaryButton}>
                <Download className="w-3.5 h-3.5" /> {t('Descargar MP3', 'Download MP3')}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
