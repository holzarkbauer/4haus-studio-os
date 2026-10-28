/**
 * 4haus Studio OS · Executive Keynote Deck & Presenter Playbook PDF Engine
 *
 * Generates presentations in the exact Editorial Keynote Deck style requested by José:
 * 1. MODE 'infographic-dashboard' (Default Visual Keynote Deck - 5 Landscape 16:9 Slides):
 *    - Slide 1: Cover & Strategic Vision (Split editorial cover + Hero KPI card + 3 Pillars)
 *    - Slide 2: Market Diagnosis & The Speed Monopoly (Traditional vs. 4haus 45-second Architecture)
 *    - Slide 3: 3-Layer Autonomous Ecosystem & Target Buyer Personas (ICPs)
 *    - Slide 4: Alex Hormozi's $100M Grand Slam Value Matrix & Stack (19.500 € perceived value)
 *    - Slide 5: 90-Day Financial Scaling Roadmap, Unit Economics (12.4x) & Asymmetric Risk Reversal
 * 2. MODE 'speaker-script' (Guía Maestra del Expositor para José):
 *    - 5 Landscape 16:9 Slides where each slide integrates the visual layout on top AND
 *      José's private Presenter Teleprompter, Psychological Rationale, and Objection Defense below.
 */

import { jsPDF } from 'jspdf';
import {
  CustomPdfDocumentSpec,
  DocumentPresentationMode,
  PresentationSlideSpec,
  ProjectPreloadPayload,
  SpeakerSlideNote,
  StudioWorkspaceState,
} from '../types/leadNichoTypes';
import { GuidedMessage } from '../components/GuidedPromptHero';

export interface DossierExportInput {
  userId?: string | null;
  projectData?: ProjectPreloadPayload | null;
  workspace?: StudioWorkspaceState | null;
  messages?: GuidedMessage[];
  customPrompt?: string;
  customPdfSpec?: CustomPdfDocumentSpec | null;
  forcedMode?: DocumentPresentationMode;
}

/**
 * Classifies the exact presentation mode requested by the user so Daniel 1.0
 * NEVER confuses an "Explanatory Speaker Guide for José" with the "Visual Keynote Slide Deck".
 */
export function detectRequestedPresentationMode(rawPrompt: string): DocumentPresentationMode {
  const lower = String(rawPrompt || '').toLowerCase();

  const wantsSpeakerOrDetailed =
    lower.includes('expositor') ||
    lower.includes('explicativ') ||
    lower.includes('detallad') ||
    lower.includes('dirigida a mi') ||
    lower.includes('dirigida a mí') ||
    lower.includes('para mi') ||
    lower.includes('para mí') ||
    lower.includes('guion') ||
    lower.includes('guión') ||
    lower.includes('como exponer') ||
    lower.includes('cómo exponer') ||
    lower.includes('como presentar') ||
    lower.includes('cómo presentar') ||
    lower.includes('que decir') ||
    lower.includes('qué decir') ||
    lower.includes('paso a paso') ||
    lower.includes('argumentario') ||
    lower.includes('speaker');

  if (wantsSpeakerOrDetailed) {
    return 'speaker-script';
  }

  const wantsCompleteDossier =
    lower.includes('completo') ||
    lower.includes('ambos') ||
    lower.includes('dosier completo') ||
    lower.includes('dossier completo');

  if (wantsCompleteDossier) {
    return 'executive-dossier';
  }

  return 'infographic-dashboard';
}

