/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Master RAG Engine
 * Orchestrates document ingestion lifecycle, parsing, chunking, embedding, indexing,
 * hybrid retrieval, grounded generation, multi-document comparison, and missing data detection.
 */

import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { storageEngine } from '../db/storageEngine';
import { ParserService } from './parser/parserService';
import { ChunkerService } from './chunking/chunkerService';
import { ObservationExtractor } from './extraction/observationExtractor';
import { EmbeddingService } from './vector/embeddingService';
import { HybridRetriever } from './retrieval/hybridRetriever';
import { GroundingService, GroundingOutput } from './grounding/groundingService';
import { MedicalNLPService } from './nlp/medicalNLPService';
import { 
  DocumentRecord, 
  SupportedFileType, 
  V3DocumentCompareResult 
} from './types';

export interface IngestionOptions {
  forceDuplicate?: boolean;
}

export class RAGEngine {
  private static getAiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  /**
   * 1. Ingest Document (Full pipeline with SHA-256 duplicate detection)
   */
  public static async ingestDocument(
    fileBuffer: Buffer,
    filename: string,
    fileType: SupportedFileType,
    userId: string,
    options: IngestionOptions = {}
  ): Promise<{ document: DocumentRecord; isDuplicate: boolean; existingDocId?: string }> {
    // 1. Calculate SHA-256 Checksum
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check duplicate
    const existing = storageEngine.findDocumentByChecksum(checksum, userId);
    if (existing && !options.forceDuplicate) {
      return {
        document: existing,
        isDuplicate: true,
        existingDocId: existing.document_id
      };
    }

    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const aiClient = this.getAiClient();

    // Create Initial Document Record (Status: UPLOADED)
    const docRecord: DocumentRecord = {
      document_id: documentId,
      user_id: userId,
      filename,
      file_type: fileType,
      file_size: fileBuffer.length,
      uploaded_at: new Date().toISOString(),
      processing_status: 'UPLOADED',
      source_type: 'lab_report',
      checksum,
      page_count: 0,
      extracted_observations_count: 0,
      chunks_count: 0,
      title: filename.replace(/\.[^/.]+$/, ''),
      processing_version: {
        parser: 'v3.0-hybrid',
        ocr: 'v3.0-gemini-vision',
        chunker: 'v3.0-semantic',
        embedder: 'text-embedding-004'
      }
    };
    storageEngine.saveDocument(docRecord);

    // Execute processing asynchronously or sequentially
    await this.executeProcessingPipeline(docRecord, fileBuffer, userId, aiClient);

    const finalizedDoc = storageEngine.getDocument(documentId, userId) || docRecord;
    return { document: finalizedDoc, isDuplicate: false };
  }

