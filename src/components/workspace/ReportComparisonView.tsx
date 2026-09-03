/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Grounded Multi-Document Biomarker Comparison & Longitudinal Delta Folio
 * Compares two indexed lab panels or longitudinal records with exact numerical deltas,
 * directional classifications (improved, worsened, stable), and grounded narrative synthesis.
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Sparkles,
  Layers,
  FileText,
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { V3Document, V3DocumentCompareResult } from '../../types';
import { RAGApiService } from '../../services/ragApiService';
import { EvidencePanel } from './EvidencePanel';
import { longitudinalComparisons } from '../../data/mockHealthData';

interface ReportComparisonViewProps {
  setCurrentView: (view: string) => void;
}

export const ReportComparisonView: React.FC<ReportComparisonViewProps> = ({ setCurrentView }) => {
  const [documents, setDocuments] = useState<V3Document[]>([]);
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [compareResult, setCompareResult] = useState<V3DocumentCompareResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const docs = await RAGApiService.listDocuments();
    setDocuments(docs);
    if (docs.length >= 2) {
      setDocAId(docs[0].document_id);
      setDocBId(docs[1].document_id);
    } else if (docs.length === 1) {
      setDocAId(docs[0].document_id);
    }
  };

  const handleRunComparison = async () => {
    if (!docAId || !docBId) return;
    setIsComparing(true);
    try {
      const res = await RAGApiService.compareDocuments(docAId, docBId);
      setCompareResult(res);
    } catch (e) {
      console.error('Comparison error:', e);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Grounding Engine V3
              </span>
              <span className="text-xs text-stone-400 font-mono">Biomarker Trajectory</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Longitudinal Delta & Multi-Report Comparison
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Compare paired diagnostic panels to measure quantitative biomarker velocity, detect glycemic drifts, and track therapeutic response.
            </p>
          </div>
        </div>

        {/* Document Selection Strip */}
        {documents.length >= 2 ? (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <label className="text-[11px] font-medium text-stone-500 block mb-1">Baseline Document A</label>
              <select
                value={docAId}
                onChange={e => setDocAId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
              >
                {documents.map(d => (
                  <option key={d.document_id} value={d.document_id}>{d.title || d.filename} ({d.report_date})</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 text-center font-bold text-stone-400 text-xs">VS</div>

            <div className="md:col-span-4">
              <label className="text-[11px] font-medium text-stone-500 block mb-1">Comparison Document B</label>
              <select
                value={docBId}
                onChange={e => setDocBId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
              >
                {documents.map(d => (
                  <option key={d.document_id} value={d.document_id}>{d.title || d.filename} ({d.report_date})</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 md:pt-5">
              <button
                onClick={handleRunComparison}
                disabled={isComparing || docAId === docBId}
                className="w-full p-2 text-xs font-semibold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isComparing ? 'animate-spin' : ''}`} />
                Compare Panels
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Dynamic Comparison Results */}
      {compareResult ? (
        <div className="space-y-6">
          {/* Grounded Narrative Synthesis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Grounded Longitudinal Synthesis
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                {compareResult.grounding_status}
              </span>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
              {(compareResult as any).comparison_narrative || compareResult.rag_explanation}
            </p>
          </div>

          {/* Biomarker Delta Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Quantitative Biomarker Trajectory ({((compareResult as any).deltas || compareResult.numeric_deltas || []).length} Concepts Tracked)
            </h3>

            <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3 font-medium">Biomarker Concept</th>
                    <th className="p-3 font-medium">{compareResult.document_a.title || 'Doc A'}</th>
                    <th className="p-3 font-medium">{compareResult.document_b.title || 'Doc B'}</th>
                    <th className="p-3 font-medium">Absolute & % Delta</th>
                    <th className="p-3 font-medium text-right">Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {((compareResult as any).deltas || compareResult.numeric_deltas || []).map((delta: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-stone-950/50">
                      <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">
                        {delta.canonical_concept}
                      </td>
                      <td className="p-3 font-mono">
                        {delta.doc_a_value} <span className="text-stone-400 text-[10px]">{delta.unit}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                        {delta.doc_b_value} <span className="text-stone-400 text-[10px]">{delta.unit}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className={delta.absolute_change > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                          {delta.absolute_change > 0 ? `+${delta.absolute_change}` : delta.absolute_change}
                          {delta.percentage_change !== null && ` (${delta.percentage_change > 0 ? '+' : ''}${delta.percentage_change}%)`}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          delta.direction === 'improved'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : delta.direction === 'worsened'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}>
                          {delta.direction === 'improved' && <TrendingDown className="w-3 h-3" />}
                          {delta.direction === 'worsened' && <TrendingUp className="w-3 h-3" />}
                          {delta.direction === 'stable' && <Minus className="w-3 h-3" />}
                          {delta.direction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Default Mock/Historical View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {longitudinalComparisons.map(comp => (
              <div
                key={comp.markerName}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{comp.markerName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    comp.status === 'improved'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : comp.status === 'worsened'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <div>
                    <span className="text-stone-400 block text-[10px]">{comp.baselineDate}</span>
                    <span className="text-stone-600 dark:text-stone-400">{comp.baselineValue} {comp.unit}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                  <div>
                    <span className="text-stone-400 block text-[10px]">{comp.currentDate}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{comp.currentValue} {comp.unit}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 italic pt-1 border-t border-stone-100 dark:border-stone-800">
                  {comp.clinicalSignificance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
