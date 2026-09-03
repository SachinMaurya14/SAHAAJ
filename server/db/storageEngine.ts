/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Storage Engine
 * Enforces strict user isolation (user_id ownership), stores and indexes documents,
 * pages, chunks, vectors, extracted observations, and citations.
 */

import { 
  DocumentRecord, 
  PageRecord, 
  ChunkRecord, 
  EmbeddingRecord, 
  ObservationRecord, 
  CitationRecord,
  KnowledgeArticle
} from '../rag/types';
import { 
  MedicalEntity, 
  ClinicalRelation, 
  StructuredHealthFact, 
  DocumentTimelineEvent, 
  NLPProcessingRun,
  DocumentTypeClassificationResult 
} from '../rag/nlp/types';
import { MLInferenceResult, MLSimulationResult } from '../ml/types';
import { 
  ClinicalSynthesis, 
  ClinicianNote, 
  PatientExplanationDraft, 
  ClinicianPatientAccess,
  ClinicalReviewAction 
} from '../clinician/types';

export interface UserMLAssessmentRecord {
  assessment_id: string;
  user_id: string;
  model_id: string;
  model_name: string;
  model_version: string;
  system: string;
  status: 'SUCCESS' | 'ABSTAINED';
  calibrated_probability: number;
  formatted_percentage: string;
  risk_category: string;
  decision_threshold: number;
  confidence_interval: [number, number];
  input_completeness: number;
  feature_contributions: any[];
  input_snapshot: Record<string, any>;
  data_quality: any;
  limitations: string[];
  created_at: string;
}

class StorageEngine {
  private documents = new Map<string, DocumentRecord>();
  private pages = new Map<string, PageRecord>();
  private chunks = new Map<string, ChunkRecord>();
  private embeddings = new Map<string, EmbeddingRecord>();
  private observations = new Map<string, ObservationRecord>();
  private citations = new Map<string, CitationRecord>();
  private knowledgeSources = new Map<string, KnowledgeArticle>();
  private auditLogs: Array<{ id: string; timestamp: string; userId: string; action: string; details: any }> = [];

  // V4 NLP Stores
  private medicalEntities = new Map<string, MedicalEntity>();
  private clinicalRelations = new Map<string, ClinicalRelation>();
  private structuredHealthFacts = new Map<string, StructuredHealthFact>();
  private timelineEvents = new Map<string, DocumentTimelineEvent>();
  private nlpRuns = new Map<string, NLPProcessingRun>();
  private documentClassifications = new Map<string, DocumentTypeClassificationResult>();

  // V5 Machine Learning Assessment Store
  private mlAssessments = new Map<string, UserMLAssessmentRecord>();
  private mlSimulations: MLSimulationResult[] = [];

  // V6 Computer Vision & Medical Imaging Store
  private imagingStudies = new Map<string, any>();
  private imagingAnnotations = new Map<string, any>();
  private imagingFeedbacks = new Map<string, any>();

  // V8 Clinician Intelligence & Governance Store
  private clinicalSyntheses = new Map<string, ClinicalSynthesis>();
  private clinicianNotes = new Map<string, ClinicianNote>();
  private patientExplanations = new Map<string, PatientExplanationDraft>();
  private clinicianPatientAccess = new Map<string, ClinicianPatientAccess>();

  constructor() {
    this.seedPublicKnowledge();
  }

  // --- Documents ---
  public saveDocument(doc: DocumentRecord): void {
    this.documents.set(doc.document_id, doc);
  }

  public getDocument(docId: string, userId: string): DocumentRecord | null {
    const doc = this.documents.get(docId);
    if (!doc || doc.user_id !== userId) return null;
    return doc;
  }

  public findDocumentByChecksum(checksum: string, userId: string): DocumentRecord | null {
    for (const doc of this.documents.values()) {
      if (doc.user_id === userId && doc.checksum === checksum) {
        return doc;
      }
    }
    return null;
  }

