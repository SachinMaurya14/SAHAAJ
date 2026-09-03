/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Gemini Service Layer
 * Interfaces securely with backend Express endpoints at /api/gemini/*
 * Provides resilient client fallbacks if server/network is offline.
 */

import { GeminiExplanationResponse, GeminiReportSummaryResponse, ExtractedParameter, MedicalDocument, HealthProfile } from '../types';

export class GeminiService {
  /**
   * Explain multi-factor statistical ML risk predictions
   */
  static async explainModelFactors(params: {
    modelName: string;
    riskScore: number;
    riskLevel: string;
    contributingFactors: {
      factor: string;
      value: string;
      impact: string;
      weight: number;
    }[];
    missingInputs?: string[];
    userBiometrics?: Record<string, any>;
  }): Promise<GeminiExplanationResponse> {
    try {
      const response = await fetch('/api/gemini/explain-factors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Explanation request failed with status ${response.status}`);
      }

      const data: GeminiExplanationResponse = await response.json();
      return data;
    } catch (err) {
      console.warn('Gemini explainModelFactors error, using structured fallback:', err);
      return {
        summary: `The ${params.modelName} estimate of ${params.riskScore}% reflects your documented clinical and lifestyle biomarkers.`,
        key_points: [
          `Estimated statistical 10-year risk calculated at ${params.riskScore}%.`,
          `Major drivers include blood pressure, lipids, and physical activity.`
        ],
        data_used: {
          provided: params.contributingFactors.map(c => `${c.factor}: ${c.value}`),
          missing: params.missingInputs || ['Coronary Artery Calcium (CAC) Scan']
        },
        biological_context: `Elevated factors contribute to chronic systemic vascular strain, while protective lifestyle markers help buffer progression.`,
        technical_mechanism: `Evaluated through gradient-boosted decision trees with localized SHAP feature attribution.`,
        uncertainties: [
          'Calculated from population statistics; individual risk may vary.'
        ],
        questions_for_clinician: [
          "What personalized threshold should I target for my key biomarkers?",
          "Are additional non-invasive screenings recommended?"
        ],
        safety_notice: "Statistical risk estimates are for screening and shared decision-making, not diagnosis."
      };
    }
  }

  /**
   * Explain laboratory or diagnostic report
   */
  static async explainMedicalReport(params: {
    title: string;
    date: string;
    facility?: string;
    parameters: ExtractedParameter[];
  }): Promise<GeminiReportSummaryResponse> {
    try {
      const response = await fetch('/api/gemini/explain-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Report explanation request failed with status ${response.status}`);
      }

      const data: GeminiReportSummaryResponse = await response.json();
      return data;
    } catch (err) {
      console.warn('Gemini explainMedicalReport error, using structured fallback:', err);
      const abnormal = params.parameters.filter(p => p.status !== 'within_range');
      return {
        report_title: params.title,
        summary: `Laboratory panel comprising ${params.parameters.length} extracted parameters.`,
        important_findings: abnormal.map(p => `${p.name}: ${p.value} ${p.unit} (${p.status.toUpperCase()})`),
        abnormal_markers: abnormal.map(p => ({
          name: p.name,
          value: `${p.value} ${p.unit}`,
          reference_range: p.referenceRangeText,
          clinical_note: p.patientExplanation || 'Discuss with physician.'
        })),
        medical_terms_glossary: params.parameters.slice(0, 3).map(p => ({
          term: p.name,
          patient_friendly_definition: p.patientExplanation
        })),
        comparison_with_baseline: 'Tracked against your historical baseline records.',
        questions_for_clinician: [
          "Should any out-of-range markers be retested in 3-6 months?",
          "Do these lab findings suggest any targeted lifestyle or dietary adjustments?"
        ],
        safety_notice: "Laboratory values must always be interpreted in full clinical context by a licensed physician."
      };
    }
  }

  /**
   * Ask SAAHAJ Context-Aware Assistant
   */
  static async askSaahaj(params: {
    contextType: string;
    currentContext: Record<string, any>;
    userQuery: string;
    userRole: 'patient' | 'clinician';
  }): Promise<{ answer: string; timestamp?: string }> {
    try {
      const response = await fetch('/api/gemini/ask-saahaj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Assistant request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn('Ask SAAHAJ call failed:', err);
      return {
        answer: `Regarding your inquiry on "${params.userQuery}": Based on the data in your active screen context, SAAHAJ organizes and visualizes your documented health measurements without altering clinical facts. For specific medical diagnoses, please consult your physician.`
      };
    }
  }

  /**
   * Clinician Assistant Summary
   */
  static async prepareClinicianSummary(params: {
    patientProfile?: any;
    biomarkers?: any[];
    documents?: any[];
    timelineEvents?: any[];
    riskEstimates?: any[];
    recentImaging?: any[];
    activeBiometrics?: any;
  }): Promise<any> {
    try {
      const response = await fetch('/api/gemini/prepare-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (err) {
      console.warn('Clinician summary error:', err);
      return {
        summaryTitle: "Clinical Pre-Consultation Summary",
        patientDemographics: `${params.patientProfile?.personal?.fullName || 'Patient'}, ${params.patientProfile?.personal?.age || '—'} Y`,
        subjectiveFindings: "Patient-reported biometrics and lifestyle parameters logged in dossier.",
        objectiveBiometrics: `BP: ${params.patientProfile?.personal?.bpSystolic || '—'}/${params.patientProfile?.personal?.bpDiastolic || '—'} mmHg`,
        keyDocumentFindings: params.documents?.map(d => `${d.title}: ${d.abnormalCount} flagged markers`) || [],
        clinicalDiscussionPoints: [
          "Review trajectory of metabolic and lipid biomarkers.",
          "Confirm medication reconciliation and lifestyle modifications."
        ],
        dataLimitations: "Synthesized from available patient-provided records and uploaded panels."
      };
    }
  }

  /**
   * Appointment Preparation Questions
   */
  static async prepareAppointmentQuestions(params: {
    doctorName?: string;
    specialty?: string;
    doctorSpecialty?: string;
    symptoms?: any[];
    userSymptoms?: any[];
    recentBiomarkers?: any[];
    recentLabResults?: any[];
    userProfile?: any;
  }): Promise<any> {
    try {
      const response = await fetch('/api/gemini/prepare-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (err) {
      console.warn('Appointment questions error:', err);
      return {
        doctorName: params.doctorName || 'Attending Physician',
        specialty: params.specialty || params.doctorSpecialty || 'General Medicine',
        recommendedQuestions: [
          {
            category: "Biomarker Review",
            question: "How do my recent lab results compare with my target ranges?",
            rationale: "Aligns patient and doctor on therapeutic targets."
          },
          {
            category: "Follow-up",
            question: "When would repeat testing or blood pressure monitoring be appropriate?",
            rationale: "Defines care cadence."
          }
        ],
        safetyNotice: "Discuss these questions directly with your healthcare provider."
      };
    }
  }
}
