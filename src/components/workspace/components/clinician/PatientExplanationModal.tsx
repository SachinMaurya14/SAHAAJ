import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  HelpCircle, 
  Edit3, 
  ShieldCheck, 
  Lock, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { PatientExplanationDraft } from '../../../../types/clinicianTypes';
import { ClinicianApiService } from '../../../../services/clinicianApiService';

interface PatientExplanationModalProps {
  patientId: string;
  initialFinding?: string;
  initialText?: string;
  onClose: () => void;
  onShared?: (explanation: PatientExplanationDraft) => void;
}

export const PatientExplanationModal: React.FC<PatientExplanationModalProps> = ({
  patientId,
  initialFinding = 'Laboratory Biomarker',
  initialText = '',
  onClose,
  onShared
}) => {
  const [sourceFinding, setSourceFinding] = useState(initialFinding);
  const [technicalText, setTechnicalText] = useState(initialText);
  const [draft, setDraft] = useState<PatientExplanationDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [editablePatientText, setEditablePatientText] = useState('');
  const [isSharedSuccess, setIsSharedSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!technicalText.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await ClinicianApiService.generatePatientExplanation(
        patientId,
        technicalText,
        sourceFinding
      );
      setDraft(generated);
      setEditablePatientText(generated.patientFriendlyDraft);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToPatient = async () => {
    if (!draft) return;
    setIsSharing(true);
    try {
      const result = await ClinicianApiService.sharePatientExplanation(
        draft.explanationId,
        editablePatientText
      );
      setIsSharedSuccess(true);
      if (onShared) onShared(result.explanation);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 rounded-sm shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C2424] dark:text-[#E07A5F]" />
            <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
              Explain Finding to Patient
            </h3>
          </div>
          <button onClick={onClose} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-sm">
            ✕
          </button>
        </div>

        {/* Input Finding / Context */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono font-medium text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 block mb-1">
              Technical Observation or Test Finding:
            </label>
            <textarea
              rows={3}
              value={technicalText}
              onChange={(e) => setTechnicalText(e.target.value)}
              placeholder="e.g. HbA1c measured at 6.2% (improved -0.4% from 6.6%). Fasting glucose 118 mg/dL."
              className="w-full p-2.5 text-xs bg-[#FAF8F5] dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#8C2424]"
            />
          </div>

          <div className="flex justify-end">
            <button
              disabled={isGenerating || !technicalText.trim()}
              onClick={handleGenerate}
              className="px-4 py-1.5 text-xs font-mono bg-[#8C2424] text-white hover:bg-[#8C2424]/90 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Drafting Patient Language...' : 'Generate Patient Draft'}
            </button>
          </div>
        </div>

        {/* Draft Area */}
        {draft && (
          <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#2E7D32]" />
                Patient-Friendly Preview (Editable)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#2E7D32]/10 text-[#2E7D32]">
                8th Grade Plain Language
              </span>
            </div>

            <textarea
              rows={4}
              value={editablePatientText}
              onChange={(e) => setEditablePatientText(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 rounded-sm leading-relaxed text-[#1A1A1A] dark:text-[#EAE5DD]"
            />

            {draft.recommendedFollowUpQuestions && draft.recommendedFollowUpQuestions.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#1A1A1A]/5 dark:border-[#EAE5DD]/5">
                <div className="text-[11px] font-mono font-semibold text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                  Recommended Discussion Questions for Patient:
                </div>
                <ul className="pl-4 list-disc text-xs text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 space-y-1">
                  {draft.recommendedFollowUpQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-2.5 bg-[#FFF8E1] dark:bg-[#2A2315] text-[11px] font-mono text-[#E65100] dark:text-[#FFB74D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Will be shared directly to the patient's portal once approved.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15"
              >
                Cancel
              </button>
              <button
                disabled={isSharing || isSharedSuccess}
                onClick={handleShareToPatient}
                className="px-4 py-1.5 text-xs font-mono font-medium bg-[#2E7D32] text-white hover:bg-[#2E7D32]/90 flex items-center gap-1.5"
              >
                {isSharedSuccess ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                {isSharedSuccess ? 'Shared to Patient Portal!' : 'Approve & Share with Patient'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