  /**
   * Executes the multi-stage pipeline: VALIDATING -> PARSING -> CHUNKING -> EMBEDDING -> INDEXING -> READY
   */
  public static async executeProcessingPipeline(
    doc: DocumentRecord,
    buffer: Buffer,
    userId: string,
    aiClient: GoogleGenAI | null
  ): Promise<void> {
    try {
      // Step 1: VALIDATING
      storageEngine.updateDocumentStatus(doc.document_id, userId, 'VALIDATING');

      // Step 2: PARSING & OCR
      storageEngine.updateDocumentStatus(doc.document_id, userId, doc.file_type === 'png' || doc.file_type === 'jpg' || doc.file_type === 'jpeg' ? 'OCR_PROCESSING' : 'PARSING');
      const parseResult = await ParserService.parseDocument(
        buffer,
        doc.file_type,
        doc.document_id,
        userId,
        doc.filename,
        aiClient
      );

      doc.page_count = parseResult.pageCount;
      doc.title = parseResult.detectedTitle;
      doc.facility = parseResult.detectedFacility;
      doc.report_date = parseResult.detectedDate;
      doc.ordering_physician = parseResult.detectedPhysician;
      doc.ocr_confidence = parseResult.ocrConfidence;
      doc.raw_text_preview = parseResult.pages[0]?.text?.slice(0, 300);
      storageEngine.savePages(parseResult.pages);

      // Step 3: CHUNKING
      storageEngine.updateDocumentStatus(doc.document_id, userId, 'CHUNKING');
      const chunks = ChunkerService.chunkPages(parseResult.pages, doc.document_id, userId);
      doc.chunks_count = chunks.length;
      storageEngine.saveChunks(chunks);

      // Step 4: OBSERVATION & V4 MEDICAL NLP EXTRACTION
      const fullDocText = parseResult.pages.map(p => p.text).join('\n\n');
      const observations = ObservationExtractor.extractObservations(
        chunks,
        doc.document_id,
        userId,
        doc.report_date
      );
      doc.extracted_observations_count = observations.length;
      storageEngine.saveObservations(observations);

      // Execute V4 Medical NLP (Entities, Relations, Structured Facts, Timeline, Classification)
      await MedicalNLPService.processDocument(
        doc.document_id,
        userId,
        chunks,
        fullDocText,
        doc.report_date
      );

      // Step 5: EMBEDDING & INDEXING
      storageEngine.updateDocumentStatus(doc.document_id, userId, 'EMBEDDING');
      const texts = chunks.map(c => `${c.section}: ${c.text}`);
      const embeddingVectors = await EmbeddingService.generateBatchEmbeddings(texts, aiClient);

      storageEngine.updateDocumentStatus(doc.document_id, userId, 'INDEXING');
      const embeddingRecords = chunks.map((chunk, idx) => ({
        embedding_id: `emb-${chunk.chunk_id}`,
        chunk_id: chunk.chunk_id,
        document_id: doc.document_id,
        user_id: userId,
        vector: embeddingVectors[idx],
        dimension: embeddingVectors[idx].length,
        model_name: aiClient ? 'text-embedding-004' : 'dense-cosine-fallback',
        created_at: new Date().toISOString()
      }));
      storageEngine.saveEmbeddings(embeddingRecords);

      // Step 6: READY
      storageEngine.updateDocumentStatus(doc.document_id, userId, 'READY');
      storageEngine.saveDocument(doc);
      storageEngine.logAudit(userId, 'DOCUMENT_PROCESSED_SUCCESS', {
        document_id: doc.document_id,
        chunks: chunks.length,
        observations: observations.length,
        pages: parseResult.pageCount
      });
    } catch (err: any) {
      console.error('Processing pipeline failure:', err);
      storageEngine.updateDocumentStatus(doc.document_id, userId, 'FAILED', err.message);
      storageEngine.logAudit(userId, 'DOCUMENT_PROCESSED_FAILED', {
        document_id: doc.document_id,
        error: err.message
      });
    }
  }

  /**
   * Reprocess existing document
   */
  public static async reprocessDocument(docId: string, userId: string, buffer?: Buffer): Promise<DocumentRecord | null> {
    const doc = storageEngine.getDocument(docId, userId);
    if (!doc) return null;

    // Purge old pages/chunks/embeddings/observations for this document
    storageEngine.deleteDocument(docId, userId);

    const freshDoc: DocumentRecord = {
      ...doc,
      processing_status: 'UPLOADED',
      processed_at: undefined,
      processing_error: undefined
    };
    storageEngine.saveDocument(freshDoc);

    const activeBuffer = buffer || Buffer.from(doc.raw_text_preview || 'Medical Record Text Content');
    const aiClient = this.getAiClient();
    await this.executeProcessingPipeline(freshDoc, activeBuffer, userId, aiClient);

    return storageEngine.getDocument(docId, userId);
  }

  /**
   * 2. Query RAG (Single Document or Multi-Document)
   */
  public static async queryRAG(
    query: string,
    userId: string,
    options: { docIds?: string[]; topK?: number } = {}
  ): Promise<GroundingOutput> {
    const aiClient = this.getAiClient();

    // 1. Retrieve candidates
    const retrieval = await HybridRetriever.retrieve(
      query,
      userId,
      aiClient,
      {
        docIds: options.docIds,
        topK: options.topK || 6
      }
    );

    // 2. Fetch observations
    const userObservations = options.docIds && options.docIds.length === 1
      ? storageEngine.getObservationsForDocument(options.docIds[0], userId)
      : storageEngine.getObservationsForUser(userId);

    // 3. Grounded Synthesis & Citation Validation
    const groundingResult = await GroundingService.generateGroundedAnswer({
      query,
      userId,
      evidenceChunks: retrieval.scoredChunks,
      userObservations,
      queryScope: options.docIds && options.docIds.length === 1 ? `Single Document (${options.docIds[0]})` : 'Entire Health Record Dossier',
      retrievalLatencyMs: retrieval.latencyMs,
      totalCandidates: retrieval.totalCandidates,
      aiClient
    });

    storageEngine.logAudit(userId, 'RAG_QUERY_EXECUTED', {
      query,
      grounding_status: groundingResult.grounding_status,
      citations_count: groundingResult.sources.length,
      latency: groundingResult.trace_metadata.total_latency_ms
    });

    return groundingResult;
  }

