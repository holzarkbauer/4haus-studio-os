export interface BusinessProfile {
  id: string;
  businessName: string;
  industry: string;
  productType: string;
  propertyType?: string; // Si es inmobiliario
  targetLocation: string;
  averageTicket: string;
  targetAudience: string;
  goal90Days: string;
  approxBudget: string;
  preferredChannels: string[];
  communicationTone: string;
  commercialCapacity: string;
  createdAt: string;
}

export interface BuyerPersona {
  name: string;
  role: string;
  segment: string;
  painPoints: string[];
  motivations: string[];
  objections: string[];
  preferredChannels: string[];
}

export interface MarketSignal {
  signal: string;
  opportunity: string;
  urgency: 'Alta' | 'Media' | 'Baja';
  recommendedAction: string;
}

export interface NicheProfile {
  id: string;
  businessProfileId: string;
  nicheName: string;
  summary: string;
  priorityAudience: string;
  valueProposition: string;
  marketSignals: MarketSignal[];
  buyerPersonas: BuyerPersona[];
  mainProblems: string[];
  mainObjections: string[];
  motivations: string[];
  communicationAngles: string[];
  recommendedChannels: string[];
  suggestedNextStep: string;
  aiEngine: string;
  createdAt: string;
}

export type LeadTemperature = 'Caliente' | 'Templado' | 'Frío';
export type LeadStatus = 'Nuevo' | 'Contactado' | 'Respondió' | 'Cualificado' | 'Reunión Agendada' | 'Descartado';
export type LeadChannel = 'Email' | 'Instagram' | 'LinkedIn' | 'WhatsApp' | 'Web Form';

export interface Prospect {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  socialHandle: string;
  channel: LeadChannel;
  location: string;
  niche: string;
  temperature: LeadTemperature;
  status: LeadStatus;
  source: string;
  sourceUrl?: string;
  createdAt: string;
  recommendedAction: string;
  isMocked: boolean;
}

export interface CampaignDraft {
  id: string;
  nicheProfileId: string;
  campaignName: string;
  segment: string;
  channel: 'Email' | 'Instagram' | 'LinkedIn';
  objective: string;
  offer: string;
  tone: string;
  cta: string;
  subjectOrHook: string;
  mainBody: string;
  followUpMessage: string;
  alternativeVariant: string;
  personalizationTip: string;
  dataWarning?: string;
  status: 'Borrador' | 'Listo (Envío Pendiente)' | 'Enviado por Gmail';
  createdAt: string;
}

export interface PdfDocumentSection {
  sectionNumber: string;
  title: string;
  subtitle?: string;
  narrative: string;
  keyPoints?: string[];
  metricsTable?: { label: string; value: string; impact?: string }[];
}

export interface HormoziValueEquationBlock {
  dreamOutcome: string;
  perceivedLikelihood: string;
  timeDelay: string;
  effortAndSacrifice: string;
  grandSlamOfferTitle: string;
  coreStack: { item: string; perceivedValue: string; description: string }[];
  riskReversalGuarantee: string;
  scarcityAndUrgency: string;
}

export type DocumentPresentationMode =
  | 'speaker-script'
  | 'infographic-dashboard'
  | 'executive-dossier';

export interface SpeakerSlideNote {
  slideNumber: string;
  slideTitle: string;
  visualCueForInvestor: string;
  whatJoseSaysVerbatim: string;
  whyItWorksPsychology: string;
  investorQuestionAndAnswer: {
    question: string;
    answer: string;
  };
  transitionPhrase: string;
}

export interface PresentationSlideBlock {
  title: string;
  subtitle?: string;
  metric?: string;
  tag?: string;
  description?: string;
  bullets?: string[];
  accent?: 'emerald' | 'amber' | 'rose' | 'sky';
}

