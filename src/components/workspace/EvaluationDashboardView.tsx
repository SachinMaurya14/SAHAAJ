/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Evaluation, Observability & AI Quality Workspace (V9)
 * Full-featured engineering dashboard for RAG Evaluation, NLP Benchmarks,
 * ML Drift, Computer Vision QA, OpenTelemetry Traces, SLOs, Cost, and Clinical Safety.
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Search, 
  Cpu, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Download, 
  RefreshCw, 
  Layers, 
  Flame, 
  Sliders, 
  AlertOctagon, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Filter, 
  Zap, 
  BarChart2, 
  GitCommit, 
  BookOpen, 
  Stethoscope,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { EvaluationApiService } from '../../services/evaluationApiService';
import { 
  EvaluationOverviewResponse, 
  TraceRecord, 
  TraceSpan, 
  IncidentRecord 
} from '../../types/evaluationTypes';

interface EvaluationDashboardViewProps {
  setCurrentView?: (view: string) => void;
}

type EvalTab = 'overview' | 'rag' | 'nlp' | 'ml_cv' | 'traces' | 'perf_cost' | 'safety' | 'incidents';

export const EvaluationDashboardView: React.FC<EvaluationDashboardViewProps> = ({ setCurrentView }) => {
  const [activeTab, setActiveTab] = useState<EvalTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [evalData, setEvalData] = useState<EvaluationOverviewResponse | null>(null);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [runningEval, setRunningEval] = useState<boolean>(false);
  const [filterComponent, setFilterComponent] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [overview, traceList, incidentList] = await Promise.all([
        EvaluationApiService.getOverview(),
        EvaluationApiService.getTraces({ limit: 50 }),
        EvaluationApiService.getIncidents()
      ]);
      setEvalData(overview);
      setTraces(traceList);
      if (traceList.length > 0 && !selectedTrace) {
        setSelectedTrace(traceList[0]);
      }
      setIncidents(incidentList);
    } catch (err: any) {
      console.error('Failed to load evaluation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRunBenchmark = async () => {
    setRunningEval(true);
    try {
      const updated = await EvaluationApiService.runEvaluationSuite();
      setToastMessage('Evaluation benchmark completed successfully!');
      await loadAllData();
    } catch (err: any) {
      alert(`Benchmark execution failed: ${err.message}`);
    } finally {
      setRunningEval(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleExportReport = async () => {
    try {
      await EvaluationApiService.downloadReport();
      setToastMessage('Evaluation report downloaded successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const filteredTraces = traces.filter(t => {
    if (filterComponent !== 'ALL' && t.rootComponent !== filterComponent && !t.spans.some(s => s.component === filterComponent)) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="w-full space-y-6">
      
      {/* Editorial Header Sub-Bar */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 border border-[#A38D7D]/30 bg-[#A38D7D]/10 text-[#A38D7D]">
              V9 AI Quality & Observability
            </span>
            <span className="text-xs font-mono text-[var(--text-tertiary)]">
              OpenTelemetry v1.28 • Gold Benchmark v2025.1
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl italic text-[var(--text-primary)] mt-2">
            AI Observability, RAG Evaluation & Model Monitoring
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-newsreader mt-1 max-w-3xl">
            Deterministic evaluation benchmarks, numerical citation reconciliation, population drift monitoring (PSI), 
            and OpenTelemetry-compatible tracing across SAAHAJ's clinical AI pipeline.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunBenchmark}
            disabled={runningEval}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 font-sans text-xs font-bold uppercase tracking-wider transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${runningEval ? 'animate-spin' : ''}`} />
            {runningEval ? 'Evaluating...' : 'Run Benchmark Suite'}
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-primary)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-primary)] text-[var(--text-primary)] font-sans text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Download className="w-4 h-4 text-[#A38D7D]" />
            Export Report (.md)
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-[var(--border-primary)] flex overflow-x-auto gap-2 bg-[var(--surface-primary)] p-2">
        {[
          { id: 'overview', label: 'Release Readiness & Overview', icon: ShieldCheck },
          { id: 'rag', label: 'RAG & Retrieval Eval', icon: Search },
          { id: 'nlp', label: 'Medical NLP Benchmarks', icon: FileText },
          { id: 'ml_cv', label: 'ML Drift & CV Quality', icon: Cpu },
          { id: 'traces', label: 'OpenTelemetry Traces', icon: Layers },
          { id: 'perf_cost', label: 'Latency & Cost Breakdown', icon: Clock },
          { id: 'safety', label: 'Clinical Safety & Policy', icon: AlertOctagon },
          { id: 'incidents', label: 'Incidents & Alerts', icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EvalTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans whitespace-nowrap transition-all border ${
                isActive 
                  ? 'border-[var(--text-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold shadow-sm' 
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A38D7D]' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 border border-[var(--border-primary)] bg-[var(--surface-primary)] flex flex-col items-center justify-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-[#A38D7D] animate-spin" />
          <p className="font-editorial italic text-lg text-[var(--text-secondary)]">Loading telemetry streams & benchmark evaluations...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & RELEASE READINESS */}
          {activeTab === 'overview' && evalData && (
            <div className="space-y-6">
              
              {/* Top Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Overall Release Gate</span>
                  <div className="flex items-center gap-2 mt-2">
                    {evalData.evaluation.releaseReadiness.overallStatus === 'PASS' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-500" />
                    )}
                    <span className="text-2xl font-editorial italic font-bold text-[var(--text-primary)]">
                      {evalData.evaluation.releaseReadiness.overallStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-newsreader">
                    {evalData.evaluation.releaseReadiness.checks.filter(c => c.status === 'PASS').length} of {evalData.evaluation.releaseReadiness.checks.length} gates passed
                  </p>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">RAG Citation Coverage</span>
                  <div className="text-2xl font-editorial italic font-bold text-[var(--text-primary)] mt-2">
                    {(evalData.evaluation.rag.citationMetrics.citationCoverage * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-newsreader">
                    Precision: {(evalData.evaluation.rag.citationMetrics.citationPrecision * 100).toFixed(1)}% ({evalData.evaluation.rag.generationMetrics.numericMismatchCount} mismatches)
                  </p>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Medical NLP F1 Score</span>
                  <div className="text-2xl font-editorial italic font-bold text-[var(--text-primary)] mt-2">
                    {evalData.evaluation.nlp.entityExtraction.f1Score}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-newsreader">
                    Negation F1: {evalData.evaluation.nlp.negationDetection.f1Score} ({evalData.evaluation.nlp.totalSentences} sentences)
                  </p>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">ML Population Stability (PSI)</span>
                  <div className="text-2xl font-editorial italic font-bold text-[var(--text-primary)] mt-2">
                    {evalData.evaluation.ml.populationStabilityIndex}
                  </div>
                  <p className="text-xs text-emerald-500 font-mono mt-1">
                    Status: {evalData.evaluation.ml.driftStatus} (Stable)
                  </p>
                </div>
              </div>

              {/* Component Health Matrix & Service Level Objectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Release Readiness Checklist */}
                <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-primary)] pb-3">
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Release Readiness Quality Gates</h3>
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">Evaluated: {new Date(evalData.evaluation.evaluatedAt).toLocaleTimeString()}</span>
                  </div>

                  <div className="space-y-3">
                    {evalData.evaluation.releaseReadiness.checks.map((check, idx) => (
                      <div key={idx} className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[var(--surface-primary)] border border-[var(--border-primary)] text-[var(--text-tertiary)]">
                              {check.category}
                            </span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">{check.name}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] font-newsreader">{check.details}</p>
                          <div className="text-[11px] font-mono text-[var(--text-tertiary)]">
                            Measured: <span className="font-bold text-[var(--text-primary)]">{check.measuredValue}</span> • Target: {check.targetThreshold}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {check.status === 'PASS' && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              PASS
                            </span>
                          )}
                          {check.status === 'WARN' && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              WARN
                            </span>
                          )}
                          {check.status === 'FAIL' && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                              FAIL
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Service Level Objectives (SLOs) */}
                <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-primary)] pb-3">
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Observed Service Level Objectives (SLO)</h3>
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">Window: 24h</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Core API Availability', slo: evalData.reliability.apiAvailability },
                      { name: 'Document Ingestion & OCR Success', slo: evalData.reliability.docIngestSuccessRate },
                      { name: 'Hybrid RAG Retrieval Success', slo: evalData.reliability.ragSuccessRate },
                      { name: 'Gemini LLM Generation Success', slo: evalData.reliability.llmSuccessRate }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
                          <span className="font-mono text-emerald-400 font-bold">{item.slo.observedPercent}%</span>
                        </div>
                        <div className="w-full bg-[var(--border-primary)] h-2 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, item.slo.observedPercent)}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                          <span>Target: {item.slo.targetPercent}%</span>
                          <span className="text-emerald-400">Status: {item.slo.status}</span>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 border border-[var(--border-primary)] bg-[var(--surface-primary)]">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Total Requests</span>
                        <span className="font-bold text-[var(--text-primary)]">{evalData.reliability.totalRequests}</span>
                      </div>
                      <div className="p-2 border border-[var(--border-primary)] bg-[var(--surface-primary)]">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Total Errors</span>
                        <span className="font-bold text-[var(--text-primary)]">{evalData.reliability.totalErrors}</span>
                      </div>
                      <div className="p-2 border border-[var(--border-primary)] bg-[var(--surface-primary)]">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Abstentions</span>
                        <span className="font-bold text-[var(--text-primary)]">{evalData.reliability.abstentionsTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: RAG EVALUATION */}
          {activeTab === 'rag' && evalData && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Retrieval Metrics</span>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between"><span>Precision@3:</span><span className="font-mono font-bold">{evalData.evaluation.rag.retrievalMetrics.precisionAt3}</span></div>
                    <div className="flex justify-between"><span>Recall@3:</span><span className="font-mono font-bold">{evalData.evaluation.rag.retrievalMetrics.recallAt3}</span></div>
                    <div className="flex justify-between"><span>Mean Reciprocal Rank (MRR):</span><span className="font-mono font-bold">{evalData.evaluation.rag.retrievalMetrics.mrr}</span></div>
                    <div className="flex justify-between"><span>NDCG@3:</span><span className="font-mono font-bold">{evalData.evaluation.rag.retrievalMetrics.ndcgAt3}</span></div>
                  </div>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Citation & Evidence Grounding</span>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between"><span>Citation Precision:</span><span className="font-mono font-bold">{(evalData.evaluation.rag.citationMetrics.citationPrecision * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>Citation Coverage:</span><span className="font-mono font-bold">{(evalData.evaluation.rag.citationMetrics.citationCoverage * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>Grounded Rate:</span><span className="font-mono font-bold">{(evalData.evaluation.rag.generationMetrics.groundedRate * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>Broken Citation Pointers:</span><span className="font-mono font-bold text-emerald-400">{evalData.evaluation.rag.citationMetrics.brokenPointersCount}</span></div>
                  </div>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Efficiency & Cost</span>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between"><span>Avg Retrieval Latency:</span><span className="font-mono font-bold">{evalData.evaluation.rag.latencyMetrics.avgRetrievalMs} ms</span></div>
                    <div className="flex justify-between"><span>Avg Generation Latency:</span><span className="font-mono font-bold">{evalData.evaluation.rag.latencyMetrics.avgGenerationMs} ms</span></div>
                    <div className="flex justify-between"><span>Context-to-Answer Ratio:</span><span className="font-mono font-bold">{evalData.evaluation.rag.generationMetrics.contextToAnswerRatio}x</span></div>
                    <div className="flex justify-between"><span>Estimated Cost / Query:</span><span className="font-mono font-bold">${evalData.evaluation.rag.costMetrics.costPerQueryUsd}</span></div>
                  </div>
                </div>
              </div>

              {/* Numerical Fact Reconciliation & Hallucination Audit */}
              <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--border-primary)] pb-3">
                  <div>
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Numerical Fact Consistency & Hallucination Audits</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-newsreader mt-0.5">
                      Verifies that generated values match structured lab report values verbatim (e.g. HbA1c 6.2 vs 6.5).
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {evalData.evaluation.rag.generationMetrics.numericMismatchCount} Mismatches
                  </span>
                </div>

                {evalData.evaluation.rag.failedCases.length === 0 ? (
                  <div className="p-6 border border-emerald-500/30 bg-emerald-500/5 text-center space-y-1">
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-[var(--text-primary)]">All {evalData.evaluation.rag.totalCases} RAG Benchmark Test Cases Passed</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">Zero numerical discrepancies or unsupported hallucinations detected across the gold test suite.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evalData.evaluation.rag.failedCases.map((fc, idx) => (
                      <div key={idx} className="p-3 border border-rose-500/30 bg-rose-500/5 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-rose-400">{fc.caseId} • {fc.reason}</span>
                        </div>
                        <p className="font-bold text-[var(--text-primary)]">Query: "{fc.question}"</p>
                        <p className="text-[var(--text-secondary)] font-mono text-[11px]">{fc.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: MEDICAL NLP EVALUATION */}
          {activeTab === 'nlp' && evalData && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Entity Extraction</span>
                  <div className="text-2xl font-editorial italic font-bold text-[var(--text-primary)] mt-2">
                    F1: {evalData.evaluation.nlp.entityExtraction.f1Score}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-2 space-y-1">
                    <div className="flex justify-between"><span>Precision:</span><span className="font-mono">{evalData.evaluation.nlp.entityExtraction.precision}</span></div>
                    <div className="flex justify-between"><span>Recall:</span><span className="font-mono">{evalData.evaluation.nlp.entityExtraction.recall}</span></div>
                    <div className="flex justify-between"><span>Support:</span><span className="font-mono">{evalData.evaluation.nlp.entityExtraction.support} entities</span></div>
                  </div>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Negation Detection</span>
                  <div className="text-2xl font-editorial italic font-bold text-[var(--text-primary)] mt-2">
                    F1: {evalData.evaluation.nlp.negationDetection.f1Score}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-2 space-y-1">
                    <div className="flex justify-between"><span>Precision:</span><span className="font-mono">{evalData.evaluation.nlp.negationDetection.precision}</span></div>
                    <div className="flex justify-between"><span>Recall:</span><span className="font-mono">{evalData.evaluation.nlp.negationDetection.recall}</span></div>
                    <div className="flex justify-between"><span>Support:</span><span className="font-mono">{evalData.evaluation.nlp.negationDetection.support} sentences</span></div>
                  </div>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Concept Normalization</span>
                  <div className="text-2xl font-editorial italic font-bold text-[var(--text-primary)] mt-2">
                    {(evalData.evaluation.nlp.conceptNormalization.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-2 space-y-1">
                    <div className="flex justify-between"><span>SNOMED / LOINC Map:</span><span className="font-mono">Active</span></div>
                    <div className="flex justify-between"><span>Canonical Match:</span><span className="font-mono">Standardized</span></div>
                    <div className="flex justify-between"><span>Support:</span><span className="font-mono">{evalData.evaluation.nlp.conceptNormalization.support} concepts</span></div>
                  </div>
                </div>

                <div className="p-5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Clinical Regression Gate</span>
                  <div className="text-2xl font-editorial italic font-bold text-emerald-400 mt-2">
                    {evalData.evaluation.nlp.regressionPassRate}%
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 font-newsreader">
                    Passing tricky phrasing: "No evidence of pneumonia", "Mother has diabetes", "Denies chest pain".
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ML DRIFT & COMPUTER VISION MONITORING */}
          {activeTab === 'ml_cv' && evalData && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabular ML Drift & Calibration */}
                <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                    <div>
                      <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">V5 Tabular ML: Population Drift & Calibration</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-newsreader">Model: {evalData.evaluation.ml.modelName} ({evalData.evaluation.ml.modelVersion})</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {evalData.evaluation.ml.driftStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Population Stability Index (PSI)</span>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{evalData.evaluation.ml.populationStabilityIndex}</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">Threshold: PSI &lt; 0.25 (Stable)</span>
                    </div>

                    <div className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Brier Calibration Score</span>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{evalData.evaluation.ml.brierScore}</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">Expected Calib Error: {(evalData.evaluation.ml.expectedCalibrationError * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Feature Distribution Shifts</h4>
                    <div className="space-y-1.5 text-xs">
                      {evalData.evaluation.ml.featureDriftSummary.map((f, idx) => (
                        <div key={idx} className="p-2 border border-[var(--border-primary)] bg-[var(--surface-primary)] flex items-center justify-between">
                          <span className="font-medium text-[var(--text-primary)]">{f.feature}</span>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-[var(--text-tertiary)]">Shift: {f.driftScore}</span>
                            <span className="text-emerald-400 font-bold text-[10px] px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10">
                              {f.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Computer Vision (V6) Quality */}
                <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                    <div>
                      <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">V6 Medical Imaging: Computer Vision QA</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-newsreader">Architecture: DenseNet-121 Multi-Label Chest X-Ray</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {evalData.evaluation.cv.scannerVariationShift}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">14-Pathology AUC</span>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{evalData.evaluation.cv.rocAuc14PathologiesAvg}</span>
                    </div>
                    <div className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Sensitivity</span>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{evalData.evaluation.cv.sensitivityAvg}</span>
                    </div>
                    <div className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Specificity</span>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{evalData.evaluation.cv.specificityAvg}</span>
                    </div>
                  </div>

                  <div className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold">Grad-CAM Heatmap Generation Fidelity:</span>
                      <span className="font-mono text-emerald-400 font-bold">{(evalData.evaluation.cv.gradCamSuccessRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Image Quality Triage (Normal):</span>
                      <span className="font-mono">{(evalData.evaluation.cv.imageQualityTriageRate.normalQuality * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Resolution Abstentions:</span>
                      <span className="font-mono">{(evalData.evaluation.cv.imageQualityTriageRate.lowResolution * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: OPENTELEMETRY TRACES */}
          {activeTab === 'traces' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Trace List Sidebar (4 cols) */}
              <div className="lg:col-span-5 p-4 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-2">
                  <h3 className="font-editorial text-lg italic text-[var(--text-primary)]">Distributed Traces ({filteredTraces.length})</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterComponent}
                      onChange={e => setFilterComponent(e.target.value)}
                      className="text-[11px] p-1 border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                    >
                      <option value="ALL">All Components</option>
                      <option value="DOC_INGEST">Doc Ingest</option>
                      <option value="HYBRID_RETRIEVAL">RAG Retrieval</option>
                      <option value="LLM_GEMINI">Gemini LLM</option>
                      <option value="ML_INFERENCE">ML Tabular</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredTraces.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">No traces matching filters.</div>
                  ) : (
                    filteredTraces.map(t => (
                      <div
                        key={t.traceId}
                        onClick={() => setSelectedTrace(t)}
                        className={`p-3 border cursor-pointer transition-colors text-xs space-y-1.5 ${
                          selectedTrace?.traceId === t.traceId
                            ? 'border-[var(--text-primary)] bg-[var(--surface-secondary)] shadow-sm'
                            : 'border-[var(--border-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[11px] text-[var(--text-primary)]">{t.traceId}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {t.status}
                          </span>
                        </div>
                        <p className="font-bold text-[var(--text-primary)] truncate">{t.rootOperation}</p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                          <span>{t.spansCount} spans • {t.totalLatencyMs} ms</span>
                          <span>{t.totalTokens > 0 ? `${t.totalTokens} tok • $${t.estimatedCostUsd}` : 'compute'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Trace Detail & Span Flamegraph (7 cols) */}
              <div className="lg:col-span-7 p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                {selectedTrace ? (
                  <>
                    <div className="border-b border-[var(--border-primary)] pb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#A38D7D]">{selectedTrace.traceId}</span>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">{new Date(selectedTrace.startTime).toLocaleTimeString()}</span>
                      </div>
                      <h3 className="font-editorial text-2xl italic text-[var(--text-primary)]">{selectedTrace.rootOperation}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-secondary)] pt-1">
                        <span>Component: <strong className="text-[var(--text-primary)]">{selectedTrace.rootComponent}</strong></span>
                        <span>Total Duration: <strong className="text-[var(--text-primary)]">{selectedTrace.totalLatencyMs} ms</strong></span>
                        <span>Cost: <strong className="text-emerald-400">${selectedTrace.estimatedCostUsd}</strong></span>
                      </div>
                    </div>

                    {/* Span Waterfall Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Execution Spans Waterfall</h4>
                      <div className="space-y-2">
                        {selectedTrace.spans.map((span, idx) => (
                          <div key={span.spanId} className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[var(--surface-primary)] border border-[var(--border-primary)] text-[var(--text-tertiary)]">
                                  {span.component}
                                </span>
                                <span className="font-bold text-[var(--text-primary)]">{span.operation}</span>
                              </div>
                              <span className="font-mono font-bold text-[var(--text-primary)]">{span.latencyMs} ms</span>
                            </div>

                            {/* Safe metadata tags */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[var(--text-tertiary)]">
                              {span.modelName && <span>Model: {span.modelName} ({span.modelVersion})</span>}
                              {span.promptVersion && <span>Prompt: {span.promptVersion}</span>}
                              {span.totalTokens ? <span>Tokens: {span.totalTokens} (In: {span.inputTokens}, Out: {span.outputTokens})</span> : null}
                              {Object.entries(span.safeAttributes).map(([k, v]) => (
                                <span key={k} className="px-1.5 py-0.5 bg-[var(--surface-primary)] border border-[var(--border-primary)]">
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-xs text-[var(--text-tertiary)]">Select a trace to view span breakdown.</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: LATENCY & COST BREAKDOWN */}
          {activeTab === 'perf_cost' && evalData && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Latency Percentiles (P50 / P95 / P99) */}
                <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Latency Percentiles (ms)</h3>
                    <span className="text-xs font-mono text-[var(--text-tertiary)]">Sample N = {evalData.latency.sampleSize} spans</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="font-mono text-[10px] uppercase text-[var(--text-tertiary)] border-b border-[var(--border-primary)]">
                        <tr>
                          <th className="py-2">Pipeline Component</th>
                          <th className="py-2 text-right">P50 (Median)</th>
                          <th className="py-2 text-right">P95</th>
                          <th className="py-2 text-right">P99</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)] font-mono">
                        <tr><td className="py-2.5 font-sans font-medium">Document Ingestion & OCR</td><td className="py-2.5 text-right">{evalData.latency.docIngestLatency.p50} ms</td><td className="py-2.5 text-right">{evalData.latency.docIngestLatency.p95} ms</td><td className="py-2.5 text-right">{evalData.latency.docIngestLatency.p99} ms</td></tr>
                        <tr><td className="py-2.5 font-sans font-medium">Medical NLP Extraction</td><td className="py-2.5 text-right">{evalData.latency.nlpLatency.p50} ms</td><td className="py-2.5 text-right">{evalData.latency.nlpLatency.p95} ms</td><td className="py-2.5 text-right">{evalData.latency.nlpLatency.p99} ms</td></tr>
                        <tr><td className="py-2.5 font-sans font-medium">Hybrid RAG Retrieval</td><td className="py-2.5 text-right">{evalData.latency.ragLatency.p50} ms</td><td className="py-2.5 text-right">{evalData.latency.ragLatency.p95} ms</td><td className="py-2.5 text-right">{evalData.latency.ragLatency.p99} ms</td></tr>
                        <tr><td className="py-2.5 font-sans font-medium">Gemini LLM Generation</td><td className="py-2.5 text-right">{evalData.latency.llmLatency.p50} ms</td><td className="py-2.5 text-right">{evalData.latency.llmLatency.p95} ms</td><td className="py-2.5 text-right">{evalData.latency.llmLatency.p99} ms</td></tr>
                        <tr><td className="py-2.5 font-sans font-medium">Tabular ML Inference</td><td className="py-2.5 text-right">{evalData.latency.mlLatency.p50} ms</td><td className="py-2.5 text-right">{evalData.latency.mlLatency.p95} ms</td><td className="py-2.5 text-right">{evalData.latency.mlLatency.p99} ms</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Configurable Model Pricing & Cost Calculator */}
                <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Configurable Model Pricing</h3>
                    <span className="text-xs font-mono text-emerald-400">Labeled: Estimated</span>
                  </div>

                  <div className="space-y-3">
                    {evalData.pricing.map(p => (
                      <div key={p.modelId} className="p-3 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)]">{p.modelId}</span>
                          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">Effective: {p.effectiveDate}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[11px] text-[var(--text-secondary)]">
                          <span>Input: ${p.inputCostPerMillion}/1M tokens</span>
                          <span>Output: ${p.outputCostPerMillion}/1M tokens</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: CLINICAL SAFETY & POLICY */}
          {activeTab === 'safety' && evalData && (
            <div className="space-y-6">
              <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                  <div>
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">Clinical Safety & Policy Benchmark Probes</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-newsreader">Automated red-teaming evaluating emergency symptom redirection and non-diagnostic boundaries.</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {evalData.evaluation.safety.overallSafetyStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Emergency Triage Redirection</span>
                    <span className="font-bold text-lg text-emerald-400">{evalData.evaluation.safety.urgentSymptomRedirectionPassRate}%</span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Crushing chest pain / stroke triggers 911 directive.</p>
                  </div>

                  <div className="p-4 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Diagnosis Abstention Gate</span>
                    <span className="font-bold text-lg text-emerald-400">{evalData.evaluation.safety.diagnosisAbstentionPassRate}%</span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Refuses issuing medical certifications.</p>
                  </div>

                  <div className="p-4 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Medication Stewardship</span>
                    <span className="font-bold text-lg text-emerald-400">{evalData.evaluation.safety.medicationAlterationPassRate}%</span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Refuses patient requests to stop Rx doses.</p>
                  </div>

                  <div className="p-4 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">Mandatory Disclaimer Presence</span>
                    <span className="font-bold text-lg text-emerald-400">{evalData.evaluation.safety.disclaimerComplianceRate}%</span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">100% compliance across clinical responses.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: INCIDENTS & ALERTS */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <div className="p-6 bg-[var(--surface-primary)] border border-[var(--border-primary)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                  <div>
                    <h3 className="font-editorial text-xl italic text-[var(--text-primary)]">System Incidents & Postmortem Center</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-newsreader">Root-cause tagged postmortems and preventive action records.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {incidents.map(inc => (
                    <div key={inc.incidentId} className="p-4 border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#A38D7D]">{inc.incidentId}</span>
                          <span className="font-bold text-[var(--text-primary)]">{inc.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {inc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono text-[var(--text-secondary)] pt-1">
                        <div>Component: <strong>{inc.component}</strong></div>
                        <div>Root Cause: <strong>{inc.rootCauseCategory}</strong></div>
                        <div>Created: <strong>{new Date(inc.createdAt).toLocaleDateString()}</strong></div>
                      </div>

                      <div className="pt-2 text-xs space-y-1 text-[var(--text-secondary)] font-newsreader">
                        <p><strong>Impact:</strong> {inc.impactSummary}</p>
                        <p><strong>Root Cause:</strong> {inc.rootCauseAnalysis}</p>
                        <p><strong>Preventive Action:</strong> {inc.preventiveAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
