import React, { useCallback, useEffect, useState } from 'react';
import { Check, Instagram, KeyRound, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { ui } from '../ui/tokens';

// Programa de creadores (y canje de códigos del equipo).
// 1) Sin código: lo pide con su Instagram.  2) Con código: inicia sesión y lo canjea.
// 3) José, como administrador, ve las solicitudes y aprueba a los creadores.

interface Profile {
  uid: string;
  type: 'A' | 'B' | 'C' | 'D' | 'CR';
  status: 'pending' | 'approved' | 'rejected';
  instagram: string;
  name: string;
  label: string;
  redeemedAt: string;
}

interface AccessRequest {
  id: string;
  name: string;
  instagram: string;
  contact: string;
  why: string;
  createdAt: string;
}

interface CreatorProgramProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  userId?: string | null;
  isLoggingIn?: boolean;
  onGoogleLogin?: () => void;
}

const PLANS = [
  { price: { es: '0 USD', en: '$0' }, note: { es: 'Hasta 3 maquetas', en: 'Up to 3 mockups' } },
  { price: { es: '1 USD', en: '$1' }, note: { es: 'Prueba de 7 días', en: '7-day trial' } },
  { price: { es: '7 USD/mes', en: '$7/mo' }, note: { es: '+ extras a elección', en: '+ optional extras' } },
  { price: { es: '27 USD/mes', en: '$27/mo' }, note: { es: '+ extras a elección', en: '+ optional extras' } },
  { price: { es: '47 USD/mes', en: '$47/mo' }, note: { es: '+ extras a elección', en: '+ optional extras' } },
];