  /**
   * 3. Multi-Document Comparison with Numerical Deltas & RAG Synthesis
   */
  public static async compareDocuments(
    docIdA: string,
    docIdB: string,
    userId: string
  ): Promise<V3DocumentCompareResult | null> {
    const docA = storageEngine.getDocument(docIdA, userId);
    const docB = storageEngine.getDocument(docIdB, userId);
    if (!docA || !docB) return null;

    const obsA = storageEngine.getObservationsForDocument(docIdA, userId);
    const obsB = storageEngine.getObservationsForDocument(docIdB, userId);

    // Calculate Numeric Deltas
    const deltas: V3DocumentCompareResult['deltas'] = [];
    const matchedConcepts = new Set<string>();

    for (const itemB of obsB) {
      const matchA = obsA.find(a => a.canonical_concept === itemB.canonical_concept);
      if (matchA && matchA.numeric_value !== undefined && itemB.numeric_value !== undefined) {
        matchedConcepts.add(itemB.canonical_concept);
        const deltaVal = Math.round((itemB.numeric_value - matchA.numeric_value) * 100) / 100;
        const deltaPct = matchA.numeric_value !== 0 
          ? Math.round(((itemB.numeric_value - matchA.numeric_value) / matchA.numeric_value) * 1000) / 10 
          : 0;

        let direction: 'improved' | 'worsened' | 'stable' | 'new' = 'stable';
        if (Math.abs(deltaPct) >= 3) {
          // Check if lower is better for concept (e.g. LDL, Fasting Glucose, HbA1c, ALT, AST)
          const lowerIsBetter = ['HbA1c', 'Fasting Blood Glucose', 'LDL-C', 'Triglycerides', 'ALT (SGPT)', 'AST (SGOT)', 'Serum Creatinine'].includes(itemB.canonical_concept);
          if (lowerIsBetter) {
            direction = deltaVal < 0 ? 'improved' : 'worsened';
          } else {
            direction = deltaVal > 0 ? 'improved' : 'worsened';
          }
        }

        deltas.push({
          canonical_concept: itemB.canonical_concept,
          doc_a_value: matchA.numeric_value,
          doc_b_value: itemB.numeric_value,
          unit: itemB.unit,
          absolute_change: deltaVal,
          percentage_change: deltaPct,
          direction,
          clinical_note: `Changed from ${matchA.value} to ${itemB.value} ${itemB.unit}`
        });
      } else if (itemB.numeric_value !== undefined) {
        deltas.push({
          canonical_concept: itemB.canonical_concept,
          doc_a_value: 0,
          doc_b_value: itemB.numeric_value,
          unit: itemB.unit,
          absolute_change: itemB.numeric_value,
          percentage_change: null,
          direction: 'new',
          clinical_note: `First recorded value in follow-up report`
        });
      }
    }

    // Run grounded RAG query for narrative comparison
    const comparisonQuery = `Compare clinical findings and laboratory changes between ${docA.filename} (${docA.report_date || 'Baseline'}) and ${docB.filename} (${docB.report_date || 'Follow-up'}). Highlight key biomarker deltas without altering numbers.`;
    const ragResponse = await this.queryRAG(comparisonQuery, userId, { docIds: [docIdA, docIdB], topK: 6 });

    return {
      document_a: { id: docA.document_id, title: docA.filename, date: docA.report_date || 'Baseline' },
      document_b: { id: docB.document_id, title: docB.filename, date: docB.report_date || 'Follow-up' },
      deltas,
      comparison_narrative: ragResponse.answer,
      grounding_status: ragResponse.grounding_status === 'GROUNDED' ? 'GROUNDED' : 'INSUFFICIENT_EVIDENCE'
    };
  }

