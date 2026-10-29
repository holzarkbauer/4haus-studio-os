// Guardado permanente de los datos del servidor en Firestore.
//
// El servidor sigue leyendo y escribiendo su archivo local (rápido y sin cambiar cada ruta), y
// además:
//   - al llegar una petición de un usuario con sesión, si su espacio no está en este servidor
//     (por ejemplo, después de que Render lo durmiera y reiniciara), se descarga de Firestore;
//   - cada vez que se guarda, se copia a Firestore en segundo plano.
// Los espacios anónimos (anon_xxxx) no se guardan en Firestore: son de prueba y temporales.
import fs from 'fs';
import { serverDb } from './firebaseAdmin.ts';

const WORKSPACES = 'serverWorkspaces';
const SERVER_DOCS = 'serverState';
const hydrated = new Set<string>();
const pending = new Map<string, Promise<void>>();

function persistable(workspaceId?: string | null): workspaceId is string {
  return Boolean(workspaceId && workspaceId !== 'default' && !workspaceId.startsWith('anon_'));
}

export function storageMode(): 'firestore' | 'local' {
  return serverDb() ? 'firestore' : 'local';
}

/** Trae el espacio del usuario desde Firestore al archivo local, una vez por arranque del servidor. */
export async function hydrateWorkspace(workspaceId: string, localFile: string) {
  const db = serverDb();
  if (!db || !persistable(workspaceId) || hydrated.has(workspaceId)) return;
  try {
    const snap = await db.collection(WORKSPACES).doc(workspaceId).get();
    const data = snap.exists ? snap.get('json') : null;
    if (typeof data === 'string' && data.length > 2) fs.writeFileSync(localFile, data, 'utf-8');
    hydrated.add(workspaceId);
  } catch (err) {
    // Si Firestore falla, no marcamos como cargado: se reintenta en la próxima petición.
    console.error('[storage] No se pudo leer de Firestore:', (err as Error).message);
  }
}

/** Copia el espacio a Firestore en segundo plano (el último guardado siempre gana). */
export function persistWorkspace(workspaceId: string | null | undefined, data: unknown) {
  const db = serverDb();
  if (!db || !persistable(workspaceId)) return;
  const json = JSON.stringify(data);
  if (json.length > 900_000) {
    console.error(`[storage] Espacio ${workspaceId} supera el límite de Firestore (${json.length} bytes); no se copió.`);
    return;
  }
  const previous = pending.get(workspaceId) || Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() =>
      db
        .collection(WORKSPACES)
        .doc(workspaceId)
        .set({ json, updatedAt: new Date().toISOString() })
        .then(() => undefined),
    )
    .catch((err) => console.error('[storage] No se pudo guardar en Firestore:', (err as Error).message));
  pending.set(workspaceId, next);
  hydrated.add(workspaceId);
}

/** Documento pequeño de estado del servidor (p. ej. el gasto diario de IA). */
export async function loadServerDoc<T>(id: string): Promise<T | null> {
  const db = serverDb();
  if (!db) return null;
  try {
    const snap = await db.collection(SERVER_DOCS).doc(id).get();
    return snap.exists ? (snap.data() as T) : null;
  } catch {
    return null;
  }
}

export function saveServerDoc(id: string, value: Record<string, unknown>) {
  const db = serverDb();
  if (!db) return;
  db.collection(SERVER_DOCS)
    .doc(id)
    .set(value)
    .catch((err) => console.error('[storage] No se pudo guardar estado:', (err as Error).message));
}
