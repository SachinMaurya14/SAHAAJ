import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  FileText, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { ClinicianReviewQueueItem } from '../../../../types/clinicianTypes';

interface ClinicianReviewQueueProps {
  queueItems: ClinicianReviewQueueItem[];
  onSelectQueueItem: (item: ClinicianReviewQueueItem) => void;
}

export const ClinicianReviewQueue: React.FC<ClinicianReviewQueueProps> = ({
  queueItems,
  onSelectQueueItem
}) => {
  const getItemIcon = (type: ClinicianReviewQueueItem['itemType']) => {
    switch (type) {
      case 'AI_DRAFT':
        return <Sparkles className="w-4 h-4 text-[#E65100] dark:text-[#FFB74D]" />;
      case 'DATA_CONFLICT':
        return <AlertCircle className="w-4 h-4 text-[#8C2424] dark:text-[#E07A5F]" />;
      case 'UNREVIEWED_IMAGING':
        return <Activity className="w-4 h-4 text-[#1565C0] dark:text-[#90CAF9]" />;
      default:
        return <Layers className="w-4 h-4 text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60" />;
    }
  };

  return (
    <div id="clinician-review-queue" className="p-5 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8C2424] dark:text-[#E07A5F]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD]">
            Clinician Review Queue ({queueItems.length})
          </h4>
        </div>
        <span className="text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
          Prioritized Workflow
        </span>
      </div>

      {queueItems.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
          All clinical records and AI syntheses are reviewed and up to date.
        </div>
      ) : (
        <div className="space-y-2.5">
          {queueItems.map((item, idx) => (
            <div
              key={item.queueId || idx}
              id={`queue-item-${idx}`}
              onClick={() => onSelectQueueItem(item)}
              className="p-3.5 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm hover:border-[#1A1A1A]/30 dark:hover:border-[#EAE5DD]/30 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getItemIcon(item.itemType)}
                  <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {item.title}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm ${
                  item.priority === 'HIGH'
                    ? 'bg-[#8C2424]/10 text-[#8C2424] dark:bg-[#E07A5F]/15 dark:text-[#E07A5F]'
                    : 'bg-[#E65100]/10 text-[#E65100] dark:bg-[#FFB74D]/15 dark:text-[#FFB74D]'
                }`}>
                  {item.priority} Priority
                </span>
              </div>

              <p className="text-[11px] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 font-sans leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 pt-1">
                <span>Patient: {item.patientName}</span>
                <span className="flex items-center gap-1 text-[#8C2424] dark:text-[#E07A5F]">
                  Open Item <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