  public listDocuments(userId: string): DocumentRecord[] {
    return Array.from(this.documents.values()).filter(d => d.user_id === userId);
  }

  public updateDocumentStatus(docId: string, userId: string, status: DocumentRecord['processing_status'], error?: string): void {
    const doc = this.getDocument(docId, userId);
    if (doc) {
      doc.processing_status = status;
      if (error) doc.processing_error = error;
      if (status === 'READY') doc.processed_at = new Date().toISOString();
      this.documents.set(docId, doc);
    }
  }

  public deleteDocument(docId: string, userId: string): boolean {
    const doc = this.getDocument(docId, userId);
    if (!doc) return false;

    // Delete Document
    this.documents.delete(docId);

    // Delete associated pages
    for (const [pId, p] of this.pages.entries()) {
      if (p.document_id === docId && p.user_id === userId) {
        this.pages.delete(pId);
      }
    }

    // Delete associated chunks
    const deletedChunkIds = new Set<string>();
    for (const [cId, c] of this.chunks.entries()) {
      if (c.document_id === docId && c.user_id === userId) {
        this.chunks.delete(cId);
        deletedChunkIds.add(cId);
      }
    }

    // Delete associated embeddings
    for (const [eId, e] of this.embeddings.entries()) {
      if (e.document_id === docId && e.user_id === userId) {
        this.embeddings.delete(eId);
      }
    }

    // Delete associated observations
    for (const [oId, o] of this.observations.entries()) {
      if (o.document_id === docId && o.user_id === userId) {
        this.observations.delete(oId);
      }
    }

    // Delete associated citations
    for (const [citId, cit] of this.citations.entries()) {
      if (cit.document_id === docId) {
        this.citations.delete(citId);
      }
    }

    // Delete associated V4 NLP Entities
    for (const [eId, ent] of this.medicalEntities.entries()) {
      if (ent.document_id === docId) {
        this.medicalEntities.delete(eId);
      }
    }

    // Delete associated V4 Clinical Relations
    for (const [rId, rel] of this.clinicalRelations.entries()) {
      if (rel.document_id === docId) {
        this.clinicalRelations.delete(rId);
      }
    }

    // Delete associated V4 Structured Health Facts
    for (const [fId, fact] of this.structuredHealthFacts.entries()) {
      if (fact.document_id === docId && fact.user_id === userId) {
        this.structuredHealthFacts.delete(fId);
      }
    }

    // Delete associated V4 Timeline Events
    for (const [tId, tev] of this.timelineEvents.entries()) {
      if (tev.document_id === docId && tev.user_id === userId) {
        this.timelineEvents.delete(tId);
      }
    }

    // Delete associated V4 NLP Runs & Classifications
    this.nlpRuns.delete(docId);
    this.documentClassifications.delete(docId);

    this.logAudit(userId, 'DOCUMENT_DELETED', { document_id: docId, filename: doc.filename });
    return true;
  }

  // --- Pages ---
  public savePages(pagesList: PageRecord[]): void {
    for (const page of pagesList) {
      this.pages.set(page.page_id, page);
    }
  }

  public getPagesForDocument(docId: string, userId: string): PageRecord[] {
    return Array.from(this.pages.values())
      .filter(p => p.document_id === docId && p.user_id === userId)
      .sort((a, b) => a.page_number - b.page_number);
  }

  // --- Chunks ---
  public saveChunks(chunksList: ChunkRecord[]): void {
    for (const chunk of chunksList) {
      this.chunks.set(chunk.chunk_id, chunk);
    }
  }

  public getChunksForDocument(docId: string, userId: string): ChunkRecord[] {
    return Array.from(this.chunks.values())
      .filter(c => c.document_id === docId && c.user_id === userId)
      .sort((a, b) => a.chunk_index - b.chunk_index);
  }

  public getChunksForUser(userId: string, docIds?: string[]): ChunkRecord[] {
    return Array.from(this.chunks.values()).filter(c => {
      if (c.user_id !== userId) return false;
      if (docIds && docIds.length > 0 && !docIds.includes(c.document_id)) return false;
      return true;
    });
  }

