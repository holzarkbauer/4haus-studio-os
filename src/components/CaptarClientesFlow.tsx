import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Check, RefreshCw, UserPlus, SlidersHorizontal } from 'lucide-react';
import { Language } from '../types';
import { NicheProfile, Prospect, CampaignDraft, ProjectPreloadPayload } from '../types/leadNichoTypes';
import { StepProgress, StepNav, DanielGuideBubble } from './GuidedFlow';
import { getWorkspaceId } from '../utils/workspaceId';

// "Captar clientes" en 4 pasos: negocio → cliente ideal → prospectos → mensaje.
// Usa las mismas rutas del servidor que la vista avanzada (LeadNicho), solo que con menos campos.

interface CaptarClientesFlowProps {
  lang: Language;
  themeMode?: 'light' | 'dark';
  userId?: string | null;
  preloadData?: ProjectPreloadPayload | null;
  onOpenAdvanced: () => void;
}

const CHANNELS = ['Email', 'WhatsApp', 'LinkedIn', 'Instagram'] as const;

export function CaptarClientesFlow({ lang, themeMode = 'light', userId, preloadData, onOpenAdvanced }: CaptarClientesFlowProps) {
  const isDark = themeMode === 'dark';
  const isEn = lang === 'en';
  const workspaceId = useMemo(() => getWorkspaceId(userId), [userId]);
  const headers = { 'Content-Type': 'application/json', 'x-user-id': workspaceId };

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: negocio
  const [business, setBusiness] = useState({ businessName: '', productType: '', targetAudience: '', targetLocation: '' });
  const [businessId, setBusinessId] = useState<string | null>(null);
  // Paso 2: cliente ideal
  const [niche, setNiche] = useState<NicheProfile | null>(null);
  // Paso 3: prospectos
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [newProspect, setNewProspect] = useState({ name: '', company: '', contact: '' });
  // Paso 4: mensaje
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>('Email');
  const [objective, setObjective] = useState('');
  const [campaign, setCampaign] = useState<CampaignDraft | null>(null);
  const [copied, setCopied] = useState(false);

  // Cargar lo que el usuario ya guardó con este flujo (no los datos de ejemplo del servidor).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/studio/workspace', { headers })
      .then((r) => r.json())
      .then((ws) => {
        if (cancelled || !ws) return;
        const bp = ws.businessProfile;
        if (bp?.savedBy === 'guided-flow') {
          setBusiness({
            businessName: bp.businessName || '',
            productType: bp.productType || '',
            targetAudience: bp.targetAudience || '',
            targetLocation: bp.targetLocation || '',
          });
          setBusinessId(bp.id);
          const myNiche = (ws.nicheProfiles || []).find((n: NicheProfile) => n.businessProfileId === bp.id);
          if (myNiche) setNiche(myNiche);
        }
        // Solo prospectos añadidos a mano por el usuario, nunca los de ejemplo.
        setProspects((ws.prospects || []).filter((p: Prospect) => p.source === 'Registro Manual en Workspace'));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Si Daniel ya armó una propuesta, se usa para rellenar el paso 1 (sin pisar lo escrito).
  useEffect(() => {
    if (!preloadData) return;
    setBusiness((prev) => ({
      businessName: prev.businessName || preloadData.businessName || '',
      productType: prev.productType || preloadData.productType || '',
      targetAudience: prev.targetAudience || preloadData.targetAudience || '',
      targetLocation: prev.targetLocation || preloadData.targetLocation || '',
    }));
  }, [preloadData]);

  const steps = isEn
    ? ['Your business', 'Ideal client', 'Prospects', 'Message']
    : ['Tu negocio', 'Cliente ideal', 'Prospectos', 'Mensaje'];

  const guide = [
    {
      message: isEn
        ? 'Tell me what you sell and who to. Four answers are enough; you can change them later.'
        : 'Cuéntame qué vendes y a quién. Con cuatro respuestas basta; puedes cambiarlas después.',
      help: isEn
        ? 'Help me describe my business in one sentence: what I sell, who to and where.'
        : 'Ayúdame a describir mi negocio en una frase: qué vendo, a quién y dónde.',
    },
    {
      message: isEn
        ? 'With your business I create your ideal client: who they are, what worries them and what convinces them. If it does not fit, generate another.'
        : 'Con tu negocio creo tu cliente ideal: quién es, qué le preocupa y qué le convence. Si no encaja, genera otro.',
      help: isEn ? 'Explain my ideal client in simple words and how to reach them.' : 'Explícame mi cliente ideal en palabras simples y cómo llegar a él.',
    },
    {
      message: isEn
        ? 'Add the people or businesses you want to contact. Only contacts you know or who gave you permission.'
        : 'Añade las personas o negocios a los que quieres escribir. Solo contactos que conoces o que te dieron permiso.',
      help: isEn ? 'Where can I find prospects for my business in an ethical way?' : '¿Dónde puedo encontrar prospectos para mi negocio de forma ética?',
    },
    {
      message: isEn
        ? 'Choose the channel and I write a first message for your ideal client. Review it before sending; it is never sent automatically.'
        : 'Elige el canal y escribo un primer mensaje para tu cliente ideal. Revísalo antes de enviarlo: nunca se envía solo.',
      help: isEn ? 'How do I make this first message sound more natural?' : '¿Cómo hago que este primer mensaje suene más natural?',
    },
  ];

  const field = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
    isDark
      ? 'bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30'
      : 'bg-white border-black/[0.1] text-[#1D1D1F] placeholder:text-[#86868B] focus:border-black/30'
  }`;
  const label = `block text-sm font-medium mb-1.5 ${isDark ? 'text-zinc-200' : 'text-[#1D1D1F]'}`;
  const muted = isDark ? 'text-zinc-400' : 'text-[#6E6E73]';
  const panel = `rounded-2xl border p-5 ${isDark ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-black/[0.08]'}`;

  async function call(path: string, body: unknown) {
    const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function saveBusinessAndContinue() {
    setBusy(true);
    setError(null);
    try {
      const profile = {
        id: businessId || undefined,
        savedBy: 'guided-flow',
        businessName: business.businessName.trim(),
        industry: business.productType.trim(),
        productType: business.productType.trim(),
        targetAudience: business.targetAudience.trim(),
        targetLocation: business.targetLocation.trim(),
        averageTicket: '',
        goal90Days: isEn ? 'Win new clients' : 'Conseguir clientes nuevos',
        approxBudget: '',
        preferredChannels: ['Email', 'WhatsApp'],
        communicationTone: isEn ? 'Friendly and professional' : 'Cercano y profesional',
        commercialCapacity: '',
      };
      const data = await call('/api/studio/business-profile', profile);
      setBusinessId(data.businessProfile?.id || null);
      setStep(1);
    } catch {
      setError(isEn ? 'Could not save. Try again.' : 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function generateNiche() {
    setBusy(true);
    setError(null);
    try {
      const ws = await fetch('/api/studio/workspace', { headers }).then((r) => r.json());
      const data = await call('/api/studio/generate-niche', { businessProfile: ws.businessProfile });
      setNiche(data.nicheProfile || null);
    } catch {
      setError(isEn ? 'Could not generate. Try again.' : 'No se pudo generar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function addProspect() {
    if (!newProspect.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const contact = newProspect.contact.trim();
      const isEmail = contact.includes('@');
      const data = await call('/api/studio/prospects', {
        prospect: {
          name: newProspect.name.trim(),
          company: newProspect.company.trim() || undefined,
          email: isEmail ? contact : undefined,
          socialHandle: !isEmail && contact ? contact : undefined,
          channel: isEmail ? 'Email' : 'WhatsApp',
          niche: niche?.nicheName,
        },
      });
      if (data.createdProspect) setProspects((prev) => [data.createdProspect, ...prev]);
      setNewProspect({ name: '', company: '', contact: '' });
    } catch {
      setError(isEn ? 'Could not add the contact.' : 'No se pudo añadir el contacto.');
    } finally {
      setBusy(false);
    }
  }

  async function generateMessage() {
    setBusy(true);
    setError(null);
    try {
      const persona = niche?.buyerPersonas?.[0];
      const data = await call('/api/studio/generate-campaign', {
        nicheProfileId: niche?.id,
        segment: persona?.segment || niche?.priorityAudience || business.targetAudience,
        channel,
        objective: objective.trim() || (isEn ? 'Book a first call' : 'Agendar una primera llamada'),
        offer: niche?.valueProposition || business.productType,
        tone: isEn ? 'Friendly and professional' : 'Cercano y profesional',
        cta: isEn ? 'Would a short call this week work for you?' : '¿Te parece si conversamos 15 minutos esta semana?',
      });
      setCampaign(data.campaign || null);
    } catch {
      setError(isEn ? 'Could not write the message.' : 'No se pudo escribir el mensaje.');
    } finally {
      setBusy(false);
    }
  }

  const businessReady = business.businessName.trim() && business.productType.trim() && business.targetAudience.trim();

  return (
    <div className="max-w-2xl mx-auto w-full pt-6 pb-32 space-y-8 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
            {isEn ? 'Win clients' : 'Captar clientes'}
          </h2>
          <p className={`text-sm mt-1 ${muted}`}>
            {isEn ? 'Four steps to your first message to a prospect.' : 'Cuatro pasos hasta tu primer mensaje a un prospecto.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAdvanced}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer ${
            isDark ? 'border-white/15 text-zinc-300 hover:bg-white/5' : 'border-black/[0.1] text-[#1D1D1F] hover:bg-black/[0.03]'
          }`}
          title={isEn ? 'All tools: CRM, campaigns, landing, connections' : 'Todas las herramientas: CRM, campañas, landing, conexiones'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {isEn ? 'Advanced view' : 'Vista avanzada'}
        </button>
      </div>

      <StepProgress steps={steps} current={step} isDark={isDark} />

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      {/* PASO 1: TU NEGOCIO */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className={label} htmlFor="cc-name">{isEn ? 'Business name' : 'Nombre de tu negocio'}</label>
            <input id="cc-name" className={field} value={business.businessName} placeholder={isEn ? 'e.g. AMOOO' : 'Ej. AMOOO'}
              onChange={(e) => setBusiness({ ...business, businessName: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="cc-product">{isEn ? 'What do you sell?' : '¿Qué vendes?'}</label>
            <input id="cc-product" className={field} value={business.productType}
              placeholder={isEn ? 'e.g. Women\'s clothing online' : 'Ej. Ropa de mujer por internet'}
              onChange={(e) => setBusiness({ ...business, productType: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="cc-audience">{isEn ? 'Who do you sell to?' : '¿A quién le vendes?'}</label>
            <input id="cc-audience" className={field} value={business.targetAudience}
              placeholder={isEn ? 'e.g. Women 20–35 who buy on Instagram' : 'Ej. Mujeres de 20 a 35 años que compran por Instagram'}
              onChange={(e) => setBusiness({ ...business, targetAudience: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="cc-location">{isEn ? 'Where? (optional)' : '¿Dónde? (opcional)'}</label>
            <input id="cc-location" className={field} value={business.targetLocation} placeholder={isEn ? 'e.g. Lima, Peru' : 'Ej. Lima, Perú'}
              onChange={(e) => setBusiness({ ...business, targetLocation: e.target.value })} />
          </div>
          <StepNav lang={lang} isDark={isDark} canBack={false} onBack={() => {}} nextLabel={isEn ? 'Save and continue' : 'Guardar y seguir'}
            onNext={saveBusinessAndContinue} nextDisabled={!businessReady} busy={busy} />
        </div>
      )}

      {/* PASO 2: CLIENTE IDEAL */}
      {step === 1 && (
        <div className="space-y-5">
          {!niche ? (
            <div className={`${panel} text-center space-y-3 py-10`}>
              <p className={`text-sm ${muted}`}>
                {isEn ? 'Daniel will create your ideal client from your business.' : 'Daniel creará tu cliente ideal a partir de tu negocio.'}
              </p>
              <button type="button" onClick={generateNiche} disabled={busy}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-40 ${isDark ? 'bg-white text-black' : 'bg-[#1D1D1F] text-white'}`}>
                {busy ? (isEn ? 'Creating...' : 'Creando...') : isEn ? 'Create my ideal client' : 'Crear mi cliente ideal'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={panel}>
                <div className={`text-xs font-medium ${muted}`}>{isEn ? 'Your niche' : 'Tu nicho'}</div>
                <div className={`text-lg font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{niche.nicheName}</div>
                <p className={`text-sm mt-2 ${muted}`}>{niche.valueProposition}</p>
              </div>
              {(niche.buyerPersonas || []).slice(0, 3).map((p) => (
                <div key={p.name} className={panel}>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{p.name}</div>
                  <div className={`text-xs ${muted}`}>{p.role}</div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <div className={`text-xs font-medium mb-1 ${muted}`}>{isEn ? 'What worries them' : 'Qué le preocupa'}</div>
                      <div className={isDark ? 'text-zinc-200' : 'text-[#1D1D1F]'}>{p.painPoints?.[0]}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-medium mb-1 ${muted}`}>{isEn ? 'What convinces them' : 'Qué le convence'}</div>
                      <div className={isDark ? 'text-zinc-200' : 'text-[#1D1D1F]'}>{p.motivations?.[0]}</div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={generateNiche} disabled={busy}
                className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                {isEn ? 'Generate another' : 'Generar otro'}
              </button>
            </div>
          )}
          <StepNav lang={lang} isDark={isDark} canBack onBack={() => setStep(0)} nextLabel={isEn ? 'Continue' : 'Seguir'}
            onNext={() => setStep(2)} nextDisabled={!niche} busy={false} />
        </div>
      )}

      {/* PASO 3: PROSPECTOS */}
      {step === 2 && (
        <div className="space-y-5">
          <div className={`${panel} space-y-3`}>
            <div className="grid sm:grid-cols-3 gap-3">
              <input className={field} placeholder={isEn ? 'Name' : 'Nombre'} value={newProspect.name}
                onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })} aria-label={isEn ? 'Name' : 'Nombre'} />
              <input className={field} placeholder={isEn ? 'Business (optional)' : 'Negocio (opcional)'} value={newProspect.company}
                onChange={(e) => setNewProspect({ ...newProspect, company: e.target.value })} aria-label={isEn ? 'Business' : 'Negocio'} />
              <input className={field} placeholder={isEn ? 'Email or WhatsApp' : 'Correo o WhatsApp'} value={newProspect.contact}
                onChange={(e) => setNewProspect({ ...newProspect, contact: e.target.value })} aria-label={isEn ? 'Contact' : 'Contacto'} />
            </div>
            <button type="button" onClick={addProspect} disabled={busy || !newProspect.name.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-40 ${isDark ? 'bg-white/10 text-white' : 'bg-black/[0.05] text-[#1D1D1F]'}`}>
              <UserPlus className="w-4 h-4" />
              {isEn ? 'Add contact' : 'Añadir contacto'}
            </button>
          </div>

          {prospects.length === 0 ? (
            <p className={`text-sm text-center py-6 ${muted}`}>
              {isEn ? 'You have no contacts yet. Add at least one.' : 'Todavía no tienes contactos. Añade al menos uno.'}
            </p>
          ) : (
            <ul className={`${panel} divide-y ${isDark ? 'divide-white/10' : 'divide-black/[0.06]'} p-0`}>
              {prospects.map((p) => (
                <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{p.name}</div>
                    <div className={`text-xs truncate ${muted}`}>{[p.company, p.email !== 'pendiente@ejemplo.com' ? p.email : p.socialHandle].filter(Boolean).join(' · ')}</div>
                  </div>
                  <span className={`text-[11px] shrink-0 ${muted}`}>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
          <StepNav lang={lang} isDark={isDark} canBack onBack={() => setStep(1)} nextLabel={isEn ? 'Continue' : 'Seguir'}
            onNext={() => setStep(3)} nextDisabled={prospects.length === 0} busy={false} />
        </div>
      )}

      {/* PASO 4: MENSAJE */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <div className={label}>{isEn ? 'Channel' : 'Canal'}</div>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button key={c} type="button" onClick={() => setChannel(c)}
                  className={`px-4 py-2 rounded-full border text-sm cursor-pointer ${
                    channel === c
                      ? isDark ? 'bg-white text-black border-white' : 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                      : isDark ? 'border-white/15 text-zinc-300' : 'border-black/[0.1] text-[#1D1D1F] bg-white'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label} htmlFor="cc-objective">{isEn ? 'What do you want to achieve? (optional)' : '¿Qué quieres lograr? (opcional)'}</label>
            <input id="cc-objective" className={field} value={objective}
              placeholder={isEn ? 'e.g. Book a first call' : 'Ej. Agendar una primera llamada'}
              onChange={(e) => setObjective(e.target.value)} />
          </div>

          {campaign ? (
            <div className={`${panel} space-y-3`}>
              {campaign.subjectOrHook && (
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{campaign.subjectOrHook}</div>
              )}
              <p className={`text-sm whitespace-pre-line leading-relaxed ${isDark ? 'text-zinc-200' : 'text-[#1D1D1F]'}`}>{campaign.mainBody}</p>
              <div className="flex items-center gap-4 pt-1">
                <button type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${campaign.subjectOrHook ? campaign.subjectOrHook + '\n\n' : ''}${campaign.mainBody}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (isEn ? 'Copied' : 'Copiado') : isEn ? 'Copy message' : 'Copiar mensaje'}
                </button>
                <button type="button" onClick={generateMessage} disabled={busy}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                  <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                  {isEn ? 'Write another' : 'Escribir otro'}
                </button>
              </div>
              <p className={`text-xs ${muted}`}>
                {isEn
                  ? 'Replace {{Nombre}}, {{Empresa}} and {{Ubicación}} with each contact\'s details. To send it from Gmail, use the advanced view.'
                  : 'Cambia {{Nombre}}, {{Empresa}} y {{Ubicación}} por los datos de cada contacto. Para enviarlo desde Gmail, usa la vista avanzada.'}
              </p>
            </div>
          ) : null}

          <StepNav lang={lang} isDark={isDark} canBack onBack={() => setStep(2)}
            nextLabel={campaign ? (isEn ? 'Write another' : 'Escribir otro') : isEn ? 'Write my message' : 'Escribir mi mensaje'}
            onNext={generateMessage} busy={busy} />
        </div>
      )}

      <DanielGuideBubble lang={lang} stepKey={`captar-${step}`} message={guide[step].message} helpQuestion={guide[step].help} />
    </div>
  );
}
