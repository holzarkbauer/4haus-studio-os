import { SpotifyTokens } from '../types/spotify';

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
].join(' ');

const STORAGE_KEYS = {
  TOKENS: '4haus_spotify_tokens',
  VERIFIER: '4haus_spotify_pkce_verifier',
  STATE: '4haus_spotify_oauth_state',
  CUSTOM_CLIENT_ID: '4haus_spotify_custom_client_id',
};

/**
 * Gets the active Spotify Client ID from environment or user-provided storage
 */
export function getSpotifyClientId(): string {
  const envId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  if (envId && envId.trim() !== '' && !envId.includes('MY_')) {
    return envId.trim();
  }
  const customId = localStorage.getItem(STORAGE_KEYS.CUSTOM_CLIENT_ID);
  return customId ? customId.trim() : '';
}

/**
 * Allows the user to store a custom Spotify Client ID if not configured in .env
 */
export function setSpotifyClientId(clientId: string) {
  if (clientId) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CLIENT_ID, clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CLIENT_ID);
  }
}

/**
 * Resolves current origin redirect URI for Spotify OAuth
 */
export function getSpotifyRedirectUri(): string {
  const envUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  if (envUri && envUri.trim() !== '') {
    return envUri.trim();
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/`;
  }
  return 'http://localhost:3000/';
}

/**
 * Generates a high-entropy cryptographically random string for PKCE code verifier
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}

/**
 * Calculates SHA-256 hash and encodes in base64url format
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Starts the Spotify OAuth 2.0 PKCE flow by redirecting the user
 */
export async function initiateSpotifyLogin(): Promise<void> {
  const clientId = getSpotifyClientId();
  if (!clientId) {
    throw new Error('MISSING_CLIENT_ID');
  }

  const verifier = generateRandomString(96);
  const challenge = await generateCodeChallenge(verifier);
  const state = generateRandomString(24);
  const redirectUri = getSpotifyRedirectUri();

  // Store verifier and state for verification on return
  sessionStorage.setItem(STORAGE_KEYS.VERIFIER, verifier);
  sessionStorage.setItem(STORAGE_KEYS.STATE, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    redirect_uri: redirectUri,
    state: state,
    show_dialog: 'true',
  });

  const authUrl = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;

  // If inside an iframe (e.g., Google AI Studio preview panel), open authorization
  // in a new tab to avoid accounts.spotify.com blocking frame embedding.
  if (typeof window !== 'undefined' && window.top && window.top !== window) {
    const popup = window.open(authUrl, '_blank', 'noopener,noreferrer');
    if (popup) {
      return;
    }

    // Fallback if browser blocked the new tab: navigate top window
    try {
      window.top.location.href = authUrl;
      return;
    } catch {
      window.location.href = authUrl;
      return;
    }
  }

  // If already running directly outside an iframe, standard window navigation
  window.location.href = authUrl;
}

/**
 * Handles the OAuth redirect callback if code is present in URL search params
 */
export async function handleSpotifyAuthCallback(): Promise<SpotifyTokens | null> {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const returnedState = urlParams.get('state');

  if (error) {
    cleanAuthUrlParams();
    throw new Error(`Spotify Auth Error: ${error}`);
  }

  if (!code) {
    return null;
  }

  const savedState = sessionStorage.getItem(STORAGE_KEYS.STATE);
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.VERIFIER);

  if (!codeVerifier) {
    cleanAuthUrlParams();
    throw new Error('Missing PKCE code verifier in session.');
  }

  if (savedState && returnedState && savedState !== returnedState) {
    cleanAuthUrlParams();
    throw new Error('OAuth state mismatch. Security verification failed.');
  }

  const clientId = getSpotifyClientId();
  const redirectUri = getSpotifyRedirectUri();

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    cleanAuthUrlParams();
    throw new Error(errData.error_description || 'Failed to exchange authorization code for Spotify tokens.');
  }

  const data = await response.json();
  const tokens: SpotifyTokens = {
    access_token: data.access_token,
    token_type: data.token_type || 'Bearer',
    expires_in: data.expires_in || 3600,
    refresh_token: data.refresh_token,
    scope: data.scope || SPOTIFY_SCOPES,
    obtained_at: Date.now(),
  };

  saveStoredTokens(tokens);
  sessionStorage.removeItem(STORAGE_KEYS.VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.STATE);
  cleanAuthUrlParams();

  return tokens;
}

/**
 * Cleans OAuth parameters from the URL without triggering a full page reload
 */
function cleanAuthUrlParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  window.history.replaceState({}, document.title, url.pathname + url.hash);
}

/**
 * Saves tokens to persistent storage
 */
export function saveStoredTokens(tokens: SpotifyTokens) {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
}

/**
 * Retrieves saved tokens
 */
export function getStoredTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!raw) return null;
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

/**
 * Checks if current access token is expired or about to expire in next 60 seconds
 */
export function isTokenExpired(tokens: SpotifyTokens): boolean {
  const expiryTime = tokens.obtained_at + tokens.expires_in * 1000 - 60000;
  return Date.now() > expiryTime;
}

/**
 * Refreshes an expired access token using PKCE refresh_token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens> {
  const clientId = getSpotifyClientId();
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    clearStoredTokens();
    throw new Error('SESSION_EXPIRED');
  }

  const data = await response.json();
  const updatedTokens: SpotifyTokens = {
    access_token: data.access_token,
    token_type: data.token_type || 'Bearer',
    expires_in: data.expires_in || 3600,
    refresh_token: data.refresh_token || refreshToken,
    scope: data.scope || SPOTIFY_SCOPES,
    obtained_at: Date.now(),
  };

  saveStoredTokens(updatedTokens);
  return updatedTokens;
}

/**
 * Gets a guaranteed valid access token (refreshes automatically if expired)
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  if (isTokenExpired(tokens)) {
    if (tokens.refresh_token) {
      try {
        const refreshed = await refreshSpotifyToken(tokens.refresh_token);
        return refreshed.access_token;
      } catch (err) {
        console.warn('Failed to refresh Spotify token:', err);
        return null;
      }
    }
    return null;
  }

  return tokens.access_token;
}

/**
 * Logs out and clears stored Spotify session
 */
export function clearStoredTokens() {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
  sessionStorage.removeItem(STORAGE_KEYS.VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.STATE);
}
