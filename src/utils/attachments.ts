// Adjuntos para "Crear web": fotos, un zip de una página de referencia y textos largos.
// Todo se prepara en el navegador: las fotos se reducen y del zip solo se lee el texto
// (HTML y CSS). Nada de lo que trae el zip se ejecuta.

export interface TextAttachment {
  id: string;
  kind: 'texto' | 'zip' | 'datos';
  name: string;
  text: string;
}

export interface ImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
}

export const MAX_IMAGES = 5;
/** Un texto pegado más largo que esto (≈ media página) se convierte en adjunto. */
export const LONG_PASTE_CHARS = 1500;
const MAX_TEXT = 60000;
const MAX_ZIP_BYTES = 15 * 1024 * 1024;
const TEXT_EXT = /\.(txt|md|html?|css|tsx?|jsx?|json|csv)$/i;

export const newId = () => Math.random().toString(36).slice(2, 10);

/** Reduce una foto a 1280 px por lado como máximo (JPEG), para que suba rápido. */
export async function compressImage(file: File | Blob, name = 'imagen'): Promise<ImageAttachment> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('No pude leer esa imagen.'));
      i.src = url;
    });
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No pude preparar la imagen.');
    ctx.fillStyle = '#ffffff'; // fondo blanco para logos con transparencia
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { id: newId(), name, dataUrl: canvas.toDataURL('image/jpeg', 0.84) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Quita lo que no aporta al diseño: scripts, imágenes incrustadas y espacios de más. */
export function cleanReferenceText(text: string): string {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '<script>…</script>')
    .replace(/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]{100,}/gi, 'data:…')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Lee el texto (HTML, CSS, etc.) de un zip de una página de referencia. */
export async function readZip(file: File): Promise<TextAttachment> {
  if (file.size > MAX_ZIP_BYTES) throw new Error('El zip pesa más de 15 MB. Deja solo el HTML y el CSS.');
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter((f) => !f.dir && !f.name.includes('__MACOSX') && !f.name.includes('node_modules/'));
  const names = entries.map((f) => f.name);
  // Primero los HTML, luego los CSS y el resto de textos.
  const rank = (n: string) => (/\.html?$/i.test(n) ? 0 : /\.css$/i.test(n) ? 1 : 2);
  const readable = entries.filter((f) => TEXT_EXT.test(f.name)).sort((a, b) => rank(a.name) - rank(b.name)).slice(0, 40);
  let out = `Archivos en el zip (${names.length}): ${names.slice(0, 60).join(', ')}${names.length > 60 ? '…' : ''}\n`;
  for (const f of readable) {
    if (out.length >= MAX_TEXT) break;
    const content = cleanReferenceText(await f.async('string')).slice(0, 15000);
    out += `\n=== ${f.name} ===\n${content}\n`;
  }
  if (!readable.length) throw new Error('El zip no trae archivos HTML o CSS que se puedan leer.');
  return { id: newId(), kind: 'zip', name: file.name, text: out.slice(0, MAX_TEXT) };
}

export async function readTextFile(file: File): Promise<TextAttachment> {
  if (file.size > 2 * 1024 * 1024) throw new Error('Ese archivo de texto es muy pesado (máximo 2 MB).');
  const text = cleanReferenceText(await file.text()).slice(0, MAX_TEXT);
  return { id: newId(), kind: 'texto', name: file.name, text };
}

export function isTextFile(file: File) {
  return TEXT_EXT.test(file.name) || file.type.startsWith('text/');
}

export function isZip(file: File) {
  return /\.zip$/i.test(file.name) || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
}

export function describeSize(text: string, isEn = false) {
  const lines = text.split('\n').length;
  return isEn ? `${lines} lines` : `${lines} líneas`;
}
