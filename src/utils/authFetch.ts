// Añade la identidad a cada petición del navegador a nuestro servidor (/api/...).
// - Con sesión: el token de Firebase (el servidor lo verifica; el UID sale del token).
// - Sin sesión: el espacio anónimo de este navegador (anon_xxxx).
// Así ninguna pantalla tiene que acordarse de hacerlo, y nadie puede hacerse pasar por otro.
import { auth } from '../services/firebaseAuth';
import { getWorkspaceId } from './workspaceId';

function isOwnApi(url: string): boolean {
  if (url.startsWith('/api/')) return true;
  try {
    const u = new URL(url, window.location.href);
    return u.origin === window.location.origin && u.pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

// En producción la página (Netlify) y el servidor (Render) están en direcciones distintas:
// VITE_API_BASE_URL indica dónde está el servidor. En desarrollo queda vacío (misma dirección).
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function withBase(url: string): string {
  if (!API_BASE) return url;
  if (url.startsWith('/api/')) return `${API_BASE}${url}`;
  try {
    const u = new URL(url);
    if (u.origin === window.location.origin) return `${API_BASE}${u.pathname}${u.search}`;
  } catch {
    /* no es una URL absoluta */
  }
  return url;
}

let installed = false;

export function installAuthFetch() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!isOwnApi(url)) return originalFetch(input, init);

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    const user = auth.currentUser;
    if (user) {
      try {
        headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
      } catch {
        /* sin token: el servidor tratará la petición como anónima */
      }
      headers.set('x-user-id', user.uid);
    } else {
      headers.delete('Authorization');
      headers.set('x-user-id', getWorkspaceId(null));
    }
    const target = input instanceof Request ? new Request(withBase(url), input) : withBase(url);
    return originalFetch(target, { ...init, headers });
  };
}
