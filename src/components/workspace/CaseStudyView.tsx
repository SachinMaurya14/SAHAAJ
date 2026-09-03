/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinical Case Study Specification (/case-study)
 * Demonstrates an end-to-end longitudinal health trajectory workflow using licensed, non-identifying demonstration data.
 */

import React from 'react';
import { 
  FileText, 
  Activity, 
  TrendingUp, 
  Eye, 
  Stethoscope, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface CaseStudyViewProps {
  setCurrentView?: (view: string) => void;
}

export const CaseStudyView: React.FC<CaseStudyViewProps> = ({ setCurrentView }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 text-left">
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border-primary)] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
            VERIFIED DEMONSTRATION WORKFLOW
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light italic text-[var(--text-primary)]">
            Clinical Case Study: Longitudinal Trajectory
          </h1>
        </div>
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono-code">
          <span>DEMONSTRATION DATASET (PATIENT-58M)</span>
        </div>
      </div>

      {/* Case Overview Summary */}
      <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
            PATIENT PROFILE: 58-YEAR-OLD MALE
          </span>
          <span className="text-xs font-mono-code text-[var(--text-muted)]">
            7-MONTH LONGITUDINAL INTERVAL (JAN 2026 &rarr; AUG 2026)
          </span>
        </div>
        <h3 className="font-editorial text-2xl sm:text-3xl italic text-[var(--text-primary)]">
          Early Cardiometabolic Trajectory & Radiological Screening
        </h3>
        <p className="font-newsreader text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          This case demonstrates how SAAHAJ takes raw multimodal inputs—a January 2026 baseline metabolic panel, an August 2026 follow-up panel, a chest radiograph, and patient symptom logs—and synthesizes them into actionable, evidence-linked insights for both the patient and the attending physician.
        </p>
      </div>

      {/* Trajectory Milestone Steps */}
      <div className="space-y-6">
        
        {/* Step 1: Ingestion & Baseline */}
        <div className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-secondary)]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-mono-code text-xs font-bold">1</div>
              <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
                January 2026: Baseline Laboratory Extraction
              </h3>
            </div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">DETERMINISTIC OCR</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            The patient uploads a 3-page comprehensive metabolic and lipid panel PDF. DeepDoc OCR extracts HbA1c (6.4% - Prediabetes), Total Cholesterol (224 mg/dL), LDL (148 mg/dL), and Blood Pressure (138/86 mmHg).
          </p>
          <div className="p-4 bg-[var(--surface-primary)] border border-[var(--border-secondary)] text-xs font-mono-code text-[var(--text-secondary)]">
            ASCVD 10-Year Baseline Risk: <strong>11.4% (Moderate)</strong> &bull; Primary Contributing Factor: LDL Particle Concentration (SHAP weight +0.38).
          </div>
        </div>

        {/* Step 2: Follow-up & Delta Comparison */}
        <div className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-secondary)]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-mono-code text-xs font-bold">2</div>
              <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
                August 2026: Longitudinal Trajectory Delta
              </h3>
            </div>
            <span className="text-xs font-mono-code text-amber-600 dark:text-amber-400">BIOMARKER DELTA</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            A repeat panel is ingested. SAAHAJ aligns biomarkers longitudinally: HbA1c increased from 6.4% to 6.8% (Crossing into diabetic threshold), LDL improved slightly from 148 to 136 mg/dL, and Systolic BP increased to 142 mmHg.
          </p>
          <div className="p-4 bg-[var(--surface-primary)] border border-[var(--border-secondary)] text-xs font-mono-code text-[var(--text-secondary)]">
            Recalibrated ASCVD Risk: <strong>14.2% (+2.8% delta)</strong> &bull; Risk Driver: Systolic Blood Pressure and Glycemic Trajectory.
          </div>
        </div>

        {/* Step 3: Chest Radiograph Grad-CAM */}
        <div className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-secondary)]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-mono-code text-xs font-bold">3</div>
              <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
                Medical Imaging: DenseNet-121 & Saliency Mapping
              </h3>
            </div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">GRAD-CAM ACTIVATION</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            The patient uploads a posteroanterior (PA) chest X-ray taken due to mild exertional shortness of breath. The radiological vision model detects mild cardiomegaly (probability 0.74). The Grad-CAM heatmap highlights enlargement along the left cardiac border, with no evidence of pleural effusion or focal consolidation.
          </p>
        </div>

        {/* Step 4: Clinician SOAP Briefing */}
        <div className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-secondary)]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-mono-code text-xs font-bold">4</div>
              <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
                Clinician Consultation Briefcase & Human-in-the-Loop Review
              </h3>
            </div>
            <span className="text-xs font-mono-code text-emerald-600 dark:text-emerald-400">SOAP READY</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            The attending physician enters the Clinician Workspace. SAAHAJ synthesizes an instant pre-consultation summary highlighting the HbA1c elevation to 6.8% and the 14.2% ASCVD estimate. The physician reviews the draft, adjusts the plan to recommend dietary lifestyle modifications and repeat glucose testing in 3 months, and approves the patient-facing summary.
          </p>
        </div>

      </div>

      {/* Navigation CTA */}
      {setCurrentView && (
        <div className="flex items-center justify-between p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
          <div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">TRY THIS WORKFLOW</span>
            <p className="font-editorial text-xl italic text-[var(--text-primary)]">Open Report Comparison & Trajectory Viewer</p>
          </div>
          <button
            onClick={() => setCurrentView('app-compare')}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Open Compare View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
