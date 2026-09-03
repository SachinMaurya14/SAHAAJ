/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Evaluation & Observability API Service (V9)
 * Fetches metrics, runs benchmark suites, searches OpenTelemetry traces, and logs incidents.
 */

import { 
  EvaluationOverviewResponse, 
  TraceRecord, 
  PerformanceLatencySummary, 
  ReliabilitySLOSummary,
  ReleaseReadinessReport,
  IncidentRecord
} from '../types/evaluationTypes';

export class EvaluationApiService {
  private static baseUrl = '/api/v1/evaluation';

  /**
   * Fetch complete evaluation overview
   */
  public static async getOverview(): Promise<EvaluationOverviewResponse> {
    const res = await fetch(`${this.baseUrl}/overview`);
    if (!res.ok) throw new Error(`Failed to fetch overview: ${res.statusText}`);
    return res.json();
  }

  /**
   * Execute full evaluation benchmark suite
   */
  public static async runEvaluationSuite(): Promise<EvaluationOverviewResponse['evaluation']> {
    const res = await fetch(`${this.baseUrl}/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to execute evaluation suite: ${res.statusText}`);
    const data = await res.json();
    return data.evaluation;
  }

  /**
   * Fetch traces with optional filters
   */
  public static async getTraces(filters?: {
    component?: string;
    status?: string;
    model?: string;
    limit?: number;
  }): Promise<TraceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.component) params.append('component', filters.component);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const res = await fetch(`${this.baseUrl}/traces?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch traces: ${res.statusText}`);
    const data = await res.json();
    return data.traces || [];
  }

  /**
   * Fetch single trace detail
   */
  public static async getTraceById(traceId: string): Promise<TraceRecord> {
    const res = await fetch(`${this.baseUrl}/traces/${traceId}`);
    if (!res.ok) throw new Error(`Failed to fetch trace: ${res.statusText}`);
    const data = await res.json();
    return data.trace;
  }

  /**
   * Fetch latency percentiles
   */
  public static async getPerformance(timeWindow: string = '24h'): Promise<PerformanceLatencySummary> {
    const res = await fetch(`${this.baseUrl}/performance?timeWindow=${timeWindow}`);
    if (!res.ok) throw new Error(`Failed to fetch performance: ${res.statusText}`);
    const data = await res.json();
    return data.performance;
  }

  /**
   * Fetch reliability & SLOs
   */
  public static async getReliability(timeWindow: string = '24h'): Promise<ReliabilitySLOSummary> {
    const res = await fetch(`${this.baseUrl}/reliability?timeWindow=${timeWindow}`);
    if (!res.ok) throw new Error(`Failed to fetch reliability: ${res.statusText}`);
    const data = await res.json();
    return data.reliability;
  }

  /**
   * Fetch cost breakdown
   */
  public static async getCostSummary(): Promise<{ summary: any; byComponent: any }> {
    const res = await fetch(`${this.baseUrl}/cost`);
    if (!res.ok) throw new Error(`Failed to fetch cost: ${res.statusText}`);
    return res.json();
  }

  /**
   * Fetch incidents list
   */
  public static async getIncidents(): Promise<IncidentRecord[]> {
    const res = await fetch(`${this.baseUrl}/incidents`);
    if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    const data = await res.json();
    return data.incidents || [];
  }

  /**
   * Log new incident
   */
  public static async logIncident(incident: Partial<IncidentRecord>): Promise<IncidentRecord> {
    const res = await fetch(`${this.baseUrl}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    });
    if (!res.ok) throw new Error(`Failed to log incident: ${res.statusText}`);
    const data = await res.json();
    return data.incident;
  }

  /**
   * Export Markdown report as downloaded file
   */
  public static async downloadReport(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/export-report`);
    if (!res.ok) throw new Error('Failed to download report');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saahaj-ai-evaluation-report-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
