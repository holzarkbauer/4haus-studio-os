import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';
import { ui } from '../ui/tokens';
import { askDaniel } from './GuidedFlow';
import { HOME_TEMPLATES } from './HomeTemplatesShowcase';
import { PackagesModal } from './PackagesModal';
import { getWorkspaceId } from '../utils/workspaceId';

const GUEST_SITES_KEY = '4haus_guest_sites';
function readGuestSites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_SITES_KEY) || '[]');
  } catch {
    return [];
  }
}
function rememberGuestSite(id: string) {
  try {
    localStorage.setItem(GUEST_SITES_KEY, JSON.stringify(Array.from(new Set([id, ...readGuestSites()])).slice(0, 5)));
  } catch {
    /* sin almacenamiento: no es grave */
  }
}

// Creador de webs: describe → Daniel diseña la maqueta con portada 3D → cambios → descarga.
// La vista previa corre en un iframe aislado (sin acceso a la app ni a la sesión).

interface SiteChange {
  instruction: string;
  summary: string;
  at: string;
}

interface SiteView {
  id: string;
  title: string;
  brief: string;
  status: 'generating' | 'editing' | 'ready' | 'error';
  error?: string;
  changes: SiteChange[];
  paid: boolean;
  sample?: boolean;
  canUndo: boolean;
  previewHtml: string;
  updatedAt: string;
}

interface SiteEntry {
  id: string;
  title: string;
  status: string;
  paid: boolean;
  updatedAt: string;
}

interface WebsiteStudioProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  userId?: string | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
  /** Texto que llega desde la casilla del inicio o una plantilla: arranca la creación. */
  startBrief?: string | null;
  onStartConsumed?: () => void;
}

const STEPS = { es: ['Describe', 'Maqueta', 'Ajustes', 'Descarga'], en: ['Describe', 'Mockup', 'Tweaks', 'Download'] };