export function buildSpeakerNotesForJose(
  businessName: string,
  industry: string,
  targetLocation: string,
  averageTicket: string,
  goal90Days: string
): SpeakerSlideNote[] {
  return [
    {
      slideNumber: 'SLIDE 01 · TESIS DE INVERSIÓN Y MONOPOLIO DE VELOCIDAD',
      slideTitle: `${businessName}: Infraestructura Autónoma de Crecimiento y Captación High-Ticket`,
      visualCueForInvestor:
        'Proyecta la Lámina 01 (Portada Keynote) y señala el bloque derecho de retorno 12.4x LTV:CAC y respuesta en 45 segundos.',
      whatJoseSaysVerbatim: `"Hoy en ${industry} dentro de ${targetLocation}, el problema no es la falta de demanda, sino la lentitud operativa. Mientras el mercado tradicional tarda más de 4 horas en contestar a un inversor o propietario de ${averageTicket}, nuestra arquitectura en ${businessName} intercepta, filtra y agenda al decisor en menos de 45 segundos con un margen bruto del 82%."`,
      whyItWorksPsychology:
        'Abres la presentación posicionando a la empresa como una infraestructura tecnológica de alta rentabilidad, no como una agencia tradicional que compite por precio.',
      investorQuestionAndAnswer: {
        question: '¿Cuál es la ventaja real frente a contratar un equipo comercial interno más grande?',
        answer:
          'Un equipo humano tiene costes fijos pesados, horarios limitados y rotación. Nuestra infraestructura opera 24/7 con Daniel 1.0 a coste marginal casi cero, logrando 82% de margen bruto desde el primer mes.',
      },
      transitionPhrase:
        '"Veamos en la Lámina 02 la radiografía exacta de por qué el 95% del mercado pierde margen y cómo capturamos esa cuota..."',
    },
    {
      slideNumber: 'SLIDE 02 · DIAGNÓSTICO DEL MERCADO VS. ARQUITECTURA 4HAUS',
      slideTitle: 'La Fuga Silenciosa del Modelo Tradicional frente a la Captación Quirúrgica',
      visualCueForInvestor:
        'Compara la columna izquierda (1.8% conversión tradicional) frente a la columna derecha (14.5% conversión con 4haus Studio OS).',
      whatJoseSaysVerbatim: `"Observa este contraste: el operador tradicional depende de portales saturados, responde tarde y convierte apenas el 1.8% de sus contactos. Nosotros cambiamos las reglas con 3 ventajas injustas: radar directo sobre propietarios e inversores con liquidez en ${targetLocation}, filtrado autónomo en 45 segundos y reuniones agendadas directamente en calendario, multiplicando por 8x la conversión."`,
      whyItWorksPsychology:
        'El contraste visual binario (Antes vs. Después) hace evidente de un vistazo dónde se pierde el dinero en el sector y por qué nuestra solución captura el valor.',
      investorQuestionAndAnswer: {
        question: '¿Cómo garantizan que los leads agendados tengan capacidad financiera real?',
        answer:
          'El agente autónomo aplica un filtro de 3 capas antes de abrir el calendario: capacidad acorde a ' +
          averageTicket +
          ', zona objetivo en ' +
          targetLocation +
          ' y urgencia de operación menor a 90 días.',
      },
      transitionPhrase:
        '"En la Lámina 03 te muestro cómo funciona por dentro este motor de 3 capas y los 3 perfiles exactos a los que atacamos..."',
    },
    {
      slideNumber: 'SLIDE 03 · ECOSISTEMA DE 3 CAPAS Y BUYER PERSONAS (ICPs)',
      slideTitle: 'Arquitectura de Captación Multicanal y los 3 Decisores de Alto Ticket',
      visualCueForInvestor:
        'Recorre de izquierda a derecha las 3 columnas numeradas (01 Radar de Nicho, 02 Daniel 1.0 24/7, 03 Cierre de Exclusivas) y los 3 ICPs debajo.',
      whatJoseSaysVerbatim: `"No disparamos a ciegas. Nuestro sistema opera en 3 fases conectadas: primero identificamos a los 3 perfiles con mayor liquidez en ${targetLocation} (Propietario Patrimonial, Family Office e Inversor en Expansión); segundo, activamos secuencias multicanal y nuestro Dossier Off-Market; y tercero, Daniel 1.0 atiende y agenda sin intervención manual."`,
      whyItWorksPsychology:
        'Demuestra orden ingenieril y trazabilidad. El inversionista entiende el mecanismo exacto que transforma el capital invertido en reuniones reales.',
      investorQuestionAndAnswer: {
        question: '¿Qué tan rápido podemos encender esta máquina en una ciudad nueva?',
        answer:
          'En menos de 48 horas. Toda la estructura de campañas, páginas de captura y guiones de calificación en 4haus Studio OS está lista para clonarse por plaza.',
      },
      transitionPhrase:
        '"Ahora, en la Lámina 04, veamos cómo empaquetamos esto bajo la Ecuación de Valor de $100M Offers de Alex Hormozi..."',
    },
    {
      slideNumber: 'SLIDE 04 · ECUACIÓN DE VALOR HORMOZI ($100M OFFERS) Y VALUE STACK',
      slideTitle: 'Por Qué Nuestra Oferta Tiene un Valor Percibido de 19.500 € y Cero Fricción',
      visualCueForInvestor:
        'Señala las 4 palancas de la Ecuación de Hormozi a la izquierda y la tabla de apilamiento de valor (19.500 €) a la derecha.',
      whatJoseSaysVerbatim: `"Diseñamos la oferta siguiendo estrictamente la Ecuación de Valor de Alex Hormozi. Maximizamos el Resultado Soñado (${goal90Days}) y la Certeza al 94%, mientras reducimos el Tiempo de Espera a menos de 14 días y el Esfuerzo del Socio a CERO. Al apilar el Radar de Nicho, la Máquina Multicanal, Daniel 1.0 y el Dossier Off-Market, entregamos 19.500 € en valor tangible llave en mano."`,
      whyItWorksPsychology:
        'Cuando el cliente percibe una relación de valor 10 a 1 sin carga operativa ("Done-For-You"), desaparece la comparación por precio y se protege el margen del 82%.',
      investorQuestionAndAnswer: {
        question: '¿El cliente o socio tiene que aprender a usar software complejo?',
        answer:
          'Absolutamente nada. Es un modelo 100% llave en mano: nuestra infraestructura ejecuta la prospección y calificación, y el socio solo asiste a las reuniones confirmadas.',
      },
      transitionPhrase:
        '"Finalmente, en la Lámina 05 tienes la proyección financiera a 90 días y nuestra garantía de blindaje de capital..."',
    },
    {
      slideNumber: 'SLIDE 05 · PROYECCIÓN FINANCIERA A 90 DÍAS Y GARANTÍA ASIMÉTRICA',
      slideTitle: 'Escala de 1.8x a 6.5x ROI Trimestral con Reversión Total del Riesgo',
      visualCueForInvestor:
        'Apunta a la escalera de crecimiento de los Meses 1, 2 y 3 y cierra señalando el bloque inferior de Garantía Condicional.',
      whatJoseSaysVerbatim: `"Aquí está el retorno concreto sobre el capital: en el Mes 1 superamos el punto de equilibrio con 10 reuniones cualificadas (1.8x ROI) y un Payback inferior a 35 días. En el Mes 2 escalamos a 22 reuniones (3.9x ROI) y en el Mes 3 consolidamos más de 36 reuniones y 6.5x ROI. Además, blindamos la ejecución con nuestra Garantía Asimétrica: si en 90 días no entregamos ${goal90Days}, operamos sin coste de gestión adicional hasta cumplirlo. ¿Con cuál plaza iniciamos esta semana?"`,
      whyItWorksPsychology:
        'Combina números auditables mes a mes con una reversión total del riesgo y una pregunta de cierre ejecutiva que invita a la acción inmediata.',
      investorQuestionAndAnswer: {
        question: '¿Cómo se distribuye cada euro invertido durante estos 90 días?',
        answer:
          '55% va directo a captación de demanda de alta intención, 25% a infraestructura de IA 24/7 y automatización, y 20% a inteligencia de datos Off-Market. Cero burocracia improductiva.',
      },
      transitionPhrase:
        'Haz una pausa de 3 segundos tras la pregunta final y permite que el inversionista confirme la plaza de arranque.',
    },
  ];
}

/**
 * Builds the 5 Structured Editorial Keynote Slides (matching the clean architectural slide deck style).
 */
