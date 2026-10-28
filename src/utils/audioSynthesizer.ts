/**
 * Real Web Audio API synthesizer for the 4haus MusicBox.
 * Creates authentic analog/vinyl harmonic soundscapes and recognizable melodic themes
 * for The Beach Boys, California classics, and vintage decades.
 */

interface TrackMelodyConfig {
  name: string;
  wave: OscillatorType;
  tempo: number;
  filterFreq: number;
  melodyNotes: number[]; // Frequencies in Hz
  bassNotes: number[];
  chords: number[][];
}

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private step: number = 0;

  public initContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        
        // Compressor to avoid distortion and boost quiet signals for laptop/phone speakers
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

        // Chain: masterGain -> compressor -> analyser -> destination
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      return this.ctx;
    } catch (e) {
      console.error('Failed to initialize AudioContext:', e);
      return null;
    }
  }

  /**
   * Diagnostic test sound to immediately verify device audio output
   */
  public testSound(): void {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.65, now);

    // Warm three-note chime: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.0);
    });
  }

  public playTrack(trackId: string, decade: string = '60s') {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.stopSequencer();
    this.step = 0;

    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.65, now);

    const trackConfigs: Record<string, TrackMelodyConfig> = {
      'in-my-room': {
        name: 'In My Room',
        wave: 'sine',
        tempo: 450, // ms per step
        filterFreq: 1100,
        // Iconic melody: "There's a world where I can go..."
        melodyNotes: [
          261.63, 329.63, 392.00, 329.63, // C - E - G - E
          349.23, 329.63, 293.66, 261.63, // F - E - D - C
          293.66, 329.63, 349.23, 392.00, // D - E - F - G
          440.00, 392.00, 329.63, 261.63, // A - G - E - C
        ],
        bassNotes: [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00],
        chords: [
          [261.63, 329.63, 392.00, 523.25], // C
          [164.81, 246.94, 329.63, 392.00], // Em
          [174.61, 220.00, 261.63, 349.23], // F
          [196.00, 246.94, 293.66, 349.23], // G7
        ],
      },
      'california-dreamin': {
        name: "California Dreamin'",
        wave: 'triangle',
        tempo: 380,
        filterFreq: 1400,
        // Iconic acoustic intro & flute lead
        melodyNotes: [
          440.00, 523.25, 587.33, 659.25, // A4 - C5 - D5 - E5
          698.46, 659.25, 587.33, 554.37, // F5 - E5 - D5 - C#5
          440.00, 392.00, 349.23, 329.63, // A4 - G4 - F4 - E4
          349.23, 392.00, 440.00, 554.37, // F4 - G4 - A4 - C#5
        ],
        bassNotes: [146.83, 130.81, 116.54, 110.00], // Dm - C - Bb - A
        chords: [
          [146.83, 220.00, 261.63, 349.23], // Dm
          [130.81, 196.00, 261.63, 329.63], // C
          [116.54, 174.61, 233.08, 293.66], // Bb
          [110.00, 164.81, 220.00, 277.18], // A
        ],
      },
      'surfin-usa': {
        name: "Surfin' U.S.A.",
        wave: 'sawtooth',
        tempo: 280,
        filterFreq: 1800,
        // Chuck Berry surf rock guitar lick
        melodyNotes: [
          261.63, 329.63, 392.00, 440.00, // C - E - G - A
          466.16, 440.00, 392.00, 329.63, // Bb - A - G - E
          349.23, 440.00, 523.25, 587.33, // F - A - C - D
          392.00, 493.88, 587.33, 659.25, // G - B - D - E
        ],
        bassNotes: [130.81, 130.81, 174.61, 196.00],
        chords: [
          [261.63, 329.63, 392.00],
          [174.61, 220.00, 261.63],
          [196.00, 246.94, 293.66],
          [261.63, 329.63, 392.00],
        ],
      },
      'i-get-around': {
        name: 'I Get Around',
        wave: 'triangle',
        tempo: 320,
        filterFreq: 1500,
        melodyNotes: [
          392.00, 392.00, 440.00, 392.00, // G - G - A - G
          329.63, 293.66, 392.00, 440.00, // E - D - G - A
          493.88, 493.88, 523.25, 493.88, // B - B - C - B
          440.00, 392.00, 293.66, 392.00, // A - G - D - G
        ],
        bassNotes: [98.00, 82.41, 110.00, 146.83], // G - E - A - D
        chords: [
          [196.00, 246.94, 293.66, 392.00],
          [164.81, 207.65, 246.94, 329.63],
          [220.00, 261.63, 329.63, 440.00],
          [146.83, 220.00, 293.66, 369.99],
        ],
      },
      'god-only-knows': {
        name: 'God Only Knows',
        wave: 'sine',
        tempo: 420,
        filterFreq: 1200,
        // French horn intro & vocal lead
        melodyNotes: [
          220.00, 277.18, 329.63, 415.30, // A3 - C#4 - E4 - G#4
          369.99, 329.63, 293.66, 277.18, // F#4 - E4 - D4 - C#4
          220.00, 277.18, 329.63, 369.99, // A - C# - E - F#
          329.63, 293.66, 246.94, 220.00, // E - D - B - A
        ],
        bassNotes: [110.00, 103.83, 92.50, 82.41],
        chords: [
          [220.00, 277.18, 329.63, 440.00], // A
          [207.65, 246.94, 329.63, 415.30], // E/G#
          [185.00, 220.00, 277.18, 329.63], // F#m7
          [146.83, 220.00, 293.66, 369.99], // D
        ],
      },
      'god-only-knows-vocal': {
        name: 'God Only Knows (Vocal Master)',
        wave: 'sine',
        tempo: 460,
        filterFreq: 1000,
        melodyNotes: [
          440.00, 554.37, 659.25, 554.37, // A4 - C#5 - E5 - C#5
          493.88, 440.00, 369.99, 440.00, // B4 - A4 - F#4 - A4
          329.63, 440.00, 554.37, 659.25, // E4 - A4 - C#5 - E5
          739.99, 659.25, 554.37, 440.00, // F#5 - E5 - C#5 - A4
        ],
        bassNotes: [110.00, 146.83, 164.81, 110.00],
        chords: [
          [220.00, 277.18, 329.63, 440.00, 554.37],
          [185.00, 220.00, 277.18, 329.63, 440.00],
          [146.83, 220.00, 293.66, 369.99, 440.00],
          [164.81, 246.94, 329.63, 392.00, 493.88],
        ],
      },
      'wouldnt-it-be-nice': {
        name: "Wouldn't It Be Nice",
        wave: 'triangle',
        tempo: 320,
        filterFreq: 1600,
        // 12-string mandolin harp arpeggio
        melodyNotes: [
          349.23, 440.00, 523.25, 698.46, // F4 - A4 - C5 - F5
          523.25, 440.00, 349.23, 293.66, // C5 - A4 - F4 - D4
          392.00, 466.16, 587.33, 783.99, // G4 - Bb4 - D5 - G5
          587.33, 466.16, 392.00, 349.23, // D5 - Bb4 - G4 - F4
        ],
        bassNotes: [174.61, 174.61, 196.00, 130.81],
        chords: [
          [174.61, 261.63, 349.23, 440.00], // F
          [174.61, 233.08, 293.66, 349.23], // Bb/F
          [196.00, 233.08, 293.66, 349.23], // Gm7
          [130.81, 196.00, 261.63, 329.63], // C7
        ],
      },
      'pet-sounds-inst': {
        name: 'Pet Sounds (Instrumental)',
        wave: 'triangle',
        tempo: 360,
        filterFreq: 1300,
        melodyNotes: [
          233.08, 293.66, 349.23, 466.16, // Bb
          392.00, 349.23, 293.66, 233.08,
          311.13, 392.00, 466.16, 622.25, // Eb
          466.16, 392.00, 349.23, 293.66,
        ],
        bassNotes: [116.54, 155.56, 174.61, 116.54],
        chords: [
          [233.08, 293.66, 349.23, 466.16],
          [155.56, 233.08, 311.13, 392.00],
          [174.61, 220.00, 261.63, 349.23],
          [233.08, 293.66, 349.23, 466.16],
        ],
      },
      'caroline-no': {
        name: 'Caroline, No',
        wave: 'sine',
        tempo: 480,
        filterFreq: 950,
        melodyNotes: [
          261.63, 329.63, 392.00, 493.88, // Cmaj7
          440.00, 349.23, 329.63, 293.66,
          220.00, 261.63, 329.63, 392.00,
          349.23, 293.66, 261.63, 246.94,
        ],
        bassNotes: [130.81, 174.61, 146.83, 196.00],
        chords: [
          [130.81, 196.00, 246.94, 329.63],
          [174.61, 220.00, 261.63, 329.63],
          [146.83, 220.00, 261.63, 349.23],
          [196.00, 246.94, 293.66, 349.23],
        ],
      },
      'classical-sonata': {
        name: 'Chamber Sonata in B Minor',
        wave: 'triangle',
        tempo: 360,
        filterFreq: 1400,
        // Baroque flute and string sonata in B minor
        melodyNotes: [
          493.88, 440.00, 392.00, 369.99, // B4 - A4 - G4 - F#4
          329.63, 369.99, 392.00, 493.88, // E4 - F#4 - G4 - B4
          587.33, 554.37, 493.88, 440.00, // D5 - C#5 - B4 - A4
          369.99, 440.00, 493.88, 739.99, // F#4 - A4 - B4 - F#5
        ],
        bassNotes: [123.47, 164.81, 185.00, 123.47], // Bm - Em - F# - Bm
        chords: [
          [123.47, 185.00, 246.94, 293.66, 369.99],
          [164.81, 196.00, 246.94, 329.63, 392.00],
          [185.00, 233.08, 277.18, 369.99, 466.16],
          [123.47, 185.00, 246.94, 293.66, 369.99],
        ],
      },
      'allegro-strings': {
        name: 'Allegro for Strings & Flute',
        wave: 'triangle',
        tempo: 260,
        filterFreq: 1700,
        // Energetic baroque concerto in D major
        melodyNotes: [
          587.33, 440.00, 587.33, 739.99, // D5 - A4 - D5 - F#5
          880.00, 739.99, 587.33, 440.00, // A5 - F#5 - D5 - A4
          493.88, 587.33, 739.99, 987.77, // B4 - D5 - F#5 - B5
          880.00, 739.99, 659.25, 587.33, // A5 - F#5 - E5 - D5
        ],
        bassNotes: [146.83, 220.00, 123.47, 196.00],
        chords: [
          [146.83, 220.00, 293.66, 369.99],
          [220.00, 277.18, 329.63, 440.00],
          [123.47, 185.00, 246.94, 369.99],
          [196.00, 246.94, 293.66, 392.00],
        ],
      },
    };

    const config = trackConfigs[trackId];
    if (!config) {
      this.playDecade(decade);
      return;
    }

    const stepLoop = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const currentTime = this.ctx.currentTime;
      const melodyFreq = config.melodyNotes[this.step % config.melodyNotes.length];
      const bassFreq = config.bassNotes[Math.floor(this.step / 4) % config.bassNotes.length];
      const chord = config.chords[Math.floor(this.step / 4) % config.chords.length];

      // 1. Play Lead Melody Note (Crisp & clearly audible)
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      const melFilter = this.ctx.createBiquadFilter();

      melOsc.type = config.wave;
      melOsc.frequency.setValueAtTime(melodyFreq, currentTime);

      melFilter.type = 'lowpass';
      melFilter.frequency.setValueAtTime(config.filterFreq, currentTime);

      melGain.gain.setValueAtTime(0.001, currentTime);
      melGain.gain.linearRampToValueAtTime(0.35, currentTime + 0.03);
      melGain.gain.exponentialRampToValueAtTime(0.001, currentTime + (config.tempo / 1000) * 0.95);

      melOsc.connect(melFilter);
      melFilter.connect(melGain);
      melGain.connect(this.masterGain);

      melOsc.start(currentTime);
      melOsc.stop(currentTime + (config.tempo / 1000) * 1.0);

      // 2. Play Bass Note every 4 steps (On downbeat)
      if (this.step % 4 === 0 && bassFreq) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, currentTime);

        bassGain.gain.setValueAtTime(0.001, currentTime);
        bassGain.gain.linearRampToValueAtTime(0.28, currentTime + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, currentTime + (config.tempo / 1000) * 3.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);

        bassOsc.start(currentTime);
        bassOsc.stop(currentTime + (config.tempo / 1000) * 3.8);

        // Soft chord pad on downbeat
        chord?.forEach((f, i) => {
          if (!this.ctx || !this.masterGain) return;
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();

          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(f, currentTime);

          chordGain.gain.setValueAtTime(0.001, currentTime);
          chordGain.gain.linearRampToValueAtTime(0.08 / (i + 1), currentTime + 0.1);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, currentTime + (config.tempo / 1000) * 3.8);

          chordOsc.connect(chordGain);
          chordGain.connect(this.masterGain);

          chordOsc.start(currentTime);
          chordOsc.stop(currentTime + (config.tempo / 1000) * 4.0);
        });
      }

      this.step++;
      this.timerId = window.setTimeout(stepLoop, config.tempo);
    };

    stepLoop();
  }

  public playDecade(decade: string) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.stopSequencer();
    this.step = 0;

    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.65, now);

    const chords = this.getDecadeChords(decade);
    const tempo = 2400;

    const decadeLoop = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const currentTime = this.ctx.currentTime;
      const currentChord = chords[this.step % chords.length];
      this.step++;

      currentChord.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = decade === '80s' ? 'sawtooth' : decade === '70s' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), currentTime + idx * 0.08 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + (tempo / 1000) * 1.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(currentTime + idx * 0.08);
        osc.stop(currentTime + (tempo / 1000) * 1.2);
      });

      this.timerId = window.setTimeout(decadeLoop, tempo);
    };

    decadeLoop();
  }

  private getDecadeChords(decade: string): number[][] {
    switch (decade) {
      case '40s':
        return [
          [261.63, 329.63, 392.00, 466.16],
          [293.66, 369.99, 440.00, 523.25],
          [196.00, 246.94, 293.66, 349.23],
          [261.63, 329.63, 392.00, 466.16],
        ];
      case '50s':
        return [
          [130.81, 196.00, 246.94, 311.13],
          [146.83, 220.00, 277.18, 349.23],
          [174.61, 261.63, 329.63, 415.30],
          [196.00, 293.66, 369.99, 466.16],
        ];
      case '60s':
        return [
          [261.63, 329.63, 392.00, 523.25],
          [164.81, 246.94, 329.63, 392.00],
          [174.61, 220.00, 261.63, 349.23],
          [196.00, 246.94, 293.66, 392.00],
        ];
      case '70s':
        return [
          [146.83, 220.00, 277.18, 349.23],
          [130.81, 196.00, 246.94, 329.63],
          [174.61, 220.00, 261.63, 349.23],
          [196.00, 246.94, 293.66, 349.23],
        ];
      case '80s':
        return [
          [220.00, 261.63, 329.63, 440.00],
          [174.61, 220.00, 261.63, 349.23],
          [130.81, 164.81, 196.00, 261.63],
          [196.00, 246.94, 293.66, 392.00],
        ];
      default:
        return [
          [261.63, 329.63, 392.00, 523.25],
          [196.00, 246.94, 293.66, 392.00],
          [220.00, 261.63, 329.63, 440.00],
          [174.61, 220.00, 261.63, 349.23],
        ];
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopSequencer();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      setTimeout(() => {
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
        }
      }, 200);
    }
  }

  private stopSequencer() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public getPlaybackState(): boolean {
    return this.isPlaying;
  }
}

export const audioSynth = new AudioSynthesizer();
