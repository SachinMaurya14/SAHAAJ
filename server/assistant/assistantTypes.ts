/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Assistant Types & Contracts
 * Strict type contracts for zero-hallucination, authorized Health Intelligence Assistant.
 */

export type DataAvailabilityState = 
  | 'NO_DATA'
  | 'PROFILE_ONLY'
  | 'HEALTH_DATA_AVAILABLE'
  | 'REPORTS_AVAILABLE'
  | 'STRUCTURED_FACTS_AVAILABLE'
  | 'RISK_ASSESSMENT_AVAILABLE'
  | 'IMAGING_AVAILABLE'
  | 'LONGITUDINAL_DATA_AVAILABLE';

export type QueryIntent = 
  | 'GENERAL_HEALTH_QUESTION'
  | 'REPORT_QUESTION'
  | 'LAB_VALUE_QUESTION'
  | 'TIMELINE_QUESTION'
  | 'RISK_QUESTION'
  | 'IMAGING_QUESTION'
  | 'MEDICATION_QUESTION'
  | 'APPOINTMENT_PREP'
  | 'SYSTEM_CAPABILITY'
  | 'UNKNOWN';

export interface AssistantSourceCitation {
  id: string;
  title: string;
  date?: string;
  type?: string;
}

export interface AssistantContextResponse {
  scope: 'patient' | 'clinician';
  user_id: string;
  user_name: string | null;
  greeting: string;
  has_data: boolean;
  has_profile: boolean;
  has_health_data: boolean;
  has_reports: boolean;
  has_risk_assessments: boolean;
  has_imaging: boolean;
  has_timeline: boolean;
  data_availability_state: DataAvailabilityState;
  available_domains: string[];
  suggested_prompts: string[];
  context_summary: {
    report_count: number;
    fact_count: number;
    assessment_count: number;
    imaging_count: number;
    timeline_event_count: number;
  };
}

export interface AssistantQueryRequest {
  message: string;
  scope?: 'patient' | 'clinician';
  selected_patient_id?: string;
  document_ids?: string[];
  record_ids?: string[];
  assessment_ids?: string[];
  context_type?: string;
}

export interface AssistantQueryResponse {
  answer: string;
  scope: 'user' | 'general' | 'insufficient_evidence';
  facts_used: string[];
  sources: AssistantSourceCitation[];
  limitations: string[];
  safety_notice: string | null;
  grounding_status: 'grounded' | 'general' | 'insufficient_evidence';
  suggested_action?: {
    label: string;
    view: string;
  };
  trace_id?: string;
}

export interface AuthorizedUserContextData {
  user_id: string;
  scope: 'patient' | 'clinician';
  user_name: string | null;
  health_facts: Array<{
    fact_id: string;
    document_id: string;
    concept_name: string;
    value: string;
    numeric_value?: number;
    unit?: string;
    date: string;
    status: string;
    flag?: string;
  }>;
  reports: Array<{
    document_id: string;
    title: string;
    date: string;
    facility?: string;
    status: string;
    abnormal_count?: number;
  }>;
  timeline: Array<{
    event_id: string;
    title: string;
    date: string;
    category: string;
    significance?: string;
  }>;
  risk_assessments: Array<{
    assessment_id: string;
    model_id: string;
    model_name: string;
    calibrated_probability: number;
    formatted_percentage: string;
    risk_category: string;
    created_at: string;
    feature_contributions?: any[];
  }>;
  imaging: Array<{
    study_id: string;
    title: string;
    modality: string;
    date: string;
    findings?: string;
  }>;
  medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    source_document_id?: string;
  }>;
}
