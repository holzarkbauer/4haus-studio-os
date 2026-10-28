import { useState, useEffect } from 'react';

// Landing Page (4haus.us)
import { LandingPage } from './components/LandingPage';

// Modals
import { BookingModal } from './components/BookingModal';
import { LivePreviewModal } from './components/LivePreviewModal';
import { DanielModal } from './components/DanielModal';
import { MusicBoxPlayer } from './components/MusicBoxPlayer';
import { ThemeModal } from './components/ThemeModal';
import { CalculatorModal } from './components/CalculatorModal';
import { ClockModal } from './components/ClockModal';
import { HaustoreModal } from './components/HaustoreModal';
import { BooksModal } from './components/BooksModal';
import { SpotifyModal } from './components/SpotifyModal';
import { PlansModal } from './components/PlansModal';
import { TeamDashboardModal } from './components/TeamDashboardModal';
import { NewsletterModal } from './components/NewsletterModal';
import { TutorialsModal } from './components/TutorialsModal';
import { AboutModal, AboutSubModalType } from './components/AboutModal';

// OS Studio Layout Components
import { AppSidebar } from './components/AppSidebar';
import { AppTopBar } from './components/AppTopBar';
import { DanielFloatingWidget } from './components/DanielFloatingWidget';
import { HomeWorkbench } from './components/HomeWorkbench';
import { GuidedMessage } from './components/GuidedPromptHero';
import { GrowthStepId } from './components/LeadNichoEngine';
import { ProjectPreloadPayload } from './types/leadNichoTypes';

import { Language, BackgroundTheme } from './types';
import { AVAILABLE_LANGUAGES } from './i18n/languages';
import { SpotifyProvider } from './context/SpotifyContext';
import { SpotifyMiniPlayer } from './components/SpotifyMiniPlayer';
import {
  initAuth,
  googleSignIn,
  logout,
} from './services/firebaseAuth';
import type { User } from 'firebase/auth';

function detectBrowserLanguage(): Language {
  const supported = AVAILABLE_LANGUAGES.map((l) => l.code as string);
  const preferred = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
  for (const tag of preferred) {
    const code = String(tag || '').toLowerCase().split('-')[0];
    if (supported.includes(code)) return code as Language;
  }
  return 'es';
}

