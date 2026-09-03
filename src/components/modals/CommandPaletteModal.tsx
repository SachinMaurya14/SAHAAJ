import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Activity, 
  Eye, 
  Clock, 
  Calendar, 
  Stethoscope, 
  ShieldAlert, 
  ArrowRight, 
  X,
  Sparkles,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { sampleMedicalDocuments, sampleRiskModels, sampleImageStudies } from '../../data/mockHealthData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  setCurrentView?: (view: string) => void;
  setUserRole?: (role: any) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  setCurrentView,
  setUserRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (setCurrentView) {
      setCurrentView(view);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'app-health-input', label: 'Health Input Engine (Biometrics & Lifestyle)', icon: Activity, category: 'Input Engine' },
    { id: 'app-risk-assessment', label: 'Cardiovascular & Diabetes Risk Screening (SHAP)', icon: ShieldAlert, category: 'Risk Models' },
    { id: 'app-health-factors', label: 'Factor Map & Biological Fact Sheets', icon: Sparkles, category: 'Physiology' },
    { id: 'app-health-story', label: 'Why Did My Risk Change? (Longitudinal Story)', icon: TrendingUp, category: 'Trajectory' },
    { id: 'app-report-viewer', label: 'View Latest Lab Panel (Aug 2026 Split-View)', icon: FileText, category: 'Reports' },
    { id: 'app-compare', label: 'Compare My Reports (Jan vs Aug Trajectory)', icon: TrendingUp, category: 'Comparison' },
    { id: 'app-imaging', label: 'Chest Radiograph & Grad-CAM Heatmap', icon: Eye, category: 'Imaging' },
    { id: 'app-appointment-prep', label: 'Prepare for Upcoming Doctor Consultation', icon: Calendar, category: 'Clinical Bridge' },
    { id: 'app-timeline', label: 'Longitudinal Health Timeline Explorer', icon: Clock, category: 'Timeline' },
    { id: 'app-clinician', label: 'Clinician Assistant & SOAP Synthesis', icon: Stethoscope, category: 'Clinician' },
    { id: 'safety', label: 'Clinical Safety & Boundaries Policy', icon: ShieldAlert, category: 'Governance' },
    { id: 'methodology', label: 'Methodology & Scientific Pipeline', icon: FileCheck2, category: 'Methodology' },
    { id: 'ai-transparency', label: 'AI Transparency & Model Roles', icon: Sparkles, category: 'AI & Models' },
    { id: 'architecture', label: 'Full-Stack Technical Architecture', icon: FileText, category: 'Architecture' },
    { id: 'case-study', label: 'Clinical Case Study (Patient 58M)', icon: FileText, category: 'Case Study' },
    { id: 'about', label: 'About SAAHAJ & Engineering Manifesto', icon: FileText, category: 'Origin' },
    { id: 'provenance', label: 'Model Provenance & Calibration Registry', icon: ShieldAlert, category: 'Audit' },
    { id: 'evaluation', label: 'Observability & Live Evaluation Telemetry', icon: Activity, category: 'Observability' },
  ];

  const filteredActions = quickActions.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#1A1A1A]/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#1A1916] shadow-2xl border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-5 py-4 border-b border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 gap-3 bg-[#F5F2ED] dark:bg-[#201E1A]">
          <Search className="w-4 h-4 text-[#A38D7D] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search biomarkers (HbA1c, LDL), clinical records, or folios..."
            className="w-full bg-transparent text-sm sm:text-base text-[#1A1A1A] dark:text-[#EAE5DD] placeholder-[#1A1A1A]/40 dark:placeholder-[#EAE5DD]/40 focus:outline-none font-newsreader italic"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="p-1 border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:bg-[#ECE8E1] dark:hover:bg-[#282622]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-1 bg-[#FFFFFF] dark:bg-[#1A1916]">
          <div className="px-3 py-1.5 text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
            Folio Directory & Clinical Modules
          </div>

          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-sm font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              No matching records or modules located for "{searchQuery}".
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    navigateTo(action.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-[#F5F2ED] dark:hover:bg-[#22201C] text-left transition-colors group cursor-pointer border border-transparent hover:border-[#1A1A1A]/10 dark:hover:border-[#EAE5DD]/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-editorial italic text-[#1A1A1A] dark:text-[#EAE5DD] group-hover:underline underline-offset-2">
                        {action.label}
                      </p>
                      <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#A38D7D]">
                        {action.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 group-hover:text-[#1A1A1A] dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-2.5 bg-[#F5F2ED] dark:bg-[#201E1A] border-t border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 flex items-center justify-between text-[10px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 font-mono-code uppercase tracking-wider">
          <span>Navigate with mouse or arrow keys</span>
          <div className="flex items-center gap-2">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
