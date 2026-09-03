import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Check, 
  Copy, 
  Download, 
  RotateCcw, 
  Eye, 
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Layers
} from 'lucide-react';
import { 
  ClinicalSynthesis, 
  ClinicalSynthesisSection, 
  SectionReviewStatus, 
  ContentVisibility 
} from '../../../../types/clinicianTypes';
import { ClinicianApiService } from '../../../../services/clinicianApiService';

interface ClinicalSynthesisEditorProps {
  synthesis: ClinicalSynthesis;
  onSynthesisUpdated: (updated: ClinicalSynthesis) => void;
  onOpenEvidenceForSection?: (section: ClinicalSynthesisSection) => void;
  onOpenPatientExplanation?: (finding: string, text: string) => void;
}

export const ClinicalSynthesisEditor: React.FC<ClinicalSynthesisEditorProps> = ({
  synthesis,
  onSynthesisUpdated,
  onOpenEvidenceForSection,
  onOpenPatientExplanation
}) => {
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<string>('');
  const [rejectingSectionKey, setRejectingSectionKey] = useState<string | null>(null);
  const [rejectReasonBuffer, setRejectReasonBuffer] = useState<string>('');
  const [showDiffSectionKey, setShowDiffSectionKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'SOAP_VIEW' | 'AUDIT_LOG'>('SECTIONS');
  
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeVisibility, setFinalizeVisibility] = useState<ContentVisibility>('CLINICIAN_ONLY');
  const [finalizeNotes, setFinalizeNotes] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);

  const handleStartEdit = (section: ClinicalSynthesisSection) => {
    setEditingSectionKey(section.key);
    setEditBuffer(section.clinicianContent);
  };

  const handleSaveEdit = async (sectionKey: string) => {
    try {
      setIsSavingAction(true);
      const updated = await ClinicianApiService.updateSection(
        synthesis.synthesisId,
        sectionKey,
        'EDIT',
        editBuffer
      );
      onSynthesisUpdated(updated);
      setEditingSectionKey(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleAcceptSection = async (sectionKey: string) => {
    try {
      setIsSavingAction(true);
      const updated = await ClinicianApiService.updateSection(
        synthesis.synthesisId,
        sectionKey,
        'ACCEPT'
      );
      onSynthesisUpdated(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleRejectSection = async (sectionKey: string) => {
    try {
      setIsSavingAction(true);
      const updated = await ClinicianApiService.updateSection(
        synthesis.synthesisId,
        sectionKey,
        'REJECT',
        undefined,
        rejectReasonBuffer || 'Clinician rejected AI section draft'
      );
      onSynthesisUpdated(updated);
      setRejectingSectionKey(null);
      setRejectReasonBuffer('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsSavingAction(true);
      const res = await ClinicianApiService.finalizeSynthesis(
        synthesis.synthesisId,
        finalizeVisibility,
        finalizeNotes || 'Approved following clinical review'
      );
      onSynthesisUpdated(res.synthesis);
      setIsFinalizing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAction(false);
    }
  };

  const copyFullSummary = () => {
    let full = `SAAHAJ CLINICAL SYNTHESIS — ${synthesis.title}\n`;
    full += `STATUS: ${synthesis.status} (v${synthesis.version}) | AI MODEL: ${synthesis.aiModel}\n\n`;
    synthesis.sections.forEach(s => {
      if (s.status !== 'REJECTED') {
        full += `[${s.title.toUpperCase()}] (${s.status})\n${s.clinicianContent}\n\n`;
      }
    });
    navigator.clipboard.writeText(full);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const pendingCount = synthesis.sections.filter(s => s.status === 'PENDING_REVIEW').length;
  const acceptedCount = synthesis.sections.filter(s => s.status === 'ACCEPTED').length;
  const editedCount = synthesis.sections.filter(s => s.status === 'EDITED').length;
  const rejectedCount = synthesis.sections.filter(s => s.status === 'REJECTED').length;

  return (
    <div id="clinical-synthesis-editor" className="space-y-6">
      {/* Top Header & Status Banner */}
      <div className="p-5 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider rounded-sm font-medium ${
                synthesis.status === 'APPROVED' 
                  ? 'bg-[#2E7D32]/10 text-[#2E7D32] dark:bg-[#81C784]/15 dark:text-[#81C784]'
                  : synthesis.status === 'IN_REVIEW' || synthesis.status === 'EDITED'
                  ? 'bg-[#1565C0]/10 text-[#1565C0] dark:bg-[#90CAF9]/15 dark:text-[#90CAF9]'
                  : 'bg-[#E65100]/10 text-[#E65100] dark:bg-[#FFB74D]/15 dark:text-[#FFB74D]'
              }`}>
                {synthesis.status === 'APPROVED' ? 'Clinician-Reviewed Final' : `AI Draft (v${synthesis.version})`}
              </span>
              
              <span className="text-xs font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                Created {new Date(synthesis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD] mt-1">
              {synthesis.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyFullSummary}
              className="px-3 py-1.5 text-xs font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C] flex items-center gap-1.5 transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedText ? 'Copied' : 'Copy All'}
            </button>

            {synthesis.status !== 'APPROVED' ? (
              <button
                onClick={() => setIsFinalizing(true)}
                className="px-3.5 py-1.5 text-xs font-mono font-medium bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A] hover:opacity-90 flex items-center gap-1.5 transition-opacity"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Finalize & Approve
              </button>
            ) : (
              <span className="px-3 py-1 text-xs font-mono text-[#2E7D32] dark:text-[#81C784] bg-[#2E7D32]/10 border border-[#2E7D32]/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clinician Signed
              </span>
            )}
          </div>
        </div>

        {/* Section review progress */}
        <div className="pt-3 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
              Review Progress: <strong className="text-[#1A1A1A] dark:text-[#EAE5DD]">{acceptedCount + editedCount + rejectedCount} / {synthesis.sections.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#2E7D32] dark:text-[#81C784]">Accepted: {acceptedCount}</span>
              <span className="text-[#1565C0] dark:text-[#90CAF9]">Edited: {editedCount}</span>
              <span className="text-[#8C2424] dark:text-[#E07A5F]">Rejected: {rejectedCount}</span>
              {pendingCount > 0 && <span className="text-[#E65100] dark:text-[#FFB74D]">Pending: {pendingCount}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('SECTIONS')}
              className={`px-2.5 py-1 text-[11px] font-mono ${activeTab === 'SECTIONS' ? 'bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 font-bold' : 'text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60'}`}
            >
              Structured Sections
            </button>
            <button
              onClick={() => setActiveTab('SOAP_VIEW')}
              className={`px-2.5 py-1 text-[11px] font-mono ${activeTab === 'SOAP_VIEW' ? 'bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 font-bold' : 'text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60'}`}
            >
              SOAP View
            </button>
            <button
              onClick={() => setActiveTab('AUDIT_LOG')}
              className={`px-2.5 py-1 text-[11px] font-mono ${activeTab === 'AUDIT_LOG' ? 'bg-[#1A1A1A]/10 dark:bg-[#EAE5DD]/10 font-bold' : 'text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60'}`}
            >
              Audit Trail ({synthesis.auditTrail?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'SECTIONS' && (
        <div className="space-y-4">
          {synthesis.sections.map((section, idx) => {
            const isEditing = editingSectionKey === section.key;
            const isRejecting = rejectingSectionKey === section.key;
            const isDiffOpen = showDiffSectionKey === section.key;

            return (
              <div 
                key={section.sectionId || idx}
                id={`synthesis-section-${section.key}`}
                className={`p-5 bg-white dark:bg-[#1C1B18] border rounded-sm transition-all ${
                  section.status === 'ACCEPTED'
                    ? 'border-[#2E7D32]/30 dark:border-[#81C784]/30'
                    : section.status === 'EDITED'
                    ? 'border-[#1565C0]/30 dark:border-[#90CAF9]/30'
                    : section.status === 'REJECTED'
                    ? 'border-[#8C2424]/30 dark:border-[#E07A5F]/30 bg-[#FFF5F5]/40 dark:bg-[#2A1818]/20'
                    : 'border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12'
                }`}
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-semibold text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-medium text-[#1A1A1A] dark:text-[#EAE5DD]">
                      {section.title}
                    </h4>
                    
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${
                      section.status === 'ACCEPTED'
                        ? 'bg-[#2E7D32]/10 text-[#2E7D32] dark:bg-[#81C784]/15 dark:text-[#81C784]'
                        : section.status === 'EDITED'
                        ? 'bg-[#1565C0]/10 text-[#1565C0] dark:bg-[#90CAF9]/15 dark:text-[#90CAF9]'
                        : section.status === 'REJECTED'
                        ? 'bg-[#8C2424]/10 text-[#8C2424] dark:bg-[#E07A5F]/15 dark:text-[#E07A5F]'
                        : 'bg-[#E65100]/10 text-[#E65100] dark:bg-[#FFB74D]/15 dark:text-[#FFB74D]'
                    }`}>
                      {section.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Section action buttons */}
                  <div className="flex items-center gap-1.5">
                    {section.evidence && section.evidence.length > 0 && onOpenEvidenceForSection && (
                      <button
                        onClick={() => onOpenEvidenceForSection(section)}
                        className="px-2 py-1 text-[11px] font-mono text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:text-[#1A1A1A] dark:hover:text-[#EAE5DD] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm"
                        title="View source citations and lineage"
                      >
                        Evidence ({section.evidence.length})
                      </button>
                    )}

                    {section.status !== 'ACCEPTED' && !isEditing && (
                      <button
                        disabled={isSavingAction}
                        onClick={() => handleAcceptSection(section.key)}
                        className="px-2.5 py-1 text-[11px] font-mono bg-[#2E7D32]/10 text-[#2E7D32] dark:bg-[#81C784]/15 dark:text-[#81C784] hover:bg-[#2E7D32]/20 flex items-center gap-1 rounded-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Accept
                      </button>
                    )}

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(section)}
                        className="px-2.5 py-1 text-[11px] font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD] hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C] flex items-center gap-1 rounded-sm"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    )}

                    {section.status !== 'REJECTED' && !isEditing && !isRejecting && (
                      <button
                        onClick={() => setRejectingSectionKey(section.key)}
                        className="px-2.5 py-1 text-[11px] font-mono text-[#8C2424] dark:text-[#E07A5F] hover:bg-[#8C2424]/10 flex items-center gap-1 rounded-sm"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    )}

                    {section.status === 'EDITED' && (
                      <button
                        onClick={() => setShowDiffSectionKey(isDiffOpen ? null : section.key)}
                        className="px-2 py-1 text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 hover:underline"
                      >
                        {isDiffOpen ? 'Hide Diff' : 'View Diff'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Content Area */}
                <div className="mt-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                        rows={6}
                        className="w-full p-3 font-sans text-xs sm:text-sm bg-[#FAF8F5] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#8C2424] text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                          {editBuffer.length} characters • Clinician authoring
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSectionKey(null)}
                            className="px-3 py-1 text-xs font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isSavingAction}
                            onClick={() => handleSaveEdit(section.key)}
                            className="px-3.5 py-1 text-xs font-mono bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A]"
                          >
                            Save Clinician Version
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : isRejecting ? (
                    <div className="p-3 bg-[#FFF5F5] dark:bg-[#2A1818] border border-[#8C2424]/20 rounded-sm space-y-2">
                      <div className="text-xs font-mono text-[#8C2424] dark:text-[#E07A5F] font-medium">
                        Specify Rejection Reason (Audit Log):
                      </div>
                      <input
                        type="text"
                        value={rejectReasonBuffer}
                        onChange={(e) => setRejectReasonBuffer(e.target.value)}
                        placeholder="e.g. Inapplicable finding, historical document mismatch..."
                        className="w-full p-2 text-xs bg-white dark:bg-[#151412] border border-[#8C2424]/30 rounded-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingSectionKey(null)}
                          className="px-2.5 py-1 text-xs font-mono border border-[#1A1A1A]/15"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRejectSection(section.key)}
                          className="px-3 py-1 text-xs font-mono bg-[#8C2424] text-white rounded-sm"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {section.status === 'REJECTED' ? (
                        <div className="p-3 bg-[#FAF8F5] dark:bg-[#201F1C] border border-dashed border-[#8C2424]/30 text-xs font-mono text-[#8C2424] dark:text-[#E07A5F] space-y-1">
                          <div>[Section Rejected by Clinician]</div>
                          <div className="text-[11px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                            Rationale: {section.rejectionReason || 'Excluded from clinical synthesis'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed whitespace-pre-wrap font-sans">
                          {section.clinicianContent}
                        </div>
                      )}

                      {/* Diff View if expanded */}
                      {isDiffOpen && (
                        <div className="mt-3 p-3 bg-[#FAF8F5] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm text-xs font-mono space-y-2">
                          <div className="text-[11px] font-bold text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                            VERSION COMPARISON (DIFF):
                          </div>
                          <div className="p-2 bg-[#FFF5F5] dark:bg-[#2A1818] text-[#8C2424] dark:text-[#E07A5F]">
                            <strong className="block text-[10px] uppercase">AI Original Draft:</strong>
                            {section.aiDraft}
                          </div>
                          <div className="p-2 bg-[#E8F5E9] dark:bg-[#1B2E1D] text-[#2E7D32] dark:text-[#81C784]">
                            <strong className="block text-[10px] uppercase">Clinician Modified:</strong>
                            {section.clinicianContent}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SOAP Synthesis View */}
      {activeTab === 'SOAP_VIEW' && synthesis.soapDraft && (
        <div className="p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
            <h4 className="text-sm font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
              Structured SOAP Consultation Brief
            </h4>
            <span className="text-xs font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
              Draft for Clinician Review
            </span>
          </div>

          <div className="space-y-4 font-sans text-xs sm:text-sm">
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-xs font-mono font-bold text-[#8C2424] dark:text-[#E07A5F] block mb-1">
                S — SUBJECTIVE
              </span>
              <p className="text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed whitespace-pre-wrap">
                {synthesis.soapDraft.subjective}
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-xs font-mono font-bold text-[#8C2424] dark:text-[#E07A5F] block mb-1">
                O — OBJECTIVE
              </span>
              <p className="text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed whitespace-pre-wrap">
                {synthesis.soapDraft.objective}
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-xs font-mono font-bold text-[#8C2424] dark:text-[#E07A5F] block mb-1">
                A — ASSESSMENT SUPPORT
              </span>
              <p className="text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed whitespace-pre-wrap">
                {synthesis.soapDraft.assessmentSupport}
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <span className="text-xs font-mono font-bold text-[#8C2424] dark:text-[#E07A5F] block mb-1">
                P — PLAN DISCUSSION POINTS
              </span>
              <p className="text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed whitespace-pre-wrap">
                {synthesis.soapDraft.planDiscussionPoints}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail View */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="p-5 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-3">
          <div className="text-xs font-mono font-semibold uppercase text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
            Clinical Synthesis Version & Review History
          </div>

          <div className="space-y-2">
            {synthesis.auditTrail.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5 flex items-start justify-between text-xs font-mono">
                <div>
                  <div className="font-semibold text-[#1A1A1A] dark:text-[#EAE5DD]">
                    {item.action} {item.sectionKey ? `• Section: ${item.sectionKey}` : ''}
                  </div>
                  <div className="text-[11px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 mt-0.5">
                    Reviewer: {item.reviewerId} • {item.notes || 'Routine workflow update'}
                  </div>
                </div>
                <span className="text-[10px] text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finalize Modal */}
      {isFinalizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 rounded-sm shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784]" />
                <h4 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Finalize Clinical Synthesis
                </h4>
              </div>
              <button onClick={() => setIsFinalizing(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]">
                ✕
              </button>
            </div>

            {/* Quality Gate Checks */}
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-2">
              <div className="text-xs font-mono font-semibold uppercase text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                Quality & Safety Gates
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#2E7D32] dark:text-[#81C784]">
                  <Check className="w-3.5 h-3.5" />
                  No unsupported numbers or hallucinated biomarker deltas
                </div>
                <div className="flex items-center gap-2 text-[#2E7D32] dark:text-[#81C784]">
                  <Check className="w-3.5 h-3.5" />
                  All structured claims mapped to source records and ML models
                </div>
                <div className="flex items-center gap-2 text-[#2E7D32] dark:text-[#81C784]">
                  <Check className="w-3.5 h-3.5" />
                  Human clinician review verification active
                </div>
              </div>
            </div>

            {/* Visibility Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-medium text-[#1A1A1A] dark:text-[#EAE5DD]">
                Document Visibility Scope
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFinalizeVisibility('CLINICIAN_ONLY')}
                  className={`p-3 text-left border rounded-sm transition-all ${
                    finalizeVisibility === 'CLINICIAN_ONLY'
                      ? 'border-[#1A1A1A] bg-[#FAF8F5] dark:border-[#EAE5DD] dark:bg-[#201F1C]'
                      : 'border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Clinician Only
                  </div>
                  <div className="text-[11px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 mt-0.5">
                    Internal medical record consultation note
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFinalizeVisibility('PATIENT_VISIBLE')}
                  className={`p-3 text-left border rounded-sm transition-all ${
                    finalizeVisibility === 'PATIENT_VISIBLE'
                      ? 'border-[#1A1A1A] bg-[#FAF8F5] dark:border-[#EAE5DD] dark:bg-[#201F1C]'
                      : 'border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Patient Visible
                  </div>
                  <div className="text-[11px] text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 mt-0.5">
                    Summary accessible in Patient Portal
                  </div>
                </button>
              </div>
            </div>

            {/* Finalize Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                Attending Review Notes (Optional)
              </label>
              <input
                type="text"
                value={finalizeNotes}
                onChange={(e) => setFinalizeNotes(e.target.value)}
                placeholder="e.g. Reviewed during morning clinic session"
                className="w-full p-2.5 text-xs bg-[#FAF8F5] dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 rounded-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
              <button
                onClick={() => setIsFinalizing(false)}
                className="px-4 py-2 text-xs font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15"
              >
                Cancel
              </button>
              <button
                disabled={isSavingAction}
                onClick={handleFinalize}
                className="px-4 py-2 text-xs font-mono font-medium bg-[#2E7D32] text-white hover:bg-[#2E7D32]/90 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Sign Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
