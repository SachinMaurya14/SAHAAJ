/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ AI Transparency & Component Role Breakdown (/ai-transparency)
 */

import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  Layers, 
  Database, 
  Eye, 
  BookOpen, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface AITransparencyViewProps {
  setCurrentView?: (view: string) => void;
}

export const AITransparencyView: React.FC<AITransparencyViewProps> = ({ setCurrentView }) => {
  const components = [
    {
      name: "Large Language Model (Gemini 3.7 / 2.5)",
      role: "Synthesis & Plain-Language Translation",
      whatItDoes: "Translates complex medical terminology into clear patient-friendly analogies, formulates discussion questions, and assists in drafting clinical SOAP structures.",
      whatItNeverDoes: "Never performs ungrounded statistical risk calculation, never invents missing lab values, and never overrides deterministic extraction.",
      guardrails: "Strict temperature bounding (0.1-0.2), JSON response schemas, and multi-tier model fallback hierarchy."
    },
    {
      name: "Hybrid Grounding & RAG Engine",
      role: "Factual Integrity & Literature Retrieval",
      whatItDoes: "Retrieves exact document spans and peer-reviewed clinical knowledge bases using reciprocal rank fusion of BM25 and vector embeddings.",
      whatItNeverDoes: "Does not allow answers to be generated without verified citation anchors to the patient's records or medical consensus.",
      guardrails: "Citation reconciliation auditor, Cosine similarity thresholds (>0.75), and bounding-box provenance."
    },
    {
      name: "Clinical BioNLP Pipeline",
      role: "Deterministic Entity Extraction",
      whatItDoes: "Parses PDF reports, identifies lab parameters, units, reference intervals, temporal contexts, and negation states.",
      whatItNeverDoes: "Does not rely on probabilistic generative hallucinations for critical lab numbers.",
      guardrails: "RegEx validator, unit converter, and double-pass parsing rules."
    },
    {
      name: "Tabular Machine Learning Models",
      role: "Calibrated Statistical Screening",
      whatItDoes: "Computes ACC/AHA ASCVD 10-year risk, ADA Diabetes risk, and FIB-4 liver scores with SHAP factor weights.",
      whatItNeverDoes: "Does not make clinical diagnoses; outputs statistical probability distributions over calibrated populations.",
      guardrails: "Brier score calibration, PSI drift monitors, and missing data penalties."
    },
    {
      name: "Deep Radiological Vision (DenseNet-121)",
      role: "Pattern Recognition & Saliency Mapping",
      whatItDoes: "Screens chest radiographs for 14 radiological patterns and generates Grad-CAM heatmaps showing active anatomical regions.",
      whatItNeverDoes: "Does not replace radiologist overread; heatmaps represent model attention rather than conclusive pathology.",
      guardrails: "Threshold calibration curves, dice coefficient quality checks, and mandatory physician review banner."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 text-left">
      
      {/* Header */}
      <div className="border-b border-[var(--border-primary)] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
            EXPLAINABILITY & ROLE BOUNDARIES
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light italic text-[var(--text-primary)]">
            AI Transparency & Architecture Roles
          </h1>
        </div>
        <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
          NO BLACK-BOX ARTIFACTS
        </span>
      </div>

      <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-xs space-y-3">
        <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
          Which Engine Produces Which Result?
        </h3>
        <p className="font-newsreader text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          Generic AI tools blend search, generation, and inference into an opaque conversational interface. SAAHAJ strictly separates deterministic extraction, specialized mathematical models, and generative synthesis.
        </p>
      </div>

      <div className="space-y-6">
        {components.map((comp, idx) => (
          <div key={idx} className="p-6 sm:p-8 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--border-secondary)] pb-3">
              <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
                {comp.name}
              </h3>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
                {comp.role}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  What It Does
                </span>
                <p className="text-[var(--text-secondary)]">{comp.whatItDoes}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                  What It Never Does
                </span>
                <p className="text-[var(--text-secondary)]">{comp.whatItNeverDoes}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--text-primary)] block">
                  Engine Guardrails
                </span>
                <p className="text-[var(--text-secondary)]">{comp.guardrails}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation CTA */}
      {setCurrentView && (
        <div className="flex items-center justify-between p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
          <div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">PROVENANCE & AUDITING</span>
            <p className="font-editorial text-xl italic text-[var(--text-primary)]">View Model Cards & Calibration Metrics</p>
          </div>
          <button
            onClick={() => setCurrentView('provenance')}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Model Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
