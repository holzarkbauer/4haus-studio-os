import React, { useState } from 'react';
import { ArrowRight, ChevronRight, LayoutTemplate, MonitorSmartphone, Rocket, Wand2 } from 'lucide-react';
import { Language } from '../types';
import webEngineImg from '../assets/images/apple_bento_web_engine_1791624476388.jpg';
import growthCrmImg from '../assets/images/apple_bento_growth_crm_1791624494223.jpg';
import danielAiImg from '../assets/images/apple_bento_daniel_ai_1791624485612.jpg';
import heroStudioImg from '../assets/images/apple_style_hero_studio_1791624467893.jpg';

// Plantillas del inicio. Cada una trae el prompt que se carga en la casilla al elegirla.
// Para añadir una plantilla nueva basta con agregar un objeto a esta lista.
type TemplateCategory = 'premium3d' | 'isometrica' | 'landing' | 'tienda' | 'app' | 'dashboard';

interface HomeTemplate {
  id: string;
  category: TemplateCategory;
  name: { es: string; en: string };
  description: { es: string; en: string };
  image?: string;
  preview?: 'studio' | 'store' | 'product' | 'luxury' | 'restaurant' | 'wire';
  /** Página de muestra que se puede abrir en vivo (portadas isométricas). */
  liveUrl?: string;
  prompt: { es: string; en: string };
}

