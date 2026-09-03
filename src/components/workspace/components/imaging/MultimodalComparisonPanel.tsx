import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { MultimodalReportComparison } from '../../../../../server/cv/types';

interface MultimodalComparisonPanelProps {
  comparison?: MultimodalReportComparison;
  onLinkReportClick?: () => void;
}

export const MultimodalComparisonPanel: React.FC<MultimodalComparisonPanelProps> = ({
  comparison,
  onLinkReportClick
}) => {
  if (!comparison) {
    return (
      <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
            MULTIMODAL DISCREPANCY ANALYSIS
          </span>
        </div>
        <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 leading-relaxed">
          No radiology report is currently cross-referenced with this image. Link a clinical report text narrative to enable automated multimodal concordance checking.
        </p>
        {onLinkReportClick && (
          <button
            onClick={onLinkReportClick}
            className="px-3.5 py-1.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] hover:border-[#A38D7D]"
          >
            + Link Radiology Report Text
          </button>
        )}
      </div>
    );
  }

  const isAgreement = comparison.comparisonStatus === 'FULL_AGREEMENT';
  const isDiscrepancy = comparison.comparisonStatus === 'POTENTIAL_DISCREPANCY';
  const isAdditionalSignal = comparison.comparisonStatus === 'ADDITIONAL_MODEL_SIGNAL';

  return (
    <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
            MULTIMODAL IMAGE & REPORT VERIFICATION
          </span>
          <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Concordance & Discrepancies
          </h4>
        </div>
        <span className={`px-2.5 py-0.5 text-[10px] font-mono-code font-bold uppercase border ${
          isAgreement 
            ? 'bg-[#2D5A27]/10 text-[#2D5A27] dark:text-[#88FF88] border-[#2D5A27]/30'
            : isDiscrepancy
              ? 'bg-[#8B0000]/10 text-[#8B0000] dark:text-[#FF8888] border-[#8B0000]/30'
              : 'bg-[#A38D7D]/15 text-[#1A1A1A] dark:text-[#EAE5DD] border-[#A38D7D]/40'
        }`}>
          {comparison.comparisonStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Summary Narrative */}
      <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
        {comparison.summary}
      </p>

      {/* Comparison Items Breakdown */}
      <div className="space-y-2.5">
        {comparison.itemComparisons.map((item, idx) => (
          <div key={idx} className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-editorial text-base italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                {item.findingLabel}
              </span>
              <span className={`text-[9px] font-mono-code font-bold uppercase px-2 py-0.5 border ${
                item.alignment === 'agrees'
                  ? 'bg-[#2D5A27]/10 text-[#2D5A27] dark:text-[#88FF88] border-[#2D5A27]/30'
                  : item.alignment === 'diverges'
                    ? 'bg-[#8B0000]/10 text-[#8B0000] dark:text-[#FF8888] border-[#8B0000]/30'
                    : 'bg-[#1A1A1A]/5 dark:bg-[#EAE5DD]/5 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
              }`}>
                {item.alignment.toUpperCase()}
              </span>
            </div>

            <div className="text-[10px] font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 flex items-center gap-3">
              <span>AI Probability: {(item.modelProbability * 100).toFixed(1)}%</span>
              {item.reportWording && <span>&bull; {item.reportWording}</span>}
            </div>

            <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
              {item.explanation}
            </p>
          </div>
        ))}
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 font-newsreader italic">
        {comparison.clinicalGuidance}
      </div>

    </div>
  );
};
