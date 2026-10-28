import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Target,
  Users,
  Send,
  LayoutTemplate,
  BookOpen,
  Bot,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  Copy,
  Check,
  ArrowRight,
  ChevronRight,
  Globe,
  ShieldAlert,
  TrendingUp,
  Layers,
  Mail,
  Instagram,
  Linkedin,
  MapPin,
  Flame,
  Eye,
  Save,
  Sliders,
  DollarSign,
  Link2,
  RefreshCw,
} from 'lucide-react';
import {
  BusinessProfile,
  NicheProfile,
  Prospect,
  CampaignDraft,
  LandingTemplate,
  LandingDraft,
  StudioAgentConfig,
  ExternalConnectionStatus,
  ResourceItem,
  StudioWorkspaceState,
  LeadTemperature,
  LeadStatus,
  LeadChannel,
  ProjectPreloadPayload,
} from '../types/leadNichoTypes';
import { Language } from '../types';
import {
  sendGmailCampaignEmail,
  syncWorkspaceMetaToFirestore,
  syncProspectToFirestore,
  saveProjectToFirestore,
  subscribeToUserProspects,
} from '../services/firebaseAuth';
import {
  mapFirestoreProspectToCrmProspect,
  runUserProspectsFirestoreMigration,
} from '../services/prospectMigration';
import {
  OPEN_SOURCE_AGENT_REPOS,
  DEFAULT_SUPER_AGENT_PROFILE,
  SuperAgentArchitectureProfile,
  SuperAgentDispatchResult,
} from '../utils/danielSuperAgentEngine';

export type GrowthStepId =
  | 'dashboard'
  | 'paso1-negocio'
  | 'paso2-nicho'
  | 'paso3-prospectos'
  | 'paso4-campana'
  | 'paso5-landing'
  | 'paso6-recursos'
  | 'paso7-agentes'
  | 'conexiones';

interface LeadNichoEngineProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  initialStep?: GrowthStepId;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  preloadData?: ProjectPreloadPayload | null;
  onOpenDanielModal?: () => void;
  onOpenTutorialsModal?: () => void;
  onOpenBooksModal?: () => void;
  onOpenLivePreview?: (url: string, title: string) => void;
}