export interface PresentationSlideSpec {
  slideIndex: number;
  totalSlides: number;
  categoryKicker: string;
  headline: string;
  subheadline: string;
  keyTakeawayBanner: string;
  layoutType:
    | 'hero-vision'
    | 'split-diagnosis'
    | 'architecture-pillars'
    | 'hormozi-value-matrix'
    | 'financial-roi-roadmap';
  heroStat?: {
    value: string;
    label: string;
    subtext: string;
  };
  blocks: PresentationSlideBlock[];
  speakerNotes: SpeakerSlideNote;
}

export interface CustomPdfDocumentSpec {
  documentType: 'investor-pitch-hormozi' | 'custom-presentation' | 'executive-dossier' | 'speaker-script';
  presentationMode?: DocumentPresentationMode;
  documentTitle: string;
  documentSubtitle: string;
  targetRecipient: string;
  userPrompt: string;
  executiveThesis: string;
  hormoziOffer?: HormoziValueEquationBlock;
  unitEconomics?: {
    averageTicket: string;
    cacEstimated: string;
    ltvToCacRatio: string;
    grossMarginPct: string;
    paybackPeriod: string;
    projectedRoi90Days: string;
    investorUpside: string;
  };
  speakerNotes?: SpeakerSlideNote[];
  slides?: PresentationSlideSpec[];
  sections: PdfDocumentSection[];
  closingCallToAction: string;
}

export interface ProjectPreloadPayload {
  businessName?: string;
  industry?: string;
  productType?: string;
  propertyType?: string;
  targetLocation?: string;
  averageTicket?: string;
  targetAudience?: string;
  goal90Days?: string;
  approxBudget?: string;
  communicationTone?: string;
  landingHeadline?: string;
  landingSubheadline?: string;
  landingCta?: string;
  leadMagnetTitle?: string;
  campaignObjective?: string;
  campaignOffer?: string;
  customPdfSpec?: CustomPdfDocumentSpec;
}

export interface LandingTemplate {
  id: string;
  name: string;
  category: 'Inmobiliaria' | 'Agencia / B2B' | 'SaaS & Tech' | 'Consultoría' | 'Inversión';
  description: string;
  conversionFocus: string;
  previewImage: string;
  sections: string[];
  defaultHeadline: string;
  defaultSubheadline: string;
  defaultCta: string;
}

export interface LandingDraft {
  id: string;
  templateId: string;
  templateName: string;
  businessName: string;
  headline: string;
  subheadline: string;
  valuePoints: string[];
  ctaText: string;
  formFields: string[];
  leadMagnetTitle: string;
  updatedAt: string;
}

export interface StudioAgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: 'Activo (Configuración)' | 'En Pausa' | 'Entrenamiento';
  monthlyBudgetUsd: number;
  monthlyLimitUsd: number;
  autonomyLevel: 'Asistido (Copiloto)' | 'Semi-Autónomo' | 'Autónomo con Aprobación';
  humanApprovalActions: string[];
}

export interface ExternalConnectionStatus {
  id: string;
  name: string;
  category: 'Email' | 'Social OAuth' | 'Datos & Prospección' | 'IA & Cerebro' | 'Publicación Web';
  provider: string;
  status: 'Conectado (Real)' | 'Demo / Mocked' | 'OAuth Pendiente' | 'Proveedor No Configurado' | 'Requiere Fuente Autorizada';
  description: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'Curso' | 'Tutorial' | 'Guía' | 'Libro' | 'Plantilla' | 'Caso Práctico';
  category: 'Ventas' | 'Automatización' | 'Marketing Inmobiliario' | 'Arquitectura IA' | 'Crecimiento B2B';
  durationOrFormat: string;
  description: string;
  recommendedForNiches: string[];
  isRealContent: boolean;
  keyTakeaways: string[];
}

export interface StudioWorkspaceState {
  businessProfile: BusinessProfile | null;
  nicheProfiles: NicheProfile[];
  activeNicheId: string | null;
  prospects: Prospect[];
  campaigns: CampaignDraft[];
  landingTemplates: LandingTemplate[];
  landingDrafts: LandingDraft[];
  agents: StudioAgentConfig[];
  connections: ExternalConnectionStatus[];
  resources: ResourceItem[];
}
