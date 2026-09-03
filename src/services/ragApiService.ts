/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ RAG API Client Service
 * Connects frontend workspace views to /api/v1 endpoints with resilient offline fallbacks.
 */

import { 
  V3Document, 
  V3Page, 
  V3Chunk, 
  V3Observation, 
  V3Citation, 
  V3RAGResponse, 
  V3KnowledgeSource, 
  V3DocumentCompareResult 
} from '../types';

const API_BASE = '/api/v1';

export class RAGApiService {
  /**
   * Upload and process a document file
   */
  public static async uploadDocument(
    file: File,
    userId = 'patient-user-primary',
    forceDuplicate = false
  ): Promise<{ document: V3Document; isDuplicate: boolean; existingDocId?: string }> {
    const fileBase64 = await this.fileToBase64(file);
    const fileType = file.name.split('.').pop()?.toLowerCase() || 'txt';

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({
        filename: file.name,
        fileType,
        fileBase64,
        forceDuplicate
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload document');
    }

    return await response.json();
  }

  /**
   * List all documents for user
   */
  public static async listDocuments(userId = 'patient-user-primary'): Promise<V3Document[]> {
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.documents || [];
    } catch (e) {
      console.warn('Failed to fetch documents from server:', e);
      return [];
    }
  }

  /**
   * Get single document
   */
  public static async getDocument(docId: string, userId = 'patient-user-primary'): Promise<V3Document | null> {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.document || null;
    } catch {
      return null;
    }
  }

  /**
   * Get pages for document
   */
  public static async getPages(docId: string, userId = 'patient-user-primary'): Promise<V3Page[]> {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/pages`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.pages || [];
    } catch {
      return [];
    }
  }

  /**
   * Get chunks for document
   */
  public static async getChunks(docId: string, userId = 'patient-user-primary'): Promise<V3Chunk[]> {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/chunks`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.chunks || [];
    } catch {
      return [];
    }
  }

  /**
   * Get extracted observations for document
   */
  public static async getObservations(docId: string, userId = 'patient-user-primary'): Promise<V3Observation[]> {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/observations`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.observations || [];
    } catch {
      return [];
    }
  }

  /**
   * User correction for observation
   */
  public static async updateObservation(
    docId: string,
    obsId: string,
    correctedValue: string,
    reason?: string,
    userId = 'patient-user-primary'
  ): Promise<V3Observation | null> {
    const res = await fetch(`${API_BASE}/documents/${docId}/observations/${obsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ corrected_value: correctedValue, reason })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.observation || null;
  }

  /**
   * Reprocess a document
   */
  public static async reprocessDocument(docId: string, userId = 'patient-user-primary'): Promise<V3Document | null> {
    const res = await fetch(`${API_BASE}/documents/${docId}/reprocess`, {
      method: 'POST',
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.document || null;
  }

  /**
   * Delete document
   */
  public static async deleteDocument(docId: string, userId = 'patient-user-primary'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId }
    });
    return res.ok;
  }

  /**
   * Query single document ("Ask about this report")
   */
  public static async queryDocument(
    documentId: string,
    query: string,
    userId = 'patient-user-primary'
  ): Promise<V3RAGResponse> {
    const res = await fetch(`${API_BASE}/rag/document-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ documentId, query })
    });

    if (!res.ok) {
      throw new Error('Document query failed');
    }

    return await res.json();
  }

  /**
   * Multi-Document RAG Query
   */
  public static async queryMultiDocument(
    query: string,
    docIds?: string[],
    userId = 'patient-user-primary'
  ): Promise<V3RAGResponse> {
    const res = await fetch(`${API_BASE}/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ query, docIds })
    });

    if (!res.ok) {
      throw new Error('Multi-document query failed');
    }

    return await res.json();
  }

  /**
   * Compare two documents
   */
  public static async compareDocuments(
    docIdA: string,
    docIdB: string,
    userId = 'patient-user-primary'
  ): Promise<V3DocumentCompareResult> {
    const res = await fetch(`${API_BASE}/rag/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ docIdA, docIdB })
    });

    if (!res.ok) {
      throw new Error('Failed to compare documents');
    }

    return await res.json();
  }

  /**
   * Explain medical term
   */
  public static async explainTerm(
    term: string,
    documentId?: string,
    userId = 'patient-user-primary'
  ): Promise<{
    term: string;
    patientFriendlyExplanation: string;
    clinicalDefinition: string;
    userObservationsForTerm: V3Observation[];
    publicKnowledgeSources: V3KnowledgeSource[];
  }> {
    const res = await fetch(`${API_BASE}/rag/explain-term`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ term, documentId })
    });

    if (!res.ok) {
      throw new Error('Failed to explain term');
    }

    return await res.json();
  }

  /**
   * Analyze missing data ("What's missing?")
   */
  public static async analyzeMissing(
    docId: string,
    userId = 'patient-user-primary'
  ): Promise<{
    missingReferenceRanges: string[];
    unmeasuredRelatedMarkers: string[];
    documentationGaps: string[];
  }> {
    const res = await fetch(`${API_BASE}/documents/${docId}/missing-analysis`, {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) return { missingReferenceRanges: [], unmeasuredRelatedMarkers: [], documentationGaps: [] };
    return await res.json();
  }

  /**
   * List public knowledge sources
   */
  public static async listKnowledgeSources(): Promise<V3KnowledgeSource[]> {
    try {
      const res = await fetch(`${API_BASE}/knowledge/sources`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.sources || [];
    } catch {
      return [];
    }
  }

  // ==========================================
  // V4 Medical NLP & Document Intelligence API
  // ==========================================

  /**
   * Get extracted clinical entities & relations
   */
  public static async getEntitiesAndRelations(docId: string): Promise<{ entities: any[]; relations: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/nlp/documents/${docId}/entities`);
      if (!res.ok) return { entities: [], relations: [] };
      return await res.json();
    } catch {
      return { entities: [], relations: [] };
    }
  }

  /**
   * Get structured health facts with quality gate validation status
   */
  public static async getStructuredFacts(docId: string, userId = 'patient-user-primary'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/nlp/documents/${docId}/facts`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.facts || [];
    } catch {
      return [];
    }
  }

  /**
   * Review/correct a structured health fact
   */
  public static async updateStructuredFact(
    factId: string,
    update: { corrected_value: string; reason?: string; actor?: string },
    userId = 'patient-user-primary'
  ): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/nlp/facts/${factId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(update)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.fact || null;
    } catch {
      return null;
    }
  }

  /**
   * Get patient longitudinal timeline events
   */
  public static async getTimelineEvents(docId?: string, userId = 'patient-user-primary'): Promise<any[]> {
    try {
      const url = docId ? `${API_BASE}/nlp/timeline?document_id=${docId}` : `${API_BASE}/nlp/timeline`;
      const res = await fetch(url, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.events || [];
    } catch {
      return [];
    }
  }

  /**
   * Get document specialty classification
   */
  public static async getDocumentClassification(docId: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/nlp/documents/${docId}/classification`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.classification || null;
    } catch {
      return null;
    }
  }

  /**
   * Signature Feature: "Explain the wording"
   */
  public static async explainWording(text: string, contextSentence?: string, section?: string): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/nlp/explain-wording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context_sentence: contextSentence, section })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.explanation || null;
    } catch {
      return null;
    }
  }

  /**
   * Signature Feature: "Check for changes" (Structured fact comparison)
   */
  public static async compareStructuredFacts(docIdA: string, docIdB: string, userId = 'patient-user-primary'): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/nlp/compare-facts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ docIdA, docIdB })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.comparison || null;
    } catch {
      return null;
    }
  }

  /**
   * Export downstream ML feature slots
   */
  public static async getFeatureSlots(userId = 'patient-user-primary'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/nlp/features`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.feature_slots || [];
    } catch {
      return [];
    }
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
