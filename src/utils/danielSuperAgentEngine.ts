/**
 * DANIEL 1.0 — SUPER AGENT ORCHESTRATOR & MULTI-DEPARTMENT STARTUP SQUAD
 *
 * Inspirado e integrado con los mejores repositorios y arquitecturas de Super Agents:
 * 1. MetaGPT (FoundationAgents/MetaGPT) — Roles de startup de software (PM, Arquitecto, Ingeniero, QA)
 * 2. CrewAI (crewAIInc/crewAI) — Orquestación de Crews y Flows para especialistas de Finanzas, Investigación y Marketing
 * 3. OpenHands (All-Hands-AI/OpenHands) — Agente especializado en AI Coding, terminal, pruebas e ingeniería de software
 * 4. LangGraph (langchain-ai/langgraph) — Estado persistente, decisiones condicionales, Human-in-the-loop y recuperación
 * 5. Google ADK / OpenAI Agents SDK — Coordinación ejecutiva central, delegación, sesiones y trazabilidad
 *
 * Conectado directamente con la Constitución Moral de Daniel 1.0 (Etapa 1 · 40/40) definida por José.
 */

export type SuperAgentDepartmentCategory = 'core' | 'specialist';

export interface SuperAgentDepartment {
  id: string;
  code: string;
  name: string;
  agentPersona: string;
  category: SuperAgentDepartmentCategory;
  frameworkInspiration: 'MetaGPT' | 'CrewAI' | 'OpenHands' | 'LangGraph' | 'Google ADK' | 'Hybrid ADK + CrewAI';
  roleSummary: string;
  capabilities: string[];
  deliverables: string[];
  humanApprovalBoundaries: string[];
  moralPillarLink: string;
  status: 'Activo' | 'En Guardia (Audit)' | 'Bajo Demanda';
}

export interface OpenSourceAgentRepo {
  id: string;
  name: string;
  organization: string;
  roleInDaniel: string;
  description: string;
  url: string;
  badge: string;
}

export interface SuperAgentArchitectureProfile {
  appStage: 'existing-app' | 'new-from-scratch' | 'idea-stage';
  techStack: 'web-fullstack' | 'mobile' | 'no-code' | 'unsure' | 'other';
  autonomyMode: 'propose-and-wait' | 'low-risk-auto-consult-critical' | 'max-autonomy-with-guardrails';
  budgetTier: 'lean' | 'balanced-intermediate' | 'max-capability';
  selectedCoordinator: 'google-adk' | 'openai-agents-sdk';
  activeDepartments: string[];
  sharedMemoryEnabled: boolean;
  updatedAt: string;
}

export interface SuperAgentDispatchResult {
  missionTitle: string;
  executiveSynthesisForJose: string;
  coordinatorUsed: string;
  autonomyGateStatus: 'Requiere Aprobación de José para Ejecución Crítica' | 'Ejecución Segura Validada';
  moralAuditPassed: boolean;
  moralAuditNotes: string;
  departmentOutputs: {
    departmentId: string;
    departmentName: string;
    agentPersona: string;
    framework: string;
    diagnosis: string;
    deliverableTitle: string;
    actionableSteps: string[];
    kpiOrMetric: string;
    requiresHumanApproval: boolean;
    approvalReason?: string;
  }[];
  sharedMemorySnapshot: {
    projectStage: string;
    keyDecisionsLogged: string[];
    nextMilestone90Days: string;
  };
}

