// Verificación de identidad en el servidor.
//
// Antes, el servidor creía cualquier valor del encabezado `x-user-id`: bastaba con escribir el
// UID de otra persona para leer sus datos o gastar su saldo de IA. Ahora:
//   1. Con sesión: el navegador envía `Authorization: Bearer <token de Firebase>`. El servidor lo
//      verifica con Firebase (firma de Google) y usa el UID que viene DENTRO del token.
//   2. Sin sesión: solo se acepta un espacio anónimo `anon_xxxx` generado por el navegador.
//      Nunca un UID real sin token.
//   3. Las rutas que gastan dinero de IA exigen sesión verificada.
// Después de este filtro, `x-user-id` siempre contiene la identidad verificada, así que el
// resto del servidor (que lee ese encabezado) queda protegido sin cambiar cada ruta.
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response, NextFunction } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const ANON_ID = /^anon_[a-z0-9]{6,40}$/i;

// Rutas que llaman a modelos de IA o servicios de voz (cuestan dinero).
const PAID_ROUTES = [
  '/api/studio/daniel',
  '/api/studio/daniel-tts',
  '/api/studio/generate-niche',
  '/api/studio/generate-campaign',
  '/api/studio/landing-drafts',
  '/api/studio/guided-builder',
  '/api/studio/super-agent-dispatch',
];

function readProjectId(): string | undefined {
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID;
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
    return cfg.projectId;
  } catch {
    return undefined;
  }
}

function adminAuth() {
  if (!getApps().length) {
    // Verificar tokens solo necesita el ID del proyecto (no una cuenta de servicio):
    // las claves públicas de Google se descargan automáticamente.
    initializeApp({ projectId: readProjectId() });
  }
  return getAuth();
}

export interface AuthInfo {
  uid: string | null; // UID verificado de Firebase, o null si no hay sesión
  workspaceId: string; // espacio de datos que puede usar esta petición
  verified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthInfo;
    }
  }
}

function adminUids(): string[] {
  return String(process.env.ADMIN_UIDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isPaidRoute(p: string) {
  return PAID_ROUTES.some((r) => p === r || p.startsWith(`${r}/`));
}

function deny(res: Response, status: number, es: string) {
  // `reply` permite que el panel de Daniel muestre el motivo como respuesta normal.
  return res.status(status).json({ error: es, reply: es, authRequired: status === 401 });
}

export function registerAuth(app: Express) {
  app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    let info: AuthInfo | null = null;

    if (token) {
      try {
        const decoded = await adminAuth().verifyIdToken(token);
        info = { uid: decoded.uid, workspaceId: decoded.uid, verified: true };
      } catch {
        return deny(res, 401, 'Tu sesión venció o no es válida. Vuelve a iniciar sesión con Google.');
      }
    } else {
      const claimed = String(req.headers['x-user-id'] || '');
      if (ANON_ID.test(claimed)) info = { uid: null, workspaceId: claimed, verified: false };
    }

    if (!info) {
      return deny(res, 401, 'Inicia sesión con Google para continuar.');
    }

    const fullPath = `${req.baseUrl}${req.path}`;
    if (!info.verified && isPaidRoute(fullPath)) {
      return deny(res, 401, 'Inicia sesión con Google para usar la IA. Incluye 8000 créditos gratis.');
    }

    // La voz maestra de Daniel es compartida por todos: solo un administrador puede cambiarla.
    if (fullPath === '/api/studio/daniel-master-audio' && req.method !== 'GET') {
      if (!info.uid || !adminUids().includes(info.uid)) {
        return deny(res, 403, 'Solo un administrador puede cambiar la voz maestra de Daniel.');
      }
    }

    // Desde aquí, la identidad que ve el resto del servidor es la verificada.
    req.auth = info;
    req.headers['x-user-id'] = info.workspaceId;
    if (req.body && typeof req.body === 'object' && 'userId' in req.body) req.body.userId = info.workspaceId;
    try {
      if (req.query && 'userId' in req.query) (req.query as any).userId = info.workspaceId;
    } catch {
      /* En Express 5 req.query es de solo lectura; el encabezado ya manda. */
    }
    next();
  });
}