export function buildKeynoteSlidesSpec(
  businessName: string,
  industry: string,
  targetLocation: string,
  averageTicket: string,
  targetAudience: string,
  goal90Days: string
): PresentationSlideSpec[] {
  const notes = buildSpeakerNotesForJose(
    businessName,
    industry,
    targetLocation,
    averageTicket,
    goal90Days
  );

  return [
    {
      slideIndex: 1,
      totalSlides: 5,
      categoryKicker: '01 · TESIS DE INVERSIÓN & MONOPOLIO DE VELOCIDAD',
      headline: `${businessName}: Captación Autónoma de Alto Ticket`,
      subheadline: `Transformamos la demanda de ${industry} en ${targetLocation} mediante respuesta IA en 45 segundos y arquitectura comercial fundamentada en $100M Offers.`,
      layoutType: 'hero-vision',
      heroStat: {
        value: '12.4x',
        label: 'Ratio LTV : CAC Proyectado',
        subtext: `Ticket Objetivo: ${averageTicket} · Margen Bruto Operativo del 82% · Payback < 35 Días`,
      },
      blocks: [
        {
          tag: 'PILAR 01 · VELOCIDAD',
          title: 'Atención IA en < 45 Segundos',
          metric: '45 seg vs. 4h',
          description:
            'Daniel 1.0 intercepta, califica presupuesto y agenda en calendario 24/7 antes de que la competencia conteste.',
          accent: 'emerald',
        },
        {
          tag: 'PILAR 02 · OFERTA GRAND SLAM',
          title: 'Cero Esfuerzo Operativo (Done-For-You)',
          metric: '19.500 € Valor',
          description:
            'Entregamos reuniones ya filtradas y listas para cierre, eliminando la fricción comercial del socio.',
          accent: 'amber',
        },
        {
          tag: 'PILAR 03 · ESCALA FINANCIERA',
          title: 'Meta Trimestral Blindada',
          metric: '6.5x ROI 90D',
          description: `Compromiso auditable: ${goal90Days} con garantía condicional de ejecución.`,
          accent: 'sky',
        },
      ],
      keyTakeawayBanner: `Tesis Central: En mercados de ${averageTicket}, quien responde y filtra en 45 segundos captura el 80% de las operaciones rentables.`,
      speakerNotes: notes[0],
    },
    {
      slideIndex: 2,
      totalSlides: 5,
      categoryKicker: '02 · DIAGNÓSTICO DE MERCADO & VENTAJA ASIMÉTRICA',
      headline: 'Por Qué el Modelo Tradicional Pierde Margen frente a 4haus',
      subheadline: `El 95% de los operadores en ${targetLocation} compiten bajando comisiones en portales saturados. Nosotros creamos un canal propietario de alta conversión.`,
      layoutType: 'split-diagnosis',
      blocks: [
        {
          tag: 'MODELO TRADICIONAL · COMMODITY',
          title: 'Fuga de Capital por Lentitud y Fricción Manual',
          metric: '1.8% Conversión',
          description: 'Operación reactiva dependiente de portales masivos y seguimiento humano lento.',
          bullets: [
            'Tiempo medio de respuesta superior a 4 horas (el decisor ya enfrió su interés).',
            'Guerra de precios y comisiones por ofrecer exactamente lo mismo que el resto.',
            'Costes fijos elevados con márgenes netos inferiores al 25%.',
            'Cero garantía de resultados: todo el riesgo recae sobre el inversor.',
          ],
          accent: 'rose',
        },
        {
          tag: `ARQUITECTURA ${businessName.toUpperCase()} · $100M OFFER`,
          title: 'Monopolio de Valor y Filtrado Quirúrgico 24/7',
          metric: '14.5% Conversión (8x)',
          description: 'Infraestructura predictiva que filtra liquidez, urgencia y autoridad en tiempo real.',
          bullets: [
            'Respuesta instantánea en 45 segundos vía Daniel 1.0 con memoria contextual.',
            'Captación directa Off-Market dirigida a 3 perfiles con liquidez verificada.',
            'Margen Bruto del 82% gracias al apalancamiento en agentes autónomos.',
            'Garantía Condicional Asimétrica: trabajamos sin coste adicional hasta cumplir la meta.',
          ],
          accent: 'emerald',
        },
      ],
      keyTakeawayBanner:
        'Diferencial Ejecutivo: Multiplicamos por 8x la conversión a reunión cualificada reduciendo el tiempo de espera del cliente en un 85%.',
      speakerNotes: notes[1],
    },
    {
      slideIndex: 3,
      totalSlides: 5,
      categoryKicker: '03 · ARQUITECTURA DE 3 CAPAS & PERFILES DE DECISIÓN (ICPs)',
      headline: 'El Motor de Captación, Calificación y Cierre Paso a Paso',
      subheadline: `Un flujo continuo diseñado para interceptar a ${targetAudience} en ${targetLocation} y convertirlos en oportunidades agendadas.`,
      layoutType: 'architecture-pillars',
      blocks: [
        {
          tag: 'CAPA 01 · RADAR DE NICHO & TRÁFICO DIRECTO',
          title: 'Detección Quirúrgica de los 3 Buyer Personas',
          metric: '100% Segmentado',
          description: `Activamos campañas hiper-segmentadas y nuestro Dossier Confidencial Off-Market en ${targetLocation}.`,
          bullets: [
            'ICP 1: Propietario Patrimonial Prime (busca discreción y liquidez rápida).',
            'ICP 2: Family Office / Inversor (busca rentabilidad neta y activos filtrados).',
            'ICP 3: Promotor / Socio en Expansión (busca flujo predecible de cierres).',
          ],
          accent: 'sky',
        },
        {
          tag: 'CAPA 02 · AGENTE AUTÓNOMO DANIEL 1.0',
          title: 'Cualificación en < 45s y Enriquecimiento CRM',
          metric: '24/7 Sin Fricción',
          description:
            'Cada contacto es atendido al instante para validar capacidad financiera y horizonte de decisión.',
          bullets: [
            'Filtro 1: Presupuesto o activo alineado con el ticket de ' + averageTicket + '.',
            'Filtro 2: Urgencia real de operación dentro de los próximos 90 días.',
            'Filtro 3: Confirmación de reunión directa en el calendario del director.',
          ],
          accent: 'emerald',
        },
        {
          tag: 'CAPA 03 · CONVERSIÓN & ESCALA MULTI-PLAZA',
          title: 'Cierre de Exclusivas y Replicación en 48 Horas',
          metric: 'Clonable en 48h',
          description:
            'El socio comercial solo invierte su tiempo en reuniones con decisores previamente validados.',
          bullets: [
            'Dossier previo enviado automáticamente antes de cada sesión.',
            'Trazabilidad completa de CAC, LTV y tasa de cierre en panel ejecutivo.',
            'Arquitectura lista para expandirse a una nueva ciudad en 48 horas.',
          ],
          accent: 'amber',
        },
      ],
      keyTakeawayBanner: `Resultado Operativo: El equipo directivo elimina el 100% de las llamadas en frío y se enfoca únicamente en cerrar acuerdos de ${averageTicket}.`,
      speakerNotes: notes[2],
    },
    {
      slideIndex: 4,
      totalSlides: 5,
      categoryKicker: '04 · ECUACIÓN DE VALOR ($100M OFFERS · ALEX HORMOZI)',
      headline: 'Ingeniería de Valor: 19.500 € en Activos Apilados',
      subheadline:
        'Hacemos que la propuesta sea tan asimétrica en valor y velocidad que para el decisor sea irracional rechazarla.',
      layoutType: 'hormozi-value-matrix',
      blocks: [
        {
          tag: 'ACTIVO 01 · INTELIGENCIA DE MERCADO',
          title: `Radar de Nicho & 3 ICPs en ${targetLocation}`,
          metric: 'Valor: 4.500 €',
          description:
            'Mapa completo de decisores, ángulos de dolor, objeciones y segmentación lista para captura.',
          accent: 'emerald',
        },
        {
          tag: 'ACTIVO 02 · CAPTACIÓN MULTICANAL',
          title: 'Secuencias Outbound + Landing Page de Alta Conversión',
          metric: 'Valor: 6.000 €',
          description:
            'Infraestructura web y secuencias persuasivas diseñadas para captar demanda sin portales intermediarios.',
          accent: 'sky',
        },
        {
          tag: 'ACTIVO 03 · CEREBRO AUTÓNOMO IA',
          title: 'Agente Daniel 1.0 (Filtrado 24/7 en 45 Segundos)',
          metric: 'Valor: 5.500 €',
          description:
            'Asistente entrenado con el código moral y comercial de José para atender y agendar sin descanso.',
          accent: 'amber',
        },
        {
          tag: 'ACTIVO 04 · IMÁN DE AUTORIDAD & BLINDAJE',
          title: 'Dossier Off-Market + Garantía Condicional 90D',
          metric: 'Valor: 3.500 €',
          description:
            'Activo descargable de alto prestigio y reversión contractual del riesgo de ejecución.',
          accent: 'emerald',
        },
      ],
      keyTakeawayBanner:
        'Ecuación Hormozi Aplicada: Resultado Soñado (98%) × Certeza (94%) ÷ [Tiempo de Espera (<14 días) × Esfuerzo del Cliente (0%)] = Retorno 12.4x.',
      speakerNotes: notes[3],
    },
    {
      slideIndex: 5,
      totalSlides: 5,
      categoryKicker: '05 · HOJA DE RUTA FINANCIERA A 90 DÍAS & GARANTÍA',
      headline: 'Proyección de Retorno Trimestral y Protección del Capital',
      subheadline: `Escalamiento medible mes a mes hacia ${goal90Days}, con recuperación de capital en menos de 35 días.`,
      layoutType: 'financial-roi-roadmap',
      blocks: [
        {
          tag: 'MES 01 · TRACCIÓN & PUNTO DE EQUILIBRIO',
          title: 'Despliegue, Primeras Oportunidades y Payback',
          metric: '1.8x ROI Mes 1',
          description:
            'Encendido del radar en las primeras 48h, primeros leads cualificados en <14 días y 10 reuniones agendadas.',
          bullets: [
            '45 prospectos filtrados en CRM.',
            '10 reuniones con decisores validados.',
            'Payback alcanzado en los primeros 35 días.',
          ],
          accent: 'sky',
        },
        {
          tag: 'MES 02 · OPTIMIZACIÓN & ACELERACIÓN',
          title: 'Multiplicación de Cartera y Cierres de Alto Ticket',
          metric: '3.9x ROI Mes 2',
          description:
            'Ajuste fino de los ángulos con mayor conversión y escalamiento de campañas ganadoras.',
          bullets: [
            '110 prospectos filtrados acumulados.',
            '22 reuniones cualificadas en calendario.',
            'Asignación eficiente: 55% Captación, 25% IA, 20% Datos.',
          ],
          accent: 'emerald',
        },
        {
          tag: 'MES 03 · DOMINIO DE PLAZA & EXPANSIÓN',
          title: 'Consolidación del Flujo y Clonación Territorial',
          metric: '6.5x ROI Mes 3',
          description: `Cumplimiento de ${goal90Days} y preparación para clonar el sistema en una segunda ciudad.`,
          bullets: [
            '180+ prospectos de alto valor en pipeline.',
            '36+ reuniones cualificadas completadas.',
            'Garantía Asimétrica: si no se logra la meta, operamos a coste 0 € de gestión.',
          ],
          accent: 'amber',
        },
      ],
      keyTakeawayBanner: `Decisión Ejecutiva: Cupo limitado a 3 carteras por plaza en ${targetLocation} para proteger la exclusividad y el retorno del socio.`,
      speakerNotes: notes[4],
    },
  ];
}

