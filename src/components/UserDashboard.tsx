import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  FolderKanban,
  Users,
  Plus,
  Rocket,
  Mail,
  Building2,
  MapPin,
  Target,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Database,
  Flame,
  Send,
  LayoutTemplate,
  Sparkles,
  LogOut,
  X,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  FirestoreWorkspaceMeta,
  FirestoreUserProject,
  FirestoreUserProspect,
  ProjectStatus,
  subscribeToUserWorkspaceMeta,
  subscribeToUserProjects,
  subscribeToUserProspects,
  saveProjectToFirestore,
  updateProjectStatusInFirestore,
  deleteProjectFromFirestore,
  syncProspectToFirestore,
  deleteProspectFromFirestore,
} from '../services/firebaseAuth';
import {
  MigrationAuditReport,
  MigrationExecutionResult,
  auditUserProspectMigrationState,
  runUserProspectsFirestoreMigration,
} from '../services/prospectMigration';
import { Language } from '../types';
import { ProjectPreloadPayload } from '../types/leadNichoTypes';

interface UserDashboardProps {
  currentUser: User | null;
  isLoggingIn?: boolean;
  onGoogleLogin: () => void;
  onLogout: () => void;
  lang: Language;
  themeMode: 'light' | 'dark';
  onOpenProjectInWorkbench: (targetModule: string, preloadData: ProjectPreloadPayload) => void;
}

