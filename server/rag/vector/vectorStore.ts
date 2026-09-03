/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Vector Store
 * Performs exact Cosine Similarity matching over scoped document chunks.
 */

import { storageEngine } from '../../db/storageEngine';
import { ChunkRecord } from '../types';

export interface VectorSearchResult {
  chunk: ChunkRecord;
  vectorScore: number; // 0 to 1
}

export class VectorStore {
  /**
   * Searches vector index for most similar chunks
   */
  public static search(
    queryVector: number[],
    userId: string,
    topK = 8,
    docIds?: string[],
    minScore = 0.25
  ): VectorSearchResult[] {
    const embeddings = storageEngine.getEmbeddingsForUser(userId, docIds);
    const results: VectorSearchResult[] = [];

    for (const emb of embeddings) {
      const score = this.cosineSimilarity(queryVector, emb.vector);
      if (score >= minScore) {
        const chunk = storageEngine.getChunkById(emb.chunk_id, userId);
        if (chunk) {
          results.push({ chunk, vectorScore: score });
        }
      }
    }

    return results
      .sort((a, b) => b.vectorScore - a.vectorScore)
      .slice(0, topK);
  }

  /**
   * Computes Cosine Similarity between two vectors
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, (similarity + 1) / 2)); // Normalized to 0..1
  }
}