export function LeadNichoEngine({
  lang,
  themeMode = 'dark',
  initialStep = 'dashboard',
  userId,
  userEmail,
  userName,
  preloadData,
  onOpenDanielModal,
  onOpenTutorialsModal,
  onOpenBooksModal,
  onOpenLivePreview,
}: LeadNichoEngineProps) {
  const isDark = themeMode === 'dark';

  const [activeStep, setActiveStep] = useState<GrowthStepId>(initialStep);
  const [workspace, setWorkspace] = useState<StudioWorkspaceState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingNiche, setIsGeneratingNiche] = useState<boolean>(false);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState<boolean>(false);
  const [isGeneratingDemoLeads, setIsGeneratingDemoLeads] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Super Agent 12-Department Orchestrator & Questionnaire State (Step 7)
  const [superAgentProfile, setSuperAgentProfile] = useState<SuperAgentArchitectureProfile>(() => {
    try {
      const saved = localStorage.getItem('daniel_super_agent_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SUPER_AGENT_PROFILE;
  });
  const [superAgentMissionInput, setSuperAgentMissionInput] = useState<string>('');
  const [isDispatchingSuperAgent, setIsDispatchingSuperAgent] = useState<boolean>(false);
  const [superAgentDispatchResult, setSuperAgentDispatchResult] =
    useState<SuperAgentDispatchResult | null>(null);

  const handleUpdateSuperAgentProfile = (patch: Partial<SuperAgentArchitectureProfile>) => {
    setSuperAgentProfile((prev) => {
      const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem('daniel_super_agent_profile_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRunSuperAgentMission = async () => {
    if (isDispatchingSuperAgent) return;
    setIsDispatchingSuperAgent(true);
    try {
      const res = await fetch('/api/studio/super-agent-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          missionPrompt:
            superAgentMissionInput.trim() ||
            `Escalar ${businessForm.businessName} (${businessForm.industry}) en ${businessForm.targetLocation} coordinando Finanzas, Marketing, Producto Apple UX, AI Coding y Legal`,
          ...superAgentProfile,
          userId: userId || 'default',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dispatchResult) {
          setSuperAgentDispatchResult(data.dispatchResult);
          setStatusBanner(
            '¡Misión del Super Agent completada! Los 12 departamentos y el Auditor Independiente 40/40 han entregado su plan.'
          );
          setTimeout(() => setStatusBanner(null), 5000);
        }
      }
    } catch (err) {
      console.error('Error running Super Agent mission:', err);
    } finally {
      setIsDispatchingSuperAgent(false);
    }
  };

  // Real Gmail Campaign Send Confirmation Modal State
  const [emailModalState, setEmailModalState] = useState<{
    isOpen: boolean;
    campaign: CampaignDraft | null;
    selectedProspectId: string;
    customRecipientEmail: string;
    customRecipientName: string;
    customSubject: string;
    customBody: string;
    isSending: boolean;
    errorMsg: string | null;
  }>({
    isOpen: false,
    campaign: null,
    selectedProspectId: '',
    customRecipientEmail: '',
    customRecipientName: '',
    customSubject: '',
    customBody: '',
    isSending: false,
    errorMsg: null,
  });

  // Sync step if parent changes initialStep
  useEffect(() => {
    if (initialStep) {
      setActiveStep(initialStep);
    }
  }, [initialStep]);

  // Step 1 Form State: Business Profile
  const [businessForm, setBusinessForm] = useState<BusinessProfile>({
    id: 'bp_default_01',
    businessName: '4haus Real Estate & Advisory',
    industry: 'Inmobiliaria Residencial & Inversión Patrimonial',
    productType: 'Captación de Exclusivas y Venta de Obra Nueva Premium',
    propertyType: 'Residencial de Lujo, Áticos y Villas de Inversión',
    targetLocation: 'Madrid, Marbella, Ciudad de México y Miami',
    averageTicket: '450.000 € - 2.500.000 € (Comisión 3% - 5%)',
    targetAudience: 'Propietarios patrimoniales, inversores internacionales y promotores de obra nueva',
    goal90Days: 'Captar 12 propiedades en exclusiva y agendar 30 reuniones cualificadas con inversores',
    approxBudget: '2.500 € / mes en adquisición y automatización',
    preferredChannels: ['Email', 'LinkedIn', 'Instagram', 'WhatsApp'],
    communicationTone: 'Consultivo, ejecutivo, transparente y basado en datos de mercado',
    commercialCapacity: 'Equipo de 3 asesores senior + Copiloto IA para filtrado 24/7',
    createdAt: new Date().toISOString(),
  });

  // Step 3 CRM Filters & New Prospect State
  const [filterChannel, setFilterChannel] = useState<string>('Todos');
  const [filterTemp, setFilterTemp] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterNiche, setFilterNiche] = useState<string>('Todos');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [showNewProspectForm, setShowNewProspectForm] = useState<boolean>(false);
  const [newProspect, setNewProspect] = useState({
    name: '',
    company: '',
    role: '',
    email: '',
    socialHandle: '',
    channel: 'LinkedIn' as LeadChannel,
    location: 'Madrid',
    niche: 'Propietarios Premium',
    temperature: 'Caliente' as LeadTemperature,
    status: 'Nuevo' as LeadStatus,
    recommendedAction: 'Enviar diagnóstico comparativo de zona y agendar llamada.',
  });

  // Step 4 Campaign Generator State
  const [campaignForm, setCampaignForm] = useState({
    nicheProfileId: '',
    segment: 'Propietarios Patrimoniales (+750k€)',
    channel: 'Email' as 'Email' | 'Instagram' | 'LinkedIn',
    objective: 'Agendar auditoría de valoración confidencial y venta off-market',
    offer: 'Dossier con precios reales de escrituración en su manzana + 3 inversores en cartera',
    tone: 'Ejecutivo, consultivo y sin presión comercial',
    cta: '¿Te parece bien si te envío el informe de cierres reales de tu zona este jueves?',
  });

  // Step 5 Landing Page Filter & Brief Editor State
  const [landingCategoryFilter, setLandingCategoryFilter] = useState<string>('Todas');
  const [selectedTemplate, setSelectedTemplate] = useState<LandingTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<LandingTemplate | null>(null);
  const [landingBrief, setLandingBrief] = useState({
    businessName: '4haus Real Estate & Advisory',
    headline: 'Conoce el valor real de cierre de tu propiedad sin exponerla en portales masivos',
    subheadline: 'Accede a un informe técnico basado en escrituras reales de tu zona y conecta con compradores verificados.',
    ctaText: 'Solicitar Dossier de Valoración Confidencial',
    leadMagnetTitle: 'Informe Q4: Precios reales de escrituración vs precios de anuncio en zonas Prime',
    formFields: ['Nombre completo', 'Email profesional', 'Dirección o zona del inmueble', 'Plazo estimado de venta'],
  });

  // Step 6 Resources Filter
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>('Todas');

  // Apply Preloaded Project Data from Guided Prompt Proposal when present
  useEffect(() => {
    if (!preloadData) return;

    setBusinessForm((prev) => ({
      ...prev,
      businessName: preloadData.businessName || prev.businessName,
      industry: preloadData.industry || prev.industry,
      productType: preloadData.productType || prev.productType,
      propertyType: preloadData.propertyType || prev.propertyType,
      targetLocation: preloadData.targetLocation || prev.targetLocation,
      averageTicket: preloadData.averageTicket || prev.averageTicket,
      targetAudience: preloadData.targetAudience || prev.targetAudience,
      goal90Days: preloadData.goal90Days || prev.goal90Days,
      approxBudget: preloadData.approxBudget || prev.approxBudget,
      communicationTone: preloadData.communicationTone || prev.communicationTone,
    }));

    setLandingBrief((prev) => ({
      ...prev,
      businessName: preloadData.businessName || prev.businessName,
      headline: preloadData.landingHeadline || prev.headline,
      subheadline: preloadData.landingSubheadline || prev.subheadline,
      ctaText: preloadData.landingCta || prev.ctaText,
      leadMagnetTitle: preloadData.leadMagnetTitle || prev.leadMagnetTitle,
    }));

    setCampaignForm((prev) => ({
      ...prev,
      segment: preloadData.targetAudience || prev.segment,
      objective: preloadData.campaignObjective || preloadData.goal90Days || prev.objective,
      offer: preloadData.campaignOffer || preloadData.leadMagnetTitle || prev.offer,
      tone: preloadData.communicationTone || prev.tone,
    }));

    showNotification(
      `Datos del proyecto "${preloadData.businessName || 'Tu propuesta'}" precargados automáticamente en el formulario.`
    );
  }, [preloadData]);

  const buildAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': userId || 'default',
    ...(userEmail ? { 'x-user-email': userEmail } : {}),
    ...(userName ? { 'x-user-name': userName } : {}),
  });

  // Load workspace from backend isolated per user account
  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/studio/workspace', {
        headers: buildAuthHeaders(),
      });
      if (res.ok) {
        const data: StudioWorkspaceState = await res.json();
        setWorkspace(data);
        if (data.businessProfile && !preloadData) {
          setBusinessForm(data.businessProfile);
          setLandingBrief((prev) => ({
            ...prev,
            businessName: data.businessProfile?.businessName || prev.businessName,
          }));
        }
        if (data.nicheProfiles?.[0]) {
          setCampaignForm((prev) => ({
            ...prev,
            nicheProfileId: data.nicheProfiles[0].id,
          }));
        }
        if (data.landingTemplates?.[0] && !selectedTemplate) {
          setSelectedTemplate(data.landingTemplates[0]);
        }
      }
    } catch (error) {
      console.error('Error loading studio workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [userId]);

  // Real-time Firestore Prospect Synchronization for Authenticated Users (Schema v2 Genuine Tracking)
  useEffect(() => {
    if (!userId) return;
    // Automatically run migration audit/upgrade on mount so mock records are replaced by genuine v2 prospects
    runUserProspectsFirestoreMigration(userId, {
      targetNiche: businessForm.industry,
      targetLocation: businessForm.targetLocation,
    }).catch(() => {});

    const unsub = subscribeToUserProspects(userId, (firestoreLeads) => {
      if (firestoreLeads.length === 0) return;
      setWorkspace((prev) => {
        if (!prev) return prev;
        const mappedProspects: Prospect[] = firestoreLeads.map((fl) =>
          mapFirestoreProspectToCrmProspect(fl)
        );
        return {
          ...prev,
          prospects: mappedProspects,
        };
      });
    });
    return () => unsub();
  }, [userId]);

  const showNotification = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4500);
  };

  const handleCopyText = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Step 1: Save Business Profile & Optionally Generate Niche
  const handleSaveBusinessProfile = async (andGenerateNiche = false) => {
    try {
      const res = await fetch('/api/studio/business-profile', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ ...businessForm, userId: userId || 'default' }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace((prev) => (prev ? { ...prev, businessProfile: data.businessProfile } : prev));
        if (userId) {
          await syncWorkspaceMetaToFirestore(
            userId,
            businessForm.businessName,
            businessForm.industry,
            businessForm.targetLocation
          ).catch(() => {});
          const safeProjId = `proj_${(businessForm.businessName || 'principal')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .slice(0, 48)}`;
          await saveProjectToFirestore(userId, safeProjId, {
            name: businessForm.businessName,
            industry: businessForm.industry,
            targetLocation: businessForm.targetLocation,
            objective: businessForm.goal90Days || 'Crecimiento comercial en 90 días',
            status: 'Activo',
          }).catch(() => {});
        }
        showNotification('Perfil del negocio y proyecto activo guardados en Firebase Firestore.');
        if (andGenerateNiche) {
          await handleGenerateNicheProfile(data.businessProfile);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Step 2: Generate Niche Profile via AI
  const handleGenerateNicheProfile = async (overrideProfile?: BusinessProfile) => {
    setIsGeneratingNiche(true);
    setActiveStep('paso2-nicho');
    try {
      const res = await fetch('/api/studio/generate-niche', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          businessProfile: overrideProfile || businessForm,
          userId: userId || 'default',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchWorkspace();
        showNotification(`Perfil de nicho "${data.nicheProfile.nicheName}" y 3 Buyer Personas generados con IA.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNiche(false);
    }
  };

  // Step 3: Search REAL Companies & Executives via Google Search Grounding
  const handleGenerateDemoProspects = async () => {
    setIsGeneratingDemoLeads(true);
    try {
      const activeNiche = workspace?.nicheProfiles?.[0];
      const res = await fetch('/api/studio/prospects', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          action: 'search_real_prospects',
          nicheName: activeNiche?.nicheName || businessForm.industry,
          location: businessForm.targetLocation,
          userId: userId || 'default',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace((prev) => (prev ? { ...prev, prospects: data.prospects } : prev));
        if (userId && Array.isArray(data.createdProspects)) {
          for (const cp of data.createdProspects) {
            await syncProspectToFirestore(userId, cp.id, {
              name: cp.name,
              company: cp.company,
              role: cp.role,
              email: cp.email,
              socialHandle: cp.socialHandle,
              channel: cp.channel,
              location: cp.location,
              niche: cp.niche,
              status: cp.status,
              temperature: cp.temperature,
              source: cp.source,
              sourceUrl: cp.sourceUrl,
              recommendedAction: cp.recommendedAction,
            }).catch(() => {});
          }
        }
        showNotification(
          `Se han encontrado y verificado ${data.addedCount} empresas y directivos reales mediante Google Search Grounding.`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDemoLeads(false);
    }
  };

  // Step 3: Add Manual Prospect
  const handleAddManualProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspect.name.trim()) return;
    try {
      const res = await fetch('/api/studio/prospects', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ action: 'create', prospect: newProspect, userId: userId || 'default' }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace((prev) => (prev ? { ...prev, prospects: data.prospects } : prev));
        if (userId && data.createdProspect) {
          await syncWorkspaceMetaToFirestore(
            userId,
            businessForm.businessName,
            businessForm.industry,
            businessForm.targetLocation
          ).catch(() => {});
          await syncProspectToFirestore(userId, data.createdProspect.id, {
            name: data.createdProspect.name,
            company: data.createdProspect.company,
            role: data.createdProspect.role,
            email: data.createdProspect.email,
            socialHandle: data.createdProspect.socialHandle,
            channel: data.createdProspect.channel,
            location: data.createdProspect.location,
            niche: data.createdProspect.niche,
            status: data.createdProspect.status,
            temperature: data.createdProspect.temperature,
            source: data.createdProspect.source,
            sourceUrl: data.createdProspect.sourceUrl,
            recommendedAction: data.createdProspect.recommendedAction,
          }).catch(() => {});
        }
        setShowNewProspectForm(false);
        setNewProspect({
          name: '',
          company: '',
          role: '',
          email: '',
          socialHandle: '',
          channel: 'LinkedIn',
          location: businessForm.targetLocation.split(',')[0] || 'Madrid',
          niche: workspace?.nicheProfiles?.[0]?.nicheName || 'Propietarios Premium',
          temperature: 'Caliente',
          status: 'Nuevo',
          recommendedAction: 'Enviar primer mensaje personalizado.',
        });
        showNotification('Prospecto registrado en el CRM de tu cuenta.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Step 3: Update Prospect Status or Temperature
  const handleUpdateProspect = async (id: string, status?: LeadStatus, temperature?: LeadTemperature) => {
    try {
      if (userId) {
        const existingLead = workspace?.prospects?.find((p) => p.id === id);
        if (existingLead) {
          await syncProspectToFirestore(userId, id, {
            name: existingLead.name,
            company: existingLead.company,
            email: existingLead.email,
            channel: existingLead.channel,
            status: status || existingLead.status,
            temperature: temperature || existingLead.temperature,
          }).catch(() => {});
        }
      }
      const res = await fetch('/api/studio/prospects', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ action: 'update_status', id, status, temperature, userId: userId || 'default' }),
      });
      if (res.ok && !userId) {
        const data = await res.json();
        setWorkspace((prev) => (prev ? { ...prev, prospects: data.prospects } : prev));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Step 4: Generate Campaign via AI
  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingCampaign(true);
    try {
      const res = await fetch('/api/studio/generate-campaign', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ ...campaignForm, userId: userId || 'default' }),
      });
      if (res.ok) {
        await fetchWorkspace();
        showNotification(`Borrador de campaña para ${campaignForm.channel} generado y persistido en tu cuenta.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // Open Real Gmail Send Confirmation Dialog for a Campaign Draft
  const handleOpenGmailSendModal = (camp: CampaignDraft, preselectProspect?: Prospect) => {
    const prospectsList = workspace?.prospects || [];
    const targetProspect = preselectProspect || prospectsList[0];
    const rName = targetProspect?.name || 'Cliente';
    const rCompany = targetProspect?.company || 'tu empresa';
    const rLoc = targetProspect?.location || businessForm.targetLocation || 'tu zona';

    const personalizedSubject = camp.subjectOrHook
      .replace(/\{\{Nombre\}\}/g, rName)
      .replace(/\{\{Empresa\}\}/g, rCompany)
      .replace(/\{\{Ubicación\}\}/g, rLoc)
      .replace(/\[Barrio\/Zona\]/g, rLoc);

    const personalizedBody = camp.mainBody
      .replace(/\{\{Nombre\}\}/g, rName)
      .replace(/\{\{Empresa\}\}/g, rCompany)
      .replace(/\{\{Ubicación\}\}/g, rLoc);

    setEmailModalState({
      isOpen: true,
      campaign: camp,
      selectedProspectId: targetProspect?.id || '',
      customRecipientEmail: targetProspect?.email || userEmail || '',
      customRecipientName: rName,
      customSubject: personalizedSubject,
      customBody: personalizedBody,
      isSending: false,
      errorMsg: null,
    });
  };

  const handleSelectProspectInEmailModal = (prospectId: string) => {
    const found = (workspace?.prospects || []).find((p) => p.id === prospectId);
    const camp = emailModalState.campaign;
    if (!found || !camp) {
      setEmailModalState((prev) => ({ ...prev, selectedProspectId: prospectId }));
      return;
    }

    const personalizedSubject = camp.subjectOrHook
      .replace(/\{\{Nombre\}\}/g, found.name)
      .replace(/\{\{Empresa\}\}/g, found.company)
      .replace(/\{\{Ubicación\}\}/g, found.location)
      .replace(/\[Barrio\/Zona\]/g, found.location);

    const personalizedBody = camp.mainBody
      .replace(/\{\{Nombre\}\}/g, found.name)
      .replace(/\{\{Empresa\}\}/g, found.company)
      .replace(/\{\{Ubicación\}\}/g, found.location);

    setEmailModalState((prev) => ({
      ...prev,
      selectedProspectId: prospectId,
      customRecipientEmail: found.email,
      customRecipientName: found.name,
      customSubject: personalizedSubject,
      customBody: personalizedBody,
    }));
  };

  // Confirm and Execute Real Gmail Send
  const handleConfirmSendGmail = async () => {
    if (!emailModalState.customRecipientEmail.trim() || !emailModalState.customSubject.trim()) {
      setEmailModalState((prev) => ({
        ...prev,
        errorMsg: 'Por favor indica un correo destinatario y un asunto válidos.',
      }));
      return;
    }

    setEmailModalState((prev) => ({ ...prev, isSending: true, errorMsg: null }));
    try {
      await sendGmailCampaignEmail({
        toEmail: emailModalState.customRecipientEmail.trim(),
        toName: emailModalState.customRecipientName.trim() || 'Prospecto',
        subject: emailModalState.customSubject.trim(),
        bodyText: emailModalState.customBody,
      });

      if (emailModalState.campaign) {
        const res = await fetch('/api/studio/campaign-sent', {
          method: 'POST',
          headers: buildAuthHeaders(),
          body: JSON.stringify({
            campaignId: emailModalState.campaign.id,
            prospectId: emailModalState.selectedProspectId || undefined,
            userId: userId || 'default',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setWorkspace((prev) =>
            prev ? { ...prev, campaigns: data.campaigns, prospects: data.prospects } : prev
          );
        }
      }

      const recipient = emailModalState.customRecipientEmail;
      setEmailModalState({
        isOpen: false,
        campaign: null,
        selectedProspectId: '',
        customRecipientEmail: '',
        customRecipientName: '',
        customSubject: '',
        customBody: '',
        isSending: false,
        errorMsg: null,
      });
      showNotification(`Campaña enviada realmente por correo vía Gmail a ${recipient}.`);
    } catch (err: any) {
      setEmailModalState((prev) => ({
        ...prev,
        isSending: false,
        errorMsg: err?.message || 'Error al enviar el correo con Gmail.',
      }));
    }
  };

  // Step 5: Adapt Landing Page Brief to Business Profile
  const handleAdaptLandingToBusiness = (tpl: LandingTemplate) => {
    setSelectedTemplate(tpl);
    const activeNiche = workspace?.nicheProfiles?.[0];
    setLandingBrief({
      businessName: businessForm.businessName,
      headline: activeNiche?.valueProposition || tpl.defaultHeadline,
      subheadline: `Sistema especializado en ${businessForm.productType} para ${businessForm.targetAudience} en ${businessForm.targetLocation}.`,
      ctaText: tpl.defaultCta,
      leadMagnetTitle: `Dossier Estratégico: ${businessForm.goal90Days}`,
      formFields: ['Nombre y Apellidos', 'Email corporativo o personal', 'Ubicación / Activo en ' + businessForm.targetLocation, 'Teléfono / WhatsApp directo'],
    });
    showNotification(`Textos de la plantilla "${tpl.name}" adaptados al contexto de ${businessForm.businessName}.`);
  };

  const handleSaveLandingDraft = async () => {
    if (!selectedTemplate) return;
    try {
      const payload: Partial<LandingDraft> = {
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        businessName: landingBrief.businessName,
        headline: landingBrief.headline,
        subheadline: landingBrief.subheadline,
        valuePoints: workspace?.nicheProfiles?.[0]?.communicationAngles || [
          'Diagnóstico personalizado basado en datos reales de mercado',
          'Cualificación previa y atención prioritaria',
          'Acompañamiento integral de principio a fin',
        ],
        ctaText: landingBrief.ctaText,
        formFields: landingBrief.formFields,
        leadMagnetTitle: landingBrief.leadMagnetTitle,
      };
      const res = await fetch('/api/studio/landing-drafts', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ ...payload, userId: userId || 'default' }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspace((prev) => (prev ? { ...prev, landingDrafts: data.landingDrafts } : prev));
        showNotification('Borrador de Landing Page guardado en tu workspace.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Step 7: Update AI Agent Budget / Status
  const handleUpdateAgent = async (agentId: string, changes: Partial<StudioAgentConfig>) => {
    if (!workspace) return;
    const updatedAgents = workspace.agents.map((ag) => (ag.id === agentId ? { ...ag, ...changes } : ag));
    setWorkspace({ ...workspace, agents: updatedAgents });
    try {
      await fetch('/api/studio/agents', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ agents: updatedAgents, userId: userId || 'default' }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Prospects
  const filteredProspects = useMemo(() => {
    const list = workspace?.prospects || [];
    return list.filter((p) => {
      if (filterChannel !== 'Todos' && p.channel !== filterChannel) return false;
      if (filterTemp !== 'Todas' && p.temperature !== filterTemp) return false;
      if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;
      if (filterNiche !== 'Todos' && p.niche !== filterNiche) return false;
      if (filterLocation.trim() && !p.location.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterCompany.trim() && !p.company.toLowerCase().includes(filterCompany.toLowerCase()) && !p.name.toLowerCase().includes(filterCompany.toLowerCase())) return false;
      return true;
    });
  }, [workspace?.prospects, filterChannel, filterTemp, filterStatus, filterNiche, filterLocation, filterCompany]);

  const uniqueNichesInCrm = useMemo(() => {
    const set = new Set<string>();
    (workspace?.prospects || []).forEach((p) => set.add(p.niche));
    return Array.from(set);
  }, [workspace?.prospects]);

  const totalAgentBudget = useMemo(() => {
    return (workspace?.agents || []).reduce((acc, a) => acc + (a.status !== 'En Pausa' ? a.monthlyBudgetUsd : 0), 0);
  }, [workspace?.agents]);

  const totalAgentLimit = useMemo(() => {
    return (workspace?.agents || []).reduce((acc, a) => acc + a.monthlyLimitUsd, 0);
  }, [workspace?.agents]);

  const activeNiche: NicheProfile | undefined = workspace?.nicheProfiles?.[0];

  const stepsNav: { id: GrowthStepId; stepNum: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', stepNum: 'OS', label: 'Dashboard & Estado', icon: Activity },
    { id: 'paso1-negocio', stepNum: '01', label: 'Perfil del Negocio', icon: Building2 },
    { id: 'paso2-nicho', stepNum: '02', label: 'Perfil de Nicho & ICP', icon: Target },
    { id: 'paso3-prospectos', stepNum: '03', label: 'CRM Prospectos', icon: Users },
    { id: 'paso4-campana', stepNum: '04', label: 'Generador Campañas', icon: Send },
    { id: 'paso5-landing', stepNum: '05', label: 'Landing Pages', icon: LayoutTemplate },
    { id: 'paso6-recursos', stepNum: '06', label: 'Biblioteca & Guías', icon: BookOpen },
    { id: 'paso7-agentes', stepNum: '07', label: 'Equipo Agentes IA', icon: Bot },
    { id: 'conexiones', stepNum: 'API', label: 'Conexiones Externas', icon: Link2 },
  ];

  if (isLoading && !workspace) {
    return (
      <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 text-zinc-300 flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
        <span className="text-xs font-mono">Sincronizando sistema operativo 4haus Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Top Identity Header of 4haus Studio Growth & LeadNicho Engine */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 border-zinc-800 text-white'
            : 'bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-950 border-zinc-800 text-white shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span>4HAUS STUDIO OS</span>
              <span>·</span>
              <span>MÓDULO DE CRECIMIENTO & CAPTACIÓN POR NICHO (LEADNICHO)</span>
              <span>·</span>
              <span className="text-zinc-400">PERSISTENCIA REAL EN BACKEND</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              “Convierte contexto en clientes, sistemas y crecimiento.”
            </h1>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Sistema operativo integral para inmobiliarias, empresas y emprendedores: define tu negocio, descubre tu nicho con IA, gestiona prospectos, crea campañas multicanal, adapta landing pages y configura tu equipo de agentes desde un único workspace.
            </p>
          </div>

          {/* Quick Transparency & Status Summary */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-700/40 text-left">
              <div className="text-[10px] font-mono text-emerald-400 uppercase">Motor IA & Backend</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Conectado (Real)</span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-amber-950/50 border border-amber-700/40 text-left">
              <div className="text-[10px] font-mono text-amber-300 uppercase">Prospección & Envíos</div>
              <div className="text-xs font-bold text-amber-200">Datos de ejemplo / OAuth pendiente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {statusBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button onClick={() => setStatusBanner(null)} className="text-[11px] underline ml-4 cursor-pointer">
            Cerrar
          </button>
        </div>
      )}

      {/* Progressive 7-Step Navigation Bar */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center gap-1 overflow-x-auto scrollbar-none ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        {stepsNav.map((st) => {
          const Icon = st.icon;
          const isActive = activeStep === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStep(st.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
              }`}
            >
              <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-200' : 'text-zinc-500'}`}>
                {st.stepNum}.
              </span>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          VIEW 0: DASHBOARD & MÉTRICAS DEL WORKSPACE
         ===================================================================== */}
      {activeStep === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveStep('paso2-nicho')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isDark ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-700/60' : 'bg-white border-zinc-200 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Perfiles de Nicho & ICP</span>
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {workspace?.nicheProfiles?.length || 1} Nicho · {(workspace?.nicheProfiles?.[0]?.buyerPersonas?.length || 3)} ICPs
              </div>
              <div className="text-[11px] text-emerald-500 font-mono mt-1">
                REAL · Persistido en Backend
              </div>
            </div>

            <div
              onClick={() => setActiveStep('paso3-prospectos')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isDark ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-700/60' : 'bg-white border-zinc-200 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>CRM de Prospectos</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {workspace?.prospects?.length || 0} Contactos
              </div>
              <div className="text-[11px] text-amber-500 font-mono mt-1">
                DEMO · Datos de ejemplo sin scraping
              </div>
            </div>

            <div
              onClick={() => setActiveStep('paso4-campana')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isDark ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-700/60' : 'bg-white border-zinc-200 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Campañas & Secuencias</span>
                <Send className="w-4 h-4 text-sky-400" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {workspace?.campaigns?.length || 0} Borradores
              </div>
              <div className="text-[11px] text-emerald-500 font-mono mt-1">
                REAL IA · Envío externo pendiente
              </div>
            </div>

            <div
              onClick={() => setActiveStep('paso7-agentes')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isDark ? 'bg-zinc-900/90 border-zinc-800 hover:border-emerald-700/60' : 'bg-white border-zinc-200 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Presupuesto Equipo IA</span>
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                ${totalAgentBudget} / ${totalAgentLimit} <span className="text-xs font-normal text-zinc-400">USD/mes</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-1">
                Configuración visual persistente
              </div>
            </div>
          </div>

          {/* Progressive 7-Step Flow Roadmap */}
          <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Flujo Progresivo de Crecimiento en 4haus Studio (7 Pasos)
                </h2>
                <p className="text-xs text-zinc-400">
                  Avanza paso a paso desde la definición de tu negocio hasta la activación de campañas, landing pages y agentes.
                </p>
              </div>
              <button
                onClick={() => setActiveStep('paso1-negocio')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>Ir al Paso 1: Perfil del Negocio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {[
                {
                  step: '01. Perfil del Negocio',
                  title: businessForm.businessName,
                  desc: `${businessForm.industry} · Ticket: ${businessForm.averageTicket}`,
                  tag: 'REAL · Guardado',
                  target: 'paso1-negocio' as GrowthStepId,
                },
                {
                  step: '02. Perfil de Nicho & ICP',
                  title: activeNiche?.nicheName || 'Pendiente de generar',
                  desc: '3 Buyer Personas, señales de mercado y ángulos de venta con IA.',
                  tag: 'REAL · Generado con IA',
                  target: 'paso2-nicho' as GrowthStepId,
                },
                {
                  step: '03. CRM de Prospectos',
                  title: `${workspace?.prospects?.length || 0} Prospectos Clasificados`,
                  desc: 'Filtros por canal, temperatura, estado, nicho y ubicación.',
                  tag: 'DEMO · Datos de ejemplo',
                  target: 'paso3-prospectos' as GrowthStepId,
                },
                {
                  step: '04. Campañas Multicanal',
                  title: 'Email, Instagram & LinkedIn',
                  desc: 'Asunto, cuerpo, seguimiento y variante A/B listos para copiar.',
                  tag: 'REAL IA · Envío pendiente',
                  target: 'paso4-campana' as GrowthStepId,
                },
                {
                  step: '05. Landing Pages',
                  title: `${workspace?.landingTemplates?.length || 4} Plantillas + Brief`,
                  desc: 'Adapta titulares al negocio y configura formulario de captación.',
                  tag: 'REAL Brief · Hosting pendiente',
                  target: 'paso5-landing' as GrowthStepId,
                },
                {
                  step: '06. Recursos & Playbooks',
                  title: 'Cursos, Guías y Casos',
                  desc: 'Contenido recomendado según el perfil inmobiliario o B2B.',
                  tag: 'REAL · Biblioteca',
                  target: 'paso6-recursos' as GrowthStepId,
                },
                {
                  step: '07. Equipo de Agentes IA',
                  title: `${workspace?.agents?.length || 6} Roles Configurados`,
                  desc: 'Presupuesto mensual, nivel de autonomía y aprobación humana.',
                  tag: 'Configuración Visual',
                  target: 'paso7-agentes' as GrowthStepId,
                },
                {
                  step: 'Estado de Conexiones',
                  title: 'Auditoría Real vs Mocked',
                  desc: 'Estado transparente de SMTP, Meta OAuth, LinkedIn y fuentes CRM.',
                  tag: 'Transparencia Total',
                  target: 'conexiones' as GrowthStepId,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStep(card.target)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isDark
                      ? 'bg-zinc-950/70 border-zinc-800 hover:border-emerald-600/60'
                      : 'bg-zinc-50/70 border-zinc-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-500">
                      <span>{card.step}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {card.title}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{card.desc}</p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-zinc-800/40 text-[10px] font-mono text-zinc-400">
                    Estado: {card.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PASO 1: CUESTIONARIO DEL PERFIL DEL NEGOCIO (12 CAMPOS)
         ===================================================================== */}
      {activeStep === 'paso1-negocio' && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 animate-in fade-in duration-200 ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
            <div>
              <div className="text-xs font-mono text-emerald-500 uppercase">Paso 1 de 7 · Funcionalidad Real y Persistente</div>
              <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Cuestionario de Perfil del Negocio
              </h2>
              <p className="text-xs text-zinc-400">
                Define el contexto exacto de tu empresa o inmobiliaria. La IA utilizará estos 12 parámetros para construir tu perfil de nicho, tus 3 ICPs y tus campañas.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSaveBusinessProfile(false)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white' : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Perfil</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveBusinessProfile(true)}
                disabled={isGeneratingNiche}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingNiche ? 'Generando Nicho con IA...' : 'Guardar y Generar Nicho con IA →'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">1. Nombre del negocio</label>
              <input
                type="text"
                value={businessForm.businessName}
                onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">2. Sector o industria</label>
              <input
                type="text"
                value={businessForm.industry}
                onChange={(e) => setBusinessForm({ ...businessForm, industry: e.target.value })}
                placeholder="Ej. Inmobiliaria Residencial, Promotora, Agencia B2B, Consultoría..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">3. Tipo de producto o servicio</label>
              <input
                type="text"
                value={businessForm.productType}
                onChange={(e) => setBusinessForm({ ...businessForm, productType: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">4. Tipo de propiedad (si es inmobiliario / activo)</label>
              <input
                type="text"
                value={businessForm.propertyType || ''}
                onChange={(e) => setBusinessForm({ ...businessForm, propertyType: e.target.value })}
                placeholder="Ej. Áticos prime, Villas de lujo, Obra nueva, Locales en rentabilidad..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">5. Ubicación objetivo</label>
              <input
                type="text"
                value={businessForm.targetLocation}
                onChange={(e) => setBusinessForm({ ...businessForm, targetLocation: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">6. Ticket medio</label>
              <input
                type="text"
                value={businessForm.averageTicket}
                onChange={(e) => setBusinessForm({ ...businessForm, averageTicket: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">7. Público objetivo</label>
              <input
                type="text"
                value={businessForm.targetAudience}
                onChange={(e) => setBusinessForm({ ...businessForm, targetAudience: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">8. Objetivo para los próximos 90 días</label>
              <input
                type="text"
                value={businessForm.goal90Days}
                onChange={(e) => setBusinessForm({ ...businessForm, goal90Days: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">9. Presupuesto aproximado</label>
              <input
                type="text"
                value={businessForm.approxBudget}
                onChange={(e) => setBusinessForm({ ...businessForm, approxBudget: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">10. Canales que desea utilizar</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Email', 'LinkedIn', 'Instagram', 'WhatsApp', 'Landing Pages'].map((ch) => {
                  const selected = businessForm.preferredChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? businessForm.preferredChannels.filter((c) => c !== ch)
                          : [...businessForm.preferredChannels, ch];
                        setBusinessForm({ ...businessForm, preferredChannels: next });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : isDark
                          ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">11. Tono de comunicación</label>
              <input
                type="text"
                value={businessForm.communicationTone}
                onChange={(e) => setBusinessForm({ ...businessForm, communicationTone: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">12. Capacidad comercial actual</label>
              <input
                type="text"
                value={businessForm.commercialCapacity}
                onChange={(e) => setBusinessForm({ ...businessForm, commercialCapacity: e.target.value })}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PASO 2: PERFIL DE NICHO, 3 BUYER PERSONAS (ICP) Y SEÑALES DE MERCADO
         ===================================================================== */}
      {activeStep === 'paso2-nicho' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
              <div>
                <div className="text-xs font-mono text-emerald-500 uppercase">
                  Paso 2 de 7 · Generación Real mediante IA en Backend
                </div>
                <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {activeNiche?.nicheName || 'Perfil de Nicho e Inteligencia de Mercado'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Motor activo: {activeNiche?.aiEngine || 'Motor Contextual 4haus Studio'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleGenerateNicheProfile()}
                  disabled={isGeneratingNiche}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingNiche ? 'Analizando mercado con IA...' : 'Regenerar Perfil de Nicho con IA'}</span>
                </button>
                <button
                  onClick={() => setActiveStep('paso3-prospectos')}
                  className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Paso 3: Prospectos →
                </button>
              </div>
            </div>

            {activeNiche && (
              <div className="space-y-6 pt-5">
                {/* Summary & Value Proposition */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="text-[11px] font-mono text-emerald-500 uppercase mb-1">Resumen del Nicho</div>
                    <p className="text-xs leading-relaxed text-zinc-300">{activeNiche.summary}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="text-[11px] font-mono text-indigo-400 uppercase mb-1">Audiencia Prioritaria</div>
                    <p className="text-xs leading-relaxed text-zinc-300">{activeNiche.priorityAudience}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="text-[11px] font-mono text-amber-400 uppercase mb-1">Propuesta de Valor Central</div>
                    <p className="text-xs leading-relaxed text-zinc-300 font-medium">{activeNiche.valueProposition}</p>
                  </div>
                </div>

                {/* 3 Buyer Personas (ICP) */}
                <div className="space-y-3">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Los 3 Buyer Personas / Ideal Customer Profiles (ICP)
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {(activeNiche.buyerPersonas || []).map((bp, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border space-y-3 ${
                          isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] font-mono text-emerald-400 uppercase">ICP 0{idx + 1} · {bp.segment}</div>
                          <div className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{bp.name}</div>
                          <div className="text-xs text-zinc-400">{bp.role}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-rose-400">Dolores principales:</div>
                          <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                            {bp.painPoints.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-emerald-400">Motivaciones de compra:</div>
                          <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                            {bp.motivations.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-amber-400">Objeciones frecuentes:</div>
                          <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                            {bp.objections.map((o, i) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                          <span>Canales: {bp.preferredChannels.join(' · ')}</span>
                          <button
                            onClick={() => {
                              setCampaignForm((prev) => ({ ...prev, segment: bp.name }));
                              setActiveStep('paso4-campana');
                            }}
                            className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                          >
                            Crear campaña →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Señales de Mercado & Oportunidades */}
                <div className="space-y-3">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Señales y Oportunidades del Mercado Detectadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(activeNiche.marketSignals || []).map((sig, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-2 ${
                          isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-400">SEÑAL 0{idx + 1}</span>
                          <span className={sig.urgency === 'Alta' ? 'text-amber-400' : 'text-zinc-400'}>
                            Urgencia {sig.urgency}
                          </span>
                        </div>
                        <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{sig.signal}</div>
                        <p className="text-xs text-zinc-400">{sig.opportunity}</p>
                        <div className="pt-1 text-[11px] text-emerald-400 font-medium">
                          Acción: {sig.recommendedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problemas, Objeciones, Ángulos y Próximo Paso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="text-xs font-bold text-white">Ángulos de Comunicación Recomendados</div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 list-disc pl-4">
                      {(activeNiche.communicationAngles || []).map((ang, i) => (
                        <li key={i}>{ang}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="text-xs font-bold text-emerald-400">Próximo Paso Sugerido por 4haus Studio</div>
                    <p className="text-xs text-zinc-200 leading-relaxed">{activeNiche.suggestedNextStep}</p>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => setActiveStep('paso3-prospectos')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Ir al CRM de Prospectos
                      </button>
                      <button
                        onClick={() => setActiveStep('paso4-campana')}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Diseñar Campaña
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PASO 3: CRM DE PROSPECTOS REALES (GOOGLE SEARCH GROUNDING & FIRESTORE)
         ===================================================================== */}
      {activeStep === 'paso3-prospectos' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Real Google Search Grounding Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-200">
                  PROSPECCIÓN REAL CON GOOGLE SEARCH GROUNDING · EMPRESAS Y DIRECTIVOS VERIFICADOS
                </div>
                <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                  El CRM busca y registra empresas reales, directivos públicos y correos corporativos oficiales verificables en la web según el nicho y ubicación de tu negocio, sincronizándolos en tiempo real con tu cuenta en Firebase Firestore.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerateDemoProspects}
                disabled={isGeneratingDemoLeads}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer shrink-0"
              >
                {isGeneratingDemoLeads
                  ? 'Buscando empresas reales en Google...'
                  : '+ Buscar Prospectos Reales (Google Search)'}
              </button>
              <button
                onClick={() => setShowNewProspectForm(!showNewProspectForm)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs cursor-pointer shrink-0"
              >
                + Añadir Prospecto Manual
              </button>
            </div>
          </div>

          {/* Optional Manual Prospect Creation Form */}
          {showNewProspectForm && (
            <form
              onSubmit={handleAddManualProspect}
              className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
            >
              <div className="text-xs font-bold text-emerald-400">Registrar Nuevo Prospecto en el Workspace</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nombre completo *"
                  value={newProspect.name}
                  onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Empresa / Propiedad"
                  value={newProspect.company}
                  onChange={(e) => setNewProspect({ ...newProspect, company: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                />
                <input
                  type="email"
                  placeholder="Email de contacto"
                  value={newProspect.email}
                  onChange={(e) => setNewProspect({ ...newProspect, email: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Usuario Social (@instagram o linkedin)"
                  value={newProspect.socialHandle}
                  onChange={(e) => setNewProspect({ ...newProspect, socialHandle: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Ubicación (Ej. Madrid · Salamanca)"
                  value={newProspect.location}
                  onChange={(e) => setNewProspect({ ...newProspect, location: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                />
                <select
                  value={newProspect.channel}
                  onChange={(e) => setNewProspect({ ...newProspect, channel: e.target.value as LeadChannel })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                >
                  <option value="LinkedIn">Canal: LinkedIn</option>
                  <option value="Email">Canal: Email</option>
                  <option value="Instagram">Canal: Instagram</option>
                  <option value="WhatsApp">Canal: WhatsApp</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProspectForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Prospecto en CRM
                </button>
              </div>
            </form>
          )}

          {/* 6-Dimension Filter Bar (Canal, Temperatura, Empresa, Estado, Nicho, Ubicación) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clasificación y Filtros del CRM (6 Dimensiones):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
              >
                <option value="Todos">Canal: Todos</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Email">Email</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>

              <select
                value={filterTemp}
                onChange={(e) => setFilterTemp(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
              >
                <option value="Todas">Temperatura: Todas</option>
                <option value="Caliente">Caliente</option>
                <option value="Templado">Templado</option>
                <option value="Frío">Frío</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
              >
                <option value="Todos">Estado: Todos</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Contactado">Contactado</option>
                <option value="Respondió">Respondió</option>
                <option value="Cualificado">Cualificado</option>
                <option value="Reunión Agendada">Reunión Agendada</option>
              </select>

              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
              >
                <option value="Todos">Nicho: Todos</option>
                {uniqueNichesInCrm.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filtrar Empresa o Nombre..."
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
              />

              <input
                type="text"
                placeholder="Filtrar Ubicación..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* CRM Table / Cards */}
          <div className="space-y-3">
            {filteredProspects.map((lead) => (
              <div
                key={lead.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isDark ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold">[PROSPECTO REAL VERIFICADO]</span>
                    <span>·</span>
                    <span className="text-emerald-400">{lead.channel}</span>
                    <span>·</span>
                    <span className="text-zinc-400">{lead.niche}</span>
                    <span>·</span>
                    <span className="text-zinc-400">{lead.location}</span>
                    <span>·</span>
                    <span className="text-zinc-500">Creado: {lead.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{lead.name}</span>
                    <span className="text-xs text-zinc-400">
                      {lead.role} en <strong className="text-zinc-200">{lead.company}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span>Email: {lead.email}</span>
                    {lead.socialHandle && (
                      <>
                        <span>·</span>
                        <span>Web/Social: {lead.socialHandle}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Fuente: {lead.source}</span>
                    {lead.sourceUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={lead.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          Ver Web Oficial ↗
                        </a>
                      </>
                    )}
                  </div>

                  <div className="pt-1 text-xs text-emerald-400">
                    <strong>Acción recomendada:</strong> {lead.recommendedAction}
                  </div>
                </div>

                {/* Controls for Temperature, Status & Campaign Action */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <select
                    value={lead.temperature}
                    onChange={(e) => handleUpdateProspect(lead.id, undefined, e.target.value as LeadTemperature)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      lead.temperature === 'Caliente'
                        ? 'bg-rose-950/60 border-rose-700/50 text-rose-300'
                        : lead.temperature === 'Templado'
                        ? 'bg-amber-950/60 border-amber-700/50 text-amber-300'
                        : 'bg-sky-950/60 border-sky-700/50 text-sky-300'
                    }`}
                  >
                    <option value="Caliente">Temp: Caliente</option>
                    <option value="Templado">Temp: Templado</option>
                    <option value="Frío">Temp: Frío</option>
                  </select>

                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateProspect(lead.id, e.target.value as LeadStatus, undefined)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white cursor-pointer"
                  >
                    <option value="Nuevo">Estado: Nuevo</option>
                    <option value="Contactado">Estado: Contactado</option>
                    <option value="Respondió">Estado: Respondió</option>
                    <option value="Cualificado">Estado: Cualificado</option>
                    <option value="Reunión Agendada">Estado: Reunión Agendada</option>
                    <option value="Descartado">Estado: Descartado</option>
                  </select>

                  <button
                    onClick={() => {
                      setCampaignForm((prev) => ({
                        ...prev,
                        segment: `${lead.niche} (${lead.location})`,
                        channel: (lead.channel === 'WhatsApp' || lead.channel === 'Web Form' ? 'Email' : lead.channel) as any,
                      }));
                      setActiveStep('paso4-campana');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Redactar Mensaje →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          PASO 4: GENERADOR DE CAMPAÑAS MULTICANAL (EMAIL, INSTAGRAM, LINKEDIN)
         ===================================================================== */}
      {activeStep === 'paso4-campana' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Form (5 cols) */}
          <form
            onSubmit={handleGenerateCampaign}
            className={`lg:col-span-5 p-6 rounded-3xl border space-y-4 self-start ${
              isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
            }`}
          >
            <div>
              <div className="text-xs font-mono text-emerald-500 uppercase">Paso 4 de 7 · Generador con IA Real</div>
              <h2 className={`text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Diseñador de Campañas por Canal
              </h2>
              <p className="text-xs text-zinc-400">
                Genera asunto, cuerpo principal, mensaje de seguimiento, variante A/B y recomendación de personalización.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-300">Canal de Prospección</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Email', 'Instagram', 'LinkedIn'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setCampaignForm({ ...campaignForm, channel: ch })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      campaignForm.channel === ch
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-300">Segmento o Buyer Persona</label>
              <input
                type="text"
                value={campaignForm.segment}
                onChange={(e) => setCampaignForm({ ...campaignForm, segment: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-300">Objetivo de la campaña</label>
              <input
                type="text"
                value={campaignForm.objective}
                onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-300">Oferta o Gancho de Valor (Lead Magnet / Auditoría)</label>
              <textarea
                rows={2}
                value={campaignForm.offer}
                onChange={(e) => setCampaignForm({ ...campaignForm, offer: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-300">Tono de comunicación</label>
              <input
                type="text"
                value={campaignForm.tone}
                onChange={(e) => setCampaignForm({ ...campaignForm, tone: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-300">Llamada a la Acción (CTA)</label>
              <input
                type="text"
                value={campaignForm.cta}
                onChange={(e) => setCampaignForm({ ...campaignForm, cta: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isGeneratingCampaign}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isGeneratingCampaign
                  ? 'Redactando secuencia con IA...'
                  : `Generar y Guardar Campaña de ${campaignForm.channel}`}
              </span>
            </button>
          </form>

          {/* Right Generated Campaigns List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {(workspace?.campaigns || []).map((camp) => (
              <div
                key={camp.id}
                className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                  <div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      CANAL: {camp.channel.toUpperCase()} · SEGMENTO: {camp.segment} · ESTADO: {camp.status.toUpperCase()}
                    </div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{camp.campaignName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenGmailSendModal(camp)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Enviar por Correo (Gmail)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          camp.id,
                          `Asunto/Apertura: ${camp.subjectOrHook}\n\n${camp.mainBody}\n\nSeguimiento:\n${camp.followUpMessage}`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === camp.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === camp.id ? 'Copiado' : 'Copiar Secuencia'}</span>
                    </button>
                  </div>
                </div>

                {/* Subject / Opening Hook */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase">
                    {camp.channel === 'Email' ? 'Asunto Sugerido' : 'Frase de Apertura (Hook)'}
                  </div>
                  <div className="text-xs font-semibold text-white">{camp.subjectOrHook}</div>
                </div>

                {/* Main Body */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase">Mensaje Principal</div>
                  <pre className="text-xs text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">{camp.mainBody}</pre>
                </div>

                {/* Follow-up & Alternative Variant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                    <div className="text-[10px] font-mono text-amber-400 uppercase">Seguimiento Sugerido (Día 3-4)</div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{camp.followUpMessage}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                    <div className="text-[10px] font-mono text-sky-400 uppercase">Variante Alternativa (Test A/B)</div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{camp.alternativeVariant}</p>
                  </div>
                </div>

                {/* Personalization & Pending Provider Notice */}
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-700/40 space-y-1 text-xs">
                  <div className="text-emerald-300">
                    <strong>Recomendación de personalización:</strong> {camp.personalizationTip}
                  </div>
                  <div className="text-amber-300/90 text-[11px] font-mono pt-1">
                    Estado de envío: Proveedor de envío no configurado / OAuth pendiente ({camp.dataWarning})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          PASO 5: GALERÍA DE PLANTILLAS DE LANDING PAGES + BRIEF & FORMULARIO
         ===================================================================== */}
      {activeStep === 'paso5-landing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Category Filter Header */}
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div>
              <div className="text-xs font-mono text-emerald-500 uppercase">
                Paso 5 de 7 · Arquitectura de Conversión y Captación
              </div>
              <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Galería de Plantillas de Landing Pages & Configurador de Brief
              </h2>
              <p className="text-xs text-zinc-400">
                Elige una plantilla, previsualiza su estructura, adapta los textos al perfil de tu negocio y guarda el borrador.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Todas', 'Inmobiliaria', 'Inversión', 'Agencia / B2B'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLandingCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    landingCategoryFilter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(workspace?.landingTemplates || [])
              .filter((t) => landingCategoryFilter === 'Todas' || t.category === landingCategoryFilter)
              .map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-zinc-900 ring-1 ring-emerald-500/50'
                        : isDark
                        ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="h-36 w-full overflow-hidden relative bg-zinc-950">
                        <img src={tpl.previewImage} alt={tpl.name} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-3 text-[10px] font-mono text-emerald-300 uppercase">
                          {tpl.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{tpl.name}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>
                        <div className="text-[11px] text-emerald-400 font-mono">Foco: {tpl.conversionFocus}</div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(tpl)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Previsualizar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdaptLandingToBusiness(tpl)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Elegir y Adaptar
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Interactive Landing Brief & Form Configurator + Live Simulated Preview */}
          {selectedTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Editor (6 cols) */}
              <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-4 ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 uppercase">Configurador de Brief & Captación</div>
                    <h3 className="text-base font-bold text-white">Plantilla activa: {selectedTemplate.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdaptLandingToBusiness(selectedTemplate)}
                    className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Auto-adaptar al Negocio con IA
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-300">Titular Principal (Headline H1)</label>
                  <input
                    type="text"
                    value={landingBrief.headline}
                    onChange={(e) => setLandingBrief({ ...landingBrief, headline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-300">Subtítulo y Propuesta de Valor</label>
                  <textarea
                    rows={2}
                    value={landingBrief.subheadline}
                    onChange={(e) => setLandingBrief({ ...landingBrief, subheadline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-zinc-300">Lead Magnet / Recurso Entregable</label>
                    <input
                      type="text"
                      value={landingBrief.leadMagnetTitle}
                      onChange={(e) => setLandingBrief({ ...landingBrief, leadMagnetTitle: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-zinc-300">Texto del Botón (CTA)</label>
                    <input
                      type="text"
                      value={landingBrief.ctaText}
                      onChange={(e) => setLandingBrief({ ...landingBrief, ctaText: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-300">
                    Campos del Formulario de Captación (Separados por coma)
                  </label>
                  <input
                    type="text"
                    value={landingBrief.formFields.join(', ')}
                    onChange={(e) =>
                      setLandingBrief({
                        ...landingBrief,
                        formFields: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-amber-400">
                    Nota: Se guarda como borrador real. Publicación en hosting propio pendiente.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveLandingDraft}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Borrador de Landing</span>
                  </button>
                </div>
              </div>

              {/* Right Live Draft Preview (6 cols) */}
              <div className="lg:col-span-6 p-6 rounded-3xl border border-zinc-800 bg-zinc-950 text-white space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs font-mono text-zinc-400">
                    <span>VISTA PREVIA EN VIVO · {landingBrief.businessName}</span>
                    <span className="text-amber-400">[MODO BORRADOR / PREVIEW]</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono text-emerald-400 uppercase">{landingBrief.leadMagnetTitle}</div>
                    <h4 className="text-xl font-bold leading-snug text-white">{landingBrief.headline}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{landingBrief.subheadline}</p>
                  </div>

                  {/* Simulated Capture Form */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="text-xs font-bold text-white">Formulario de Cualificación Activo:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {landingBrief.formFields.map((field, idx) => (
                        <input
                          key={idx}
                          type="text"
                          disabled
                          placeholder={field}
                          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveLandingDraft}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                    >
                      {landingBrief.ctaText}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between pt-3 border-t border-zinc-900">
                  <span>Borradores guardados en workspace: {workspace?.landingDrafts?.length || 1}</span>
                  <span>Secciones: {selectedTemplate.sections.join(' · ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Template Structure Preview */}
          {previewTemplate && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-2xl w-full rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <div className="text-xs font-mono text-emerald-400">{previewTemplate.category}</div>
                    <h3 className="text-lg font-bold text-white">{previewTemplate.name}</h3>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="px-3 py-1 rounded-lg bg-zinc-800 text-xs text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
                <img src={previewTemplate.previewImage} alt={previewTemplate.name} className="w-full h-52 object-cover rounded-2xl" />
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white">Titular por defecto:</div>
                  <p className="text-sm text-emerald-300 font-semibold">{previewTemplate.defaultHeadline}</p>
                  <p className="text-xs text-zinc-400">{previewTemplate.defaultSubheadline}</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-white mb-1.5">Bloques arquitectónicos incluidos:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {previewTemplate.sections.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                        0{idx + 1}. {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleAdaptLandingToBusiness(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Usar esta plantilla en mi Brief
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          PASO 6: BIBLIOTECA DE RECURSOS, CURSOS, GUÍAS Y PLAYBOOKS
         ===================================================================== */}
      {activeStep === 'paso6-recursos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div>
              <div className="text-xs font-mono text-emerald-500 uppercase">
                Paso 6 de 7 · Formación, Playbooks y Activos del Studio
              </div>
              <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Biblioteca de Cursos, Guías, Casos Prácticos y Plantillas
              </h2>
              <p className="text-xs text-zinc-400">
                Contenido recomendado según tu perfil ({businessForm.industry}) y conectado con los tutoriales y libros de 4haus Studio.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onOpenTutorialsModal && (
                <button
                  onClick={onOpenTutorialsModal}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Ver Masterclasses en Vídeo
                </button>
              )}
              {onOpenBooksModal && (
                <button
                  onClick={onOpenBooksModal}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Abrir Biblioteca de Libros
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['Todas', 'Marketing Inmobiliario', 'Ventas', 'Arquitectura IA', 'Automatización'].map((cat) => (
              <button
                key={cat}
                onClick={() => setResourceCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  resourceCategoryFilter === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(workspace?.resources || [])
              .filter((r) => resourceCategoryFilter === 'Todas' || r.category === resourceCategoryFilter)
              .map((resItem) => (
                <div
                  key={resItem.id}
                  className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
                    isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                      <span>{resItem.type.toUpperCase()} · {resItem.category}</span>
                      <span className="text-zinc-400">{resItem.durationOrFormat}</span>
                    </div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{resItem.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{resItem.description}</p>

                    <div className="pt-2 space-y-1">
                      <div className="text-[11px] font-semibold text-zinc-300">Puntos clave aplicables hoy:</div>
                      <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4">
                        {resItem.keyTakeaways.map((kt, idx) => (
                          <li key={idx}>{kt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Recomendado para: {resItem.recommendedForNiches.join(' · ')}</span>
                    <span className="text-emerald-400">Recurso Real Activo</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          PASO 7: SUPER AGENT DANIEL 1.0 · ARQUITECTURA DE 12 DEPARTAMENTOS STARTUP
         ===================================================================== */}
      {activeStep === 'paso7-agentes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Budget Summary */}
          <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="space-y-1.5 max-w-3xl">
              <div className="text-xs font-mono text-emerald-400 uppercase flex items-center gap-2">
                <span>Paso 7 de 7 · Daniel 1.0 Super Agent (Director Ejecutivo + 12 Departamentos)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  Código Moral 40/40 Activo
                </span>
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Super Agent Startup Squad: Director Central, 12 Departamentos & Memoria Compartida
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                En lugar de un chatbot aislado, Daniel 1.0 actúa como tu Director Ejecutivo combinando la orquestación de{' '}
                <strong className="text-zinc-200">Google ADK</strong>, el equipo de producto de{' '}
                <strong className="text-zinc-200">MetaGPT</strong>, los flujos especialistas de{' '}
                <strong className="text-zinc-200">CrewAI</strong>, la ingeniería de código de{' '}
                <strong className="text-zinc-200">OpenHands</strong> y el control de estado con aprobación humana de{' '}
                <strong className="text-zinc-200">LangGraph</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-left">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Presupuesto Mensual (12 Depts)</div>
                <div className="text-lg font-bold text-emerald-400">
                  ${totalAgentBudget} USD <span className="text-xs text-zinc-500">/ límite ${totalAgentLimit}</span>
                </div>
              </div>
              {onOpenDanielModal && (
                <button
                  onClick={onOpenDanielModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Consola de Voz Daniel 1.0
                </button>
              )}
            </div>
          </div>

          {/* 1. Open Source Repositories & Architecture Matrix */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono text-indigo-400 uppercase">
                  1. Motores Open-Source Integrados en el Núcleo de Daniel 1.0
                </div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Combinación de Frameworks sin Duplicar Infraestructura
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateSuperAgentProfile({ selectedCoordinator: 'google-adk' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    superAgentProfile.selectedCoordinator === 'google-adk'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Alternativa A: Google ADK + MetaGPT + OpenHands
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSuperAgentProfile({ selectedCoordinator: 'openai-agents-sdk' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    superAgentProfile.selectedCoordinator === 'openai-agents-sdk'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Alternativa B: Agents SDK + OpenHands
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {OPEN_SOURCE_AGENT_REPOS.map((repo) => (
                <div
                  key={repo.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${
                    isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-emerald-400">{repo.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {repo.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-200">{repo.roleInDaniel}</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{repo.description}</p>
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-indigo-400 hover:underline pt-1 inline-flex items-center gap-1"
                  >
                    <span>Ver GitHub ({repo.organization})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Definamos tu Super Agent (Las 4 Preguntas de Configuración de José) + Despachador de Misión */}
          <div className={`p-6 rounded-3xl border space-y-5 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase">
                2. Definición Operativa del Super Agent de José (4 Parámetros de Gobernanza)
              </div>
              <h3 className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Configuración de Etapa, Stack Tecnológico, Autonomía y Presupuesto
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pregunta 1: Etapa */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-white">1. ¿En qué etapa está tu app?</div>
                {[
                  { id: 'existing-app', label: 'Ya existe la app y le añado el Super Agent' },
                  { id: 'new-from-scratch', label: 'Crear una aplicación nueva desde cero' },
                  { id: 'idea-stage', label: 'Tengo una idea, aún sin programar' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      superAgentProfile.appStage === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="appStage"
                      checked={superAgentProfile.appStage === opt.id}
                      onChange={() => handleUpdateSuperAgentProfile({ appStage: opt.id as any })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Pregunta 2: Tecnología */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-white">2. ¿Con qué tecnología trabajas?</div>
                {[
                  { id: 'web-fullstack', label: 'Web: Frontend (React) y Backend (Node/Express)' },
                  { id: 'mobile', label: 'Aplicación móvil (iOS / Android)' },
                  { id: 'no-code', label: 'No-code / Low-code' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      superAgentProfile.techStack === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="techStack"
                      checked={superAgentProfile.techStack === opt.id}
                      onChange={() => handleUpdateSuperAgentProfile({ techStack: opt.id as any })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Pregunta 3: Autonomía */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-white">3. ¿Cuánta autonomía quieres darle?</div>
                {[
                  { id: 'propose-and-wait', label: 'Que proponga soluciones y espere mi aprobación' },
                  { id: 'low-risk-auto-consult-critical', label: 'Ejecutar bajo riesgo y consultarme las importantes' },
                  { id: 'max-autonomy-with-guardrails', label: 'Máxima autonomía con límites de seguridad' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      superAgentProfile.autonomyMode === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="autonomyMode"
                      checked={superAgentProfile.autonomyMode === opt.id}
                      onChange={() => handleUpdateSuperAgentProfile({ autonomyMode: opt.id as any })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Pregunta 4: Presupuesto */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-white">4. ¿Presupuesto mensual IA e infra?</div>
                {[
                  { id: 'lean', label: 'Lo más económico posible (Lean)' },
                  { id: 'balanced-intermediate', label: 'Presupuesto intermedio optimizado' },
                  { id: 'max-capability', label: 'Priorizar máxima capacidad multicapa' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      superAgentProfile.budgetTier === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="budgetTier"
                      checked={superAgentProfile.budgetTier === opt.id}
                      onChange={() => handleUpdateSuperAgentProfile({ budgetTier: opt.id as any })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Live Multi-Department Mission Dispatcher */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={superAgentMissionInput}
                  onChange={(e) => setSuperAgentMissionInput(e.target.value)}
                  placeholder={`Ej: "Diseña el plan financiero, campaña de captación, arquitectura de código y blindaje legal para ${businessForm.businessName} en ${businessForm.targetLocation}"`}
                  className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleRunSuperAgentMission}
                  disabled={isDispatchingSuperAgent}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isDispatchingSuperAgent
                      ? 'Coordinando los 12 Departamentos...'
                      : 'Orquestar Misión con Super Agent (12 Depts)'}
                  </span>
                </button>
              </div>

              {superAgentDispatchResult && (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">
                        {superAgentDispatchResult.coordinatorUsed}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {superAgentDispatchResult.missionTitle}
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-semibold">
                      {superAgentDispatchResult.autonomyGateStatus}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                    {superAgentDispatchResult.executiveSynthesisForJose}
                  </p>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                    <strong>Sello del Auditor Independiente (AUD-12 Sovereign):</strong>{' '}
                    {superAgentDispatchResult.moralAuditNotes}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {superAgentDispatchResult.departmentOutputs.map((deptOut) => (
                      <div
                        key={deptOut.departmentId}
                        className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{deptOut.departmentName}</span>
                            <span className="text-[10px] font-mono text-indigo-400">{deptOut.framework}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-400">
                            {deptOut.deliverableTitle}
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">{deptOut.diagnosis}</p>
                          <ul className="text-[11px] text-zinc-400 list-disc pl-4 space-y-0.5">
                            {deptOut.actionableSteps.map((st, idx) => (
                              <li key={idx}>{st}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-zinc-800 space-y-1">
                          <div className="text-[10px] font-mono text-zinc-300">
                            KPI Meta: <span className="text-emerald-400 font-bold">{deptOut.kpiOrMetric}</span>
                          </div>
                          {deptOut.requiresHumanApproval && (
                            <div className="text-[10px] font-mono text-amber-400">
                              🔒 Requiere aprobación de José: {deptOut.approvalReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Los 12 Departamentos Especializados y Control Individual de Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(workspace?.agents || []).map((ag) => (
              <div
                key={ag.id}
                className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">{ag.role}</span>
                    <select
                      value={ag.status}
                      onChange={(e) => handleUpdateAgent(ag.id, { status: e.target.value as any })}
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-[11px] text-white cursor-pointer"
                    >
                      <option value="Activo (Configuración)">Activo (Config)</option>
                      <option value="En Pausa">En Pausa</option>
                      <option value="Entrenamiento">Entrenamiento</option>
                    </select>
                  </div>

                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{ag.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{ag.description}</p>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-zinc-300">Capacidades asignadas:</div>
                    <ul className="text-xs text-zinc-400 space-y-0.5 list-disc pl-4">
                      {ag.capabilities.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-amber-400">Requiere aprobación humana para:</div>
                    <ul className="text-xs text-zinc-300 space-y-0.5 list-disc pl-4">
                      {ag.humanApprovalActions.map((ha, i) => (
                        <li key={i}>{ha}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Budget & Autonomy Controls */}
                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Presupuesto mensual:</span>
                    <span className="font-mono font-bold text-white">
                      ${ag.monthlyBudgetUsd} USD / máx ${ag.monthlyLimitUsd}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={ag.monthlyLimitUsd}
                    step={5}
                    value={ag.monthlyBudgetUsd}
                    onChange={(e) => handleUpdateAgent(ag.id, { monthlyBudgetUsd: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Autonomía:</span>
                    <select
                      value={ag.autonomyLevel}
                      onChange={(e) => handleUpdateAgent(ag.id, { autonomyLevel: e.target.value as any })}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-emerald-400"
                    >
                      <option value="Asistido (Copiloto)">Asistido (Copiloto)</option>
                      <option value="Semi-Autónomo">Semi-Autónomo</option>
                      <option value="Autónomo con Aprobación">Autónomo con Aprobación</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 8: ESTADO DE CONEXIONES EXTERNAS (REAL VS MOCKED VS PENDIENTE)
         ===================================================================== */}
      {activeStep === 'conexiones' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl border space-y-2 ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="text-xs font-mono text-emerald-500 uppercase">Auditoría Técnica de Integraciones</div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Estado de Conexiones Externas y Servicios del Workspace
            </h2>
            <p className="text-xs text-zinc-400">
              En 4haus Studio diferenciamos con total transparencia las funciones conectadas al backend real de aquellas que operan con datos de ejemplo o tienen OAuth/proveedores pendientes de configuración.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(workspace?.connections || []).map((conn) => {
              const isReal = conn.status === 'Conectado (Real)';
              return (
                <div
                  key={conn.id}
                  className={`p-5 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">{conn.category} · {conn.provider}</span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isReal ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {conn.status}
                    </span>
                  </div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{conn.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{conn.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MANDATORY CONFIRMATION DIALOG FOR REAL GMAIL CAMPAIGN SENDING
         ===================================================================== */}
      {emailModalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 text-left text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="text-[11px] font-mono text-emerald-400 uppercase">
                  Confirmación de Envío Real · Google Workspace (Gmail API)
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Enviar campaña por correo al prospecto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Revisa los datos del destinatario y el contenido antes de confirmar. Este correo se enviará realmente desde tu cuenta de Gmail autorizada.
            </p>

            {emailModalState.errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs">
                {emailModalState.errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Seleccionar Prospecto del CRM (autocompleta variables):
                </label>
                <select
                  value={emailModalState.selectedProspectId}
                  onChange={(e) => handleSelectProspectInEmailModal(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                >
                  {(workspace?.prospects || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.email} ({p.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nombre del destinatario
                  </label>
                  <input
                    type="text"
                    value={emailModalState.customRecipientName}
                    onChange={(e) =>
                      setEmailModalState((prev) => ({ ...prev, customRecipientName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Email del destinatario *
                  </label>
                  <input
                    type="email"
                    value={emailModalState.customRecipientEmail}
                    onChange={(e) =>
                      setEmailModalState((prev) => ({ ...prev, customRecipientEmail: e.target.value }))
                    }
                    placeholder="cliente@empresa.com"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Asunto del Correo *</label>
                <input
                  type="text"
                  value={emailModalState.customSubject}
                  onChange={(e) =>
                    setEmailModalState((prev) => ({ ...prev, customSubject: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Cuerpo del Mensaje *</label>
                <textarea
                  rows={6}
                  value={emailModalState.customBody}
                  onChange={(e) =>
                    setEmailModalState((prev) => ({ ...prev, customBody: e.target.value }))
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEmailModalState((prev) => ({ ...prev, isOpen: false }))}
                disabled={emailModalState.isSending}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSendGmail}
                disabled={emailModalState.isSending}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {emailModalState.isSending
                    ? 'Enviando por Gmail...'
                    : `Confirmar y Enviar a ${emailModalState.customRecipientEmail || 'Prospecto'}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
