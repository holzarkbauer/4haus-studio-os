import React, { useMemo } from 'react';
import { marked } from 'marked';
import { Download, Printer } from 'lucide-react';
import { ui } from '../../ui/tokens';

// Muestra un documento escrito en Markdown, con botones para imprimir (o guardar como PDF) y descargar.
// Solo se usa con documentos propios de 4haus (src/legal y server/docs), no con texto de usuarios.

export const PUBLIC_DOCS = [
  { id: 'condiciones-venta', path: '/condiciones', title: 'Condiciones de venta — Curso y Modelo de negocio' },
  { id: 'terminos-creadores', path: '/terminos-creadores', title: 'Términos del Programa de creadores' },
] as const;

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function htmlFile(title: string, body: string) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:820px;margin:40px auto;padding:0 20px;color:#1d1d1f}
table{border-collapse:collapse;width:100%;margin:16px 0;font-size:13px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
th{background:#f5f5f7}blockquote{border-left:3px solid #f59e0b;background:#fffbeb;margin:16px 0;padding:8px 14px}h1{font-size:26px}h2{margin-top:28px}</style>
</head><body>${body}</body></html>`;
}

export function DocViewer({ title, markdown, isDark, lang = 'es' }: { title: string; markdown: string; isDark: boolean; lang?: 'es' | 'en' }) {
  const s = ui(isDark);
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  const html = useMemo(() => marked.parse(markdown, { async: false }) as string, [markdown]);

  function download(kind: 'html' | 'md') {
    const blob = new Blob([kind === 'html' ? htmlFile(title, html) : markdown], { type: kind === 'html' ? 'text/html' : 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug(title)}.${kind}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function print() {
    // Imprime solo el documento en una ventana limpia; desde ahí también se puede "Guardar como PDF".
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(htmlFile(title, html));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-end">
        <button type="button" onClick={print} className={s.secondaryButton}>
          <Printer className="w-3.5 h-3.5" /> {t('Imprimir o guardar PDF', 'Print or save PDF')}
        </button>
        <button type="button" onClick={() => download('html')} className={s.secondaryButton}>
          <Download className="w-3.5 h-3.5" /> {t('Descargar', 'Download')}
        </button>
      </div>
      <article
        className={`doc-prose ${s.card} p-6 sm:p-10 ${isDark ? 'doc-prose-dark' : ''}`}
        // Contenido propio de 4haus (archivos del repositorio), no texto de usuarios.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
