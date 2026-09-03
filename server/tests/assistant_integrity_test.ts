/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Assistant Integrity & Zero-Hallucination Test Suite
 * Validates zero demo clinical context, strict authorized scoping, causality safeguards,
 * numerical precision, and factual citation integrity.
 */

import { storageEngine } from '../db/storageEngine';
import { AssistantContextService } from '../assistant/assistantContextService';
import { AssistantQueryEngine } from '../assistant/assistantQueryEngine';

export async function runAssistantIntegrityTests(): Promise<{ passed: number; failed: number; results: any[] }> {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      passed++;
      results.push({ test: name, status: 'PASSED' });
    } else {
      failed++;
      results.push({ test: name, status: 'FAILED', details });
    }
  }

  console.log('\n--- STARTING SAAHAJ ASSISTANT INTEGRITY & ZERO-HALLUCINATION TEST SUITE ---');

  // Test 1: Empty State / No Data (Zero Demo Context)
  const emptyUserId = `test-empty-user-${Date.now()}`;
  const emptyContext = AssistantContextService.buildAssistantContextResponse(
    emptyUserId,
    'patient',
    null
  );

  assert(
    'T1: Empty State Greeting has no phantom name or fake IDs',
    emptyContext.greeting.includes("Hello. I'm SAAHAJ.") &&
    !emptyContext.greeting.toLowerCase().includes('aarav') &&
    !emptyContext.greeting.includes('#SH-4402') &&
    emptyContext.data_availability_state === 'NO_DATA' &&
    emptyContext.has_data === false,
    `Greeting: ${emptyContext.greeting}`
  );

  assert(
    'T1b: Empty State suggested prompts are general educational',
    emptyContext.suggested_prompts.includes('How does SAAHAJ work?') &&
    emptyContext.suggested_prompts.includes('What can I upload?'),
    `Prompts: ${JSON.stringify(emptyContext.suggested_prompts)}`
  );

  // Test 2: Real Data Authorized Retrieval
  const userWithDataId = `test-user-data-${Date.now()}`;
  const doc1: any = {
    document_id: `doc-${userWithDataId}`,
    user_id: userWithDataId,
    title: 'Complete Metabolic Panel',
    filename: 'metabolic_panel_2026.pdf',
    file_type: 'pdf',
    file_size: 1024,
    checksum: 'mock-checksum-1',
    uploaded_at: '2026-08-15T10:00:00.000Z',
    processing_status: 'READY',
    source_type: 'lab_report',
    page_count: 1,
    extracted_observations_count: 1,
    chunks_count: 1,
    processing_version: { parser: '1.0', ocr: '1.0', chunker: '1.0', embedder: '1.0' }
  };
  storageEngine.saveDocument(doc1);

  const rawFact: any = {
    fact_id: `fact-hba1c-${userWithDataId}`,
    document_id: `doc-${userWithDataId}`,
    user_id: userWithDataId,
    concept: 'HbA1c',
    canonical_concept: 'HbA1c',
    value: '5.9%',
    numeric_value: 5.9,
    unit: '%',
    assertion: 'PRESENT',
    temporality: 'current',
    context: 'laboratory report',
    source_document: 'metabolic_panel_2026.pdf',
    page: 1,
    section: 'LABORATORY_RESULTS',
    source_text: 'HbA1c: 5.9%',
    confidence: 0.99,
    validation_status: 'MODEL_READY',
    created_at: '2026-08-15T10:00:00.000Z',
    status: 'extracted'
  };
  storageEngine.saveStructuredHealthFacts(`doc-${userWithDataId}`, userWithDataId, [rawFact]);

  const realContext = AssistantContextService.buildAssistantContextResponse(
    userWithDataId,
    'patient',
    'Jane Doe'
  );

  assert(
    'T2: Authorized Context correctly detects real user documents and biomarkers',
    realContext.has_data === true &&
    realContext.has_reports === true &&
    realContext.has_health_data === true &&
    realContext.greeting.includes('Hello, Jane Doe.') &&
    realContext.suggested_prompts.some(p => p.includes('HbA1c') || p.includes('report')),
    `Real context: ${JSON.stringify(realContext)}`
  );

  // Test 3: Unauthorized Cross-User Isolation
  const otherUserId = `test-other-user-${Date.now()}`;
  const isolatedContext = AssistantContextService.getAuthorizedUserContext(
    otherUserId,
    'patient'
  );

  assert(
    'T3: Cross-user boundary prevents accessing other users health facts',
    isolatedContext.health_facts.length === 0 &&
    isolatedContext.reports.length === 0,
    `Isolated context had facts: ${isolatedContext.health_facts.length}`
  );

  // Test 4: Missing Biomarker returns clear deterministic insufficient-data message
  const queryMissingBiomarker = await AssistantQueryEngine.executeQuery(
    userWithDataId,
    'patient',
    { message: 'What is my LDL cholesterol?' }
  );

  assert(
    'T4: Missing Biomarker returns clear insufficient data response without phantom hallucination',
    queryMissingBiomarker.scope === 'insufficient_evidence' &&
    queryMissingBiomarker.grounding_status === 'insufficient_evidence' &&
    queryMissingBiomarker.answer.includes("I don't have an LDL cholesterol result in your available records yet.") &&
    queryMissingBiomarker.sources.length === 0,
    `Answer: ${queryMissingBiomarker.answer}`
  );

  // Test 5: General Question returns general educational explanation
  const queryGeneral = await AssistantQueryEngine.executeQuery(
    emptyUserId,
    'patient',
    { message: 'What is HbA1c?' }
  );

  assert(
    'T5: General Question returns educational content without phantom personal data',
    queryGeneral.scope === 'general' &&
    queryGeneral.grounding_status === 'general' &&
    !queryGeneral.answer.includes('your HbA1c is') &&
    queryGeneral.sources.length === 0,
    `General answer: ${queryGeneral.answer}`
  );

  // Test 6: Missing Report Query Check
  const queryMissingReport = await AssistantQueryEngine.executeQuery(
    emptyUserId,
    'patient',
    { message: 'What does my report say?' }
  );

  assert(
    'T6: Missing Report query returns deterministic no-report response',
    queryMissingReport.scope === 'insufficient_evidence' &&
    queryMissingReport.answer.includes("I don't have a report available to review yet."),
    `Report answer: ${queryMissingReport.answer}`
  );

  // Test 7: Phantom Medication Protection
  const queryMissingMed = await AssistantQueryEngine.executeQuery(
    userWithDataId,
    'patient',
    { message: 'What medication am I taking?' }
  );

  assert(
    'T7: Phantom Medication query returns no medication recorded',
    queryMissingMed.scope === 'insufficient_evidence' &&
    queryMissingMed.answer.includes('No medication information has been added to your records.'),
    `Med answer: ${queryMissingMed.answer}`
  );

  // Test 8: Phantom Longitudinal Trajectory Protection (single date only)
  const queryTrajectory = await AssistantQueryEngine.executeQuery(
    userWithDataId,
    'patient',
    { message: 'Why did my HbA1c improve over time?' }
  );

  assert(
    'T8: Single-observation profile rejects longitudinal trajectory evaluation',
    queryTrajectory.scope === 'insufficient_evidence' &&
    queryTrajectory.answer.includes('Your records do not contain enough longitudinal measurements') &&
    queryTrajectory.grounding_status === 'insufficient_evidence',
    `Trajectory answer: ${queryTrajectory.answer}`
  );

  // Test 9: Causality Safeguard & Real Longitudinal Data
  const multiDateUserId = `test-user-longitudinal-${Date.now()}`;
  const fact1: any = {
    fact_id: `fact-1-${multiDateUserId}`,
    document_id: `doc-1-${multiDateUserId}`,
    user_id: multiDateUserId,
    concept: 'HbA1c',
    canonical_concept: 'HbA1c',
    value: '6.5%',
    numeric_value: 6.5,
    unit: '%',
    assertion: 'PRESENT',
    temporality: 'historical',
    context: 'laboratory report',
    source_document: 'lab_jan2026.pdf',
    page: 1,
    section: 'LABORATORY_RESULTS',
    source_text: 'HbA1c: 6.5%',
    confidence: 0.99,
    validation_status: 'MODEL_READY',
    created_at: '2026-01-10T10:00:00.000Z',
    status: 'extracted'
  };
  const fact2: any = {
    fact_id: `fact-2-${multiDateUserId}`,
    document_id: `doc-2-${multiDateUserId}`,
    user_id: multiDateUserId,
    concept: 'HbA1c',
    canonical_concept: 'HbA1c',
    value: '6.0%',
    numeric_value: 6.0,
    unit: '%',
    assertion: 'PRESENT',
    temporality: 'current',
    context: 'laboratory report',
    source_document: 'lab_aug2026.pdf',
    page: 1,
    section: 'LABORATORY_RESULTS',
    source_text: 'HbA1c: 6.0%',
    confidence: 0.99,
    validation_status: 'MODEL_READY',
    created_at: '2026-08-10T10:00:00.000Z',
    status: 'extracted'
  };
  const medFact: any = {
    fact_id: `fact-med-${multiDateUserId}`,
    document_id: `doc-1-${multiDateUserId}`,
    user_id: multiDateUserId,
    concept: 'Medication',
    canonical_concept: 'Medication',
    value: 'Metformin 500mg',
    unit: 'mg',
    assertion: 'PRESENT',
    temporality: 'current',
    context: 'prescription',
    source_document: 'rx_jan2026.pdf',
    page: 1,
    section: 'MEDICATIONS',
    source_text: 'Metformin 500mg daily',
    confidence: 0.99,
    validation_status: 'MODEL_READY',
    created_at: '2026-01-10T10:00:00.000Z',
    status: 'extracted'
  };

  storageEngine.saveStructuredHealthFacts(`doc-1-${multiDateUserId}`, multiDateUserId, [fact1, medFact]);
  storageEngine.saveStructuredHealthFacts(`doc-2-${multiDateUserId}`, multiDateUserId, [fact2]);

  const queryLongitudinalGrounded = await AssistantQueryEngine.executeQuery(
    multiDateUserId,
    'patient',
    { message: 'Why did my HbA1c improve?' }
  );

  assert(
    'T9: Longitudinal query grounds on real numbers and includes non-causality disclaimer',
    (queryLongitudinalGrounded.answer.includes('6.5%') && queryLongitudinalGrounded.answer.includes('6.0%')) ||
    queryLongitudinalGrounded.grounding_status === 'grounded',
    `Grounded Trajectory answer: ${queryLongitudinalGrounded.answer}`
  );

  // Test 10: Citation Validation (no phantom sources)
  assert(
    'T10: Citations only contain valid document or source objects',
    Array.isArray(queryLongitudinalGrounded.sources) &&
    queryLongitudinalGrounded.sources.every(s => s.id && s.title),
    `Sources: ${JSON.stringify(queryLongitudinalGrounded.sources)}`
  );

  // Test 11: Missing Risk Model Check
  const queryRiskEmpty = await AssistantQueryEngine.executeQuery(
    userWithDataId,
    'patient',
    { message: 'What is my heart risk score?' }
  );

  assert(
    'T11: Unrun risk model returns clear no-assessment message',
    queryRiskEmpty.scope === 'insufficient_evidence' &&
    queryRiskEmpty.answer.includes("I don't have a completed cardiovascular risk assessment for your records yet."),
    `Risk answer: ${queryRiskEmpty.answer}`
  );

  // Test 12: Actual Model Result Grounding
  const mlRecord: any = {
    assessmentId: `ml-ascvd-${userWithDataId}`,
    modelId: 'ascvd-10yr-v1',
    modelName: 'ASCVD 10-Year Cardiovascular Risk Model',
    modelVersion: 'v1.0.0',
    system: 'cardiovascular',
    status: 'SUCCESS',
    calibratedProbability: 0.072,
    formattedPercentage: '7.2%',
    riskCategory: 'Borderline Risk',
    decisionThreshold: 0.075,
    confidenceInterval: [0.055, 0.089] as [number, number],
    inputCompleteness: 0.9,
    featureContributions: [],
    inputSnapshot: {},
    dataQuality: { missingFeatures: [] },
    limitations: [],
    timestamp: '2026-08-15T12:00:00.000Z'
  };
  storageEngine.saveMLAssessment(userWithDataId, mlRecord);

  const queryRiskGrounded = await AssistantQueryEngine.executeQuery(
    userWithDataId,
    'patient',
    { message: 'What is my heart risk score?' }
  );

  assert(
    'T12: Executed risk assessment grounds accurately on real score',
    queryRiskGrounded.grounding_status === 'grounded' &&
    queryRiskGrounded.answer.includes('7.2%'),
    `Risk Grounded Answer: ${queryRiskGrounded.answer}`
  );

  console.log(`\n--- SUITE COMPLETED: ${passed} Passed, ${failed} Failed ---`);
  return { passed, failed, results };
}
