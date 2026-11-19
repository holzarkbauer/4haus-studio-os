import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ui } from '../../ui/tokens';
import type { StudioTemplateCard } from './WebComposer';

// Estilos nuevos que el equipo de 4haus agrega cada día desde el CRM.
// Al elegir uno se abre "Crear web" con ese estilo ya seleccionado.

const CATEGORY: Record<string, [string, string]> = {
  portada: ['Portada', 'Hero'],
  fondo: ['Fondo animado', 'Animated background'],
  seccion: ['Sección', 'Section'],
  'web-completa': ['Web completa', 'Full website'],
};

export function LibraryTemplates({ isDark, isEn, onUse }: { isDark: boolean; isEn: boolean; onUse: (templateId: string) => void }) {
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const [items, setItems] = useState<StudioTemplateCard[] | null>(null);

  useEffect(() => {
    fetch('/api/studio/templates')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItems(Array.isArray(d?.templates) ? d.templates : []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4">
      <div>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('Estilos nuevos', 'New styles')}</h3>
        <p className={`text-sm ${s.muted}`}>{t('Efectos y portadas que agregamos cada día. Elige uno y la IA lo adapta a tu web.', 'Effects and heroes we add every day. Pick one and the AI adapts it to your website.')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((tp) => (
          <article key={tp.id} className={`${s.card} overflow-hidden flex flex-col`}>
            <div className={`aspect-[16/10] ${isDark ? 'bg-white/5' : 'bg-black/[0.04]'} flex items-center justify-center`}>
              {tp.preview ? <img src={tp.preview} alt={tp.name} className="w-full h-full object-cover" loading="lazy" /> : <Sparkles className={`w-6 h-6 ${s.faint}`} />}
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              <span className={`text-[11px] uppercase tracking-wide ${s.faint}`}>{(CATEGORY[tp.category] || CATEGORY.portada)[isEn ? 1 : 0]}</span>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{tp.name}</h4>
              {tp.description && <p className={`text-xs ${s.muted}`}>{tp.description}</p>}
              <button type="button" onClick={() => onUse(tp.id)} className={`${s.primaryButton} mt-auto self-start`}>
                {t('Usar este estilo', 'Use this style')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
