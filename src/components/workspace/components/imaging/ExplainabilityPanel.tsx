import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Eye, 
  Cpu, 
  Info, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import { GradCamExplanation } from '../../../../../server/cv/types';

interface ExplainabilityPanelProps {
  explanation?: GradCamExplanation;
  userRole?: 'patient' | 'clinician';
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  explanation,
  userRole = 'patient'
}) => {
  if (!explanation) {
    return (
      <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
        Grad-CAM explainability artifact not generated for this study.
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
            SALIENCY & ATTENTION PROVENANCE
          </span>
          <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Grad-CAM Visual Explanations
          </h4>
        </div>
        <span className="text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
          Target: {explanation.targetFinding}
        </span>
      </div>

      {/* Target Layer & Focal Point Specifications */}
      <div className="space-y-3">
        <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1 text-xs font-mono-code">
          <div className="flex items-center justify-between text-[#A38D7D] font-bold text-[10px] uppercase">
            <span>Target Convolutional Feature Layer</span>
            <span>{explanation.method}</span>
          </div>
          <div className="text-[11px] text-[#1A1A1A] dark:text-[#EAE5DD] break-all">
            {explanation.targetLayer}
          </div>
        </div>

        {explanation.activeFocalPoints?.map((fp, i) => (
          <div key={i} className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono-code">
              <span className="text-[#A38D7D] font-bold uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Peak Neural Focus Point</span>
              </span>
              <span className="text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                Coord: ({fp.xPercent}%, {fp.yPercent}%)
              </span>
            </div>
            <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
              {fp.anatomicalRegionHint}
            </p>
          </div>
        ))}
      </div>

      {/* Patient-facing or Clinician Explanation */}
      <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-2">
        <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{userRole === 'patient' ? 'What This Visual Map Means' : 'Gradient Flow Architecture'}</span>
        </div>
        <p className="font-newsreader text-xs italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
          {userRole === 'patient' ? (
            <>
              The colored glow highlights the specific anatomical areas of your chest X-ray that the AI system examined most closely when evaluating <strong>{explanation.targetFinding}</strong>. Red and yellow regions received the highest attention weights from the computer vision model.
            </>
          ) : (
            <>
              Gradients of the score for target class <em>{explanation.targetFinding}</em> are backpropagated to the final convolutional block. Positive Rectified Linear Unit (ReLU) activations isolate high-frequency pixel features supporting class prediction.
            </>
          )}
        </p>
      </div>

      {/* Methodological Disclaimer */}
      <div className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 leading-relaxed border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pt-2">
        {explanation.disclaimer}
      </div>

    </div>
  );
};