export function buildTailoredPdfSpecFromPrompt(
  rawPrompt: string,
  workspace: StudioWorkspaceState | null,
  pd?: ProjectPreloadPayload | null,
  forcedMode?: DocumentPresentationMode
): CustomPdfDocumentSpec {
  const mode =
    forcedMode || pd?.customPdfSpec?.presentationMode || detectRequestedPresentationMode(rawPrompt);

  const promptClean = String(rawPrompt || '').trim();
  const bp = workspace?.businessProfile;
  const niche = workspace?.nicheProfiles?.[0];

  const businessName = pd?.businessName || bp?.businessName || '4haus Real Estate & Growth';
  const industry =
    pd?.industry || bp?.industry || 'Inmobiliaria Prime & Activos Patrimoniales';
  const targetLocation =
    pd?.targetLocation || bp?.targetLocation || 'Madrid, Marbella, CDMX y Miami';
  const averageTicket = pd?.averageTicket || bp?.averageTicket || '450.000 € - 2.500.000 €';
  const targetAudience =
    pd?.targetAudience ||
    niche?.priorityAudience ||
    bp?.targetAudience ||
    'Propietarios Patrimoniales, Inversores y Decisores High-Ticket';
  const goal90Days =
    pd?.goal90Days ||
    bp?.goal90Days ||
    '12 operaciones en exclusiva y 36 reuniones cualificadas en 90 días';

  const speakerNotes = buildSpeakerNotesForJose(
    businessName,
    industry,
    targetLocation,
    averageTicket,
    goal90Days
  );

  const slides = buildKeynoteSlidesSpec(
    businessName,
    industry,
    targetLocation,
    averageTicket,
    targetAudience,
    goal90Days
  );

  return {
    documentType: mode === 'speaker-script' ? 'speaker-script' : 'investor-pitch-hormozi',
    presentationMode: mode,
    documentTitle:
      mode === 'speaker-script'
        ? `DECK DE EXPOSICIÓN COMENTADO (PARA JOSÉ) · 5 LÁMINAS + GUION LITERAL`
        : `PRESENTACIÓN EJECUTIVA KEYNOTE (5 LÁMINAS) · ${businessName.toUpperCase()}`,
    documentSubtitle:
      mode === 'speaker-script'
        ? `Cada lámina visual acompañada de tu guion palabra por palabra, psicología de cierre y defensa ante el inversionista`
        : `Tesis de Inversión, Arquitectura Autónoma y Oferta Grand Slam ($100M Offers) en ${targetLocation}`,
    targetRecipient:
      mode === 'speaker-script'
        ? 'Exclusivo para José (Expositor Principal y Director de Estrategia)'
        : 'Socio Inversionista / Comité Ejecutivo',
    userPrompt: promptClean || 'Presentación Ejecutiva Keynote Hormozi $100M Offers',
    executiveThesis: `${businessName} transforma un mercado tradicional lento en un activo de flujo de caja predecible combinando respuesta autónoma en 45 segundos (Daniel 1.0) con una Oferta Grand Slam ($100M Offers de Alex Hormozi) para ${targetAudience} en ${targetLocation}.`,
    hormoziOffer: {
      dreamOutcome: `${goal90Days} con ticket medio de ${averageTicket}`,
      perceivedLikelihood: '94% Certeza Verificable (CRM auditado + Garantía por escrito)',
      timeDelay: '< 14 días para primeras reuniones (Respuesta IA en 45 segundos)',
      effortAndSacrifice: '0% Carga Manual ("Done-For-You" llave en mano)',
      grandSlamOfferTitle: `Ecosistema de Captación Garantizada & Aceleración Patrimonial (${businessName})`,
      coreStack: [
        {
          item: `1. Radar de Nicho & 3 ICPs con Liquidez (${targetLocation})`,
          perceivedValue: '4.500 €',
          description: 'Detección quirúrgica de propietarios e inversores listos para decidir.',
        },
        {
          item: '2. Máquina Multicanal (Email + LinkedIn + Landing Prime)',
          perceivedValue: '6.000 €',
          description: 'Captación directa sin depender de portales masivos ni guerra de precios.',
        },
        {
          item: '3. Agente Autónomo Daniel 1.0 (Filtrado 24/7 en <45s)',
          perceivedValue: '5.500 €',
          description: 'Atiende, califica y agenda en calendario antes que cualquier competidor.',
        },
        {
          item: '4. Dossier Confidencial Off-Market & Garantía Anti-Riesgo',
          perceivedValue: '3.500 €',
          description: 'Imán de captación de alto valor y reversión total del riesgo para el socio.',
        },
      ],
      riskReversalGuarantee: `Garantía Condicional Asimétrica: Si en 90 días no generamos el pipeline cualificado comprometido (${goal90Days}), operamos el sistema sin coste adicional hasta lograrlo.`,
      scarcityAndUrgency: `Cupo bloqueado a máximo 3 carteras por plaza en ${targetLocation} para proteger el retorno por socio.`,
    },
    unitEconomics: {
      averageTicket,
      cacEstimated: '380 € - 650 € / reunión cualificada',
      ltvToCacRatio: '12.4x',
      grossMarginPct: '82%',
      paybackPeriod: '< 35 Días',
      projectedRoi90Days: '6.5x ROI Trimestral',
      investorUpside: 'Escalable a nuevas ciudades en 48 horas sin aumentar plantilla fija.',
    },
    speakerNotes,
    slides,
    sections: [
      {
        sectionNumber: '01',
        title: 'IMPACTO VISUAL: MODELO TRADICIONAL VS. OFERTA GRAND SLAM',
        narrative: `En ${industry}, competir con la misma promesa tradicional obliga a bajar comisiones. Nuestra arquitectura multiplica por 8x la conversión al eliminar el tiempo de espera y el esfuerzo del cliente.`,
      },
    ],
    closingCallToAction: `DECISIÓN EJECUTIVA: Activar el despliegue en ${targetLocation} y capturar el flujo de decisores con retorno proyectado de 6.5x en 90 días.`,
  };
}

