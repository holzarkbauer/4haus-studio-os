import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { ui } from '../../ui/tokens';
import { compressImage } from '../../utils/attachments';

// CRM → Plantillas: José pega cada día el prompt o el código de un componente (por ejemplo, de
// 21st.dev). Aparece en 4haus Studio y la IA lo usa como guía al crear webs.

interface AdminTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  active: boolean;
  codeLength: number;
  createdAt: string;
}

type T = (es: string, en: string) => string;

const CATS: { id: string; es: string; en: string }[] = [
  { id: 'portada', es: 'Portada', en: 'Hero' },
  { id: 'fondo', es: 'Fondo animado', en: 'Animated background' },
  { id: 'seccion', es: 'Sección', en: 'Section' },
  { id: 'web-completa', es: 'Web completa', en: 'Full website' },
];

/** Busca direcciones de fotos o videos de otras cuentas dentro del código pegado. */
function foreignMedia(code: string): string[] {
  const found = code.match(/https?:\/\/[^\s"'`)]+\.(?:mp4|webm|mov|jpe?g|png|webp|gif|avif)(?:\?[^\s"'`)]*)?|https?:\/\/(?:[a-z0-9-]+\.)?(?:cloudfront\.net|ufs\.sh|cdn\.21st\.dev|images\.unsplash\.com)[^\s"'`)]*/gi) || [];
  return Array.from(new Set(found)).slice(0, 6);
}

export function TemplatesView({ isDark, t, L }: { isDark: boolean; t: T; L: 'es' | 'en' }) {
  const s = ui(isDark);
  const [items, setItems] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'portada', description: '', code: '', preview: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/admin/templates');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('No pude cargar las plantillas.', 'Could not load templates.'));
      setItems((data as any).templates || []);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function pickPreview(file?: File) {
    if (!file) return;
    try {
      const img = await compressImage(file, file.name);
      setForm((f) => ({ ...f, preview: img.dataUrl }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/studio/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('No pude guardar.', 'Could not save.'));
      setForm({ name: '', category: 'portada', description: '', code: '', preview: '' });
      setOpen(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string) {
    await fetch(`/api/studio/admin/templates/${id}/toggle`, { method: 'POST' });
    load();
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(t(`¿Borrar la plantilla "${name}"? Dejará de verse en 4haus Studio.`, `Delete template "${name}"?`))) return;
    await fetch(`/api/studio/admin/templates/${id}`, { method: 'DELETE' });
    load();
  }

  const media = foreignMedia(form.code);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={s.heading}>{t('Plantillas de 4haus Studio', '4haus Studio templates')}</h2>
          <p className={`text-sm ${s.muted}`}>
            {t('Pega el prompt o el código de un componente. Aparece en "Plantillas" y en "Crear web", y la IA lo adapta a cada web.', 'Paste a component prompt or code. It shows in Templates and Create website, and the AI adapts it to each site.')}
          </p>
        </div>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className={s.primaryButton}>
            <Plus className="w-4 h-4" /> {t('Agregar plantilla', 'Add template')}
          </button>
        )}
      </div>

      {open && (
        <div className={`${s.card} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{t('Nueva plantilla', 'New template')}</p>
            <button type="button" aria-label={t('Cerrar', 'Close')} onClick={() => setOpen(false)} className={s.ghostButton}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs space-y-1">
              <span className={s.muted}>{t('Nombre', 'Name')}</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('Ej. Video que se expande al hacer scroll', 'E.g. Scroll-expanding video')} className={s.input} />
            </label>
            <label className="block text-xs space-y-1">
              <span className={s.muted}>{t('Tipo', 'Type')}</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={s.input}>
                {CATS.map((c) => (
                  <option key={c.id} value={c.id}>{c[L]}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs space-y-1">
            <span className={s.muted}>{t('Descripción corta (la ven los usuarios)', 'Short description (users see it)')}</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={s.input} />
          </label>
          <label className="block text-xs space-y-1">
            <span className={s.muted}>{t('Prompt o código (por ejemplo, el "Copy prompt" de 21st.dev)', 'Prompt or code (e.g. 21st.dev "Copy prompt")')}</span>
            <textarea value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} rows={10} className={`${s.input} font-mono text-[11px]`} />
            <span className={s.faint}>{form.code.length.toLocaleString('es')} / 60.000</span>
          </label>
          {media.length > 0 && (
            <div className="flex gap-2 rounded-xl p-3 text-xs bg-amber-50 text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {t('Este código trae fotos o videos de otras cuentas. La IA NO los usará: los reemplaza por las fotos del cliente o por formas propias.', 'This code includes media from other accounts. The AI will NOT use them.')}
                <span className="block mt-1 opacity-80 break-all">{media.join(' · ')}</span>
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickPreview(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} className={s.secondaryButton}>
              <ImagePlus className="w-3.5 h-3.5" /> {form.preview ? t('Cambiar imagen de muestra', 'Change preview') : t('Imagen de muestra (captura)', 'Preview image (screenshot)')}
            </button>
            {form.preview && <img src={form.preview} alt="" className="h-12 rounded-lg border border-black/10" />}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={save} disabled={saving} className={s.primaryButton}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('Publicar en 4haus Studio', 'Publish to 4haus Studio')}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className={`text-sm ${s.muted}`}>{t('Cargando…', 'Loading…')}</p>
      ) : items.length === 0 ? (
        <div className={`${s.card} p-8 text-center text-sm ${s.muted}`}>{t('Aún no hay plantillas. Agrega la primera.', 'No templates yet. Add the first one.')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it) => (
            <article key={it.id} className={`${s.card} overflow-hidden ${it.active ? '' : 'opacity-60'}`}>
              <div className={`aspect-[16/9] ${isDark ? 'bg-white/5' : 'bg-black/[0.04]'}`}>{it.preview && <img src={it.preview} alt="" className="w-full h-full object-cover" />}</div>
              <div className="p-3 space-y-1">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{it.name}</p>
                <p className={`text-xs ${s.faint}`}>
                  {(CATS.find((c) => c.id === it.category) || CATS[0])[L]} · {it.codeLength.toLocaleString('es')} {t('caracteres', 'chars')} · {new Date(it.createdAt).toLocaleDateString('es-PE')}
                </p>
                <div className="flex gap-1.5 pt-1">
                  <button type="button" onClick={() => toggle(it.id)} className={s.secondaryButton}>
                    {it.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {it.active ? t('Ocultar', 'Hide') : t('Mostrar', 'Show')}
                  </button>
                  <button type="button" onClick={() => remove(it.id, it.name)} className={s.ghostButton} aria-label={t('Borrar', 'Delete')}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/** Aviso arriba del CRM cuando la IA no puede funcionar por la cuenta (saldo, límite o clave). */
export function AiStatusBanner({ t }: { t: T }) {
  const [alert, setAlert] = useState<{ message: string; action?: { label: string; url: string } } | null>(null);
  useEffect(() => {
    fetch('/api/studio/admin/ai-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAlert(d?.alert || null))
      .catch(() => setAlert(null));
  }, []);
  if (!alert) return null;
  return (
    <div role="alert" className="flex flex-wrap items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-[200px]">
        <p className="font-semibold">{t('La IA de 4haus está detenida', '4haus AI is stopped')}</p>
        <p className="mt-0.5">{alert.message}</p>
      </div>
      {alert.action && (
        <a href={alert.action.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800">
          {alert.action.label}
        </a>
      )}
    </div>
  );
}
