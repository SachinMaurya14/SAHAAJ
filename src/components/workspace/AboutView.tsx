/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ About View & Mission Statement (/about)
 */

import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Code2, 
  BookOpen, 
  Sparkles, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface AboutViewProps {
  setCurrentView?: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setCurrentView }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 text-left">
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border-primary)] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
            ORIGIN & ENGINEERING MANIFESTO
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light italic text-[var(--text-primary)]">
            About SAAHAJ
          </h1>
        </div>
        <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
          HUMAN-CENTERED HEALTH INTELLIGENCE
        </span>
      </div>

      {/* Origin Story */}
      <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-xs space-y-4">
        <h3 className="font-editorial text-2xl sm:text-3xl italic text-[var(--text-primary)]">
          "Saahaj" (सहज) — Natural, Intuitive, and Grounded
        </h3>
        <p className="font-newsreader text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          The name <em>SAAHAJ</em> stems from the ancient Sanskrit word signifying natural ease, clarity, and instinctive understanding. Healthcare data today is fractured across dense laboratory PDFs, impenetrable clinical jargon, and isolated hospital portals. SAAHAJ was created to transform this chaos into an elegant, grounded, and interpretable health archive for individuals and their doctors.
        </p>
      </div>

      {/* Engineering Principles */}
      <div className="space-y-6">
        <div className="border-b border-[var(--border-secondary)] pb-2">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--accent-secondary)]">
            ENGINEERING PRINCIPLES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-3">
            <div className="w-8 h-8 bg-[var(--surface-primary)] border border-[var(--border-secondary)] flex items-center justify-center text-[var(--accent-secondary)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-editorial text-xl italic text-[var(--text-primary)]">1. Zero Hallucination Policy</h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Every clinical assertion must have a verifiable bibliographic citation or bounding-box document anchor. Ungrounded claims are strictly suppressed.
            </p>
          </div>

          <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-3">
            <div className="w-8 h-8 bg-[var(--surface-primary)] border border-[var(--border-secondary)] flex items-center justify-center text-[var(--accent-secondary)]">
              <Code2 className="w-4 h-4" />
            </div>
            <h4 className="font-editorial text-xl italic text-[var(--text-primary)]">2. Deterministic Separation</h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Calculations are computed by validated peer-reviewed mathematical formulas (e.g. Pooled Cohort Equations, FIB-4), not probabilistic generative guesses.
            </p>
          </div>

          <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-3">
            <div className="w-8 h-8 bg-[var(--surface-primary)] border border-[var(--border-secondary)] flex items-center justify-center text-[var(--accent-secondary)]">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="font-editorial text-xl italic text-[var(--text-primary)]">3. Patient Dignity & Sovereignty</h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Patients own their data unconditionally. Complete export and instant cryptographic deletion are first-class, permanent primitives.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      {setCurrentView && (
        <div className="flex items-center justify-between p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
          <div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">GET STARTED</span>
            <p className="font-editorial text-xl italic text-[var(--text-primary)]">Enter the Health Workspace</p>
          </div>
          <button
            onClick={() => setCurrentView('app-overview')}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Open Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
