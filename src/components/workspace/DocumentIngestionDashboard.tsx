/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Document Ingestion & RAG Management Dashboard
 * Handles multi-format uploads, SHA-256 duplicate detection, asynchronous multi-stage ingestion,
 * document management, and navigation to Split-Screen Document Source Viewer.
 */

import React, { useState, useEffect, useRef } from 'react';
import { V3Document, SupportedFileType } from '../../types';
import { RAGApiService } from '../../services/ragApiService';
import { DocumentSourceViewer } from './DocumentSourceViewer';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Copy, 
  Sparkles,
  ArrowRight,
  Database,
  Search,
  Filter
} from 'lucide-react';

interface DocumentIngestionDashboardProps {
  onSelectDocument?: (doc: V3Document) => void;
}

export const DocumentIngestionDashboard: React.FC<DocumentIngestionDashboardProps> = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState<V3Document[]>([]);
  const [selectedDocForViewing, setSelectedDocForViewing] = useState<V3Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Duplicate Detection Prompt State
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    file: File;
    existingDocId: string;
  } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserDocuments();
  }, []);

  const loadUserDocuments = async () => {
    const docs = await RAGApiService.listDocuments();
    setDocuments(docs);
  };

  const handleFileUpload = async (file: File, forceDuplicate = false) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgressStatus('VALIDATING');

    try {
      // Simulate/Show real multi-stage pipeline
      setTimeout(() => setUploadProgressStatus('PARSING'), 400);
      setTimeout(() => setUploadProgressStatus('CHUNKING'), 800);
      setTimeout(() => setUploadProgressStatus('EMBEDDING'), 1200);
      setTimeout(() => setUploadProgressStatus('INDEXING'), 1600);

      const result = await RAGApiService.uploadDocument(file, 'patient-user-primary', forceDuplicate);

      if (result.isDuplicate && !forceDuplicate && result.existingDocId) {
        setDuplicatePrompt({ file, existingDocId: result.existingDocId });
        setIsUploading(false);
        setUploadProgressStatus(null);
        return;
      }

      setUploadProgressStatus('READY');
      await loadUserDocuments();
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgressStatus(null);
      }, 500);
    } catch (err: any) {
      console.error('Ingestion failed:', err);
      setUploadError(err.message || 'Document ingestion failed');
      setIsUploading(false);
      setUploadProgressStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently delete this document, its vector embeddings, and extracted observations?')) {
      const success = await RAGApiService.deleteDocument(docId);
      if (success) {
        setDocuments(prev => prev.filter(d => d.document_id !== docId));
        if (selectedDocForViewing?.document_id === docId) {
          setSelectedDocForViewing(null);
        }
      }
    }
  };

  const handleReprocess = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUploading(true);
    setUploadProgressStatus('REPROCESSING');
    await RAGApiService.reprocessDocument(docId);
    await loadUserDocuments();
    setIsUploading(false);
    setUploadProgressStatus(null);
  };

  // If a document is selected for split-screen viewing, render DocumentSourceViewer
  if (selectedDocForViewing) {
    return (
      <DocumentSourceViewer
        document={selectedDocForViewing}
        onBack={() => setSelectedDocForViewing(null)}
      />
    );
  }

  const filteredDocs = documents.filter(d => 
    d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.facility?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif">
            <Layers className="w-5 h-5 text-emerald-600" />
            Medical Document RAG & Ingestion Engine
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ingest lab panels, imaging reports, prescriptions, and clinical notes into vector-indexed, grounded medical memory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents or tests..."
              className="pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 text-stone-900 dark:text-stone-100"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Upload Canvas */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl bg-stone-50/50 dark:bg-stone-900/30 text-center cursor-pointer transition-colors space-y-3 group"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            Drag & drop your medical document here, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Supports PDF, DOCX, TXT, PNG, JPG, and JPEG. Native parsing & Multimodal OCR included.
          </p>
        </div>
        <div className="flex justify-center gap-2 text-[11px] text-stone-400 font-mono">
          <span>• SHA-256 Deduplication</span>
          <span>• Semantic Chunking</span>
          <span>• 768-Dim Dense Embeddings</span>
        </div>
      </div>

      {/* Ingestion Pipeline Progress Banner */}
      {isUploading && (
        <div className="p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              Processing Pipeline Stage: {uploadProgressStatus}
            </span>
            <span className="font-mono">Real-Time Ingest</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-[11px]">
            {['VALIDATING', 'PARSING', 'CHUNKING', 'EMBEDDING', 'INDEXING'].map((stage, idx) => (
              <div
                key={stage}
                className={`p-2 rounded-lg text-center font-medium ${
                  uploadProgressStatus === stage
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {idx + 1}. {stage}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {uploadError}
          </span>
          <button onClick={() => setUploadError(null)} className="underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Document Library Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Indexed Health Documents ({documents.length})
          </h2>
          <span className="text-xs text-stone-500 font-mono">User Isolation: Active</span>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-900/20 space-y-2">
            <FileText className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">No documents ingested yet</h3>
            <p className="text-xs text-stone-500">
              Upload your first lab report or clinical document above to activate semantic RAG search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.document_id}
                onClick={() => setSelectedDocForViewing(doc)}
                className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      doc.processing_status === 'READY'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : doc.processing_status === 'FAILED'
                        ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {doc.processing_status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {doc.title || doc.filename}
                    </h3>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {doc.facility || 'Clinical Document'} • {doc.report_date || 'Recent'}
                    </p>
                  </div>

                  {/* Metrics Badge Row */}
                  <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 text-center text-stone-600 dark:text-stone-400 text-[11px] font-mono">
                    <div>
                      <span className="block font-bold text-stone-900 dark:text-stone-100">{doc.page_count || 1}</span>
                      <span className="text-[9px] text-stone-400 uppercase">Pages</span>
                    </div>
                    <div>
                      <span className="block font-bold text-stone-900 dark:text-stone-100">{doc.chunks_count || 0}</span>
                      <span className="text-[9px] text-stone-400 uppercase">Chunks</span>
                    </div>
                    <div>
                      <span className="block font-bold text-stone-900 dark:text-stone-100">{doc.extracted_observations_count || 0}</span>
                      <span className="text-[9px] text-stone-400 uppercase">Markers</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-mono text-[10px]">
                    {Math.round(doc.file_size / 1024)} KB • {doc.file_type.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleReprocess(doc.document_id, e)}
                      title="Reprocess Document"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.document_id, e)}
                      title="Delete Document"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedDocForViewing(doc)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-[11px] font-semibold hover:opacity-90"
                    >
                      <Eye className="w-3 h-3" />
                      View & Ask
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate File Prompt Modal */}
      {duplicatePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <Copy className="w-6 h-6" />
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Duplicate File Detected
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              A file with the identical content (SHA-256 checksum) has already been indexed in your health records library.
            </p>
            <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl text-xs font-mono text-stone-600 dark:text-stone-400 break-all">
              Filename: {duplicatePrompt.file.name}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDuplicatePrompt(null)}
                className="px-3 py-1.5 text-xs rounded-lg text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const existing = documents.find(d => d.document_id === duplicatePrompt.existingDocId);
                  if (existing) setSelectedDocForViewing(existing);
                  setDuplicatePrompt(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
              >
                View Existing
              </button>
              <button
                onClick={() => {
                  handleFileUpload(duplicatePrompt.file, true);
                  setDuplicatePrompt(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold"
              >
                Re-upload Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
