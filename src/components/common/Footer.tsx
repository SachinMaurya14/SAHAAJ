import React from 'react';
import { Activity, ShieldCheck, FileCode2, Lock, HeartHandshake, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="bg-[var(--surface-secondary)] border-t border-[var(--border-primary)] pt-16 pb-12 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Core Clinical Safety Statement Banner - Editorial Style */}
        <div className="p-6 sm:p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] mb-14 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-3 border border-[var(--border-primary)] text-[var(--text-primary)] shrink-0 bg-[var(--surface-secondary)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                  PROTOCOL 01 / CLINICAL BOUNDARIES
                </span>
                <span className="text-[9px] font-mono-code text-[var(--text-muted)]">REV 2026.8</span>
              </div>
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">
                Foundational Clinical Scope & Safety Policy
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                SAAHAJ is an intelligent archive and decision-support assistant engineered to help patients comprehend multifaceted biometric reports and assist clinicians in synthesizing longitudinal records. 
                <strong className="font-semibold text-[var(--text-primary)]"> SAAHAJ does not replace physicians, does not independently diagnose medical conditions, and does not prescribe therapies.</strong> In urgent scenarios, consult emergency medical services immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--border-secondary)]">
          
          {/* Masthead Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-editorial text-3xl font-light italic tracking-tight text-[var(--text-primary)]">
                SAAHAJ
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)]">
                Health Intelligence
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md leading-relaxed font-newsreader italic text-base">
              "To make complex health intelligence serene, grounded in verified diagnostic provenance, and shared seamlessly between patient and clinician."
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-mono-code text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[var(--border-secondary)] bg-[var(--surface-primary)] text-[var(--text-primary)]">
                <span className="w-1.5 h-1.5 bg-[var(--accent-secondary)]" />
                FOLIO V4.2 ACTIVE
              </span>
              <span>DETERMINISTIC OCR + CALIBRATED ML</span>
            </div>
          </div>

          {/* Nav: Patient Modules */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-sans font-bold text-[var(--text-primary)] uppercase tracking-[0.25em]">
              01 / Patient Suite
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <button onClick={() => setCurrentView('app-overview')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Health Overview
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-records')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Records Vault
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-compare')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Report Comparison
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-timeline')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Longitudinal Timeline
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-appointment-prep')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Doctor Briefcase
                </button>
              </li>
            </ul>
          </div>

          {/* Nav: Clinical & ML */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-sans font-bold text-[var(--text-primary)] uppercase tracking-[0.25em]">
              02 / Clinician & Models
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <button onClick={() => setCurrentView('app-clinician')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Physician Consultation View
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-risk-assessment')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Tabular Predictive Screening
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-imaging')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Imaging & Grad-CAM Heatmaps
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('provenance')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Model Provenance & Audits
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-insights')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Evidence-Linked Biomarkers
                </button>
              </li>
            </ul>
          </div>

          {/* Nav: Safety & Architecture */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-sans font-bold text-[var(--text-primary)] uppercase tracking-[0.25em]">
              03 / Governance & Architecture
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <button onClick={() => setCurrentView('safety')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Clinical Safety & Boundaries
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('methodology')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Methodology & Pipeline
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('ai-transparency')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  AI Transparency
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('architecture')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Technical Architecture
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('case-study')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Case Study (Patient 58M)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  About SAAHAJ
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-privacy')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Zero-Knowledge Privacy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('app-education')} className="hover:underline underline-offset-4 decoration-[#A38D7D] cursor-pointer">
                  Medical Literacy Lexicon
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Editorial Colophon */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono-code uppercase tracking-widest text-[var(--text-muted)]">
          <div>
            &copy; MMXXVI SAAHAJ &bull; HEALTH INTELLIGENCE &bull; ALL RIGHTS PRESERVED
          </div>
          <div className="flex items-center gap-6">
            <span>Deterministic Grounding</span>
            <span className="w-8 h-px bg-current opacity-30"></span>
            <span>Brier Calibrated ML</span>
            <span className="w-8 h-px bg-current opacity-30"></span>
            <span>Client-Side AES-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