export default function App() {
  // Idioma inicial según el navegador del visitante; si no está entre los disponibles, español.
  const [lang, setLang] = useState<Language>(() => detectBrowserLanguage());
  
  // Theme state: defaults to 'beach-waves'
  const [theme, setTheme] = useState<BackgroundTheme>('beach-waves');

  // Authenticated User State (Firebase Auth + Google Workspace)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign-Out error:', err);
    }
  };

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [previewState, setPreviewState] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: 'https://amooo-tienda.ai.studio',
    title: 'AMOOO Tienda — Live Client Build',
  });
  const [isDanielOpen, setIsDanielOpen] = useState(false);
  const [isMusicBoxOpen, setIsMusicBoxOpen] = useState(false);
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [isHaustoreOpen, setIsHaustoreOpen] = useState(false);
  const [isBooksOpen, setIsBooksOpen] = useState(false);

  // Studio OS Home Page & Modals state
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [topBarThemeMode, setTopBarThemeMode] = useState<'light' | 'dark'>('light');
  const [growthStep, setGrowthStep] = useState<GrowthStepId>('dashboard');
  const [preloadData, setPreloadData] = useState<ProjectPreloadPayload | null>(null);
  const [guidedMessages, setGuidedMessages] = useState<GuidedMessage[]>([]);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState<boolean>(false);
  const [teamDashboardState, setTeamDashboardState] = useState<{ isOpen: boolean; tab: any }>({
    isOpen: false,
    tab: 'dashboard',
  });
  const [isNewsletterOpen, setIsNewsletterOpen] = useState<boolean>(false);
  const [isTutorialsOpen, setIsTutorialsOpen] = useState<boolean>(false);
  const [aboutModalState, setAboutModalState] = useState<{ isOpen: boolean; tab: AboutSubModalType }>({
    isOpen: false,
    tab: null,
  });

  // Routing state between 4haus.us (Landing) and 4haus.us/app (Studio OS Workbench)
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/app') || hash === '#app') {
        return 'app';
      }
    }
    return 'landing';
  });

  const navigateToApp = () => {
    setCurrentRoute('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (window.location.pathname !== '/app') {
        window.history.pushState({ route: 'app' }, '', '/app');
      }
    } catch {
      window.location.hash = '#app';
    }
  };

  const navigateToLanding = () => {
    setCurrentRoute('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (window.location.pathname !== '/') {
        window.history.pushState({ route: 'landing' }, '', '/');
      }
    } catch {
      window.location.hash = '';
    }
  };

  // Synchronize browser popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/app') || hash === '#app') {
        setCurrentRoute('app');
      } else {
        setCurrentRoute('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle URL hashes directly mapping to modals or tools
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['about', 'contact', 'founder', 'cases', 'social'].includes(hash)) {
        const subTab = hash === 'about' ? null : (hash as AboutSubModalType);
        setAboutModalState({ isOpen: true, tab: subTab });
      } else if (hash === 'plans') {
        setIsPlansModalOpen(true);
      } else if (hash === 'team') {
        setTeamDashboardState({ isOpen: true, tab: 'dashboard' });
      } else if (hash === 'tutorials') {
        setIsTutorialsOpen(true);
      } else if (hash === 'newsletter') {
        setIsNewsletterOpen(true);
      } else if (hash === 'booking') {
        setIsBookingOpen(true);
      } else if (hash === 'app') {
        setCurrentRoute('app');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Synchronize dark mode class to root document & body across the entire application
  useEffect(() => {
    if (topBarThemeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#F5F5F7';
    }
  }, [topBarThemeMode]);

  // Document Title update
  useEffect(() => {
    if (currentRoute === 'landing') {
      document.title = "4haus Studio — Páginas Web, Agentes de IA y Sistemas para Empresas";
    } else {
      document.title = lang === 'en' 
        ? "4haus Studio (/app) — AI Operating System, Automation, Design & Growth" 
        : "4haus Studio (/app) — Sistema Operativo de IA, Automatización, Diseño y Crecimiento";
    }
  }, [lang, currentRoute]);

  const handleOpenLivePreview = (url: string, title: string) => {
    setPreviewState({
      isOpen: true,
      url,
      title,
    });
  };

  const handleCloseLivePreview = () => {
    setPreviewState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <SpotifyProvider>
      <div className="relative min-h-screen bg-transparent selection:bg-white selection:text-black overflow-x-hidden">
        
        {/* Render either 4haus.us (Landing) or 4haus.us/app (Studio OS Workbench) */}
        {currentRoute === 'landing' ? (
          <LandingPage
            lang={lang}
            onSetLang={setLang}
            themeMode={topBarThemeMode}
            onToggleThemeMode={() => setTopBarThemeMode(topBarThemeMode === 'light' ? 'dark' : 'light')}
            onOpenApp={navigateToApp}
            onOpenPlans={() => setIsPlansModalOpen(true)}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenAboutModal={(tab) => setAboutModalState({ isOpen: true, tab: tab || null })}
          />
        ) : (
          <main className="relative z-10 min-h-screen">
            <div className={`animate-in fade-in duration-300 min-h-screen transition-colors ${
              topBarThemeMode === 'dark' ? 'bg-black text-white' : 'bg-white text-zinc-900'
            }`}>
              <div className="flex min-h-screen relative">
                
                {/* Deployable Left Menu (Opens when clicking the 3-line menu icon) */}
                <AppSidebar
                  themeMode={topBarThemeMode}
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  activeItem={activeSidebarItem}
                  onSelectItem={(item) => {
                    setActiveSidebarItem(item);
                    setIsSidebarOpen(false);
                  }}
                  lang={lang}
                  onOpenPlans={() => {
                    setIsPlansModalOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  onOpenTeamDashboard={(tab) => {
                    setTeamDashboardState({ isOpen: true, tab: tab || 'dashboard' });
                    setIsSidebarOpen(false);
                  }}
                  onOpenNewsletter={() => {
                    setIsNewsletterOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  onOpenTutorials={() => {
                    setIsTutorialsOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  onOpenAboutModal={(tab) => {
                    setAboutModalState({ isOpen: true, tab });
                    setIsSidebarOpen(false);
                  }}
                />

                {/* Main Content Area: Full Screen Width (100% viewport width) */}
                <div className="flex-1 flex flex-col min-w-0 w-full transition-all duration-300">
                  {/* Top Bar: 3-line menu button on left + Light/Dark mode, Language selector, Discord link, My Team + 4haus.us link */}
                  <AppTopBar
                    themeMode={topBarThemeMode}
                    onToggleThemeMode={() => setTopBarThemeMode(topBarThemeMode === 'light' ? 'dark' : 'light')}
                    lang={lang}
                    onSetLang={setLang}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onOpenTeamModal={() => setTeamDashboardState({ isOpen: true, tab: 'dashboard' })}
                    onOpenPlans={() => setIsPlansModalOpen(true)}
                    onOpenSupport={() => setAboutModalState({ isOpen: true, tab: 'contact' })}
                    onOpenTutorials={() => setIsTutorialsOpen(true)}
                    onNavigate={(id) => setActiveSidebarItem(id)}
                    activeItem={activeSidebarItem}
                    onNavigateToLanding={navigateToLanding}
                    currentUser={currentUser}
                    isLoggingIn={isLoggingIn}
                    onGoogleLogin={handleGoogleLogin}
                    onGoogleLogout={handleLogout}
                  />

                  {/* Workbench Workspace with Dynamic Background (White vs Black) & Daniel on the right */}
                  <HomeWorkbench
                    themeMode={topBarThemeMode}
                    lang={lang}
                    activeSidebarItem={activeSidebarItem}
                    onSelectSidebarItem={(id) => setActiveSidebarItem(id)}
                    onOpenLivePreview={handleOpenLivePreview}
                    onOpenDanielModal={() => setIsDanielOpen(true)}
                    onOpenMusicBox={() => setIsMusicBoxOpen(true)}
                    onOpenSpotify={() => setIsSpotifyOpen(true)}
                    onOpenThemeModal={() => setIsThemeOpen(true)}
                    onOpenCalculatorModal={() => setIsCalculatorOpen(true)}
                    onOpenClockModal={() => setIsClockOpen(true)}
                    onOpenHaustoreModal={() => setIsHaustoreOpen(true)}
                    onOpenBooksModal={() => setIsBooksOpen(true)}
                    onOpenPlans={() => setIsPlansModalOpen(true)}
                    onOpenTeamDashboard={(tab) => setTeamDashboardState({ isOpen: true, tab: tab || 'dashboard' })}
                    onOpenNewsletter={() => setIsNewsletterOpen(true)}
                    onOpenTutorials={() => setIsTutorialsOpen(true)}
                    onOpenBooking={() => setIsBookingOpen(true)}
                    userId={currentUser?.uid || null}
                    userEmail={currentUser?.email || null}
                    userName={currentUser?.displayName || null}
                    currentUser={currentUser}
                    isLoggingIn={isLoggingIn}
                    onGoogleLogin={handleGoogleLogin}
                    onLogout={handleLogout}
                    growthStep={growthStep}
                    onSelectGrowthStep={(step) => setGrowthStep(step)}
                    preloadData={preloadData}
                    onUpdatePreloadData={(data) => setPreloadData({ ...data })}
                    guidedMessages={guidedMessages}
                    onUpdateGuidedMessages={setGuidedMessages}
                  />
                </div>

              </div>

              {/* Bottom Right: Unified Daniel 1.0 + Growth & Niche Strategy Co-Pilot available across all sections */}
              <DanielFloatingWidget
                lang={lang}
                activeSection={activeSidebarItem}
                activeGrowthStep={growthStep}
                userId={currentUser?.uid || null}
                messages={guidedMessages}
                onUpdateMessages={setGuidedMessages}
                onApplyStrategyChanges={(incomingPreload, targetSidebarItem, targetGrowthStep) => {
                  setPreloadData((prev) => ({ ...(prev || {}), ...incomingPreload }));
                  if (targetGrowthStep) {
                    setGrowthStep(targetGrowthStep);
                  }
                  if (targetSidebarItem) {
                    setActiveSidebarItem(targetSidebarItem);
                  }
                }}
                onOpenFullModal={() => setIsDanielOpen(true)}
                onOpenSpotify={() => setIsSpotifyOpen(true)}
              />
            </div>
          </main>
        )}

        {/* Interactive Modals */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          lang={lang}
        />

        <LivePreviewModal
          isOpen={previewState.isOpen}
          onClose={handleCloseLivePreview}
          url={previewState.url}
          title={previewState.title}
          lang={lang}
        />

        {/* Daniel AI Modal with Knight Rider K.I.T.T. Voice & Red LED Scanner */}
        <DanielModal
          isOpen={isDanielOpen}
          onClose={() => setIsDanielOpen(false)}
          onOpenBooking={() => setIsBookingOpen(true)}
          lang={lang}
        />

        <MusicBoxPlayer
          isOpen={isMusicBoxOpen}
          onClose={() => setIsMusicBoxOpen(false)}
          lang={lang}
        />

        {/* Background & Wallpapers Theme Switcher Modal */}
        <ThemeModal
          isOpen={isThemeOpen}
          onClose={() => setIsThemeOpen(false)}
          lang={lang}
          currentTheme={theme}
          onSelectTheme={(newTheme) => setTheme(newTheme)}
        />

        {/* Automation ROI Calculator Modal */}
        <CalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          lang={lang}
          onOpenBooking={() => setIsBookingOpen(true)}
        />

        {/* Live World Clock & Speed Stopwatch Modal */}
        <ClockModal
          isOpen={isClockOpen}
          onClose={() => setIsClockOpen(false)}
          lang={lang}
        />

        {/* 4haustore App Store Modal */}
        <HaustoreModal
          isOpen={isHaustoreOpen}
          onClose={() => setIsHaustoreOpen(false)}
          lang={lang}
          onOpenBooking={() => setIsBookingOpen(true)}
          onOpenLivePreview={handleOpenLivePreview}
        />

        {/* Books & Reading Library Modal */}
        <BooksModal
          isOpen={isBooksOpen}
          onClose={() => setIsBooksOpen(false)}
          lang={lang}
        />

        {/* Dedicated Real Spotify Audio Hub Modal */}
        <SpotifyModal
          isOpen={isSpotifyOpen}
          onClose={() => setIsSpotifyOpen(false)}
          lang={lang}
        />

        {/* Plus / Pro Subscription Plans Modal */}
        <PlansModal
          isOpen={isPlansModalOpen}
          onClose={() => setIsPlansModalOpen(false)}
          lang={lang}
        />

        {/* Team Configuration Dashboard Modal */}
        <TeamDashboardModal
          isOpen={teamDashboardState.isOpen}
          onClose={() => setTeamDashboardState({ ...teamDashboardState, isOpen: false })}
          initialTab={teamDashboardState.tab}
          lang={lang}
          onOpenPlans={() => {
            setTeamDashboardState({ ...teamDashboardState, isOpen: false });
            setIsPlansModalOpen(true);
          }}
        />

        {/* Platform Newsletter Modal */}
        <NewsletterModal
          isOpen={isNewsletterOpen}
          onClose={() => setIsNewsletterOpen(false)}
          lang={lang}
        />

        {/* Monthly Suggested Tutorials Masterclass Modal */}
        <TutorialsModal
          isOpen={isTutorialsOpen}
          onClose={() => setIsTutorialsOpen(false)}
          lang={lang}
        />

        {/* ABOUT Modal with 4 sub-sections: Redes Sociales, Case Studies, About Founder, Contact Us */}
        <AboutModal
          isOpen={aboutModalState.isOpen}
          onClose={() => setAboutModalState({ ...aboutModalState, isOpen: false })}
          initialTab={aboutModalState.tab}
          lang={lang}
          onOpenBooking={() => {
            setAboutModalState({ ...aboutModalState, isOpen: false });
            setIsBookingOpen(true);
          }}
          onOpenLivePreview={handleOpenLivePreview}
        />

        {/* Persistent Spotify Mini-Player Floating Bar */}
        <SpotifyMiniPlayer
          lang={lang}
          onOpenSpotify={() => setIsSpotifyOpen(true)}
        />

      </div>
    </SpotifyProvider>
  );
}