/**
 * Renders a 5-Slide Editorial Keynote Presentation Deck in Landscape A4 format.
 * Clean high-contrast alabaster/slate architectural aesthetic (inspired by modern consulting & pitch decks).
 * If includePresenterNotes is true, each slide includes a dedicated Presenter Teleprompter dock for José.
 */
function renderEditorialKeynoteDeckPdf(
  spec: CustomPdfDocumentSpec,
  businessName: string,
  industry: string,
  targetLocation: string,
  averageTicket: string,
  targetAudience: string,
  goal90Days: string,
  includePresenterNotes: boolean
): string {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = doc.internal.pageSize.getWidth(); // 297 mm
  const pageH = doc.internal.pageSize.getHeight(); // 210 mm
  const margin = 14;
  const contentW = pageW - margin * 2;

  const slides =
    spec.slides && spec.slides.length > 0
      ? spec.slides
      : buildKeynoteSlidesSpec(
          businessName,
          industry,
          targetLocation,
          averageTicket,
          targetAudience,
          goal90Days
        );

  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  slides.forEach((slide, idx) => {
    if (idx > 0) {
      doc.addPage('a4', 'landscape');
    }

    // 1. Clean Alabaster Editorial Canvas Background (#F8FAFC)
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Top Structural Hairline & Kicker Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 2.2, 'F');

    // Kicker text (Left) & Slide Counter (Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(slide.categoryKicker.toUpperCase(), margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    const modeLabel = includePresenterNotes
      ? `MODO EXPOSITOR PARA JOSÉ · LÁMINA 0${slide.slideIndex} / 0${slide.totalSlides}`
      : `${businessName.toUpperCase()} · LÁMINA 0${slide.slideIndex} / 0${slide.totalSlides}`;
    doc.text(modeLabel, pageW - margin, 11, { align: 'right' });

    // Subtle Header Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 14, pageW - margin, 14);

    // Headline & Subheadline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(includePresenterNotes ? 16.5 : 19.5);
    doc.setTextColor(15, 23, 42);
    doc.text(slide.headline, margin, includePresenterNotes ? 23 : 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(includePresenterNotes ? 8.8 : 9.8);
    doc.setTextColor(71, 85, 105);
    const subLines = doc.splitTextToSize(slide.subheadline, contentW);
    doc.text(subLines.slice(0, 2), margin, includePresenterNotes ? 28.5 : 31.5);

    // Calculate available vertical space for the visual slide body
    const bodyTopY = includePresenterNotes ? 35 : 40;
    const bodyBottomY = includePresenterNotes ? 127 : 178;
    const bodyH = bodyBottomY - bodyTopY;

    // =========================================================================
    // SLIDE LAYOUT 1: HERO VISION & 3 ARCHITECTURAL PILLARS
    // =========================================================================
    if (slide.layoutType === 'hero-vision') {
      const leftW = contentW * 0.38;
      const rightW = contentW - leftW - 6;
      const rightX = margin + leftW + 6;

      // Left Dark Obsidian Hero Metric Panel
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, bodyTopY, leftW, bodyH, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(52, 211, 153);
      doc.text('INDICADOR NORTE DE RENTABILIDAD', margin + 7, bodyTopY + 11);

      doc.setFontSize(includePresenterNotes ? 34 : 42);
      doc.setTextColor(255, 255, 255);
      doc.text(slide.heroStat?.value || '12.4x', margin + 7, bodyTopY + (includePresenterNotes ? 28 : 34));

      doc.setFontSize(10.5);
      doc.setTextColor(250, 204, 21);
      doc.text(
        slide.heroStat?.label || 'Retorno LTV : CAC Proyectado',
        margin + 7,
        bodyTopY + (includePresenterNotes ? 36 : 44)
      );

      doc.setDrawColor(51, 65, 85);
      doc.line(
        margin + 7,
        bodyTopY + (includePresenterNotes ? 41 : 50),
        margin + leftW - 7,
        bodyTopY + (includePresenterNotes ? 41 : 50)
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      const heroSub = doc.splitTextToSize(
        slide.heroStat?.subtext || '',
        leftW - 14
      );
      doc.text(heroSub, margin + 7, bodyTopY + (includePresenterNotes ? 48 : 58));

      // Market & Target Metadata inside Left Panel bottom
      const metaY = bodyTopY + bodyH - (includePresenterNotes ? 22 : 30);
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin + 6, metaY, leftW - 12, includePresenterNotes ? 16 : 22, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(52, 211, 153);
      doc.text(`PLAZAS OBJETIVO: ${targetLocation.toUpperCase()}`, margin + 10, metaY + 6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text(`Meta 90D: ${goal90Days.slice(0, 56)}`, margin + 10, metaY + 12.5);

      // Right 3 Stacked Architectural Cards
      const cardGap = 4;
      const cardH = (bodyH - cardGap * 2) / 3;
      slide.blocks.slice(0, 3).forEach((b, bIdx) => {
        const cy = bodyTopY + bIdx * (cardH + cardGap);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(rightX, cy, rightW, cardH, 2.5, 2.5, 'FD');

        // Numbered Index & Tag
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(5, 150, 105);
        doc.text(b.tag || `PILAR 0${bIdx + 1}`, rightX + 6, cy + 7.5);

        // Metric Badge on Top Right
        if (b.metric) {
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(rightX + rightW - 42, cy + 3.5, 36, 6.5, 1.5, 1.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.8);
          doc.setTextColor(15, 23, 42);
          doc.text(b.metric, rightX + rightW - 24, cy + 8, { align: 'center' });
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(b.title, rightX + 6, cy + 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(b.description || '', rightW - 12);
        doc.text(descLines.slice(0, 2), rightX + 6, cy + 21.5);
      });
    }

    // =========================================================================
    // SLIDE LAYOUT 2: SPLIT DIAGNOSIS (TRADITIONAL VS. 4HAUS)
    // =========================================================================
    else if (slide.layoutType === 'split-diagnosis') {
      const colW = (contentW - 6) / 2;
      slide.blocks.slice(0, 2).forEach((b, bIdx) => {
        const cx = margin + bIdx * (colW + 6);
        const isPositive = bIdx === 1;

        if (isPositive) {
          doc.setFillColor(15, 23, 42);
          doc.setDrawColor(16, 185, 129);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(203, 213, 225);
        }
        doc.roundedRect(cx, bodyTopY, colW, bodyH, 3, 3, 'FD');

        // Header Tag & Big Metric
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.8);
        if (isPositive) {
          doc.setTextColor(52, 211, 153);
        } else {
          doc.setTextColor(225, 29, 72);
        }
        doc.text(b.tag || '', cx + 7, bodyTopY + 10);

        doc.setFontSize(14);
        if (isPositive) {
          doc.setTextColor(250, 204, 21);
        } else {
          doc.setTextColor(15, 23, 42);
        }
        doc.text(b.metric || '', cx + colW - 7, bodyTopY + 10.5, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        if (isPositive) {
          doc.setTextColor(255, 255, 255);
        } else {
          doc.setTextColor(15, 23, 42);
        }
        doc.text(b.title, cx + 7, bodyTopY + 19);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        if (isPositive) {
          doc.setTextColor(203, 213, 225);
        } else {
          doc.setTextColor(71, 85, 105);
        }
        const dLines = doc.splitTextToSize(b.description || '', colW - 14);
        doc.text(dLines.slice(0, 2), cx + 7, bodyTopY + 25.5);

        // Divider
        if (isPositive) {
          doc.setDrawColor(51, 65, 85);
        } else {
          doc.setDrawColor(226, 232, 240);
        }
        doc.line(cx + 7, bodyTopY + 33, cx + colW - 7, bodyTopY + 33);

        // Bullet points
        const bullets = b.bullets || [];
        let by = bodyTopY + 41;
        const stepY = includePresenterNotes ? 11.5 : 18;
        bullets.slice(0, 4).forEach((item, i) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          if (isPositive) {
            doc.setTextColor(52, 211, 153);
          } else {
            doc.setTextColor(225, 29, 72);
          }
          doc.text(`0${i + 1}.`, cx + 7, by);

          doc.setFont('helvetica', 'normal');
          if (isPositive) {
            doc.setTextColor(241, 245, 249);
          } else {
            doc.setTextColor(51, 65, 85);
          }
          const bLines = doc.splitTextToSize(item, colW - 22);
          doc.text(bLines.slice(0, 2), cx + 15, by);
          by += stepY;
        });
      });
    }

    // =========================================================================
    // SLIDE LAYOUT 3 & 5: 3-COLUMN ARCHITECTURAL PILLARS / 90-DAY ROADMAP
    // =========================================================================
    else if (
      slide.layoutType === 'architecture-pillars' ||
      slide.layoutType === 'financial-roi-roadmap'
    ) {
      const gap = 5;
      const colW = (contentW - gap * 2) / 3;

      slide.blocks.slice(0, 3).forEach((b, bIdx) => {
        const cx = margin + bIdx * (colW + gap);
        const isHighlight = bIdx === 2;

        if (isHighlight) {
          doc.setFillColor(15, 23, 42);
          doc.setDrawColor(16, 185, 129);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(203, 213, 225);
        }
        doc.roundedRect(cx, bodyTopY, colW, bodyH, 3, 3, 'FD');

        // Top Kicker
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.4);
        if (isHighlight) {
          doc.setTextColor(52, 211, 153);
        } else {
          doc.setTextColor(5, 150, 105);
        }
        doc.text(b.tag || `FASE 0${bIdx + 1}`, cx + 6, bodyTopY + 9);

        // Big Metric Pill
        if (b.metric) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          if (isHighlight) {
            doc.setTextColor(250, 204, 21);
          } else {
            doc.setTextColor(15, 23, 42);
          }
          doc.text(b.metric, cx + 6, bodyTopY + 18);
        }

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        if (isHighlight) {
          doc.setTextColor(255, 255, 255);
        } else {
          doc.setTextColor(15, 23, 42);
        }
        const tLines = doc.splitTextToSize(b.title, colW - 12);
        doc.text(tLines.slice(0, 2), cx + 6, bodyTopY + 25.5);

        // Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        if (isHighlight) {
          doc.setTextColor(203, 213, 225);
        } else {
          doc.setTextColor(71, 85, 105);
        }
        const dLines = doc.splitTextToSize(b.description || '', colW - 12);
        doc.text(dLines.slice(0, 3), cx + 6, bodyTopY + 35);

        // Hairline
        if (isHighlight) {
          doc.setDrawColor(51, 65, 85);
        } else {
          doc.setDrawColor(226, 232, 240);
        }
        doc.line(cx + 6, bodyTopY + 48, cx + colW - 6, bodyTopY + 48);

        // Bullets
        let by = bodyTopY + 55;
        const stepY = includePresenterNotes ? 11 : 16;
        (b.bullets || []).slice(0, 3).forEach((item) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          if (isHighlight) {
            doc.setTextColor(52, 211, 153);
          } else {
            doc.setTextColor(5, 150, 105);
          }
          doc.text('•', cx + 6, by);

          doc.setFont('helvetica', 'normal');
          if (isHighlight) {
            doc.setTextColor(241, 245, 249);
          } else {
            doc.setTextColor(51, 65, 85);
          }
          const bLines = doc.splitTextToSize(item, colW - 16);
          doc.text(bLines.slice(0, 2), cx + 10, by);
          by += stepY;
        });
      });
    }

    // =========================================================================
    // SLIDE LAYOUT 4: HORMOZI $100M VALUE MATRIX (2x2 GRID + EQUATION BAR)
    // =========================================================================
    else if (slide.layoutType === 'hormozi-value-matrix') {
      const leftW = contentW * 0.36;
      const rightW = contentW - leftW - 6;
      const rightX = margin + leftW + 6;

      // Left Panel: The 4 Hormozi Drivers
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, bodyTopY, leftW, bodyH, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(250, 204, 21);
      doc.text('ECUACIÓN DE VALOR ($100M OFFERS)', margin + 6, bodyTopY + 10);

      const drivers = [
        { name: '1. Resultado Soñado', val: '98% MAXIMIZADO', pct: 0.96, rgb: [16, 185, 129] },
        { name: '2. Certeza Percibida', val: '94% VERIFICABLE', pct: 0.94, rgb: [52, 211, 153] },
        { name: '3. Tiempo de Espera', val: '< 14 DÍAS (45s IA)', pct: 0.16, rgb: [56, 189, 248] },
        { name: '4. Esfuerzo del Socio', val: '0% LLAVE EN MANO', pct: 0.08, rgb: [250, 204, 21] },
      ];

      const dStep = includePresenterNotes ? 18 : 26;
      drivers.forEach((d, dIdx) => {
        const dy = bodyTopY + 18 + dIdx * dStep;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(d.name, margin + 6, dy);

        doc.setFontSize(7.5);
        doc.setTextColor(d.rgb[0], d.rgb[1], d.rgb[2]);
        doc.text(d.val, margin + leftW - 6, dy, { align: 'right' });

        const barW = leftW - 12;
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(margin + 6, dy + 3, barW, 3, 1, 1, 'F');
        doc.setFillColor(d.rgb[0], d.rgb[1], d.rgb[2]);
        doc.roundedRect(margin + 6, dy + 3, Math.max(8, barW * d.pct), 3, 1, 1, 'F');
      });

      // Right 2x2 Grid of Value Stack Assets
      const cellGap = 4;
      const cellW = (rightW - cellGap) / 2;
      const cellH = (bodyH - cellGap) / 2;

      slide.blocks.slice(0, 4).forEach((b, bIdx) => {
        const col = bIdx % 2;
        const row = Math.floor(bIdx / 2);
        const cx = rightX + col * (cellW + cellGap);
        const cy = bodyTopY + row * (cellH + cellGap);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(cx, cy, cellW, cellH, 2.5, 2.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(5, 150, 105);
        doc.text(b.tag || `ACTIVO 0${bIdx + 1}`, cx + 5, cy + 8);

        if (b.metric) {
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(b.metric, cx + cellW - 5, cy + 8, { align: 'right' });
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.8);
        doc.setTextColor(15, 23, 42);
        const tLines = doc.splitTextToSize(b.title, cellW - 10);
        doc.text(tLines.slice(0, 2), cx + 5, cy + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(71, 85, 105);
        const dLines = doc.splitTextToSize(b.description || '', cellW - 10);
        doc.text(dLines.slice(0, 3), cx + 5, cy + (includePresenterNotes ? 25 : 27));
      });
    }

    // =========================================================================
    // KEY TAKEAWAY BANNER OR PRESENTER TELEPROMPTER DOCK (FOR JOSÉ)
    // =========================================================================
    if (!includePresenterNotes) {
      // Clean Executive Key Takeaway Bar at bottom of Slide
      const bannerY = 182;
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, bannerY, contentW, 13, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(52, 211, 153);
      doc.text('CONCLUSIÓN EJECUTIVA:', margin + 5, bannerY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(255, 255, 255);
      doc.text(slide.keyTakeawayBanner.slice(0, 135), margin + 45, bannerY + 8);
    } else {
      // PRESENTER TELEPROMPTER & OBJECTION DOCK FOR JOSÉ (Bottom 66mm of Landscape Slide)
      const dockY = 131;
      const dockH = 64;
      const note = slide.speakerNotes;

      doc.setFillColor(15, 23, 42);
      doc.setDrawColor(16, 185, 129);
      doc.roundedRect(margin, dockY, contentW, dockH, 3, 3, 'FD');

      // Top Strip inside Presenter Dock
      doc.setFillColor(6, 78, 59);
      doc.roundedRect(margin, dockY, contentW, 9, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(250, 204, 21);
      doc.text(
        `GUÍA DEL EXPOSITOR PARA JOSÉ · QUÉ DECIR Y CÓMO DEFENDER ESTA LÁMINA`,
        margin + 5,
        dockY + 6
      );
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(209, 250, 229);
      doc.text(
        `Acción Visual: ${note.visualCueForInvestor.slice(0, 95)}`,
        pageW - margin - 5,
        dockY + 6,
        { align: 'right' }
      );

      // Left 58%: Verbatim Script for José
      const leftDockW = contentW * 0.57;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(52, 211, 153);
      doc.text('TU GUION LITERAL SUGERIDO (PALABRA POR PALABRA):', margin + 5, dockY + 15);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.2);
      doc.setTextColor(255, 255, 255);
      const scriptLines = doc.splitTextToSize(note.whatJoseSaysVerbatim, leftDockW - 8);
      doc.text(scriptLines.slice(0, 6), margin + 5, dockY + 20.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.setTextColor(250, 204, 21);
      doc.text(
        `Transición: ${note.transitionPhrase.slice(0, 95)}`,
        margin + 5,
        dockY + dockH - 4.5
      );

      // Vertical Divider inside Presenter Dock
      const rightDockX = margin + leftDockW + 4;
      const rightDockW = contentW - leftDockW - 9;
      doc.setDrawColor(51, 65, 85);
      doc.line(rightDockX - 2, dockY + 12, rightDockX - 2, dockY + dockH - 4);

      // Right 42%: Psychology + Investor Objection Q&A
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.setTextColor(56, 189, 248);
      doc.text('POR QUÉ FUNCIONA PSICOLÓGICAMENTE:', rightDockX, dockY + 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(203, 213, 225);
      const psyLines = doc.splitTextToSize(note.whyItWorksPsychology, rightDockW);
      doc.text(psyLines.slice(0, 3), rightDockX, dockY + 19.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.setTextColor(250, 204, 21);
      doc.text(
        `SI PREGUNTAN: "${note.investorQuestionAndAnswer.question.slice(0, 68)}"`,
        rightDockX,
        dockY + 35.5
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(241, 245, 249);
      const ansLines = doc.splitTextToSize(
        `Respuesta: ${note.investorQuestionAndAnswer.answer}`,
        rightDockW
      );
      doc.text(ansLines.slice(0, 4), rightDockX, dockY + 40.5);
    }

    // Minimalist Editorial Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${businessName} · Arquitectura Estratégica $100M Offers · Preparado por Daniel 1.0 (${dateStr})`,
      margin,
      pageH - 5
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Lámina 0${slide.slideIndex} de 0${slide.totalSlides}`,
      pageW - margin,
      pageH - 5,
      { align: 'right' }
    );
  });

  const safeSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28);

  const filename = includePresenterNotes
    ? `Presentacion-Keynote-Guion-Expositor-Jose-${safeSlug || '4haus'}.pdf`
    : `Presentacion-Ejecutiva-Keynote-5-Laminas-${safeSlug || '4haus'}.pdf`;

  doc.save(filename);
  return filename;
}

export async function generateAndDownloadStrategyDossierPdf(
  input: DossierExportInput = {}
): Promise<string> {
  let workspace = input.workspace || null;

  if (!workspace) {
    try {
      const res = await fetch('/api/studio/workspace', {
        headers: input.userId ? { 'x-user-id': input.userId } : {},
      });
      if (res.ok) {
        workspace = await res.json();
      }
    } catch {
      // continue with available data
    }
  }

  const bp = workspace?.businessProfile;
  const niche = workspace?.nicheProfiles?.[0];
  const pd = input.projectData;

  const latestUserMessage =
    input.customPrompt ||
    [...(input.messages || [])]
      .reverse()
      .find((m) => m.role === 'user')?.content ||
    '';

  const mode: DocumentPresentationMode =
    input.forcedMode ||
    input.customPdfSpec?.presentationMode ||
    pd?.customPdfSpec?.presentationMode ||
    detectRequestedPresentationMode(latestUserMessage);

  const spec =
    input.customPdfSpec ||
    pd?.customPdfSpec ||
    buildTailoredPdfSpecFromPrompt(latestUserMessage, workspace, pd, mode);

  const businessName =
    pd?.businessName || bp?.businessName || '4haus Real Estate & Growth';
  const industry =
    pd?.industry || bp?.industry || 'Inmobiliaria Prime & Servicios High-Ticket';
  const targetLocation =
    pd?.targetLocation || bp?.targetLocation || 'Madrid, Marbella, CDMX & Miami';
  const averageTicket =
    pd?.averageTicket || bp?.averageTicket || '450.000 € - 2.500.000 €';
  const targetAudience =
    pd?.targetAudience ||
    niche?.priorityAudience ||
    bp?.targetAudience ||
    'Propietarios Patrimoniales, Family Offices & Decisores';
  const goal90Days =
    pd?.goal90Days ||
    bp?.goal90Days ||
    '12 Exclusivas Cualificadas & 36 Reuniones con Inversores en 90 Días';

  return renderEditorialKeynoteDeckPdf(
    spec,
    businessName,
    industry,
    targetLocation,
    averageTicket,
    targetAudience,
    goal90Days,
    mode === 'speaker-script'
  );
}
