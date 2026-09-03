import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Download, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Clock, 
  AlertCircle,
  EyeOff,
  Database
} from 'lucide-react';
import { sampleAuditLogs, initialHealthProfile } from '../../data/mockHealthData';

export const PrivacyCenterView: React.FC = () => {
  const [encryptionActive, setEncryptionActive] = useState(true);
  const [anonymizeSharing, setAnonymizeSharing] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(initialHealthProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `saahaj_health_record_${initialHealthProfile.personal.fullName.toLowerCase().replace(' ', '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#A38D7D]">
              PRIVACY & DATA GOVERNANCE
            </span>
            <span className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">&bull; AES-256 Client Isolation</span>
          </div>
          <h2 className="font-editorial text-3xl italic text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
            Privacy, Consent & Security Governance Center
          </h2>
          <p className="text-xs font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
            Control your health data permissions, cryptographic storage keys, audit logs, and export rights.
          </p>
        </div>
      </div>

      {/* Privacy Controls & Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Client-Side Encryption */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#A38D7D]" />
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                Client Record Encryption
              </h3>
            </div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
              Enforced
            </span>
          </div>
          <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            All extracted biomarkers, clinical notes, and radiological studies are sealed with your private key before reaching storage. SAAHAJ operators cannot read your unencrypted PHI.
          </p>
        </div>

        {/* Anonymized Clinician Sharing */}
        <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#A38D7D]" />
              <h3 className="font-editorial text-2xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                De-Identification Shield
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={anonymizeSharing} 
                onChange={(e) => setAnonymizeSharing(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-[#1A1A1A]/20 peer-focus:outline-none rounded-full peer dark:bg-[#EAE5DD]/20 peer-checked:after:translate-x-full peer-checked:after:border-[#FFFFFF] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFFFF] after:border-[#1A1A1A]/20 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-[#EAE5DD]/20 peer-checked:bg-[#A38D7D]"></div>
            </label>
          </div>
          <p className="font-newsreader text-sm italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
            Automatically redacts government identifiers, residential address, and phone numbers when generating doctor briefs or research exports.
          </p>
        </div>

      </div>

      {/* Data Export & One-Click Erasure */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Patient Data Portability & GDPR Right to Erasure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* JSON/FHIR Export */}
          <div className="p-6 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-4">
            <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              Export Clinical Bundle (JSON / FHIR)
            </h4>
            <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              Download your full structured health records, longitudinal comparisons, and doctor prep summaries.
            </p>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] hover:bg-[#2A2A2A] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Health Bundle</span>
            </button>
            {downloadSuccess && (
              <span className="text-[11px] font-mono-code text-[#A38D7D] block">
                &bull; Bundle downloaded successfully.
              </span>
            )}
          </div>

          {/* Delete All Data */}
          <div className="p-6 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-4">
            <h4 className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
              Permanent Record Erasure
            </h4>
            <p className="font-newsreader text-xs italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
              Permanently purges all documents, extracted parameters, and personal profile entries from this session.
            </p>
            {deleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
                >
                  Confirm Purge
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 bg-transparent border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-[#1A1A1A]/5 dark:hover:bg-[#EAE5DD]/5 border border-[#1A1A1A]/30 dark:border-[#EAE5DD]/30 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#EAE5DD] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase All Data</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Immutable Access & Audit Log */}
      <div className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#A38D7D] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Immutable Cryptographic Audit Trail</span>
          </h3>
          <span className="text-[10px] font-mono-code text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">SOC2 Type II</span>
        </div>

        <div className="space-y-3">
          {sampleAuditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-mono-code flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">{log.action}</span>
                <p className="text-[11px] font-newsreader italic text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">{log.details}</p>
              </div>
              <div className="text-right text-[11px] text-[#A38D7D] shrink-0">
                <span>{log.actor}</span> &bull; <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
