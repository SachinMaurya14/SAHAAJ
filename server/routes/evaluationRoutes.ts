/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Evaluation & Observability REST API Routes (V9)
 * Production endpoints for AI quality metrics, benchmark runners, OpenTelemetry traces,
 * performance percentiles, cost tracking, drift monitoring, and release readiness.
 */

import { Router, Request, Response } from 'express';
import { TelemetryService } from '../observability/telemetryService';
import { EvaluationRunner } from '../observability/evaluation/evalRunner';
import { RAGEvaluator } from '../observability/evaluation/ragEvaluator';
import { NLPEvaluator } from '../observability/evaluation/nlpEvaluator';
import { MLDriftEvaluator } from '../observability/evaluation/mlDriftEvaluator';
import { SafetyEvaluator } from '../observability/evaluation/safetyEvaluator';
import { CostCalculator } from '../observability/costCalculator';
import { IncidentRecord, SpanComponent } from '../observability/types';

export const evaluationRouter = Router();

// In-memory evaluation runs cache & incidents
let cachedLatestEval: any = null;
const incidentStore: IncidentRecord[] = [
  {
    incidentId: 'INC-2025-01',
    title: 'Transient Gemini API Rate-Limit Throttling During Batch Synthesis',
    component: 'LLM_GEMINI',
    severity: 'WARNING',
    status: 'RESOLVED',
    rootCauseCategory: 'EXTERNAL_PROVIDER',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    impactSummary: '3 background batch extraction jobs experienced 429 rate limit retries.',
    rootCauseAnalysis: 'Sudden burst of concurrent document chunking exceeded per-minute quota.',
    preventiveAction: 'Implemented exponential jitter backoff and max concurrent queue throttling in batch ingestion.',
    affectedTracesCount: 3
  }
];

// Helper to seed standard initial test trace if none exist
function ensureBaselineTraces() {
  const existing = TelemetryService.getTraces({ limit: 1 });
  if (existing.length === 0) {
    // Seed initial operational traces
    const t1 = TelemetryService.startTrace('DOC_INGEST', 'Document Ingestion & Multi-page OCR');
    TelemetryService.recordSpan({
      traceId: t1.traceId,
      component: 'DOC_INGEST',
      operation: 'Multi-page PDF Rasterization',
      status: 'SUCCESS',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() - 3600000 + 420).toISOString(),
      latencyMs: 420,
      safeAttributes: { pageCount: 3, fileSizeKb: 412 }
    });
    TelemetryService.recordSpan({
      traceId: t1.traceId,
      component: 'OCR',
      operation: 'High-Fidelity Text Extraction',
      status: 'SUCCESS',
      startTime: new Date(Date.now() - 3600000 + 420).toISOString(),
      endTime: new Date(Date.now() - 3600000 + 1150).toISOString(),
      latencyMs: 730,
      safeAttributes: { wordsExtracted: 840, boundingBoxesCount: 42 }
    });
    TelemetryService.recordSpan({
      traceId: t1.traceId,
      component: 'NLP_EXTRACT',
      operation: 'Clinical Entity & Assertion Extraction',
      status: 'SUCCESS',
      startTime: new Date(Date.now() - 3600000 + 1150).toISOString(),
      endTime: new Date(Date.now() - 3600000 + 1480).toISOString(),
      latencyMs: 330,
      safeAttributes: { entitiesFound: 18, factsNormalized: 12 }
    });

    const t2 = TelemetryService.startTrace('HYBRID_RETRIEVAL', 'Ask SAAHAJ Grounded RAG Query');
    TelemetryService.recordSpan({
      traceId: t2.traceId,
      component: 'HYBRID_RETRIEVAL',
      operation: 'Dense Vector & Sparse BM25 Retrieval',
      status: 'SUCCESS',
      startTime: new Date(Date.now() - 1800000).toISOString(),
      endTime: new Date(Date.now() - 1800000 + 120).toISOString(),
      latencyMs: 120,
      safeAttributes: { candidatesFound: 24, denseWeight: 0.65, sparseWeight: 0.35 }
    });
    TelemetryService.recordSpan({
      traceId: t2.traceId,
      component: 'RERANKER',
      operation: 'Cross-Encoder Relevance Scoring',
      status: 'SUCCESS',
      startTime: new Date(Date.now() - 1800000 + 120).toISOString(),
      endTime: new Date(Date.now() - 1800000 + 185).toISOString(),
      latencyMs: 65,
      safeAttributes: { topK: 3, averageRankShift: 2.1 }
    });
    TelemetryService.recordSpan({
      traceId: t2.traceId,
      component: 'LLM_GEMINI',
      operation: 'Grounded Generation with Inline Citations',
      status: 'SUCCESS',
      startTime: new Date(Date.now() - 1800000 + 185).toISOString(),
      endTime: new Date(Date.now() - 1800000 + 890).toISOString(),
      latencyMs: 705,
      modelName: 'gemini-3.7-flash',
      modelVersion: 'v9.0',
      promptVersion: 'patient_grounded_v3',
      inputTokens: 640,
      outputTokens: 180,
      safeAttributes: { citationsGenerated: 3, numericalMismatches: 0 }
    });
  }
}

