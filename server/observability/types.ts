/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Observability & Evaluation Type System (V9)
 * OpenTelemetry-compatible tracing, LLM telemetry, RAG evaluation, NLP evaluation,
 * ML drift, reliability, cost estimation, and clinical safety.
 */

export type SpanComponent = 
  | 'HTTP_API'
  | 'DATABASE'
  | 'DOC_INGEST'
  | 'OCR'
  | 'NLP_EXTRACT'
  | 'EMBEDDING'
  | 'HYBRID_RETRIEVAL'
  | 'RERANKER'
  | 'LLM_GEMINI'
  | 'ML_INFERENCE'
  | 'CV_INFERENCE'
  | 'CLINICIAN_SYNTHESIS'
  | 'EVALUATION'
  | 'EXPORT';

export type SpanStatus = 'SUCCESS' | 'ERROR' | 'ABSTAINED' | 'DEGRADED';

export type LLMErrorType = 
  | 'timeout'
  | 'rate_limit'
  | 'authentication'
  | 'invalid_response'
  | 'schema_validation'
  | 'provider_error'
  | 'network'
  | 'content_filter'
  | 'unknown';

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  component: SpanComponent;
  operation: string;
  status: SpanStatus;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  latencyMs: number;
  modelName?: string;
  modelVersion?: string;
  pipelineVersion?: string;
  promptVersion?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  errorType?: LLMErrorType;
  errorMessage?: string;
  retryCount?: number;
  safeAttributes: Record<string, string | number | boolean | undefined>;
}

export interface TraceRecord {
  traceId: string;
  requestId: string;
  userId?: string;
  rootOperation: string;
  rootComponent: SpanComponent;
  status: SpanStatus;
  startTime: string;
  endTime: string;
  totalLatencyMs: number;
  spansCount: number;
  totalTokens: number;
  estimatedCostUsd: number;
  spans: TraceSpan[];
}

export interface ModelPricingConfig {
  modelId: string;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  currency: string;
  effectiveDate: string;
}

export interface GroundednessClassification {
  status: 'GROUNDED' | 'PARTIALLY_GROUNDED' | 'UNSUPPORTED' | 'INSUFFICIENT_EVIDENCE';
  groundedClaimsCount: number;
  unsupportedClaimsCount: number;
  totalClaimsCount: number;
  groundednessScore: number; // 0.0 to 1.0
  numericalConsistency: 'CONSISTENT' | 'NUMERIC_MISMATCH' | 'NOT_APPLICABLE';
  mismatchedFacts?: Array<{ claim: string; expected: string; actual: string }>;
}

export interface RAGEvalCase {
  caseId: string;
  question: string;
  category: 'LAB_VALUES' | 'DIAGNOSTIC_HISTORY' | 'MEDICATIONS' | 'NEGATION' | 'UNSUPPORTED_QUESTION' | 'TEMPORAL_DELTA';
  expectedDocTypes: string[];
  expectedKeywords: string[];
  expectedNumericFacts?: Record<string, number | string>;
  expectedGroundingStatus: 'GROUNDED' | 'INSUFFICIENT_EVIDENCE';
}

export interface RAGEvalResult {
  runId: string;
  timestamp: string;
  datasetVersion: string;
  totalCases: number;
  retrievalMetrics: {
    precisionAt3: number;
    recallAt3: number;
    mrr: number;
    ndcgAt3: number;
  };
  rerankerMetrics: {
    averageRankShift: number;
    top1Relevance: number;
  };
  citationMetrics: {
    citationPrecision: number;
    citationCoverage: number;
    brokenPointersCount: number;
  };
  generationMetrics: {
    averageGroundednessScore: number;
    groundedRate: number;
    unsupportedRate: number;
    numericMismatchCount: number;
    contextToAnswerRatio: number;
  };
  latencyMetrics: {
    avgRetrievalMs: number;
    avgGenerationMs: number;
    avgTotalMs: number;
  };
  costMetrics: {
    totalEstimatedCostUsd: number;
    costPerQueryUsd: number;
  };
  failedCases: Array<{
    caseId: string;
    question: string;
    reason: string;
    details: string;
  }>;
}

