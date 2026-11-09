import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Globe, Lock, Loader2 } from 'lucide-react';
import { ui } from '../../ui/tokens';
import { DocViewer, PUBLIC_DOCS } from '../legal/DocViewer';
import { PUBLIC_DOC_TEXT } from '../legal/LegalPage';

// CRM 4haus › Documentos: todos los documentos de la empresa en un lugar.
// Públicos (los ve cualquiera en la página) e internos (solo el equipo, vienen del servidor).

type T = (es: string, en: string) => string;
interface DocItem {
  id: string;
  title: string;
  group: string;
  visibility: 'publico' | 'interno';
  needsSignature: boolean;
  path?: string;
}

export function DocsView({ isDark, t, L }: { isDark: boolean; t: T; L: 'es' | 'en' }) {
  const s = ui(isDark);
  const [internal, setInternal] = useState<DocItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<{ title: string; markdown: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/studio/admin/docs')
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error((d as any).error || 'No pude cargar los documentos.');
        setInternal(((d as any).docs || []).map((x: any) => ({ ...x, visibility: 'interno' })));
      })
      .catch((e) => setError(e.message));
  }, []);

  const publicDocs: DocItem[] = PUBLIC_DOCS.map((d) => ({ id: d.id, title: d.title, group: 'Clientes y creadores', visibility: 'publico', needsSignature: false, path: d.path }));
  const all = [...publicDocs, ...internal];

  async function openDoc(d: DocItem) {
    setError(null);
    if (d.visibility === 'publico') return setOpen({ title: d.title, markdown: PUBLIC_DOC_TEXT[d.id] });
    setLoadingId(d.id);
    try {
      const r = await fetch(`/api/studio/admin/docs/${d.id}`);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((data as any).error || 'No pude abrir el documento.');
      setOpen({ title: d.title, markdown: (data as any).markdown });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingId(null);
    }
  }

  if (open) {
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setOpen(null)} className={s.ghostButton}>
          <ArrowLeft className="w-4 h-4" /> {t('Volver a documentos', 'Back to documents')}
        </button>
        <DocViewer title={open.title} markdown={open.markdown} isDark={isDark} lang={L} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={`${s.card} p-5 text-sm space-y-1`}>
        <p className={s.heading}>{t('Todos los documentos de 4haus', 'All 4haus documents')}</p>
        <p className={s.muted}>
          {t(
            'Los públicos están en la página para quien compra o se registra. Los internos solo los ve tu equipo. Todos son borradores para revisión de un abogado. La firma electrónica dentro del CRM llega en el siguiente paso; mientras tanto, descárgalos o imprímelos.',
            'Public documents are on the site; internal ones are team-only. All are drafts for legal review. In-app e-signature comes next.',
          )}
        </p>
      </div>
      <div className={`${s.card} overflow-hidden`}>
        <ul className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
          {all.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => openDoc(d)} className={`w-full text-left px-5 py-4 flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}>
                <FileText className={`w-5 h-5 shrink-0 ${s.muted}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{d.title}</div>
                  <div className={`text-xs ${s.faint}`}>
                    {d.group}
                    {d.path ? ` · 4haus.us${d.path}` : ''}
                    {d.needsSignature ? ` · ${t('requiere firma', 'needs signature')}` : ''}
                  </div>
                </div>
                {loadingId === d.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : d.visibility === 'publico' ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {t('Público', 'Public')}</span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 inline-flex items-center gap-1"><Lock className="w-3 h-3" /> {t('Interno', 'Internal')}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
