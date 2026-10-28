/**
 * IndexedDB storage for 4haus MusicBox user audio tracks.
 * Allows permanent local persistence of MP3/WAV/M4A audio files
 * so the user never has to re-upload them across page refreshes.
 */

const DB_NAME = '4haus_musicbox_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_tracks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'trackId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export interface StoredAudio {
  trackId: string;
  blob: Blob;
  filename: string;
  updatedAt: number;
}

export async function saveAudioToStorage(trackId: string, file: File | Blob, filename: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data: StoredAudio = {
        trackId,
        blob: file,
        filename,
        updatedAt: Date.now(),
      };
      const req = store.put(data);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save audio to IndexedDB:', err);
  }
}

export async function getAllStoredAudios(): Promise<Record<string, { url: string; filename: string }>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records: StoredAudio[] = req.result || [];
        const result: Record<string, { url: string; filename: string }> = {};

        records.forEach((rec) => {
          try {
            const url = URL.createObjectURL(rec.blob);
            result[rec.trackId] = { url, filename: rec.filename };
          } catch (e) {
            console.error('Error creating object URL for track:', rec.trackId, e);
          }
        });

        resolve(result);
      };

      req.onerror = () => {
        resolve({});
      };
    });
  } catch {
    return {};
  }
}

export async function deleteAudioFromStorage(trackId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(trackId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete audio from IndexedDB:', err);
  }
}

/**
 * Intelligent file matcher that maps uploaded audio filenames to the 11 master tracks
 */
export function matchFileNameToTrackId(filename: string): string | null {
  const clean = filename.toLowerCase().replace(/[^a-z0-9]/g, ' ');

  if (clean.includes('in my room') || clean.includes('room')) {
    return 'in-my-room';
  }
  if (clean.includes('california') || clean.includes('dreamin')) {
    return 'california-dreamin';
  }
  if (clean.includes('surfin') || clean.includes('surfing') || clean.includes('surf usa')) {
    return 'surfin-usa';
  }
  if (clean.includes('get around') || clean.includes('i get around')) {
    return 'i-get-around';
  }
  if (clean.includes('god only knows vocal') || (clean.includes('vocal') && clean.includes('god'))) {
    return 'god-only-knows-vocal';
  }
  if (clean.includes('god only knows') || clean.includes('god only')) {
    return 'god-only-knows';
  }
  if (clean.includes('wouldnt it be nice') || clean.includes('wouldn') || clean.includes('nice')) {
    return 'wouldnt-it-be-nice';
  }
  if (clean.includes('pet sounds') || clean.includes('wrecking crew') || clean.includes('exotica')) {
    return 'pet-sounds-inst';
  }
  if (clean.includes('caroline') || clean.includes('caroline no')) {
    return 'caroline-no';
  }
  if (clean.includes('sonata') || clean.includes('chamber') || clean.includes('b minor')) {
    return 'classical-sonata';
  }
  if (clean.includes('allegro') || clean.includes('strings') || clean.includes('concerto')) {
    return 'allegro-strings';
  }

  return null;
}
