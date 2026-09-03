/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Grounding & Retrieval Trace Modal
 * Transparently reveals how an AI response was grounded, candidates retrieved,
 * hybrid dense/sparse weights, fact reconciliation, and latency.
 */

import React from 'react';
import { V3RAGResponse } from '../../types';
import { X, ShieldCheck, Cpu, Database, Search, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnswerTraceModalProps {
  response: V3RAGResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnswerTraceModal: React.FC<AnswerTraceModalProps> = ({ response, isOpen, onClose }) => {
  if (!isOpen || !response) return null;

  const trace = response.trace_metadata;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Grounding & Retrieval Trace
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Query ID: {response.query_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status & Latency Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 block">Grounding Status</span>
              <span className={`inline-flex items-center gap-1 font-semibold text-xs mt-1 ${
                response.grounding_status === 'GROUNDED' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {response.grounding_status === 'GROUNDED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {response.grounding_status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 block">Retrieval Latency</span>
              <span className="font-mono font-semibold text-xs text-stone-900 dark:text-stone-100 mt-1 block">
                {trace?.retrieval_latency_ms ?? 0} ms
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 block">Gemini Latency</span>
              <span className="font-mono font-semibold text-xs text-stone-900 dark:text-stone-100 mt-1 block">
                {trace?.gemini_latency_ms ?? 0} ms
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 block">Total E2E Latency</span>
              <span className="font-mono font-semibold text-xs text-stone-900 dark:text-stone-100 mt-1 block">
                {trace?.total_latency_ms ?? 0} ms
              </span>
            </div>
          </div>

          {/* Pipeline Trace Diagram */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Execution Architecture Pipeline
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <Search className="w-4 h-4 text-sky-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-stone-900 dark:text-stone-100">1. Hybrid Retrieval Scope</span>
                  <p className="text-stone-500 text-[11px]">{trace?.query_scope || 'Hybrid Document Retrieval'} ({trace?.total_candidates_retrieved ?? 0} candidates scored)</p>
                </div>
                <span className="font-mono text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded">
                  Dense: {Math.round((trace?.hybrid_weights?.dense ?? 0.6) * 100)}% | Sparse: {Math.round((trace?.hybrid_weights?.sparse ?? 0.4) * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <Database className="w-4 h-4 text-purple-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-stone-900 dark:text-stone-100">2. RRF Reranking & Evidence Selection</span>
                  <p className="text-stone-500 text-[11px]">{trace?.selected_evidence_count ?? 0} top evidence chunks routed into grounding context</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-stone-900 dark:text-stone-100">3. Grounded Synthesis & Citation Validation</span>
                  <p className="text-stone-500 text-[11px]">{(response.sources?.length || 0)} verbatim source spans verified against source records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reconciled Numeric Facts */}
          {response.reconciled_numeric_facts && response.reconciled_numeric_facts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Deterministic Numeric Fact Reconciliation
              </h4>
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500">
                    <tr>
                      <th className="p-2.5 font-medium">Extracted Clinical Fact</th>
                      <th className="p-2.5 font-medium">Source Document Value</th>
                      <th className="p-2.5 font-medium text-right">Reconciled Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-stone-900">
                    {response.reconciled_numeric_facts.map((fact, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-stone-900 dark:text-stone-100">{fact.fact}</td>
                        <td className="p-2.5 font-mono text-stone-600 dark:text-stone-300">{fact.source_value}</td>
                        <td className="p-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stated Limitations */}
          {response.limitations && response.limitations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Stated System Limitations
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 dark:text-stone-400">
                {response.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-200/80 dark:bg-stone-800 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
