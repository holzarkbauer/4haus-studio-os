import React, { useState } from 'react';
import { Check, ChevronDown, Loader2, Lock, Play } from 'lucide-react';
import { FAQ, INCLUDED, OFFER, type L } from './offer';

// Piezas compartidas por el home y la sales page.

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img src="/Frame_3.svg" alt="" className="w-6 h-6" style={onDark ? { filter: 'invert(1)' } : undefined} />
      <span className="s-display font-semibold text-[17px]">4haus</span>
    </span>
  );
}

export function LangSwitch({ lang, onSetLang, tone = 'light' }: { lang: L; onSetLang: (l: L) => void; tone?: 'light' | 'dark' }) {
  return (
    <div role="group" aria-label={lang === 'en' ? 'Language' : 'Idioma'} className={`flex items-center rounded-full p-0.5 text-[11px] font-bold ${tone === 'dark' ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
      {(['es', 'en'] as L[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSetLang(c)}
          aria-pressed={lang === c}
          className={`px-2.5 py-1 rounded-full cursor-pointer ${lang === c ? (tone === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : tone === 'dark' ? 'text-white/70' : 'text-black/60'}`}
        >
          {c.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Video de ventas. Mientras no haya video grabado, muestra el marco con su lugar reservado. */
export function VslFrame({ lang, url, poster = '/videos/stars.webm' }: { lang: L; url: string; poster?: string }) {
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  if (url && isYouTube) {
    const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/)?.[1];
    return (
      <div className="aspect-video w-full overflow-hidden rounded-[22px] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,.45)]">
        <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`} title={lang === 'en' ? 'Sales video' : 'Video de ventas'} allow="encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  if (url) {
    return <video className="aspect-video w-full rounded-[22px] bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,.45)]" src={url} controls playsInline preload="metadata" />;
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[22px] bg-black text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,.45)]">
      <video className="absolute inset-0 h-full w-full object-cover opacity-60" src={poster} autoPlay muted loop playsInline aria-hidden="true" />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-black">
          <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
        </span>
        <p className="s-display text-lg sm:text-2xl font-semibold">{lang === 'en' ? 'Watch how a website is made in 3 minutes' : 'Mira cómo se crea una web en 3 minutos'}</p>
        <p className="text-xs text-white/60">{lang === 'en' ? 'Video coming soon' : 'Video disponible muy pronto'}</p>
      </div>
    </div>
  );
}

