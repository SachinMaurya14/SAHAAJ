import React from 'react';
import { ModelFeatureContribution } from '../../../services/aiModelServices';
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeatureContributionChartProps {
  contributions: ModelFeatureContribution[];
  predictionScore: number;
  modelName: string;
}

export const FeatureContributionChart: React.FC<FeatureContributionChartProps> = ({
  contributions,
  predictionScore,
  modelName,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
              FEATURE ATTRIBUTION (SHAP VALUES)
            </span>
            <span className="text-xs font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              • Score: {predictionScore}%
            </span>
          </div>
          <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Why Did the Model Estimate This Result?
          </h4>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono-code">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#A38D7D] inline-block" />
            <span className="text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">Elevating Risk (+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#1A1A1A]/40 dark:bg-[#EAE5DD]/40 inline-block" />
            <span className="text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">Lowering / Protective (-)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {contributions.map((feat) => {
          const isElevating = feat.direction === 'elevating';
          const isProtective = feat.direction === 'protective';
          const barWidthPercent = Math.min(Math.max(Math.abs(feat.contribution) * 200, 12), 100);

          return (
            <div
              key={feat.featureName}
              className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold uppercase tracking-wider text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {feat.displayName}
                  </span>
                  <span className="font-mono-code text-[11px] text-[#A38D7D] font-semibold">
                    [{feat.rawValue}]
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono-code font-bold uppercase tracking-wider ${
                    isElevating 
                      ? 'text-[#A38D7D]' 
                      : isProtective 
                        ? 'text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70' 
                        : 'text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40'
                  }`}>
                    {isElevating ? `+${(feat.contribution * 100).toFixed(0)}% contribution` : isProtective ? `${(feat.contribution * 100).toFixed(0)}% contribution` : 'Neutral'}
                  </span>
                </div>
              </div>

              {/* Visual Bar representation */}
              <div className="w-full bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 h-2 flex items-center overflow-hidden">
                <div
                  style={{ width: `${barWidthPercent}%` }}
                  className={`h-full transition-all duration-500 ${
                    isElevating 
                      ? 'bg-[#A38D7D]' 
                      : isProtective 
                        ? 'bg-[#1A1A1A]/60 dark:bg-[#EAE5DD]/60' 
                        : 'bg-[#1A1A1A]/20 dark:bg-[#EAE5DD]/20'
                  }`}
                />
              </div>

              {/* Biological Context Note */}
              <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 leading-relaxed pt-1">
                <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic mr-1.5">
                  Mechanism:
                </strong>
                {feat.biologicalRelevance}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[10px] font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-[#A38D7D] shrink-0 mt-0.5" />
        <span>
          <strong>Attribution Boundary:</strong> Factor contributions reflect statistical influence within this model ({modelName}), not deterministic medical causation.
        </span>
      </div>
    </div>
  );
};
