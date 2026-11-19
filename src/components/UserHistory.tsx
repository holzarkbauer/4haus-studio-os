import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { ui } from '../ui/tokens';

// Historia: lo que la persona creó de verdad (por ahora, sus webs). Nada inventado.

interface Entry {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export function UserHistory({ isDark, isEn, onOpenWebsites }: { isDark: boolean; isEn: boolean; onOpenWebsites: () => void }) {
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const [items, setItems] = useState<Entry[] | null>(null);

  useEffect(() => {
    fetch('/api/studio/sites')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItems(Array.isArray(d?.sites) ? d.sites : []))
      .catch(() => setItems([]));
  }, []);

  const status = (st: string) => (st === 'ready' ? t('Lista', 'Ready') : st === 'error' ? t('Con error', 'Failed') : t('En proceso', 'In progress'));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className={s.title}>{t('Historia', 'History')}</h2>
        <p className={s.muted}>{t('Todo lo que has creado en 4haus Studio.', 'Everything you have created in 4haus Studio.')}</p>
      </div>
      {items === null ? (
        <p className={`text-sm ${s.muted}`}>{t('Cargando…', 'Loading…')}</p>
      ) : items.length === 0 ? (
        <div className={`${s.card} p-6 space-y-3 text-sm`}>
          <p className={s.muted}>{t('Aún no has creado nada. Empieza con tu primera web.', 'You have not created anything yet. Start with your first website.')}</p>
          <button type="button" onClick={onOpenWebsites} className={s.primaryButton}>
            {t('Crear mi primera web', 'Create my first website')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className={`${s.card} divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
          {items.map((it) => (
            <button key={it.id} type="button" onClick={onOpenWebsites} className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-black/[0.02]">
              <Globe className={`w-4 h-4 shrink-0 ${s.faint}`} />
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{it.title}</span>
                <span className={`block text-xs ${s.faint}`}>
                  {t('Web', 'Website')} · {status(it.status)} · {new Date(it.updatedAt).toLocaleString(isEn ? 'en-US' : 'es-PE')}
                </span>
              </span>
              <ArrowRight className={`w-4 h-4 shrink-0 ${s.faint}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
