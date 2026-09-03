/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Document Source & Grounded RAG Viewer
 * Split-view interface: Original Document Pages on Left, Grounded AI Explanation on Right,
 * with click-to-cite navigation, "Ask about this report", and "What's missing?" analysis.
 */

import React, { useState, useEffect } from 'react';
import { 
  V3Document, 
  V3Page, 
  V3Chunk, 
  V3Observation, 
  V3Citation, 
  V3RAGResponse 
} from '../../types';
import { RAGApiService } from '../../services/ragApiService';
import { EvidencePanel } from './EvidencePanel';
import { AnswerTraceModal } from './AnswerTraceModal';
import { 
  FileText, 
  BookOpen, 
  Search, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Edit2,
  Info,
  Layers
} from 'lucide-react';

interface DocumentSourceViewerProps {
  document: V3Document;
  onBack?: () => void;
}

export const DocumentSourceViewer: React.FC<DocumentSourceViewerProps> = ({ document: initialDoc, onBack }) => {
  const [doc, setDoc] = useState<V3Document>(initialDoc);
  const [pages, setPages] = useState<V3Page[]>([]);
  const [observations, setObservations] = useState<V3Observation[]>([]);
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [activeCitation, setActiveCitation] = useState<V3Citation | null>(null);
  const [highlightedSpan, setHighlightedSpan] = useState<string | null>(null);
  
  // Right Panel State
  const [viewMode, setViewMode] = useState<'patient' | 'clinician'>('patient');
  const [activeTab, setActiveTab] = useState<'overview' | 'ask' | 'observations' | 'missing'>('overview');
  
  // Q&A State
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [currentRAGResponse, setCurrentRAGResponse] = useState<V3RAGResponse | null>(null);
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  
  // Missing Data Analysis
  const [missingAnalysis, setMissingAnalysis] = useState<{
    missingReferenceRanges: string[];
    unmeasuredRelatedMarkers: string[];
    documentationGaps: string[];
  } | null>(null);

  // Observation Correction
  const [editingObs, setEditingObs] = useState<V3Observation | null>(null);
  const [correctionValue, setCorrectionValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

  // Initial Load
  useEffect(() => {
    loadDocumentDetails();
  }, [doc.document_id]);

  const loadDocumentDetails = async () => {
    const [fetchedPages, fetchedObs, missing] = await Promise.all([
      RAGApiService.getPages(doc.document_id),
      RAGApiService.getObservations(doc.document_id),
      RAGApiService.analyzeMissing(doc.document_id)
    ]);
    setPages(fetchedPages);
    setObservations(fetchedObs);
    setMissingAnalysis(missing);

    // Initial grounded overview query
    runInitialGroundedAnalysis();
  };

  const runInitialGroundedAnalysis = async () => {
    setIsQuerying(true);
    try {
      const response = await RAGApiService.queryDocument(
        doc.document_id,
        "Provide a comprehensive grounded summary of all key laboratory findings, abnormal markers, and clinical observations from this document."
      );
      setCurrentRAGResponse(response);
    } catch (e) {
      console.warn('Initial grounded query error:', e);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim() || isQuerying) return;

    setIsQuerying(true);
    try {
      const response = await RAGApiService.queryDocument(doc.document_id, queryInput);
      setCurrentRAGResponse(response);
      setActiveTab('ask');
    } catch (err: any) {
      alert(`Query failed: ${err.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleSelectCitation = (citation: V3Citation) => {
    setActiveCitation(citation);
    setActivePageNumber(citation.page_number);
    setHighlightedSpan(citation.quoted_source_span);
    
    // Auto-scroll left panel to highlighted page
    const pageEl = document.getElementById(`doc-page-${citation.page_number}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveCorrection = async () => {
    if (!editingObs || !correctionValue.trim()) return;
    const updated = await RAGApiService.updateObservation(
      doc.document_id,
      editingObs.observation_id,
      correctionValue,
      correctionReason
    );
    if (updated) {
      setObservations(prev => prev.map(o => o.observation_id === updated.observation_id ? updated : o));
      setEditingObs(null);
      setCorrectionValue('');
      setCorrectionReason('');
    }
  };

  const currentPage = pages.find(p => p.page_number === activePageNumber) || pages[0];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-stone-50 dark:bg-stone-950 overflow-hidden">
      {/* Top Breadcrumb & Metadata Bar */}
      <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate max-w-md">
                {doc.title || doc.filename}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                {doc.processing_status}
              </span>
              {doc.ocr_confidence && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  OCR: {doc.ocr_confidence}%
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {doc.facility || 'Clinical Center'} • {doc.report_date || 'Recent'} • {doc.page_count || pages.length} Page(s) • {observations.length} Extracted Markers
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTraceModalOpen(true)}
            disabled={!currentRAGResponse}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Grounding Trace
          </button>
          <button
            onClick={() => runInitialGroundedAnalysis()}
            disabled={isQuerying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>
      </div>

      {/* Main Split-View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT PANEL: Document Source & Pages (5 cols on lg) */}
        <div className="lg:col-span-6 border-r border-stone-200 dark:border-stone-800 flex flex-col bg-stone-100/60 dark:bg-stone-950 overflow-hidden">
          {/* Left Toolbar */}
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-stone-500" />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Document Source View</span>
            </div>
            
            {/* Pagination Controls */}
            {pages.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={activePageNumber <= 1}
                  onClick={() => setActivePageNumber(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
                  Page {activePageNumber} of {pages.length}
                </span>
                <button
                  disabled={activePageNumber >= pages.length}
                  onClick={() => setActivePageNumber(p => Math.min(pages.length, p + 1))}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Page Document Canvas */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentPage ? (
              <div
                id={`doc-page-${currentPage.page_number}`}
                className="max-w-2xl mx-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 shadow-sm font-mono text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap select-text"
              >
                {/* Document Header Representation */}
                <div className="border-b border-dashed border-stone-200 dark:border-stone-800 pb-4 mb-4 font-sans text-xs text-stone-500">
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{doc.facility || 'Clinical Diagnostic Report'}</span>
                    <span>Date: {doc.report_date || 'Recent'}</span>
                  </div>
                  <div>Physician: {doc.ordering_physician || 'Attending Staff'} • Method: {currentPage.extraction_method}</div>
                </div>

                {/* Highlighted text rendering */}
                {highlightedSpan && currentPage.text.toLowerCase().includes(highlightedSpan.slice(0, 20).toLowerCase()) ? (
                  <div>
                    {currentPage.text.split(highlightedSpan).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <mark className="bg-amber-200 dark:bg-amber-900/60 text-stone-900 dark:text-amber-100 px-1 py-0.5 rounded font-bold border border-amber-300 dark:border-amber-700 animate-pulse">
                            {highlightedSpan}
                          </mark>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  currentPage.text
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-stone-500 text-xs">
                No text extracted for this document page.
              </div>
            )}
          </div>

          {/* Active Highlight Banner */}
          {activeCitation && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border-t border-amber-200 dark:border-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-amber-900 dark:text-amber-200 truncate">
                  Active Citation Span (Page {activeCitation.page_number}, {activeCitation.section})
                </span>
              </div>
              <button
                onClick={() => { setActiveCitation(null); setHighlightedSpan(null); }}
                className="text-[11px] text-amber-700 dark:text-amber-300 underline font-medium"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Grounded Intelligence & Q&A (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col bg-white dark:bg-stone-900 overflow-hidden">
          {/* Right Navigation Tabs */}
          <div className="px-5 pt-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Grounded Overview
              </button>
              <button
                onClick={() => setActiveTab('ask')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'ask'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Ask About Report
              </button>
              <button
                onClick={() => setActiveTab('observations')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'observations'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Extracted Biomarkers ({observations.length})
              </button>
              <button
                onClick={() => setActiveTab('missing')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'missing'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                What's Missing?
              </button>
            </div>

            {/* Audience View Mode Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setViewMode('patient')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'patient'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Patient Friendly
              </button>
              <button
                onClick={() => setViewMode('clinician')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'clinician'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Clinician Detail
              </button>
            </div>
          </div>

          {/* Right Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. OVERVIEW & ASK TAB */}
            {(activeTab === 'overview' || activeTab === 'ask') && (
              <div className="space-y-5">
                {/* Search / Ask Box */}
                <form onSubmit={handleAskQuestion} className="relative">
                  <input
                    type="text"
                    value={queryInput}
                    onChange={e => setQueryInput(e.target.value)}
                    placeholder="Ask anything about this medical report (e.g. What do my liver markers mean?)..."
                    className="w-full pl-4 pr-10 py-2.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  />
                  <button
                    type="submit"
                    disabled={isQuerying || !queryInput.trim()}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 disabled:opacity-30"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Question Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-stone-400 self-center mr-1">Suggested:</span>
                  {[
                    "Are any values outside normal range?",
                    "Explain my cholesterol and triglycerides",
                    "What questions should I ask my doctor?"
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setQueryInput(q); }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Grounded Response Card */}
                {isQuerying ? (
                  <div className="p-8 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto" />
                    <p className="text-xs text-stone-500 font-serif">
                      Performing hybrid semantic retrieval and grounding verification...
                    </p>
                  </div>
                ) : currentRAGResponse ? (
                  <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 space-y-4">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {viewMode === 'patient' ? 'Patient Explanation' : 'Clinical Grounded Synthesis'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                        {currentRAGResponse.grounding_status}
                      </span>
                    </div>

                    {/* Main Narrative Text */}
                    <div className="text-xs text-stone-700 dark:text-stone-200 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
                      {viewMode === 'patient' 
                        ? (currentRAGResponse.patient_friendly_summary || currentRAGResponse.answer)
                        : (currentRAGResponse.technical_details || currentRAGResponse.answer)}
                    </div>

                    {/* Interactive Citations Section */}
                    {currentRAGResponse.sources && currentRAGResponse.sources.length > 0 && (
                      <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
                        <EvidencePanel
                          citations={currentRAGResponse.sources}
                          activeCitationId={activeCitation?.citation_id}
                          onSelectCitation={handleSelectCitation}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* 2. EXTRACTED OBSERVATIONS TAB */}
            {activeTab === 'observations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-500">
                    Biomarkers parsed deterministically from laboratory tables. Click any test to inspect physiological definition.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="p-3 font-medium">Biomarker</th>
                        <th className="p-3 font-medium">Value</th>
                        <th className="p-3 font-medium">Reference Range</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-stone-900">
                      {observations.map(obs => {
                        const isAbnormal = obs.flag !== 'within_range' && obs.flag !== 'unassessed';
                        return (
                          <tr key={obs.observation_id} className="hover:bg-stone-50 dark:hover:bg-stone-950/60">
                            <td className="p-3">
                              <div className="font-semibold text-stone-900 dark:text-stone-100">{obs.canonical_concept}</div>
                              <span className="text-[10px] text-stone-400 font-mono">{obs.name} (p. {obs.page_number})</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                              {obs.value} <span className="text-[10px] font-normal text-stone-500">{obs.unit}</span>
                            </td>
                            <td className="p-3 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                              {obs.reference_range_text}
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                                obs.flag === 'within_range'
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : obs.flag === 'critical'
                                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              }`}>
                                {obs.flag}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingObs(obs);
                                  setCorrectionValue(String(obs.value));
                                }}
                                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                title="Edit extracted value"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Edit Correction Modal / Card */}
                {editingObs && (
                  <div className="p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        Correct Value for {editingObs.canonical_concept}
                      </span>
                      <button onClick={() => setEditingObs(null)} className="text-xs text-stone-400 hover:text-stone-600">
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={correctionValue}
                        onChange={e => setCorrectionValue(e.target.value)}
                        placeholder="Corrected numerical value..."
                        className="p-2 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                      <input
                        type="text"
                        value={correctionReason}
                        onChange={e => setCorrectionReason(e.target.value)}
                        placeholder="Reason (e.g. OCR misread)..."
                        className="p-2 text-xs rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSaveCorrection}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Save Correction
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. WHAT'S MISSING TAB */}
            {activeTab === 'missing' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Info className="w-4 h-4 text-amber-600" />
                    Document Completeness & Observability Gaps
                  </div>
                  SAAHAJ analyzes structural omissions and unmeasured physiological panels without hallucinating missing values.
                </div>

                {missingAnalysis && (
                  <div className="space-y-4 text-xs">
                    {/* Unmeasured Related Tests */}
                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Unmeasured Related Clinical Markers
                      </h4>
                      {(missingAnalysis.unmeasuredRelatedMarkers?.length || 0) > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300">
                          {missingAnalysis.unmeasuredRelatedMarkers.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-stone-500 italic">Panel contains complete primary marker set.</p>
                      )}
                    </div>

                    {/* Reference Range Omissions */}
                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-500" />
                        Missing Printed Reference Ranges
                      </h4>
                      {(missingAnalysis.missingReferenceRanges?.length || 0) > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300">
                          {missingAnalysis.missingReferenceRanges.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-stone-500 italic">All extracted biomarkers include printed reference intervals.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Trace Modal */}
      <AnswerTraceModal
        isOpen={traceModalOpen}
        response={currentRAGResponse}
        onClose={() => setTraceModalOpen(false)}
      />
    </div>
  );
};
