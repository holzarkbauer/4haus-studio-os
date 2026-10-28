import { 
  SpotifyUser, 
  SpotifyTrack, 
  SpotifyPlaylist, 
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyDevice, 
  SpotifyPlaybackState 
} from '../types/spotify';
import { getValidAccessToken, clearStoredTokens } from './spotifyAuth';

const BASE_URL = 'https://api.spotify.com/v1';

/**
 * Generic authenticated Spotify Web API fetch wrapper with token injection & error parsing
 */
async function spotifyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearStoredTokens();
    throw new Error('SESSION_EXPIRED');
  }

  if (response.status === 403) {
    const errJson = await response.json().catch(() => ({}));
    const message = errJson?.error?.message || 'Action forbidden by Spotify. Spotify Premium may be required for this control.';
    throw new Error(`FORBIDDEN: ${message}`);
  }

  if (response.status === 404) {
    throw new Error('DEVICE_NOT_FOUND');
  }

  // 204 No Content (common on play/pause/skip commands)
  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `Spotify API error (${response.status})`);
  }

  return response.json();
}

/**
 * Retrieves the current authenticated Spotify user's profile
 */
export async function getCurrentUserProfile(): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>('/me');
}

export interface SpotifySearchResponse {
  tracks: SpotifyTrack[];
  playlists: SpotifyPlaylist[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
}

/**
 * Retrieves the current user's playlists with pagination
 */
export async function getUserPlaylists(limit = 20, offset = 0): Promise<{ items: SpotifyPlaylist[]; total: number }> {
  const data = await spotifyFetch<{ items: SpotifyPlaylist[]; total: number }>(
    `/me/playlists?limit=${limit}&offset=${offset}`
  );
  return {
    items: data.items || [],
    total: data.total || 0,
  };
}

/**
 * Retrieves tracks from a specific playlist
 */
export async function getPlaylistTracks(playlistId: string, limit = 50, offset = 0): Promise<SpotifyTrack[]> {
  interface PlaylistTracksResponse {
    items: { track: SpotifyTrack | null }[];
  }
  const data = await spotifyFetch<PlaylistTracksResponse>(
    `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
  );
  return (data.items || [])
    .map(item => item.track)
    .filter((track): track is SpotifyTrack => track !== null && !!track.id);
}

/**
 * Retrieves the user's saved/liked tracks with pagination
 */
export async function getUserSavedTracks(limit = 30, offset = 0): Promise<{ items: SpotifyTrack[]; total: number }> {
  interface SavedTracksResponse {
    items: { track: SpotifyTrack }[];
    total: number;
  }
  const data = await spotifyFetch<SavedTracksResponse>(`/me/tracks?limit=${limit}&offset=${offset}`);
  return {
    items: (data.items || []).map(item => item.track).filter(t => !!t && !!t.id),
    total: data.total || 0,
  };
}

/**
 * Searches Spotify's global catalog for songs, artists, albums, and playlists
 */
export async function searchSpotify(
  query: string, 
  types: ('track' | 'artist' | 'album' | 'playlist')[] = ['track', 'playlist', 'artist', 'album'],
  limit = 20
): Promise<SpotifySearchResponse> {
  if (!query.trim()) return { tracks: [], playlists: [], artists: [], albums: [] };

  const typeParam = types.join(',');
  const encodedQuery = encodeURIComponent(query.trim());
  const data = await spotifyFetch<{
    tracks?: { items: SpotifyTrack[] };
    playlists?: { items: SpotifyPlaylist[] };
    artists?: { items: SpotifyArtist[] };
    albums?: { items: SpotifyAlbum[] };
  }>(`/search?q=${encodedQuery}&type=${typeParam}&limit=${limit}`);

  return {
    tracks: data.tracks?.items || [],
    playlists: data.playlists?.items || [],
    artists: data.artists?.items || [],
    albums: data.albums?.items || [],
  };
}

/**
 * Retrieves top tracks for an artist
 */
export async function getArtistTopTracks(artistId: string, market = 'from_token'): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks?market=${market}`);
  return data.tracks || [];
}

/**
 * Retrieves tracks from an album
 */
export async function getAlbumTracks(albumId: string, limit = 50): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(`/albums/${albumId}/tracks?limit=${limit}`);
  return data.items || [];
}

