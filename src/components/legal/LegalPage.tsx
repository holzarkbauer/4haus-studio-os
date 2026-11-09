import React from 'react';
import condicionesVenta from '../../legal/condiciones-venta.md?raw';
import terminosCreadores from '../../legal/terminos-creadores.md?raw';
import { DocViewer, PUBLIC_DOCS } from './DocViewer';

// Documentos públicos: los que necesita saber quien entra por la página antes de comprar o registrarse.
export const PUBLIC_DOC_TEXT: Record<string, string> = {
  'condiciones-venta': condicionesVenta,
  'terminos-creadores': terminosCreadores,
};

export function LegalPage({ docId, isDark, lang }: { docId: string; isDark: boolean; lang: 'es' | 'en' }) {
  const doc = PUBLIC_DOCS.find((d) => d.id === docId) || PUBLIC_DOCS[0];
  return (
    <div className="max-w-4xl mx-auto w-full pt-4 space-y-4">
      <nav className="flex flex-wrap gap-2 text-xs" aria-label={lang === 'en' ? 'Legal documents' : 'Documentos legales'}>
        {PUBLIC_DOCS.map((d) => (
          <a
            key={d.id}
            href={d.path}
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, '', d.path);
              window.dispatchEvent(new CustomEvent('4haus:navigate', { detail: d.id === 'condiciones-venta' ? 'condiciones' : 'terminos' }));
            }}
            aria-current={d.id === doc.id ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-full border ${d.id === doc.id ? (isDark ? 'bg-white text-black border-white' : 'bg-[#1D1D1F] text-white border-[#1D1D1F]') : isDark ? 'border-white/15 text-zinc-300' : 'border-black/10 text-[#1D1D1F]'}`}
          >
            {d.title}
          </a>
        ))}
      </nav>
      <DocViewer title={doc.title} markdown={PUBLIC_DOC_TEXT[doc.id]} isDark={isDark} lang={lang} />
    </div>
  );
}
