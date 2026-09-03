/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinician Intelligence & Governance Types (V8)
 * Data schemas for clinical synthesis, human-in-the-loop review, patient handoff,
 * evidence lineage, and role-based clinician-patient governance.
 */

export type ClinicianRole = 'ATTENDING_PHYSICIAN' | 'FELLOW' | 'RESIDENT' | 'CLINICAL_SPECIALIST' | 'PRIMARY_CARE_PROVIDER';

export type SynthesisStatus = 'DRAFT' | 'IN_REVIEW' | 'EDITED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export type SectionReviewStatus = 'PENDING_REVIEW' | 'ACCEPTED' | 'EDITED' | 'REJECTED';

export type ContentVisibility = 'PATIENT_VISIBLE' | 'CLINICIAN_ONLY' | 'INTERNAL_AI_DRAFT';

export type ReviewActionType = 'ACCEPT' | 'EDIT' | 'REJECT' | 'FINALIZE' | 'REGENERATE' | 'SHARE_WITH_PATIENT';

export type LineageSourceType = 
  | 'PATIENT_RECORD'
  | 'CLINICIAN_ENTERED'
  | 'LAB_REPORT'
  | 'RADIOLOGY_REPORT'
  | 'IMAGING_MODEL'
  | 'ML_MODEL'
  | 'MEDICAL_KNOWLEDGE'
  | 'AI_SYNTHESIS';

export interface EvidenceLineageItem {
  lineageId: string;
  claim: string;
  sourceType: LineageSourceType;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  pageNumber?: number;
  extractedFactId?: string;
  modelId?: string;
  modelVersion?: string;
  confidence?: number;
  dateObserved?: string;
  citationText?: string;
  isConflict?: boolean;
  conflictDetails?: string;
}

export interface ClinicalSynthesisSection {
  sectionId: string;
  key: string;
  title: string;
  aiDraft: string;
  clinicianContent: string;
  status: SectionReviewStatus;
  visibility: ContentVisibility;
  evidence: EvidenceLineageItem[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  rejectionReason?: string;
}

export interface ClinicalSynthesis {
  synthesisId: string;
  patientId: string;
  clinicianId: string;
  version: number;
  status: SynthesisStatus;
  visibility: ContentVisibility;
  title: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
  finalizedBy?: string;
  aiModel: string;
  aiModelVersion: string;
  inputSnapshotReference: {
    documentCount: number;
    factCount: number;
    riskAssessmentIds: string[];
    imagingStudyIds: string[];
    asOfDate: string;
  };
  sections: ClinicalSynthesisSection[];
  soapDraft?: {
    subjective: string;
    objective: string;
    assessmentSupport: string;
    planDiscussionPoints: string;
  };
  qualityGateChecks: {
    noUnresolvedNumericMismatch: boolean;
    allSourcesTraceable: boolean;
    noUnsupportedClaims: boolean;
    clinicianReviewedAll: boolean;
  };
  auditTrail: ClinicalReviewAction[];
}

export interface ClinicalReviewAction {
  actionId: string;
  synthesisId: string;
  reviewerId: string;
  action: ReviewActionType;
  sectionKey?: string;
  timestamp: string;
  notes?: string;
  previousContent?: string;
  newContent?: string;
}

export interface ClinicalSnapshot {
  patientId: string;
  patientName: string;
  age?: number;
  sex?: string;
  lastRecordDate?: string;
  vitalSigns: {
    bp?: string;
    heartRate?: number;
    bmi?: number;
    weightKg?: number;
    heightCm?: number;
    lastRecorded?: string;
  };
  recentBiomarkers: Array<{
    parameterName: string;
    normalizedValue: number;
    unit: string;
    referenceRange?: string;
    status: 'NORMAL' | 'ELEVATED' | 'LOW' | 'CRITICAL';
    observedDate: string;
    sourceDocumentName: string;
    deltaFromPrior?: {
      absoluteDelta: number;
      percentDelta: number;
      priorDate: string;
      direction: 'INCREASING' | 'DECREASING' | 'STABLE';
    };
  }>;
  recentRiskAssessments: Array<{
    modelId: string;
    modelName: string;
    domain: string;
    riskScorePercent: number;
    riskCategory: string;
    assessedDate: string;
    modelVersion: string;
  }>;
  recentImagingStudies: Array<{
    studyId: string;
    modality: string;
    bodyRegion: string;
    studyDate: string;
    topFindings: Array<{
      label: string;
      probability: number;
      status: string;
    }>;
    qualityStatus: string;
  }>;
  medicationContext: Array<{
    medicationName: string;
    dosage?: string;
    status: 'ACTIVE' | 'DISCONTINUED' | 'CHANGED' | 'UNCONFIRMED';
    lastMentionedDate: string;
    sourceDocument: string;
  }>;
  dataGaps: string[];
  dataConflicts: Array<{
    concept: string;
    sourceA: { name: string; date: string; value: string };
    sourceB: { name: string; date: string; value: string };
    description: string;
  }>;
}

export interface ClinicalBriefing {
  patientId: string;
  generatedAt: string;
  snapshot: ClinicalSnapshot;
  aiBriefingSummary: string;
  keyChangesCount: number;
  unresolvedGapsCount: number;
  evidenceItemsCount: number;
}

export interface PatientExplanationDraft {
  explanationId: string;
  patientId: string;
  clinicianId: string;
  sourceFinding: string;
  sourceDocumentOrModel: string;
  technicalFindingText: string;
  patientFriendlyDraft: string;
  clinicianApprovedText?: string;
  status: 'DRAFT' | 'APPROVED_AND_SHARED';
  uncertaintyNotes?: string;
  recommendedFollowUpQuestions: string[];
  createdAt: string;
  sharedAt?: string;
}

export interface ClinicianNote {
  noteId: string;
  patientId: string;
  clinicianId: string;
  clinicianName: string;
  content: string;
  visibility: ContentVisibility;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ClinicianReviewQueueItem {
  queueId: string;
  patientId: string;
  patientName: string;
  itemType: 'AI_DRAFT' | 'DATA_CONFLICT' | 'UNREVIEWED_MODEL' | 'UNREVIEWED_IMAGING' | 'DATA_GAP';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: string;
  referenceId: string;
  isResolved: boolean;
}

export interface ClinicianPatientAccess {
  relationId: string;
  clinicianId: string;
  patientId: string;
  patientName: string;
  accessGrantedDate: string;
  authorizedScope: 'FULL_CLINICAL' | 'CONSULTATION_READ' | 'IMAGING_ONLY';
  isActive: boolean;
}