  /**
   * 4. Medical Terminology Explainer with Patient Record Context
   */
  public static async explainTerm(
    term: string,
    userId: string,
    currentDocId?: string
  ): Promise<{
    term: string;
    patientFriendlyExplanation: string;
    clinicalDefinition: string;
    userObservationsForTerm: any[];
    publicKnowledgeSources: any[];
  }> {
    const aiClient = this.getAiClient();
    const userObservations = storageEngine.getObservationsForUser(userId).filter(o => 
      o.name.toLowerCase().includes(term.toLowerCase()) || 
      o.canonical_concept.toLowerCase().includes(term.toLowerCase())
    );

    const publicSources = storageEngine.listKnowledgeSources().filter(k => 
      k.topic.toLowerCase().includes(term.toLowerCase()) || 
      k.title.toLowerCase().includes(term.toLowerCase())
    );

    if (aiClient) {
      try {
        const prompt = `You are SAAHAJ Medical Terminology Explainer.
Explain the term "${term}" in clear, non-alarmist plain English for a patient, and provide a clinical definition.
Ground the explanation strictly in medical physiology.

Format JSON:
- patientFriendlyExplanation: 2-3 clear sentences explaining what this test/concept does in the body.
- clinicalDefinition: 2 sentences of physiological and diagnostic context for clinicians.`;

        const models = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
        let parsed: any = null;

        for (const model of models) {
          try {
            const resp = await aiClient.models.generateContent({
              model,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: {
                    type: 'OBJECT',
                    properties: {
                      patientFriendlyExplanation: { type: 'STRING' },
                      clinicalDefinition: { type: 'STRING' }
                    },
                    required: ['patientFriendlyExplanation', 'clinicalDefinition']
                  } as any
                }
              }
            });

            if (resp.text) {
              parsed = JSON.parse(resp.text);
              break;
            }
          } catch (mErr: any) {
            console.warn(`[Explain Term] Model ${model} attempt failed (${mErr.message?.slice(0, 80)}), trying fallback...`);
          }
        }

        if (parsed) {
          return {
            term,
            patientFriendlyExplanation: parsed.patientFriendlyExplanation || `${term} is a key clinical measurement evaluated during diagnostic health screening.`,
            clinicalDefinition: parsed.clinicalDefinition || `Physiological parameter assessing metabolic, organ-specific, or vascular homeostasis.`,
            userObservationsForTerm: userObservations,
            publicKnowledgeSources: publicSources
          };
        }
      } catch (err: any) {
        console.warn('Explain term fallback:', err.message);
      }
    }

    return {
      term,
      patientFriendlyExplanation: `${term} is a biological marker measured in medical tests to assess how your body's systems are functioning.`,
      clinicalDefinition: `Diagnostic biomarker evaluated in standard laboratory panels.`,
      userObservationsForTerm: userObservations,
      publicKnowledgeSources: publicSources
    };
  }

  /**
   * 5. "What's Missing?" Analysis
   */
  public static async analyzeMissingData(docId: string, userId: string): Promise<{
    missingReferenceRanges: string[];
    unmeasuredRelatedMarkers: string[];
    documentationGaps: string[];
  }> {
    const doc = storageEngine.getDocument(docId, userId);
    if (!doc) return { missingReferenceRanges: [], unmeasuredRelatedMarkers: [], documentationGaps: [] };

    const observations = storageEngine.getObservationsForDocument(docId, userId);
    const missingRef: string[] = [];
    const extractedConcepts = new Set(observations.map(o => o.canonical_concept));

    for (const obs of observations) {
      if (obs.reference_source === 'STANDARD_GUIDELINE' || !obs.reference_range_text) {
        missingRef.push(`${obs.name}: Printed laboratory reference interval not specified on source document.`);
      }
    }

    // Check panel completeness
    const unmeasured: string[] = [];
    if (extractedConcepts.has('Fasting Blood Glucose') && !extractedConcepts.has('HbA1c')) {
      unmeasured.push("HbA1c (Longitudinal 90-day glycemic marker not included in current panel).");
    }
    if (extractedConcepts.has('Total Cholesterol') && !extractedConcepts.has('HDL-C')) {
      unmeasured.push("HDL-C (High-Density Lipoprotein fraction unmeasured).");
    }
    if (extractedConcepts.has('Serum Creatinine') && !extractedConcepts.has('eGFR')) {
      unmeasured.push("eGFR (Estimated Glomerular Filtration Rate omitted from report header).");
    }

    const docGaps: string[] = [];
    if (!doc.ordering_physician) docGaps.push("Ordering physician name not detected on document header.");
    if (!doc.facility) docGaps.push("Diagnostic laboratory / facility name not explicitly stated.");

    return {
      missingReferenceRanges: missingRef,
      unmeasuredRelatedMarkers: unmeasured,
      documentationGaps: docGaps
    };
  }
}