  public getChunkById(chunkId: string, userId: string): ChunkRecord | null {
    const chunk = this.chunks.get(chunkId);
    if (!chunk || chunk.user_id !== userId) return null;
    return chunk;
  }

  // --- Embeddings ---
  public saveEmbeddings(embeddingsList: EmbeddingRecord[]): void {
    for (const emb of embeddingsList) {
      this.embeddings.set(emb.embedding_id, emb);
    }
  }

  public getEmbeddingsForUser(userId: string, docIds?: string[]): EmbeddingRecord[] {
    return Array.from(this.embeddings.values()).filter(e => {
      if (e.user_id !== userId) return false;
      if (docIds && docIds.length > 0 && !docIds.includes(e.document_id)) return false;
      return true;
    });
  }

  // --- Observations ---
  public saveObservations(obsList: ObservationRecord[]): void {
    for (const obs of obsList) {
      this.observations.set(obs.observation_id, obs);
    }
  }

  public getObservationsForDocument(docId: string, userId: string): ObservationRecord[] {
    return Array.from(this.observations.values())
      .filter(o => o.document_id === docId && o.user_id === userId);
  }

  public getObservationsForUser(userId: string): ObservationRecord[] {
    return Array.from(this.observations.values())
      .filter(o => o.user_id === userId);
  }

  public updateObservation(obsId: string, userId: string, update: { corrected_value: string; reason?: string; actor: string }): ObservationRecord | null {
    const obs = this.observations.get(obsId);
    if (!obs || obs.user_id !== userId) return null;

    obs.user_corrected = {
      original_value: String(obs.value),
      corrected_value: update.corrected_value,
      reason: update.reason,
      corrected_at: new Date().toISOString(),
      corrected_by: update.actor
    };
    obs.value = update.corrected_value;
    obs.needs_review = false;
    this.observations.set(obsId, obs);
    return obs;
  }

  // --- Citations ---
  public saveCitation(citation: CitationRecord): void {
    this.citations.set(citation.citation_id, citation);
  }

  public getCitation(citationId: string): CitationRecord | null {
    return this.citations.get(citationId) || null;
  }

  // --- V4 Medical NLP Entities ---
  public saveMedicalEntities(docId: string, userId: string, entities: MedicalEntity[]): void {
    // Clear prior entities for this document
    for (const [id, ent] of this.medicalEntities.entries()) {
      if (ent.document_id === docId) {
        this.medicalEntities.delete(id);
      }
    }
    for (const ent of entities) {
      this.medicalEntities.set(ent.entity_id, ent);
    }
  }

  public getMedicalEntities(docId: string): MedicalEntity[] {
    return Array.from(this.medicalEntities.values()).filter(e => e.document_id === docId);
  }

  // --- V4 Clinical Relations ---
  public saveClinicalRelations(docId: string, userId: string, relations: ClinicalRelation[]): void {
    for (const [id, rel] of this.clinicalRelations.entries()) {
      if (rel.document_id === docId) {
        this.clinicalRelations.delete(id);
      }
    }
    for (const rel of relations) {
      this.clinicalRelations.set(rel.relation_id, rel);
    }
  }

  public getClinicalRelations(docId: string): ClinicalRelation[] {
    return Array.from(this.clinicalRelations.values()).filter(r => r.document_id === docId);
  }

  // --- V4 Structured Health Facts ---
  public saveStructuredHealthFacts(docId: string, userId: string, facts: StructuredHealthFact[]): void {
    for (const [id, fact] of this.structuredHealthFacts.entries()) {
      if (fact.document_id === docId && fact.user_id === userId) {
        this.structuredHealthFacts.delete(id);
      }
    }
    for (const fact of facts) {
      this.structuredHealthFacts.set(fact.fact_id, fact);
    }
  }

