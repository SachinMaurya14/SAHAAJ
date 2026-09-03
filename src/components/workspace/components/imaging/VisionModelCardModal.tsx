import React from 'react';
import { 
  X, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Award, 
  Layers, 
  AlertTriangle, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { VisionModelArtifact } from '../../../../../server/cv/types';

interface VisionModelCardModalProps {
  model: VisionModelArtifact;
  isOpen: boolean;
  onClose: () => void;
}

export const VisionModelCardModal: React.FC<VisionModelCardModalProps> = ({
  model,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-[#1A1A1A] dark:text-[#EAE5DD]">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                VISION MODEL SPECIFICATION & CARD
              </span>
              <span className="text-xs font-mono-code px-2 py-0.5 bg-[#2D5A27]/10 text-[#2D5A27] dark:text-[#88FF88] border border-[#2D5A27]/30">
                {model.status}
              </span>
            </div>
            <h2 className="font-editorial text-3xl italic mt-1">
              {model.modelName}
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Version {model.version} &bull; Release Date: {new Date(model.releaseDate).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F2ED] dark:hover:bg-[#282622] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Architecture Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">Architecture</span>
            <span className="font-bold text-sm">{model.architecture}</span>
          </div>

          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">Input Matrix</span>
            <span className="font-bold text-sm">{model.inputSize[0]} &times; {model.inputSize[1]} px</span>
          </div>

          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">Macro ROC-AUC</span>
            <span className="font-bold text-sm text-[#2D5A27] dark:text-[#88FF88]">{model.evaluation.rocAuc}</span>
          </div>

          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">Calibration</span>
            <span className="font-bold text-sm">{model.calibrationMethod}</span>
          </div>
        </div>

        {/* Training Dataset Provenance */}
        <div className="p-5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-3">
          <div className="flex items-center gap-2 text-[#A38D7D] font-sans font-bold uppercase tracking-wider text-[10px]">
            <Database className="w-3.5 h-3.5" />
            <span>Training Dataset Cohort & Stratification</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono-code text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
            <div><strong>Dataset Name:</strong> {model.trainingDataset.name}</div>
            <div><strong>Source / License:</strong> {model.trainingDataset.source} ({model.trainingDataset.license})</div>
            <div><strong>Cohort Scale:</strong> {model.trainingDataset.patientCount.toLocaleString()} Patients &bull; {model.trainingDataset.imageCount.toLocaleString()} Verified Radiographs</div>
            <div><strong>Data Partitioning:</strong> {model.trainingDataset.splitStrategy}</div>
          </div>
          <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 pt-1">
            {model.trainingDataset.populationContext}
          </p>
        </div>

        {/* Per-Class Performance Table */}
        <div className="space-y-3">
          <h4 className="font-editorial text-xl italic">
            Per-Class Validation Performance Metrics
          </h4>
          <div className="overflow-x-auto border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-[#F5F2ED] dark:bg-[#201E1A] border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[10px] uppercase text-[#A38D7D]">
                <tr>
                  <th className="p-2.5">Pathological Finding</th>
                  <th className="p-2.5">ROC-AUC</th>
                  <th className="p-2.5">PR-AUC</th>
                  <th className="p-2.5">Sensitivity</th>
                  <th className="p-2.5">Specificity</th>
                  <th className="p-2.5">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10 dark:divide-[#EAE5DD]/10">
                {Object.entries(model.evaluation.perClassMetrics).map(([finding, m]: [string, any]) => (
                  <tr key={finding} className="hover:bg-[#F5F2ED]/50 dark:hover:bg-[#201E1A]/50">
                    <td className="p-2.5 font-bold font-sans">{finding}</td>
                    <td className="p-2.5 text-[#2D5A27] dark:text-[#88FF88] font-bold">{m.rocAuc}</td>
                    <td className="p-2.5">{m.prAuc}</td>
                    <td className="p-2.5">{(m.sensitivity * 100).toFixed(1)}%</td>
                    <td className="p-2.5">{(m.specificity * 100).toFixed(1)}%</td>
                    <td className="p-2.5">{m.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benchmark Candidate Comparison */}
        <div className="space-y-3">
          <h4 className="font-editorial text-xl italic">
            Candidate Architecture Offline Benchmarking (5-Fold CV)
          </h4>
          <div className="overflow-x-auto border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-[#F5F2ED] dark:bg-[#201E1A] border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[10px] uppercase text-[#A38D7D]">
                <tr>
                  <th className="p-2.5">Model Candidate</th>
                  <th className="p-2.5">Macro ROC-AUC</th>
                  <th className="p-2.5">PR-AUC</th>
                  <th className="p-2.5">Brier Score</th>
                  <th className="p-2.5">Latency</th>
                  <th className="p-2.5">Benchmark Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10 dark:divide-[#EAE5DD]/10">
                {model.evaluation.candidateComparisons.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F5F2ED]/50 dark:hover:bg-[#201E1A]/50">
                    <td className="p-2.5 font-bold">{c.algorithm}</td>
                    <td className="p-2.5 text-[#2D5A27] dark:text-[#88FF88] font-bold">{c.rocAuc}</td>
                    <td className="p-2.5">{c.prAuc}</td>
                    <td className="p-2.5">{c.brierScore}</td>
                    <td className="p-2.5">{c.latencyMs} ms</td>
                    <td className="p-2.5 text-[11px] font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documented Limitations & Clinical Boundaries */}
        <div className="p-5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
          <div className="flex items-center gap-2 text-[#8B0000] dark:text-[#FF8888] font-sans font-bold uppercase tracking-wider text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Documented Limitations & Boundaries</span>
          </div>
          <ul className="list-disc list-inside text-xs font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 space-y-1">
            {model.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider"
          >
            Close Model Card
          </button>
        </div>

      </div>
    </div>
  );
};
