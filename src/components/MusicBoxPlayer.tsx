import { useState, useEffect, useRef, type ChangeEvent, type DragEvent, type MouseEvent } from 'react';
import { 
  Play, 
  Pause, 
  Disc3, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Music, 
  SkipBack, 
  SkipForward, 
  Upload, 
  CheckCircle2,
  Trash2,
  HelpCircle,
  FolderDown,
  Volume1,
  Radio
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynthesizer';
import { 
  saveAudioToStorage, 
  getAllStoredAudios, 
  deleteAudioFromStorage, 
  matchFileNameToTrackId 
} from '../utils/audioStorage';
import { DecadeTrack, Language } from '../types';

interface MusicBoxPlayerProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

type TabCategory = 'california' | '60s' | 'classical' | '40s' | '50s' | '70s' | '80s' | '90s' | '00s';

export function MusicBoxPlayer({ lang, isOpen, onClose }: MusicBoxPlayerProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('california');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [userAudioUrls, setUserAudioUrls] = useState<Record<string, string>>({});
  const [storedFileNames, setStoredFileNames] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [testSoundPlayed, setTestSoundPlayed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const targetTrackForUploadRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // The 11 master tracks requested by the user
  const californiaTracks: DecadeTrack[] = [
    { 
      id: 'in-my-room', 
      title: 'In My Room', 
      artist: 'The Beach Boys', 
      album: 'Surfer Girl',
      year: '1963', 
      decade: '60s', 
      duration: '2:14',
      description: 'Brian Wilson introspective sanctuary ballad with lush 4-part vocal harmonies.', 
      lyricsSnippet: '"There\'s a world where I can go and tell my secrets to... In my room"',
      frequencyPreset: 432 
    },
    { 
      id: 'california-dreamin', 
      title: 'California Dreamin\'', 
      artist: 'The Mamas & the Papas', 
      album: 'If You Can Believe Your Eyes and Ears',
      year: '1965', 
      decade: '60s', 
      duration: '2:42',
      description: 'Iconic sunshine folk-rock anthem featuring 12-string acoustic guitar and alto flute solo.', 
      lyricsSnippet: '"All the leaves are brown, and the sky is gray... California Dreamin\' on such a winter\'s day"',
      frequencyPreset: 440 
    },
    { 
      id: 'surfin-usa', 
      title: 'Surfin\' U.S.A.', 
      artist: 'The Beach Boys', 
      album: 'Surfin\' U.S.A.',
      year: '1963', 
      decade: '60s', 
      duration: '2:29',
      description: 'The defining California surf rock anthem that conquered global airwaves.', 
      lyricsSnippet: '"If everybody had an ocean across the U.S.A., then everybody\'d be surfin\'"',
      frequencyPreset: 440 
    },
    { 
      id: 'i-get-around', 
      title: 'I Get Around', 
      artist: 'The Beach Boys', 
      album: 'All Summer Long',
      year: '1964', 
      decade: '60s', 
      duration: '2:13',
      description: 'First #1 Billboard hit with rapid-fire vocal counterpoint and driving beat.', 
      lyricsSnippet: '"Round round get around, I get around... I gotta find a new place where the kids are hip"',
      frequencyPreset: 440 
    },
    { 
      id: 'god-only-knows', 
      title: 'God Only Knows', 
      artist: 'The Beach Boys', 
      album: 'Pet Sounds',
      year: '1966', 
      decade: '60s', 
      duration: '2:58',
      description: 'Orchestral baroque pop masterpiece with French horn, accordion, and celestial round canon.', 
      lyricsSnippet: '"God only knows what I\'d be without you... If you should ever leave me"',
      frequencyPreset: 432 
    },
    { 
      id: 'wouldnt-it-be-nice', 
      title: 'Wouldn\'t It Be Nice', 
      artist: 'The Beach Boys', 
      album: 'Pet Sounds',
      year: '1966', 
      decade: '60s', 
      duration: '2:35',
      description: 'Sparkling 12-string mandolin intro, Wall of Sound symphonic pop, and hopeful romanticism.', 
      lyricsSnippet: '"Wouldn\'t it be nice if we were older, then we wouldn\'t have to wait so long"',
      frequencyPreset: 440 
    },
    { 
      id: 'god-only-knows-vocal', 
      title: 'God Only Knows (Vocal Master Take)', 
      artist: 'The Beach Boys', 
      album: 'The Pet Sounds Sessions',
      year: '1966', 
      decade: '60s', 
      duration: '2:58',
      description: 'Pure Carl Wilson lead and celestial Brian Wilson backing harmonies isolated in high fidelity.', 
      lyricsSnippet: '"I may not always love you, but as long as there are stars above you..."',
      frequencyPreset: 432 
    },
    { 
      id: 'pet-sounds-inst', 
      title: 'Pet Sounds (Instrumental Master)', 
      artist: 'The Beach Boys & The Wrecking Crew', 
      album: 'Pet Sounds',
      year: '1966', 
      decade: '60s', 
      duration: '2:23',
      description: 'Brian Wilson exotica instrumental recorded with bongos, güiro, upright bass, and tenor sax.', 
      lyricsSnippet: 'Instrumental track showcasing The Wrecking Crew\'s legendary session musicians.',
      frequencyPreset: 440 
    },
    { 
      id: 'caroline-no', 
      title: 'Caroline, No', 
      artist: 'The Beach Boys / Brian Wilson', 
      album: 'Pet Sounds',
      year: '1966', 
      decade: '60s', 
      duration: '2:18',
      description: 'Melancholic masterpiece with Sparkletts water jug percussion, harpsichord, and flutes.', 
      lyricsSnippet: '"Where did your long hair go? Where is the girl I used to know?"',
      frequencyPreset: 432 
    },
    { 
      id: 'classical-sonata', 
      title: 'Chamber Sonata in B Minor', 
      artist: 'Classical Chamber Orchestra', 
      album: 'Baroque & Classical Chamber Suite',
      year: 'Classical', 
      decade: 'classical', 
      duration: '8:42',
      description: 'Virtuosic 8-minute classical chamber suite with violin, cello continuo, and pastoral flute.', 
      lyricsSnippet: 'Multi-movement baroque sonata performed by classical string quartet and flute.',
      frequencyPreset: 432 
    },
    { 
      id: 'allegro-strings', 
      title: 'Allegro for Strings & Flute', 
      artist: 'Classical Chamber Ensemble', 
      album: 'Baroque Concertos',
      year: 'Classical', 
      decade: 'classical', 
      duration: '2:45',
      description: 'Lively baroque chamber allegro with intricate string counterpoint and harpsichord.', 
      lyricsSnippet: 'Baroque allegro concerto movement with brilliant violin cadenzas.',
      frequencyPreset: 440 
    }
  ];

  const tracksByDecade: Record<TabCategory, DecadeTrack[]> = {
    california: californiaTracks,
    '60s': [
      ...californiaTracks.filter(t => t.decade === '60s'),
      { id: '60-1', title: 'Here Comes the Sun', artist: 'The Beatles', year: '1969', decade: '60s', duration: '3:05', description: 'Abbey Road acoustic warmth and hope', frequencyPreset: 432 },
      { id: '60-2', title: 'Good Vibrations', artist: 'The Beach Boys', year: '1966', decade: '60s', duration: '3:37', description: 'Pocket symphony with lush analog harmonies', frequencyPreset: 440 },
      { id: '60-3', title: 'What a Wonderful World', artist: 'Louis Armstrong', year: '1967', decade: '60s', duration: '2:21', description: 'Pure heartfelt classic vocal', frequencyPreset: 432 },
    ],
    classical: [
      ...californiaTracks.filter(t => t.decade === 'classical'),
      { id: 'cls-1', title: 'Air on the G String', artist: 'J.S. Bach', year: 'Classical', decade: 'classical', duration: '5:12', description: 'Timeless baroque orchestral suite no. 3', frequencyPreset: 432 },
      { id: 'cls-2', title: 'Canon in D Major', artist: 'Johann Pachelbel', year: 'Classical', decade: 'classical', duration: '4:45', description: 'Sacred string counterpoint and basso continuo', frequencyPreset: 432 },
    ],
    '40s': [
      { id: '40-1', title: 'In the Mood', artist: 'Glenn Miller Orchestra', year: '1941', decade: '40s', duration: '3:36', description: 'Big band swing rhythm & brass harmonies', frequencyPreset: 440 },
      { id: '40-2', title: 'God Bless the Child', artist: 'Billie Holiday', year: '1942', decade: '40s', duration: '2:55', description: 'Timeless soulful jazz ballad', frequencyPreset: 432 },
      { id: '40-3', title: 'Take the "A" Train', artist: 'Duke Ellington', year: '1941', decade: '40s', duration: '2:54', description: 'Classic Harlem jazz standard', frequencyPreset: 440 },
    ],
    '50s': [
      { id: '50-1', title: 'Fly Me to the Moon', artist: 'Frank Sinatra', year: '1954', decade: '50s', duration: '2:27', description: 'The golden voice of mid-century vocal jazz', frequencyPreset: 440 },
      { id: '50-2', title: 'So What', artist: 'Miles Davis', year: '1959', decade: '50s', duration: '9:22', description: 'Kind of Blue modal jazz revolution', frequencyPreset: 432 },
      { id: '50-3', title: 'Johnny B. Goode', artist: 'Chuck Berry', year: '1958', decade: '50s', duration: '2:40', description: 'Pioneering rock & roll electric guitar chords', frequencyPreset: 440 },
    ],
    '70s': [
      { id: '70-1', title: 'Breathe (In the Air)', artist: 'Pink Floyd', year: '1973', decade: '70s', duration: '2:43', description: 'Dark Side of the Moon atmospheric slide guitar', frequencyPreset: 432 },
      { id: '70-2', title: 'Superstition', artist: 'Stevie Wonder', year: '1972', decade: '70s', duration: '4:26', description: 'Iconic clavinet funk groove', frequencyPreset: 440 },
      { id: '70-3', title: 'Stayin\' Alive', artist: 'Bee Gees', year: '1977', decade: '70s', duration: '4:45', description: 'Disco era falsetto and bass line', frequencyPreset: 440 },
    ],
    '80s': [
      { id: '80-1', title: 'Billie Jean', artist: 'Michael Jackson', year: '1982', decade: '80s', duration: '4:54', description: 'Quincy Jones analog drum machine & bass groove', frequencyPreset: 440 },
      { id: '80-2', title: 'Blue Monday', artist: 'New Order', year: '1983', decade: '80s', duration: '7:29', description: 'Groundbreaking synthpop sequencing', frequencyPreset: 440 },
      { id: '80-3', title: 'Under Pressure', artist: 'Queen & David Bowie', year: '1981', decade: '80s', duration: '4:08', description: 'Legendary dual vocal masterwork', frequencyPreset: 440 },
    ],
    '90s': [
      { id: '90-1', title: 'Teardrop', artist: 'Massive Attack', year: '1998', decade: '90s', duration: '5:31', description: 'Bristol sound trip-hop heartbeat and harpsichord', frequencyPreset: 432 },
      { id: '90-2', title: 'Smells Like Teen Spirit', artist: 'Nirvana', year: '1991', decade: '90s', duration: '5:01', description: 'Grunge anthemic power chords', frequencyPreset: 440 },
      { id: '90-3', title: 'Around the World', artist: 'Daft Punk', year: '1997', decade: '90s', duration: '7:09', description: 'French touch talkbox bass progression', frequencyPreset: 440 },
    ],
    '00s': [
      { id: '00-1', title: 'Clocks', artist: 'Coldplay', year: '2002', decade: '00s', duration: '5:07', description: 'Hypnotic piano arpeggio and atmospheric rock', frequencyPreset: 440 },
      { id: '00-2', title: 'Hey Ya!', artist: 'Outkast', year: '2003', decade: '00s', duration: '3:55', description: 'Genre-defying funk pop classic', frequencyPreset: 440 },
      { id: '00-3', title: 'Seven Nation Army', artist: 'The White Stripes', year: '2003', decade: '00s', duration: '3:51', description: 'Iconic semi-acoustic bass riff', frequencyPreset: 440 },
    ]
  };

  const currentTracks = tracksByDecade[selectedCategory] || [];
  const currentTrack = currentTracks[activeTrackIndex] || currentTracks[0] || californiaTracks[0];

  const categories: { id: TabCategory; label: string; badge?: string }[] = [
    { id: 'california', label: lang === 'en' ? '🌴 California & Classics' : '🌴 California & Clásicos', badge: '11 Songs' },
    { id: '60s', label: '60s Golden Era' },
    { id: 'classical', label: 'Classical & Chamber' },
    { id: '40s', label: '40s Swing' },
    { id: '50s', label: '50s Jazz' },
    { id: '70s', label: '70s Rhodes' },
    { id: '80s', label: '80s Synth' },
    { id: '90s', label: '90s Lo-Fi' },
    { id: '00s', label: '00s Shimmer' },
  ];

  // Load all locally stored audio tracks from IndexedDB upon initial render
  useEffect(() => {
    getAllStoredAudios().then((stored) => {
      const urls: Record<string, string> = {};
      const fileNames: Record<string, string> = {};
      Object.entries(stored).forEach(([tId, val]) => {
        urls[tId] = val.url;
        fileNames[tId] = val.filename;
      });
      setUserAudioUrls(urls);
      setStoredFileNames(fileNames);
    });
  }, []);

  const hasAudioFile = !!userAudioUrls[currentTrack?.id];

  const startPlayback = (track: DecadeTrack) => {
    audioSynth.initContext();
    setIsPlaying(true);
    setCurrentTime(0);

    const audioUrl = userAudioUrls[track.id];
    if (audioUrl && audioRef.current) {
      audioSynth.stop();
      audioRef.current.src = audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML5 audio play blocked, falling back to WebAudio synth:', err);
          audioSynth.playTrack(track.id, track.decade);
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioSynth.playTrack(track.id, track.decade);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    audioSynth.stop();
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentTrack);
    }
  };

  const handleCategoryChange = (cat: TabCategory) => {
    setSelectedCategory(cat);
    setActiveTrackIndex(0);
    const newTrack = tracksByDecade[cat]?.[0];
    if (isPlaying && newTrack) {
      startPlayback(newTrack);
    }
  };

  const handleTrackSelect = (index: number) => {
    setActiveTrackIndex(index);
    const selected = currentTracks[index];
    if (selected) {
      startPlayback(selected);
    }
  };

  const handleNextTrack = () => {
    if (currentTracks.length === 0) return;
    const nextIndex = (activeTrackIndex + 1) % currentTracks.length;
    handleTrackSelect(nextIndex);
  };

  const handlePrevTrack = () => {
    if (currentTracks.length === 0) return;
    const prevIndex = (activeTrackIndex - 1 + currentTracks.length) % currentTracks.length;
    handleTrackSelect(prevIndex);
  };

  // Process files (either from drag & drop or file input)
  const processUploadedFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    let matchedCount = 0;
    const newUrls: Record<string, string> = { ...userAudioUrls };
    const newFileNames: Record<string, string> = { ...storedFileNames };

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|flac|aac|wma)$/i)) {
        continue;
      }

      // Try automatic mapping based on filename
      let targetTrackId = matchFileNameToTrackId(file.name);

      // If only 1 file and targeted to a specific track or current track
      if (!targetTrackId) {
        if (targetTrackForUploadRef.current) {
          targetTrackId = targetTrackForUploadRef.current;
        } else if (fileList.length === 1 && currentTrack) {
          targetTrackId = currentTrack.id;
        }
      }

      if (targetTrackId) {
        matchedCount++;
        const blobUrl = URL.createObjectURL(file);
        newUrls[targetTrackId] = blobUrl;
        newFileNames[targetTrackId] = file.name;

        // Persist into IndexedDB
        await saveAudioToStorage(targetTrackId, file, file.name);
      }
    }

    targetTrackForUploadRef.current = null;
    setUserAudioUrls(newUrls);
    setStoredFileNames(newFileNames);

    if (matchedCount > 0) {
      const msg = lang === 'en' 
        ? `✅ ${matchedCount} audio file(s) saved & ready in MusicBox!`
        : `✅ ¡${matchedCount} archivo(s) de audio guardados y listos en MusicBox!`;
      setUploadNotice(msg);
      setTimeout(() => setUploadNotice(null), 5000);

      // If current track received an audio file, play it
      if (currentTrack && newUrls[currentTrack.id]) {
        startPlayback(currentTrack);
      }
    } else {
      const msg = lang === 'en'
        ? `Linked "${fileList[0].name}" to current track "${currentTrack?.title}".`
        : `Vinculado "${fileList[0].name}" a la pista "${currentTrack?.title}".`;
      setUploadNotice(msg);
      setTimeout(() => setUploadNotice(null), 4000);
    }
  };

  const handleBulkFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
    }
  };

  const handleSingleTrackUpload = (trackId: string) => {
    targetTrackForUploadRef.current = trackId;
    singleFileInputRef.current?.click();
  };

  const handleDeleteTrackAudio = async (e: MouseEvent, trackId: string) => {
    e.stopPropagation();
    await deleteAudioFromStorage(trackId);
    setUserAudioUrls(prev => {
      const copy = { ...prev };
      delete copy[trackId];
      return copy;
    });
    setStoredFileNames(prev => {
      const copy = { ...prev };
      delete copy[trackId];
      return copy;
    });
    if (currentTrack?.id === trackId && isPlaying) {
      stopPlayback();
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleTestSound = () => {
    audioSynth.testSound();
    setTestSoundPlayed(true);
    setTimeout(() => setTestSoundPlayed(false), 2000);
  };

  // Timer simulation for synthetic playback progress
  useEffect(() => {
    if (isPlaying && !hasAudioFile) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, hasAudioFile]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      audioSynth.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Hidden native audio element for user-uploaded MP3/audio files */}
      <audio 
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={handleNextTrack}
        className="hidden"
      />

      {/* Hidden file inputs */}
      <input 
        ref={bulkFileInputRef}
        type="file" 
        accept="audio/*" 
        multiple 
        onChange={handleBulkFileInputChange}
        className="hidden" 
      />

      <input 
        ref={singleFileInputRef}
        type="file" 
        accept="audio/*" 
        onChange={handleBulkFileInputChange}
        className="hidden" 
      />

      <div className={`relative w-full max-w-3xl rounded-[28px] sm:rounded-[36px] bg-[#0c0c0f] border transition-all duration-300 p-5 sm:p-7 shadow-[0_25px_90px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] ${
        isDragging ? 'border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]' : 'border-white/15'
      }`}>
        
        {/* Background glow ambiance */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Drag Overlay visual */}
        {isDragging && (
          <div className="absolute inset-0 z-30 bg-amber-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-amber-400 rounded-[28px]">
            <FolderDown className="w-16 h-16 text-amber-300 animate-bounce mb-3" />
            <h4 className="text-xl font-bold text-white mb-1">
              {lang === 'en' ? "Drop your audio files here!" : "¡Suelta tus archivos de audio aquí!"}
            </h4>
            <p className="text-sm text-amber-200/90 max-w-md">
              {lang === 'en' 
                ? "Drop all 11 MP3/audio files at once. They will be automatically mapped to The Beach Boys tracks and saved permanently in your browser!"
                : "Suelta los 11 archivos MP3/audio a la vez. Se enlazarán automáticamente a las canciones de The Beach Boys y quedarán guardados en tu navegador."}
            </p>
          </div>
        )}

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 mb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-inner">
              <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lang === 'en' ? "MusicBox — Vintage Golden Masters" : "MusicBox — Discos de Oro & Vinilos"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-medium">
                  {californiaTracks.length} Tracks
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {lang === 'en' 
                  ? "The Beach Boys, California Dreamin', & Classical Chamber Suite" 
                  : "The Beach Boys, California Dreamin' y Suite de Cámara Clásica"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Speaker Sound Test */}
            <button
              onClick={handleTestSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all active:scale-95 cursor-pointer ${
                testSoundPlayed 
                  ? 'bg-amber-400 text-black border-amber-300 font-bold' 
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white'
              }`}
              title={lang === 'en' ? "Test Speaker Output & Volume" : "Probar Salida de Audio y Altavoces"}
            >
              <Volume1 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">
                {testSoundPlayed ? (lang === 'en' ? "Sound OK!" : "¡Sonido OK!") : (lang === 'en' ? "Test Sound" : "Probar Sonido")}
              </span>
            </button>

            {/* Bulk Upload Button */}
            <button
              onClick={() => bulkFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/40 text-amber-200 hover:text-white text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
              title={lang === 'en' ? "Select MP3/Audio files from your computer" : "Seleccionar archivos MP3/Audio de tu ordenador"}
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-medium">
                {lang === 'en' ? "Upload MP3s" : "Subir MP3s"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Notification Toast Banner */}
        {uploadNotice && (
          <div className="relative z-20 mb-3 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span>{uploadNotice}</span>
            <button onClick={() => setUploadNotice(null)} className="text-amber-300 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Informative Guidance Ribbon */}
        <div className="relative z-10 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              {lang === 'en' 
                ? "Double audio engine: Plays your uploaded MP3 files in HQ, or the built-in melodic synthesizer."
                : "Doble motor de audio: Reproduce tus archivos MP3 originales o el sintetizador melódico analógico integrado."}
            </span>
          </div>
          <div className="text-[11px] text-amber-300/80 font-mono">
            {Object.keys(userAudioUrls).length} / 11 {lang === 'en' ? "MP3s Linked" : "Canciones MP3 Vinculadas"}
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-black shadow-lg shadow-white/10 scale-[1.02]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <span>{cat.label}</span>
              {cat.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                  selectedCategory === cat.id ? 'bg-black text-white' : 'bg-white/15 text-zinc-200'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Now Playing Showcase */}
        <div className="relative z-10 rounded-2xl bg-zinc-950/85 border border-white/10 p-4 sm:p-5 mb-3 shadow-xl shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            
            {/* Spinning Vinyl Record Visual */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-zinc-950 border-2 border-white/25 flex items-center justify-center shadow-2xl shrink-0 group">
              {/* Concentric vinyl grooves */}
              <div className="absolute inset-1.5 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
              
              <Disc3 className={`w-14 h-14 sm:w-18 sm:h-18 text-zinc-500 transition-all ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              
              {/* Center Vinyl Label */}
              <div className="absolute w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center text-[8px] sm:text-[9px] font-bold shadow-md">
                4haus
              </div>
            </div>

            {/* Current Track Metadata & Details */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-mono">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{currentTrack?.year}</span>
                </span>
                
                {currentTrack?.album && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-mono">
                    {currentTrack.album}
                  </span>
                )}

                {hasAudioFile ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>MP3 Master HQ</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[10px] font-mono">
                    <Music className="w-3 h-3" />
                    <span>Sintetizador Melódico Analógico</span>
                  </span>
                )}
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {currentTrack?.title}
              </h4>
              
              <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-0.5">
                {currentTrack?.artist}
              </p>

              {currentTrack?.lyricsSnippet && (
                <p className="text-xs text-amber-200/90 italic mt-1 font-light line-clamp-1">
                  {currentTrack.lyricsSnippet}
                </p>
              )}

              {/* Live Equalizer Animation Bars */}
              <div className="flex items-end gap-1.5 h-5 mt-2.5 justify-center sm:justify-start">
                {[45, 80, 55, 95, 70, 85, 50, 100, 65, 90, 60, 75].map((height, i) => (
                  <span
                    key={i}
                    style={{
                      height: isPlaying ? `${height}%` : '20%',
                      animationDuration: `${0.4 + (i % 5) * 0.12}s`,
                    }}
                    className={`w-1 rounded-full bg-gradient-to-t from-amber-400 to-white transition-all ${
                      isPlaying ? 'animate-pulse' : 'opacity-30'
                    }`}
                  />
                ))}
                
                <span className="text-[10px] font-mono text-zinc-400 ml-2">
                  {isPlaying 
                    ? (hasAudioFile ? "Reproduciendo Master Original" : "Melodía de Brian Wilson Activa (WebAudio)") 
                    : (hasAudioFile ? "Listo para Reproducir Master" : "Listo para Reproducir")}
                </span>
              </div>

            </div>

          </div>

          {/* Time Scrubber Bar */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-400 w-9 text-right">
              {formatSeconds(currentTime)}
            </span>
            
            <div className="flex-1 relative h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-400 to-white rounded-full transition-all duration-300"
                style={{
                  width: isPlaying ? '70%' : '10%'
                }}
              />
            </div>

            <span className="text-[10px] font-mono text-zinc-400 w-9">
              {currentTrack?.duration || "2:30"}
            </span>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between pt-3 mt-1">
            
            {/* Play, Pause, Next, Previous */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={lang === 'en' ? "Previous Song" : "Canción Anterior"}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2.5 px-6 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>{lang === 'en' ? "Pause" : "Pausar"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    <span>{lang === 'en' ? "Play" : "Reproducir"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={lang === 'en' ? "Next Song" : "Canción Siguiente"}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Volume & Sound Preset */}
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newMuted = !isMuted;
                    setIsMuted(newMuted);
                    if (audioRef.current) {
                      audioRef.current.muted = newMuted;
                    }
                    if (isPlaying && !hasAudioFile) {
                      if (newMuted) audioSynth.stop();
                      else audioSynth.playTrack(currentTrack.id, currentTrack.decade);
                    }
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    setIsMuted(false);
                    if (audioRef.current) {
                      audioRef.current.volume = val;
                    }
                  }}
                  className="w-14 sm:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                  title="Volume"
                />
              </div>

              <span className="hidden sm:inline font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                {currentTrack?.frequencyPreset || 432}Hz
              </span>
            </div>

          </div>

        </div>

        {/* Track List for Selected Category */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[140px] max-h-52">
          
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400 pb-1 px-1">
            <span>
              {selectedCategory === 'california' 
                ? (lang === 'en' ? "11 Tracks (Beach Boys & Classics)" : "11 Canciones (Beach Boys y Clásicos)") 
                : (lang === 'en' ? `${selectedCategory} Collection` : `Colección ${selectedCategory}`)}
            </span>
            <span className="text-[10px] text-zinc-400 lowercase">
              {currentTracks.length} {lang === 'en' ? 'tracks' : 'canciones'}
            </span>
          </div>

          {currentTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const hasLocal = !!userAudioUrls[track.id];
            const fileName = storedFileNames[track.id];

            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(idx)}
                className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-left transition-all cursor-pointer group ${
                  isCurrent
                    ? 'bg-white/15 text-white border border-white/25 shadow-md'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${
                    isCurrent ? 'bg-amber-400 text-black font-bold' : 'text-zinc-400 group-hover:text-white'
                  }`}>
                    {isCurrent && isPlaying ? (
                      <Disc3 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                        {track.title}
                      </span>
                      {hasLocal ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                          HQ MP3
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 text-[9px] font-mono">
                          Synth
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5">
                      <span>{track.artist}</span>
                      {track.album && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{track.album}</span>
                        </>
                      )}
                      {fileName && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-emerald-400/80 font-mono text-[10px] truncate max-w-[120px]">
                            {fileName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {track.duration || track.year}
                  </span>

                  {/* Upload audio file directly for this specific track */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleTrackUpload(track.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-300 transition-colors"
                    title={lang === 'en' ? "Attach audio file to this track" : "Vincular archivo de audio a esta canción"}
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove audio if uploaded */}
                  {hasLocal && (
                    <button
                      onClick={(e) => handleDeleteTrackAudio(e, track.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title={lang === 'en' ? "Remove audio file" : "Quitar archivo de audio"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'bg-white text-black' 
                      : 'bg-white/5 group-hover:bg-white/15 text-zinc-400 group-hover:text-white'
                  }`}>
                    {isCurrent && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Bottom Drag & Drop Helper footer */}
        <div className="relative z-10 pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <FolderDown className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === 'en' 
                ? "Tip: Drag & drop your audio files directly onto this window to link them automatically." 
                : "Consejo: Arrastra y suelta tus archivos de audio directamente sobre esta ventana para vincularlos."}
            </span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-zinc-400">
            {lang === 'en' ? "Auto-saved in browser IndexedDB" : "Guardado en IndexedDB del navegador"}
          </span>
        </div>

      </div>
    </div>
  );
}