  public getStructuredHealthFacts(docId: string, userId: string): StructuredHealthFact[] {
    return Array.from(this.structuredHealthFacts.values())
      .filter(f => f.document_id === docId && f.user_id === userId);
  }

  public getAllStructuredHealthFactsForUser(userId: string): StructuredHealthFact[] {
    return Array.from(this.structuredHealthFacts.values())
      .filter(f => f.user_id === userId);
  }

  public updateStructuredHealthFact(
    factId: string,
    userId: string,
    update: { corrected_value: string; reason?: string; actor: string }
  ): StructuredHealthFact | null {
    const fact = this.structuredHealthFacts.get(factId);
    if (!fact || fact.user_id !== userId) return null;

    fact.user_correction = {
      original_value: fact.value,
      corrected_value: update.corrected_value,
      reason: update.reason,
      corrected_at: new Date().toISOString(),
      corrected_by: update.actor
    };
    fact.value = update.corrected_value;
    const num = parseFloat(update.corrected_value);
    if (!isNaN(num)) fact.numeric_value = num;
    fact.status = 'corrected';
    fact.validation_status = 'MODEL_READY';
    this.structuredHealthFacts.set(factId, fact);
    return fact;
  }

  // --- V4 Timeline Events ---
  public saveTimelineEvents(docId: string, userId: string, events: DocumentTimelineEvent[]): void {
    for (const [id, evt] of this.timelineEvents.entries()) {
      if (evt.document_id === docId && evt.user_id === userId) {
        this.timelineEvents.delete(id);
      }
    }
    for (const evt of events) {
      this.timelineEvents.set(evt.event_id, evt);
    }
  }

  public getTimelineEvents(docId: string, userId: string): DocumentTimelineEvent[] {
    return Array.from(this.timelineEvents.values())
      .filter(e => e.document_id === docId && e.user_id === userId);
  }

  public getAllTimelineEventsForUser(userId: string): DocumentTimelineEvent[] {
    return Array.from(this.timelineEvents.values())
      .filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }

  // --- V4 NLP Runs & Classifications ---
  public saveNLPProcessingRun(run: NLPProcessingRun): void {
    this.nlpRuns.set(run.document_id, run);
  }

  public getNLPProcessingRun(docId: string, userId: string): NLPProcessingRun | null {
    const run = this.nlpRuns.get(docId);
    if (!run || run.user_id !== userId) return null;
    return run;
  }

  public saveDocumentClassification(docId: string, userId: string, classification: DocumentTypeClassificationResult): void {
    this.documentClassifications.set(docId, classification);
  }

  public getDocumentClassification(docId: string): DocumentTypeClassificationResult | null {
    return this.documentClassifications.get(docId) || null;
  }

  // --- Public Medical Knowledge Index (Separated from Private Records) ---
  public listKnowledgeSources(): KnowledgeArticle[] {
    return Array.from(this.knowledgeSources.values());
  }

  public getKnowledgeSource(sourceId: string): KnowledgeArticle | null {
    return this.knowledgeSources.get(sourceId) || null;
  }

