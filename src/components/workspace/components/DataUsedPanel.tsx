import React from 'react';
import { Database, CheckCircle2, AlertCircle, HelpCircle, Edit3 } from 'lucide-react';

interface DataUsedItem {
  name: string;
  value: string;
  provenance: string;
  sourceDocId?: string;
  sourcePage?: number;
  status: 'used' | 'missing' | 'unavailable';
  canCorrect?: boolean;
}

interface DataUsedPanelProps {
  items: DataUsedItem[];
  completenessPercent: number;
  onOpenCorrection?: (itemName: string, currentValue: string) => void;
}

export const DataUsedPanel: React.FC<DataUsedPanelProps> = ({
  items,
  completenessPercent,
  onOpenCorrection,
}) => {
  const usedItems = items.filter((i) => i.status === 'used');
  const missingItems = items.filter((i) => i.status === 'missing');
  const unavailableItems = items.filter((i) => i.status === 'unavailable');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D]">
            TRANSPARENT DATA PROVENANCE
          </span>
          <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
            Data Used for This Assessment
          </h4>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono-code text-[#A38D7D] font-bold">
            {completenessPercent}% Input Completeness
          </span>
        </div>
      </div>

      {/* Used Inputs Table */}
      <div className="space-y-2">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 block">
          Utilized Biometrics ({usedItems.length})
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-code">
          {usedItems.map((item) => (
            <div
              key={item.name}
              className="p-3 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#A38D7D] shrink-0" />
                  <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{item.name}:</span>
                  <span className="text-[#A38D7D] font-bold">{item.value}</span>
                </div>
                <span className="text-[10px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 block pl-4 truncate">
                  Src: {item.provenance}
                </span>
              </div>

              {onOpenCorrection && (
                <button
                  onClick={() => onOpenCorrection(item.name, item.value)}
                  className="p-1 text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 hover:text-[#A38D7D] cursor-pointer"
                  title="Correct value"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Missing Inputs */}
      {missingItems.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] block">
            Missing Parameters ({missingItems.length})
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono-code">
            {missingItems.map((item) => (
              <span
                key={item.name}
                className="px-2.5 py-1 bg-[#F5F2ED] dark:bg-[#201E1A] border border-dashed border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3 h-3 text-[#A38D7D]" />
                <span>{item.name}</span>
                <span className="text-[9px] text-[#A38D7D]">(Imputed / Missing)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
