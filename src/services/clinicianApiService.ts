/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinician API Client Service (V8)
 */

import { 
  ClinicalBriefing, 
  ClinicalSnapshot, 
  ClinicalSynthesis, 
  PatientExplanationDraft, 
  ClinicianNote, 
  ClinicianReviewQueueItem,
  ContentVisibility
} from '../types/clinicianTypes';

const BASE_URL = '/api/v1/clinician';

export class ClinicianApiService {
  private static getHeaders(clinicianId: string = 'dr-primary-clinician', role: string = 'CLINICIAN'): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-clinician-id': clinicianId,
      'x-user-role': role
    };
  }

  public static async listPatients(): Promise<{ totalCount: number; patients: Array<{ patientId: string; patientName: string; lastActivity: string }> }> {
    const res = await fetch(`${BASE_URL}/patients`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to list authorized patients');
    return res.json();
  }

  public static async getSnapshot(patientId: string): Promise<ClinicalSnapshot> {
    const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(patientId)}/snapshot`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch clinical snapshot');
    return res.json();
  }

  public static async getBriefing(patientId: string): Promise<ClinicalBriefing> {
    const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(patientId)}/briefing`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch clinical briefing');
    return res.json();
  }

  public static async generateSynthesis(patientId: string, customFocus?: string): Promise<ClinicalSynthesis> {
    const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(patientId)}/synthesis`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ customFocus })
    });
    if (!res.ok) throw new Error('Failed to generate clinical synthesis');
    return res.json();
  }

  public static async getSynthesis(synthesisId: string): Promise<ClinicalSynthesis> {
    const res = await fetch(`${BASE_URL}/syntheses/${encodeURIComponent(synthesisId)}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch synthesis');
    return res.json();
  }

  public static async listSyntheses(patientId: string): Promise<{ syntheses: ClinicalSynthesis[] }> {
    const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(patientId)}/syntheses`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to list syntheses');
    return res.json();
  }

  public static async updateSection(
    synthesisId: string,
    sectionKey: string,
    action: 'ACCEPT' | 'EDIT' | 'REJECT',
    newContent?: string,
    rejectionReason?: string
  ): Promise<ClinicalSynthesis> {
    const res = await fetch(`${BASE_URL}/syntheses/${encodeURIComponent(synthesisId)}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ sectionKey, action, newContent, rejectionReason })
    });
    if (!res.ok) throw new Error('Failed to update synthesis section');
    return res.json();
  }

  public static async finalizeSynthesis(
    synthesisId: string,
    visibility: ContentVisibility = 'CLINICIAN_ONLY',
    notes?: string
  ): Promise<{ message: string; synthesis: ClinicalSynthesis }> {
    const res = await fetch(`${BASE_URL}/syntheses/${encodeURIComponent(synthesisId)}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ visibility, notes })
    });
    if (!res.ok) throw new Error('Failed to finalize synthesis');
    return res.json();
  }

  public static async generatePatientExplanation(
    patientId: string,
    technicalFindingText: string,
    sourceFinding: string
  ): Promise<PatientExplanationDraft> {
    const res = await fetch(`${BASE_URL}/patient-explanations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ patientId, technicalFindingText, sourceFinding })
    });
    if (!res.ok) throw new Error('Failed to generate patient explanation');
    return res.json();
  }

  public static async sharePatientExplanation(
    explanationId: string,
    approvedText?: string
  ): Promise<{ message: string; explanation: PatientExplanationDraft }> {
    const res = await fetch(`${BASE_URL}/patient-explanations/${encodeURIComponent(explanationId)}/share`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ approvedText })
    });
    if (!res.ok) throw new Error('Failed to share patient explanation');
    return res.json();
  }

  public static async listPatientExplanations(patientId: string, isPatientViewing: boolean = false): Promise<{ explanations: PatientExplanationDraft[] }> {
    const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(patientId)}/patient-explanations`, {
      headers: this.getHeaders('dr-primary-clinician', isPatientViewing ? 'PATIENT' : 'CLINICIAN')
    });
    if (!res.ok) throw new Error('Failed to list explanations');
    return res.json();
  }

  public static async saveNote(
    patientId: string,
    content: string,
    visibility: ContentVisibility = 'CLINICIAN_ONLY',
    tags?: string[]
  ): Promise<ClinicianNote> {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ patientId, content, visibility, tags })
    });
    if (!res.ok) throw new Error('Failed to save clinician note');
    return res.json();
  }

  public static async listNotes(patientId: string, isPatientViewing: boolean = false): Promise<{ notes: ClinicianNote[] }> {
    const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(patientId)}/notes`, {
      headers: this.getHeaders('dr-primary-clinician', isPatientViewing ? 'PATIENT' : 'CLINICIAN')
    });
    if (!res.ok) throw new Error('Failed to list notes');
    return res.json();
  }

  public static async getReviewQueue(): Promise<{ totalPending: number; queue: ClinicianReviewQueueItem[] }> {
    const res = await fetch(`${BASE_URL}/review-queue`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return res.json();
  }

  public static async getAuditLogs(): Promise<{ logs: any[] }> {
    const res = await fetch(`${BASE_URL}/audit`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }
}
