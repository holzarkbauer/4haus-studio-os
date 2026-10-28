import React, { useState } from 'react';
import { ArrowRight, ChevronRight, LayoutTemplate, MessageSquare, MonitorSmartphone, Rocket, Clapperboard, Wand2 } from 'lucide-react';
import { Language } from '../types';
import webEngineImg from '../assets/images/apple_bento_web_engine_1791624476388.jpg';
import growthCrmImg from '../assets/images/apple_bento_growth_crm_1791624494223.jpg';
import danielAiImg from '../assets/images/apple_bento_daniel_ai_1791624485612.jpg';
import heroStudioImg from '../assets/images/apple_style_hero_studio_1791624467893.jpg';

// Plantillas del inicio. Cada una trae el prompt que se carga en la casilla al elegirla.
// Para añadir una plantilla nueva basta con agregar un objeto a esta lista.
type TemplateCategory = 'landing' | 'tienda' | 'app' | 'dashboard';

interface HomeTemplate {
  id: string;
  category: TemplateCategory;
  name: { es: string; en: string };
  description: { es: string; en: string };
  image?: string;
  preview?: 'studio' | 'store';
  prompt: { es: string; en: string };
}

const HOME_TEMPLATES: HomeTemplate[] = [
  {
    id: 'landing-inmobiliaria',
    category: 'landing',
    name: { es: 'Landing inmobiliaria premium', en: 'Premium real estate landing' },
    description: { es: 'Propiedades, galería y formulario de contacto', en: 'Listings, gallery and contact form' },
    image: webEngineImg,
    prompt: {
      es: 'Crea una landing page para una inmobiliaria premium. Secciones: portada con una propiedad destacada y animación 3D suave al hacer scroll, propiedades en venta con filtros, galería, testimonios y formulario de contacto. Estilo elegante, mucho espacio en blanco, tipografía grande.',
      en: 'Create a landing page for a premium real estate agency. Sections: hero with a featured property and a smooth 3D scroll animation, listings with filters, gallery, testimonials and a contact form. Elegant style, lots of white space, large typography.',
    },
  },
  {
    id: 'estudio-creativo-3d',
    category: 'landing',
    name: { es: 'Estudio creativo con portada 3D', en: 'Creative studio with 3D hero' },
    description: { es: 'Portafolio oscuro con objeto 3D protagonista', en: 'Dark portfolio with a hero 3D object' },
    preview: 'studio',
    prompt: {
      es: 'Crea la web de un estudio creativo. Portada oscura y cinematográfica con un objeto 3D que gira al hacer scroll, titular enorme, proyectos destacados en cuadrícula, servicios, proceso de trabajo en 4 pasos y llamada a la acción para agendar una reunión.',
      en: 'Create a website for a creative studio. Dark cinematic hero with a 3D object that rotates on scroll, huge headline, featured projects grid, services, a 4-step process and a call to action to book a meeting.',
    },
  },
  {
    id: 'tienda-ropa',
    category: 'tienda',
    name: { es: 'Tienda de ropa online', en: 'Online clothing store' },
    description: { es: 'Catálogo, ficha de producto y carrito', en: 'Catalog, product page and cart' },
    preview: 'store',
    prompt: {
      es: 'Crea una tienda online de ropa. Portada con la colección de temporada, catálogo con filtros por talla y color, ficha de producto con galería, carrito y botón de compra. Estilo moderno y limpio, pensado primero para móvil.',
      en: 'Create an online clothing store. Hero with the seasonal collection, catalog with size and color filters, product page with gallery, cart and checkout button. Modern, clean, mobile-first style.',
    },
  },
  {
    id: 'crm-embudo',
    category: 'dashboard',
    name: { es: 'CRM y embudo de captación', en: 'CRM and lead funnel' },
    description: { es: 'Prospectos por etapa y métricas del embudo', en: 'Leads by stage and funnel metrics' },
    image: growthCrmImg,
    prompt: {
      es: 'Crea un panel de CRM para un negocio de servicios. Tablero de prospectos por etapas (nuevo, contactado, reunión, cliente), ficha de cada prospecto, embudo con conversión entre etapas y lista de tareas de seguimiento.',
      en: 'Create a CRM dashboard for a services business. Lead board by stage (new, contacted, meeting, client), lead detail view, funnel with stage-to-stage conversion and a follow-up task list.',
    },
  },
  {
    id: 'asistente-ia',
    category: 'app',
    name: { es: 'Asistente de IA para tu negocio', en: 'AI assistant for your business' },
    description: { es: 'Chat que responde y agenda citas', en: 'Chat that answers and books appointments' },
    image: danielAiImg,
    prompt: {
      es: 'Crea una app web con un asistente de IA para un negocio local. Chat que responde preguntas frecuentes, muestra los servicios con precios y permite agendar una cita. Incluye panel simple para ver las citas.',
      en: 'Create a web app with an AI assistant for a local business. Chat that answers FAQs, shows services with prices and lets visitors book an appointment. Include a simple panel to see bookings.',
    },
  },
  {
    id: 'portafolio-arquitectura',
    category: 'landing',
    name: { es: 'Portafolio de arquitectura', en: 'Architecture portfolio' },
    description: { es: 'Proyectos a pantalla completa con scroll', en: 'Full-screen projects with scroll' },
    image: heroStudioImg,
    prompt: {
      es: 'Crea el portafolio de un estudio de arquitectura. Proyectos a pantalla completa que cambian con el scroll, ficha de cada proyecto con planos e imágenes, sección sobre el estudio y contacto. Estilo minimalista, blanco y negro.',
      en: 'Create a portfolio for an architecture studio. Full-screen projects that change on scroll, project pages with plans and images, an about section and contact. Minimalist black and white style.',
    },
  },
];