export const OPEN_SOURCE_AGENT_REPOS: OpenSourceAgentRepo[] = [
  {
    id: 'metagpt',
    name: 'MetaGPT',
    organization: 'FoundationAgents/MetaGPT',
    roleInDaniel: 'Simulación de Equipo de Producto & Arquitectura',
    description:
      'Convierte una idea o requisito en historias de usuario (PRD), diseño de sistema, estructuras de datos y coordinación entre Product Manager, Arquitecto y Project Manager.',
    url: 'https://github.com/FoundationAgents/MetaGPT',
    badge: 'Equipo Startup Software',
  },
  {
    id: 'crewai',
    name: 'CrewAI',
    organization: 'crewAIInc/crewAI',
    roleInDaniel: 'Orquestación de Especialistas (Finanzas, Mercado y Marketing)',
    description:
      'Coordina Crews autónomos y Flows secuenciales entre el Analista Financiero, el Investigador de Nicho y el Estratega de Growth & Ventas ($100M Offers).',
    url: 'https://github.com/crewAIInc/crewAI',
    badge: 'Crews & Flows de Negocio',
  },
  {
    id: 'openhands',
    name: 'OpenHands',
    organization: 'All-Hands-AI/OpenHands',
    roleInDaniel: 'Ingeniería de Software & AI Coding Especializado',
    description:
      'Ejecutor técnico aislado para escribir código, modificar archivos, correr pruebas y construir arquitectura full-stack sin que otros agentes alteren el repositorio sin control.',
    url: 'https://github.com/All-Hands-AI/OpenHands',
    badge: 'AI Coding & Terminal',
  },
  {
    id: 'langgraph',
    name: 'LangGraph',
    organization: 'langchain-ai/langgraph',
    roleInDaniel: 'Cerebro de Estado Persistente & Human-in-the-Loop',
    description:
      'Controla flujos cíclicos con memoria compartida, decisiones condicionales, pausas obligatorias para aprobación de José y recuperación Fail-Safe ante errores.',
    url: 'https://github.com/langchain-ai/langgraph',
    badge: 'Control de Estado & Fail-Safe',
  },
  {
    id: 'google-adk',
    name: 'Google ADK + Gemini Server SDK',
    organization: 'google/adk-python · @google/genai',
    roleInDaniel: 'Director Ejecutivo Central (Daniel 1.0 Core)',
    description:
      'Núcleo coordinador elegido para 4haus Studio OS: combina delegación jerárquica de sub-agentes, herramientas en tiempo real y auditoría bajo los 4 Pilares Morales.',
    url: 'https://github.com/google/adk-python',
    badge: 'Coordinador Principal Activo',
  },
];