export function WebsiteStudio({ lang, themeMode = 'light', userId, isLoggingIn, onGoogleLogin, startBrief, onStartConsumed }: WebsiteStudioProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);

  const [brief, setBrief] = useState('');
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [limits, setLimits] = useState<{ generationsLeft: number; editsLeft: number } | null>(null);
  const [aiReady, setAiReady] = useState(true);
  const [site, setSite] = useState<SiteView | null>(null);
  const [instruction, setInstruction] = useState('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  // Solo para administradores: solicitudes de llamada que dejaron las empresas.
  const [leads, setLeads] = useState<any[] | null>(null);
  const guest = !userId;
  const pollRef = useRef<number | null>(null);

  const working = site && (site.status === 'generating' || site.status === 'editing');
  const step = !site ? 0 : site.status === 'generating' ? 1 : site.changes.length ? 2 : 1;

  async function readError(res: Response, fallback: string) {
    const data = await res.json().catch(() => ({}));
    return String((data as any).error || fallback);
  }

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/studio/sites');
      if (!res.ok) return;
      const data = await res.json();
      setSites(Array.isArray(data.sites) ? data.sites : []);
      setLimits(data.limits || null);
      setAiReady(Boolean(data.aiReady));
    } catch {
      /* sin conexión: la lista queda vacía */
    }
  }, [userId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!userId) return setLeads(null);
    fetch('/api/studio/admin/leads')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLeads(d?.leads || null))
      .catch(() => setLeads(null));
  }, [userId]);

  // Consulta el estado mientras Daniel trabaja.
  useEffect(() => {
    if (!site || !working) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/studio/sites/${site.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.site) {
          setSite(data.site);
          if (data.site.status === 'ready' || data.site.status === 'error') loadList();
        }
      } catch {
        /* se reintenta en el siguiente ciclo */
      }
    }, 4000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [site?.id, working, loadList]);

  async function create(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/studio/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: clean }),
      });
      if (!res.ok) {
        const msg = await readError(res, t('No pude empezar tu web.', 'Could not start your website.'));
        if (res.status === 403 || res.status === 429) setShowPackages(!userId);
        throw new Error(msg);
      }
      const data = await res.json();
      setSite(data.site);
      if (!userId && data.site?.id) rememberGuestSite(data.site.id);
      setBrief('');
      loadList();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Si llega un pedido desde el inicio o una plantilla, se arranca solo (con sesión).
  useEffect(() => {
    if (!startBrief) return;
    create(startBrief);
    onStartConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBrief, userId]);

  // Al registrarse, la maqueta hecha como visitante pasa a la cuenta.
  useEffect(() => {
    if (!userId) return;
    const ids = readGuestSites();
    if (!ids.length) return;
    (async () => {
      try {
        const res = await fetch('/api/studio/sites/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonId: getWorkspaceId(null), siteIds: ids }),
        });
        if (res.ok) {
          localStorage.removeItem(GUEST_SITES_KEY);
          loadList();
          if (site) openSite(site.id);
        }
      } catch {
        /* se reintenta en el próximo inicio de sesión */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function openSite(id: string) {
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/studio/sites/${id}`);
    if (res.ok) setSite((await res.json()).site);
    else setError(await readError(res, t('No pude abrir esa web.', 'Could not open that website.')));
  }

  async function sendEdit() {
    if (!site || !instruction.trim() || busy) return;
    if (guest) {
      setShowPackages(true);
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/studio/sites/${site.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });
      if (!res.ok) throw new Error(await readError(res, t('No pude enviar el cambio.', 'Could not send the change.')));
      setSite((await res.json()).site);
      setInstruction('');
      loadList();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    if (!site) return;
    const res = await fetch(`/api/studio/sites/${site.id}/undo`, { method: 'POST' });
    if (res.ok) setSite((await res.json()).site);
    else setError(await readError(res, t('No pude deshacer.', 'Could not undo.')));
  }

  async function download() {
    if (!site) return;
    setError(null);
    if (guest) {
      setShowPackages(true);
      return;
    }
    const res = await fetch(`/api/studio/sites/${site.id}/download`);
    if (res.status === 402) {
      setShowPackages(true);
      return;
    }
    if (!res.ok) {
      setError(await readError(res, t('No pude descargar.', 'Could not download.')));
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.title || 'mi-web'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openInTab() {
    if (!site?.previewHtml) return;
    const url = URL.createObjectURL(new Blob([site.previewHtml], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  const stepper = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
      {STEPS[isEn ? 'en' : 'es'].map((label, i) => (
        <React.Fragment key={label}>
          <span className={`inline-flex items-center gap-1.5 ${i <= step ? (isDark ? 'text-white' : 'text-[#1D1D1F]') : s.faint}`}>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold border ${
                i < step
                  ? isDark
                    ? 'bg-white text-black border-white'
                    : 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                  : i === step
                  ? isDark
                    ? 'border-white'
                    : 'border-[#1D1D1F]'
                  : isDark
                  ? 'border-white/20'
                  : 'border-black/15'
              }`}
            >
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className="font-medium">{label}</span>
          </span>
          {i < 3 && <span className={`w-3 h-px ${isDark ? 'bg-white/15' : 'bg-black/10'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  // ------------------------------------------------------------ paso 1: describir
  if (!site) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-8">
        <div className="space-y-3">
          {stepper}
          <h2 className={s.title}>{t('Crea tu web', 'Create your website')}</h2>
          <p className={s.muted}>
            {t(
              'Cuéntale a Daniel qué negocio es, a quién le vendes y qué quieres mostrar. En 1 a 3 minutos tendrás una maqueta con portada 3D.',
              'Tell Daniel what the business is, who it sells to and what to show. In 1–3 minutes you get a mockup with a 3D hero.'
            )}
          </p>
        </div>

        {!aiReady && (
          <div className={`${s.card} p-4 text-sm ${s.muted}`}>
            {t('El creador de webs aún no tiene conectada la IA en el servidor. Vuelve a intentarlo pronto.', 'The website builder is not connected to AI yet. Please try again soon.')}
          </div>
        )}

        <div className={`${s.card} p-4 space-y-3`}>
          <label htmlFor="ws-brief" className="sr-only">
            {t('Describe tu web', 'Describe your website')}
          </label>
          <textarea
            id="ws-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={5}
            placeholder={t(
              'Ej. Web para una cafetería de especialidad en Miraflores. Portada oscura con una taza 3D que gira al hacer scroll, menú, horarios y botón para reservar.',
              'E.g. Website for a specialty coffee shop. Dark hero with a 3D cup that rotates on scroll, menu, hours and a booking button.'
            )}
            className={`${s.input} resize-none border-0 px-1 focus:border-0`}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`text-xs ${s.faint}`}>
              {guest
                ? t('Tu primera maqueta es gratis, sin registro.', 'Your first mockup is free, no sign-up.')
                : limits
                ? t(`Te quedan ${limits.generationsLeft} webs nuevas hoy`, `${limits.generationsLeft} new websites left today`)
                : ''}
            </span>
            <button type="button" onClick={() => create(brief)} disabled={busy || brief.trim().length < 15 || !aiReady} className={s.primaryButton}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {t('Crear maqueta', 'Create mockup')}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-3">
          <h3 className={s.heading}>{t('Empieza desde una plantilla', 'Start from a template')}</h3>
          <div className="flex flex-wrap gap-2">
            {HOME_TEMPLATES.map((tpl) => (
              <button key={tpl.id} type="button" onClick={() => setBrief(tpl.prompt[isEn ? 'en' : 'es'])} className={s.chip(false)}>
                {tpl.name[isEn ? 'en' : 'es']}
              </button>
            ))}
          </div>
        </div>

        {sites.length > 0 && (
          <div className="space-y-3">
            <h3 className={s.heading}>{t('Tus webs', 'Your websites')}</h3>
            <div className={`${s.card} divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
              {sites.map((it) => (
                <button key={it.id} type="button" onClick={() => openSite(it.id)} className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-black/[0.02]">
                  <span className="min-w-0">
                    <span className={`block text-sm font-medium truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{it.title}</span>
                    <span className={`block text-xs ${s.faint}`}>
                      {it.status === 'ready'
                        ? t('Lista', 'Ready')
                        : it.status === 'error'
                        ? t('Con error', 'Failed')
                        : t('Daniel trabajando…', 'Daniel working…')}
                      {' · '}
                      {new Date(it.updatedAt).toLocaleDateString(isEn ? 'en-US' : 'es-PE')}
                    </span>
                  </span>
                  <ArrowRight className={`w-4 h-4 shrink-0 ${s.faint}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {leads && (
          <div className="space-y-3">
            <h3 className={s.heading}>{t(`Solicitudes de llamada (${leads.length})`, `Call requests (${leads.length})`)}</h3>
            <p className={`text-xs ${s.faint}`}>{t('Solo tú lo ves, como administrador.', 'Only you see this, as an admin.')}</p>
            <div className={`${s.card} divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
              {leads.length === 0 && <p className={`px-4 py-3 text-sm ${s.muted}`}>{t('Aún no hay solicitudes.', 'No requests yet.')}</p>}
              {leads.map((l) => (
                <div key={l.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                      {l.name}
                      {l.business ? ` · ${l.business}` : ''}
                    </span>
                    <span className={`text-xs ${s.faint}`}>{new Date(l.createdAt).toLocaleString(isEn ? 'en-US' : 'es-PE')}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${s.muted}`}>
                    {l.contact} · {l.packageId}
                    {l.upgrades?.length ? ` + ${l.upgrades.join(', ')}` : ''}
                  </p>
                  {l.message && <p className={`text-xs mt-1 ${s.muted}`}>“{l.message}”</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="button" onClick={() => askDaniel(t('¿Cómo describo bien mi web para que quede profesional?', 'How do I describe my website so it looks professional?'))} className={s.ghostButton}>
          {t('Pedirle ayuda a Daniel', 'Ask Daniel for help')}
        </button>
      <PackagesModal lang={lang} themeMode={themeMode} siteId={site?.id} isOpen={showPackages} onClose={() => setShowPackages(false)} onCreatorSignIn={guest ? onGoogleLogin : undefined} />
      </div>
    );
  }

  // ------------------------------------------------------------ pasos 2–4: maqueta, ajustes, descarga
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-7.5rem)] min-h-[560px]">
      <aside className={`${s.card} lg:w-[340px] shrink-0 flex flex-col overflow-hidden`}>
        <div className={`p-4 border-b ${s.divider} space-y-3`}>
          <button type="button" onClick={() => { setSite(null); loadList(); }} className={s.ghostButton}>
            <ArrowLeft className="w-3.5 h-3.5" /> {t('Tus webs', 'Your websites')}
          </button>
          <div>
            <h2 className={`${s.heading} truncate`}>{site.title}</h2>
            <p className={`text-xs mt-0.5 line-clamp-2 ${s.faint}`}>{site.brief}</p>
          </div>
          {stepper}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          {site.status === 'generating' && (
            <p className={s.muted}>{t('Daniel está diseñando tu web con portada 3D. Suele tardar entre 1 y 3 minutos.', 'Daniel is designing your website with a 3D hero. It usually takes 1–3 minutes.')}</p>
          )}
          {site.status === 'editing' && <p className={s.muted}>{t('Aplicando tu cambio…', 'Applying your change…')}</p>}
          {site.status === 'error' && <p className="text-red-600">{site.error}</p>}
          {site.status === 'ready' && site.error && <p className="text-amber-700">{site.error}</p>}
          {site.status === 'ready' && guest && (
            <p className={s.muted}>
              {t('Esta es tu maqueta de muestra: portada 3D y las secciones principales. La versión completa se termina contigo en la llamada.', 'This is your sample mockup: 3D hero and the main sections. The full version is finished with you on the call.')}
            </p>
          )}
          {site.status === 'ready' && !guest && !site.changes.length && (
            <p className={s.muted}>
              {t('Tu maqueta está lista. Pide cambios en lenguaje normal: “cambia el color a verde oliva”, “agrega una sección de precios”.', 'Your mockup is ready. Ask for changes in plain words: “make it olive green”, “add a pricing section”.')}
            </p>
          )}
          {site.changes.map((c, i) => (
            <div key={`${c.at}-${i}`} className={`rounded-xl p-3 ${s.soft}`}>
              <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{c.instruction}</p>
              <p className={`text-xs mt-1 ${s.muted}`}>{c.summary}</p>
            </div>
          ))}
        </div>

        <div className={`p-4 border-t ${s.divider} space-y-2`}>
          {guest && site.status === 'ready' ? (
            <div className="space-y-2">
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{t('¿Te gusta tu web?', 'Like your website?')}</p>
              <p className={`text-xs ${s.muted}`}>
                {t('Esta es una muestra. Agenda una llamada para completarla y publicarla en tu dominio (desde 500 USD).', 'This is a sample. Book a call to complete it and publish it on your domain (from $500).')}
              </p>
              <button type="button" onClick={() => setShowPackages(true)} className={`${s.primaryButton} w-full`}>
                {t('Ver paquetes y agendar llamada', 'See packages and book a call')}
              </button>
              <button type="button" onClick={onGoogleLogin} disabled={isLoggingIn} className={`${s.secondaryButton} w-full justify-center`}>
                {t('Soy creador: registrarme', 'I am a creator: sign up')}
              </button>
            </div>
          ) : site.status === 'error' ? (
            <button type="button" onClick={() => create(site.brief)} disabled={busy} className={`${s.primaryButton} w-full`}>
              {t('Intentar de nuevo', 'Try again')}
            </button>
          ) : (
            <>
              <label htmlFor="ws-edit" className="sr-only">{t('Cambio que quieres', 'Change you want')}</label>
              <textarea
                id="ws-edit"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendEdit();
                  }
                }}
                rows={2}
                disabled={Boolean(working)}
                placeholder={t('¿Qué quieres cambiar?', 'What would you like to change?')}
                className={`${s.input} resize-none`}
              />
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] ${s.faint}`}>{limits ? t(`${limits.editsLeft} cambios hoy`, `${limits.editsLeft} changes today`) : ''}</span>
                <button type="button" onClick={sendEdit} disabled={busy || Boolean(working) || instruction.trim().length < 4} className={s.primaryButton}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t('Aplicar cambio', 'Apply change')}
                </button>
              </div>
            </>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </aside>

      <section className={`${s.card} flex-1 flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between gap-2 px-3 py-2 border-b ${s.divider}`}>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={t('Vista de escritorio', 'Desktop view')} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} className={s.chip(device === 'desktop')}>
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button type="button" aria-label={t('Vista de móvil', 'Mobile view')} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} className={s.chip(device === 'mobile')}>
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {site.canUndo && site.status === 'ready' && (
              <button type="button" onClick={undo} className={s.secondaryButton}>
                <RotateCcw className="w-3.5 h-3.5" /> {t('Deshacer', 'Undo')}
              </button>
            )}
            <button type="button" onClick={openInTab} disabled={!site.previewHtml} className={s.secondaryButton}>
              <ExternalLink className="w-3.5 h-3.5" /> {t('Abrir', 'Open')}
            </button>
            <button type="button" onClick={download} disabled={!site.previewHtml || Boolean(working)} className={s.primaryButton}>
              <Download className="w-4 h-4" /> {guest ? t('Quiero esta web', 'I want this website') : t('Descargar', 'Download')}
            </button>
          </div>
        </div>
        {notice && <div className={`px-4 py-2 text-xs border-b ${s.divider} ${s.muted}`}>{notice}</div>}

        <div className={`flex-1 overflow-auto flex justify-center ${s.soft}`}>
          {site.previewHtml ? (
            <iframe
              key={`${site.id}-${site.updatedAt}`}
              title={t('Vista previa de tu web', 'Website preview')}
              srcDoc={site.previewHtml}
              sandbox="allow-scripts"
              className={`bg-white h-full transition-all ${device === 'mobile' ? 'w-[390px] my-4 rounded-[28px] border border-black/10 shadow-sm' : 'w-full'}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center px-6">
              {site.status === 'error' ? null : <Loader2 className={`w-6 h-6 animate-spin ${s.faint}`} />}
              <p className={`text-sm ${s.muted}`}>
                {site.status === 'error' ? t('Esta web no se pudo crear.', 'This website could not be created.') : t('Diseñando la portada 3D…', 'Designing the 3D hero…')}
              </p>
            </div>
          )}
        </div>
      </section>
      <PackagesModal lang={lang} themeMode={themeMode} siteId={site?.id} isOpen={showPackages} onClose={() => setShowPackages(false)} onCreatorSignIn={guest ? onGoogleLogin : undefined} />
    </div>
  );
}
