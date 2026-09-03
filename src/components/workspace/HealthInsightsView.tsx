import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { sampleHealthInsights } from '../../data/mockHealthData';

interface HealthInsightsViewProps {
  setCurrentView: (view: string) => void;
}

export const HealthInsightsView: React.FC<HealthInsightsViewProps> = ({ setCurrentView }) => {
  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              SYNTHESIS & FINDINGS
            </span>
            <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; 4 Correlated Observations</span>
          </div>
          <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Health Insights & Findings
          </h2>
          <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Synthesized directly from your verified laboratory reports, imaging scans, and indexed clinical evidence.
          </p>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleHealthInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
                  {insight.category}
                </span>

                {insight.urgency === 'attention_recommended' ? (
                  <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#A38D7D]">
                    Attention Advised
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                    Routine
                  </span>
                )}
              </div>

              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                {insight.title}
              </h3>

              <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
                {insight.summary}
              </p>

              {insight.actionableStep && (
                <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
                  <strong className="font-sans font-bold uppercase tracking-wider text-[9px] text-[#A38D7D] not-italic block mb-0.5">Clinical Context:</strong>
                  {insight.actionableStep}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-center justify-between text-xs font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              <span className="truncate max-w-[220px]">Src: {insight.evidenceSource}</span>
              <button
                onClick={() => setCurrentView('app-appointment-prep')}
                className="text-[#1A1A1A] dark:text-[#EAE5DD] font-sans font-bold uppercase tracking-wider text-[10px] hover:text-[#A38D7D] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Add to Brief</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
