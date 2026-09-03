import React from 'react';
import { X, ShieldCheck, Cpu, Database, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface ModelCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
}

export const ModelCardModal: React.FC<ModelCardModalProps> = ({
  isOpen,
  onClose,
  modelId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                STANDARDIZED MODEL CARD
              </span>
              <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                • v1.4.2 Production
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Cardiovascular 10-Year ASCVD Risk Regressor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code">
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
              1. Intended Purpose & Output
            </span>
            <p className="text-[#1A1A1A] dark:text-[#EAE5DD]">
              <strong>Intended Output:</strong> 10-year statistical probability (%) of atherosclerotic cardiovascular disease events.
            </p>
            <p className="text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              <strong>Target Audience:</strong> Asymptomatic adults aged 30–75 for primary prevention discussions.
            </p>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
              2. Model Architecture & Calibration
            </span>
            <p className="text-[#1A1A1A] dark:text-[#EAE5DD]">
              <strong>Architecture:</strong> Gradient Boosting (XGBoost) + Isotonic Regression calibration.
            </p>
            <p className="text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              <strong>Explainability:</strong> Exact TreeSHAP local additive feature attributions.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4 text-xs">
          {/* Training & Validation */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <h4 className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#A38D7D]" />
              <span>Training Dataset & Evaluation Benchmarks</span>
            </h4>
            <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
              Trained and externally validated on multi-ethnic longitudinal cohorts (NHANES 2011–2022 and pooled Framingham cohorts, N = 48,290). Demonstrates an AUROC of 0.842 and Brier calibration score of 0.089 across diverse demographic sub-strata.
            </p>
          </div>

          {/* Required Inputs */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <h4 className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#A38D7D]" />
              <span>Required Input Parameters</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 font-mono-code text-[11px]">
              {['Systolic BP', 'Diastolic BP', 'Total Cholesterol', 'LDL-C', 'HDL-C', 'Smoking Status', 'Age', 'Sex', 'Fasting Glucose', 'BMI', 'Physical Activity'].map((param) => (
                <span key={param} className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD]">
                  {param}
                </span>
              ))}
            </div>
          </div>

          {/* Known Limitations & Non-Intended Uses */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <h4 className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#A38D7D] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#A38D7D]" />
              <span>Known Limitations & Non-Intended Use</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
              <li>Not intended for acute triage of active chest pain or symptoms of myocardial ischemia.</li>
              <li>Underestimates risk in patients with severe familial hypercholesterolemia (LDL &gt; 190 mg/dL) or active chronic inflammatory autoimmune diseases.</li>
              <li>Requires recalibration when inputs are missing &gt; 3 essential lipid biomarkers.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
          <span>Hash: sha256-e8b91a22f4c718290a19bc892</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
          >
            Close Card
          </button>
        </div>
      </div>
    </div>
  );
};
