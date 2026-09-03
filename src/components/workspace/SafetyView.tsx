/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Safety & Clinical Boundaries Specification (/safety)
 */

import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Stethoscope, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface SafetyViewProps {
  setCurrentView?: (view: string) => void;
}

export const SafetyView: React.FC<SafetyViewProps> = ({ setCurrentView }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 text-left">
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border-primary)] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
            GOVERNANCE & RISK BOUNDARIES
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light italic text-[var(--text-primary)]">
            Clinical Safety & Ethical Policy
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono-code">
          <ShieldCheck className="w-4 h-4" />
          <span>ZERO-DIAGNOSTIC MANDATE</span>
        </div>
      </div>

      {/* Core Principle Callout */}
      <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-xs space-y-4">
        <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
          "Assisting Human Judgment, Never Replacing Physicians"
        </h3>
        <p className="font-newsreader text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          SAAHAJ is explicitly engineered as an interpretable health intelligence archive and decision-support tool. It computes mathematical factor attributions, structures unstructured documents, and grounds retrieved information in verified literature. It does not replace physicians, does not make autonomous diagnoses, and does not prescribe pharmaceuticals.
        </p>
      </div>

      {/* What SAAHAJ Does vs What It Does Not Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* What SAAHAJ Does */}
        <div className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-emerald-500/30 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-secondary)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
              What SAAHAJ Does
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 mt-2 shrink-0" />
              <span><strong>Extracts & Organizes:</strong> Parses PDF reports and lab panels into structured parameters with exact page bounding boxes.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 mt-2 shrink-0" />
              <span><strong>Calculates Calibrated Risk:</strong> Computes established peer-reviewed risk equations (ASCVD, Diabetes, FIB-4) with Brier-calibrated statistical intervals.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 mt-2 shrink-0" />
              <span><strong>Explains Feature Attribution:</strong> Uses local Shapley value approximations to show why specific markers influenced calculations.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 mt-2 shrink-0" />
              <span><strong>Structures Doctor Questions:</strong> Generates targeted discussion points for the patient's upcoming medical appointment.</span>
            </li>
          </ul>
        </div>

        {/* What SAAHAJ Does NOT Do */}
        <div className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-rose-500/30 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-secondary)]">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
              What SAAHAJ Does NOT Do
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-rose-500 mt-2 shrink-0" />
              <span><strong>No Clinical Diagnosis:</strong> Model outputs and statistical risk percentages are screening indicators, never diagnostic confirmations.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-rose-500 mt-2 shrink-0" />
              <span><strong>No Drug Prescribing:</strong> SAAHAJ never advises altering medication dosages or starting pharmaceutical regimens.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-rose-500 mt-2 shrink-0" />
              <span><strong>No Emergency Triage:</strong> In acute life-threatening situations (chest pain, stroke symptoms), contact emergency services immediately.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-rose-500 mt-2 shrink-0" />
              <span><strong>No Unvalidated Claims:</strong> No marketing claims of "FDA Approved", "100% Accuracy", or "Zero Hallucination" are permitted.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Uncertainty & Limitations Framework */}
      <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 shadow-xs">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-secondary)] block">
          METHODOLOGICAL LIMITATIONS
        </span>
        <h3 className="font-editorial text-2xl sm:text-3xl italic text-[var(--text-primary)]">
          Managing Diagnostic Uncertainty
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
            <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">1. Missing Variables</h4>
            <p>Statistical models require complete lipid, glycemic, and vascular profiles. SAAHAJ explicitly highlights omitted data and widens confidence intervals accordingly.</p>
          </div>
          <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
            <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">2. Population Drift</h4>
            <p>Pretrained risk algorithms (e.g. 2013 ACC/AHA ASCVD) can exhibit calibration shifts across diverse demographic groups. SAAHAJ surfaces population baseline ranges.</p>
          </div>
          <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
            <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">3. Multimodal Heatmaps</h4>
            <p>Grad-CAM saliency heatmaps indicate regions of high neural activation for radiological models (DenseNet-121). A heatmap is decision support, not proof.</p>
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      {setCurrentView && (
        <div className="flex items-center justify-between p-6 bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
          <div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">CONTINUE READING</span>
            <p className="font-editorial text-xl italic text-[var(--text-primary)]">Explore the Model Provenance & Registry</p>
          </div>
          <button
            onClick={() => setCurrentView('provenance')}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>View Models</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