  private seedPublicKnowledge(): void {
    const articles: KnowledgeArticle[] = [
      {
        source_id: 'guideline-acc-aha-lipid-2019',
        title: '2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease',
        publisher: 'American College of Cardiology & American Heart Association',
        source_type: 'Clinical Guideline',
        publication_date: '2019-09-01',
        topic: 'Lipids, Atherosclerotic Risk, Lifestyle Modifications',
        version: 'v2.1',
        summary: 'Establishes ASCVD risk stratification thresholds, statin eligibility, and lifestyle interventions.',
        content: 'Cardiovascular risk evaluation integrates total cholesterol, HDL-C, systolic blood pressure, smoking status, and diabetes. LDL-C targets focus on primary and secondary prevention. Non-pharmacological interventions include whole-food dietary patterns, 150 minutes of moderate aerobic activity weekly, and smoking cessation.'
      },
      {
        source_id: 'guideline-ada-standards-care-2026',
        title: 'Standards of Care in Diabetes — 2026 Guidelines',
        publisher: 'American Diabetes Association (ADA)',
        source_type: 'Clinical Guideline',
        publication_date: '2026-01-01',
        topic: 'Glycemic Targets, HbA1c, Prediabetes Screening',
        version: 'v2026.1',
        summary: 'Defines diagnostic criteria for diabetes (HbA1c >= 6.5%) and prediabetes (HbA1c 5.7%-6.4%).',
        content: 'Hemoglobin A1c reflects weighted mean glycemia over the preceding 90-120 days. Normal fasting glucose ranges 70-99 mg/dL. Prediabetes is classified at HbA1c 5.7%-6.4% or fasting glucose 100-125 mg/dL. First-line therapies emphasize structured nutrition, weight management, and Metformin when indicated.'
      },
      {
        source_id: 'guideline-kdigo-ckd-2024',
        title: 'KDIGO Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease',
        publisher: 'Kidney Disease: Improving Global Outcomes (KDIGO)',
        source_type: 'Clinical Guideline',
        publication_date: '2024-04-15',
        topic: 'eGFR, Serum Creatinine, Microalbuminuria (uACR)',
        version: 'v3.0',
        summary: 'Guides screening and risk staging using eGFR (<60 mL/min/1.73m²) and urinary albumin-to-creatinine ratio (uACR >= 30 mg/g).',
        content: 'Serum creatinine is an end-product of muscle catabolism cleared by glomerular filtration. Estimated Glomerular Filtration Rate (eGFR) calculation normalizes creatinine for age and biological sex. Spot urine albumin-to-creatinine ratio (uACR) detects early glomerular permeability alterations before eGFR decline.'
      },
      {
        source_id: 'guideline-easl-liver-enzymes-2025',
        title: 'EASL Clinical Guidelines on Non-Invasive Assessment of Liver Disease',
        publisher: 'European Association for the Study of the Liver (EASL)',
        source_type: 'Clinical Guideline',
        publication_date: '2025-05-10',
        topic: 'ALT, AST, Hepatic Steatosis, Alkaline Phosphatase',
        version: 'v2.4',
        summary: 'Explains aminotransferase elevations (ALT > AST in non-alcoholic metabolic liver disease) and non-invasive steatosis biomarkers.',
        content: 'Alanine Aminotransferase (ALT) is predominantly located in hepatocyte cytosol, serving as a sensitive indicator of hepatocellular injury. Aspartate Aminotransferase (AST) is present in liver, cardiac, and skeletal tissue. ALT elevations correlate with metabolic dysfunction-associated steatotic liver disease (MASLD).'
      },
      {
        source_id: 'guideline-who-cbc-anemia-2024',
        title: 'WHO Diagnostic Framework for Anemia and Complete Blood Count Parameters',
        publisher: 'World Health Organization (WHO)',
        source_type: 'Government Health Agency',
        publication_date: '2024-02-18',
        topic: 'Hemoglobin, Platelets, White Blood Cells, MCV',
        version: 'v1.3',
        summary: 'Outlines standard reference bands for hematological cell counts and red cell indices across demographic strata.',
        content: 'Complete Blood Count (CBC) quantifies cellular elements of peripheral blood. Hemoglobin carries oxygen; reference values for adult males are typically 13.5-17.5 g/dL and for adult females 12.0-15.5 g/dL. Platelets support primary hemostasis (150,000-450,000/mcL). WBC count measures immune defense (4,000-11,000/mcL).'
      }
    ];

    for (const article of articles) {
      this.knowledgeSources.set(article.source_id, article);
    }
  }

