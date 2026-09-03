import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Sliders, 
  CheckCircle2, 
  Maximize2 
} from 'lucide-react';
import { ImageQualityMetrics } from '../../../../../server/cv/types';

interface ImageQualityPanelProps {
  quality?: ImageQualityMetrics;
}

export const ImageQualityPanel: React.FC<ImageQualityPanelProps> = ({ quality }) => {
  if (!quality) {
    return (
      <div className="p-4 bg-[#F5F2ED] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 text-xs font-mono-code text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
        Quality metrics not computed for this study.
      </div>
    );
  }

  const isExcellent = quality.status === 'EXCELLENT';
  const isAcceptable = quality.status === 'ACCEPTABLE';
  const isDegraded = quality.status === 'DEGRADED';
  const isAbstained = quality.status === 'ABSTAINED';

  return (
    <div className="p-6 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
            TECHNICAL QUALITY ASSESSMENT
          </span>
        </div>
        <span className={`px-2.5 py-0.5 text-[10px] font-mono-code font-bold uppercase border ${
          isExcellent
            ? 'bg-[#2D5A27]/10 text-[#2D5A27] dark:text-[#88FF88] border-[#2D5A27]/30'
            : isAcceptable
              ? 'bg-[#A38D7D]/15 text-[#1A1A1A] dark:text-[#EAE5DD] border-[#A38D7D]/40'
              : 'bg-[#8B0000]/10 text-[#8B0000] dark:text-[#FF8888] border-[#8B0000]/30'
        }`}>
          {quality.status}
        </span>
      </div>

      {/* Numerical Quality Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-code">
        <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
          <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">
            Blur Variance
          </span>
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
            {quality.blurVariance}
          </span>
          <span className="text-[9px] text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">Laplacian &gt;12.0</span>
        </div>

        <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
          <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">
            Contrast Ratio
          </span>
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
            {quality.contrastRatio}
          </span>
          <span className="text-[9px] text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">Std Dev &gt;15.0</span>
        </div>

        <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
          <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">
            Mean Brightness
          </span>
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
            {quality.meanBrightness} / 255
          </span>
          <span className="text-[9px] text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block capitalize">{quality.exposureCategory}</span>
        </div>

        <div className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
          <span className="text-[9px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 uppercase block">
            Dynamic Range
          </span>
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
            {quality.dynamicRangePercent}%
          </span>
          <span className="text-[9px] text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block">Quantization Depth</span>
        </div>
      </div>

      {/* Warnings & Abstention Notice if Any */}
      {quality.warnings && quality.warnings.length > 0 && (
        <div className="p-3 bg-[#A38D7D]/10 border border-[#A38D7D]/30 text-xs space-y-1 text-[#1A1A1A] dark:text-[#EAE5DD]">
          <div className="flex items-center gap-1.5 font-bold text-[#A38D7D] text-[10px] uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Image Pre-Flight Advisory</span>
          </div>
          <ul className="list-disc list-inside text-[11px] font-newsreader italic space-y-0.5 pl-1">
            {quality.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {quality.isAbstained && (
        <div className="p-4 bg-[#8B0000]/10 border border-[#8B0000]/30 text-xs text-[#8B0000] dark:text-[#FF8888] space-y-1">
          <div className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Inference Abstained</span>
          </div>
          <p className="font-newsreader italic text-[11px] leading-relaxed">
            {quality.abstentionReason || 'Severe optical blur or pixel clipping prevents reliable multi-label feature activation.'}
          </p>
        </div>
      )}

      {/* Preprocessing Pipeline Metadata */}
      <div className="flex items-center justify-between text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 pt-1">
        <span>Pipeline: {quality.technicalMetadata?.preprocessingVersion || 'cxr-norm-v1.2'}</span>
        <span>Format: {quality.technicalMetadata?.fileFormat?.toUpperCase()} &bull; {(quality.technicalMetadata?.fileSizeBytes ? quality.technicalMetadata.fileSizeBytes / 1024 : 0).toFixed(1)} KB</span>
      </div>
    </div>
  );
};
