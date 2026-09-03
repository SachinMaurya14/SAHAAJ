/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ REST API v1 Routes
 * Comprehensive, production-grade endpoints for Document Management, RAG Querying,
 * Citations, Observations, and Medical Knowledge.
 */

import { Router, Request, Response } from 'express';
import { RAGEngine } from '../rag/ragEngine';
import { storageEngine } from '../db/storageEngine';
import { SupportedFileType } from '../rag/types';
import { MedicalNLPService } from '../rag/nlp/medicalNLPService';
import { HealthFactToFeatureMapper } from '../rag/nlp/featureMapper';
import { MLModelRegistry } from '../ml/registry';
import { ModelSystemDomain } from '../ml/types';
import { imagingRouter } from './imagingRoutes';
import { clinicianRouter } from './clinicianRoutes';
import { evaluationRouter } from './evaluationRoutes';
import { assistantRouter } from './assistantRoutes';

export const v1Router = Router();

// Assistant & Health Intelligence Sub-router
v1Router.use('/assistant', assistantRouter);

// V6 Medical Imaging Sub-router
v1Router.use('/imaging', imagingRouter);

// V8 Clinician Intelligence & Workflow Sub-router
v1Router.use('/clinician', clinicianRouter);

// V9 Evaluation, Observability & AI Quality Sub-router
v1Router.use('/evaluation', evaluationRouter);

// Middleware helper to extract authenticated or session user_id
function getUserId(req: Request): string {
  const headerUser = req.headers['x-user-id'] as string;
  return headerUser || req.query.user_id as string || 'patient-user-primary';
}

// 1. Upload & Ingest Document
v1Router.post('/documents/upload', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { filename, fileType, fileBase64, forceDuplicate } = req.body;

    if (!filename || !fileBase64) {
      return res.status(400).json({ error: 'Missing required file data (filename, fileBase64)' });
    }

    const detectedType = (fileType || filename.split('.').pop() || 'txt').toLowerCase() as SupportedFileType;
    const fileBuffer = Buffer.from(fileBase64, 'base64');

    const result = await RAGEngine.ingestDocument(
      fileBuffer,
      filename,
      detectedType,
      userId,
      { forceDuplicate: Boolean(forceDuplicate) }
    );

    return res.status(201).json({
      document: result.document,
      isDuplicate: result.isDuplicate,
      existingDocId: result.existingDocId,
      message: result.isDuplicate ? 'Duplicate file detected via SHA-256 checksum' : 'Document ingested and indexed successfully'
    });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return res.status(500).json({ error: 'Failed to ingest document', details: err.message });
  }
});

// 2. List Documents for User
v1Router.get('/documents', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const docs = storageEngine.listDocuments(userId);
    return res.json({ documents: docs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list documents', details: err.message });
  }
});

// 3. Get Single Document
v1Router.get('/documents/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const doc = storageEngine.getDocument(req.params.id, userId);
    if (!doc) return res.status(404).json({ error: 'Document not found or unauthorized' });
    return res.json({ document: doc });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch document', details: err.message });
  }
});

// 4. Get Document Status
v1Router.get('/documents/:id/status', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const doc = storageEngine.getDocument(req.params.id, userId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    return res.json({
      document_id: doc.document_id,
      processing_status: doc.processing_status,
      page_count: doc.page_count,
      chunks_count: doc.chunks_count,
      extracted_observations_count: doc.extracted_observations_count,
      ocr_confidence: doc.ocr_confidence,
      error: doc.processing_error
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get status', details: err.message });
  }
});

// 5. Get Pages for Document
v1Router.get('/documents/:id/pages', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const pages = storageEngine.getPagesForDocument(req.params.id, userId);
    return res.json({ pages });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get pages', details: err.message });
  }
});

// 6. Get Chunks for Document
v1Router.get('/documents/:id/chunks', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const chunks = storageEngine.getChunksForDocument(req.params.id, userId);
    return res.json({ chunks });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get chunks', details: err.message });
  }
});

// 7. Get Extracted Observations for Document
v1Router.get('/documents/:id/observations', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const observations = storageEngine.getObservationsForDocument(req.params.id, userId);
    return res.json({ observations });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get observations', details: err.message });
  }
});

// 8. User Correction for Observation
v1Router.patch('/documents/:id/observations/:obsId', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { corrected_value, reason, actor } = req.body;
    if (!corrected_value) return res.status(400).json({ error: 'corrected_value is required' });

    const updated = storageEngine.updateObservation(req.params.obsId, userId, {
      corrected_value: String(corrected_value),
      reason,
      actor: actor || 'user'
    });

    if (!updated) return res.status(404).json({ error: 'Observation not found' });
    return res.json({ observation: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update observation', details: err.message });
  }
});