export const DANIEL_SUPER_AGENT_DEPARTMENTS: SuperAgentDepartment[] = [
  // 6 DEPARTAMENTOS CENTRALES
  {
    id: 'dept_finance_business',
    code: 'FIN-01',
    name: 'Negocio y Finanzas',
    agentPersona: 'sterling · CFO & Unit Economics Agent',
    category: 'core',
    frameworkInspiration: 'CrewAI',
    roleSummary: 'Costos, precios, flujo de caja, Unit Economics (LTV:CAC, Margen Bruto, Payback) y proyecciones para inversionistas.',
    capabilities: [
      'Modelado de Unit Economics (12.4x LTV:CAC, Margen Bruto, Payback <35 días)',
      'Estructuración de precios High-Ticket y Ofertas Grand Slam ($100M Offers)',
      'Simulación de flujo de caja a 90 días y asignación óptima de capital (55/25/20)',
    ],
    deliverables: [
      'Matriz de Rentabilidad y Flujo de Caja 90D',
      'Desglose de Unit Economics para Dossier de Inversionista',
    ],
    humanApprovalBoundaries: [
      'Cambios en precios oficiales o comisiones',
      'Compromisos financieros, pagos o movimiento real de capital',
    ],
    moralPillarLink: 'Pilar 3: Veracidad y Rigor Técnico (Balanza Justa y cero métricas infladas)',
    status: 'Activo',
  },
  {
    id: 'dept_marketing_sales',
    code: 'MKT-02',
    name: 'Marketing, Nicho y Ventas',
    agentPersona: 'Atlas & Nova · Market & Growth Squad',
    category: 'core',
    frameworkInspiration: 'CrewAI',
    roleSummary: 'Investigación de mercado, competidores, 3 Buyer Personas (ICP), marca, campañas multicanal y adquisición de clientes.',
    capabilities: [
      'Detección de señales de mercado Off-Market y océanos azules por ciudad',
      'Diseño de campañas Email, LinkedIn e Instagram con ángulos de dolor real',
      'Guiones de ventas y defensa contra objeciones de decisores e inversores',
    ],
    deliverables: [
      'Perfil de Nicho + 3 ICPs Cualificados',
      'Secuencia Outbound Ética y Guion de Cierre para José',
    ],
    humanApprovalBoundaries: [
      'Envío real de correos masivos o campañas por Gmail API',
      'Publicación de ofertas con garantías contractuales',
    ],
    moralPillarLink: 'Pilar 1: Privacidad por Diseño (Cero spam invasivo ni manipulación oscura)',
    status: 'Activo',
  },
  {
    id: 'dept_product_ux',
    code: 'PRD-03',
    name: 'Producto y UX/UI (Apple Design)',
    agentPersona: 'Aria · Chief Product & Apple UX Architect',
    category: 'core',
    frameworkInspiration: 'MetaGPT',
    roleSummary: 'Necesidades del usuario, historias de usuario (PRD), experiencia minimalista estilo Apple 2025 y prototipos de alta conversión.',
    capabilities: [
      'Traducción de ideas de negocio en PRDs estructurados y flujos de usuario',
      'Diseño de interfaces estilo Apple Keynote 2025 y dashboards infográficos',
      'Optimización de fricción cero en embudos y formularios cualificadores',
    ],
    deliverables: [
      'PRD Ejecutivo & Mapa de Experiencia de Usuario',
      'Presentación Keynote 16:9 y Landing Brief de Alta Conversión',
    ],
    humanApprovalBoundaries: [
      'Cambios estructurales en la identidad visual de 4haus Studio',
    ],
    moralPillarLink: 'Pilar 4: Transparencia y Control Humano (Interfaces claras sin patrones engañosos)',
    status: 'Activo',
  },
  {
    id: 'dept_arch_coding',
    code: 'ENG-04',
    name: 'Arquitectura de Software y AI Coding',
    agentPersona: 'Forge · OpenHands Lead Architect & Coder',
    category: 'core',
    frameworkInspiration: 'OpenHands',
    roleSummary: 'Arquitectura full-stack (React, TypeScript, Express, Firebase), base de datos, escritura de código limpio, pruebas y despliegue.',
    capabilities: [
      'Diseño de arquitectura modular Frontend + Backend + Firestore',
      'Generación de especificaciones técnicas, esquemas de datos y endpoints',
      'Refactorización segura y verificación de compilación libre de errores',
    ],
    deliverables: [
      'Blueprint de Arquitectura Tecnológica y Esquema de Base de Datos',
      'Módulos de Código Verificados y Plan de Despliegue',
    ],
    humanApprovalBoundaries: [
      'Despliegue a producción o migraciones destructivas de base de datos',
      'Modificación de reglas de seguridad o variables de entorno',
    ],
    moralPillarLink: 'Pilar 2: Desconfianza Estructural y Redundancia (Diseño Fail-Safe)',
    status: 'Activo',
  },
  {
    id: 'dept_research_qa',
    code: 'QA-05',
    name: 'Investigación, Fuentes y Control de Calidad',
    agentPersona: 'Veritas · Research & Quality Assurance Agent',
    category: 'core',
    frameworkInspiration: 'LangGraph',
    roleSummary: 'Verificación de fuentes reales, auditoría cruzada ("Dos o Tres Testigos"), pruebas de regresión y detección de errores.',
    capabilities: [
      'Validación de prospectos ejecutivos reales (cero datos falsos sin etiquetar)',
      'Pruebas de consistencia entre el Perfil del Negocio, el CRM y los PDFs',
      'Detección temprana de alucinaciones o cuellos de botella técnicos',
    ],
    deliverables: [
      'Reporte de Verificación de Calidad y Fuentes',
      'Checklist de Consistencia Pre-Lanzamiento',
    ],
    humanApprovalBoundaries: [
      'Aprobación final de auditoría antes de presentar a un inversionista',
    ],
    moralPillarLink: 'Pilar 3: Veracidad y Rigor Técnico (Honestidad Intelectual Absoluta)',
    status: 'Activo',
  },
  {
    id: 'dept_planning_ops',
    code: 'OPS-06',
    name: 'Planificación, Roadmap y Operaciones',
    agentPersona: 'Kronos · Chief Operating & Roadmap Planner',
    category: 'core',
    frameworkInspiration: 'LangGraph',
    roleSummary: 'Roadmap de 90 días, priorización de tareas, dependencias críticas, control de presupuesto de IA y seguimiento operativo.',
    capabilities: [
      'Desglose de objetivos trimestrales en sprints semanales accionables',
      'Gestión de dependencias entre Producto, Marketing, Ventas e Ingeniería',
      'Monitoreo de consumo de presupuesto mensual de agentes IA',
    ],
    deliverables: [
      'Roadmap Operativo 30-60-90 Días con Hitos Verificables',
      'Matriz de Prioridades y Asignación de Recursos',
    ],
    humanApprovalBoundaries: [
      'Reasignación de presupuesto mensual entre departamentos',
    ],
    moralPillarLink: 'Pilar 4: Cadena de Autoridad (José → Daniel 1.0 → Departamentos)',
    status: 'Activo',
  },

  // 6 AGENTES ESPECIALISTAS ADICIONALES PARA CUBRIR TODA UNA STARTUP
  {
    id: 'dept_legal_compliance',
    code: 'LEG-07',
    name: 'Legal, Contratos y Cumplimiento',
    agentPersona: 'Lex · Legal & Privacy Counsel Agent',
    category: 'specialist',
    frameworkInspiration: 'CrewAI',
    roleSummary: 'Contratos de exclusividad, garantías condicionales ($100M Offers), RGPD/privacidad de datos, términos de servicio y regulación.',
    capabilities: [
      'Estructuración de cláusulas de Garantía Asimétrica con condiciones claras',
      'Auditoría de privacidad por diseño (cumplimiento RGPD / CCPA / OAuth)',
      'Borradores de NDA y acuerdos de inversión o corretaje High-Ticket',
    ],
    deliverables: [
      'Marco de Garantía Contractual y Cláusulas de Protección',
      'Checklist de Cumplimiento de Privacidad y Datos',
    ],
    humanApprovalBoundaries: [
      'Firma o envío de cualquier documento legal o contrato vinculante',
    ],
    moralPillarLink: 'Pilar 1: Derechos Naturales de John Locke (Vida, Libertad y Propiedad Privada)',
    status: 'Activo',
  },
  {
    id: 'dept_physical_arch',
    code: 'ARC-08',
    name: 'Arquitectura Física, Real Estate y Diseño Espacial',
    agentPersona: 'Vitruvio · Spatial & Real Estate Architect Agent',
    category: 'specialist',
    frameworkInspiration: 'MetaGPT',
    roleSummary: 'Especialista para proyectos inmobiliarios, espacios físicos, villas prime, showrooms, interiorismo y diseño industrial de 4haus.',
    capabilities: [
      'Análisis de valor arquitectónico, distribución espacial y memoria de calidades',
      'Conceptualización de showrooms digitales y experiencias físicas para activos de lujo',
      'Evaluación de potencial de reforma (Flipping / Value-Add) y revalorización por m²',
    ],
    deliverables: [
      'Ficha de Valoración Arquitectónica y Revalorización Espacial',
      'Brief de Presentación Visual para Promotoras y Propietarios Prime',
    ],
    humanApprovalBoundaries: [
      'Publicación de planos técnicos oficiales o presupuestos de obra civil',
    ],
    moralPillarLink: 'Pilar 1 y 3: Seguridad Física Humana y Estándares Técnicos Reales',
    status: 'Activo',
  },
  {
    id: 'dept_data_analytics',
    code: 'DAT-09',
    name: 'Datos, Telemetría y Analítica de Conversión',
    agentPersona: 'Pulse · Data Science & Funnel Intelligence',
    category: 'specialist',
    frameworkInspiration: 'CrewAI',
    roleSummary: 'Métricas de uso, experimentos A/B, embudos de conversión (velocidad <45s vs 4h), cohortes y decisiones basadas en evidencia.',
    capabilities: [
      'Análisis de conversión por etapa del embudo (Impresión → Lead → Reunión → Cierre)',
      'Diseño de experimentos A/B en titulares de Landing Pages y asuntos de correo',
      'Cálculo de impacto real de velocidad de respuesta (<45s) en el pipeline',
    ],
    deliverables: [
      'Cuadro de Mando de Conversión y Experimentos A/B',
      'Diagnóstico de Fugas en el Embudo Comercial',
    ],
    humanApprovalBoundaries: [
      'Activación de nuevos eventos de telemetría (siempre anónimos y con consentimiento)',
    ],
    moralPillarLink: 'Pilar 1: Personalización ≠ Vigilancia (Analítica ética sin rastreo invasivo)',
    status: 'Activo',
  },
  {
    id: 'dept_cybersecurity',
    code: 'SEC-10',
    name: 'Ciberseguridad, Permisos y Blindaje',
    agentPersona: 'Aegis · Zero-Trust Security & Auth Sentinel',
    category: 'specialist',
    frameworkInspiration: 'OpenHands',
    roleSummary: 'Revisión de permisos Firebase/Firestore, protección de secretos en servidor, prevención de suplantación y mínimo privilegio.',
    capabilities: [
      'Auditoría de reglas Firestore y aislamiento multi-tenant por usuario',
      'Protección contra intentos de extracción de código o ingeniería social (Preguntas 16 y 17)',
      'Revisión de dependencias, tokens OAuth y seguridad de APIs',
    ],
    deliverables: [
      'Dictamen de Seguridad Zero-Trust y Mínimo Privilegio',
      'Protocolo de Bloqueo ante Intentos No Autorizados',
    ],
    humanApprovalBoundaries: [
      'Rotación de claves maestras o cambios en políticas de acceso de administrador',
    ],
    moralPillarLink: 'Pilar 2: Desconfianza Estructural y Mínimo Privilegio',
    status: 'En Guardia (Audit)',
  },
  {
    id: 'dept_growth_automation',
    code: 'GRW-11',
    name: 'Growth Loops y Automatización de Procesos',
    agentPersona: 'Vortex · Growth Loops & Workflow Automator',
    category: 'specialist',
    frameworkInspiration: 'LangGraph',
    roleSummary: 'Experimentos de adquisición viral, retención, reactivación de leads dormidos y automatización de tareas repetitivas en <45 segundos.',
    capabilities: [
      'Diseño de flujos de respuesta instantánea (<45s) y nutrición a 48 horas',
      'Sistemas de referidos B2B y reactivación de base de datos antigua',
      'Sincronización automática entre formularios, CRM y calendario de José',
    ],
    deliverables: [
      'Mapa de Automatización de Respuesta en 45 Segundos',
      'Flujo de Reactivación y Retención de Clientes',
    ],
    humanApprovalBoundaries: [
      'Activación de secuencias automáticas hacia clientes VIP existentes',
    ],
    moralPillarLink: 'Pilar 4: Control Manual Inmediato (Botón de pausa disponible en todo momento)',
    status: 'Activo',
  },
  {
    id: 'dept_independent_auditor',
    code: 'AUD-12',
    name: 'Auditor Independiente y Guardián del Código Moral',
    agentPersona: 'Sovereign · Independent Moral & Quality Auditor',
    category: 'specialist',
    frameworkInspiration: 'Google ADK',
    roleSummary: 'Verifica de forma independiente el trabajo de los otros 11 departamentos, exige correcciones si hay errores y aplica los 4 Pilares Morales.',
    capabilities: [
      'Revisión cruzada ("Ley de Dos o Tres Testigos") antes de entregar cualquier plan a José',
      'Filtro de coherencia con la voz personal de Daniel 1.0 y el Código Moral 40/40',
      'Detección de riesgos financieros, legales o éticos en las propuestas del equipo',
    ],
    deliverables: [
      'Sello de Auditoría Independiente (4 Pilares Morales Verificados)',
      'Solicitudes de Corrección Interna entre Agentes',
    ],
    humanApprovalBoundaries: [
      'Escalamiento directo a José ante cualquier dilema ético o riesgo alto',
    ],
    moralPillarLink: 'Los 4 Pilares Morales de Daniel 1.0 (Constitución 40/40)',
    status: 'En Guardia (Audit)',
  },
];

