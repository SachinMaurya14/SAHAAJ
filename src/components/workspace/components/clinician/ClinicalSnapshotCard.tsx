import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Eye,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ClinicalSnapshot } from '../../../../types/clinicianTypes';

interface ClinicalSnapshotCardProps {
  snapshot: ClinicalSnapshot;
  onSelectFindingForExplanation?: (finding: string, text: string) => void;
  onViewEvidence?: (claim: string) => void;
}

export const ClinicalSnapshotCard: React.FC<ClinicalSnapshotCardProps> = ({
  snapshot,
  onSelectFindingForExplanation,
  onViewEvidence
}) => {
  return (
    <div id="clinical-snapshot-container" className="space-y-6">
      {/* Vitals Bar */}
      <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#8C2424] dark:text-[#E07A5F]" />
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              Documented Vital Signs
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
            {snapshot.vitalSigns.lastRecorded ? `Recorded ${snapshot.vitalSigns.lastRecorded.split('T')[0]}` : 'From Active Profile'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
            <div className="text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">BLOOD PRESSURE</div>
            <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#EAE5DD] mt-0.5">
              {snapshot.vitalSigns.bp || 'Unrecorded'}
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
            <div className="text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">HEART RATE</div>
            <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#EAE5DD] mt-0.5">
              {snapshot.vitalSigns.heartRate ? `${snapshot.vitalSigns.heartRate} bpm` : 'Unrecorded'}
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
            <div className="text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">BMI / WEIGHT</div>
            <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#EAE5DD] mt-0.5">
              {snapshot.vitalSigns.bmi ? `${snapshot.vitalSigns.bmi} kg/m²` : (snapshot.vitalSigns.weightKg ? `${snapshot.vitalSigns.weightKg} kg` : 'Unrecorded')}
            </div>
          </div>
          <div className="p-2.5 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
            <div className="text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">DATA INTEGRITY</div>
            <div className="text-sm font-medium text-[#2E7D32] dark:text-[#81C784] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Facts
            </div>
          </div>
        </div>
      </div>

      {/* Structured Biomarkers with Longitudinal Deltas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70" />
            <h4 className="text-xs font-mono font-medium tracking-wider uppercase text-[#1A1A1A] dark:text-[#EAE5DD]">
              Structured Biomarkers & Longitudinal Deltas
            </h4>
          </div>
          <span className="text-[11px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
            {snapshot.recentBiomarkers.length} Indexed Parameters
          </span>
        </div>

        {snapshot.recentBiomarkers.length === 0 ? (
          <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-center text-xs font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
            No structured laboratory biomarkers extracted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {snapshot.recentBiomarkers.map((bm, idx) => (
              <div 
                key={idx}
                id={`biomarker-card-${idx}`}
                className="p-3.5 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm hover:border-[#1A1A1A]/30 dark:hover:border-[#EAE5DD]/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-[#1A1A1A] dark:text-[#EAE5DD]">
                      {bm.parameterName}
                    </div>
                    <div className="text-[11px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                      Ref: {bm.referenceRange || 'Standard'} • {bm.sourceDocumentName}
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${
                    bm.status === 'ELEVATED' || bm.status === 'CRITICAL'
                      ? 'bg-[#8C2424]/10 text-[#8C2424] dark:bg-[#E07A5F]/15 dark:text-[#E07A5F]'
                      : bm.status === 'LOW'
                      ? 'bg-[#E65100]/10 text-[#E65100] dark:bg-[#FFB74D]/15 dark:text-[#FFB74D]'
                      : 'bg-[#2E7D32]/10 text-[#2E7D32] dark:bg-[#81C784]/15 dark:text-[#81C784]'
                  }`}>
                    {bm.status}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                  <div className="text-base font-semibold text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {bm.normalizedValue} <span className="text-xs font-normal text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">{bm.unit}</span>
                  </div>
                  
                  {bm.deltaFromPrior && (
                    <div className={`flex items-center gap-1 text-[11px] font-mono font-medium ${
                      bm.deltaFromPrior.direction === 'INCREASING'
                        ? 'text-[#8C2424] dark:text-[#E07A5F]'
                        : bm.deltaFromPrior.direction === 'DECREASING'
                        ? 'text-[#2E7D32] dark:text-[#81C784]'
                        : 'text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60'
                    }`}>
                      {bm.deltaFromPrior.direction === 'INCREASING' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{bm.deltaFromPrior.direction === 'INCREASING' ? '+' : ''}{bm.deltaFromPrior.absoluteDelta} {bm.unit} ({bm.deltaFromPrior.percentDelta}%)</span>
                    </div>
                  )}
                </div>

                {onSelectFindingForExplanation && (
                  <div className="mt-2.5 pt-2 border-t border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5 flex items-center justify-between opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onSelectFindingForExplanation(bm.parameterName, `${bm.parameterName} is currently ${bm.normalizedValue} ${bm.unit} (${bm.status})${bm.deltaFromPrior ? `, changing by ${bm.deltaFromPrior.absoluteDelta} ${bm.unit} from prior test` : ''}.`)}
                      className="text-[10px] font-mono text-[#8C2424] dark:text-[#E07A5F] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Explain to patient
                    </button>
                    {onViewEvidence && (
                      <button
                        onClick={() => onViewEvidence(bm.parameterName)}
                        className="text-[10px] font-mono text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] flex items-center gap-0.5"
                      >
                        Evidence <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistical Risk & Imaging Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ML Statistical Risk Signals */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              Tabular Risk Models (V5)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1A1A1A]/5 dark:bg-[#EAE5DD]/5">
              Supportive Signals
            </span>
          </div>

          {snapshot.recentRiskAssessments.length === 0 ? (
            <div className="py-4 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
              No active risk model assessments.
            </div>
          ) : (
            <div className="space-y-2">
              {snapshot.recentRiskAssessments.map((ra, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#1A1A1A] dark:text-[#EAE5DD]">{ra.modelName}</div>
                    <div className="text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">{ra.domain} • {ra.modelVersion}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#1A1A1A] dark:text-[#EAE5DD]">{ra.riskScorePercent}%</div>
                    <div className="text-[10px] font-mono text-[#8C2424] dark:text-[#E07A5F] uppercase">{ra.riskCategory} Tier</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Imaging Saliency Signals */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              Diagnostic Imaging (V6)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1A1A1A]/5 dark:bg-[#EAE5DD]/5">
              DenseNet-121
            </span>
          </div>

          {snapshot.recentImagingStudies.length === 0 ? (
            <div className="py-4 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
              No diagnostic imaging studies on file.
            </div>
          ) : (
            <div className="space-y-2">
              {snapshot.recentImagingStudies.map((img, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-[#1A1A1A] dark:text-[#EAE5DD]">{img.modality} ({img.bodyRegion})</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#81C784]">
                      {img.qualityStatus}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                    Top Signals: {img.topFindings.map(f => `${f.label} (${(f.probability * 100).toFixed(1)}%)`).join(', ') || 'No focal abnormality'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Information Gaps & Conflicts */}
      {(snapshot.dataGaps.length > 0 || snapshot.dataConflicts.length > 0) && (
        <div className="p-4 bg-[#FFF8E1] dark:bg-[#2A2315] border border-[#FFE082]/60 dark:border-[#FFB74D]/20 rounded-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E65100] dark:text-[#FFB74D]" />
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#E65100] dark:text-[#FFB74D]">
              Clinical Documentation Gaps & Attention Flags
            </span>
          </div>
          
          <ul className="space-y-1.5 pl-5 list-disc text-xs text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 font-sans">
            {snapshot.dataGaps.map((gap, idx) => (
              <li key={`gap-${idx}`} className="leading-relaxed">{gap}</li>
            ))}
            {snapshot.dataConflicts.map((conf, idx) => (
              <li key={`conf-${idx}`} className="text-[#8C2424] dark:text-[#E07A5F] font-medium leading-relaxed">
                Data Conflict in {conf.concept}: {conf.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
