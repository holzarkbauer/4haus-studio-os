// Documentos internos de 4haus (contratos, scripts, MOF/ROF). Solo el equipo puede leerlos:
// viven en el servidor y nunca se incluyen en la página pública.
// Los documentos públicos (condiciones de venta, términos de creadores) están en src/legal/.
import fs from 'fs';
import path from 'path';
import type { Express } from 'express';
import { isAdmin } from './crm.ts';

const DIR = path.resolve(process.cwd(), 'server', 'docs');

export const INTERNAL_DOCS = [
  { id: 'contrato-colaboradores', title: 'Contrato de locación de servicios (Lobos, Osos, Leones)', group: 'Equipo', needsSignature: true },
  { id: 'confidencialidad', title: 'Acuerdo de confidencialidad y propiedad intelectual', group: 'Equipo', needsSignature: true },
  { id: 'scripts-venta', title: 'Scripts de venta', group: 'Ventas', needsSignature: false },
  { id: 'mof-rof', title: 'ROF y MOF de 4haus Studio', group: 'Organización', needsSignature: false },
  { id: 'contrato-servicios-eeuu', title: 'Website & AI Services Agreement (clientes de EE. UU.)', group: 'Clientes', needsSignature: true },
] as const;

export function registerDocsRoutes(app: Express) {
  app.get('/api/studio/admin/docs', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    res.json({ docs: INTERNAL_DOCS });
  });

  app.get('/api/studio/admin/docs/:id', (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Solo para el equipo de 4haus.' });
    const doc = INTERNAL_DOCS.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'No encontré ese documento.' });
    try {
      res.json({ ...doc, markdown: fs.readFileSync(path.join(DIR, `${doc.id}.md`), 'utf-8') });
    } catch {
      res.status(500).json({ error: 'No pude leer el documento.' });
    }
  });
}
