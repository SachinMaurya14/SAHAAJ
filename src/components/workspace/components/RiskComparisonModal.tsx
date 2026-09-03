/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Risk Comparison Modal ("Why Did My Risk Change?")
 * Decomposes longitudinal changes between two model evaluations into mathematical feature deltas.
 */

import React from 'react';
import { X, ArrowRight, TrendingUp, TrendingDown, Minus, ShieldAlert, GitCompare } from 'lucide-react';

interface RiskComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  decomposition: {
    assessmentA: { id: string; date: string; modelVersion: string; probability: number; category: string };
    assessmentB: { id: string; date: string; modelVersion: string; probability: number; category: string };
    probabilityDelta: number;
    isModelVersionSame: boolean;
    modelVersionWarning?: string;
    featureDeltas: Array<{
      feature: string;
      displayName: string;
      unit: string;
      valA: any;
      valB: any;
      changeDirection: 'increased' | 'decreased' | 'unchanged';
      contributionDelta: number;
      direction: 'elevating' | 'protective' | 'neutral';
      interpretation: string;
    }>;
    summaryExplanation: string;
  } | null;
}

export const RiskComparisonModal: React.FC<RiskComparisonModalProps> = ({
  isOpen,
  onClose,
  decomposition,
}) => {
  if (!isOpen || !decomposition) return null;

  const isRiskHigher = decomposition.probabilityDelta > 0;
  const isRiskLower = decomposition.probabilityDelta < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                LONGITUDINAL COMPARISON
              </span>
              <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                • Delta Decomposition
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              Why Did My Risk Change?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">Baseline Snapshot</span>
              <span className="text-[10px] text-[#A38D7D]">{decomposition.assessmentA.date.split('T')[0]}</span>
            </div>
            <div className="font-editorial text-4xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              {(decomposition.assessmentA.probability * 100).toFixed(1)}%
            </div>
            <div className="text-[11px] font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              {decomposition.assessmentA.category} &bull; {decomposition.assessmentA.modelVersion}
            </div>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">Latest Snapshot</span>
              <span className="text-[10px] text-[#A38D7D]">{decomposition.assessmentB.date.split('T')[0]}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-editorial text-4xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                {(decomposition.assessmentB.probability * 100).toFixed(1)}%
              </span>
              <span className={`text-xs font-mono-code font-bold flex items-center gap-1 ${
                isRiskHigher ? 'text-[#A38D7D]' : isRiskLower ? 'text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60' : ''
              }`}>
                {isRiskHigher ? <TrendingUp className="w-3.5 h-3.5" /> : isRiskLower ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                {decomposition.probabilityDelta > 0 ? '+' : ''}{(decomposition.probabilityDelta * 100).toFixed(1)}% net
              </span>
            </div>
            <div className="text-[11px] font-mono-code text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              {decomposition.assessmentB.category} &bull; {decomposition.assessmentB.modelVersion}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs">
          <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#A38D7D] block mb-1">
            Mathematical Summary
          </span>
          <p className="font-newsreader text-sm italic text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed">
            "{decomposition.summaryExplanation}"
          </p>
        </div>

        {/* Feature-by-Feature Delta Breakdown */}
        <div className="space-y-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Factor-by-Factor Attribution Changes
          </span>
          
          <div className="space-y-2">
            {decomposition.featureDeltas.map((d) => (
              <div 
                key={d.feature}
                className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{d.displayName}</span>
                  <div className="flex items-center gap-2 font-mono-code text-[11px]">
                    <span className="text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">{d.valA} {d.unit}</span>
                    <ArrowRight className="w-3 h-3 text-[#A38D7D]" />
                    <span className="text-[#A38D7D] font-bold">{d.valB} {d.unit}</span>
                  </div>
                </div>
                <p className="font-newsreader italic text-[11px] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                  {d.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
