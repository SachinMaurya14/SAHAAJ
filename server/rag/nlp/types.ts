/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Medical NLP Core Types & Schemas (V4)
 * Standardized, reproducible clinical document intelligence specifications.
 */

export type EntityType =
  | 'LAB_TEST'
  | 'LAB_VALUE'
  | 'UNIT'
  | 'REFERENCE_RANGE'
  | 'SYMPTOM'
  | 'CONDITION'
  | 'DIAGNOSIS_TERM'
  | 'MEDICATION'
  | 'DOSAGE'
  | 'FREQUENCY'
  | 'ROUTE'
  | 'BODY_SITE'
  | 'ANATOMICAL_STRUCTURE'
  | 'PROCEDURE'
  | 'IMAGING_FINDING'
  | 'IMAGING_MODALITY'
  | 'VITAL_SIGN'
  | 'ALLERGY'
  | 'FAMILY_HISTORY'
  | 'SOCIAL_HISTORY'
  | 'SMOKING'
  | 'ALCOHOL'
  | 'EXAMINATION_FINDING'
  | 'CLINICAL_RECOMMENDATION'
  | 'DATE'
  | 'DURATION';

export type AssertionState = 
  | 'PRESENT'          // Mentioned as active / positive finding
  | 'ABSENT'           // Explicitly negated (e.g. "no evidence of", "denies", "negative for")
  | 'POSSIBLE'         // Uncertain / differential / rule-out (e.g. "cannot exclude", "suspicious for", "possible")
  | 'HISTORICAL'       // Past condition / resolved / prior history
  | 'FAMILY_HISTORY'   // Condition noted in family member, NOT patient
  | 'CONDITIONAL'      // If/then context or hypothetical
  | 'UNKNOWN';         // Ambiguous assertion

export type TemporalityState =
  | 'current'          // Active now / current visit
  | 'historical'       // Past medical history / resolved
  | 'future_planned'   // Follow-up / scheduled / recommended
  | 'recent'           // Began in the last few days/weeks
  | 'unknown';

export type ClinicalSectionType =
  | 'CHIEF_COMPLAINT'
  | 'HISTORY_OF_PRESENT_ILLNESS'
  | 'PAST_MEDICAL_HISTORY'
  | 'FAMILY_HISTORY'
  | 'SOCIAL_HISTORY'
  | 'MEDICATIONS'
  | 'ALLERGIES'
  | 'REVIEW_OF_SYSTEMS'
  | 'PHYSICAL_EXAMINATION'
  | 'VITAL_SIGNS'
  | 'LABORATORY_RESULTS'
  | 'IMAGING_TECHNIQUE'
  | 'IMAGING_FINDINGS'
  | 'IMAGING_IMPRESSION'
  | 'IMAGING_RECOMMENDATIONS'
  | 'PATHOLOGY_SPECIMEN'
  | 'PATHOLOGY_DIAGNOSIS'
  | 'ASSESSMENT_AND_PLAN'
  | 'DISCHARGE_SUMMARY'
  | 'OTHER';

export type DocumentTypeCategory =
  | 'Laboratory'
  | 'Radiology'
  | 'Pathology'
  | 'Prescription'
  | 'Discharge Summary'
  | 'Clinical Note'
  | 'Cardiology'
  | 'Endocrinology'
  | 'Nephrology'
  | 'Oncology'
  | 'Neurology'
  | 'General Medicine'
  | 'Other';

export interface MedicalEntity {
  entity_id: string;
  document_id: string;
  chunk_id: string;
  text: string;
  canonical_name: string;
  entity_type: EntityType;
  start_offset: number;
  end_offset: number;
  page_number: number;
  section: string;
  section_type: ClinicalSectionType;
  assertion: AssertionState;
  temporality: TemporalityState;
  confidence: number;
  normalization_confidence?: number;
  model_name: string;
  model_version: string;
  // Specific attributes if applicable
  attributes?: {
    numeric_value?: number;
    unit?: string;
    reference_range?: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    duration?: string;
    severity?: string;
    anatomical_location?: string;
    relative_member?: string; // e.g. "father", "mother" for family history
  };
}

