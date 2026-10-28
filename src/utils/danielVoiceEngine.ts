/**
 * Unified Daniel 1.0 Voice Engine (Fish Audio Master + Zero-Shot Fish Audio Cloning + Neural Male TTS)
 *
 * WHY YOUR VOICE DIFFERED & HOW IT WORKS NOW:
 * 1. An MP3 file ("Soy s......area..mp3") is a fixed recording of that phrase.
 *    When you upload it via "Vincular MP3 Fish Audio", it is saved in IndexedDB AND synced to the server (`data/daniel-fish-master.mp3`).
 * 2. When Daniel speaks your signature greeting or when you toggle "Modo Audio Original MP3", he plays your exact uploaded MP3 file.
 * 3. For dynamic new sentences (like answering questions about your strategy or confirming a PDF export):
 *    - If a Fish Audio API Key is configured, the server sends your uploaded MP3 bytes (`references: [{ audio, text }]`) to Fish Audio S1/S2 Zero-Shot API so any new text is synthesized with your exact voice timbre.
 *    - When running without a paid API key, the server uses high-definition Neural Male Spanish voices (`es-CO-GonzaloNeural`, `es-ES-AlvaroNeural`, etc.) and NEVER uses the browser's robotic female Spanglish voice.
 */

import { saveAudioToStorage, getAllStoredAudios, deleteAudioFromStorage } from './audioStorage';

export const DANIEL_FISH_AUDIO_TRACK_ID = 'daniel-fish-audio-master';
export const DANIEL_FISH_AUDIO_TRANSCRIPT =
  'Soy su segundo cerebro autónomo, y me adapto a cualquier área.';

export interface MaleVoicePreset {
  id: string;
  label: string;
}

export const DANIEL_MALE_VOICE_PRESETS: MaleVoicePreset[] = [
  { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Colombia · Ejecutivo Natural)' },
  { id: 'es-VE-SebastianNeural', label: 'Sebastián (LatAm · Cálido & Cercano)' },
  { id: 'es-MX-JorgeNeural', label: 'Jorge (México · Corporativo)' },
  { id: 'es-AR-TomasNeural', label: 'Tomás (Cono Sur · Consultivo)' },
  { id: 'es-ES-AlvaroNeural', label: 'Álvaro (España · Directivo)' },
];

type VoiceListener = (state: {
  isSpeaking: boolean;
  hasCustomAudio: boolean;
  customAudioFilename: string | null;
  activeSource: 'fish-master-mp3' | 'fish-api-tts' | 'neural-male-mp3' | null;
  voicePreset: string;
  alwaysUseMasterMp3: boolean;
}) => void;