// 9. Reprocess Document
v1Router.post('/documents/:id/reprocess', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const reprocessed = await RAGEngine.reprocessDocument(req.params.id, userId);
    if (!reprocessed) return res.status(404).json({ error: 'Document not found' });
    return res.json({ document: reprocessed, message: 'Document reprocessed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reprocess document', details: err.message });
  }
});

// 10. Delete Document
v1Router.delete('/documents/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const success = storageEngine.deleteDocument(req.params.id, userId);
    if (!success) return res.status(404).json({ error: 'Document not found' });
    return res.json({ success: true, message: 'Document and all vector embeddings deleted cleanly' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete document', details: err.message });
  }
});

// 11. Scoped or Multi-Document RAG Query
v1Router.post('/rag/query', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { query, docIds, topK } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const response = await RAGEngine.queryRAG(query, userId, { docIds, topK });
    return res.json(response);
  } catch (err: any) {
    console.error('RAG query route error:', err);
    return res.status(500).json({ error: 'Failed to process RAG query', details: err.message });
  }
});

// 12. Single Document "Ask about this report"
v1Router.post('/rag/document-query', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { documentId, query } = req.body;

    if (!documentId || !query) {
      return res.status(400).json({ error: 'documentId and query are required' });
    }

    const response = await RAGEngine.queryRAG(query, userId, { docIds: [documentId], topK: 5 });
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to query document', details: err.message });
  }
});

// 13. Compare Documents
v1Router.post('/rag/compare', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { docIdA, docIdB } = req.body;

    if (!docIdA || !docIdB) {
      return res.status(400).json({ error: 'docIdA and docIdB are required' });
    }

    const result = await RAGEngine.compareDocuments(docIdA, docIdB, userId);
    if (!result) return res.status(404).json({ error: 'One or both documents not found' });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compare documents', details: err.message });
  }
});

// 14. Explain Term
v1Router.post('/rag/explain-term', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { term, documentId } = req.body;

    if (!term) return res.status(400).json({ error: 'term is required' });

    const result = await RAGEngine.explainTerm(term, userId, documentId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to explain term', details: err.message });
  }
});

// 15. Analyze Missing Data ("What's missing?")
v1Router.get('/documents/:id/missing-analysis', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const analysis = await RAGEngine.analyzeMissingData(req.params.id, userId);
    return res.json(analysis);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to analyze missing data', details: err.message });
  }
});

// 16. Inspect Citation
v1Router.get('/citations/:id', (req: Request, res: Response) => {
  try {
    const citation = storageEngine.getCitation(req.params.id);
    if (!citation) return res.status(404).json({ error: 'Citation not found' });
    return res.json({ citation });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch citation', details: err.message });
  }
});

// 17. Public Medical Knowledge Sources
v1Router.get('/knowledge/sources', (req: Request, res: Response) => {
  try {
    const sources = storageEngine.listKnowledgeSources();
    return res.json({ sources });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list knowledge sources', details: err.message });
  }
});

// 18. Audit Logs
v1Router.get('/audit/logs', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const logs = storageEngine.getAuditLogs(userId);
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get audit logs', details: err.message });
  }
});

// ==========================================
// V4 Medical Document NLP Intelligence Endpoints
// ==========================================

// 19. Get Extracted Medical Entities & Relations for Document
v1Router.get('/nlp/documents/:id/entities', (req: Request, res: Response) => {
  try {
    const docId = req.params.id;
    const entities = storageEngine.getMedicalEntities(docId);
    const relations = storageEngine.getClinicalRelations(docId);
    return res.json({
      document_id: docId,
      entities_count: entities.length,
      relations_count: relations.length,
      entities,
      relations
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch medical entities', details: err.message });
  }
});

// 20. Get Structured Health Facts with Quality Validation Status
v1Router.get('/nlp/documents/:id/facts', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const docId = req.params.id;
    const facts = storageEngine.getStructuredHealthFacts(docId, userId);
    return res.json({
      document_id: docId,
      facts_count: facts.length,
      facts
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch structured facts', details: err.message });
  }
});

// 21. Review / Correct a Structured Health Fact (Human-in-the-loop Quality Control)
v1Router.put('/nlp/facts/:factId', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { corrected_value, reason, actor } = req.body;
    if (!corrected_value) {
      return res.status(400).json({ error: 'corrected_value is required' });
    }

    const updated = storageEngine.updateStructuredHealthFact(req.params.factId, userId, {
      corrected_value: String(corrected_value),
      reason,
      actor: actor || 'physician_review'
    });

    if (!updated) return res.status(404).json({ error: 'Fact not found or unauthorized' });
    return res.json({ fact: updated, message: 'Fact corrected and verified successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update structured fact', details: err.message });
  }
});

