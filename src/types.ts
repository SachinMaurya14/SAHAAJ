export type UserRole = 'patient' | 'clinician';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ParameterStatus = 'within_range' | 'low' | 'high' | 'critical' | 'unassessed';

export type InterpretationTag = 'EXTRACTED_FACT' | 'MODEL_INTERPRETATION' | 'LLM_EXPLANATION';

export interface ExtractedParameter {
  id: string;
  name: string;
  category: 'Hematology' | 'Metabolic & Glycemic' | 'Lipid Profile' | 'Kidney Function' | 'Liver Function' | 'Electrolytes' | 'Cardiovascular' | 'Thyroid' | 'Other';
  value: number | string;
  unit: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
  referenceRangeText: string;
  status: ParameterStatus;
  patientExplanation: string;
  clinicianNotes?: string;
  sourcePage: number;
  sourceSnippet: string;
  confidence: number;
  provenance: InterpretationTag;
}

export type DocumentType = 
  | 'lab_report'
  | 'prescription'
  | 'discharge_summary'
  | 'x_ray'
  | 'ct_scan'
  | 'mri'
  | 'clinical_notes';

export type DocumentStatus = 
  | 'Uploaded'
  | 'Processing'
  | 'Analyzed'
  | 'Needs Review'
  | 'Failed';

export interface MedicalDocument {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  facility: string;
  orderingPhysician?: string;
  status: DocumentStatus;
  fileSize: string;
  parametersCount: number;
  abnormalCount: number;
  rawTextPreview?: string;
  extractedParameters: ExtractedParameter[];
  summary: string;
  provenanceDetails: {
    ocrEngine: string;
    nlpModel: string;
    extractionDate: string;
    extractionConfidence: number;
  };
}

export interface LongitudinalComparison {
  markerName: string;
  category: string;
  unit: string;
  baselineDate: string;
  baselineValue: number;
  currentDate: string;
  currentValue: number;
  referenceRange: string;
  deltaPercent: number;
  status: 'improved' | 'worsened' | 'stable' | 'newly_observed' | 'persistent';
  clinicalSignificance: string;
  patientTakeaway: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  category: 'Lab Panel' | 'Imaging' | 'Risk Evaluation' | 'Prescription' | 'Clinical Encounter' | 'Vitals Change';
  type: 'report' | 'imaging' | 'risk_model' | 'medication' | 'doctor_note' | 'event';
  summary: string;
  badge?: string;
  badgeColor?: string;
  relatedDocId?: string;
  metrics?: { label: string; value: string; status?: ParameterStatus }[];
  physician?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'insufficient_data';

export interface TabularRiskModel {
  id: string;
  name: string;
  system: 'Cardiovascular' | 'Metabolic & Diabetes' | 'Renal / CKD' | 'Hepatic / Liver' | 'Hypertension' | 'Anemia' | 'Metabolic Syndrome' | 'Respiratory' | 'Stroke';
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  inputCompleteness: number; // percentage
  statusText: string;
  contributingFactors: {
    factor: string;
    value: string;
    impact: 'elevating' | 'protective' | 'neutral';
    weight: number; // 0 to 1
  }[];
  modelProvenance: {
    modelName: string;
    version: string;
    architecture: 'Gradient Boosting (XGBoost)' | 'Random Forest Ensemble' | 'Calibrated Logistic Regressor' | 'Multi-Layer Perceptron' | 'Cox Proportional Hazards';
    validationDataset: string;
    calibrationMetric: string;
    timestamp: string;
    limitations: string;
  };
  missingInputs: string[];
  patientExplanation: string;
  clinicianGuidance: string;
}

export interface MedicalImageStudy {
  id: string;
  title: string;
  modality: 'X-Ray' | 'CT' | 'MRI';
  bodyRegion: 'Chest' | 'Brain' | 'Knee / Musculoskeletal' | 'Abdomen';
  date: string;
  indication: string;
  imageUrl: string;
  gradcamOverlayUrl: string;
  modelStatus: 'Available' | 'Processing' | 'Model not connected yet';
  modelConfidence: number;
  findings: {
    finding: string;
    probability: number;
    region: string;
    clinicalNote: string;
  }[];
  modelProvenance: {
    architecture: string;
    modelName: string;
    version: string;
    inputResolution: string;
    gradCamTargetLayer: string;
    limitations: string;
  };
}

export interface HealthProfile {
  personal: {
    fullName: string;
    age: number;
    sex: 'Female' | 'Male' | 'Other';
    heightCm: number;
    weightKg: number;
    bloodType: string;
    bpSystolic: number;
    bpDiastolic: number;
    restingHeartRate: number;
  };
  lifestyle: {
    activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
    sleepHoursPerNight: number;
    dietaryPattern: 'Balanced' | 'Low Carb / Keto' | 'Vegetarian' | 'Mediterranean' | 'High Sodium / Processed';
    smokingStatus: 'Never' | 'Former' | 'Occasional' | 'Current';
    alcoholUnitsPerWeek: number;
  };
  medicalHistory: {
    diagnosedConditions: string[];
    familyHistory: string[];
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      adherenceRate: number;
      prescribedFor: string;
    }[];
    allergies: string[];
  };
}

