/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Biological Fact Sheet Modal
 * Displays transparent physiological mechanisms, reference ranges, and peer-reviewed citations.
 */

import React from 'react';
import { X, BookOpen, ExternalLink, Activity, ShieldCheck } from 'lucide-react';
import { biologicalFactSheetsData, BiologicalFactSheet } from '../../../services/aiModelServices';

interface BiologicalFactSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  factSheetId: string | null;
}

export const BiologicalFactSheetModal: React.FC<BiologicalFactSheetModalProps> = ({
  isOpen,
  onClose,
  factSheetId,
}) => {
  if (!isOpen) return null;

  const factSheet: BiologicalFactSheet | undefined = 
    biologicalFactSheetsData.find(f => f.id === factSheetId) || biologicalFactSheetsData[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
                BIOLOGICAL FACT SHEET
              </span>
              <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                • {factSheet.category}
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              {factSheet.term}
            </h2>
            <p className="text-xs font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              {factSheet.shortDefinition}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reference Range & Units */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
              Standard Physiological Reference Range
            </span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD] text-sm">
              {factSheet.standardReferenceRange}
            </span>
          </div>

          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
              Measurement Unit
            </span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD] text-sm">
              {factSheet.measurementUnits}
            </span>
          </div>
        </div>

        {/* Detailed Physiology */}
        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Physiological Mechanism & Cellular Biology
          </span>
          <p className="font-newsreader text-sm italic text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed">
            {factSheet.detailedPhysiology}
          </p>
        </div>

        {/* Clinical Significance */}
        <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Clinical Significance & Pathophysiology
          </span>
          <p className="font-newsreader text-sm italic text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed">
            {factSheet.clinicalSignificance}
          </p>
        </div>

        {/* Influencing Lifestyle Factors */}
        <div className="space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Primary Influencing Biological & Lifestyle Factors
          </span>
          <div className="flex flex-wrap gap-1.5 font-mono-code text-xs">
            {factSheet.influencingFactors.map((factor) => (
              <span 
                key={factor}
                className="px-2.5 py-1 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#1A1A1A] dark:text-[#EAE5DD]"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Citations */}
        <div className="space-y-3 pt-2 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Peer-Reviewed Practice Guidelines & Citations
          </span>
          <div className="space-y-2">
            {factSheet.evidenceCitations.map((cit) => (
              <div 
                key={cit.title}
                className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{cit.title}</span>
                  <span className="text-[10px] font-mono-code text-[#A38D7D]">[{cit.evidenceTier}]</span>
                </div>
                <div className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  {cit.source} ({cit.year})
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
