/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Candidate Comparison Modal
 * Shows offline 5-fold cross-validation benchmarking against candidate algorithms.
 */

import React from 'react';
import { X, CheckCircle2, GitBranch, BarChart3, Database, Scale } from 'lucide-react';
import { MLModelArtifact } from '../../../../server/ml/types';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: MLModelArtifact | null;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  artifact,
}) => {
  if (!isOpen || !artifact) return null;

  const evalMetrics = artifact.evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                OFFLINE BENCHMARK VALIDATION
              </span>
              <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                • 5-Fold Stratified CV
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Candidate Algorithm Evaluation & Selection
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Benchmark comparisons across candidate modeling architectures for {artifact.modelName}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Architecture Banner */}
        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
              Selected Production Algorithm
            </span>
            <div className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {artifact.algorithm}
            </div>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              Selected based on Pareto-optimal ROC-AUC ({evalMetrics.rocAuc.toFixed(3)}), low Brier score ({evalMetrics.brierScore.toFixed(3)}), and parsimonious clinical interpretability.
            </p>
          </div>

          <div className="text-right font-mono-code text-xs shrink-0">
            <span className="px-2.5 py-1 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] font-bold text-[10px] uppercase">
              Production Active
            </span>
          </div>
        </div>

        {/* Candidate Benchmark Table */}
        <div className="space-y-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Candidate Comparisons (N = {(artifact.sampleSize || (artifact as any).trainingCohortSize || 45000).toLocaleString()})
          </span>

          <div className="overflow-x-auto border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-[#F5F2ED] dark:bg-[#201E1A] border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                <tr>
                  <th className="p-3">Candidate Algorithm</th>
                  <th className="p-3">ROC-AUC</th>
                  <th className="p-3">PR-AUC</th>
                  <th className="p-3">Brier Score</th>
                  <th className="p-3">F1 Score</th>
                  <th className="p-3">Rationale / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/10 dark:divide-[#EAE5DD]/10">
                {evalMetrics.candidateComparisons.map((c: any) => {
                  const isSelected = c.algorithm === artifact.algorithm;
                  return (
                    <tr 
                      key={c.algorithm}
                      className={isSelected ? 'bg-[#A38D7D]/10 font-bold' : ''}
                    >
                      <td className="p-3 flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#A38D7D]" />}
                        <span>{c.algorithm}</span>
                      </td>
                      <td className="p-3">{c.rocAuc.toFixed(3)}</td>
                      <td className="p-3">{c.prAuc.toFixed(3)}</td>
                      <td className="p-3">{c.brierScore.toFixed(3)}</td>
                      <td className="p-3">{(c.f1Score !== undefined ? c.f1Score.toFixed(3) : (c.expectedCalibrationError ? (c.expectedCalibrationError * 100).toFixed(1) + '%' : 'N/A'))}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                          isSelected 
                            ? 'bg-[#A38D7D] text-[#FFFFFF]' 
                            : 'bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70'
                        }`}>
                          {c.selectionRationale || c.notes || (isSelected ? 'SELECTED' : 'BENCHMARK')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Metrics Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">Sensitivity (Recall)</span>
            <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {(evalMetrics.sensitivity * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">Specificity</span>
            <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {(evalMetrics.specificity * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">F1 Score</span>
            <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {evalMetrics.f1Score.toFixed(3)}
            </span>
          </div>

          <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <span className="text-[9px] font-sans font-bold uppercase text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">Decision Threshold</span>
            <span className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {evalMetrics.optimalThreshold.toFixed(2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