export interface AppointmentPrep {
  targetDate: string;
  doctorName: string;
  specialty: string;
  reasonForVisit: string;
  keyChangesSinceLastVisit: string[];
  abnormalMarkersToDiscuss: string[];
  userReportedSymptoms: {
    symptom: string;
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    notes: string;
  }[];
  tailoredQuestionsForDoctor: {
    category: string;
    question: string;
    rationale: string;
  }[];
}

export interface HealthInsight {
  id: string;
  type: 'trend' | 'report_change' | 'missing_data' | 'risk_factor' | 'followup_question' | 'educational';
  title: string;
  summary: string;
  evidenceSource: string;
  urgency: 'routine' | 'informational' | 'attention_recommended';
  actionableStep?: string;
  category: string;
}

export type HealthEventType = 
  | 'PROFILE_UPDATED'
  | 'VITAL_ENTERED'
  | 'LAB_RESULT_IMPORTED'
  | 'REPORT_UPLOADED'
  | 'REPORT_ANALYZED'
  | 'RISK_ASSESSMENT_RUN'
  | 'IMAGING_ANALYSIS_RUN'
  | 'MEDICATION_ADDED'
  | 'MEDICATION_UPDATED'
  | 'CLINICIAN_NOTE_ADDED'
  | 'USER_CORRECTION'
  | 'APPOINTMENT_PREPARED';

export interface HealthEvent {
  event_id: string;
  event_type: HealthEventType;
  timestamp: string;
  source: string;
  related_record_id?: string;
  user_id?: string;
  title: string;
  description: string;
  details?: Record<string, any>;
  category?: 'Lab Panel' | 'Imaging' | 'Risk Evaluation' | 'Prescription' | 'Clinical Encounter' | 'Vitals Change';
  metrics?: { label: string; value: string; status?: ParameterStatus }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operation: string;
  modelIdentifier?: string;
  inputCategory: string;
  status: 'success' | 'failure';
  latencyMs?: number;
  tokensUsed?: number;
}

export interface GeminiExplanationResponse {
  summary: string;
  key_points: string[];
  data_used: {
    provided: string[];
    missing: string[];
  };
  biological_context: string;
  technical_mechanism?: string;
  uncertainties: string[];
  questions_for_clinician: string[];
  safety_notice: string;
}

export interface GeminiReportSummaryResponse {
  report_title: string;
  summary: string;
  important_findings: string[];
  abnormal_markers: {
    name: string;
    value: string;
    reference_range: string;
    clinical_note: string;
  }[];
  medical_terms_glossary: {
    term: string;
    patient_friendly_definition: string;
  }[];
  comparison_with_baseline?: string;
  questions_for_clinician: string[];
  safety_notice: string;
}

// ==========================================
// V3 — REAL MEDICAL RAG & DOCUMENT INTELLIGENCE
// ==========================================

export type ProcessingStatus = 
  | 'UPLOADED'
  | 'VALIDATING'
  | 'PARSING'
  | 'OCR_PROCESSING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'INDEXING'
  | 'READY'
  | 'FAILED';

export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'png' | 'jpg' | 'jpeg';

