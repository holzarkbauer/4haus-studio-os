// Conexión única del servidor con Firebase (verificar sesiones y guardar datos en Firestore).
//
// Para verificar sesiones basta el ID del proyecto. Para leer y escribir en Firestore hace falta
// una cuenta de servicio: se pega su JSON completo en la variable FIREBASE_SERVICE_ACCOUNT del
// panel del hosting (nunca en el código ni en el repositorio). Sin ella, el servidor sigue
// funcionando con archivos locales, como en desarrollo.
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function readClientConfig(): { projectId?: string; firestoreDatabaseId?: string } {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  } catch {
    return {};
  }
}

let serviceAccountOk = false;

export function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const cfg = readClientConfig();
  const projectId = process.env.FIREBASE_PROJECT_ID || cfg.projectId;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      const sa = JSON.parse(raw);
      serviceAccountOk = true;
      return initializeApp({ credential: cert(sa), projectId: projectId || sa.project_id });
    } catch {
      console.error('[firebase] FIREBASE_SERVICE_ACCOUNT no es un JSON válido; se usarán archivos locales.');
    }
  }
  return initializeApp({ projectId });
}

let db: Firestore | null | undefined;

/** Firestore del servidor, o null si no hay cuenta de servicio configurada. */
export function serverDb(): Firestore | null {
  if (db !== undefined) return db;
  adminApp();
  if (!serviceAccountOk) {
    db = null;
    return db;
  }
  const cfg = readClientConfig();
  const databaseId = process.env.FIRESTORE_DATABASE_ID || cfg.firestoreDatabaseId;
  db = databaseId ? getFirestore(adminApp(), databaseId) : getFirestore(adminApp());
  return db;
}
