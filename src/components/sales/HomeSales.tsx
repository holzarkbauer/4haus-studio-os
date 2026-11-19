import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Play, X } from 'lucide-react';
import { FaqList, LangSwitch, Logo, SalesFooter, VslFrame } from './SalesParts';
import { OFFER, SHOWCASE, TESTIMONIALS, type L } from './offer';

// Home de 4haus.us, diseñado para vender: aviso arriba, portada oscura con titular grande,
// resultado concreto, fundador, qué hay dentro, lo que puedes crear, precios y preguntas.

interface Props {
  lang: L;
  onSetLang: (l: L) => void;
  onOpenApp: () => void;
  onOpenBooking: () => void;
}

export function HomeSales({ lang, onSetLang, onOpenApp, onOpenBooking }: Props) {
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  const [banner, setBanner] = useState(true);
  const [openItem, setOpenItem] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    document.title = t('4haus Studio — Crea webs con IA y véndelas', '4haus Studio — Create websites with AI and sell them');
  }, [lang]);

  const toLanding = () => {
    window.location.href = '/landing';
  };

  const inside = [
    [t('Crear web con IA', 'Create websites with AI'), t('Describe el negocio y obtén una maqueta con portada 3D en 1 a 3 minutos. Pide cambios en palabras simples y deshaz cuando quieras.', 'Describe the business and get a mockup with a 3D hero in 1 to 3 minutes. Ask for changes in plain words and undo anytime.')],
    [t('Plantillas y estilos nuevos cada día', 'Templates and new styles every day'), t('Portadas, fondos animados y secciones. Eliges una y la IA la adapta con las fotos y textos de tu cliente.', 'Heroes, animated backgrounds and sections. Pick one and the AI adapts it with your client’s photos and copy.')],
    [t('Referencias propias', 'Your own references'), t('Adjunta hasta 5 fotos, el zip de una página que te guste y los datos del negocio de Google Maps.', 'Attach up to 5 photos, the zip of a page you like and the business details from Google Maps.')],
    [t('Captar clientes', 'Find clients'), t('Negocios reales de tu ciudad y rubro, con la página donde se encontraron y por qué encajan.', 'Real businesses in your city and niche, with the page where they were found and why they fit.')],
    [t('Daniel y el estudio de voz', 'Daniel and the voice studio'), t('Un asistente para escribir tu oferta y tus mensajes, y voces reales para anuncios y asistentes en MP3.', 'An assistant to write your offer and messages, and real voices for ads and assistants in MP3.')],
  ];

  return (
    <div className="sales min-h-screen bg-white">
      {/* Aviso superior */}
      {banner && (
        <div className="relative bg-[var(--s-red)] text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-10 py-3 text-center text-sm">
            <p>
              <span className="font-bold">{t('Tu primera maqueta es gratis.', 'Your first mockup is free.')}</span>{' '}
              {t(`Después, el Plan Creador cuesta ${OFFER.price} USD al mes.`, `Then the Creator plan is ${OFFER.price} USD a month.`)}
            </p>
            <button type="button" onClick={toLanding} className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black cursor-pointer">
              {t('Ver el plan', 'See the plan')}
            </button>
          </div>
          <button type="button" onClick={() => setBanner(false)} aria-label={t('Cerrar aviso', 'Close notice')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/15 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Portada */}
      <header className="relative overflow-hidden rounded-b-[36px] bg-black text-white">
        <video className="absolute inset-0 h-full w-full object-cover opacity-55" src="/videos/stars.webm" autoPlay muted loop playsInline aria-hidden="true" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(14,59,44,.92) 0%, rgba(14,59,44,.35) 38%, rgba(0,0,0,.55) 70%, #000 100%)' }} aria-hidden="true" />
        <div className="relative px-3 pt-4">
          <nav className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center rounded-2xl bg-white px-4 py-3 text-[var(--s-ink)] shadow-[0_12px_40px_-12px_rgba(0,0,0,.4)] sm:px-6" aria-label={t('Principal', 'Main')}>
            <div className="hidden md:flex items-center gap-5 text-[13px] font-medium">
              <a href="#dentro" className="hover:opacity-70">{t('Qué incluye', 'What’s inside')}</a>
              <a href="#crear" className="hover:opacity-70">{t('Ejemplos', 'Examples')}</a>
              <a href="#precios" className="hover:opacity-70">{t('Precios', 'Pricing')}</a>
              <a href="/creadores" className="hover:opacity-70">{t('Creadores', 'Creators')}</a>
            </div>
            <a href="/" className="md:justify-self-center" aria-label="4haus"><Logo /></a>
            <div className="flex items-center justify-end gap-2">
              <LangSwitch lang={lang} onSetLang={onSetLang} />
              <button type="button" onClick={onOpenApp} className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white cursor-pointer">{t('Entrar', 'Log in')}</button>
            </div>
          </nav>
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
          <h1 className="s-display text-[15vw] font-light leading-[.9] sm:text-[112px] lg:text-[136px]" style={{ letterSpacing: '-0.05em' }}>
            {t('Webs que venden.', 'Websites that sell.')}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
            {t('Describe el negocio. 4haus crea la web con portada 3D en minutos. Tú la vendes al precio que quieras.', 'Describe the business. 4haus builds the site with a 3D hero in minutes. You sell it at your price.')}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setShowVideo(true)} className="s-btn-ghost text-white">
              {t('Ver cómo funciona', 'See how it works')} <Play className="h-4 w-4" />
            </button>
            <button type="button" onClick={onOpenApp} className="s-btn-amber">
              {t('Crear mi web gratis', 'Create my website free')} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label={t('Video', 'Video')} onClick={() => setShowVideo(false)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setShowVideo(false)} className="rounded-full bg-white/15 p-2 text-white cursor-pointer" aria-label={t('Cerrar video', 'Close video')}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <VslFrame lang={lang} url={OFFER.tutorialUrl} />
          </div>
        </div>
      )}

      {/* Para quién y qué logras */}
      <section className="mx-auto max-w-5xl px-5 pt-20 sm:px-8">
        <h2 className="s-display mx-auto max-w-3xl text-center text-3xl font-semibold leading-tight sm:text-[42px]">
          {t('Para quien quiere vender webs sin pasar semanas en cada una.', 'For anyone who wants to sell websites without spending weeks on each.')}
        </h2>
        <span className="mx-auto mt-5 block h-1 w-10 rounded bg-[var(--s-amber)]" aria-hidden="true" />
        <p className="mx-auto mt-6 max-w-3xl text-center text-[17px] leading-relaxed text-[var(--s-muted)]">
          {t('Los negocios de tu ciudad necesitan una web que les traiga clientes. Con 4haus le muestras la maqueta en la primera llamada, ajustas lo que pida y la entregas el mismo día.', 'The businesses in your city need a website that brings them clients. With 4haus you show the mockup on the first call, adjust what they ask for and deliver it the same day.')}
        </p>
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SHOWCASE.map((s, i) => (
            <img key={s.src} src={s.src} alt={s.name[lang]} className={`aspect-[16/10] h-full w-full rounded-xl object-cover ${i === 0 ? 'col-span-2 row-span-2' : ''}`} />
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <p className="font-bold">{t('Lo que logras:', 'What you get:')}</p>
          <ul className="mt-3 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
            {[
              t('Una maqueta con portada 3D en minutos, no en semanas.', 'A mockup with a 3D hero in minutes, not weeks.'),
              t('Una oferta clara para mostrar en tu primera llamada.', 'A clear offer to show on your first call.'),
              t('Una lista de negocios reales a quién vendérsela.', 'A list of real businesses to sell it to.'),
              t('El 100% de lo que cobras, a tu precio.', '100% of what you charge, at your price.'),
            ].map((x) => (
              <li key={x} className="flex items-center gap-3 py-3 text-[17px]">
                <Check className="h-5 w-5 shrink-0 rounded-full bg-black p-1 text-white" strokeWidth={3} />{x}
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <button type="button" onClick={toLanding} className="s-btn-red">{t(`Empezar por ${OFFER.price} USD`, `Start for ${OFFER.price} USD`)} <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {/* Fundador */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid overflow-hidden rounded-[28px] md:grid-cols-[1fr_1.75fr]">
          <img src="/images/founder.jpg" alt="José Trujillo" className="h-full min-h-[300px] w-full object-cover" />
          <div className="bg-[var(--s-amber)] p-8 sm:p-12">
            <p className="text-sm font-semibold">{t('Conoce a tu mentor', 'Meet your mentor')}</p>
            <h2 className="s-display mt-2 text-4xl font-semibold">José Trujillo</h2>
            <p className="mt-4 max-w-xl leading-relaxed">
              <strong>{t('Arquitecto y emprendedor.', 'Architect and entrepreneur.')}</strong>{' '}
              {t('Construye negocios en paralelo: agencias web, sistemas de automatización con IA y proyectos de real estate. Creó 4haus para que cualquier persona pueda crear y vender webs profesionales sin un equipo detrás.', 'He builds businesses in parallel: web agencies, AI automation systems and real estate projects. He created 4haus so anyone can create and sell professional websites without a team behind them.')}
            </p>
            <button type="button" onClick={onOpenBooking} className="mt-6 rounded-full bg-black px-5 py-3 text-sm font-bold text-white cursor-pointer">{t('Agendar una llamada', 'Book a call')}</button>
          </div>
        </div>
      </section>

      {/* Qué hay dentro */}
      <section id="dentro" className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 sm:px-8 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="s-display text-5xl font-light leading-[1] sm:text-6xl" style={{ letterSpacing: '-0.04em' }}>{t('Dentro de 4haus Studio', 'Inside 4haus Studio')}</h2>
          <p className="mt-5 max-w-sm text-[var(--s-muted)]">{t('Todo lo que necesitas para crear, mostrar y vender webs, en un solo lugar.', 'Everything you need to create, show and sell websites, in one place.')}</p>
        </div>
        <div className="divide-y divide-[var(--s-line)] border-b border-[var(--s-line)]">
          {inside.map(([h, p], i) => {
            const open = openItem === i;
            return (
              <div key={h}>
                <button type="button" onClick={() => setOpenItem(open ? -1 : i)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-5 text-left text-xl font-semibold cursor-pointer">
                  {h}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && <p className="pb-5 pr-10 text-[17px] leading-relaxed text-[var(--s-muted)]">{p}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lo que puedes crear (testimonios solo cuando existan) */}
      <section id="crear" className="px-3">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-[var(--s-paper)] px-5 py-16 sm:px-10">
          <h2 className="s-display text-center text-4xl font-semibold">{t('Mira lo que puedes crear', 'See what you can create')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--s-muted)]">{t('Portadas hechas con 4haus Studio. Ábrelas y muévete por ellas.', 'Heroes made with 4haus Studio. Open them and move around.')}</p>
          <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4">
            {SHOWCASE.map((s) => {
              const file = s.src.replace('/landing/tpl-', '/templates/').replace('.jpg', '.html');
              return (
                <a key={s.src} href={file} target="_blank" rel="noopener noreferrer" className="group w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white">
                  <img src={s.src} alt="" className="aspect-[16/10] w-full object-cover" />
                  <span className="flex items-center justify-between p-4 font-semibold">
                    {s.name[lang]}
                    <span className="text-sm font-medium text-[var(--s-red)] group-hover:underline">{t('Ver en vivo', 'View live')}</span>
                  </span>
                </a>
              );
            })}
          </div>
          {TESTIMONIALS.length > 0 && (
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((tm) => (
                <figure key={tm.name} className="rounded-2xl bg-white p-6">
                  <blockquote>“{tm.quote[lang]}”</blockquote>
                  <figcaption className="mt-3 text-sm font-semibold">{tm.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="mx-auto grid max-w-6xl gap-4 px-5 py-20 sm:px-8 lg:grid-cols-3">
        <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[24px] bg-black p-8 text-white">
          <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(90% 70% at 100% 100%, #e5383b 0%, rgba(229,56,59,.25) 40%, transparent 70%)' }} aria-hidden="true" />
          <div className="relative">
            <h2 className="s-display text-5xl font-light leading-[1]" style={{ letterSpacing: '-0.04em' }}>{t('Tu primera web, gratis', 'Your first website, free')}</h2>
            <p className="mt-4 text-white/75">{t('Crea una maqueta sin registrarte y mira cómo queda antes de pagar nada.', 'Create a mockup without signing up and see how it looks before paying anything.')}</p>
          </div>
          <button type="button" onClick={onOpenApp} className="s-btn-amber relative self-start">{t('Crear gratis', 'Create free')} <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-col rounded-[24px] border-2 border-[var(--s-red)] bg-[#fff7f6] p-8">
          <p className="text-sm font-semibold text-[var(--s-red)]">{t('Para creadores', 'For creators')}</p>
          <h3 className="s-display mt-1 text-3xl font-semibold">{t('Plan Creador', 'Creator plan')}</h3>
          <p className="mt-4"><span className="s-display text-4xl font-bold">{OFFER.price} USD</span> <span className="text-[var(--s-muted)]">{t('/ mes', '/ month')}</span></p>
          <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">
            {[t(`${OFFER.monthlyCredits} créditos al mes para crear webs`, `${OFFER.monthlyCredits} credits a month to create sites`), t('Todas las plantillas y estilos nuevos', 'All templates and new styles'), t('Captar clientes: 5 búsquedas al día', 'Find clients: 5 searches a day'), t('Daniel y el estudio de voz', 'Daniel and the voice studio'), t('Cancela cuando quieras', 'Cancel anytime')].map((x) => (
              <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />{x}</li>
            ))}
          </ul>
          <button type="button" onClick={toLanding} className="s-btn-red mt-8 w-full">{t('Elegir Plan Creador', 'Choose Creator plan')}</button>
        </div>
        <div className="flex flex-col rounded-[24px] border border-[var(--s-line)] p-8">
          <p className="text-sm font-semibold text-[var(--s-muted)]">{t('Para empresas', 'For businesses')}</p>
          <h3 className="s-display mt-1 text-3xl font-semibold">{t('Te la hacemos', 'We build it for you')}</h3>
          <p className="mt-4"><span className="text-[var(--s-muted)]">{t('desde', 'from')}</span> <span className="s-display text-4xl font-bold">500 USD</span></p>
          <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">
            {[t('Landing 3D: 500 USD', '3D landing: 500 USD'), t('Web profesional: 1.000 USD', 'Professional website: 1,000 USD'), t('Web + ventas: 2.000 USD', 'Website + sales: 2,000 USD'), t('Sistema completo: 3.000 USD', 'Complete system: 3,000 USD')].map((x) => (
              <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />{x}</li>
            ))}
          </ul>
          <button type="button" onClick={onOpenBooking} className="mt-8 w-full rounded-full bg-black py-3.5 font-bold text-white cursor-pointer">{t('Agendar una llamada', 'Book a call')}</button>
        </div>
      </section>

      {/* Preguntas */}
      <section className="px-3 pb-20">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-[var(--s-paper)] px-5 py-14 sm:px-12">
          <h2 className="s-display text-center text-4xl font-semibold sm:text-5xl">{t('Tienes preguntas. Aquí las respuestas.', 'You have questions. Here are the answers.')}</h2>
          <div className="mt-8"><FaqList lang={lang} /></div>
        </div>
      </section>

      <SalesFooter lang={lang} />
    </div>
  );
}