// Orden de la galería: primero las portadas 3D premium.
export const HOME_TEMPLATES: HomeTemplate[] = [
  {
    id: 'estudio-creativo-3d',
    category: 'premium3d',
    name: { es: 'Estudio creativo con portada 3D', en: 'Creative studio with 3D hero' },
    description: { es: 'Portafolio oscuro con objeto 3D protagonista', en: 'Dark portfolio with a hero 3D object' },
    preview: 'studio',
    prompt: {
      es: 'Crea la web de un estudio creativo. Portada oscura y cinematográfica con un objeto 3D que gira al hacer scroll, titular enorme, proyectos destacados en cuadrícula, servicios, proceso de trabajo en 4 pasos y llamada a la acción para agendar una reunión.',
      en: 'Create a website for a creative studio. Dark cinematic hero with a 3D object that rotates on scroll, huge headline, featured projects grid, services, a 4-step process and a call to action to book a meeting.',
    },
  },
  {
    id: 'lanzamiento-producto-3d',
    category: 'premium3d',
    name: { es: 'Lanzamiento de producto en 3D', en: '3D product launch' },
    description: { es: 'El producto gira y se desarma con el scroll', en: 'The product rotates and explodes on scroll' },
    preview: 'product',
    prompt: {
      es: 'Crea la landing de lanzamiento de un producto tecnológico. Portada con el producto en 3D que gira y se desarma en piezas al hacer scroll, cada pieza explica una característica, sección de especificaciones, precio y botón de preventa. Estilo oscuro, premium, tipo presentación de Apple.',
      en: 'Create a launch landing page for a tech product. Hero with the product in 3D that rotates and explodes into parts on scroll, each part explaining a feature, a specs section, price and a pre-order button. Dark, premium, keynote-like style.',
    },
  },
  {
    id: 'marca-de-lujo',
    category: 'premium3d',
    name: { es: 'Marca de lujo', en: 'Luxury brand' },
    description: { es: 'Joyería o perfumería con brillo y profundidad', en: 'Jewelry or perfume with shine and depth' },
    preview: 'luxury',
    prompt: {
      es: 'Crea la web de una marca de lujo de joyería. Portada negra con una joya en 3D que refleja la luz al mover el cursor, colección destacada, historia de la marca, galería editorial y formulario para pedir cita privada. Tipografía con serifa, detalles dorados, mucho espacio negativo.',
      en: 'Create a website for a luxury jewelry brand. Black hero with a 3D jewel that reflects light as the cursor moves, featured collection, brand story, editorial gallery and a private appointment form. Serif typography, gold details, lots of negative space.',
    },
  },
  {
    id: 'portafolio-arquitectura',
    category: 'premium3d',
    name: { es: 'Portafolio de arquitectura', en: 'Architecture portfolio' },
    description: { es: 'Proyectos a pantalla completa con scroll', en: 'Full-screen projects with scroll' },
    image: heroStudioImg,
    prompt: {
      es: 'Crea el portafolio de un estudio de arquitectura. Proyectos a pantalla completa que cambian con el scroll, una maqueta 3D del proyecto principal que se puede girar, ficha de cada proyecto con planos e imágenes, sección sobre el estudio y contacto. Estilo minimalista, blanco y negro.',
      en: 'Create a portfolio for an architecture studio. Full-screen projects that change on scroll, a rotatable 3D model of the main project, project pages with plans and images, an about section and contact. Minimalist black and white style.',
    },
  },
  {
    id: 'restaurante',
    category: 'landing',
    name: { es: 'Restaurante', en: 'Restaurant' },
    description: { es: 'Carta, reservas y ubicación', en: 'Menu, bookings and location' },
    preview: 'restaurant',
    prompt: {
      es: 'Crea la web de un restaurante. Portada con un plato destacado, carta por categorías con precios, galería del local, opiniones, mapa con la ubicación y formulario de reservas. Estilo cálido y elegante, pensado primero para móvil.',
      en: 'Create a website for a restaurant. Hero with a signature dish, menu by category with prices, venue gallery, reviews, a location map and a booking form. Warm, elegant, mobile-first style.',
    },
  },
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
    id: 'iso-producto-tech',
    category: 'isometrica',
    name: { es: 'Producto tecnológico (isométrica)', en: 'Tech product (isometric)' },
    description: { es: 'Pieza interactiva que el visitante puede presionar', en: 'An interactive piece the visitor can press' },
    image: '/templates/thumbs/portada-producto-tech.jpg',
    liveUrl: '/templates/portada-producto-tech.html',
    prompt: {
      es: 'Crea la web de un producto tecnológico. Portada oscura con una ilustración isométrica interactiva en SVG de líneas finas (estilo plano técnico): un mecanismo que responde al pasar el cursor, con una lectura en vivo. Titular corto, beneficios en 3 columnas, cómo funciona en 3 pasos, preguntas frecuentes y llamada a la acción para pedir acceso.',
      en: 'Create a website for a tech product. Dark hero with an interactive isometric line-art SVG illustration (technical drawing style): a mechanism that reacts on hover with a live readout. Short headline, 3-column benefits, how it works in 3 steps, FAQ and a call to action to request access.',
    },
  },
  {
    id: 'iso-ingenieria',
    category: 'isometrica',
    name: { es: 'Ingeniería y precisión (isométrica)', en: 'Engineering and precision (isometric)' },
    description: { es: 'Instrumento de medición que se mueve con el cursor', en: 'A measuring instrument that moves with the cursor' },
    image: '/templates/thumbs/portada-ingenieria-precision.jpg',
    liveUrl: '/templates/portada-ingenieria-precision.html',
    prompt: {
      es: 'Crea la web de una empresa de ingeniería, metrología o servicios técnicos. Portada con una ilustración isométrica interactiva en SVG de un instrumento de precisión que se mueve con el cursor. Servicios, sectores que atiende, certificaciones [reales del cliente], proceso de trabajo y formulario de cotización.',
      en: 'Create a website for an engineering, metrology or technical services company. Hero with an interactive isometric SVG illustration of a precision instrument that moves with the cursor. Services, industries served, [real client] certifications, work process and a quote form.',
    },
  },
  {
    id: 'iso-educacion',
    category: 'isometrica',
    name: { es: 'Educación y ciencia (isométrica)', en: 'Education and science (isometric)' },
    description: { es: 'Laboratorio animado para cursos y programas', en: 'An animated lab for courses and programs' },
    image: '/templates/thumbs/portada-educacion-ciencia.jpg',
    liveUrl: '/templates/portada-educacion-ciencia.html',
    prompt: {
      es: 'Crea la web de una academia, colegio o programa de ciencia. Portada con una ilustración isométrica animada en SVG de un equipo de laboratorio. Programas o cursos con su duración, metodología, horarios, preguntas frecuentes y botón para inscribirse.',
      en: 'Create a website for an academy, school or science program. Hero with an animated isometric SVG illustration of lab equipment. Programs or courses with duration, methodology, schedules, FAQ and an enroll button.',
    },
  },
  {
    id: 'iso-gaming',
    category: 'isometrica',
    name: { es: 'Entretenimiento y gaming (isométrica)', en: 'Entertainment and gaming (isometric)' },
    description: { es: 'Máquina recreativa detallada para salas y eventos', en: 'A detailed arcade machine for venues and events' },
    image: '/templates/thumbs/portada-entretenimiento-gaming.jpg',
    liveUrl: '/templates/portada-entretenimiento-gaming.html',
    prompt: {
      es: 'Crea la web de una sala de juegos, centro de entretenimiento o eventos gamer. Portada con una ilustración isométrica en SVG de una máquina recreativa con detalles animados. Experiencias y precios, paquetes para cumpleaños o empresas, ubicación y horarios, y botón para reservar.',
      en: 'Create a website for an arcade, entertainment center or gaming events. Hero with an isometric SVG illustration of an arcade machine with animated details. Experiences and prices, birthday or corporate packages, location and hours, and a booking button.',
    },
  },
  {
    id: 'estructura-keynote',
    category: 'landing',
    name: { es: 'Página de producto tipo keynote', en: 'Keynote-style product page' },
    description: { es: 'Un beneficio por pantalla, comparativa y especificaciones', en: 'One benefit per screen, comparison and specs' },
    preview: 'wire',
    prompt: {
      es: 'Crea una página de producto con estructura tipo keynote: portada con el producto grande y un titular de 3 palabras; luego secciones a pantalla completa, cada una con un solo beneficio y una imagen o animación; comparativa de modelos en columnas; especificaciones técnicas; y llamada a la acción para comprar o reservar. Diseño original para mi marca.',
      en: 'Create a product page with a keynote-style structure: hero with the product large and a 3-word headline; then full-screen sections, each with one benefit and a visual; a model comparison in columns; tech specs; and a buy or reserve call to action. Original design for my brand.',
    },
  },
  {
    id: 'estructura-saas',
    category: 'landing',
    name: { es: 'Software con pruebas de confianza', en: 'Software with trust signals' },
    description: { es: 'Demo, cómo funciona, precios por niveles y preguntas', en: 'Demo, how it works, tiered pricing and FAQ' },
    preview: 'wire',
    prompt: {
      es: 'Crea una landing para un software o servicio digital: portada con titular, subtítulo y una vista del producto; franja para logos de clientes [reales]; 3 beneficios; cómo funciona en 3 pasos; testimonios [reales]; tabla de precios por niveles; preguntas frecuentes y llamada a la acción final.',
      en: 'Create a landing page for software or a digital service: hero with headline, subheadline and a product view; a strip for [real] client logos; 3 benefits; how it works in 3 steps; [real] testimonials; tiered pricing table; FAQ and a final call to action.',
    },
  },
  {
    id: 'estructura-reservas',
    category: 'landing',
    name: { es: 'Reservas y experiencias', en: 'Bookings and experiences' },
    description: { es: 'Buscador arriba, categorías y tarjetas con precio', en: 'Search on top, categories and priced cards' },
    preview: 'wire',
    prompt: {
      es: 'Crea una web de reservas de experiencias o alojamientos: buscador destacado en la portada (destino, fecha, personas); categorías visuales; tarjetas de experiencias con foto, precio y valoración [real]; sección de cómo reservar; ubicación; y botón de reserva.',
      en: 'Create a website for booking experiences or stays: a prominent search in the hero (destination, date, guests); visual categories; experience cards with photo, price and [real] rating; how to book; location; and a booking button.',
    },
  },
  {
    id: 'estructura-configurador',
    category: 'landing',
    name: { es: 'Configurador de producto', en: 'Product configurator' },
    description: { es: 'Elige modelo y color, el precio se actualiza', en: 'Pick model and color, the price updates' },
    preview: 'wire',
    prompt: {
      es: 'Crea una web con configurador de producto: portada con el producto; selector de modelo, color y extras con el precio total que se actualiza al elegir; especificaciones clave; formas de pago; y botón para reservar con un depósito.',
      en: 'Create a website with a product configurator: hero with the product; selectors for model, color and extras with a total price that updates as you choose; key specs; payment options; and a button to reserve with a deposit.',
    },
  },
];