export function UserDashboard({
  currentUser,
  isLoggingIn = false,
  onGoogleLogin,
  onLogout,
  lang,
  themeMode,
  onOpenProjectInWorkbench,
}: UserDashboardProps) {
  const isDark = themeMode === 'dark';

  const [workspaceMeta, setWorkspaceMeta] = useState<FirestoreWorkspaceMeta | null>(null);
  const [projects, setProjects] = useState<FirestoreUserProject[]>([]);
  const [prospects, setProspects] = useState<FirestoreUserProspect[]>([]);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(false);

  // New Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<{
    name: string;
    industry: string;
    targetLocation: string;
    objective: string;
    status: ProjectStatus;
  }>({
    name: '',
    industry: 'Inmobiliaria / Real Estate',
    targetLocation: 'Madrid & Costa del Sol',
    objective: 'Captar 15 propietarios exclusivos e inversores cualificados en 90 días',
    status: 'Activo',
  });
  const [isSavingProject, setIsSavingProject] = useState(false);

  // New Prospect Modal (Schema v2 Genuine Tracking)
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [prospectForm, setProspectForm] = useState<{
    name: string;
    company: string;
    role: string;
    email: string;
    socialHandle: string;
    channel: 'Email' | 'Instagram' | 'LinkedIn' | 'WhatsApp' | 'Web Form';
    location: string;
    niche: string;
    status: 'Nuevo' | 'Contactado' | 'Respondió' | 'Cualificado' | 'Reunión Agendada' | 'Descartado';
    temperature: 'Caliente' | 'Templado' | 'Frío';
    source: string;
    sourceUrl: string;
    recommendedAction: string;
  }>({
    name: '',
    company: '',
    role: 'Consejero Delegado (CEO) / Socio Director',
    email: '',
    socialHandle: '',
    channel: 'Email',
    location: 'Madrid',
    niche: 'Inmobiliaria & Inversión Patrimonial',
    status: 'Nuevo',
    temperature: 'Caliente',
    source: 'Registro Directo Corporativo (Firestore CRM v2)',
    sourceUrl: '',
    recommendedAction: 'Enviar propuesta personalizada por Gmail API y agendar sesión de diagnóstico.',
  });
  const [isSavingProspect, setIsSavingProspect] = useState(false);
  const [isSearchingRealLeads, setIsSearchingRealLeads] = useState(false);

  // Firestore Data Migration Utility State
  const [migrationAudit, setMigrationAudit] = useState<MigrationAuditReport | null>(null);
  const [isMigratingFirestore, setIsMigratingFirestore] = useState(false);
  const [migrationStepMsg, setMigrationStepMsg] = useState<string | null>(null);
  const [lastMigrationResult, setLastMigrationResult] = useState<MigrationExecutionResult | null>(
    null
  );

  const handleRunFirestoreMigration = async (useLiveSearch = false) => {
    if (!currentUser?.uid) return;
    setIsMigratingFirestore(true);
    setMigrationStepMsg('Iniciando migración de prospectos reales en Firestore...');
    try {
      const targetIndustry =
        projects[0]?.industry ||
        workspaceMeta?.industry ||
        'Promotoras Inmobiliarias e Inversión Patrimonial';
      const targetLocation =
        projects[0]?.targetLocation || workspaceMeta?.targetLocation || 'Madrid y Marbella';
      const result = await runUserProspectsFirestoreMigration(currentUser.uid, {
        targetNiche: targetIndustry,
        targetLocation,
        useLiveSearchDiscovery: useLiveSearch,
        onProgress: (msg) => setMigrationStepMsg(msg),
      });
      setLastMigrationResult(result);
      const updatedAudit = await auditUserProspectMigrationState(currentUser.uid);
      setMigrationAudit(updatedAudit);
    } catch (error) {
      console.error('Firestore migration error:', error);
    } finally {
      setIsMigratingFirestore(false);
      setMigrationStepMsg(null);
    }
  };

  const handleDiscoverRealProspects = async () => {
    if (!currentUser?.uid) return;
    setIsSearchingRealLeads(true);
    try {
      const targetIndustry =
        projects[0]?.industry ||
        workspaceMeta?.industry ||
        'Promotoras Inmobiliarias e Inversión';
      const targetLocation =
        projects[0]?.targetLocation || workspaceMeta?.targetLocation || 'Madrid y Marbella';
      const res = await fetch('/api/studio/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.uid,
        },
        body: JSON.stringify({
          action: 'search_real_prospects',
          nicheName: targetIndustry,
          location: targetLocation,
          userId: currentUser.uid,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.createdProspects)) {
          for (const cp of data.createdProspects) {
            await syncProspectToFirestore(currentUser.uid, cp.id, {
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
      }
      const updatedAudit = await auditUserProspectMigrationState(currentUser.uid);
      setMigrationAudit(updatedAudit);
    } catch (error) {
      console.error('Error searching real prospects:', error);
    } finally {
      setIsSearchingRealLeads(false);
    }
  };

  // Real-time Firestore Subscriptions + Automatic Migration Audit for the logged-in user
  useEffect(() => {
    if (!currentUser?.uid) {
      setWorkspaceMeta(null);
      setProjects([]);
      setProspects([]);
      setMigrationAudit(null);
      setLastMigrationResult(null);
      return;
    }

    setIsLoadingFirestore(true);

    const unsubMeta = subscribeToUserWorkspaceMeta(currentUser.uid, (meta) => {
      setWorkspaceMeta(meta);
    });

    const unsubProjects = subscribeToUserProjects(currentUser.uid, (items) => {
      setProjects(items);
      setIsLoadingFirestore(false);
    });

    const unsubProspects = subscribeToUserProspects(currentUser.uid, (items) => {
      setProspects(items);
      setIsLoadingFirestore(false);
    });

    // Run audit on login and auto-migrate if mock records or legacy v1 documents are detected
    auditUserProspectMigrationState(currentUser.uid)
      .then((report) => {
        setMigrationAudit(report);
        if (report.needsMigration) {
          runUserProspectsFirestoreMigration(currentUser.uid)
            .then(async (res) => {
              setLastMigrationResult(res);
              const postAudit = await auditUserProspectMigrationState(currentUser.uid);
              setMigrationAudit(postAudit);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      unsubMeta();
      unsubProjects();
      unsubProspects();
    };
  }, [currentUser?.uid]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !projectForm.name.trim()) return;
    setIsSavingProject(true);
    try {
      const projectId = `proj_${Date.now()}`;
      await saveProjectToFirestore(currentUser.uid, projectId, {
        name: projectForm.name.trim(),
        industry: projectForm.industry.trim(),
        targetLocation: projectForm.targetLocation.trim(),
        objective: projectForm.objective.trim(),
        status: projectForm.status,
      });
      setProjectForm({
        name: '',
        industry: 'Inmobiliaria / Real Estate',
        targetLocation: 'Madrid & Costa del Sol',
        objective: 'Captar 15 propietarios exclusivos e inversores cualificados en 90 días',
        status: 'Activo',
      });
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error('Error creating Firestore project:', error);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !prospectForm.name.trim() || !prospectForm.email.trim()) return;
    setIsSavingProspect(true);
    try {
      const prospectId = `lead_${Date.now()}`;
      await syncProspectToFirestore(currentUser.uid, prospectId, {
        name: prospectForm.name.trim(),
        company: prospectForm.company.trim() || 'Independiente',
        role: prospectForm.role.trim() || 'Dirección General / Decisor',
        email: prospectForm.email.trim(),
        socialHandle:
          prospectForm.socialHandle.trim() ||
          (prospectForm.email.includes('@') ? prospectForm.email.split('@')[1] : 'linkedin.com'),
        channel: prospectForm.channel,
        location: prospectForm.location.trim() || 'Madrid',
        niche: prospectForm.niche.trim() || 'Inmobiliaria & Inversión Patrimonial',
        status: prospectForm.status,
        temperature: prospectForm.temperature,
        source: prospectForm.source.trim() || 'Registro Directo Corporativo (Firestore CRM v2)',
        sourceUrl: prospectForm.sourceUrl.trim(),
        recommendedAction:
          prospectForm.recommendedAction.trim() ||
          'Enviar propuesta personalizada por Gmail API y agendar sesión de diagnóstico.',
      });
      setProspectForm({
        name: '',
        company: '',
        role: 'Consejero Delegado (CEO) / Socio Director',
        email: '',
        socialHandle: '',
        channel: 'Email',
        location: 'Madrid',
        niche: 'Inmobiliaria & Inversión Patrimonial',
        status: 'Nuevo',
        temperature: 'Caliente',
        source: 'Registro Directo Corporativo (Firestore CRM v2)',
        sourceUrl: '',
        recommendedAction:
          'Enviar propuesta personalizada por Gmail API y agendar sesión de diagnóstico.',
      });
      setIsProspectModalOpen(false);
    } catch (error) {
      console.error('Error creating Firestore prospect:', error);
    } finally {
      setIsSavingProspect(false);
    }
  };

  if (!currentUser) {
    return (
      <section
        className={`rounded-2xl border p-6 md:p-8 transition-all ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800/80 text-white'
            : 'bg-zinc-50/90 border-zinc-200/90 text-zinc-900'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-500">
              <Database className="w-3.5 h-3.5" />
              <span>
                {lang === 'en'
                  ? '4haus Studio — Private Cloud Workspace (Firebase Firestore)'
                  : '4haus Studio — Espacio Privado en la Nube (Firebase Firestore)'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {lang === 'en'
                ? 'Sign in to view your active projects and private CRM prospects'
                : 'Inicia sesión para ver tus proyectos activos y tus prospectos privados'}
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {lang === 'en'
                ? 'Each client account has an isolated Firestore workspace where your business profiles, active growth projects, and prospects are saved and synchronized in real time.'
                : 'Cada cuenta de cliente cuenta con un workspace aislado en Firebase Firestore donde se guardan y sincronizan en tiempo real tus proyectos activos, perfiles de negocio y prospectos reales (sin datos de demostración compartidos).'}
            </p>
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoggingIn}
            className="shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{isLoggingIn ? 'Conectando...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </section>
    );
  }

  const hotLeadsCount = prospects.filter((p) => p.temperature === 'Caliente').length;
  const activeProjectsCount = projects.filter((p) => p.status !== 'Completado').length;

  return (
    <section
      className={`rounded-2xl border p-5 md:p-7 space-y-6 transition-all ${
        isDark
          ? 'bg-zinc-950/90 border-zinc-800/80 text-white'
          : 'bg-white border-zinc-200/90 text-zinc-900 shadow-xs'
      }`}
    >
      {/* Top Authenticated User Profile Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800/20 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/40"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-base font-bold">
              {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base md:text-lg font-bold tracking-tight">
                {currentUser.displayName || 'Cliente 4haus Studio'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-500">
                <ShieldCheck className="w-3.5 h-3.5" />
                Firestore Sync Activo
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {currentUser.email} •{' '}
              {workspaceMeta?.businessName
                ? `${workspaceMeta.businessName} (${workspaceMeta.industry})`
                : lang === 'en'
                  ? 'Personal Cloud Workspace'
                  : 'Workspace Privado del Cliente'}
            </p>
          </div>
        </div>

        {/* Summary Counters + Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-zinc-900/70 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-bold">{activeProjectsCount}</span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
              {lang === 'en' ? 'Active Projects' : 'Proyectos Activos'}
            </span>
          </div>

          <div
            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-zinc-900/70 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold">{prospects.length}</span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
              {lang === 'en' ? 'Saved Prospects' : 'Prospectos'}
            </span>
            {hotLeadsCount > 0 && (
              <span className="text-[10px] font-mono text-amber-500 flex items-center gap-0.5">
                <Flame className="w-3 h-3" /> {hotLeadsCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'New Project' : 'Nuevo Proyecto'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProspectModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add Prospect' : 'Añadir Prospecto'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title={lang === 'en' ? 'Sign out' : 'Cerrar sesión'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two-Column Grid: Active Projects & Private Firestore Prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Active Projects */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold tracking-tight">
                {lang === 'en' ? 'My Active Projects (Firestore)' : 'Mis Proyectos Activos (Firestore)'}
              </h3>
            </div>
            <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {projects.length} {lang === 'en' ? 'total' : 'registrados'}
            </span>
          </div>

          {isLoadingFirestore && projects.length === 0 ? (
            <div
              className={`rounded-xl border p-6 text-center text-xs ${
                isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
              }`}
            >
              Sincronizando proyectos desde Firebase Firestore...
            </div>
          ) : projects.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed p-6 text-center space-y-3 ${
                isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-50/60'
              }`}
            >
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en'
                  ? 'You do not have any saved projects yet. Create one directly or generate a proposal from the AI prompt above.'
                  : 'Aún no tienes proyectos guardados en tu cuenta. Crea tu primer proyecto o genera una propuesta desde el prompt guiado.'}
              </p>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Create First Project' : 'Crear Primer Proyecto'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                    isDark
                      ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block">
                          {proj.industry}
                        </span>
                        <h4 className="text-sm font-bold leading-snug">{proj.name}</h4>
                      </div>

                      <select
                        value={proj.status}
                        disabled={proj.status === 'Completado'}
                        onChange={(e) =>
                          updateProjectStatusInFirestore(
                            currentUser.uid,
                            proj.id,
                            e.target.value as ProjectStatus
                          )
                        }
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          isDark
                            ? 'bg-zinc-950 border-zinc-800 text-emerald-400'
                            : 'bg-white border-zinc-200 text-emerald-700'
                        }`}
                      >
                        <option value="Activo">Activo</option>
                        <option value="En Configuración">En Configuración</option>
                        <option value="En Campaña">En Campaña</option>
                        <option value="Pausado">Pausado</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </div>

                    <p className={`text-xs line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {proj.objective}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{proj.targetLocation}</span>
                    </div>
                  </div>

                  {/* Quick Preload Launch Buttons */}
                  <div className="pt-2 border-t border-zinc-800/30 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenProjectInWorkbench('negocio-perfil', {
                            businessName: proj.name,
                            industry: proj.industry,
                            targetLocation: proj.targetLocation,
                            goal90Days: proj.objective,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/15 text-emerald-500 hover:bg-emerald-600 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Nicho IA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenProjectInWorkbench('campanas-ia', {
                            businessName: proj.name,
                            industry: proj.industry,
                            targetLocation: proj.targetLocation,
                            campaignOffer: proj.objective,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          isDark
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>Campaña</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenProjectInWorkbench('landings-brief', {
                            businessName: proj.name,
                            industry: proj.industry,
                            targetLocation: proj.targetLocation,
                            landingHeadline: proj.objective,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          isDark
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300'
                        }`}
                      >
                        <LayoutTemplate className="w-3 h-3" />
                        <span>Landing</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteProjectFromFirestore(currentUser.uid, proj.id)}
                      title="Eliminar proyecto"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Columns: User's Real Firestore Prospects */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold tracking-tight">
                {lang === 'en'
                  ? 'My Genuine Prospects (Firestore Schema v2)'
                  : 'Mis Prospectos Reales (Firestore Esquema v2)'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRunFirestoreMigration(false)}
                disabled={isMigratingFirestore}
                title="Auditar y migrar prospectos a Esquema v2 sin datos de ejemplo"
                className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isMigratingFirestore ? 'animate-spin' : ''}`} />
                <span>{isMigratingFirestore ? 'Migrando...' : 'Migrar v2'}</span>
              </button>
              <button
                type="button"
                onClick={handleDiscoverRealProspects}
                disabled={isSearchingRealLeads}
                className="text-[11px] font-semibold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {isSearchingRealLeads
                    ? 'Buscando en Google...'
                    : lang === 'en'
                      ? '+ Find Real Leads'
                      : '+ Buscar Reales'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOpenProjectInWorkbench('prospectos-crm', {})}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>CRM</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Firestore Schema v2 Data Migration Status Banner */}
          <div
            className={`rounded-xl border px-3 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2 ${
              isDark
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">
                {migrationStepMsg ? (
                  migrationStepMsg
                ) : lastMigrationResult ? (
                  `Esquema v2 verificado (UID: ${currentUser.uid.slice(0, 8)}) • ${
                    lastMigrationResult.purgedMockCount
                  } mocks eliminados • ${
                    lastMigrationResult.upgradedToV2Count + lastMigrationResult.seededGenuineCount
                  } prospectos reales sincronizados`
                ) : migrationAudit ? (
                  `Esquema v2 Activo • ${migrationAudit.genuineV2RecordsCount} reales vinculados a tu UID (${currentUser.uid.slice(0, 8)})`
                ) : (
                  `Esquema v2 de seguimiento real vinculado a UID: ${currentUser.uid.slice(0, 8)}`
                )}
              </span>
            </div>
          </div>

          {prospects.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed p-6 text-center space-y-3 ${
                isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-50/60'
              }`}
            >
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {lang === 'en'
                  ? 'No prospects stored in your personal Firestore CRM yet. Run the v2 migration or discover real companies with Google Search Grounding.'
                  : 'Ejecuta la utilidad de migración v2 para vincular cuentas corporativas reales verificadas a tu UID o busca nuevas empresas con Google Search.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRunFirestoreMigration(false)}
                  disabled={isMigratingFirestore}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMigratingFirestore ? 'animate-spin' : ''}`} />
                  <span>
                    {isMigratingFirestore
                      ? 'Ejecutando migración...'
                      : 'Ejecutar Migración Firestore v2'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleDiscoverRealProspects}
                  disabled={isSearchingRealLeads}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isSearchingRealLeads
                      ? 'Buscando en Google...'
                      : 'Buscar Reales (Google Search)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProspectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add Manually' : 'Añadir Manual'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {prospects.map((lead) => (
                <div
                  key={lead.id}
                  className={`rounded-xl border p-3 flex items-start justify-between gap-3 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold truncate">{lead.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          lead.temperature === 'Caliente'
                            ? 'bg-rose-500/15 text-rose-400'
                            : lead.temperature === 'Templado'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-sky-500/15 text-sky-400'
                        }`}
                      >
                        {lead.temperature}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-500">
                        v{lead.schemaVersion || 2} • UID:{lead.ownerId.slice(0, 6)}
                      </span>
                    </div>
                    <div className={`text-[11px] truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {lead.company} • <span className="text-zinc-500">{lead.role}</span>
                    </div>
                    <div className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {lead.email} • {lead.location}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-emerald-500 pt-0.5">
                      <span>
                        {lead.channel} • Estado: {lead.status}
                      </span>
                      {lead.sourceUrl && (
                        <a
                          href={lead.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-indigo-400 hover:underline"
                        >
                          <span>Web verificada</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteProspectFromFirestore(currentUser.uid, lead.id)}
                    title="Eliminar prospecto"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Active Project in Firestore */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold">Nuevo Proyecto en Firestore</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Nombre del Proyecto / Negocio</label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Ej. Residencial Aura Marbella"
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Sector / Industria</label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={projectForm.industry}
                    onChange={(e) => setProjectForm({ ...projectForm, industry: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Ubicación Objetivo</label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={projectForm.targetLocation}
                    onChange={(e) => setProjectForm({ ...projectForm, targetLocation: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Objetivo de 90 Días</label>
                <textarea
                  rows={3}
                  required
                  maxLength={400}
                  value={projectForm.objective}
                  onChange={(e) => setProjectForm({ ...projectForm, objective: e.target.value })}
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isSavingProject ? 'Guardando...' : 'Guardar Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Prospect in Firestore */}
      {isProspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold">Añadir Prospecto Privado (Firestore)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProspectModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProspect} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Nombre completo</label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={prospectForm.name}
                  onChange={(e) => setProspectForm({ ...prospectForm, name: e.target.value })}
                  placeholder="Ej. Carlos Mendoza"
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Empresa / Activo</label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={prospectForm.company}
                    onChange={(e) => setProspectForm({ ...prospectForm, company: e.target.value })}
                    placeholder="Ej. Grupo Inversor Sur"
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    maxLength={200}
                    value={prospectForm.email}
                    onChange={(e) => setProspectForm({ ...prospectForm, email: e.target.value })}
                    placeholder="carlos@empresa.com"
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Canal</label>
                  <select
                    value={prospectForm.channel}
                    onChange={(e) =>
                      setProspectForm({
                        ...prospectForm,
                        channel: e.target.value as any,
                      })
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  >
                    <option value="Email">Email</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Web Form">Web Form</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Temperatura</label>
                  <select
                    value={prospectForm.temperature}
                    onChange={(e) =>
                      setProspectForm({
                        ...prospectForm,
                        temperature: e.target.value as any,
                      })
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                    }`}
                  >
                    <option value="Caliente">Caliente</option>
                    <option value="Templado">Templado</option>
                    <option value="Frío">Frío</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProspectModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProspect}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isSavingProspect ? 'Guardando...' : 'Guardar en Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
