// Voz real para la sección "Voz" de 4haus Studio.
//
// Motor principal: ElevenLabs (clave ELEVENLABS_API_KEY en Render). Si no está, se usa Fish
// Audio (FISH_AUDIO_API_KEY). Si no hay ninguno, la pantalla lo dice claramente.
// ElevenLabs cobra por carácter, así que hay topes: por persona al día y para toda la plataforma.
import type { Express, Request, Response } from 'express';
import { loadServerDoc, saveServerDoc } from './storage.ts';

// ELEVENLABS_BASE_URL solo sirve para pruebas locales con un servidor simulado.
const ELEVEN = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io';
const MODEL_ID = 'eleven_multilingual_v2';
const MAX_TEXT = 800;
const USER_DAILY_CHARS = () => Number(process.env.VOICE_USER_DAILY_CHARS || 2000);
const PLATFORM_DAILY_CHARS = () => Number(process.env.VOICE_DAILY_CHARS || 20000);

const adminUids = () =>
  String(process.env.ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export function voiceEngine(): 'elevenlabs' | 'fish' | null {
  if (process.env.ELEVENLABS_API_KEY) return 'elevenlabs';
  if (process.env.FISH_AUDIO_API_KEY) return 'fish';
  return null;
}

// ---------------------------------------------------------------- uso diario
const usage = { day: '', loaded: false, total: 0, per: {} as Record<string, number> };

async function usageToday() {
  const today = new Date().toISOString().slice(0, 10);
  if (usage.day !== today) Object.assign(usage, { day: today, loaded: false, total: 0, per: {} });
  if (!usage.loaded) {
    const saved = await loadServerDoc<{ total?: number; per?: Record<string, number> }>(`voiceUsage-${today}`);
    if (saved) {
      usage.total = Math.max(usage.total, Number(saved.total) || 0);
      usage.per = { ...(saved.per || {}), ...usage.per };
    }
    usage.loaded = true;
  }
  return usage;
}

// ---------------------------------------------------------------- voces
interface VoiceItem {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
}
let voiceCache: { at: number; voices: VoiceItem[] } | null = null;

async function elevenVoices(): Promise<VoiceItem[]> {
  if (voiceCache && Date.now() - voiceCache.at < 10 * 60 * 1000) return voiceCache.voices;
  const res = await fetch(`${ELEVEN}/v1/voices`, { headers: { 'xi-api-key': String(process.env.ELEVENLABS_API_KEY) } });
  if (!res.ok) throw new Error(`ElevenLabs respondió ${res.status}`);
  const data: any = await res.json();
  const voices: VoiceItem[] = (data.voices || []).slice(0, 60).map((v: any) => ({
    id: String(v.voice_id),
    name: String(v.name || 'Voz'),
    description: [v.labels?.gender, v.labels?.accent, v.labels?.age, v.labels?.use_case || v.labels?.description]
      .filter(Boolean)
      .join(' · '),
    previewUrl: String(v.preview_url || ''),
  }));
  voiceCache = { at: Date.now(), voices };
  return voices;
}

/** Explica un error de ElevenLabs en palabras simples. */
function explainEleven(status: number, detail: string, admin: boolean): string {
  const d = detail.toLowerCase();
  if (status === 401) return admin ? 'La clave de ElevenLabs (ELEVENLABS_API_KEY) en Render no es válida o le faltan permisos de Text to Speech.' : 'La voz no está disponible en este momento. Ya avisamos al equipo.';
  if (d.includes('quota') || d.includes('credits') || status === 402)
    return admin ? 'Tu cuenta de ElevenLabs se quedó sin créditos este mes (o llegó al límite que pusiste en la clave). Agrega créditos o sube de plan en elevenlabs.io.' : 'La voz no está disponible en este momento. Ya avisamos al equipo.';
  if (status === 429) return 'El servicio de voz está ocupado. Vuelve a intentarlo en un momento.';
  return admin ? `ElevenLabs respondió ${status}: ${detail.slice(0, 200)}` : 'No pude generar la voz esta vez. Vuelve a intentarlo.';
}

export function registerVoiceRoutes(app: Express) {
  const isAdmin = (req: Request) => Boolean(req.auth?.verified && req.auth.uid && adminUids().includes(req.auth.uid));

  app.get('/api/studio/voice/voices', async (req: Request, res: Response) => {
    const engine = voiceEngine();
    const u = await usageToday();
    const uid = req.auth?.uid || '';
    const base = {
      engine,
      signedIn: Boolean(req.auth?.verified),
      maxText: MAX_TEXT,
      charsLeft: isAdmin(req) ? null : Math.max(0, USER_DAILY_CHARS() - (u.per[uid] || 0)),
    };
    if (engine !== 'elevenlabs') return res.json({ ...base, voices: engine === 'fish' ? [{ id: 'fish-default', name: 'Voz principal', description: 'Fish Audio', previewUrl: '' }] : [] });
    try {
      res.json({ ...base, voices: await elevenVoices() });
    } catch (err) {
      console.error('[voz] No se pudo leer la lista de voces:', (err as Error).message);
      res.status(502).json({ ...base, voices: [], error: isAdmin(req) ? `No pude leer tus voces de ElevenLabs: ${(err as Error).message}. Revisa la clave en Render.` : 'No pude cargar las voces. Vuelve a intentarlo.' });
    }
  });

  app.post('/api/studio/voice/tts', async (req: Request, res: Response) => {
    if (!req.auth?.verified) return res.status(401).json({ error: 'Inicia sesión para generar voces.', authRequired: true });
    const engine = voiceEngine();
    const admin = isAdmin(req);
    if (!engine) {
      return res.status(503).json({ error: admin ? 'Falta conectar la voz: agrega ELEVENLABS_API_KEY en Render (Environment).' : 'La voz estará disponible muy pronto.' });
    }
    const text = String(req.body?.text || '').trim();
    if (text.length < 2) return res.status(400).json({ error: 'Escribe el texto que quieres convertir en voz.' });
    if (text.length > MAX_TEXT) return res.status(400).json({ error: `El texto puede tener hasta ${MAX_TEXT} caracteres.` });
    const u = await usageToday();
    const uid = String(req.auth.uid);
    if (!admin && (u.per[uid] || 0) + text.length > USER_DAILY_CHARS()) {
      return res.status(429).json({ error: `Llegaste al máximo de ${USER_DAILY_CHARS()} caracteres de voz por día. Vuelve mañana.` });
    }
    if (u.total + text.length > PLATFORM_DAILY_CHARS()) {
      return res.status(429).json({ error: 'Hoy se alcanzó el límite de voz de la plataforma. Vuelve mañana.' });
    }

    try {
      let audio: Buffer;
      if (engine === 'elevenlabs') {
        const voiceId = String(req.body?.voiceId || '').replace(/[^a-zA-Z0-9]/g, '');
        if (!voiceId) return res.status(400).json({ error: 'Elige una voz.' });
        const r = await fetch(`${ELEVEN}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: { 'xi-api-key': String(process.env.ELEVENLABS_API_KEY), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
          body: JSON.stringify({ text, model_id: MODEL_ID }),
        });
        if (!r.ok) {
          const detail = await r.text().catch(() => '');
          console.error('[voz] ElevenLabs:', r.status, detail.slice(0, 300));
          return res.status(r.status === 429 ? 429 : 502).json({ error: explainEleven(r.status, detail, admin) });
        }
        audio = Buffer.from(await r.arrayBuffer());
      } else {
        const r = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.FISH_AUDIO_API_KEY}`, 'Content-Type': 'application/json', model: 's1' },
          body: JSON.stringify({
            text,
            format: 'mp3',
            mp3_bitrate: 128,
            ...(process.env.FISH_AUDIO_REFERENCE_ID ? { reference_id: process.env.FISH_AUDIO_REFERENCE_ID } : {}),
          }),
        });
        if (!r.ok) {
          console.error('[voz] Fish Audio:', r.status);
          return res.status(502).json({ error: admin ? `Fish Audio respondió ${r.status}. Revisa su clave o su saldo.` : 'No pude generar la voz esta vez. Vuelve a intentarlo.' });
        }
        audio = Buffer.from(await r.arrayBuffer());
      }
      if (audio.length < 256) return res.status(502).json({ error: 'El servicio de voz devolvió un audio vacío. Vuelve a intentarlo.' });
      u.total += text.length;
      u.per[uid] = (u.per[uid] || 0) + text.length;
      saveServerDoc(`voiceUsage-${u.day}`, { total: u.total, per: u.per, updatedAt: new Date().toISOString() });
      console.log(`[voz] ${engine} ${text.length} caracteres (día: ${u.total})`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('X-Voice-Engine', engine);
      res.send(audio);
    } catch (err) {
      console.error('[voz] Error:', (err as Error).message);
      res.status(502).json({ error: 'Se cortó la conexión con el servicio de voz. Vuelve a intentarlo.' });
    }
  });
}
