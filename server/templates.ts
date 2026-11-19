// Biblioteca de plantillas (estilos de portada y secciones) que José agrega desde el CRM.
//
// José pega el prompt o el código de un componente (por ejemplo, de 21st.dev) con un nombre y
// una imagen de muestra. La plantilla aparece en 4haus Studio; cuando alguien la elige, la IA
// usa ese código como guía y lo adapta a la web nueva en HTML, CSS y JavaScript propios.
//
// Las fotos y videos que traen esos prompts son de otras personas: la IA nunca los copia.
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { saveJsonDoc, listJsonDocs, loadJsonDoc, storageMode } from './storage.ts';
import { isAdmin } from './crm.ts';

const COLLECTION = 'studioTemplates';
const FILE = path.resolve(process.cwd(), 'data', 'studio-templates.json');
const MAX_CODE = 60000;
const MAX_PREVIEW = 400000; // imagen de muestra ya reducida en el navegador (data URL)

export const CATEGORIES = ['portada', 'fondo', 'seccion', 'web-completa'] as const;
type Category = (typeof CATEGORIES)[number];

export interface StudioTemplate {
  id: string;
  name: string;
  description: string;
  category: Category;
  code: string;
  preview: string;
  active: boolean;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

const local = new Map<string, StudioTemplate>();
let localLoaded = false;

function loadLocal() {
  if (localLoaded) return;
  localLoaded = true;
  try {
    if (fs.existsSync(FILE)) for (const t of JSON.parse(fs.readFileSync(FILE, 'utf-8')) as StudioTemplate[]) local.set(t.id, t);
  } catch {
    /* archivo dañado: se empieza vacío */
  }
}

function saveLocal() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify([...local.values()]), 'utf-8');
  } catch (err) {
    console.error('[plantillas] No se pudo guardar el archivo local:', (err as Error).message);
  }
}

async function allTemplates(): Promise<StudioTemplate[]> {
  loadLocal();
  if (storageMode() === 'firestore') {
    for (const t of await listJsonDocs<StudioTemplate>(COLLECTION, 300)) local.set(t.id, t);
  }
  return [...local.values()].filter((t) => !t.deleted).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTemplate(id: string): Promise<StudioTemplate | null> {
  if (!id) return null;
  loadLocal();
  let t = local.get(id) || null;
  if (!t && storageMode() === 'firestore') t = await loadJsonDoc<StudioTemplate>(COLLECTION, id);
  return t && !t.deleted && t.active ? t : null;
}

function store(t: StudioTemplate) {
  t.updatedAt = new Date().toISOString();
  local.set(t.id, t);
  saveLocal();
  saveJsonDoc(COLLECTION, t.id, t, 'admin');
}

const publicView = (t: StudioTemplate) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  category: t.category,
  preview: t.preview,
  createdAt: t.createdAt,
});

/** Texto que se agrega al pedido de la IA cuando se elige una plantilla. */
export function templateBrief(t: StudioTemplate): string {
  return `PLANTILLA DE REFERENCIA ELEGIDA: "${t.name}" (${t.category}).
${t.description ? `Descripción: ${t.description}\n` : ''}Usa este código solo como guía del efecto, el movimiento y la composición. Recréalo en tu único archivo HTML con CSS y JavaScript propios: sin React, sin Next.js, sin framer-motion y sin instalar nada (three.js por el importmap sí está permitido).
REGLA DE ARCHIVOS: las fotos, videos, logos y fuentes de este código son de otras personas. NO copies ninguna de sus direcciones (cloudfront, ufs.sh, cdn.21st.dev, unsplash, etc.). En su lugar usa las imágenes del cliente ({{IMG_n}}) si las hay, o formas, degradados y SVG propios.
Adapta todos los textos al negocio del pedido.
<plantilla_referencia>
${t.code}
</plantilla_referencia>`;
}

export function registerTemplateRoutes(app: Express) {
  // Público: lo que se muestra en 4haus Studio (sin el código).
  app.get('/api/studio/templates', async (_req: Request, res: Response) => {
    const list = (await allTemplates()).filter((t) => t.active);
    res.json({ templates: list.map(publicView) });
  });

  app.get('/api/studio/admin/templates', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const list = await allTemplates();
    res.json({ templates: list.map((t) => ({ ...publicView(t), active: t.active, codeLength: t.code.length })) });
  });

  app.post('/api/studio/admin/templates', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const b = req.body || {};
    const name = String(b.name || '').trim().slice(0, 80);
    const code = String(b.code || '').trim();
    const preview = String(b.preview || '');
    if (name.length < 2) return res.status(400).json({ error: 'Ponle un nombre a la plantilla.' });
    if (code.length < 40) return res.status(400).json({ error: 'Pega el prompt o el código de la plantilla.' });
    if (code.length > MAX_CODE) return res.status(400).json({ error: `El código es muy largo (máximo ${MAX_CODE.toLocaleString('es')} caracteres).` });
    if (preview && (!/^data:image\/(jpeg|png|webp);base64,/.test(preview) || preview.length > MAX_PREVIEW)) {
      return res.status(400).json({ error: 'La imagen de muestra no es válida o es muy pesada.' });
    }
    const category = (CATEGORIES as readonly string[]).includes(b.category) ? (b.category as Category) : 'portada';
    const now = new Date().toISOString();
    const existing = b.id ? (await allTemplates()).find((t) => t.id === String(b.id)) : undefined;
    const t: StudioTemplate = existing
      ? { ...existing, name, code, category, description: String(b.description || '').trim().slice(0, 300), preview: preview || existing.preview }
      : {
          id: `tpl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          name,
          description: String(b.description || '').trim().slice(0, 300),
          category,
          code,
          preview,
          active: true,
          createdAt: now,
          updatedAt: now,
        };
    store(t);
    res.json({ template: { ...publicView(t), active: t.active, codeLength: t.code.length } });
  });

  app.post('/api/studio/admin/templates/:id/toggle', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const t = (await allTemplates()).find((x) => x.id === String(req.params.id));
    if (!t) return res.status(404).json({ error: 'No encontré esa plantilla.' });
    t.active = !t.active;
    store(t);
    res.json({ ok: true, active: t.active });
  });

  app.delete('/api/studio/admin/templates/:id', async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const t = (await allTemplates()).find((x) => x.id === String(req.params.id));
    if (!t) return res.status(404).json({ error: 'No encontré esa plantilla.' });
    t.deleted = true;
    t.active = false;
    store(t);
    res.json({ ok: true });
  });
}