export interface V3Document {
  document_id: string;
  user_id: string;
  filename: string;
  file_type: SupportedFileType;
  file_size: number;
  uploaded_at: string;
  processed_at?: string;
  processing_status: ProcessingStatus;
  source_type: 'lab_report' | 'clinical_note' | 'prescription' | 'radiology_report' | 'discharge_summary' | 'other';
  checksum: string; // SHA-256 content hash
  page_count: number;
  processing_error?: string;
  ocr_confidence?: number;
  extracted_observations_count: number;
  chunks_count: number;
  title: string;
  facility?: string;
  report_date?: string;
  ordering_physician?: string;
  raw_text_preview?: string;
  processing_version?: {
    parser: string;
    ocr: string;
    chunker: string;
    embedder: string;
  };
}

export interface V3Page {
  page_id: string;
  document_id: string;
  page_number: number;
  text: string;
  detected_sections: string[];
  has_tables: boolean;
  extraction_method: 'NATIVE_TEXT' | 'OCR';
  ocr_confidence?: number;
}

export interface V3Chunk {
  chunk_id: string;
  document_id: string;
  page_number: number;
  section: string;
  chunk_index: number;
  text: string;
  token_count?: number;
  is_table_chunk?: boolean;
  table_metadata?: {
    headers: string[];
    rows: string[][];
  };
}

export interface V3Observation {
  observation_id: string;
  document_id: string;
  name: string;
  canonical_concept: string; // e.g. "HbA1c", "Glucose", "ALT"
  value: number | string;
  numeric_value?: number;
  unit: string;
  canonical_unit?: string;
  reference_low?: number;
  reference_high?: number;
  reference_range_text: string;
  reference_source: 'PRINTED_ON_DOCUMENT' | 'STANDARD_GUIDELINE';
  flag: 'within_range' | 'low' | 'high' | 'critical' | 'unassessed';
  page_number: number;
  source_chunk_id: string;
  source_snippet: string;
  extraction_confidence: number;
  needs_review: boolean;
  recorded_date?: string;
  user_corrected?: {
    original_value: string;
    corrected_value: string;
    reason?: string;
    corrected_at: string;
    corrected_by: string;
  };
}

export interface V3Citation {
  citation_id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  section: string;
  chunk_id: string;
  quoted_source_span: string;
  relevance_score: number;
  source_origin: 'FROM_YOUR_RECORDS' | 'GENERAL_HEALTH_INFORMATION';
}

export interface V3EvidenceItem {
  chunk_id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  section: string;
  text: string;
  relevance_score: number;
  lexical_score?: number;
  vector_score?: number;
  rerank_score?: number;
  extraction_confidence?: number;
  source_origin: 'FROM_YOUR_RECORDS' | 'GENERAL_HEALTH_INFORMATION';
}

export type GroundingStatus = 'GROUNDED' | 'INSUFFICIENT_EVIDENCE' | 'UNVERIFIED_CLAIMS';

export interface V3RAGResponse {
  query_id: string;
  answer: string;
  patient_friendly_summary?: string;
  technical_details?: string;
  grounding_status: GroundingStatus;
  sources: V3Citation[];
  evidence: V3EvidenceItem[];
  limitations: string[];
  missing_elements?: string[];
  reconciled_numeric_facts: {
    fact: string;
    source_value: string;
    reconciled: boolean;
  }[];
  trace_metadata: {
    query_scope: string;
    total_candidates_retrieved: number;
    selected_evidence_count: number;
    retrieval_latency_ms: number;
    gemini_latency_ms: number;
    total_latency_ms: number;
    hybrid_weights: { dense: number; sparse: number };
  };
  safety_notice: string;
}

export interface V3KnowledgeSource {
  source_id: string;
  title: string;
  publisher: string;
  source_type: 'Clinical Guideline' | 'Government Health Agency' | 'Peer-Reviewed Literature' | 'Medical Society';
  publication_date: string;
  topic: string;
  reference_url?: string;
  version: string;
  summary: string;
}

export interface V3DocumentCompareResult {
  document_a: { id: string; title: string; date: string };
  document_b: { id: string; title: string; date: string };
  numeric_deltas: {
    concept: string;
    name: string;
    unit: string;
    val_a: number | string;
    val_b: number | string;
    delta_numeric?: number;
    delta_percent?: number;
    direction: 'improved' | 'worsened' | 'stable' | 'new';
    page_a: number;
    page_b: number;
  }[];
  rag_explanation: string;
  citations: V3Citation[];
  grounding_status: GroundingStatus;
}
