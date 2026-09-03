/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Telemetry & OpenTelemetry-Compatible Tracing Service
 * Records spans, tracks latency percentiles, error rates, and token budgets
 * with strict privacy protection (no PHI in traces).
 */

import crypto from 'crypto';
import { 
  TraceRecord, 
  TraceSpan, 
  SpanComponent, 
  SpanStatus, 
  LLMErrorType,
  PerformanceLatencySummary,
  ReliabilitySLOSummary
} from './types';
import { CostCalculator } from './costCalculator';

export class TelemetryService {
  private static traces = new Map<string, TraceRecord>();
  private static errorLog: Array<{
    errorId: string;
    timestamp: string;
    component: SpanComponent;
    errorType: string;
    message: string;
    traceId?: string;
  }> = [];

  /**
   * Start a new distributed trace
   */
  public static startTrace(
    rootComponent: SpanComponent,
    rootOperation: string,
    userId?: string,
    existingTraceId?: string
  ): { traceId: string; requestId: string } {
    const traceId = existingTraceId || `trace-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const requestId = `req-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const trace: TraceRecord = {
      traceId,
      requestId,
      userId: userId ? 'ANONYMIZED_USER' : undefined, // Strip raw user id to protect privacy in technical traces
      rootOperation,
      rootComponent,
      status: 'SUCCESS',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      totalLatencyMs: 0,
      spansCount: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      spans: []
    };

    this.traces.set(traceId, trace);
    // Keep in-memory store bounded
    if (this.traces.size > 2000) {
      const oldestKey = this.traces.keys().next().value;
      if (oldestKey) this.traces.delete(oldestKey);
    }

    return { traceId, requestId };
  }