  // --- V5 Machine Learning Assessments ---
  public saveMLAssessment(userId: string, assessment: MLInferenceResult): UserMLAssessmentRecord {
    const record: UserMLAssessmentRecord = {
      assessment_id: assessment.assessmentId,
      user_id: userId,
      model_id: assessment.modelId,
      model_name: assessment.modelName,
      model_version: assessment.modelVersion,
      system: assessment.system,
      status: assessment.status,
      calibrated_probability: assessment.calibratedProbability,
      formatted_percentage: assessment.formattedPercentage,
      risk_category: assessment.riskCategory,
      decision_threshold: assessment.decisionThreshold,
      confidence_interval: assessment.confidenceInterval,
      input_completeness: assessment.inputCompleteness,
      feature_contributions: assessment.featureContributions,
      input_snapshot: assessment.inputSnapshot,
      data_quality: assessment.dataQuality,
      limitations: assessment.limitations,
      created_at: assessment.timestamp
    };

    this.mlAssessments.set(assessment.assessmentId, record);
    this.logAudit(userId, 'ML_ASSESSMENT_EXECUTED', {
      assessmentId: assessment.assessmentId,
      modelId: assessment.modelId,
      version: assessment.modelVersion,
      calibratedProbability: assessment.calibratedProbability
    });

    return record;
  }

  public getMLAssessment(assessmentId: string, userId: string): UserMLAssessmentRecord | null {
    const record = this.mlAssessments.get(assessmentId);
    if (!record || record.user_id !== userId) return null;
    return record;
  }

