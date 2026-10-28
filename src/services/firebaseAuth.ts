import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDocFromServer,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Required Workspace Scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory OAuth access token cache (never stored in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Standardized Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Data interfaces synced with firebase-blueprint.json
export interface FirestoreWorkspaceMeta {
  ownerId: string;
  businessName: string;
  industry: string;
  targetLocation: string;
  updatedAt?: any;
}

export type ProjectStatus = 'Activo' | 'En Configuración' | 'En Campaña' | 'Pausado' | 'Completado';

export interface FirestoreUserProject {
  id: string;
  ownerId: string;
  name: string;
  industry: string;
  targetLocation: string;
  objective: string;
  status: ProjectStatus;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreUserProspect {
  id: string;
  ownerId: string;
  name: string;
  company: string;
  role: string;
  email: string;
  socialHandle: string;
  channel: 'Email' | 'Instagram' | 'LinkedIn' | 'WhatsApp' | 'Web Form';
  location: string;
  niche: string;
  status: 'Nuevo' | 'Contactado' | 'Respondió' | 'Cualificado' | 'Reunión Agendada' | 'Descartado';
  temperature: 'Caliente' | 'Templado' | 'Frío';
  source: string;
  sourceUrl: string;
  recommendedAction: string;
  schemaVersion: number;
  createdAt?: any;
  updatedAt?: any;
}

// Initialize Auth Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

// Sign in with Google Popup + Request Gmail Send Scope
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string | null;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export function sanitizeId(raw: string): string {
  return (raw || '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 128);
}

// Ensure Parent Workspace Document Exists Before Creating Subcollections
export async function ensureParentWorkspace(
  userId: string,
  defaults?: {
    businessName?: string;
    industry?: string;
    targetLocation?: string;
  }
) {
  const safeId = sanitizeId(userId);
  if (!safeId || !auth.currentUser?.emailVerified) return;

  const path = `workspaces/${safeId}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', safeId));
    if (!snap.exists()) {
      await setDoc(doc(db, 'workspaces', safeId), {
        ownerId: safeId,
        businessName: (defaults?.businessName || auth.currentUser?.displayName || 'Workspace 4haus').slice(0, 160),
        industry: (defaults?.industry || 'IA, Automatización y Crecimiento').slice(0, 160),
        targetLocation: (defaults?.targetLocation || 'Global').slice(0, 160),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Sync User Workspace Metadata to Firestore adhering strictly to firebase-blueprint.json
export async function syncWorkspaceMetaToFirestore(
  userId: string,
  businessName: string,
  industry: string,
  targetLocation: string
) {
  const safeId = sanitizeId(userId);
  if (!safeId || !auth.currentUser?.emailVerified) return;

  const path = `workspaces/${safeId}`;
  try {
    await setDoc(doc(db, 'workspaces', safeId), {
      ownerId: safeId,
      businessName: (businessName || 'Mi Proyecto 4haus').slice(0, 160),
      industry: (industry || 'Servicios & Crecimiento').slice(0, 160),
      targetLocation: (targetLocation || 'Global').slice(0, 160),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to User Workspace Metadata
export function subscribeToUserWorkspaceMeta(
  userId: string,
  onData: (meta: FirestoreWorkspaceMeta | null) => void
) {
  const safeUserId = sanitizeId(userId);
  const path = `workspaces/${safeUserId}`;
  return onSnapshot(
    doc(db, 'workspaces', safeUserId),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as FirestoreWorkspaceMeta);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Subscribe to User Active Projects in Real-Time
export function subscribeToUserProjects(
  userId: string,
  onData: (projects: FirestoreUserProject[]) => void
) {
  const safeUserId = sanitizeId(userId);
  const path = `workspaces/${safeUserId}/projects`;
  const q = query(
    collection(db, 'workspaces', safeUserId, 'projects'),
    where('ownerId', '==', safeUserId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreUserProject[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ownerId: data.ownerId,
          name: data.name,
          industry: data.industry,
          targetLocation: data.targetLocation,
          objective: data.objective,
          status: data.status,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create or Save a Project to Firestore adhering strictly to firebase-blueprint.json
export async function saveProjectToFirestore(
  userId: string,
  projectId: string,
  project: {
    name: string;
    industry: string;
    targetLocation: string;
    objective: string;
    status?: ProjectStatus;
  }
) {
  const safeUserId = sanitizeId(userId);
  const safeProjectId = sanitizeId(projectId || `proj_${Date.now()}`);
  if (!safeUserId || !safeProjectId || !auth.currentUser?.emailVerified) return;

  await ensureParentWorkspace(safeUserId, {
    businessName: project.name,
    industry: project.industry,
    targetLocation: project.targetLocation,
  });

  const allowedStatuses: ProjectStatus[] = ['Activo', 'En Configuración', 'En Campaña', 'Pausado', 'Completado'];
  const statusVal: ProjectStatus =
    project.status && allowedStatuses.includes(project.status) ? project.status : 'Activo';

  const path = `workspaces/${safeUserId}/projects/${safeProjectId}`;
  try {
    const existingSnap = await getDoc(doc(db, 'workspaces', safeUserId, 'projects', safeProjectId));
    if (existingSnap.exists()) {
      await updateDoc(doc(db, 'workspaces', safeUserId, 'projects', safeProjectId), {
        name: (project.name || 'Proyecto 4haus').slice(0, 160),
        industry: (project.industry || 'General').slice(0, 160),
        targetLocation: (project.targetLocation || 'Global').slice(0, 160),
        objective: (project.objective || 'Crecimiento comercial en 90 días').slice(0, 400),
        status: statusVal,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'workspaces', safeUserId, 'projects', safeProjectId), {
        ownerId: safeUserId,
        name: (project.name || 'Proyecto 4haus').slice(0, 160),
        industry: (project.industry || 'General').slice(0, 160),
        targetLocation: (project.targetLocation || 'Global').slice(0, 160),
        objective: (project.objective || 'Crecimiento comercial en 90 días').slice(0, 400),
        status: statusVal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update Project Status in Firestore
export async function updateProjectStatusInFirestore(
  userId: string,
  projectId: string,
  status: ProjectStatus
) {
  const safeUserId = sanitizeId(userId);
  const safeProjectId = sanitizeId(projectId);
  if (!safeUserId || !safeProjectId || !auth.currentUser?.emailVerified) return;

  const path = `workspaces/${safeUserId}/projects/${safeProjectId}`;
  try {
    await updateDoc(doc(db, 'workspaces', safeUserId, 'projects', safeProjectId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Project from Firestore
export async function deleteProjectFromFirestore(userId: string, projectId: string) {
  const safeUserId = sanitizeId(userId);
  const safeProjectId = sanitizeId(projectId);
  if (!safeUserId || !safeProjectId || !auth.currentUser?.emailVerified) return;

  const path = `workspaces/${safeUserId}/projects/${safeProjectId}`;
  try {
    await deleteDoc(doc(db, 'workspaces', safeUserId, 'projects', safeProjectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to User Prospects in Real-Time (with Schema v2 genuine prospect tracking)
export function subscribeToUserProspects(
  userId: string,
  onData: (prospects: FirestoreUserProspect[]) => void
) {
  const safeUserId = sanitizeId(userId);
  const path = `workspaces/${safeUserId}/prospects`;
  const q = query(
    collection(db, 'workspaces', safeUserId, 'prospects'),
    where('ownerId', '==', safeUserId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreUserProspect[] = snapshot.docs.map((d) => {
        const data = d.data();
        const domainFromEmail = (data.email || '').includes('@')
          ? (data.email as string).split('@')[1]
          : 'corporativo.es';
        return {
          id: d.id,
          ownerId: data.ownerId,
          name: data.name || 'Contacto Corporativo',
          company: data.company || 'Empresa',
          role: data.role || 'Dirección General / Decisor',
          email: data.email || 'contacto@empresa.es',
          socialHandle: data.socialHandle || domainFromEmail,
          channel: data.channel || 'Email',
          location: data.location || 'Madrid',
          niche: data.niche || 'B2B & Inmobiliario',
          status: data.status || 'Nuevo',
          temperature: data.temperature || 'Templado',
          source: data.source || 'Firestore CRM Sincronizado',
          sourceUrl: data.sourceUrl ?? (domainFromEmail ? `https://${domainFromEmail}` : ''),
          recommendedAction:
            data.recommendedAction ||
            'Enviar propuesta personalizada por Gmail API y agendar reunión.',
          schemaVersion: typeof data.schemaVersion === 'number' ? data.schemaVersion : 1,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Sync a Genuine Prospect to Firestore adhering strictly to firebase-blueprint.json v2 schema
export async function syncProspectToFirestore(
  userId: string,
  prospectId: string,
  prospect: {
    name: string;
    company: string;
    role?: string;
    email: string;
    socialHandle?: string;
    channel: string;
    location?: string;
    niche?: string;
    status: string;
    temperature: string;
    source?: string;
    sourceUrl?: string;
    recommendedAction?: string;
  }
) {
  const safeUserId = sanitizeId(userId);
  const safeProspectId = sanitizeId(prospectId || `lead_${Date.now()}`);
  if (!safeUserId || !safeProspectId || !auth.currentUser?.emailVerified) return;

  await ensureParentWorkspace(safeUserId);

  const allowedChannels = ['Email', 'Instagram', 'LinkedIn', 'WhatsApp', 'Web Form'] as const;
  const allowedStatuses = [
    'Nuevo',
    'Contactado',
    'Respondió',
    'Cualificado',
    'Reunión Agendada',
    'Descartado',
  ] as const;
  const allowedTemps = ['Caliente', 'Templado', 'Frío'] as const;

  const channelVal = allowedChannels.includes(prospect.channel as any)
    ? (prospect.channel as typeof allowedChannels[number])
    : 'Email';
  const statusVal = allowedStatuses.includes(prospect.status as any)
    ? (prospect.status as typeof allowedStatuses[number])
    : 'Nuevo';
  const tempVal = allowedTemps.includes(prospect.temperature as any)
    ? (prospect.temperature as typeof allowedTemps[number])
    : 'Templado';

  const cleanEmail = (prospect.email || 'info@empresa.es').trim().slice(0, 200);
  const emailDomain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : 'empresa.es';
  const cleanRole = (prospect.role || 'Dirección Ejecutiva / Decisor').trim().slice(0, 140);
  const cleanHandle = (prospect.socialHandle || emailDomain || 'linkedin.com').trim().slice(0, 160);
  const cleanLocation = (prospect.location || 'Madrid').trim().slice(0, 160);
  const cleanNiche = (prospect.niche || 'Captación B2B & Real Estate').trim().slice(0, 160);
  const cleanSource = (
    prospect.source || 'Verificación Corporativa Directa (Firestore CRM v2)'
  )
    .trim()
    .slice(0, 200);
  const cleanSourceUrl = (
    prospect.sourceUrl !== undefined
      ? prospect.sourceUrl
      : emailDomain && !emailDomain.includes('gmail.') && !emailDomain.includes('hotmail.')
      ? `https://${emailDomain}`
      : 'https://www.linkedin.com'
  )
    .trim()
    .slice(0, 300);
  const cleanAction = (
    prospect.recommendedAction ||
    'Contactar por correo corporativo y agendar sesión de diagnóstico.'
  )
    .trim()
    .slice(0, 300);

  const path = `workspaces/${safeUserId}/prospects/${safeProspectId}`;
  try {
    const docRef = doc(db, 'workspaces', safeUserId, 'prospects', safeProspectId);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      // If existing document is on schemaVersion 2 and only status/temperature changed, perform fast Action 1 update
      if (
        existingData.schemaVersion === 2 &&
        existingData.name === (prospect.name || existingData.name) &&
        existingData.company === (prospect.company || existingData.company) &&
        existingData.email === cleanEmail &&
        !prospect.role &&
        !prospect.sourceUrl
      ) {
        await updateDoc(docRef, {
          status: statusVal,
          temperature: tempVal,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Perform full Action 2 update (migrates v1 documents to v2 schema or updates full genuine metadata)
        await updateDoc(docRef, {
          name: (prospect.name || existingData.name || 'Contacto').trim().slice(0, 140),
          company: (prospect.company || existingData.company || 'Empresa').trim().slice(0, 160),
          role: cleanRole,
          email: cleanEmail,
          socialHandle: cleanHandle,
          channel: channelVal,
          location: cleanLocation,
          niche: cleanNiche,
          status: statusVal,
          temperature: tempVal,
          source: cleanSource,
          sourceUrl: cleanSourceUrl,
          recommendedAction: cleanAction,
          schemaVersion: 2,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await setDoc(docRef, {
        ownerId: safeUserId,
        name: (prospect.name || 'Contacto').trim().slice(0, 140),
        company: (prospect.company || 'Empresa').trim().slice(0, 160),
        role: cleanRole,
        email: cleanEmail,
        socialHandle: cleanHandle,
        channel: channelVal,
        location: cleanLocation,
        niche: cleanNiche,
        status: statusVal,
        temperature: tempVal,
        source: cleanSource,
        sourceUrl: cleanSourceUrl,
        recommendedAction: cleanAction,
        schemaVersion: 2,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a Prospect from Firestore
export async function deleteProspectFromFirestore(userId: string, prospectId: string) {
  const safeUserId = sanitizeId(userId);
  const safeProspectId = sanitizeId(projectIdOrProspect(prospectId));
  if (!safeUserId || !safeProspectId || !auth.currentUser?.emailVerified) return;

  const path = `workspaces/${safeUserId}/prospects/${safeProspectId}`;
  try {
    await deleteDoc(doc(db, 'workspaces', safeUserId, 'prospects', safeProspectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

function projectIdOrProspect(raw: string): string {
  return sanitizeId(raw);
}

// Fetch all raw prospect documents for migration inspection
export async function fetchRawUserProspectDocs(userId: string) {
  const safeUserId = sanitizeId(userId);
  if (!safeUserId || !auth.currentUser?.emailVerified) return [];
  const path = `workspaces/${safeUserId}/prospects`;
  try {
    const q = query(
      collection(db, 'workspaces', safeUserId, 'prospects'),
      where('ownerId', '==', safeUserId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      data: d.data(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Send real email using Gmail API on behalf of the authenticated user
export async function sendGmailCampaignEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  bodyText: string;
}): Promise<{ id: string; threadId: string }> {
  let token = await getAccessToken();
  if (!token) {
    const signInResult = await googleSignIn();
    token = signInResult?.accessToken || null;
  }
  if (!token) {
    throw new Error('Se requiere iniciar sesión con Google y autorizar el permiso de envío de Gmail.');
  }

  // Construct RFC 2822 MIME message with UTF-8 Subject and Body
  const cleanSubject = params.subject.replace(/[\r\n]/g, ' ').trim();
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(cleanSubject)))}?=`;
  const mimeLines = [
    `To: "${params.toName.replace(/"/g, '')}" <${params.toEmail.trim()}>`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.bodyText,
  ];
  const rawMessage = mimeLines.join('\r\n');
  const base64UrlEncoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64UrlEncoded,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Error al enviar correo con Gmail (${response.status})`);
  }

  return response.json();
}
