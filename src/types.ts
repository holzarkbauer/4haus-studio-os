export type Language = 
  | 'en' 
  | 'es' 
  | 'fr' 
  | 'zh' 
  | 'de' 
  | 'it' 
  | 'ru' 
  | 'ja' 
  | 'he' 
  | 'el' 
  | 'qu' 
  | 'ay' 
  | 'pt';

export type PageId = 'home' | 'services' | 'process' | 'results' | 'about' | 'faq' | 'contact';

export type BackgroundTheme = 
  | 'beach-waves' 
  | 'night-stars' 
  | 'beach-resort' 
  | 'beach' 
  | 'alpine' 
  | 'obsidian' 
  | 'aurora';

export interface ProjectShowcase {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  tag: string;
  metrics: string;
  accent: string;
}

export interface DecadeTrack {
  id: string;
  title: string;
  artist: string;
  year: string;
  decade: '40s' | '50s' | '60s' | '70s' | '80s' | '90s' | '00s' | 'california' | 'classical';
  description: string;
  frequencyPreset: number;
  duration?: string;
  album?: string;
  lyricsSnippet?: string;
  audioUrl?: string;
  isUserAdded?: boolean;
}