// 22. Get Longitudinal Patient Timeline Events
v1Router.get('/nlp/timeline', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const docId = req.query.document_id as string;
    const events = docId 
      ? storageEngine.getTimelineEvents(docId, userId)
      : storageEngine.getAllTimelineEventsForUser(userId);

    return res.json({
      events_count: events.length,
      events
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch timeline events', details: err.message });
  }
});

// 23. Get Document Classification & Specialty Breakdown
v1Router.get('/nlp/documents/:id/classification', (req: Request, res: Response) => {
  try {
    const docId = req.params.id;
    const classification = storageEngine.getDocumentClassification(docId);
    if (!classification) return res.status(404).json({ error: 'Classification not found for document' });
    return res.json({ classification });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch classification', details: err.message });
  }
});

// 24. Get NLP Processing Run Audit Details & Metrics
v1Router.get('/nlp/documents/:id/run', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const docId = req.params.id;
    const run = storageEngine.getNLPProcessingRun(docId, userId);
    if (!run) return res.status(404).json({ error: 'NLP Run record not found' });
    return res.json({ run });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch NLP run details', details: err.message });
  }
});

// 25. Signature Feature: "Explain the wording"
v1Router.post('/nlp/explain-wording', (req: Request, res: Response) => {
  try {
    const { text, context_sentence, section } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const explanation = MedicalNLPService.explainWording(text, context_sentence, section);
    return res.json({ explanation });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to explain wording', details: err.message });
  }
});

// 26. Signature Feature: "Check for changes" (Deterministic Structured Fact Comparison)
v1Router.post('/nlp/compare-facts', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { docIdA, docIdB } = req.body;
    if (!docIdA || !docIdB) {
      return res.status(400).json({ error: 'docIdA and docIdB are required' });
    }

    const comparison = MedicalNLPService.compareStructuredFacts(docIdA, docIdB, userId);
    return res.json({ comparison });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compare structured facts', details: err.message });
  }
});

// 27. Downstream ML Feature Mapping Vector Export
v1Router.get('/nlp/features', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const facts = storageEngine.getAllStructuredHealthFactsForUser(userId);
    const featureSlots = HealthFactToFeatureMapper.mapFactsToFeatureSlots(facts);
    return res.json({ feature_slots: featureSlots });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to map health features', details: err.message });
  }
});

// ==========================================
// V5 Machine Learning Risk Engine Endpoints
// ==========================================