  /**
   * Record an execution span within a trace
   */
  public static recordSpan(span: {
    traceId: string;
    parentSpanId?: string;
    component: SpanComponent;
    operation: string;
    status: SpanStatus;
    startTime: string;
    endTime: string;
    latencyMs: number;
    modelName?: string;
    modelVersion?: string;
    pipelineVersion?: string;
    promptVersion?: string;
    inputTokens?: number;
    outputTokens?: number;
    errorType?: LLMErrorType;
    errorMessage?: string;
    retryCount?: number;
    safeAttributes?: Record<string, string | number | boolean | undefined>;
  }): TraceSpan {
    const spanId = `span-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const inTokens = span.inputTokens || 0;
    const outTokens = span.outputTokens || 0;
    const totalTokens = inTokens + outTokens;

    let estimatedCostUsd = 0;
    if (totalTokens > 0) {
      const costInfo = CostCalculator.calculateCost(span.modelName, inTokens, outTokens);
      estimatedCostUsd = costInfo.estimatedCostUsd;
    }

    const newSpan: TraceSpan = {
      spanId,
      traceId: span.traceId,
      parentSpanId: span.parentSpanId,
      component: span.component,
      operation: span.operation,
      status: span.status,
      startTime: span.startTime,
      endTime: span.endTime,
      latencyMs: span.latencyMs,
      modelName: span.modelName,
      modelVersion: span.modelVersion || 'v9.0',
      pipelineVersion: span.pipelineVersion || 'v9.0',
      promptVersion: span.promptVersion,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens,
      estimatedCostUsd,
      errorType: span.errorType,
      errorMessage: span.errorMessage,
      retryCount: span.retryCount || 0,
      safeAttributes: span.safeAttributes || {}
    };

    let trace = this.traces.get(span.traceId);
    if (!trace) {
      const started = this.startTrace(span.component, span.operation, undefined, span.traceId);
      trace = this.traces.get(started.traceId)!;
    }

    trace.spans.push(newSpan);
    trace.spansCount = trace.spans.length;
    trace.totalTokens += totalTokens;
    trace.estimatedCostUsd = Number((trace.estimatedCostUsd + estimatedCostUsd).toFixed(6));
    trace.endTime = span.endTime;
    trace.totalLatencyMs = Math.max(
      trace.totalLatencyMs,
      new Date(span.endTime).getTime() - new Date(trace.startTime).getTime()
    );

    if (span.status === 'ERROR') {
      trace.status = 'ERROR';
      this.errorLog.push({
        errorId: `err-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        timestamp: span.endTime,
        component: span.component,
        errorType: span.errorType || 'unknown',
        message: span.errorMessage || 'Span execution failure',
        traceId: span.traceId
      });
      if (this.errorLog.length > 500) this.errorLog.shift();
    }

    return newSpan;
  }

  /**
   * Get recent traces with optional filtering
   */
  public static getTraces(options?: {
    component?: SpanComponent;
    status?: SpanStatus;
    model?: string;
    limit?: number;
  }): TraceRecord[] {
    let list = Array.from(this.traces.values());
    if (options?.component) list = list.filter(t => t.rootComponent === options.component || t.spans.some(s => s.component === options.component));
    if (options?.status) list = list.filter(t => t.status === options.status);
    if (options?.model) list = list.filter(t => t.spans.some(s => s.modelName?.includes(options.model!)));

    // Sort descending by startTime
    list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    return list.slice(0, options?.limit || 50);
  }

  public static getTraceById(traceId: string): TraceRecord | undefined {
    return this.traces.get(traceId);
  }

  public static getRecentErrors(limit: number = 50) {
    return [...this.errorLog].reverse().slice(0, limit);
  }

  /**
   * Compute actual P50, P95, P99 percentiles across collected spans
   */
  public static getLatencySummary(timeWindow: string = '24h'): PerformanceLatencySummary {
    const allSpans: TraceSpan[] = [];
    for (const trace of this.traces.values()) {
      allSpans.push(...trace.spans);
    }

    const calcPercentiles = (spans: TraceSpan[]) => {
      if (spans.length === 0) return { p50: 0, p95: 0, p99: 0 };
      const sorted = spans.map(s => s.latencyMs).sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1] || 0;
      const p99 = sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1] || 0;
      return { p50, p95, p99 };
    };

    const filterByComp = (comp: SpanComponent) => allSpans.filter(s => s.component === comp);

    return {
      sampleSize: allSpans.length,
      timeWindow,
      apiLatency: calcPercentiles(filterByComp('HTTP_API')),
      ragLatency: calcPercentiles(filterByComp('HYBRID_RETRIEVAL')),
      llmLatency: calcPercentiles(filterByComp('LLM_GEMINI')),
      nlpLatency: calcPercentiles(filterByComp('NLP_EXTRACT')),
      mlLatency: calcPercentiles(filterByComp('ML_INFERENCE')),
      cvLatency: calcPercentiles(filterByComp('CV_INFERENCE')),
      docIngestLatency: calcPercentiles(filterByComp('DOC_INGEST'))
    };
  }

  /**
   * Compute reliability & SLO targets vs observed
   */
  public static getReliabilitySummary(timeWindow: string = '24h'): ReliabilitySLOSummary {
    const tracesList = Array.from(this.traces.values());
    const totalRequests = tracesList.length;
    const errorTraces = tracesList.filter(t => t.status === 'ERROR').length;
    
    const allSpans: TraceSpan[] = [];
    for (const t of tracesList) allSpans.push(...t.spans);

    const checkSuccess = (comp: SpanComponent) => {
      const compSpans = allSpans.filter(s => s.component === comp);
      if (compSpans.length === 0) return { targetPercent: 99.0, observedPercent: 100.0, status: 'MET' as const };
      const ok = compSpans.filter(s => s.status === 'SUCCESS').length;
      const rate = Number(((ok / compSpans.length) * 100).toFixed(2));
      return {
        targetPercent: 99.0,
        observedPercent: rate,
        status: rate >= 99.0 ? ('MET' as const) : ('BREACHED' as const)
      };
    };

    const apiObserved = totalRequests > 0 ? Number((((totalRequests - errorTraces) / totalRequests) * 100).toFixed(2)) : 100.0;

    return {
      timeWindow,
      apiAvailability: {
        targetPercent: 99.5,
        observedPercent: apiObserved,
        status: apiObserved >= 99.5 ? 'MET' : 'BREACHED'
      },
      docIngestSuccessRate: checkSuccess('DOC_INGEST'),
      ragSuccessRate: checkSuccess('HYBRID_RETRIEVAL'),
      llmSuccessRate: checkSuccess('LLM_GEMINI'),
      totalRequests,
      totalErrors: errorTraces,
      retriesTotal: allSpans.reduce((acc, s) => acc + (s.retryCount || 0), 0),
      abstentionsTotal: allSpans.filter(s => s.status === 'ABSTAINED').length
    };
  }
}
