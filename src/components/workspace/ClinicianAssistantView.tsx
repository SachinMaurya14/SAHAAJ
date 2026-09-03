import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  Save, 
  Download,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Activity,
  History,
  HelpCircle,
  Cpu,
  UserCheck
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { GeminiService } from '../../services/geminiService';
import { AskSaahajDrawer } from '../common/AskSaahajDrawer';
import { 
  ClinicalBriefing, 
  ClinicalSnapshot, 
  ClinicalSynthesis, 
  ClinicalSynthesisSection, 
  PatientExplanationDraft, 
  ClinicianReviewQueueItem,
  ClinicianNote,
  EvidenceLineageItem 
} from '../../types/clinicianTypes';
import { ClinicianApiService } from '../../services/clinicianApiService';
import { ClinicalSnapshotCard } from './components/clinician/ClinicalSnapshotCard';
import { ClinicalSynthesisEditor } from './components/clinician/ClinicalSynthesisEditor';
import { PatientExplanationModal } from './components/clinician/PatientExplanationModal';
import { ClinicalEvidenceGraph } from './components/clinician/ClinicalEvidenceGraph';
import { ClinicianReviewQueue } from './components/clinician/ClinicianReviewQueue';
import { ClinicianAuditModal } from './components/clinician/ClinicianAuditModal';