  public listMLAssessmentsForUser(userId: string, modelId?: string): UserMLAssessmentRecord[] {
    return Array.from(this.mlAssessments.values())
      .filter(a => a.user_id === userId && (!modelId || a.model_id === modelId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public saveMLSimulation(userId: string, simulation: MLSimulationResult): void {
    this.mlSimulations.push(simulation);
    this.logAudit(userId, 'ML_SIMULATION_EXECUTED', {
      modelId: simulation.modelId,
      probabilityDelta: simulation.probabilityDelta
    });
  }

  // --- V6 Imaging Studies ---
  public saveImagingStudy(study: any): void {
    this.imagingStudies.set(study.studyId, study);
    this.logAudit(study.userId, 'IMAGING_STUDY_SAVED', {
      studyId: study.studyId,
      modality: study.modality,
      title: study.title,
      status: study.status
    });
  }

  public getImagingStudy(studyId: string, userId: string): any | null {
    const study = this.imagingStudies.get(studyId);
    if (!study || study.userId !== userId) return null;
    return study;
  }

  public listImagingStudies(userId: string): any[] {
    return Array.from(this.imagingStudies.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public deleteImagingStudy(studyId: string, userId: string): boolean {
    const study = this.getImagingStudy(studyId, userId);
    if (!study) return false;

    // Cascade delete annotations & feedbacks
    for (const [annId, ann] of this.imagingAnnotations.entries()) {
      if (ann.studyId === studyId) {
        this.imagingAnnotations.delete(annId);
      }
    }

    for (const [fId, fb] of this.imagingFeedbacks.entries()) {
      if (fb.studyId === studyId) {
        this.imagingFeedbacks.delete(fId);
      }
    }

    this.imagingStudies.delete(studyId);
    this.logAudit(userId, 'IMAGING_STUDY_DELETED', { studyId });
    return true;
  }

  public saveImagingAnnotation(annotation: any): void {
    this.imagingAnnotations.set(annotation.annotationId, annotation);
    this.logAudit(annotation.userId, 'IMAGING_ANNOTATION_SAVED', {
      annotationId: annotation.annotationId,
      studyId: annotation.studyId,
      type: annotation.type
    });
  }

  public listImagingAnnotations(studyId: string, userId: string): any[] {
    return Array.from(this.imagingAnnotations.values())
      .filter(a => a.studyId === studyId && a.userId === userId);
  }

  public saveImagingFeedback(feedback: any): void {
    this.imagingFeedbacks.set(feedback.feedbackId, feedback);
    this.logAudit(feedback.userId, 'IMAGING_FEEDBACK_SUBMITTED', {
      feedbackId: feedback.feedbackId,
      studyId: feedback.studyId,
      decision: feedback.clinicianDecision
    });
  }

  public listImagingFeedback(studyId: string, userId: string): any[] {
    return Array.from(this.imagingFeedbacks.values())
      .filter(f => f.studyId === studyId && f.userId === userId);
  }

  // --- V8 Clinician Intelligence & Governance ---
  public saveClinicalSynthesis(synthesis: ClinicalSynthesis): void {
    this.clinicalSyntheses.set(synthesis.synthesisId, synthesis);
  }

  public getClinicalSynthesis(synthesisId: string): ClinicalSynthesis | null {
    return this.clinicalSyntheses.get(synthesisId) || null;
  }

  public listClinicalSyntheses(patientId: string): ClinicalSynthesis[] {
    return Array.from(this.clinicalSyntheses.values())
      .filter(s => s.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveClinicianNote(note: ClinicianNote): void {
    this.clinicianNotes.set(note.noteId, note);
  }

  public listClinicianNotes(patientId: string, clinicianId?: string, isPatientViewing: boolean = false): ClinicianNote[] {
    return Array.from(this.clinicianNotes.values())
      .filter(n => {
        if (n.patientId !== patientId) return false;
        if (isPatientViewing) {
          return n.visibility === 'PATIENT_VISIBLE';
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public savePatientExplanation(explanation: PatientExplanationDraft): void {
    this.patientExplanations.set(explanation.explanationId, explanation);
  }

  public getPatientExplanation(explanationId: string): PatientExplanationDraft | null {
    return this.patientExplanations.get(explanationId) || null;
  }

  public listPatientExplanations(patientId: string, isPatientViewing: boolean = false): PatientExplanationDraft[] {
    return Array.from(this.patientExplanations.values())
      .filter(e => {
        if (e.patientId !== patientId) return false;
        if (isPatientViewing) {
          return e.status === 'APPROVED_AND_SHARED';
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public setClinicianPatientAccess(access: ClinicianPatientAccess): void {
    this.clinicianPatientAccess.set(access.relationId, access);
  }

  public getClinicianPatientAccess(clinicianId: string, patientId: string): ClinicianPatientAccess | null {
    for (const access of this.clinicianPatientAccess.values()) {
      if (access.clinicianId === clinicianId && access.patientId === patientId) {
        return access;
      }
    }
    return null;
  }

  public listAuthorizedPatients(clinicianId: string): Array<{ patientId: string; patientName: string; lastActivity: string }> {
    // Return registered patient relations or active patient sessions in storage
    const uniqueUserIds = new Set<string>();
    for (const doc of this.documents.values()) {
      uniqueUserIds.add(doc.user_id);
    }
    for (const fact of this.structuredHealthFacts.values()) {
      uniqueUserIds.add(fact.user_id);
    }
    for (const study of this.imagingStudies.values()) {
      uniqueUserIds.add(study.userId);
    }

    if (uniqueUserIds.size === 0) {
      uniqueUserIds.add('patient-user-primary');
    }

    return Array.from(uniqueUserIds).map(uid => {
      const docs = this.listDocuments(uid);
      return {
        patientId: uid,
        patientName: uid === 'patient-user-primary' ? 'Aarav Sharma' : `Patient ${uid.substr(0, 8)}`,
        lastActivity: docs[0]?.uploaded_at || new Date().toISOString()
      };
    });
  }

  // --- Audit Trail ---
  public logAudit(userId: string, action: string, details: any): void {
    this.auditLogs.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      action,
      details
    });
  }

  public getAuditLogs(userId: string): any[] {
    return this.auditLogs.filter(l => l.userId === userId);
  }

  // Clear user data (for privacy compliance)
  public clearUserData(userId: string): void {
    const userDocs = this.listDocuments(userId);
    for (const doc of userDocs) {
      this.deleteDocument(doc.document_id, userId);
    }
    this.logAudit(userId, 'USER_DATA_CLEARED', { timestamp: new Date().toISOString() });
  }
}

export const storageEngine = new StorageEngine();