class DanielVoiceEngine {
  private audioEl: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private customAudioBase64: string | null = null;
  private customAudioFilename: string | null = null;
  private isSpeaking: boolean = false;
  private activeSource: 'fish-master-mp3' | 'fish-api-tts' | 'neural-male-mp3' | null = null;
  private listeners: Set<VoiceListener> = new Set();
  private initialized: boolean = false;
  private selectedReferenceId: string = localStorage.getItem('4haus_fish_reference_id') || '';
  private selectedVoicePreset: string =
    localStorage.getItem('4haus_daniel_voice_preset') || 'es-CO-GonzaloNeural';
  private autoSpeakEnabled: boolean = localStorage.getItem('4haus_daniel_autospeak') !== 'false';
  private alwaysUseMasterMp3: boolean =
    localStorage.getItem('4haus_daniel_always_master_mp3') === 'true';

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.initFromStorage();
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = String(reader.result || '');
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public async initFromStorage(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const stored = await getAllStoredAudios();
      if (stored[DANIEL_FISH_AUDIO_TRACK_ID]) {
        this.customAudioUrl = stored[DANIEL_FISH_AUDIO_TRACK_ID].url;
        this.customAudioFilename = stored[DANIEL_FISH_AUDIO_TRACK_ID].filename;
        try {
          const resp = await fetch(this.customAudioUrl);
          const blob = await resp.blob();
          this.customAudioBase64 = await this.blobToBase64(blob);
        } catch {
          // ignore
        }
        this.notify();
        return;
      }

      // Check if server already has a persisted master MP3 from a previous upload
      const serverCheck = await fetch('/api/studio/daniel-master-audio');
      if (serverCheck.ok && serverCheck.status === 200) {
        const contentType = serverCheck.headers.get('content-type') || '';
        if (contentType.includes('audio')) {
          const blob = await serverCheck.blob();
          if (blob.size > 256) {
            const filename =
              serverCheck.headers.get('x-audio-filename') || 'Soy s......area..mp3';
            await saveAudioToStorage(DANIEL_FISH_AUDIO_TRACK_ID, blob, filename);
            this.customAudioUrl = URL.createObjectURL(blob);
            this.customAudioFilename = filename;
            this.customAudioBase64 = await this.blobToBase64(blob);
            this.notify();
          }
        }
      }
    } catch (err) {
      console.warn('Could not load Daniel Fish Audio from storage:', err);
    }
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      hasCustomAudio: Boolean(this.customAudioUrl),
      customAudioFilename: this.customAudioFilename,
      activeSource: this.activeSource,
      voicePreset: this.selectedVoicePreset,
      alwaysUseMasterMp3: this.alwaysUseMasterMp3,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = {
      isSpeaking: this.isSpeaking,
      hasCustomAudio: Boolean(this.customAudioUrl),
      customAudioFilename: this.customAudioFilename,
      activeSource: this.activeSource,
      voicePreset: this.selectedVoicePreset,
      alwaysUseMasterMp3: this.alwaysUseMasterMp3,
    };
    this.listeners.forEach((cb) => cb(snapshot));
  }

  public getAutoSpeak(): boolean {
    return this.autoSpeakEnabled;
  }

  public setAutoSpeak(enabled: boolean): void {
    this.autoSpeakEnabled = enabled;
    localStorage.setItem('4haus_daniel_autospeak', enabled ? 'true' : 'false');
    if (!enabled) {
      this.stop();
    }
  }

  public getAlwaysUseMasterMp3(): boolean {
    return this.alwaysUseMasterMp3;
  }

  public setAlwaysUseMasterMp3(enabled: boolean): void {
    this.alwaysUseMasterMp3 = enabled;
    localStorage.setItem('4haus_daniel_always_master_mp3', enabled ? 'true' : 'false');
    this.notify();
  }

  public getReferenceId(): string {
    return this.selectedReferenceId;
  }

  public setReferenceId(refId: string): void {
    this.selectedReferenceId = refId.trim();
    localStorage.setItem('4haus_fish_reference_id', this.selectedReferenceId);
  }

  public getVoicePreset(): string {
    return this.selectedVoicePreset;
  }

  public setVoicePreset(presetId: string): void {
    this.selectedVoicePreset = presetId;
    localStorage.setItem('4haus_daniel_voice_preset', presetId);
    this.notify();
  }

  public hasCustomFishAudio(): boolean {
    return Boolean(this.customAudioUrl);
  }

  public getCustomAudioFilename(): string | null {
    return this.customAudioFilename;
  }

  /**
   * Saves the user's Fish Audio MP3 file ("Soy s......area..mp3") in IndexedDB
   * AND uploads it to the server so Fish Audio zero-shot cloning and server persistence work automatically.
   */
  public async uploadFishAudioMaster(file: File): Promise<void> {
    await saveAudioToStorage(DANIEL_FISH_AUDIO_TRACK_ID, file, file.name);
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }
    this.customAudioUrl = URL.createObjectURL(file);
    this.customAudioFilename = file.name;
    this.customAudioBase64 = await this.blobToBase64(file);
    this.notify();

    // Persist on backend server so it survives browser cache clears and powers zero-shot cloning
    try {
      await fetch('/api/studio/daniel-master-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          audioBase64: this.customAudioBase64,
          transcript: DANIEL_FISH_AUDIO_TRANSCRIPT,
        }),
      });
    } catch {
      // ignore if offline
    }

    await this.playFishAudioMaster();
  }

  public async clearFishAudioMaster(): Promise<void> {
    this.stop();
    await deleteAudioFromStorage(DANIEL_FISH_AUDIO_TRACK_ID);
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }
    this.customAudioUrl = null;
    this.customAudioBase64 = null;
    this.customAudioFilename = null;
    this.notify();
    try {
      await fetch('/api/studio/daniel-master-audio', { method: 'DELETE' });
    } catch {
      // ignore
    }
  }

  /**
   * Plays the exact Fish Audio MP3 uploaded by the user ("Soy su segundo cerebro autónomo, y me adapto a cualquier área.")
   */
  public async playFishAudioMaster(): Promise<boolean> {
    await this.initFromStorage();
    if (!this.customAudioUrl) return false;

    this.stop();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(this.customAudioUrl!);
        this.audioEl = audio;
        this.isSpeaking = true;
        this.activeSource = 'fish-master-mp3';
        this.notify();

        audio.onended = () => {
          this.isSpeaking = false;
          this.activeSource = null;
          this.notify();
          resolve(true);
        };

        audio.onerror = () => {
          this.isSpeaking = false;
          this.activeSource = null;
          this.notify();
          resolve(false);
        };

        audio.play().catch(() => {
          this.isSpeaking = false;
          this.activeSource = null;
          this.notify();
          resolve(false);
        });
      } catch {
        this.isSpeaking = false;
        this.activeSource = null;
        this.notify();
        resolve(false);
      }
    });
  }

  /**
   * Speaks any text:
   * 1. If the user uploaded their Fish Audio MP3 and either `alwaysUseMasterMp3` is enabled OR it's the signature phrase, plays the exact MP3.
   * 2. Otherwise calls `/api/studio/daniel-tts`, passing the user's reference audio for Fish Audio Zero-Shot voice cloning (or Neural Male Spanish MP3 if no Fish Audio API key is active).
   */
  public async speak(
    text: string,
    lang: 'es' | 'en' = 'es',
    options?: { preferMasterSample?: boolean }
  ): Promise<void> {
    await this.initFromStorage();
    this.stop();

    const cleanText = text.replace(/[*#_`~]/g, '').trim();
    if (!cleanText) return;

    const lower = cleanText.toLowerCase();
    const isGreetingOrIdentity =
      options?.preferMasterSample ||
      this.alwaysUseMasterMp3 ||
      lower.includes('segundo cerebro') ||
      lower.includes('adapto a cualquier área');

    if (this.customAudioUrl && isGreetingOrIdentity) {
      const played = await this.playFishAudioMaster();
      if (played) {
        return;
      }
    }

    try {
      this.isSpeaking = true;
      this.activeSource = 'neural-male-mp3';
      this.notify();

      const res = await fetch('/api/studio/daniel-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          lang,
          referenceId: this.selectedReferenceId || undefined,
          referenceAudioBase64: this.customAudioBase64 || undefined,
          referenceText: DANIEL_FISH_AUDIO_TRANSCRIPT,
          voicePreset: lang === 'en' ? 'en-US-AndrewMultilingualNeural' : this.selectedVoicePreset,
        }),
      });

      if (res.ok && res.status !== 204) {
        const engineUsed = res.headers.get('X-Voice-Engine') || '';
        const blob = await res.blob();
        if (blob.size > 256) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          this.audioEl = audio;
          this.isSpeaking = true;
          this.activeSource = engineUsed.includes('fish') ? 'fish-api-tts' : 'neural-male-mp3';
          this.notify();

          audio.onended = () => {
            URL.revokeObjectURL(url);
            this.isSpeaking = false;
            this.activeSource = null;
            this.notify();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            this.isSpeaking = false;
            this.activeSource = null;
            this.notify();
          };
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.error('Error playing server neural male TTS:', err);
    }

    if (this.customAudioUrl) {
      await this.playFishAudioMaster();
      return;
    }

    this.isSpeaking = false;
    this.activeSource = null;
    this.notify();
  }

  public stop(): void {
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {
        // ignore
      }
      this.audioEl = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.activeSource = null;
      this.notify();
    }
  }
}

export const danielVoice = new DanielVoiceEngine();
