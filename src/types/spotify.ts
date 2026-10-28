export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  images?: { url: string; height?: number; width?: number }[];
  genres?: string[];
  followers?: { total: number };
  external_urls?: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: { url: string; height?: number; width?: number }[];
  release_date?: string;
  total_tracks?: number;
  artists: { id: string; name: string; uri: string }[];
  external_urls?: { spotify: string };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  country?: string;
  product?: string; // 'premium' | 'free' | 'open'
  images?: { url: string; height?: number; width?: number }[];
  external_urls?: { spotify: string };
  followers?: { total: number };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: { id: string; name: string; uri: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height?: number; width?: number }[];
    uri?: string;
  };
  preview_url?: string | null;
  external_urls?: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string | null;
  uri: string;
  images: { url: string; height?: number; width?: number }[];
  tracks?: { total: number };
  owner?: { display_name: string; id: string };
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  device?: SpotifyDevice;
  shuffle_state?: boolean;
  repeat_state?: string;
}

export interface SpotifyTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  obtained_at: number;
}

export type SpotifyConnectionStatus = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'error' 
  | 'premium_required'
  | 'session_expired';