const CATEGORY_LABELS: { id: 'todas' | TemplateCategory; es: string; en: string }[] = [
  { id: 'todas', es: 'Todas', en: 'All' },
  { id: 'premium3d', es: 'Portadas 3D', en: '3D heroes' },
  { id: 'isometrica', es: 'Portadas isométricas', en: 'Isometric heroes' },
  { id: 'landing', es: 'Landing pages', en: 'Landing pages' },
  { id: 'tienda', es: 'Tiendas online', en: 'Online stores' },
  { id: 'app', es: 'Apps', en: 'Apps' },
  { id: 'dashboard', es: 'Dashboards', en: 'Dashboards' },
];

interface HomeTemplatesShowcaseProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  onUseTemplatePrompt: (prompt: string) => void;
  onBrowseAll?: () => void;
  /** true = solo la galería (para la sección Plantillas del menú lateral) */
  galleryOnly?: boolean;
}

export function HomeTemplatesShowcase({ lang, themeMode = 'light', onUseTemplatePrompt, onBrowseAll, galleryOnly = false }: HomeTemplatesShowcaseProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const [activeCategory, setActiveCategory] = useState<'todas' | TemplateCategory>('todas');

  const visibleTemplates = HOME_TEMPLATES.filter((tpl) => activeCategory === 'todas' || tpl.category === activeCategory);

  const card = isDark ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-black/[0.08]';
  const muted = isDark ? 'text-zinc-400' : 'text-[#6E6E73]';

  // Cómo gana dinero el usuario, en 3 pasos. "soon" marca lo que todavía no está construido.
  const moneySteps = [
    {
      icon: LayoutTemplate,
      title: isEn ? 'Create with a template' : 'Crea con una plantilla',
      desc: isEn
        ? 'Pick a template and Daniel adapts it to your client: their business, their texts, their style.'
        : 'Elige una plantilla y Daniel la adapta a tu cliente: su negocio, sus textos, su estilo.',
      soon: false,
    },
    {
      icon: MonitorSmartphone,
      title: isEn ? 'Show the mockup to your client' : 'Enséñale la maqueta a tu cliente',
      desc: isEn
        ? 'Share a preview of the hero and the site structure, on mobile and desktop, before paying anything.'
        : 'Comparte una vista previa de la portada y la estructura de la web, en móvil y escritorio, antes de pagar nada.',
      soon: true,
    },
    {
      icon: Rocket,
      title: isEn ? 'Download it and get paid' : 'Descárgala y cobra',
      desc: isEn
        ? 'Download the full site from 27 USD and charge your client the price you agree on.'
        : 'Descarga la web completa desde 27 USD y cóbrale a tu cliente el precio que acuerden.',
      soon: true,
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Empieza con una plantilla */}
      <section className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {galleryOnly ? <span /> : (
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
            {isEn ? 'Start with a template' : 'Empieza con una plantilla'}
          </h2>
          )}
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
            {onBrowseAll && (
            <button
              type="button"
              onClick={onBrowseAll}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-[#1D1D1F]'} hover:underline`}
            >
              {isEn ? 'Browse all' : 'Ver todas'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTemplates.map((tpl) => (
            <div key={tpl.id} className="relative">
            <button
              type="button"
              onClick={() => onUseTemplatePrompt(isEn ? tpl.prompt.en : tpl.prompt.es)}
              className="group block w-full text-left cursor-pointer"
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
                ) : tpl.preview === 'product' ? (
                  <div className="w-full h-full bg-[radial-gradient(circle_at_50%_45%,#3a3a44_0%,#0b0b0f_60%)] flex flex-col items-center justify-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#9aa4b8_35%,#2a2f3a_75%)] shadow-[0_0_60px_rgba(150,170,255,0.35)]" />
                    <span className="text-white/90 text-sm font-semibold tracking-[0.3em]">AURA ONE</span>
                  </div>
                ) : tpl.preview === 'luxury' ? (
                  <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-[#C9A96E] shadow-[0_0_30px_rgba(201,169,110,0.35)]" />
                    <span className="text-[#E8D5A8] text-xl tracking-[0.35em] font-serif">MAISON</span>
                  </div>
                ) : tpl.preview === 'restaurant' ? (
                  <div className="w-full h-full bg-[#2B1D16] p-5 flex flex-col justify-between">
                    <span className="text-[#F3E3CF] text-2xl font-serif italic">Sabor</span>
                    <div className="flex items-end gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#C8743A]" />
                      <div className="w-12 h-12 rounded-full bg-[#E9C27D]" />
                      <div className="w-10 h-10 rounded-full bg-[#8E4A2A]" />
                    </div>
                  </div>
                ) : tpl.preview === 'wire' ? (
                  <div className="w-full h-full bg-white p-4 flex flex-col gap-2">
                    <div className="h-2 w-1/3 rounded bg-zinc-200" />
                    <div className="flex-1 rounded-md bg-zinc-100 flex items-center justify-center">
                      <div className="h-3 w-1/2 rounded bg-zinc-300" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 h-1/4">
                      <div className="rounded bg-zinc-100" />
                      <div className="rounded bg-zinc-100" />
                      <div className="rounded bg-zinc-100" />
                    </div>
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
            {tpl.liveUrl && (
              <a
                href={tpl.liveUrl}
                target="_blank"
                rel="noopener"
                className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-black hover:bg-white`}
              >
                {isEn ? 'Live preview' : 'Ver en vivo'}
              </a>
            )}
            </div>
          ))}
        </div>
      </section>

      {!galleryOnly && (<>
      {/* 2. Cómo ganar dinero */}
      <section className="max-w-6xl mx-auto w-full space-y-6">
        <div className="space-y-2">
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
            {isEn ? 'How to earn money with 4haus Studio' : 'Cómo ganar dinero con 4haus Studio'}
          </h2>
          <p className={`text-sm ${muted}`}>
            {isEn ? 'Design sites for businesses and sell them as your own service.' : 'Diseña webs para negocios y véndelas como tu propio servicio.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moneySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className={`rounded-2xl border p-6 min-h-[210px] flex flex-col gap-3 ${card}`}>
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-white text-black' : 'bg-[#1D1D1F] text-white'}`}>
                    {idx + 1}
                  </span>
                  {step.soon && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-zinc-300' : 'bg-black/[0.05] text-[#6E6E73]'}`}>
                      {isEn ? 'Coming soon' : 'Próximamente'}
                    </span>
                  )}
                </div>
                <Icon className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`} />
                <div className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{step.title}</div>
                <p className={`text-sm ${muted}`}>{step.desc}</p>
              </div>
            );
          })}
        </div>
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
      </>)}
    </div>
  );
}