export interface NLPEvalResult {
  runId: string;
  timestamp: string;
  datasetVersion: string;
  totalSentences: number;
  entityExtraction: {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  };
  negationDetection: {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  };
  assertionClassification: {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  };
  temporalityClassification: {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  };
  conceptNormalization: {
    accuracy: number;
    support: number;
  };
  regressionPassRate: number;
}

export type DriftAlertState = 'NORMAL' | 'MONITOR' | 'DRIFT_DETECTED' | 'INSUFFICIENT_DATA';

export interface MLModelMonitoringResult {
  modelId: string;
  modelName: string;
  modelVersion: string;
  sampleSize: number;
  monitoringPeriod: string;
  driftStatus: DriftAlertState;
  populationStabilityIndex: number; // PSI
  ksTestPValue: number;
  missingnessRate: number;
  brierScore: number;
  expectedCalibrationError: number;
  fairnessParity: {
    subgroupsEvaluated: string[];
    maxDisparityRatio: number;
    status: 'FAIR' | 'SLIGHT_VARIATION' | 'INVESTIGATE';
  };
  featureDriftSummary: Array<{
    feature: string;
    driftScore: number;
    status: 'STABLE' | 'SHIFTED' | 'UNKNOWN';
  }>;
}

export interface CVModelMonitoringResult {
  modelId: string;
  modelName: string;
  modelVersion: string;
  sampleSize: number;
  rocAuc14PathologiesAvg: number;
  sensitivityAvg: number;
  specificityAvg: number;
  gradCamSuccessRate: number;
  imageQualityTriageRate: {
    normalQuality: number;
    lowResolution: number;
    preprocessingAbstention: number;
  };
  scannerVariationShift: 'STABLE' | 'MONITOR';
}

export interface SafetyEvalResult {
  runId: string;
  timestamp: string;
  suiteVersion: string;
  totalSafetyProbes: number;
  diagnosisAbstentionPassRate: number;
  medicationAlterationPassRate: number;
  urgentSymptomRedirectionPassRate: number;
  hallucinationAuditPassRate: number;
  disclaimerComplianceRate: number;
  overallSafetyStatus: 'SAFE' | 'WARNING' | 'FAILED';
  failedProbes: Array<{
    probeId: string;
    category: string;
    prompt: string;
    violation: string;
  }>;
}

export interface PerformanceLatencySummary {
  sampleSize: number;
  timeWindow: string;
  apiLatency: { p50: number; p95: number; p99: number };
  ragLatency: { p50: number; p95: number; p99: number };
  llmLatency: { p50: number; p95: number; p99: number };
  nlpLatency: { p50: number; p95: number; p99: number };
  mlLatency: { p50: number; p95: number; p99: number };
  cvLatency: { p50: number; p95: number; p99: number };
  docIngestLatency: { p50: number; p95: number; p99: number };
}

export interface ReliabilitySLOSummary {
  timeWindow: string;
  apiAvailability: { targetPercent: number; observedPercent: number; status: 'MET' | 'BREACHED' };
  docIngestSuccessRate: { targetPercent: number; observedPercent: number; status: 'MET' | 'BREACHED' };
  ragSuccessRate: { targetPercent: number; observedPercent: number; status: 'MET' | 'BREACHED' };
  llmSuccessRate: { targetPercent: number; observedPercent: number; status: 'MET' | 'BREACHED' };
  totalRequests: number;
  totalErrors: number;
  retriesTotal: number;
  abstentionsTotal: number;
}

export type RootCauseCategory = 
  | 'DATA'
  | 'MODEL'
  | 'PROMPT'
  | 'RETRIEVAL'
  | 'INFRASTRUCTURE'
  | 'EXTERNAL_PROVIDER'
  | 'USER_INPUT'
  | 'UNKNOWN';

export interface IncidentRecord {
  incidentId: string;
  title: string;
  component: SpanComponent;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  rootCauseCategory: RootCauseCategory;
  createdAt: string;
  resolvedAt?: string;
  impactSummary: string;
  rootCauseAnalysis: string;
  preventiveAction: string;
  affectedTracesCount: number;
}

export interface ReleaseReadinessReport {
  overallStatus: 'PASS' | 'WARN' | 'FAIL' | 'NOT_RUN';
  evaluatedAt: string;
  checks: Array<{
    category: string;
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL' | 'NOT_RUN';
    measuredValue: string;
    targetThreshold: string;
    details: string;
  }>;
}
