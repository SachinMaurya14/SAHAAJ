import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Cpu, 
  Activity, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { EvidenceLineageItem, LineageSourceType } from '../../../../types/clinicianTypes';

interface ClinicalEvidenceGraphProps {
  evidenceItems: EvidenceLineageItem[];
  selectedClaim?: string;
  onSelectEvidenceItem?: (item: EvidenceLineageItem) => void;
}

export const ClinicalEvidenceGraph: React.FC<ClinicalEvidenceGraphProps> = ({
  evidenceItems,
  selectedClaim,
  onSelectEvidenceItem
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = filterType === 'ALL' 
    ? evidenceItems 
    : evidenceItems.filter(e => e.sourceType === filterType);

  const getSourceIcon = (type: LineageSourceType) => {
    switch (type) {
      case 'LAB_REPORT':
      case 'PATIENT_RECORD':
        return <FileText className="w-3.5 h-3.5 text-[#1565C0] dark:text-[#90CAF9]" />;
      case 'IMAGING_MODEL':
        return <Activity className="w-3.5 h-3.5 text-[#8C2424] dark:text-[#E07A5F]" />;
      case 'ML_MODEL':
        return <Cpu className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#81C784]" />;
      case 'MEDICAL_KNOWLEDGE':
        return <BookOpen className="w-3.5 h-3.5 text-[#6A1B9A] dark:text-[#CE93D8]" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60" />;
    }
  };

  return (
    <div id="clinical-evidence-graph" className="p-5 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]">
            Clinical Evidence & Lineage Graph
          </h4>
        </div>

        {/* Source Type Filters */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
          {['ALL', 'LAB_REPORT', 'IMAGING_MODEL', 'ML_MODEL'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded-sm whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A]'
                  : 'text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C]'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
          No lineage citations found for current selection.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <div 
              key={item.lineageId || idx}
              id={`evidence-node-${idx}`}
              onClick={() => onSelectEvidenceItem && onSelectEvidenceItem(item)}
              className="p-3.5 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm hover:border-[#1A1A1A]/30 dark:hover:border-[#EAE5DD]/30 transition-all cursor-pointer space-y-2.5"
            >
              {/* Lineage Flow: Claim -> Model/Doc -> Provenance */}
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-medium text-[#1A1A1A] dark:text-[#EAE5DD] leading-snug">
                  {item.claim}
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#1A1A1A]/5 dark:bg-[#EAE5DD]/5 rounded-sm whitespace-nowrap">
                  {item.sourceType.replace('_', ' ')}
                </span>
              </div>

              {/* Lineage Chain */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 pt-1 border-t border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                <div className="flex items-center gap-1 bg-white dark:bg-[#151412] px-2 py-0.5 border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                  {getSourceIcon(item.sourceType)}
                  <span>{item.sourceDocumentName || item.modelId || 'Source Record'}</span>
                </div>

                <ArrowRight className="w-3 h-3 text-[#1A1A1A]/30 dark:text-[#EAE5DD]/30" />

                <div className="bg-white dark:bg-[#151412] px-2 py-0.5 border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                  {item.dateObserved ? item.dateObserved.split('T')[0] : 'Indexed'}
                </div>

                {item.confidence && (
                  <>
                    <ArrowRight className="w-3 h-3 text-[#1A1A1A]/30 dark:text-[#EAE5DD]/30" />
                    <div className="bg-white dark:bg-[#151412] px-2 py-0.5 border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5 text-[#2E7D32] dark:text-[#81C784]">
                      {(item.confidence * 100).toFixed(0)}% Conf.
                    </div>
                  </>
                )}
              </div>

              {item.citationText && (
                <div className="text-[11px] font-serif italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 bg-white/60 dark:bg-[#151412]/60 p-2 border-l-2 border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20">
                  "{item.citationText}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