export type RelationType =
  | 'has_value'
  | 'has_unit'
  | 'has_reference_range'
  | 'has_dose'
  | 'has_frequency'
  | 'has_duration'
  | 'has_condition'
  | 'located_at'
  | 'has_measurement'
  | 'indicated_for'
  | 'related_to';

export interface ClinicalRelation {
  relation_id: string;
  document_id: string;
  source_entity_id: string;
  source_text: string;
  target_entity_id: string;
  target_text: string;
  relation_type: RelationType;
  confidence: number;
  model_name: string;
  model_version: string;
}

export interface StructuredHealthFact {
  fact_id: string;
  document_id: string;
  user_id: string;
  concept: string;
  canonical_concept: string;
  canonical_code?: string;
  value: string;
  numeric_value?: number;
  unit: string;
  normalized_value?: number;
  normalized_unit?: string;
  assertion: AssertionState;
  temporality: TemporalityState;
  context: string;
  source_document: string;
  page: number;
  section: string;
  source_text: string;
  confidence: number;
  status: 'extracted' | 'reviewed' | 'confirmed' | 'corrected';
  validation_status: 'MODEL_READY' | 'NEEDS_REVIEW';
  quality_notes?: string[];
  created_at: string;
  user_correction?: {
    original_value: string;
    corrected_value: string;
    reason?: string;
    corrected_at: string;
    corrected_by: string;
  };
}

export interface DocumentTimelineEvent {
  event_id: string;
  document_id: string;
  user_id: string;
  event_date: string; // Real clinical encounter date
  upload_date: string; // Separate from encounter date
  event_type: 
    | 'LAB_TEST'
    | 'MEDICATION_STARTED'
    | 'PROCEDURE_PERFORMED'
    | 'IMAGING_PERFORMED'
    | 'SYMPTOM_DOCUMENTED'
    | 'CONDITION_HISTORICALLY_NOTED'
    | 'CLINICAL_ENCOUNTER';
  title: string;
  description: string;
  assertion: AssertionState;
  temporality: TemporalityState;
  page_number: number;
  section: string;
  source_text: string;
  confidence: number;
  status: 'active' | 'resolved' | 'historical' | 'negated';
  related_fact_ids?: string[];
}

export interface NLPProcessingRun {
  run_id: string;
  document_id: string;
  user_id: string;
  model_name: string;
  model_version: string;
  pipeline_version: string;
  timestamp: string;
  execution_time_ms: number;
  document_type: DocumentTypeCategory;
  type_confidence: number;
  entities_count: number;
  relations_count: number;
  facts_count: number;
  timeline_events_count: number;
  stages_completed: string[];
  ocr_confidence?: number;
  metrics: {
    entity_confidence_avg: number;
    normalization_confidence_avg: number;
    validation_pass_rate: number;
  };
}

export interface DocumentTypeClassificationResult {
  document_type: DocumentTypeCategory;
  confidence: number;
  detected_specialties: string[];
  model_version: string;
  features: string[];
}

export interface WordingExplanation {
  original_text: string;
  canonical_concept: string;
  plain_language_explanation: string;
  clinical_context: string;
  assertion_meaning: string;
  temporality_meaning: string;
  source_page: number;
  source_section: string;
  related_domain: string;
}

export interface StructuredFactComparison {
  concept: string;
  canonical_concept: string;
  baseline_value: string;
  baseline_numeric?: number;
  baseline_date: string;
  followup_value: string;
  followup_numeric?: number;
  followup_date: string;
  unit: string;
  change_type: 'new' | 'improved' | 'worsened' | 'stable' | 'missing_in_followup';
  absolute_change?: number;
  percentage_change?: number;
  clinical_note: string;
}

export interface StructuredCompareOutput {
  doc_a: { id: string; title: string; date: string };
  doc_b: { id: string; title: string; date: string };
  comparisons: StructuredFactComparison[];
  summary: {
    new_findings: number;
    improved: number;
    worsened: number;
    stable: number;
    missing: number;
  };
  deterministic_narrative: string;
}

export interface FeatureMappingResult {
  concept_key: string;
  canonical_name: string;
  extracted_value: number | string;
  normalized_value: number | string;
  unit: string;
  is_model_ready: boolean;
  target_model_slots: string[];
  validation_criteria_met: boolean;
}
