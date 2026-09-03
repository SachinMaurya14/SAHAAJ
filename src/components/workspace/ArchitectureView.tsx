/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Full-Stack Technical Architecture Blueprint (/architecture)
 */

import React from 'react';
import { 
  Layers, 
  Server, 
  Database, 
  Cpu, 
  Lock, 
  ShieldCheck, 
  Activity, 
  Cloud,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

interface ArchitectureViewProps {
  setCurrentView?: (view: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ setCurrentView }) => {
  const tiers = [
    {
      tier: "1. Edge & Client Layer",
      tech: "Vite + React 18 + Tailwind CSS + Three.js / WebGL + GSAP",
      desc: "Responsive, high-contrast light/dark client application with accessible ARIA tokens, client-side AES-256 zero-knowledge storage, and 3D biophysical interactive scenes with 2D fallbacks."
    },
    {
      tier: "2. API Gateway & Security Shield",
      tech: "Express / Reverse Proxy + CSP + Sliding Window Rate Limiting + CORS",
      desc: "Unified error shielding with trace_id correlation, strict object-level authorization (IDOR prevention), and security headers blocking clickjacking and script injection."
    },
    {
      tier: "3. Service & Inference Layer",
      tech: "TypeScript / Node.js Engine (FastAPI Spec Compatible)",
      desc: "Multi-modular service architecture containing Clinical BioNLP, Hybrid RAG (Dense + BM25), Calibrated Tabular Risk Ensembles (ASCVD/Diabetes/FIB-4), and DenseNet-121 Radiograph Grad-CAM Saliency mapping."
    },
    {
      tier: "4. Storage & Persistence Engine",
      tech: "PostgreSQL + pgvector + Private Object Storage + Redis Worker Queue",
      desc: "Isolated multi-tenant data storage enforcing user_id boundaries, vector cosine indexing for semantic chunks, and time-bound HMAC-SHA256 signed URLs for medical documents and DICOM scans."
    },
    {
      tier: "5. Observability & Quality Telemetry (V9)",
      tech: "OpenTelemetry Tracing + PSI Drift Monitors + Gold Safety Probes",
      desc: "End-to-end distributed request tracing, token economics monitoring, population stability index tracking, and automated safety regression suites."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 text-left">
      
      {/* Header */}
      <div className="border-b border-[var(--border-primary)] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[var(--accent-secondary)] block mb-1">
            PRODUCTION SYSTEM TOPOLOGY
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light italic text-[var(--text-primary)]">
            Full-Stack Technical Architecture
          </h1>
        </div>
        <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
          V10 PRODUCTION TOPOLOGY
        </span>
      </div>

      {/* Visual Flow Diagram */}
      <div className="p-8 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-sm space-y-6">
        <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">
          End-to-End System Topology
        </h3>

        <div className="space-y-4">
          {tiers.map((t, idx) => (
            <div key={idx} className="relative">
              <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-secondary)] pb-2">
                  <span className="text-xs font-mono-code font-bold text-[var(--accent-secondary)] uppercase">
                    {t.tier}
                  </span>
                  <span className="text-[11px] font-mono-code text-[var(--text-muted)]">
                    {t.tech}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  {t.desc}
                </p>
              </div>

              {idx < tiers.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-[var(--text-muted)] opacity-60" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Architectural Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
        <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
            <Lock className="w-4 h-4 text-[var(--accent-secondary)]" />
            <h4 className="font-editorial text-lg italic">Zero-Knowledge Isolation</h4>
          </div>
          <p className="text-[var(--text-secondary)]">Every database query, vector search, and file retrieval is scoped with explicit user_id authorization guards, preventing IDOR.</p>
        </div>

        <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
            <Activity className="w-4 h-4 text-[var(--accent-secondary)]" />
            <h4 className="font-editorial text-lg italic">Graceful Failure Modes</h4>
          </div>
          <p className="text-[var(--text-secondary)]">If cloud AI providers experience high demand, deterministic local extractors and calibrated statistical fallback engines seamlessly sustain operations.</p>
        </div>

        <div className="p-6 bg-[var(--surface-secondary)] border border-[var(--border-secondary)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-secondary)]" />
            <h4 className="font-editorial text-lg italic">OpenTelemetry Tracing</h4>
          </div>
          <p className="text-[var(--text-secondary)]">Every patient request receives a unique trace_id tracking component latencies, token consumption, and model versions.</p>
        </div>
      </div>

      {/* Navigation CTA */}
      {setCurrentView && (
        <div className="flex items-center justify-between p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
          <div>
            <span className="text-xs font-mono-code text-[var(--text-muted)]">SYSTEM EVALUATION</span>
            <p className="font-editorial text-xl italic text-[var(--text-primary)]">Inspect Real-Time Observability & Telemetry</p>
          </div>
          <button
            onClick={() => setCurrentView('evaluation')}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span>Evaluation Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