export const ClinicianAssistantView: React.FC = () => {
  const { userProfile, documents, timelineEvents } = useHealthData();
  const currentPatientId = 'patient-user-primary';

  // Workspace View State
  const [activeTab, setActiveTab] = useState<'SYNTHESIS' | 'BRIEFING' | 'NOTES' | 'PATIENT_EXPLANATIONS'>('SYNTHESIS');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'EVIDENCE' | 'QUEUE' | 'MODELS'>('EVIDENCE');
  
  // Data States
  const [snapshot, setSnapshot] = useState<ClinicalSnapshot | null>(null);
  const [briefing, setBriefing] = useState<ClinicalBriefing | null>(null);
  const [activeSynthesis, setActiveSynthesis] = useState<ClinicalSynthesis | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ClinicianReviewQueueItem[]>([]);
  const [patientExplanations, setPatientExplanations] = useState<PatientExplanationDraft[]>([]);
  const [clinicianNotesList, setClinicianNotesList] = useState<ClinicianNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Modal States
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [explanationInitialFinding, setExplanationInitialFinding] = useState('Laboratory Observation');
  const [explanationInitialText, setExplanationInitialText] = useState('');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAskSaahajOpen, setIsAskSaahajOpen] = useState(false);

  // Note authoring buffer
  const [noteContentBuffer, setNoteContentBuffer] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'CLINICIAN_ONLY' | 'PATIENT_VISIBLE'>('CLINICIAN_ONLY');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch initial clinician workspace data
  const loadClinicianData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch snapshot
      const snap = await ClinicianApiService.getSnapshot(currentPatientId);
      setSnapshot(snap);

      // 2. Fetch briefing
      const brief = await ClinicianApiService.getBriefing(currentPatientId);
      setBriefing(brief);

      // 3. Fetch existing syntheses or generate initial
      const synthList = await ClinicianApiService.listSyntheses(currentPatientId);
      if (synthList.syntheses && synthList.syntheses.length > 0) {
        setActiveSynthesis(synthList.syntheses[0]);
      } else {
        const initialSynth = await ClinicianApiService.generateSynthesis(currentPatientId);
        setActiveSynthesis(initialSynth);
      }

      // 4. Fetch review queue
      const q = await ClinicianApiService.getReviewQueue();
      setReviewQueue(q.queue);

      // 5. Fetch patient explanations
      const expl = await ClinicianApiService.listPatientExplanations(currentPatientId);
      setPatientExplanations(expl.explanations);

      // 6. Fetch clinician notes
      const notes = await ClinicianApiService.listNotes(currentPatientId);
      setClinicianNotesList(notes.notes);

      // 7. Fetch audit logs
      const audit = await ClinicianApiService.getAuditLogs();
      setAuditLogs(audit.logs);
    } catch (err) {
      console.warn('Clinician workspace API fallback to local data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadClinicianData();
  }, [currentPatientId]);

  const handleGenerateNewSynthesis = async () => {
    setIsGeneratingSynthesis(true);
    try {
      const newSynth = await ClinicianApiService.generateSynthesis(currentPatientId);
      setActiveSynthesis(newSynth);
      setActiveTab('SYNTHESIS');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSynthesis(false);
    }
  };

  const handleSaveClinicianNote = async () => {
    if (!noteContentBuffer.trim()) return;
    setIsSavingNote(true);
    try {
      const saved = await ClinicianApiService.saveNote(
        currentPatientId,
        noteContentBuffer,
        noteVisibility,
        ['Consultation Addendum']
      );
      setClinicianNotesList([saved, ...clinicianNotesList]);
      setNoteContentBuffer('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleOpenExplanationModal = (finding: string, text: string) => {
    setExplanationInitialFinding(finding);
    setExplanationInitialText(text);
    setIsExplanationModalOpen(true);
  };

  // Compile all evidence items from synthesis and snapshot
  const aggregatedEvidence: EvidenceLineageItem[] = [];
  if (activeSynthesis) {
    activeSynthesis.sections.forEach(s => {
      if (s.evidence) aggregatedEvidence.push(...s.evidence);
    });
  }

  return (
    <div id="clinician-workspace-v8" className="space-y-6 max-w-full">
      
      {/* Top Clinical Header & Context Bar */}
      <div className="p-6 sm:p-7 bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#8C2424]/10 text-[#8C2424] dark:bg-[#E07A5F]/15 dark:text-[#E07A5F] font-bold">
                CLINICIAN INTELLIGENCE & GOVERNANCE (V8)
              </span>
              <span className="text-xs font-mono text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                Authorized Role: Attending Physician
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                {userProfile?.personal.fullName || 'Aarav Sharma'}
              </h2>
              <span className="text-xs font-mono text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                {userProfile?.personal.age || 44}Y • {userProfile?.personal.sex || 'Male'} • Blood: {userProfile?.personal.bloodType || 'B+'} • Rec ID: {currentPatientId.substr(0, 12)}
              </span>
            </div>
          </div>

          {/* Clinician Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenExplanationModal('Selected Finding', 'Biomarker or diagnostic result to explain')}
              className="px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD] hover:bg-[#FAF8F5] flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8C2424] dark:text-[#E07A5F]" />
              Explain to Patient
            </button>

            <button
              onClick={handleGenerateNewSynthesis}
              disabled={isGeneratingSynthesis}
              className="px-3.5 py-1.5 text-xs font-mono bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A] hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50 transition-opacity"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSynthesis ? 'animate-spin' : ''}`} />
              {isGeneratingSynthesis ? 'Synthesizing...' : 'New AI Synthesis'}
            </button>

            <button
              onClick={() => setIsAskSaahajOpen(true)}
              className="px-3 py-1.5 text-xs font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A] dark:text-[#EAE5DD] hover:bg-[#FAF8F5] flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI
            </button>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-3 py-1.5 text-xs font-mono border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:text-[#1A1A1A] flex items-center gap-1.5"
              title="View immutable audit trail"
            >
              <History className="w-3.5 h-3.5" />
              Audit Log ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* Governance Safety Indicator */}
        <div className="p-3 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-start gap-2.5 text-xs font-mono text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#1A1A1A] dark:text-[#EAE5DD] uppercase tracking-wider text-[10px]">HUMAN-IN-THE-LOOP CLINICAL GOVERNANCE:</strong> AI-generated summaries are draft recommendations for reviewing physicians. All diagnostic conclusions, prescription adjustments, and patient handoffs require explicit clinician approval.
          </div>
        </div>
      </div>

      {/* Primary 3-Column / Adaptive Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Patient Context & Clinical Snapshot (4 Cols on lg, 3 Cols on xl) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          {snapshot ? (
            <ClinicalSnapshotCard
              snapshot={snapshot}
              onSelectFindingForExplanation={(finding, text) => handleOpenExplanationModal(finding, text)}
            />
          ) : (
            <div className="p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/10 text-center text-xs font-mono text-[#1A1A1A]/40">
              Loading clinical snapshot...
            </div>
          )}

          {/* Quick Review Queue summary */}
          <ClinicianReviewQueue
            queueItems={reviewQueue}
            onSelectQueueItem={(item) => {
              if (item.itemType === 'AI_DRAFT') setActiveTab('SYNTHESIS');
              else if (item.itemType === 'DATA_CONFLICT') setActiveTab('BRIEFING');
            }}
          />
        </div>

        {/* CENTER COLUMN: Active Clinical Workspace Area (5-8 Cols) */}
        <div className={isRightPanelOpen ? 'lg:col-span-8 xl:col-span-5 space-y-6' : 'lg:col-span-8 xl:col-span-8 space-y-6'}>
          
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
              <button
                onClick={() => setActiveTab('SYNTHESIS')}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-all ${
                  activeTab === 'SYNTHESIS'
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A] font-medium'
                    : 'text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C]'
                }`}
              >
                AI Synthesis & Review
              </button>

              <button
                onClick={() => setActiveTab('BRIEFING')}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-all ${
                  activeTab === 'BRIEFING'
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A] font-medium'
                    : 'text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C]'
                }`}
              >
                Structured Briefing
              </button>

              <button
                onClick={() => setActiveTab('NOTES')}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-all ${
                  activeTab === 'NOTES'
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A] font-medium'
                    : 'text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C]'
                }`}
              >
                Clinician Notes ({clinicianNotesList.length})
              </button>

              <button
                onClick={() => setActiveTab('PATIENT_EXPLANATIONS')}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-all ${
                  activeTab === 'PATIENT_EXPLANATIONS'
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A] font-medium'
                    : 'text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:bg-[#FAF8F5] dark:hover:bg-[#201F1C]'
                }`}
              >
                Patient Handoffs ({patientExplanations.length})
              </button>
            </div>

            {/* Toggle right drawer */}
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 hover:text-[#1A1A1A] px-2 py-1 border border-[#1A1A1A]/10 rounded-sm"
            >
              {isRightPanelOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              <span>{isRightPanelOpen ? 'Collapse Evidence' : 'Expand Evidence'}</span>
            </button>
          </div>

          {/* TAB 1: AI Clinical Synthesis & Interactive Editor */}
          {activeTab === 'SYNTHESIS' && (
            <div>
              {activeSynthesis ? (
                <ClinicalSynthesisEditor
                  synthesis={activeSynthesis}
                  onSynthesisUpdated={(updated) => setActiveSynthesis(updated)}
                  onOpenPatientExplanation={(finding, text) => handleOpenExplanationModal(finding, text)}
                />
              ) : (
                <div className="p-8 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 text-center text-xs font-mono text-[#1A1A1A]/50">
                  No active clinical synthesis. Click "New AI Synthesis" above to generate grounded draft.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Structured Clinical Briefing */}
          {activeTab === 'BRIEFING' && briefing && (
            <div className="p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8C2424] dark:text-[#E07A5F]" />
                  <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                    Comprehensive Clinical Briefing
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Grounded in {briefing.evidenceItemsCount} Observations
                </span>
              </div>

              <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs sm:text-sm font-sans leading-relaxed text-[#1A1A1A] dark:text-[#EAE5DD] whitespace-pre-wrap">
                {briefing.aiBriefingSummary}
              </div>

              {/* Longitudinal Shifts Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                  Key Changes Tracked ({briefing.keyChangesCount})
                </h4>
                <div className="space-y-2">
                  {briefing.snapshot.recentBiomarkers.filter(b => b.deltaFromPrior).map((b, idx) => (
                    <div key={idx} className="p-3 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <strong className="text-[#1A1A1A] dark:text-[#EAE5DD]">{b.parameterName}</strong>
                        <span className="text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60 ml-2">({b.sourceDocumentName})</span>
                      </div>
                      <div className="font-bold text-[#8C2424] dark:text-[#E07A5F]">
                        {b.deltaFromPrior?.direction === 'INCREASING' ? '+' : ''}{b.deltaFromPrior?.absoluteDelta} {b.unit} ({b.deltaFromPrior?.percentDelta}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Clinician Notes Scratchpad */}
          {activeTab === 'NOTES' && (
            <div className="p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Attending Physician Notes
                </h3>
                <span className="text-xs font-mono text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                  Role-Based Note Privacy
                </span>
              </div>

              {/* Author New Note */}
              <div className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-3">
                <textarea
                  rows={4}
                  value={noteContentBuffer}
                  onChange={(e) => setNoteContentBuffer(e.target.value)}
                  placeholder="Record private clinical impression, diagnostic hypotheses, or medication adjustments..."
                  className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-[#151412] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 rounded-sm text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteVisibility('CLINICIAN_ONLY')}
                      className={`px-3 py-1 text-xs font-mono border rounded-sm flex items-center gap-1 ${
                        noteVisibility === 'CLINICIAN_ONLY'
                          ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A]'
                          : 'border-[#1A1A1A]/15 text-[#1A1A1A]/60'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Clinician Only (Private)
                    </button>

                    <button
                      type="button"
                      onClick={() => setNoteVisibility('PATIENT_VISIBLE')}
                      className={`px-3 py-1 text-xs font-mono border rounded-sm flex items-center gap-1 ${
                        noteVisibility === 'PATIENT_VISIBLE'
                          ? 'bg-[#1A1A1A] text-white dark:bg-[#EAE5DD] dark:text-[#1A1A1A]'
                          : 'border-[#1A1A1A]/15 text-[#1A1A1A]/60'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      Patient Visible
                    </button>
                  </div>

                  <button
                    disabled={isSavingNote || !noteContentBuffer.trim()}
                    onClick={handleSaveClinicianNote}
                    className="px-4 py-1.5 text-xs font-mono bg-[#8C2424] text-white hover:bg-[#8C2424]/90 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>

              {/* List of Existing Notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                  Recorded Notes ({clinicianNotesList.length})
                </h4>

                {clinicianNotesList.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
                    No clinician notes logged yet for this patient.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {clinicianNotesList.map((n, idx) => (
                      <div key={n.noteId || idx} className="p-4 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-[#1A1A1A] dark:text-[#EAE5DD]">{n.clinicianName}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] uppercase rounded-sm ${
                              n.visibility === 'PATIENT_VISIBLE'
                                ? 'bg-[#2E7D32]/10 text-[#2E7D32]'
                                : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/70 dark:bg-[#EAE5DD]/5 dark:text-[#EAE5DD]/70'
                            }`}>
                              {n.visibility === 'PATIENT_VISIBLE' ? 'Patient Visible' : 'Clinician Only'}
                            </span>
                            <span className="text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-sans text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed whitespace-pre-wrap">
                          {n.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Patient Handoffs & Explanations */}
          {activeTab === 'PATIENT_EXPLANATIONS' && (
            <div className="p-6 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                <h3 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Patient-Friendly Explanations & Handoffs
                </h3>
                <button
                  onClick={() => handleOpenExplanationModal('Laboratory Finding', 'Select or enter finding to explain')}
                  className="px-3 py-1 text-xs font-mono bg-[#8C2424] text-white hover:bg-[#8C2424]/90 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  New Patient Explanation
                </button>
              </div>

              {patientExplanations.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
                  No patient explanations prepared yet. Click "New Patient Explanation" to translate a technical finding into plain language.
                </div>
              ) : (
                <div className="space-y-4">
                  {patientExplanations.map((exp, idx) => (
                    <div key={exp.explanationId || idx} className="p-4 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 rounded-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">
                          Finding: {exp.sourceFinding}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm ${
                          exp.status === 'APPROVED_AND_SHARED'
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32]'
                            : 'bg-[#E65100]/10 text-[#E65100]'
                        }`}>
                          {exp.status === 'APPROVED_AND_SHARED' ? 'Shared to Patient' : 'Draft'}
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#151412] border border-[#1A1A1A]/5 rounded-sm text-xs text-[#1A1A1A] dark:text-[#EAE5DD] leading-relaxed">
                        {exp.clinicianApprovedText || exp.patientFriendlyDraft}
                      </div>

                      {exp.recommendedFollowUpQuestions && (
                        <div className="text-[11px] font-mono text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                          Follow-up Topics: {exp.recommendedFollowUpQuestions.join('; ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Evidence Lineage Graph & ML/Imaging Inspector (3 Cols on xl) */}
        {isRightPanelOpen && (
          <div className="hidden xl:block xl:col-span-3 space-y-6">
            <ClinicalEvidenceGraph
              evidenceItems={aggregatedEvidence}
            />

            {/* Model & Imaging Transparency Card */}
            <div className="p-4 bg-white dark:bg-[#1C1B18] border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 rounded-sm space-y-3 text-xs font-mono">
              <div className="flex items-center gap-2 font-bold uppercase text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
                <Cpu className="w-4 h-4 text-[#2E7D32]" />
                Algorithmic Provenance
              </div>

              <div className="space-y-2 text-[11px] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70">
                <div className="p-2 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/5">
                  <div className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">DenseNet-121 (V6)</div>
                  <div>Optical gating + 14-pathology multi-label chest radiography.</div>
                </div>

                <div className="p-2 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/5">
                  <div className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Tabular Risk Engine (V5)</div>
                  <div>XGBoost / LightGBM metabolic risk screening models.</div>
                </div>

                <div className="p-2 bg-[#FAF8F5] dark:bg-[#201F1C] border border-[#1A1A1A]/5">
                  <div className="font-bold text-[#1A1A1A] dark:text-[#EAE5DD]">Longitudinal History (V7)</div>
                  <div>Deterministic delta calculators across multi-point observation dates.</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Explanation Modal */}
      {isExplanationModalOpen && (
        <PatientExplanationModal
          patientId={currentPatientId}
          initialFinding={explanationInitialFinding}
          initialText={explanationInitialText}
          onClose={() => setIsExplanationModalOpen(false)}
          onShared={(exp) => {
            setPatientExplanations([exp, ...patientExplanations]);
          }}
        />
      )}

      {/* Audit Modal */}
      {isAuditModalOpen && (
        <ClinicianAuditModal
          logs={auditLogs}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

      {/* Ask SAAHAJ Drawer */}
      <AskSaahajDrawer
        isOpen={isAskSaahajOpen}
        onClose={() => setIsAskSaahajOpen(false)}
        contextType="Clinician Workspace V8"
        currentContext={{
          patient: userProfile?.personal.fullName || 'Aarav Sharma',
          age: userProfile?.personal.age || 44,
          snapshot,
          briefing: briefing?.aiBriefingSummary
        }}
        userRole="clinician"
        initialPrompt="Summarize any significant biomarker shifts or clinical documentation gaps for this patient."
      />

    </div>
  );
};
