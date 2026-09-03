/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Semantic Document Chunker
 * Chunks documents respecting paragraph, section, table, and page boundaries.
 */

import { PageRecord, ChunkRecord } from '../types';

export class ChunkerService {
  /**
   * Chunks an array of pages for a document
   */
  public static chunkPages(
    pages: PageRecord[],
    documentId: string,
    userId: string,
    targetChunkSize = 650,
    overlapSize = 90
  ): ChunkRecord[] {
    const chunks: ChunkRecord[] = [];
    let globalChunkIndex = 0;

    for (const page of pages) {
      const pageText = page.text;
      if (!pageText || pageText.trim().length === 0) continue;

      // 1. Separate tables if detected
      if (page.has_tables) {
        const tableChunks = this.extractTableChunks(page, documentId, userId, globalChunkIndex);
        chunks.push(...tableChunks);
        globalChunkIndex += tableChunks.length;
        continue;
      }

      // 2. Section/Paragraph-aware chunking
      const paragraphs = pageText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      let currentSection = page.detected_sections[0] || 'General Findings';
      let currentBuffer = '';

      for (const paragraph of paragraphs) {
        // Detect if paragraph is a section header
        const trimmed = paragraph.trim();
        const isHeader = trimmed.length < 50 && (
          page.detected_sections.some(s => trimmed.toLowerCase().includes(s.toLowerCase())) ||
          /^[A-Z0-9\s:_-]{3,40}$/.test(trimmed)
        );

        if (isHeader) {
          currentSection = trimmed;
        }

        if (currentBuffer.length + paragraph.length > targetChunkSize && currentBuffer.length > 0) {
          // Flush current chunk
          chunks.push({
            chunk_id: `chunk-${documentId}-${globalChunkIndex + 1}`,
            document_id: documentId,
            user_id: userId,
            page_number: page.page_number,
            section: currentSection,
            chunk_index: globalChunkIndex + 1,
            text: currentBuffer.trim(),
            token_count: Math.ceil(currentBuffer.length / 4)
          });
          globalChunkIndex++;

          // Keep overlap from end of previous buffer
          const overlap = currentBuffer.slice(-overlapSize);
          currentBuffer = overlap + '\n' + paragraph;
        } else {
          currentBuffer += (currentBuffer ? '\n\n' : '') + paragraph;
        }
      }

      // Flush remaining buffer for page
      if (currentBuffer.trim().length > 0) {
        chunks.push({
          chunk_id: `chunk-${documentId}-${globalChunkIndex + 1}`,
          document_id: documentId,
          user_id: userId,
          page_number: page.page_number,
          section: currentSection,
          chunk_index: globalChunkIndex + 1,
          text: currentBuffer.trim(),
          token_count: Math.ceil(currentBuffer.length / 4)
        });
        globalChunkIndex++;
      }
    }

    return chunks;
  }

  /**
   * Extracts structured table rows as distinct semantic chunks
   */
  private static extractTableChunks(
    page: PageRecord,
    documentId: string,
    userId: string,
    startIndex: number
  ): ChunkRecord[] {
    const lines = page.text.split('\n').filter(l => l.trim().length > 0);
    const tableChunks: ChunkRecord[] = [];
    let currentRows: string[] = [];
    let chunkIdx = startIndex;

    for (const line of lines) {
      currentRows.push(line);
      if (currentRows.length >= 6) {
        const text = currentRows.join('\n');
        tableChunks.push({
          chunk_id: `chunk-${documentId}-${chunkIdx + 1}`,
          document_id: documentId,
          user_id: userId,
          page_number: page.page_number,
          section: 'Structured Laboratory Results',
          chunk_index: chunkIdx + 1,
          text,
          token_count: Math.ceil(text.length / 4),
          is_table_chunk: true
        });
        chunkIdx++;
        currentRows = [];
      }
    }

    if (currentRows.length > 0) {
      const text = currentRows.join('\n');
      tableChunks.push({
        chunk_id: `chunk-${documentId}-${chunkIdx + 1}`,
        document_id: documentId,
        user_id: userId,
        page_number: page.page_number,
        section: 'Structured Laboratory Results',
        chunk_index: chunkIdx + 1,
        text,
        token_count: Math.ceil(text.length / 4),
        is_table_chunk: true
      });
    }

    return tableChunks;
  }
}
