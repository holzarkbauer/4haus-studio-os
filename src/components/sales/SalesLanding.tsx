import React, { useEffect } from 'react';
import { ArrowRight, Check, Mic2, Search, Sparkles, LayoutTemplate, MessageCircle } from 'lucide-react';
import { CheckoutCard, FaqList, IncludedList, LangSwitch, Logo, SalesFooter, VslFrame } from './SalesParts';
import { OFFER, STEPS, TESTIMONIALS, type L } from './offer';

// 4haus.us/landing — sales page del Plan Creador (7 USD/mes) con video de ventas (VSL).
// Estructura: oferta + video arriba, compra a la vista, mecanismo en 4 pasos, lo que incluye,
// para quién es, resumen con precio y preguntas. Sin testimonios inventados.

export function SalesLanding({ lang, onSetLang }: { lang: L; onSetLang: (l: L) => void }) {
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  useEffect(() => {
    document.title = t(`4haus Studio — Empieza por ${OFFER.price} USD`, `4haus Studio — Start for ${OFFER.price} USD`);
  }, [lang]);

  const goBuy = () => document.getElementById('empezar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const features = [
    {
      icon: Sparkles,
      title: t('Describe el negocio. La web aparece.', 'Describe the business. The website appears.'),
      text: t(
        'Escribe qué negocio es y qué quiere vender. En 1 a 3 minutos tienes una maqueta con portada 3D, textos y botones de contacto. Si no te gusta algo, lo pides en palabras simples.',
        'Write what the business is and what it sells. In 1 to 3 minutes you have a mockup with a 3D hero, copy and contact buttons. Don’t like something? Ask for it in plain words.'
      ),
      points: [t('Portada 3D lista para impresionar', '3D hero ready to impress'), t('Pide cambios en palabras simples', 'Ask for changes in plain words'), t('Versión para celular incluida', 'Mobile version included')],
      img: '/landing/app-inicio.jpg',
    },
    {
      icon: LayoutTemplate,
      title: t('Plantillas nuevas cada día', 'New templates every day'),
      text: t(
        'Agregamos portadas, fondos animados y secciones cada día. Eliges un estilo y la IA lo adapta al negocio de tu cliente, con sus fotos y sus textos.',
        'We add heroes, animated backgrounds and sections every day. Pick a style and the AI adapts it to your client’s business, with their photos and copy.'
      ),
      points: [t('Estudios, restaurantes, techos, clínicas y más', 'Studios, restaurants, roofing, clinics and more'), t('Adjunta fotos y el zip de una página que te guste', 'Attach photos and the zip of a page you like')],
      img: '/landing/app-plantillas.jpg',
    },
    {
      icon: Search,
      title: t('Encuentra a quién vendérsela', 'Find who to sell it to'),
      text: t(
        'Captar clientes busca negocios reales de tu ciudad y rubro y te dice por qué encajan: no tienen web, su web es antigua o no responden por chat. Cada resultado trae la página donde se encontró.',
        'Find clients searches real businesses in your city and niche and tells you why they fit: no website, an old one, or no chat. Each result links to the page where it was found.'
      ),
      points: [t('Solo datos que el negocio publica', 'Only data the business publishes'), t('5 búsquedas al día', '5 searches a day')],
      img: '/landing/tpl-portada-ingenieria-precision.jpg',
    },
    {
      icon: Mic2,
      title: t('Voz y asistente para cerrar la venta', 'Voice and assistant to close the sale'),
      text: t(
        'Daniel te ayuda a escribir tu oferta y tus mensajes. El estudio de voz convierte tus textos en audio con voces reales para anuncios y asistentes.',
        'Daniel helps you write your offer and messages. The voice studio turns your text into audio with real voices for ads and assistants.'
      ),
      points: [t('Audio MP3 descargable', 'Downloadable MP3 audio'), t('En español e inglés', 'In Spanish and English')],
      img: '/landing/app-voz.jpg',
    },
  ];

  return (
    <div className="sales min-h-screen bg-white">
      {/* Barra superior */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl bg-black px-4 py-2.5 text-white sm:px-6" aria-label={t('Principal', 'Main')}>
          <a href="/" aria-label="4haus"><Logo onDark /></a>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#incluye" className="hover:text-white">{t('Qué incluye', 'What’s included')}</a>
            <a href="#como" className="hover:text-white">{t('Cómo funciona', 'How it works')}</a>
            <a href="#preguntas" className="hover:text-white">{t('Preguntas', 'Questions')}</a>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch lang={lang} onSetLang={onSetLang} tone="dark" />
            <button type="button" onClick={goBuy} className="s-btn-red !py-2 !px-4 text-sm whitespace-nowrap">
              <span className="sm:hidden">{t('Empezar', 'Start')}</span>
              <span className="hidden sm:inline">{t(`Empieza por ${OFFER.price} USD`, `Start for ${OFFER.price} USD`)}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Oferta + video */}
      <header className="px-3 pt-4">
        <div className="mx-auto max-w-6xl rounded-[32px] px-5 pb-10 pt-12 sm:px-10 sm:pt-16" style={{ background: 'radial-gradient(120% 80% at 50% 0%, #fde8e4 0%, #fff6f2 45%, #ffffff 100%)' }}>
          <h1 className="s-display mx-auto max-w-4xl text-center text-[40px] leading-[1.02] font-semibold sm:text-6xl">
            {t('Crea webs con IA y véndelas.', 'Create websites with AI and sell them.')}
            <span className="block text-[var(--s-red)]">{t(`Empieza hoy por ${OFFER.price} USD.`, `Start today for ${OFFER.price} USD.`)}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-[var(--s-muted)]">
            {t('Describe el negocio, 4haus crea la web con portada 3D en minutos y tú la vendes al precio que quieras. Lo que cobras es 100% tuyo.', 'Describe the business, 4haus builds the site with a 3D hero in minutes and you sell it at your price. What you charge is 100% yours.')}
          </p>
          <div className="mx-auto mt-9 max-w-4xl">
            <VslFrame lang={lang} url={OFFER.vslUrl} />
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 rounded-[28px] bg-white p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,.25)] sm:p-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="s-display mb-5 rounded-xl bg-black px-4 py-2.5 text-center text-sm font-semibold text-white">{t('Esto es todo lo que recibes hoy', 'Here’s everything you get today')}</p>
              <IncludedList lang={lang} />
              <div className="mt-7 border-y-2 border-black py-4 text-center">
                <p className="s-display text-3xl font-bold">{t(`Hoy: ${OFFER.price} USD`, `Today: ${OFFER.price} USD`)}</p>
                <p className="text-sm text-[var(--s-muted)]">{t('al mes · cancela cuando quieras', 'a month · cancel anytime')}</p>
              </div>
            </div>
            <CheckoutCard lang={lang} />
          </div>
        </div>
      </header>

      {/* Es momento de… */}
      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.2fr]">
        <h2 className="s-display text-4xl font-semibold leading-[1.05]">
          {t('Deja de vender horas.', 'Stop selling hours.')}
          <span className="block text-[var(--s-red)]">{t('Vende webs listas.', 'Sell finished websites.')}</span>
        </h2>
        <div className="space-y-4 text-[17px] leading-relaxed text-[var(--s-muted)]">
          <p>{t('Una web profesional toma semanas: diseño, textos, código, revisiones. Por eso pocos se animan a venderlas, y los que lo hacen cobran poco por todo ese tiempo.', 'A professional website takes weeks: design, copy, code, revisions. That’s why few dare to sell them, and those who do charge little for all that time.')}</p>
          <p>{t('Con 4haus, la primera versión está en minutos. Le muestras la maqueta al cliente en la primera llamada, ajustas lo que pida y cierras.', 'With 4haus, the first version is ready in minutes. You show the client the mockup on the first call, adjust what they ask for and close.')}</p>
          <p className="font-semibold text-[var(--s-ink)]">{t('Tú pones el precio. 4haus no cobra comisión sobre tus ventas.', 'You set the price. 4haus takes no commission on your sales.')}</p>
        </div>
      </section>

      {/* Frase central */}
      <section className="px-3">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-[var(--s-paper)] px-6 py-16 text-center sm:py-20">
          <p className="s-display mx-auto max-w-4xl text-2xl font-normal leading-snug sm:text-4xl">
            {t('Los negocios necesitan webs que vendan. Tú puedes entregarlas el mismo día que te las piden, con tu marca y a tu precio.', 'Businesses need websites that sell. You can deliver them the same day they ask, with your brand and at your price.')}
          </p>
        </div>
      </section>

      {/* Mecanismo: 4 pasos (es una secuencia real) */}
      <section id="como" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className="s-display text-4xl font-semibold leading-[1.05]">{t('4 pasos de la idea a la venta', '4 steps from idea to sale')}</h2>
          <p className="text-[var(--s-muted)] md:text-right">{t('El mismo proceso para un roofer en Miami, una clínica en Lima o una tienda en Madrid.', 'The same process for a roofer in Miami, a clinic in Lima or a store in Madrid.')}</p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title.es} className={`relative flex min-h-[230px] flex-col justify-end overflow-hidden rounded-3xl border p-6 ${i === 0 ? 'border-transparent bg-[var(--s-red)] text-white' : 'border-[var(--s-line)] bg-white'}`}>
              {i === 0 && <Sparkles className="absolute right-5 top-5 h-10 w-10 text-white/35" aria-hidden="true" />}
              <span className={`relative text-sm font-semibold ${i === 0 ? 'text-white/80' : 'text-[var(--s-red)]'}`}>{t('Paso', 'Step')} {i + 1}</span>
              <span className="s-display relative mt-1 text-2xl font-semibold">{s.title[lang]}</span>
              <span className={`relative mt-1 text-sm ${i === 0 ? 'text-white/85' : 'text-[var(--s-muted)]'}`}>{s.text[lang]}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Lo que incluye, con imágenes reales de la plataforma */}
      <section id="incluye" className="px-3">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="rounded-[32px] border border-[var(--s-line)] px-6 py-14 text-center">
            <h2 className="s-display text-4xl font-semibold leading-tight sm:text-5xl">
              {t('Por eso creamos', 'That’s why we built')} <span className="text-[var(--s-red)]">4haus Studio</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--s-muted)]">
              {t('Todo lo que necesitas para crear, mostrar y vender webs, en un solo lugar. Esto es lo que usarás desde el primer día:', 'Everything you need to create, show and sell websites, in one place. This is what you’ll use from day one:')}
            </p>
          </div>
          {features.map((f, i) => (
            <article key={f.title} className="grid items-center gap-8 overflow-hidden rounded-[32px] border border-[var(--s-line)] p-6 sm:p-10 md:grid-cols-2">
              <div className={i % 2 ? 'md:order-2' : ''}>
                <f.icon className="h-6 w-6 text-[var(--s-red)]" />
                <h3 className="s-display mt-3 text-3xl font-semibold leading-tight">{f.title}</h3>
                <p className="mt-3 text-[var(--s-muted)] leading-relaxed">{f.text}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {f.points.map((p) => (
                    <li key={p} className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--s-red)]" />{p}</li>
                  ))}
                </ul>
              </div>
              <img src={f.img} alt="" loading="lazy" className="w-full rounded-2xl border border-[var(--s-line)] shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)]" />
            </article>
          ))}
        </div>
      </section>

      {/* Para quién es */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_2fr]">
        <h2 className="s-display text-6xl font-semibold leading-[.95]">
          {t('¿Es', 'Is it')}
          <span className="block text-[var(--s-red)]">{t('para ti?', 'for you?')}</span>
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {[
            [t('Diseñadores y freelancers', 'Designers and freelancers'), t('Entrega en un día lo que hoy te toma semanas y atiende a más clientes.', 'Deliver in a day what takes weeks today and serve more clients.')],
            [t('Agencias pequeñas', 'Small agencies'), t('Muestra una maqueta en la primera reunión y cierra más rápido.', 'Show a mockup in the first meeting and close faster.')],
            [t('Emprendedores sin experiencia técnica', 'Non-technical entrepreneurs'), t('Empieza un negocio de webs sin saber programar ni diseñar.', 'Start a website business without coding or design skills.')],
            [t('Negocios que quieren su propia web', 'Businesses that want their own site'), t('Crea tu web y ajústala tú mismo cuando quieras.', 'Create your site and update it yourself anytime.')],
          ].map(([h, p]) => (
            <div key={h}>
              <MessageCircle className="h-5 w-5 text-[var(--s-red)]" />
              <h3 className="s-display mt-2 text-xl font-semibold leading-snug">{h}</h3>
              <p className="mt-1.5 text-[var(--s-muted)]">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="px-3">
          <div className="mx-auto max-w-6xl rounded-[32px] bg-[var(--s-paper)] px-6 py-16">
            <h2 className="s-display text-center text-4xl font-semibold">{t('Lo que dicen los creadores', 'What creators say')}</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((tm) => (
                <figure key={tm.name} className="rounded-2xl bg-white p-6">
                  <blockquote className="text-[15px] leading-relaxed">“{tm.quote[lang]}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">{tm.name} <span className="font-normal text-[var(--s-muted)]">· {tm.role[lang]}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resumen con precio */}
      <section className="px-3 pt-4">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-[var(--s-line)] px-5 py-14 sm:px-10">
          <p className="text-center text-sm text-[var(--s-muted)]">{t('Resumen de lo que recibes con el', 'Recap of what you get with the')}</p>
          <h2 className="s-display text-center text-4xl font-semibold sm:text-5xl">{t('Plan Creador', 'Creator plan')}</h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <IncludedList lang={lang} />
            <div className="rounded-3xl border border-[var(--s-line)] p-6 text-center">
              <p className="s-display text-4xl font-bold">{OFFER.price} USD</p>
              <p className="text-sm text-[var(--s-muted)]">{t('al mes · cancela cuando quieras', 'a month · cancel anytime')}</p>
              <button type="button" onClick={goBuy} className="s-btn-red mt-5 w-full">{t('Quiero empezar ahora', 'I want to start now')}</button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--s-muted)]"><Check className="h-3.5 w-3.5" />{t('Lo que cobras a tus clientes es 100% tuyo', 'What you charge clients is 100% yours')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section id="preguntas" className="px-3 py-16">
        <div className="mx-auto max-w-4xl rounded-[32px] bg-[var(--s-paper)] px-5 py-14 sm:px-12">
          <h2 className="s-display text-center text-4xl font-semibold">{t('Preguntas frecuentes', 'Frequently asked questions')}</h2>
          <div className="mt-8"><FaqList lang={lang} /></div>
        </div>
      </section>

      <SalesFooter lang={lang} />
    </div>
  );
}