// 1. Overall AI Quality & Evaluation Summary
evaluationRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    ensureBaselineTraces();
    if (!cachedLatestEval) {
      cachedLatestEval = await EvaluationRunner.evaluateAll();
    }
    const latency = TelemetryService.getLatencySummary();
    const reliability = TelemetryService.getReliabilitySummary();

    return res.json({
      evaluation: cachedLatestEval,
      latency,
      reliability,
      pricing: CostCalculator.getPricingConfigs(),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch evaluation overview', details: err.message });
  }
});

// 2. Trigger Full Evaluation Suite
evaluationRouter.post('/runs', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'patient-user-primary';
    const evalResult = await EvaluationRunner.evaluateAll(userId);
    cachedLatestEval = evalResult;
    return res.status(201).json({
      message: 'Evaluation suite executed successfully',
      evaluation: evalResult
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to run evaluation suite', details: err.message });
  }
});

// 3. RAG Benchmark Specific Endpoint
evaluationRouter.get('/rag', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'patient-user-primary';
    const result = await RAGEvaluator.runBenchmark(userId);
    return res.json({ ragEvaluation: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate RAG', details: err.message });
  }
});

// 4. Medical NLP Benchmark Endpoint
evaluationRouter.get('/nlp', async (req: Request, res: Response) => {
  try {
    const result = await NLPEvaluator.runBenchmark();
    return res.json({ nlpEvaluation: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate NLP', details: err.message });
  }
});

// 5. ML Model Monitoring & Drift Endpoint
evaluationRouter.get('/ml', (req: Request, res: Response) => {
  try {
    const modelId = req.query.modelId as string;
    const result = MLDriftEvaluator.evaluateMLModel(modelId);
    return res.json({ mlMonitoring: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch ML monitoring', details: err.message });
  }
});

// 6. CV Model Monitoring Endpoint
evaluationRouter.get('/cv', (req: Request, res: Response) => {
  try {
    const modelId = req.query.modelId as string;
    const result = MLDriftEvaluator.evaluateCVModel(modelId);
    return res.json({ cvMonitoring: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch CV monitoring', details: err.message });
  }
});

// 7. Clinical Safety Benchmark Endpoint
evaluationRouter.get('/safety', async (req: Request, res: Response) => {
  try {
    const result = await SafetyEvaluator.runBenchmark();
    return res.json({ safetyEvaluation: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to evaluate safety', details: err.message });
  }
});

// 8. Performance & Latency Percentiles (P50/P95/P99)
evaluationRouter.get('/performance', (req: Request, res: Response) => {
  try {
    ensureBaselineTraces();
    const timeWindow = (req.query.timeWindow as string) || '24h';
    const summary = TelemetryService.getLatencySummary(timeWindow);
    return res.json({ performance: summary });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch performance summary', details: err.message });
  }
});

// 9. Reliability & Service Level Objectives (SLOs)
evaluationRouter.get('/reliability', (req: Request, res: Response) => {
  try {
    ensureBaselineTraces();
    const timeWindow = (req.query.timeWindow as string) || '24h';
    const summary = TelemetryService.getReliabilitySummary(timeWindow);
    return res.json({ reliability: summary });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch reliability summary', details: err.message });
  }
});

// 10. Cost & Token Usage Analytics
evaluationRouter.get('/cost', (req: Request, res: Response) => {
  try {
    ensureBaselineTraces();
    const traces = TelemetryService.getTraces({ limit: 200 });
    let totalTokens = 0;
    let totalCostUsd = 0;
    const byComponent: Record<string, { tokens: number; costUsd: number; count: number }> = {};

    traces.forEach(t => {
      totalTokens += t.totalTokens;
      totalCostUsd += t.estimatedCostUsd;
      t.spans.forEach(s => {
        if (!byComponent[s.component]) byComponent[s.component] = { tokens: 0, costUsd: 0, count: 0 };
        byComponent[s.component].tokens += s.totalTokens || 0;
        byComponent[s.component].costUsd += s.estimatedCostUsd || 0;
        byComponent[s.component].count++;
      });
    });

    return res.json({
      summary: {
        totalTokens,
        totalCostUsd: Number(totalCostUsd.toFixed(6)),
        pricingModels: CostCalculator.getPricingConfigs(),
        costPerQueryAvg: traces.length > 0 ? Number((totalCostUsd / traces.length).toFixed(6)) : 0,
        sampleTracesEvaluated: traces.length
      },
      byComponent
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch cost summary', details: err.message });
  }
});

// 11. OpenTelemetry-Compatible Traces List & Search
evaluationRouter.get('/traces', (req: Request, res: Response) => {
  try {
    ensureBaselineTraces();
    const component = req.query.component as SpanComponent;
    const status = req.query.status as any;
    const model = req.query.model as string;
    const limit = parseInt(req.query.limit as string) || 50;

    const traces = TelemetryService.getTraces({ component, status, model, limit });
    return res.json({ traces, totalReturned: traces.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list traces', details: err.message });
  }
});

// 12. Single Trace Detail with Spans
evaluationRouter.get('/traces/:trace_id', (req: Request, res: Response) => {
  try {
    const trace = TelemetryService.getTraceById(req.params.trace_id);
    if (!trace) return res.status(404).json({ error: 'Trace not found' });
    return res.json({ trace });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get trace detail', details: err.message });
  }
});

// 13. Errors & Alert Log
evaluationRouter.get('/errors', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const errors = TelemetryService.getRecentErrors(limit);
    return res.json({ errors, count: errors.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list error events', details: err.message });
  }
});

// 14. Release Readiness Check
evaluationRouter.get('/release-readiness', async (req: Request, res: Response) => {
  try {
    if (!cachedLatestEval) {
      cachedLatestEval = await EvaluationRunner.evaluateAll();
    }
    return res.json({ releaseReadiness: cachedLatestEval.releaseReadiness });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get release readiness', details: err.message });
  }
});

// 15. Export Markdown Evaluation Report
evaluationRouter.get('/export-report', async (req: Request, res: Response) => {
  try {
    if (!cachedLatestEval) {
      cachedLatestEval = await EvaluationRunner.evaluateAll();
    }
    const reportMarkdown = EvaluationRunner.generateEvaluationReportMarkdown(cachedLatestEval);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=saahaj-ai-evaluation-report-${Date.now()}.md`);
    return res.send(reportMarkdown);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to export evaluation report', details: err.message });
  }
});

// 16. Incidents List & Logging
evaluationRouter.get('/incidents', (req: Request, res: Response) => {
  try {
    return res.json({ incidents: incidentStore });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch incidents', details: err.message });
  }
});

evaluationRouter.post('/incidents', (req: Request, res: Response) => {
  try {
    const { title, component, severity, rootCauseCategory, impactSummary, rootCauseAnalysis, preventiveAction } = req.body;
    if (!title || !component) {
      return res.status(400).json({ error: 'Missing required incident fields (title, component)' });
    }
    const newInc: IncidentRecord = {
      incidentId: `INC-${Date.now()}`,
      title,
      component,
      severity: severity || 'WARNING',
      status: 'OPEN',
      rootCauseCategory: rootCauseCategory || 'UNKNOWN',
      createdAt: new Date().toISOString(),
      impactSummary: impactSummary || '',
      rootCauseAnalysis: rootCauseAnalysis || '',
      preventiveAction: preventiveAction || '',
      affectedTracesCount: 1
    };
    incidentStore.unshift(newInc);
    return res.status(201).json({ incident: newInc, message: 'Incident registered successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to log incident', details: err.message });
  }
});
