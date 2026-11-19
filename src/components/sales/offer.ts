// Contenido editable de las páginas de venta (home y 4haus.us/landing).
// Cambia aquí precios, textos, el video y los testimonios sin tocar el diseño.
//
// REGLAS:
// - Solo funciones que la plataforma ya tiene.
// - Testimonios: solo reales y con permiso. Mientras la lista esté vacía, la sección no aparece.
// - Sin promesas de ingresos (ver Condiciones de venta).

export type L = 'es' | 'en';
export type T2 = Record<L, string>;

export const OFFER = {
  price: 7,
  /** Video de ventas (VSL). Pega aquí la dirección del video cuando esté grabado (mp4 o YouTube). */
  vslUrl: '',
  /** Video tutorial de la plataforma (mismo estilo). */
  tutorialUrl: '',
  /** Créditos al mes del Plan Creador (propuesta: confírmalo antes de publicar). */
  monthlyCredits: 15,
};

export interface Included {
  title: T2;
  text: T2;
}

/** Lo que incluye el Plan Creador de 7 USD/mes. Todo existe hoy en la plataforma. */
export const INCLUDED: Included[] = [
  {
    title: { es: 'Crea webs con portada 3D usando IA', en: 'Create websites with 3D heroes using AI' },
    text: {
      es: `Describe el negocio y en 1 a 3 minutos tienes la maqueta. ${OFFER.monthlyCredits} créditos al mes: una web básica usa 1, una completa 2.`,
      en: `Describe the business and get the mockup in 1 to 3 minutes. ${OFFER.monthlyCredits} credits a month: a basic site uses 1, a full site 2.`,
    },
  },
  {
    title: { es: 'Plantillas y estilos nuevos cada día', en: 'Templates and new styles every day' },
    text: { es: 'Portadas, fondos animados y secciones listas. Eliges una y la IA la adapta al negocio.', en: 'Heroes, animated backgrounds and ready sections. Pick one and the AI adapts it.' },
  },
  {
    title: { es: 'Adjunta referencias, fotos y datos', en: 'Attach references, photos and details' },
    text: { es: 'Sube hasta 5 fotos, el zip de una página que te guste y los datos del negocio de Google Maps.', en: 'Upload up to 5 photos, the zip of a page you like and the business details from Google Maps.' },
  },
  {
    title: { es: 'Captar clientes', en: 'Find clients' },
    text: { es: 'Negocios reales de tu ciudad y rubro, con la página donde se encontraron. 5 búsquedas al día.', en: 'Real businesses in your city and niche, with the page where they were found. 5 searches a day.' },
  },
  {
    title: { es: 'Daniel, tu asistente de IA', en: 'Daniel, your AI assistant' },
    text: { es: 'Te ayuda a escribir tu oferta, tus mensajes y a preparar cada llamada de venta.', en: 'Helps you write your offer, your messages and prepare every sales call.' },
  },
  {
    title: { es: 'Estudio de voz', en: 'Voice studio' },
    text: { es: 'Convierte textos en audio con voces reales y descárgalo en MP3 para anuncios y asistentes.', en: 'Turn text into audio with real voices and download the MP3 for ads and assistants.' },
  },
];

export const STEPS: { title: T2; text: T2 }[] = [
  { title: { es: 'Describe', en: 'Describe' }, text: { es: 'Qué negocio es y qué quiere vender.', en: 'What the business is and what it sells.' } },
  { title: { es: 'Crea', en: 'Create' }, text: { es: 'La IA arma la web con portada 3D.', en: 'The AI builds the site with a 3D hero.' } },
  { title: { es: 'Ajusta', en: 'Adjust' }, text: { es: 'Pide cambios en palabras simples.', en: 'Ask for changes in plain words.' } },
  { title: { es: 'Vende', en: 'Sell' }, text: { es: 'Tú pones el precio. Lo que cobras es 100% tuyo.', en: 'You set the price. What you charge is 100% yours.' } },
];

export const FAQ: { q: T2; a: T2 }[] = [
  {
    q: { es: '¿Qué pasa después de pagar?', en: 'What happens after I pay?' },
    a: { es: 'Activamos tu cuenta y entras a 4haus Studio con tu correo de Google. Desde ese momento puedes crear tu primera web.', en: 'We activate your account and you sign in to 4haus Studio with your Google email. You can create your first website right away.' },
  },
  {
    q: { es: '¿Puedo cancelar cuando quiera?', en: 'Can I cancel anytime?' },
    a: { es: 'Sí. El plan se renueva cada mes y puedes cancelarlo cuando quieras; sigue activo hasta el final del mes pagado.', en: 'Yes. The plan renews monthly and you can cancel anytime; it stays active until the end of the paid month.' },
  },
  {
    q: { es: '¿4haus se queda con parte de mis ventas?', en: 'Does 4haus take a cut of my sales?' },
    a: { es: 'No. Lo que cobras a tus clientes es 100% tuyo. Tú decides el precio.', en: 'No. What you charge your clients is 100% yours. You set the price.' },
  },
  {
    q: { es: '¿Necesito saber programar o diseñar?', en: 'Do I need to code or design?' },
    a: { es: 'No. Escribes lo que quieres como se lo dirías a una persona. Si sabes diseño, puedes adjuntar tus referencias.', en: 'No. You write what you want the way you would tell a person. If you design, you can attach references.' },
  },
  {
    q: { es: '¿El hosting y el dominio están incluidos?', en: 'Are hosting and domain included?' },
    a: { es: 'No. Se contratan aparte según los precios vigentes; podemos ayudarte a publicar la web de tu cliente.', en: 'No. They are purchased separately at current prices; we can help you publish your client’s site.' },
  },
  {
    q: { es: '¿Me garantizan clientes o ingresos?', en: 'Do you guarantee clients or income?' },
    a: { es: 'No. 4haus te da las herramientas y el método; los resultados dependen de tu trabajo y tu mercado.', en: 'No. 4haus gives you the tools and the method; results depend on your work and your market.' },
  },
];

/** Testimonios reales con permiso. Vacío = la sección no se muestra. */
export const TESTIMONIALS: { name: string; role: T2; quote: T2; photo?: string }[] = [];

export const SHOWCASE = [
  { src: '/landing/tpl-home-4haus-cristal.jpg', name: { es: 'Estudio de IA', en: 'AI studio' } },
  { src: '/landing/tpl-portada-producto-tech.jpg', name: { es: 'Producto tecnológico', en: 'Tech product' } },
  { src: '/landing/tpl-portada-ingenieria-precision.jpg', name: { es: 'Ingeniería', en: 'Engineering' } },
  { src: '/landing/tpl-portada-educacion-ciencia.jpg', name: { es: 'Educación', en: 'Education' } },
  { src: '/landing/tpl-portada-entretenimiento-gaming.jpg', name: { es: 'Entretenimiento', en: 'Entertainment' } },
];
