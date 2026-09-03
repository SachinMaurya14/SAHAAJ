/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { AskSaahajModal } from './components/modals/AskSaahajModal';
import { LandingPage } from './components/landing/LandingPage';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';

// Workspace Functional Views
import { HealthOverviewView } from './components/workspace/HealthOverviewView';
import { HealthInputView } from './components/workspace/HealthInputView';
import { HealthFactorMapView } from './components/workspace/HealthFactorMapView';
import { LongitudinalRiskAnalysisView } from './components/workspace/LongitudinalRiskAnalysisView';
import { HealthProfileView } from './components/workspace/HealthProfileView';
import { HealthRecordsView } from './components/workspace/HealthRecordsView';
import { MedicalReportViewerView } from './components/workspace/MedicalReportViewerView';
import { ReportComparisonView } from './components/workspace/ReportComparisonView';
import { HealthTimelineView } from './components/workspace/HealthTimelineView';
import { RiskAssessmentView } from './components/workspace/RiskAssessmentView';
import { MedicalImagingView } from './components/workspace/MedicalImagingView';
import { AppointmentPrepView } from './components/workspace/AppointmentPrepView';
import { HealthInsightsView } from './components/workspace/HealthInsightsView';
import { HealthEducationView } from './components/workspace/HealthEducationView';
import { ModelProvenanceView } from './components/workspace/ModelProvenanceView';
import { PrivacyCenterView } from './components/workspace/PrivacyCenterView';
import { ClinicianAssistantView } from './components/workspace/ClinicianAssistantView';
import { EvaluationDashboardView } from './components/workspace/EvaluationDashboardView';

// V10 Public & Governance Views
import { SafetyView } from './components/workspace/SafetyView';
import { MethodologyView } from './components/workspace/MethodologyView';
import { AITransparencyView } from './components/workspace/AITransparencyView';
import { ArchitectureView } from './components/workspace/ArchitectureView';
import { CaseStudyView } from './components/workspace/CaseStudyView';
import { AboutView } from './components/workspace/AboutView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HealthDataProvider } from './context/HealthDataContext';

import { UserRole, ThemeMode } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('patient');
  
  // Theme state with localStorage persistence ('light' | 'dark' | 'system')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saahaj_theme_mode') as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return 'dark';
  });

  const [isSystemDark, setIsSystemDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const isDarkMode = themeMode === 'system' ? isSystemDark : themeMode === 'dark';

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAskAssistantOpen, setIsAskAssistantOpen] = useState<boolean>(false);

  // System theme preference listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', updateSystemPreference);
    return () => mediaQuery.removeEventListener('change', updateSystemPreference);
  }, []);

  // Sync dark mode class and save to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Smooth performant transition flag
    document.documentElement.classList.add('theme-transition');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 200);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('saahaj_theme_mode', themeMode);

    return () => clearTimeout(timer);
  }, [isDarkMode, themeMode]);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSetTheme = (newMode: ThemeMode) => {
    setThemeMode(newMode);
  };

  const toggleDarkMode = () => {
    setThemeMode(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'clinician') {
      setCurrentView('app-clinician');
    } else if (currentView === 'app-clinician') {
      setCurrentView('app-overview');
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'app-overview':
        return <HealthOverviewView setCurrentView={setCurrentView} />;
      case 'app-health-input':
        return <HealthInputView setCurrentView={setCurrentView} />;
      case 'app-health-factors':
        return <HealthFactorMapView setCurrentView={setCurrentView} />;
      case 'app-health-story':
        return <LongitudinalRiskAnalysisView setCurrentView={setCurrentView} />;
      case 'app-profile':
        return <HealthProfileView />;
      case 'app-records':
        return <HealthRecordsView setCurrentView={setCurrentView} />;
      case 'app-report-viewer':
        return <MedicalReportViewerView setCurrentView={setCurrentView} />;
      case 'app-compare':
        return <ReportComparisonView setCurrentView={setCurrentView} />;
      case 'app-timeline':
        return <HealthTimelineView setCurrentView={setCurrentView} />;
      case 'app-risk-assessment':
        return <RiskAssessmentView setCurrentView={setCurrentView} />;
      case 'app-imaging':
        return <MedicalImagingView setCurrentView={setCurrentView} />;
      case 'app-appointment-prep':
        return <AppointmentPrepView />;
      case 'app-insights':
        return <HealthInsightsView setCurrentView={setCurrentView} />;
      case 'app-education':
        return <HealthEducationView />;
      case 'provenance':
        return <ModelProvenanceView />;
      case 'app-privacy':
        return <PrivacyCenterView />;
      case 'app-clinician':
        return <ClinicianAssistantView />;
      case 'app-evaluation':
      case 'evaluation':
        return <EvaluationDashboardView setCurrentView={setCurrentView} />;
      
      // V10 Governance & Portfolio Views
      case 'safety':
        return <SafetyView setCurrentView={setCurrentView} />;
      case 'methodology':
        return <MethodologyView setCurrentView={setCurrentView} />;
      case 'ai-transparency':
        return <AITransparencyView setCurrentView={setCurrentView} />;
      case 'architecture':
      case 'how-it-works':
        return <ArchitectureView setCurrentView={setCurrentView} />;
      case 'case-study':
        return <CaseStudyView setCurrentView={setCurrentView} />;
      case 'about':
        return <AboutView setCurrentView={setCurrentView} />;

      default:
        return <HealthOverviewView setCurrentView={setCurrentView} />;
    }
  };

  return (
    <HealthDataProvider>
      <div className="min-h-[100dvh] w-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased transition-colors duration-200 selection:bg-[#A38D7D] selection:text-white">
        
        {/* Top Main Navigation Header */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          userRole={userRole}
          setUserRole={handleRoleChange}
          theme={themeMode}
          setTheme={handleSetTheme}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Main View Area with Error Boundary Protection */}
        <div className="flex-1 w-full">
          <ErrorBoundary fallbackTitle="View Failed to Render">
            {currentView === 'landing' ? (
              <LandingPage
                setCurrentView={setCurrentView}
                userRole={userRole}
                setUserRole={handleRoleChange}
                theme={themeMode}
              />
            ) : (
              <WorkspaceLayout
                currentView={currentView}
                setCurrentView={setCurrentView}
                userRole={userRole}
                onOpenAskAssistant={() => setIsAskAssistantOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    {renderActiveView()}
                  </motion.div>
                </AnimatePresence>
              </WorkspaceLayout>
            )}
          </ErrorBoundary>
        </div>

        {/* Global Clinical & Technical Footer */}
        <Footer setCurrentView={setCurrentView} />

        {/* Command Palette Modal (Cmd+K) */}
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(view) => setCurrentView(view)}
          setCurrentView={setCurrentView}
          setUserRole={handleRoleChange}
        />

        {/* Grounded "Ask SAAHAJ" Health Intelligence Assistant Modal */}
        <AskSaahajModal
          isOpen={isAskAssistantOpen}
          onClose={() => setIsAskAssistantOpen(false)}
          setCurrentView={setCurrentView}
        />

      </div>
    </HealthDataProvider>
  );
}
