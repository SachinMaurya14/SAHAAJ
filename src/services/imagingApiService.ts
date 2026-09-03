/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Imaging API Client Service
 * Connects frontend workspace views to /api/v1/imaging endpoints.
 */

import { 
  ImagingStudyRecord, 
  VisionModelArtifact, 
  ImageQualityMetrics, 
  ImagingAnnotationRecord, 
  ImagingFeedbackRecord 
} from '../../server/cv/types';

const API_BASE = '/api/v1/imaging';

export class ImagingApiService {
  /**
   * Convert File object to Base64 string
   */
  public static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload and analyze a radiograph / image
   */
  public static async uploadAndAnalyze(
    file: File,
    options: {
      userId?: string;
      studyTitle?: string;
      modality?: string;
      bodyRegion?: string;
      indication?: string;
      modelId?: string;
      reportText?: string;
      studyDate?: string;
    } = {}
  ): Promise<{ study: ImagingStudyRecord; message: string }> {
    const userId = options.userId || 'patient-user-primary';
    const imageBase64 = await this.fileToBase64(file);

    const response = await fetch(`${API_BASE}/studies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        filename: file.name,
        imageBase64,
        mimeType: file.type || 'image/png',
        studyTitle: options.studyTitle || file.name,
        modality: options.modality || 'X-Ray',
        bodyRegion: options.bodyRegion || 'Chest',
        indication: options.indication,
        modelId: options.modelId,
        reportText: options.reportText,
        studyDate: options.studyDate || new Date().toISOString().split('T')[0]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to process imaging study');
    }

    return await response.json();
  }

  /**
   * List all imaging studies for the current user
   */
  public static async listStudies(userId = 'patient-user-primary'): Promise<ImagingStudyRecord[]> {
    try {
      const response = await fetch(`${API_BASE}/studies`, {
        headers: { 'x-user-id': userId }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.studies || [];
    } catch {
      return [];
    }
  }

  /**
   * Get a single imaging study by ID
   */
  public static async getStudy(studyId: string, userId = 'patient-user-primary'): Promise<ImagingStudyRecord | null> {
    try {
      const response = await fetch(`${API_BASE}/studies/${studyId}`, {
        headers: { 'x-user-id': userId }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.study || null;
    } catch {
      return null;
    }
  }

  /**
   * Run raw quality check pre-flight without persisting
   */
  public static async validateRawImage(file: File): Promise<ImageQualityMetrics | null> {
    try {
      const imageBase64 = await this.fileToBase64(file);
      const response = await fetch(`${API_BASE}/studies/validate-raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          imageBase64,
          mimeType: file.type || 'image/png'
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.qualityMetrics || null;
    } catch {
      return null;
    }
  }

  /**
   * List available vision models
   */
  public static async listModels(): Promise<VisionModelArtifact[]> {
    try {
      const response = await fetch(`${API_BASE}/models`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.models || [];
    } catch {
      return [];
    }
  }

  /**
   * Get single model card
   */
  public static async getModelCard(modelId: string): Promise<VisionModelArtifact | null> {
    try {
      const response = await fetch(`${API_BASE}/models/${modelId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.model || null;
    } catch {
      return null;
    }
  }

  /**
   * Save clinician ROI annotation
   */
  public static async saveAnnotation(
    studyId: string, 
    annotation: { type: string; coordinates: any; label: string; notes: string; authorRole?: string },
    userId = 'patient-user-primary'
  ): Promise<ImagingAnnotationRecord | null> {
    try {
      const response = await fetch(`${API_BASE}/studies/${studyId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(annotation)
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.annotation || null;
    } catch {
      return null;
    }
  }

  /**
   * List annotations for study
   */
  public static async listAnnotations(studyId: string, userId = 'patient-user-primary'): Promise<ImagingAnnotationRecord[]> {
    try {
      const response = await fetch(`${API_BASE}/studies/${studyId}/annotations`, {
        headers: { 'x-user-id': userId }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.annotations || [];
    } catch {
      return [];
    }
  }

  /**
   * Submit clinician evaluation feedback
   */
  public static async submitFeedback(
    studyId: string,
    feedback: { findingLabel: string; clinicianDecision: string; comments?: string },
    userId = 'patient-user-primary'
  ): Promise<ImagingFeedbackRecord | null> {
    try {
      const response = await fetch(`${API_BASE}/studies/${studyId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(feedback)
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.feedback || null;
    } catch {
      return null;
    }
  }

  /**
   * Delete study
   */
  public static async deleteStudy(studyId: string, userId = 'patient-user-primary'): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/studies/${studyId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