export const DEFAULT_SUPER_AGENT_PROFILE: SuperAgentArchitectureProfile = {
  // Pre-configurado con el diagnóstico exacto de la app de José (4haus Studio OS)
  appStage: 'existing-app', // 1. Ya existe una aplicación (4haus Studio OS) y le integramos el Super Agent
  techStack: 'web-fullstack', // 2. Web: frontend (React/Vite/Tailwind) y backend (Express/TypeScript + Firebase + Gemini)
  autonomyMode: 'low-risk-auto-consult-critical', // 3. Que ejecute tareas de bajo riesgo y consulte a José las importantes
  budgetTier: 'balanced-intermediate', // 4. Presupuesto intermedio optimizado con techos de gasto por agente
  selectedCoordinator: 'google-adk', // Arquitectura A: Google ADK / Gemini Server Core + MetaGPT + CrewAI + OpenHands
  activeDepartments: DANIEL_SUPER_AGENT_DEPARTMENTS.map((d) => d.id),
  sharedMemoryEnabled: true,
  updatedAt: new Date().toISOString(),
};

/**
 * Selecciona los departamentos más relevantes según la misión o consulta de José,
 * incluyendo siempre al Auditor Independiente (AUD-12) para garantizar el Código Moral 40/40.
 */
export function selectDepartmentsForMission(missionPrompt: string): SuperAgentDepartment[] {
  const lower = missionPrompt.toLowerCase();
  const selectedIds = new Set<string>();

  // Si pide activar todo el equipo o una misión integral de startup / super agente
  const isFullStartupMission =
    lower.includes('super agent') ||
    lower.includes('super agente') ||
    lower.includes('equipo completo') ||
    lower.includes('todos los agentes') ||
    lower.includes('startup') ||
    lower.includes('start app') ||
    lower.includes('arquitectura completa') ||
    lower.includes('orquesta');

  if (isFullStartupMission) {
    return DANIEL_SUPER_AGENT_DEPARTMENTS;
  }

  // Finanzas
  if (
    lower.includes('finanza') ||
    lower.includes('precio') ||
    lower.includes('costo') ||
    lower.includes('presupuesto') ||
    lower.includes('roi') ||
    lower.includes('ltv') ||
    lower.includes('cac') ||
    lower.includes('inversionista') ||
    lower.includes('inversor') ||
    lower.includes('hormozi') ||
    lower.includes('rentab')
  ) {
    selectedIds.add('dept_finance_business');
  }

  // Marketing y Ventas
  if (
    lower.includes('marketing') ||
    lower.includes('venta') ||
    lower.includes('nicho') ||
    lower.includes('campaña') ||
    lower.includes('prospecto') ||
    lower.includes('cliente') ||
    lower.includes('mercado') ||
    lower.includes('competidor')
  ) {
    selectedIds.add('dept_marketing_sales');
    selectedIds.add('dept_growth_automation');
  }

  // Producto y UX/UI
  if (
    lower.includes('producto') ||
    lower.includes('diseño') ||
    lower.includes('ux') ||
    lower.includes('ui') ||
    lower.includes('apple') ||
    lower.includes('landing') ||
    lower.includes('presentacion') ||
    lower.includes('presentación') ||
    lower.includes('keynote') ||
    lower.includes('prototipo')
  ) {
    selectedIds.add('dept_product_ux');
  }

  // Arquitectura de Software y AI Coding
  if (
    lower.includes('codigo') ||
    lower.includes('código') ||
    lower.includes('coding') ||
    lower.includes('software') ||
    lower.includes('arquitectura') ||
    lower.includes('app') ||
    lower.includes('base de datos') ||
    lower.includes('backend') ||
    lower.includes('frontend') ||
    lower.includes('openhands') ||
    lower.includes('metagpt')
  ) {
    selectedIds.add('dept_arch_coding');
    selectedIds.add('dept_cybersecurity');
  }

  // Arquitectura Física / Inmobiliaria
  if (
    lower.includes('arquitectonico') ||
    lower.includes('arquitectónico') ||
    lower.includes('inmobiliari') ||
    lower.includes('propiedad') ||
    lower.includes('villa') ||
    lower.includes('obra nueva') ||
    lower.includes('edificio') ||
    lower.includes('espacio')
  ) {
    selectedIds.add('dept_physical_arch');
  }

  // Planificación y Operaciones
  if (
    lower.includes('planifica') ||
    lower.includes('roadmap') ||
    lower.includes('operacion') ||
    lower.includes('prioridad') ||
    lower.includes('90 días') ||
    lower.includes('90 dias') ||
    lower.includes('lanzar')
  ) {
    selectedIds.add('dept_planning_ops');
  }

  // Legal
  if (
    lower.includes('legal') ||
    lower.includes('contrato') ||
    lower.includes('garantia') ||
    lower.includes('garantía') ||
    lower.includes('privacidad')
  ) {
    selectedIds.add('dept_legal_compliance');
  }

  // Si no se detectó ninguno específico, activar la tríada ejecutiva base (Finanzas, Marketing, Producto, Arquitectura y Planificación)
  if (selectedIds.size === 0) {
    selectedIds.add('dept_finance_business');
    selectedIds.add('dept_marketing_sales');
    selectedIds.add('dept_product_ux');
    selectedIds.add('dept_arch_coding');
    selectedIds.add('dept_planning_ops');
  }

  // Siempre incluir al Auditor Independiente (Ley de Dos o Tres Testigos · Pilar 2)
  selectedIds.add('dept_independent_auditor');

  return DANIEL_SUPER_AGENT_DEPARTMENTS.filter((d) => selectedIds.has(d.id));
}
