import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Eye, 
  FileText, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  Activity
} from 'lucide-react';
import { sampleRiskModels } from '../../data/mockHealthData';

export const ModelProvenanceView: React.FC = () => {
  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              GOVERNANCE & MODEL AUDITS
            </span>
            <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; Calibrated Transparency</span>
          </div>
          <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Model Provenance, Architectures & Calibration Audits
          </h2>
          <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Transparent documentation of optical character recognition, tabular risk regressors, computer vision saliency layers, and grounded LLM synthesis.
          </p>
        </div>
      </div>

      {/* 4 Pipeline Tier Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tier 1: OCR & Extraction */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#A38D7D]" />
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Tier 1: Document OCR & Layout
              </h3>
            </div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
              v4.2-Prod
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
            <p><strong>Engine:</strong> DeepDoc-Medical Multi-Modal OCR</p>
            <p><strong>Ontology:</strong> LOINC, SNOMED-CT, UCUM units</p>
            <p><strong>Bounding Box Accuracy:</strong> 98.2% on synthetic & scanned lab panels</p>
            <p><strong>Failure Mode:</strong> Unparsed lines flagged as "Needs Review"</p>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            Extracts exact values, reference boundaries, and page provenance before any downstream semantic processing occurs.
          </div>
        </div>

        {/* Tier 2: Tabular Risk Regression */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#A38D7D]" />
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Tier 2: Tabular ML Risk Models
              </h3>
            </div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
              6 Ensembles
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
            <p><strong>Architectures:</strong> XGBoost, Random Forest, Logistic Regressor</p>
            <p><strong>Calibration:</strong> Platt Scaling + Isotonic Regression</p>
            <p><strong>Explainability:</strong> TreeSHAP feature attribution per inference</p>
            <p><strong>Validation:</strong> Framingham, NHANES, UK Biobank cohorts</p>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            Estimates statistical likelihood bands. Never outputs binary disease diagnoses or uncalibrated probabilities.
          </div>
        </div>

        {/* Tier 3: Computer Vision & Grad-CAM */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#A38D7D]" />
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Tier 3: Vision Deep Learning
              </h3>
            </div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
              DenseNet-121
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
            <p><strong>Backbone:</strong> DenseNet-121 Pre-trained on CheXpert & MIMIC-CXR</p>
            <p><strong>Explainability:</strong> Gradient-weighted Class Activation Mapping (Grad-CAM)</p>
            <p><strong>Resolution:</strong> 1024x1024 DICOM/PNG</p>
            <p><strong>Limitation:</strong> Requires radiologist over-read on fine nodules</p>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            Overlays highlight specific convolutional pixel activations to verify model attention without hallucinating anatomy.
          </div>
        </div>

        {/* Tier 4: Grounded LLM Explanation */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A38D7D]" />
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Tier 4: Evidence-Grounded LLM
              </h3>
            </div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
              Med-Grounded
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
            <p><strong>Grounding:</strong> Strict document citation required</p>
            <p><strong>Guardrails:</strong> Fact-consistency verification check</p>
            <p><strong>Terminology:</strong> Translates complex metrics into patient readability</p>
            <p><strong>Safety:</strong> Enforces non-prescriptive, physician-advisory tone</p>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            Restricted from making generative assertions outside the explicit bounds of parsed laboratory values and clinical evidence.
          </div>
        </div>

      </div>

      {/* Model Registry Summary Table */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Tabular Model Registry & Validation Benchmarks</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead>
              <tr className="border-b border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                <th className="pb-3 font-sans uppercase tracking-wider text-[10px]">Model Name</th>
                <th className="pb-3 font-sans uppercase tracking-wider text-[10px]">Architecture</th>
                <th className="pb-3 font-sans uppercase tracking-wider text-[10px]">Calibration Metric</th>
                <th className="pb-3 font-sans uppercase tracking-wider text-[10px]">Training Cohort</th>
                <th className="pb-3 font-sans uppercase tracking-wider text-[10px]">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10 dark:divide-[#EAE5DD]/10 text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
              {sampleRiskModels.map((m) => (
                <tr key={m.id}>
                  <td className="py-3.5 font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{m.name}</td>
                  <td className="py-3.5">{m.modelProvenance.architecture}</td>
                  <td className="py-3.5 text-[#A38D7D] font-bold">{m.modelProvenance.calibrationMetric}</td>
                  <td className="py-3.5 text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">{m.modelProvenance.validationDataset}</td>
                  <td className="py-3.5 text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">{m.modelProvenance.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