export function IncludedList({ lang, compact = false }: { lang: L; compact?: boolean }) {
  return (
    <ul className={compact ? 'space-y-3' : 'space-y-4'}>
      {INCLUDED.map((it) => (
        <li key={it.title.es} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--s-red)] text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span>
            <span className="block font-bold text-[15px] leading-snug">{it.title[lang]}</span>
            {!compact && <span className="block text-sm text-[var(--s-muted)] mt-0.5">{it.text[lang]}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Formulario de compra. Hasta conectar Mercado Pago, guarda la solicitud en el CRM y el equipo
 * envía el enlace de pago por WhatsApp. El texto lo dice tal cual.
 */
export function CheckoutCard({ lang, id = 'empezar' }: { lang: L; id?: string }) {
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', country: '' });
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError(t('Escribe tu nombre.', 'Enter your name.'));
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError(t('Escribe un correo válido.', 'Enter a valid email.'));
    if (form.whatsapp.replace(/\D/g, '').length < 7) return setError(t('Escribe tu WhatsApp con código de país.', 'Enter your WhatsApp with country code.'));
    if (!agree) return setError(t('Marca la casilla para continuar.', 'Check the box to continue.'));
    setState('sending');
    try {
      const res = await fetch('/api/studio/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contact: `${form.email} · WhatsApp ${form.whatsapp}`,
          business: form.country,
          packageId: 'plan-creador-7',
          message: `Sales page /landing: quiere el Plan Creador de ${OFFER.price} USD/mes.`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || t('No pudimos guardar tus datos. Inténtalo de nuevo.', 'We could not save your details. Try again.'));
      setState('done');
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div id={id} className="rounded-3xl border border-[var(--s-line)] bg-white p-6 sm:p-8 text-center space-y-3" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--s-red)] text-white">
          <Check className="h-6 w-6" strokeWidth={3} />
        </span>
        <p className="s-display text-2xl font-semibold">{t('Tu lugar está reservado', 'Your spot is reserved')}</p>
        <p className="text-[var(--s-muted)]">
          {t(`Te escribimos por WhatsApp en menos de 24 horas con tu enlace de pago de ${OFFER.price} USD y los pasos para entrar.`, `We will message you on WhatsApp within 24 hours with your ${OFFER.price} USD payment link and how to get in.`)}
        </p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={submit} className="rounded-3xl border border-[var(--s-line)] bg-white p-6 sm:p-8 space-y-5" noValidate>
      <div>
        <p className="s-display text-2xl font-semibold leading-tight">{t('Empieza hoy', 'Start today')}</p>
        <p className="text-sm text-[var(--s-muted)] mt-1">{t(`Plan Creador · ${OFFER.price} USD al mes · cancela cuando quieras`, `Creator plan · ${OFFER.price} USD a month · cancel anytime`)}</p>
      </div>
      <div className="grid gap-1">
        <label className="sr-only" htmlFor={`${id}-name`}>{t('Nombre', 'Name')}</label>
        <input id={`${id}-name`} className="s-field" placeholder={t('Tu nombre', 'Your name')} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="sr-only" htmlFor={`${id}-email`}>{t('Correo', 'Email')}</label>
        <input id={`${id}-email`} className="s-field" type="email" placeholder={t('Tu correo de Google', 'Your Google email')} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="sr-only" htmlFor={`${id}-wa`}>WhatsApp</label>
        <input id={`${id}-wa`} className="s-field" type="tel" placeholder={t('WhatsApp con código de país', 'WhatsApp with country code')} autoComplete="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        <label className="sr-only" htmlFor={`${id}-country`}>{t('País', 'Country')}</label>
        <input id={`${id}-country`} className="s-field" placeholder={t('País y ciudad', 'Country and city')} autoComplete="country-name" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      </div>
      <div className="flex items-baseline justify-between border-t border-[var(--s-line)] pt-4 text-sm">
        <span className="font-semibold">{t('Total hoy', 'Total today')}</span>
        <span className="s-display text-2xl font-bold">{OFFER.price} USD</span>
      </div>
      <label className="flex gap-2.5 text-xs text-[var(--s-muted)] leading-relaxed cursor-pointer">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--s-red)]" />
        <span>
          {t(`Entiendo que el Plan Creador cuesta ${OFFER.price} USD al mes, que se renueva cada mes y que puedo cancelarlo cuando quiera. Acepto los `, `I understand the Creator plan costs ${OFFER.price} USD a month, renews monthly and I can cancel anytime. I accept the `)}
          <a href="/terminos-creadores" className="underline">{t('Términos del Programa de creadores', 'Creator Program Terms')}</a>.
        </span>
      </label>
      {error && <p className="text-sm text-[var(--s-red-press)]" role="alert">{error}</p>}
      <button type="submit" disabled={state === 'sending'} className="s-btn-red w-full text-base py-4">
        {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
        {t(`Quiero empezar por ${OFFER.price} USD`, `Start for ${OFFER.price} USD`)}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--s-muted)]">
        <Lock className="h-3 w-3" /> {t('Te enviamos el enlace de pago seguro (Mercado Pago) por WhatsApp.', 'We send you the secure payment link (Mercado Pago) on WhatsApp.')}
      </p>
    </form>
  );
}

export function FaqList({ lang }: { lang: L }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q.es}>
            <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-[17px] cursor-pointer">
              {f.q[lang]}
              <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <p className="pb-5 pr-8 text-[var(--s-muted)] leading-relaxed">{f.a[lang]}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function SalesFooter({ lang }: { lang: L }) {
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Logo onDark />
          <p className="max-w-sm text-white/70">{t('Webs con IA que tú creas y vendes. Lo que cobras es tuyo.', 'AI websites you create and sell. What you charge is yours.')}</p>
        </div>
        <nav className="grid grid-cols-2 gap-6 text-sm" aria-label={t('Enlaces', 'Links')}>
          <div className="space-y-2.5">
            <p className="text-white/50">4haus</p>
            <a className="block hover:underline" href="/app">4haus Studio</a>
            <a className="block hover:underline" href="/landing">{t('Plan Creador', 'Creator plan')}</a>
            <a className="block hover:underline" href="/creadores">{t('Programa de creadores', 'Creator program')}</a>
          </div>
          <div className="space-y-2.5">
            <p className="text-white/50">{t('Legal', 'Legal')}</p>
            <a className="block hover:underline" href="/condiciones">{t('Condiciones de venta', 'Terms of sale')}</a>
            <a className="block hover:underline" href="/terminos-creadores">{t('Términos de creadores', 'Creator terms')}</a>
          </div>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-10 text-[11px] leading-relaxed text-white/45 border-t border-white/10 pt-6">
        © {new Date().getFullYear()} 4haus Studio.{' '}
        {t(
          'Aviso: 4haus no promete ingresos. Los ejemplos son ilustrativos; tus resultados dependen de tu trabajo, tu mercado y tus clientes.',
          'Notice: 4haus does not promise income. Examples are illustrative; your results depend on your work, your market and your clients.'
        )}
      </div>
    </footer>
  );
}