const CATEGORY_LABELS: { id: 'todas' | TemplateCategory; es: string; en: string }[] = [
  { id: 'todas', es: 'Todas', en: 'All' },
  { id: 'landing', es: 'Landing pages', en: 'Landing pages' },
  { id: 'tienda', es: 'Tiendas online', en: 'Online stores' },
  { id: 'app', es: 'Apps', en: 'Apps' },
  { id: 'dashboard', es: 'Dashboards', en: 'Dashboards' },
];

interface HomeTemplatesShowcaseProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  onUseTemplatePrompt: (prompt: string) => void;
  onBrowseAll: () => void;
}

export function HomeTemplatesShowcase({ lang, themeMode = 'light', onUseTemplatePrompt, onBrowseAll }: HomeTemplatesShowcaseProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const [activeCategory, setActiveCategory] = useState<'todas' | TemplateCategory>('todas');

  const visibleTemplates = HOME_TEMPLATES.filter((tpl) => activeCategory === 'todas' || tpl.category === activeCategory);

  const card = isDark ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-black/[0.08]';
  const muted = isDark ? 'text-zinc-400' : 'text-[#6E6E73]';

  // Funciones del producto. "soon" marca lo que todavía no está construido, para no prometer de más.
  const features = [
    {
      icon: LayoutTemplate,
      title: isEn ? 'Start from a template' : 'Empieza con una plantilla',
      desc: isEn ? 'Each template comes with its prompt ready to adapt.' : 'Cada plantilla trae su prompt listo para adaptarlo.',
      soon: false,
    },
    {
      icon: MessageSquare,
      title: isEn ? 'Guided by Daniel' : 'Daniel te guía',
      desc: isEn ? 'Answer a few questions and get a clear brief.' : 'Responde unas preguntas y obtén un brief claro.',
      soon: false,
    },
    {
      icon: MonitorSmartphone,
      title: isEn ? 'Mobile and desktop preview' : 'Vista previa móvil y escritorio',
      desc: isEn ? 'Review your site before downloading it.' : 'Revisa tu web antes de descargarla.',
      soon: true,
    },
    {
      icon: Rocket,
      title: isEn ? 'Publish in one click' : 'Publica en un clic',
      desc: isEn ? 'Your site online with your own domain.' : 'Tu web en línea con tu propio dominio.',
      soon: true,
    },
    {
      icon: Clapperboard,
      title: isEn ? 'Images, video and voice' : 'Imagen, video y voz',
      desc: isEn ? 'Create the media your site needs.' : 'Crea los medios que tu web necesita.',
      soon: true,
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Empieza con una plantilla */}
      <section className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
            {isEn ? 'Start with a template' : 'Empieza con una plantilla'}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_LABELS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? isDark
                      ? 'bg-white text-black border-white'
                      : 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                    : isDark
                    ? 'border-white/10 text-zinc-300 hover:bg-white/5'
                    : 'border-black/[0.1] text-[#1D1D1F] hover:bg-black/[0.03]'
                }`}
              >
                {isEn ? cat.en : cat.es}
              </button>
            ))}
            <button
              type="button"
              onClick={onBrowseAll}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-[#1D1D1F]'} hover:underline`}
            >
              {isEn ? 'Browse all' : 'Ver todas'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTemplates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onUseTemplatePrompt(isEn ? tpl.prompt.en : tpl.prompt.es)}
              className="group text-left cursor-pointer"
              title={isEn ? 'Use this template' : 'Usar esta plantilla'}
            >
              <div className={`relative aspect-[16/10] rounded-xl overflow-hidden border ${card} transition-shadow group-hover:shadow-lg`}>
                {tpl.image ? (
                  <img src={tpl.image} alt={isEn ? tpl.name.en : tpl.name.es} className="w-full h-full object-cover" loading="lazy" />
                ) : tpl.preview === 'studio' ? (
                  <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-200 via-zinc-500 to-zinc-900 rotate-12 shadow-2xl" />
                    <span className="text-white text-2xl font-light italic tracking-tight">Create. Inspire.</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#F4F1EC] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-700">
                      <span>NOVA</span>
                      <span>Colección · Tienda · Carrito</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <div className="rounded-md bg-[#D9CBB8]" />
                      <div className="rounded-md bg-[#B9A58C]" />
                      <div className="rounded-md bg-[#E8DED1]" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    {isEn ? 'Use this template' : 'Usar esta plantilla'}
                  </span>
                </div>
              </div>
              <div className="pt-2.5">
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{isEn ? tpl.name.en : tpl.name.es}</div>
                <div className={`text-xs ${muted}`}>{isEn ? tpl.description.en : tpl.description.es}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Funciones */}
      <section className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-7 flex flex-col justify-center min-h-[200px] ${card}`}>
          <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
            {isEn ? 'Write.' : 'Escribe.'}
            <br />
            {isEn ? 'Build. Sell.' : 'Construye. Vende.'}
          </h3>
          <p className={`mt-3 text-sm ${muted}`}>
            {isEn
              ? 'Describe your idea, choose a template and turn it into a site you can sell.'
              : 'Describe tu idea, elige una plantilla y conviértela en una web que puedas vender.'}
          </p>
        </div>
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className={`rounded-2xl border p-6 min-h-[200px] flex flex-col gap-3 ${card}`}>
              <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`} />
                {f.soon && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-zinc-300' : 'bg-black/[0.05] text-[#6E6E73]'}`}>
                    {isEn ? 'Coming soon' : 'Próximamente'}
                  </span>
                )}
              </div>
              <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{f.title}</div>
              <p className={`text-sm ${muted}`}>{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* 3. Llamada final */}
      <section className="text-center space-y-4">
        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
          {isEn ? 'Start creating with 4haus Studio' : 'Empieza a crear con 4haus Studio'}
        </h2>
        <p className={`text-sm ${muted}`}>
          {isEn ? 'Your first credits are free.' : 'Tus primeros créditos son gratis.'}
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-transform hover:scale-[1.02] ${
            isDark ? 'bg-white text-black' : 'bg-[#1D1D1F] text-white'
          }`}
        >
          {isEn ? 'Get started' : 'Comenzar'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
