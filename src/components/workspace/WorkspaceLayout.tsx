import React from 'react';
import { 
  Activity, 
  FileText, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Eye, 
  Calendar, 
  User, 
  Stethoscope, 
  BookOpen, 
  Lock, 
  Sparkles, 
  HelpCircle,
  FolderOpen,
  ChevronRight,
  ShieldCheck,
  Sliders,
  GitBranch
} from 'lucide-react';
import { UserRole } from '../../types';

interface WorkspaceLayoutProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: UserRole;
  children: React.ReactNode;
  onOpenAskAssistant: () => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  currentView,
  setCurrentView,
  userRole,
  children,
  onOpenAskAssistant
}) => {
  const patientNavItems = [
    { id: 'app-overview', label: 'Health Overview', icon: Activity, badge: '01' },
    { id: 'app-health-input', label: 'Health Input Engine', icon: Sliders, badge: 'New' },
    { id: 'app-health-factors', label: 'Factor Map & Biology', icon: GitBranch, badge: 'Knowledge' },
    { id: 'app-health-story', label: 'Longitudinal Health Story', icon: TrendingUp, badge: 'Why Risk?' },
    { id: 'app-profile', label: 'Health Profile', icon: User, badge: '02' },
    { id: 'app-records', label: 'Records Archive', icon: FolderOpen, badge: '3 Docs' },
    { id: 'app-report-viewer', label: 'Report Split-Viewer', icon: FileText, badge: 'Grounding' },
    { id: 'app-compare', label: 'Biomarker Deltas', icon: TrendingUp, badge: 'Jan–Aug' },
    { id: 'app-timeline', label: 'Longitudinal Chronology', icon: Clock, badge: 'History' },
    { id: 'app-risk-assessment', label: 'Risk Model Suite', icon: ShieldAlert, badge: 'SHAP' },
    { id: 'app-imaging', label: 'Radiology & Grad-CAM', icon: Eye, badge: 'Visual ML' },
    { id: 'app-appointment-prep', label: 'Doctor Briefcase', icon: Calendar, badge: 'Consult' },
    { id: 'app-insights', label: 'Evidence Insights', icon: Sparkles, badge: 'Cited' },
    { id: 'app-education', label: 'Medical Lexicon', icon: BookOpen, badge: 'Lexicon' },
    { id: 'app-evaluation', label: 'AI Observability & Eval', icon: ShieldCheck, badge: 'V9 Gold' },
    { id: 'app-privacy', label: 'Cryptographic Vault', icon: Lock, badge: 'AES-256' },
  ];

  const clinicianNavItems = [
    { id: 'app-clinician', label: 'Clinical Briefing & SOAP', icon: Stethoscope, badge: 'EHR Export' },
    { id: 'app-health-input', label: 'Structured Ingest Engine', icon: Sliders, badge: 'Ingest' },
    { id: 'app-records', label: 'Patient Record Vault', icon: FolderOpen, badge: 'Archive' },
    { id: 'app-report-viewer', label: 'Structured OCR Ingest', icon: FileText, badge: 'Bounding' },
    { id: 'app-compare', label: 'Longitudinal Trajectory', icon: TrendingUp, badge: 'Deltas' },
    { id: 'app-risk-assessment', label: 'Predictive Screening', icon: ShieldAlert, badge: 'Calibrated' },
    { id: 'app-health-factors', label: 'Biological Knowledge Base', icon: GitBranch, badge: 'Physiology' },
    { id: 'app-imaging', label: 'Radiology Heatmaps', icon: Eye, badge: 'Grad-CAM' },
    { id: 'app-timeline', label: 'Timeline Chronology', icon: Clock, badge: 'Events' },
    { id: 'provenance', label: 'Model Provenance & Cards', icon: ShieldCheck, badge: 'Registry' },
    { id: 'app-evaluation', label: 'AI Observability & Eval', icon: ShieldCheck, badge: 'V9 Traces' },
    { id: 'app-privacy', label: 'Audit Trail & Telemetry', icon: Lock, badge: 'Logs' },
  ];

  const navList = userRole === 'clinician' ? clinicianNavItems : patientNavItems;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
      
      {/* Workspace Header Sub-Bar - Editorial Header Style */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-10 h-10 border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
            {userRole === 'clinician' ? <Stethoscope className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-editorial text-2xl sm:text-3xl italic text-[var(--text-primary)]">
                {userRole === 'clinician' ? 'Clinical Decision & Synthesis Folio' : 'Personal Health Archive & Intelligence'}
              </h1>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 border border-[var(--border-secondary)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                {userRole === 'clinician' ? 'Clinician Folio' : 'Patient Folio'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-newsreader mt-1 max-w-3xl">
              {userRole === 'clinician' 
                ? 'Structured biomarker extraction, tabular ML inference with Brier calibrations, and EHR-ready SOAP synthesis.' 
                : 'Deterministic laboratory grounded OCR, multi-month biomarker comparisons, and tailored physician consultation preparation.'}
            </p>
          </div>
        </div>

        {/* Ask SAAHAJ Assistant Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="ask-saahaj-btn"
            onClick={onOpenAskAssistant}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-[0.18em] bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 border border-[var(--border-primary)] transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Assistant</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Navigation Sidebar + Right Dynamic Main View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] p-4 space-y-2 shadow-xs">
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-[var(--border-secondary)] pb-2 mb-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
              {userRole === 'clinician' ? 'Clinical Sections' : 'Folio Modules'}
            </span>
            <span className="text-[9px] font-mono-code text-[var(--text-muted)]">
              {navList.length} APPS
            </span>
          </div>

          <nav className="space-y-1">
            {navList.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold border-l-2 border-[var(--text-primary)] pl-2.5 shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="truncate text-[12px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono-code px-1.5 py-0.5 border border-[var(--border-secondary)] bg-[var(--surface-secondary)] text-[var(--text-muted)] shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Ethical AI Guarantee Note */}
          <div className="pt-4 mt-4 border-t border-[var(--border-secondary)] px-2 pb-1">
            <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--accent-secondary)] mb-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Diagnostic Integrity</span>
            </div>
            <p className="text-[11px] font-newsreader italic text-[var(--text-muted)] leading-snug">
              Facts citation grounded in laboratory OCR. Machine predictions include statistical confidence intervals.
            </p>
          </div>
        </aside>

        {/* Dynamic Main Workspace Content */}
        <main className="lg:col-span-9 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
};