export function CreatorProgram({ lang, themeMode = 'light', userId, isLoggingIn, onGoogleLogin }: CreatorProgramProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const s = ui(isDark);
  const t = (es: string, en: string) => (isEn ? en : es);
  const L = isEn ? 'en' : 'es';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [admin, setAdmin] = useState<{ requests: AccessRequest[]; profiles: Profile[] } | null>(null);
  const [req, setReq] = useState({ name: '', instagram: '', contact: '', why: '' });
  const [reqSent, setReqSent] = useState(false);
  const [code, setCode] = useState({ code: '', instagram: '' });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ where: string; msg: string } | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setAdmin(null);
      return;
    }
    try {
      const me = await fetch('/api/studio/access/me').then((r) => r.json());
      setProfile(me.profile || null);
      if (me.admin) {
        const a = await fetch('/api/studio/admin/access');
        setAdmin(a.ok ? await a.json() : null);
      } else setAdmin(null);
    } catch {
      /* sin conexión */
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function post(where: string, url: string, body: unknown) {
    setBusy(where);
    setError(null);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('Algo falló. Inténtalo de nuevo.', 'Something failed. Try again.'));
      return data;
    } catch (e) {
      setError({ where, msg: (e as Error).message });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    if (await post('request', '/api/studio/access/request', req)) setReqSent(true);
  }

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    const data = await post('redeem', '/api/studio/access/redeem', code);
    if (data?.profile) {
      setProfile(data.profile);
      load();
    }
  }

  async function review(uid: string, status: 'approved' | 'rejected') {
    if (await post(`review-${uid}`, `/api/studio/admin/access/${uid}`, { status })) load();
  }

  const statusText = (p: Profile) =>
    p.status === 'approved'
      ? t('Activa', 'Active')
      : p.status === 'rejected'
      ? t('No aprobada', 'Not approved')
      : t('En revisión: revisamos tu Instagram y te avisamos.', 'Under review: we check your Instagram and let you know.');

  const err = (where: string) => (error?.where === where ? <p className="text-sm text-red-600">{error.msg}</p> : null);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10">
      <div className="space-y-3">
        <h2 className={s.title}>{t('Programa de creadores', 'Creator program')}</h2>
        <p className={`${s.muted} max-w-2xl`}>
          {t(
            'Crea webs con IA para tus clientes y quédate con el 100% de cada venta. Entras con un código de referido, una cuenta de Instagram y el compromiso de crear contenido.',
            'Build AI websites for your clients and keep 100% of every sale. You join with a referral code, an Instagram account and a commitment to create content.'
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className={`${s.card} p-5 space-y-3`}>
          <h3 className={s.heading}>{t('Opción 1 · Compra al 50%', 'Option 1 · Buy at 50%')}</h3>
          <p className={`text-sm ${s.muted}`}>
            {t('Pagas una sola vez la mitad del precio para empresas y revendes al precio que quieras.', 'Pay once, half of the business price, and resell at any price you like.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {[250, 500, 1000, 1500].map((v) => (
              <span key={v} className={s.chip(false)}>
                {v.toLocaleString('en-US')} USD
              </span>
            ))}
          </div>
          <p className={`text-xs ${s.faint}`}>{t('+ extras a elección (también al 50%).', '+ optional extras (also at 50%).')}</p>
        </div>
        <div className={`${s.card} p-5 space-y-3`}>
          <h3 className={s.heading}>{t('Opción 2 · Suscripción mensual', 'Option 2 · Monthly subscription')}</h3>
          <p className={`text-sm ${s.muted}`}>
            {t('Pagas un plan cada mes y creas las webs que tu plan permite. Lo que cobras a tu cliente es 100% tuyo.', 'Pay a monthly plan and build the websites it allows. What you charge your client is 100% yours.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {PLANS.map((p) => (
              <span key={p.price.es} className={s.chip(false)} title={p.note[L]}>
                {p.price[L]} <span className="opacity-60">· {p.note[L]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={`${s.card} p-5 -mt-4 space-y-1`}>
        <h3 className={s.heading}>{t('Gana 10% por cada referido', 'Earn 10% per referral')}</h3>
        <p className={`text-sm ${s.muted}`}>
          {t(
            'Cualquier persona puede recomendar el curso de 4haus (2.000 USD) o el modelo de negocio completo. Si tu referido compra con tu código, ganas el 10%. Se paga cuando completó su pago y venció su plazo de reembolso.',
            'Anyone can recommend the 4haus course ($2,000) or the complete business model. If your referral buys with your code, you earn 10%. Paid once they complete payment and the refund period ends.',
          )}
        </p>
      </div>
      <p className={`text-xs -mt-6 ${s.faint}`}>{t('Los cobros con Mercado Pago se activan muy pronto.', 'Mercado Pago payments are coming very soon.')}</p>

      {profile ? (
        <div className={`${s.card} p-5 flex items-start gap-3`}>
          <Check className={`w-5 h-5 mt-0.5 shrink-0 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`} />
          <div>
            <p className={s.heading}>
              {t('Tu cuenta:', 'Your account:')} {profile.label}
            </p>
            <p className={`text-sm mt-1 ${s.muted}`}>{statusText(profile)}</p>
            {profile.instagram && <p className={`text-xs mt-1 ${s.faint}`}>@{profile.instagram}</p>}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <form onSubmit={sendRequest} className={`${s.card} p-5 space-y-3`}>
            <h3 className={`${s.heading} flex items-center gap-2`}>
              <Instagram className="w-4 h-4" /> {t('¿No tienes código? Pídelo', 'No code yet? Request one')}
            </h3>
            {reqSent ? (
              <p className={`text-sm ${s.muted}`}>{t('¡Recibido! Revisamos tu Instagram y te enviamos tu código.', 'Received! We review your Instagram and send you your code.')}</p>
            ) : (
              <>
                <div>
                  <label htmlFor="cr-name" className={s.label}>{t('Nombre', 'Name')}</label>
                  <input id="cr-name" required value={req.name} onChange={(e) => setReq({ ...req, name: e.target.value })} className={s.input} />
                </div>
                <div>
                  <label htmlFor="cr-ig" className={s.label}>{t('Usuario de Instagram', 'Instagram handle')}</label>
                  <input id="cr-ig" required placeholder="@tu.usuario" value={req.instagram} onChange={(e) => setReq({ ...req, instagram: e.target.value })} className={s.input} />
                </div>
                <div>
                  <label htmlFor="cr-contact" className={s.label}>{t('WhatsApp o correo', 'WhatsApp or email')}</label>
                  <input id="cr-contact" required value={req.contact} onChange={(e) => setReq({ ...req, contact: e.target.value })} className={s.input} />
                </div>
                <div>
                  <label htmlFor="cr-why" className={s.label}>{t('¿Qué contenido creas o crearás? (opcional)', 'What content do or will you create? (optional)')}</label>
                  <textarea id="cr-why" rows={2} value={req.why} onChange={(e) => setReq({ ...req, why: e.target.value })} className={`${s.input} resize-none`} />
                </div>
                {err('request')}
                <button type="submit" disabled={busy === 'request'} className={s.primaryButton}>
                  {busy === 'request' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t('Pedir mi código', 'Request my code')}
                </button>
              </>
            )}
          </form>

          <form onSubmit={redeem} className={`${s.card} p-5 space-y-3`}>
            <h3 className={`${s.heading} flex items-center gap-2`}>
              <KeyRound className="w-4 h-4" /> {t('Ya tengo código', 'I have a code')}
            </h3>
            <p className={`text-xs ${s.faint}`}>{t('Sirve para creadores y para el equipo de 4haus.', 'For creators and the 4haus team.')}</p>
            {!userId ? (
              <button type="button" onClick={onGoogleLogin} disabled={isLoggingIn} className={s.primaryButton}>
                {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t('Iniciar sesión con Google para canjearlo', 'Sign in with Google to redeem it')}
              </button>
            ) : (
              <>
                <div>
                  <label htmlFor="cr-code" className={s.label}>{t('Código', 'Code')}</label>
                  <input id="cr-code" required autoComplete="off" placeholder="4H-XXX-XXXX-XXXX-XXXX-XXXX-XXXX" value={code.code} onChange={(e) => setCode({ ...code, code: e.target.value })} className={`${s.input} font-mono`} />
                </div>
                <div>
                  <label htmlFor="cr-ig2" className={s.label}>{t('Usuario de Instagram (obligatorio para creadores)', 'Instagram handle (required for creators)')}</label>
                  <input id="cr-ig2" placeholder="@tu.usuario" value={code.instagram} onChange={(e) => setCode({ ...code, instagram: e.target.value })} className={s.input} />
                </div>
                {err('redeem')}
                <button type="submit" disabled={busy === 'redeem'} className={s.primaryButton}>
                  {busy === 'redeem' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t('Canjear código', 'Redeem code')}
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {admin && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className={s.heading}>{t('Administración', 'Admin')}</h3>
            <p className={`text-xs ${s.faint}`}>{t('Solo tú lo ves.', 'Only you can see this.')}</p>
          </div>

          <div className="space-y-2">
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
              {t(`Cuentas con código (${admin.profiles.length})`, `Accounts with a code (${admin.profiles.length})`)}
            </h4>
            <div className={`${s.card} divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
              {admin.profiles.length === 0 && <p className={`px-4 py-3 text-sm ${s.muted}`}>{t('Aún no hay cuentas.', 'No accounts yet.')}</p>}
              {admin.profiles.map((p) => (
                <div key={p.uid} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                      {p.label}
                      {p.instagram && (
                        <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener" className="ml-2 underline font-normal">
                          @{p.instagram}
                        </a>
                      )}
                    </p>
                    <p className={`text-xs ${s.faint}`}>
                      {statusText(p)} · {new Date(p.redeemedAt).toLocaleDateString(isEn ? 'en-US' : 'es-PE')}
                    </p>
                  </div>
                  {p.type === 'CR' && (
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => review(p.uid, 'approved')} disabled={busy === `review-${p.uid}` || p.status === 'approved'} className={s.secondaryButton}>
                        {t('Aprobar', 'Approve')}
                      </button>
                      <button type="button" onClick={() => review(p.uid, 'rejected')} disabled={busy === `review-${p.uid}` || p.status === 'rejected'} className={s.secondaryButton}>
                        {t('Rechazar', 'Reject')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
              {t(`Solicitudes de código (${admin.requests.length})`, `Code requests (${admin.requests.length})`)}
            </h4>
            <div className={`${s.card} divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'}`}>
              {admin.requests.length === 0 && <p className={`px-4 py-3 text-sm ${s.muted}`}>{t('Aún no hay solicitudes.', 'No requests yet.')}</p>}
              {admin.requests.map((r) => (
                <div key={r.id} className="px-4 py-3 text-sm">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                    {r.name}
                    <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noopener" className="ml-2 underline font-normal">
                      @{r.instagram}
                    </a>
                  </p>
                  <p className={`text-xs ${s.muted}`}>
                    {r.contact} · {new Date(r.createdAt).toLocaleDateString(isEn ? 'en-US' : 'es-PE')}
                  </p>
                  {r.why && <p className={`text-xs mt-1 ${s.muted}`}>“{r.why}”</p>}
                </div>
              ))}
            </div>
            <p className={`text-xs ${s.faint}`}>{t('Para responder, envía a la persona un código de la hoja "Creadores" de tu Excel y anótalo ahí.', 'To reply, send the person a code from the "Creadores" sheet in your Excel and log it there.')}</p>
          </div>
          {err(`review-`)}
        </div>
      )}
    </div>
  );
}
