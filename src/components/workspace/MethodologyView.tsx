/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Methodology & Technical Pipeline Specification (/methodology)
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Database, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  LineChart,
  Eye,
  FileCode2
} from 'lucide-react';

interface MethodologyViewProps {
  setCurrentView?: (view: string) => void;
}

export const MethodologyView: React.FC<MethodologyViewProps> = ({ setCurrentView }) => {
  const [activeTab, setActiveTab] = useState<'nlp' | 'rag' | 'ml' | 'cv' | 'clinician'>('nlp');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 text-left">
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border-primary)] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
            SCIENTIFIC REPRODUCIBILITY & ARCHITECTURE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light italic text-[var(--text-primary)]">
            System Methodology & Algorithms
          </h1>
        </div>
        <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
          PEER-REVIEWED & DETERMINISTIC
        </span>
      </div>

      {/* Interactive Architecture Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-[var(--border-secondary)] pb-3">
        {[
          { id: 'nlp', label: '1. Clinical BioNLP', icon: Database },
          { id: 'rag', label: '2. Hybrid Grounding (RAG)', icon: BookOpen },
          { id: 'ml', label: '3. Calibrated Tabular ML', icon: Cpu },
          { id: 'cv', label: '4. Deep Radiology & Grad-CAM', icon: Eye },
          { id: 'clinician', label: '5. Clinician SOAP Engine', icon: Sparkles },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 text-left border transition-all cursor-pointer flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider ${
                isActive
                  ? 'bg-[var(--surface-primary)] border-[var(--text-primary)] text-[var(--text-primary)] shadow-xs'
                  : 'bg-[var(--surface-secondary)] border-[var(--border-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Clinical BioNLP */}
      {activeTab === 'nlp' && (
        <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
              MODULE 01
            </span>
            <h2 className="font-editorial text-3xl italic text-[var(--text-primary)]">
              Deterministic Entity Extraction & BioNLP
            </h2>
          </div>
          <p className="font-newsreader text-lg text-[var(--text-secondary)] leading-relaxed">
            Extracts biomarkers, reference intervals, quantitative values, units, and anatomical targets with precise document bounding coordinates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs sm:text-sm">
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">Negation Detection (NegEx)</h4>
              <p className="text-[var(--text-secondary)]">Identifies clinical negation boundaries (e.g. "no evidence of consolidation", "denies chest pain") to eliminate false-positive extractions.</p>
            </div>
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">Temporal Disambiguation</h4>
              <p className="text-[var(--text-secondary)]">Distinguishes historic medical conditions from acute complaints, organizing facts into chronological intervals.</p>
            </div>
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">Unit Normalization</h4>
              <p className="text-[var(--text-secondary)]">Converts laboratory units (e.g. mg/dL vs mmol/L for glucose and cholesterol) into standard physiological SI representations.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hybrid Grounding (RAG) */}
      {activeTab === 'rag' && (
        <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
              MODULE 02
            </span>
            <h2 className="font-editorial text-3xl italic text-[var(--text-primary)]">
              Hybrid Retrieval-Augmented Grounding (RAG)
            </h2>
          </div>
          <p className="font-newsreader text-lg text-[var(--text-secondary)] leading-relaxed">
            Combines dense semantic vector retrieval (Cosine Distance) with sparse keyword matching (BM25) and Reciprocal Rank Fusion (RRF) to eliminate hallucinations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs sm:text-sm">
            <div className="p-5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-xl italic text-[var(--text-primary)]">1. Reciprocal Rank Fusion (RRF)</h4>
              <p className="text-[var(--text-secondary)]">Formula: <code>Score = 0.6 * Dense_Rank + 0.4 * BM25_Rank</code>. Ensures exact numerical matches (e.g. "HbA1c 6.4%") are retrieved alongside semantic clinical concepts.</p>
            </div>
            <div className="p-5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-xl italic text-[var(--text-primary)]">2. Citation Verification Engine</h4>
              <p className="text-[var(--text-secondary)]">Every generated sentence is audited against source chunk spans. If a statement cannot be grounded in source records, it is flagged as unverified.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Calibrated Tabular ML */}
      {activeTab === 'ml' && (
        <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
              MODULE 03
            </span>
            <h2 className="font-editorial text-3xl italic text-[var(--text-primary)]">
              Calibrated Tabular Risk Modeling & Explainability
            </h2>
          </div>
          <p className="font-newsreader text-lg text-[var(--text-secondary)] leading-relaxed">
            Implements validated cardiovascular (ASCVD), glycemic (Type-2 Diabetes), and hepatic (FIB-4) risk screening with local Shapley feature attribution.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs sm:text-sm">
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">ASCVD 10-Year Risk</h4>
              <p className="text-[var(--text-secondary)]">2013 ACC/AHA Pooled Cohort Equations calculating 10-year risk of atherosclerotic cardiovascular events from age, sex, BP, and lipids.</p>
            </div>
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">Type-2 Diabetes Risk</h4>
              <p className="text-[var(--text-secondary)]">ADA Risk Scoring framework integrating BMI, age, fasting glucose, family history, and physical activity levels.</p>
            </div>
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
              <h4 className="font-editorial text-lg italic text-[var(--text-primary)]">SHAP Feature Attribution</h4>
              <p className="text-[var(--text-secondary)]">Calculates exact positive and negative factor weights, explaining to patients and clinicians which biometrics drove the estimate.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Deep Radiology & Grad-CAM */}
      {activeTab === 'cv' && (
        <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
              MODULE 04
            </span>
            <h2 className="font-editorial text-3xl italic text-[var(--text-primary)]">
              Convolutional Deep Learning (DenseNet-121) & Saliency
            </h2>
          </div>
          <p className="font-newsreader text-lg text-[var(--text-secondary)] leading-relaxed">
            14-pathology radiological multi-label classification trained on CheXNet/ChestX-ray14 architecture, coupled with Gradient-weighted Class Activation Mapping (Grad-CAM).
          </p>

          <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-3 text-xs sm:text-sm">
            <h4 className="font-editorial text-xl italic text-[var(--text-primary)]">Grad-CAM Mathematical Formulation</h4>
            <p className="text-[var(--text-secondary)]">
              Target class gradients are backpropagated into the final convolutional feature maps (<code>conv5_block16_concat</code>), generating a 2D activation heatmap that highlights anatomical regions of interest (e.g. lower lobe consolidation or cardiomegaly).
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Clinician SOAP Engine */}
      {activeTab === 'clinician' && (
        <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
              MODULE 05
            </span>
            <h2 className="font-editorial text-3xl italic text-[var(--text-primary)]">
              Human-in-the-Loop Clinician SOAP & Consultation Synthesis
            </h2>
          </div>
          <p className="font-newsreader text-lg text-[var(--text-secondary)] leading-relaxed">
            Converts longitudinal records into structured Subjective, Objective, Assessment, and Plan drafts for physician review, editing, and approval before patient distribution.
          </p>
        </div>
      )}

      {/* Navigation CTA */}
      {setCurrentView && (
        <div className="flex items-center justify-between p-6 bg-[var(--surface-secondary)] border border-[var(--border-primary)]">
          <div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">SYSTEM BLUEPRINTS</span>
            <p className="font-editorial text-xl italic text-[var(--text-primary)]">Review Full Technical Architecture</p>
          </div>
          <button
            onClick={() => setCurrentView('architecture')}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>View Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
