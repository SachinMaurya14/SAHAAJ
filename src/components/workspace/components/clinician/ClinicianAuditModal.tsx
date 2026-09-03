import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  FileText, 
  Lock, 
  CheckCircle2,
  Send,
  Eye
} from 'lucide-react';

interface ClinicianAuditModalProps {
  logs: any[];
  onClose: () => void;
}

export const ClinicianAuditModal: React.FC<ClinicianAuditModalProps> = ({
  logs,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 rounded-sm shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784]" />
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
              Clinician Workflow & Governance Audit Log
            </h3>
          </div>
          <button onClick={onClose} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">
            ✕
          </button>
        </div>

        <div className="text-xs font-mono text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
          Showing complete immutable audit trail of clinical reviews, AI syntheses, section approvals, edits, and patient handoffs.
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div 
                key={log.id || idx}
                className="p-3 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5 rounded-sm flex items-start justify-between gap-4 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {log.action}
                  </div>
                  <div className="text-[11px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                    Actor: {log.userId} • Details: {JSON.stringify(log.details || {})}
                  </div>
                </div>
                <span className="text-[10px] text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A]"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