/**
 * Retrieves all available Spotify Connect devices
 */
export async function getAvailableDevices(): Promise<SpotifyDevice[]> {
  const data = await spotifyFetch<{ devices: SpotifyDevice[] }>('/me/player/devices');
  return data.devices || [];
}

/**
 * Transfers playback to a target Spotify device
 */
export async function transferPlayback(deviceId: string, play = false): Promise<void> {
  await spotifyFetch('/me/player', {
    method: 'PUT',
    body: JSON.stringify({
      device_ids: [deviceId],
      play,
    }),
  });
}

/**
 * Starts or resumes playback of a specific track or playlist context
 */
export async function playSpotify(options: {
  deviceId?: string;
  contextUri?: string; // e.g. "spotify:playlist:..." or "spotify:album:..."
  uris?: string[];      // e.g. ["spotify:track:..."]
  offset?: { position?: number; uri?: string };
  positionMs?: number;
}): Promise<void> {
  const { deviceId, contextUri, uris, offset, positionMs } = options;
  const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';

  const body: Record<string, unknown> = {};
  if (contextUri) body.context_uri = contextUri;
  if (uris && uris.length > 0) body.uris = uris;
  if (offset) body.offset = offset;
  if (positionMs !== undefined) body.position_ms = positionMs;

  await spotifyFetch(endpoint, {
    method: 'PUT',
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });
}

/**
 * Pauses playback
 */
export async function pausePlayback(deviceId?: string): Promise<void> {
  const endpoint = deviceId ? `/me/player/pause?device_id=${deviceId}` : '/me/player/pause';
  await spotifyFetch(endpoint, { method: 'PUT' });
}

/**
 * Resumes playback
 */
export async function resumePlayback(deviceId?: string): Promise<void> {
  const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
  await spotifyFetch(endpoint, { method: 'PUT' });
}

/**
 * Skips to the next track
 */
export async function skipToNext(deviceId?: string): Promise<void> {
  const endpoint = deviceId ? `/me/player/next?device_id=${deviceId}` : '/me/player/next';
  await spotifyFetch(endpoint, { method: 'POST' });
}

/**
 * Skips to previous track
 */
export async function skipToPrevious(deviceId?: string): Promise<void> {
  const endpoint = deviceId ? `/me/player/previous?device_id=${deviceId}` : '/me/player/previous';
  await spotifyFetch(endpoint, { method: 'POST' });
}

/**
 * Sets playback volume (0 to 100)
 */
export async function setPlaybackVolume(volumePercent: number, deviceId?: string): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(volumePercent)));
  const endpoint = deviceId 
    ? `/me/player/volume?volume_percent=${clamped}&device_id=${deviceId}` 
    : `/me/player/volume?volume_percent=${clamped}`;
  await spotifyFetch(endpoint, { method: 'PUT' });
}

/**
 * Seeks to position in milliseconds
 */
export async function seekPlayback(positionMs: number, deviceId?: string): Promise<void> {
  const endpoint = deviceId 
    ? `/me/player/seek?position_ms=${Math.max(0, Math.round(positionMs))}&device_id=${deviceId}` 
    : `/me/player/seek?position_ms=${Math.max(0, Math.round(positionMs))}`;
  await spotifyFetch(endpoint, { method: 'PUT' });
}

/**
 * Gets the current playback state
 */
export async function getPlaybackState(): Promise<SpotifyPlaybackState | null> {
  try {
    return await spotifyFetch<SpotifyPlaybackState>('/me/player');
  } catch {
    return null;
  }
}
