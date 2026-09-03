import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { ImagingFinding } from '../../../../../server/cv/types';
import { ImagingApiService } from '../../../../services/imagingApiService';

interface PredictionPanelProps {
  findings: ImagingFinding[];
  studyId: string;
  userRole?: 'patient' | 'clinician';
  onSelectFindingForGradCam?: (finding: ImagingFinding) => void;
  selectedFindingLabel?: string;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  findings,
  studyId,
  userRole = 'patient',
  onSelectFindingForGradCam,
  selectedFindingLabel
}) => {
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleFeedback = async (findingLabel: string, decision: string) => {
    try {
      await ImagingApiService.submitFeedback(studyId, {
        findingLabel,
        clinicianDecision: decision
      });
      setFeedbackSuccess(`Feedback for ${findingLabel} recorded in audit trail.`);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch {
      // Ignore
    }
  };

  if (!findings || findings.length === 0) {
    return (
      <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
        No neural findings available for this study.
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
            CALIBRATED MULTI-LABEL SCREENING
          </span>
          <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Neural Network Findings
          </h4>
        </div>
        <span className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
          {findings.length} Classes Evaluated
        </span>
      </div>

      {feedbackSuccess && (
        <div className="p-2.5 bg-[#2D5A27]/10 border border-[#2D5A27]/30 text-xs text-[#2D5A27] dark:text-[#88FF88] font-mono-code flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Findings Cards List */}
      <div className="space-y-3">
        {findings.map((f) => {
          const isElevated = f.status === 'ELEVATED_SIGNAL';
          const isBorderline = f.status === 'BORDERLINE';
          const isSelected = selectedFindingLabel === f.label;

          return (
            <div
              key={f.findingId}
              onClick={() => onSelectFindingForGradCam && onSelectFindingForGradCam(f)}
              className={`p-4 border transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-[#A38D7D] bg-[#A38D7D]/10 dark:bg-[#A38D7D]/15 shadow-sm'
                  : 'border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 bg-[#F5F2ED] dark:bg-[#201E1A] hover:border-[#A38D7D]/50'
              }`}
            >
              {/* Finding Title & Probability */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD] block">
                    {f.displayName}
                  </span>
                  {f.anatomicalLocation && (
                    <span className="text-[10px] font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                      Region: {f.anatomicalLocation}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-base font-mono-code font-bold block ${
                    isElevated 
                      ? 'text-[#8B0000] dark:text-[#FF8888]' 
                      : isBorderline 
                        ? 'text-[#A38D7D]' 
                        : 'text-[#2D5A27] dark:text-[#88FF88]'
                  }`}>
                    {f.formattedPercentage}
                  </span>
                  <span className="text-[9px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                    Threshold: {(f.decisionThreshold * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Conformal 95% Confidence Bounds Bar */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  <span>95% CI: [{(f.confidenceInterval[0] * 100).toFixed(1)}% - {(f.confidenceInterval[1] * 100).toFixed(1)}%]</span>
                  <span className="uppercase font-bold tracking-wider text-[8px]">
                    {f.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="relative w-full h-1.5 bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      isElevated ? 'bg-[#8B0000]' : isBorderline ? 'bg-[#A38D7D]' : 'bg-[#2D5A27]'
                    }`}
                    style={{ width: `${Math.min(100, f.calibratedProbability * 100)}%` }}
                  />
                  {/* Threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white z-10"
                    style={{ left: `${f.decisionThreshold * 100}%` }}
                    title={`Decision Threshold: ${(f.decisionThreshold * 100).toFixed(0)}%`}
                  />
                </div>
              </div>

              {/* Clinical Implication Narrative */}
              <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed pt-2">
                {userRole === 'patient' ? f.clinicalImplication : f.biologicalMechanism}
              </p>

              {/* Clinician Feedback Strip */}
              {userRole === 'clinician' && (
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[10px] font-mono-code">
                  <span className="text-[#A38D7D] font-bold uppercase">Physician Review:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFeedback(f.label, 'AGREE'); }}
                      className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 hover:border-[#2D5A27] text-[#2D5A27] dark:text-[#88FF88] flex items-center gap-1"
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
                      <span>Agree</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFeedback(f.label, 'DISAGREE'); }}
                      className="px-2 py-0.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 hover:border-[#8B0000] text-[#8B0000] dark:text-[#FF8888] flex items-center gap-1"
                    >
                      <ThumbsDown className="w-2.5 h-2.5" />
                      <span>Disagree</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety Non-Diagnostic Disclaimer */}
      <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs flex items-start gap-2.5 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
        <ShieldCheck className="w-4 h-4 text-[#A38D7D] shrink-0 mt-0.5" />
        <p className="font-newsreader text-xs italic leading-relaxed">
          Screening probabilities indicate statistical feature presence calibrated on research cohorts. Must be correlated with patient history and confirmed by a board-certified radiologist.
        </p>
      </div>

    </div>
  );
};
