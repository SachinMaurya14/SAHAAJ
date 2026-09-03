/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ RAG & Document Intelligence Domain Types (Server-Side)
 */

export type ServerProcessingStatus = 
  | 'UPLOADED'
  | 'VALIDATING'
  | 'PARSING'
  | 'OCR_PROCESSING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'INDEXING'
  | 'READY'
  | 'FAILED';

export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'png' | 'jpg' | 'jpeg';

export interface DocumentRecord {
  document_id: string;
  user_id: string;
  filename: string;
  file_type: SupportedFileType;
  file_size: number;
  uploaded_at: string;
  processed_at?: string;
  processing_status: ServerProcessingStatus;
  source_type: 'lab_report' | 'clinical_note' | 'prescription' | 'radiology_report' | 'discharge_summary' | 'other';
  checksum: string; // SHA-256
  page_count: number;
  processing_error?: string;
  ocr_confidence?: number;
  extracted_observations_count: number;
  chunks_count: number;
  title: string;
  facility?: string;
  report_date?: string;
  ordering_physician?: string;
  raw_text_preview?: string;
  buffer_base64?: string; // Stored securely in memory / local store
  processing_version: {
    parser: string;
    ocr: string;
    chunker: string;
    embedder: string;
  };
}

export interface PageRecord {
  page_id: string;
  document_id: string;
  user_id: string;
  page_number: number;
  text: string;
  detected_sections: string[];
  has_tables: boolean;
  extraction_method: 'NATIVE_TEXT' | 'OCR';
  ocr_confidence?: number;
}

export interface ChunkRecord {
  chunk_id: string;
  document_id: string;
  user_id: string;
  page_number: number;
  section: string;
  chunk_index: number;
  text: string;
  token_count: number;
  is_table_chunk?: boolean;
  table_metadata?: {
    headers: string[];
    rows: string[][];
  };
}

export interface EmbeddingRecord {
  embedding_id: string;
  chunk_id: string;
  document_id: string;
  user_id: string;
  vector: number[];
  dimension: number;
  model_name: string;
  created_at: string;
}

export interface ObservationRecord {
  observation_id: string;
  document_id: string;
  user_id: string;
  name: string;
  canonical_concept: string;
  value: number | string;
  numeric_value?: number;
  unit: string;
  canonical_unit?: string;
  reference_low?: number;
  reference_high?: number;
  reference_range_text: string;
  reference_source: 'PRINTED_ON_DOCUMENT' | 'STANDARD_GUIDELINE';
  flag: 'within_range' | 'low' | 'high' | 'critical' | 'unassessed';
  page_number: number;
  source_chunk_id: string;
  source_snippet: string;
  extraction_confidence: number;
  needs_review: boolean;
  recorded_date?: string;
  user_corrected?: {
    original_value: string;
    corrected_value: string;
    reason?: string;
    corrected_at: string;
    corrected_by: string;
  };
}

export interface CitationRecord {
  citation_id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  section: string;
  chunk_id: string;
  quoted_source_span: string;
  relevance_score: number;
  source_origin: 'FROM_YOUR_RECORDS' | 'GENERAL_HEALTH_INFORMATION';
}

export interface KnowledgeArticle {
  source_id: string;
  title: string;
  publisher: string;
  source_type: 'Clinical Guideline' | 'Government Health Agency' | 'Peer-Reviewed Literature' | 'Medical Society';
  publication_date: string;
  topic: string;
  reference_url?: string;
  version: string;
  summary: string;
  content: string;
}

export interface ScoredChunk {
  chunk: ChunkRecord;
  relevance_score: number;
  vector_score: number;
  lexical_score: number;
  rerank_score: number;
  rank: number;
}

export interface V3DocumentCompareResult {
  document_a: {
    id: string;
    title: string;
    date: string;
  };
  document_b: {
    id: string;
    title: string;
    date: string;
  };
  deltas: Array<{
    canonical_concept: string;
    doc_a_value: number;
    doc_b_value: number;
    unit: string;
    absolute_change: number;
    percentage_change: number | null;
    direction: 'improved' | 'worsened' | 'stable' | 'new';
    clinical_note?: string;
  }>;
  comparison_narrative: string;
  grounding_status: 'GROUNDED' | 'INSUFFICIENT_EVIDENCE';
}