// 28. List Available ML Risk Models & Domains
v1Router.get('/models', (req: Request, res: Response) => {
  try {
    const system = req.query.system as ModelSystemDomain;
    if (system) {
      const model = MLModelRegistry.getModelBySystem(system);
      if (!model) return res.status(404).json({ error: `Model for system ${system} not available yet.` });
      return res.json({ model });
    }

    const models = MLModelRegistry.getModels();
    const domains = MLModelRegistry.listAvailableDomains();
    return res.json({
      models_count: models.length,
      models,
      domain_catalog: domains
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch ML models', details: err.message });
  }
});

// 29. Get Single ML Model Metadata & Model Card Specs
v1Router.get('/models/:modelId', (req: Request, res: Response) => {
  try {
    const model = MLModelRegistry.getModelById(req.params.modelId);
    if (!model) return res.status(404).json({ error: `Model ${req.params.modelId} not found` });
    return res.json({ model });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch model', details: err.message });
  }
});

// 30. Get Model Versions
v1Router.get('/models/:modelId/versions', (req: Request, res: Response) => {
  try {
    const model = MLModelRegistry.getModelById(req.params.modelId);
    if (!model) return res.status(404).json({ error: `Model ${req.params.modelId} not found` });
    return res.json({
      model_id: model.modelId,
      current_version: model.version,
      versions: [
        { version: model.version, status: 'Production Active', releaseDate: model.trainingTimestamp },
        { version: 'v1.0.0-Baseline', status: 'Deprecated Baseline', releaseDate: '2025-11-10T00:00:00.000Z' }
      ]
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch model versions', details: err.message });
  }
});

// 31. Compare Model Candidate Algorithms (Offline Validation Benchmarks)
v1Router.get('/models/:modelId/candidates', (req: Request, res: Response) => {
  try {
    const model = MLModelRegistry.getModelById(req.params.modelId);
    if (!model) return res.status(404).json({ error: `Model ${req.params.modelId} not found` });
    return res.json({
      model_id: model.modelId,
      selected_algorithm: model.algorithm,
      candidates: model.evaluation.candidateComparisons,
      evaluation_metrics: model.evaluation
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch candidate comparisons', details: err.message });
  }
});

// 32. Validate Input Quality Gate (Pre-Flight Check)
v1Router.post('/risk-assessments/:modelId/validate', (req: Request, res: Response) => {
  try {
    const { inputs, sources } = req.body;
    if (!inputs || typeof inputs !== 'object') {
      return res.status(400).json({ error: 'inputs object is required' });
    }

    const validation = MLModelRegistry.validateInputQuality(req.params.modelId, inputs, sources);
    return res.json({ validation });
  } catch (err: any) {
    return res.status(500).json({ error: 'Quality gate validation failed', details: err.message });
  }
});

// 33. Execute Model Inference & Persist Snapshot
v1Router.post('/risk-assessments/:modelId/predict', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { inputs, sources, consentGiven } = req.body;

    if (!inputs || typeof inputs !== 'object') {
      return res.status(400).json({ error: 'inputs object is required' });
    }

    if (consentGiven === false) {
      return res.status(400).json({ error: 'Explicit user consent required before running statistical model screening.' });
    }

    const result = MLModelRegistry.runInference(req.params.modelId, inputs, sources);
    
    // Persist immutable assessment record
    if (result.status === 'SUCCESS') {
      storageEngine.saveMLAssessment(userId, result);
    }

    return res.json({ result });
  } catch (err: any) {
    console.error('Inference error:', err);
    return res.status(500).json({ error: 'ML inference failed', details: err.message });
  }
});

// 34. Run Counterfactual / What-If Sensitivity Simulation
v1Router.post('/risk-assessments/:modelId/simulate', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { baselineInputs, simulatedInputs } = req.body;

    if (!baselineInputs || !simulatedInputs) {
      return res.status(400).json({ error: 'baselineInputs and simulatedInputs are required' });
    }

    const simulation = MLModelRegistry.runSimulation(req.params.modelId, baselineInputs, simulatedInputs);
    storageEngine.saveMLSimulation(userId, simulation);

    return res.json({ simulation });
  } catch (err: any) {
    return res.status(500).json({ error: 'Simulation failed', details: err.message });
  }
});

// 35. Run Continuous Parameter Sensitivity Sweep
v1Router.post('/risk-assessments/:modelId/sensitivity', (req: Request, res: Response) => {
  try {
    const { baseInputs, sweepFeature, minVal, maxVal, steps } = req.body;
    if (!baseInputs || !sweepFeature) {
      return res.status(400).json({ error: 'baseInputs and sweepFeature are required' });
    }

    const sweep = MLModelRegistry.runSensitivitySweep(
      req.params.modelId, 
      baseInputs, 
      sweepFeature, 
      minVal, 
      maxVal, 
      steps
    );
    return res.json({ sweep });
  } catch (err: any) {
    return res.status(500).json({ error: 'Sensitivity sweep failed', details: err.message });
  }
});

// 36. List User Assessment History
v1Router.get('/risk-assessments/history', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const modelId = req.query.model_id as string;
    const history = storageEngine.listMLAssessmentsForUser(userId, modelId);
    return res.json({
      history_count: history.length,
      history
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch assessment history', details: err.message });
  }
});

// 37. Get Specific Assessment by ID
v1Router.get('/risk-assessments/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const assessment = storageEngine.getMLAssessment(req.params.id, userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json({ assessment });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch assessment', details: err.message });
  }
});

// 38. "Why Did My Risk Change?" Longitudinal Delta Decomposition
v1Router.post('/risk-assessments/compare-runs', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { assessmentIdA, assessmentIdB } = req.body;

    if (!assessmentIdA || !assessmentIdB) {
      return res.status(400).json({ error: 'assessmentIdA and assessmentIdB are required' });
    }

    const asmA = storageEngine.getMLAssessment(assessmentIdA, userId);
    const asmB = storageEngine.getMLAssessment(assessmentIdB, userId);

    if (!asmA || !asmB) {
      return res.status(404).json({ error: 'One or both assessment records not found' });
    }

    // Adapt to MLInferenceResult
    const infA: any = {
      assessmentId: asmA.assessment_id,
      modelId: asmA.model_id,
      modelName: asmA.model_name,
      modelVersion: asmA.model_version,
      calibratedProbability: asmA.calibrated_probability,
      riskCategory: asmA.risk_category,
      inputSnapshot: asmA.input_snapshot,
      featureContributions: asmA.feature_contributions,
      timestamp: asmA.created_at
    };

    const infB: any = {
      assessmentId: asmB.assessment_id,
      modelId: asmB.model_id,
      modelName: asmB.model_name,
      modelVersion: asmB.model_version,
      calibratedProbability: asmB.calibrated_probability,
      riskCategory: asmB.risk_category,
      inputSnapshot: asmB.input_snapshot,
      featureContributions: asmB.feature_contributions,
      timestamp: asmB.created_at
    };

    const decomposition = MLModelRegistry.decomposeRiskDelta(infA, infB);
    return res.json({ decomposition });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to decompose risk changes', details: err.message });
  }
});

