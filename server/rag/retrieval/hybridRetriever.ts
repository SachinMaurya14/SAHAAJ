/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Hybrid Retriever
 * Combines Dense Semantic Vector Search with Sparse BM25 / Lexical Keyword Search
 * using Reciprocal Rank Fusion (RRF).
 */

import { VectorStore } from '../vector/vectorStore';
import { EmbeddingService } from '../vector/embeddingService';
import { storageEngine } from '../../db/storageEngine';
import { ChunkRecord, ScoredChunk } from '../types';
import { GoogleGenAI } from '@google/genai';

export interface RetrievalOptions {
  topK?: number;
  docIds?: string[];
  denseWeight?: number;
  sparseWeight?: number;
  rrfConstant?: number;
}

export class HybridRetriever {
  /**
   * Performs hybrid retrieval over user's scoped chunks
   */
  public static async retrieve(
    query: string,
    userId: string,
    aiClient: GoogleGenAI | null,
    options: RetrievalOptions = {}
  ): Promise<{ scoredChunks: ScoredChunk[]; totalCandidates: number; latencyMs: number }> {
    const startTime = Date.now();
    const topK = options.topK || 6;
    const denseWeight = options.denseWeight ?? 0.65;
    const sparseWeight = options.sparseWeight ?? 0.35;
    const k = options.rrfConstant ?? 60;

    // 1. Dense Semantic Retrieval
    const queryVector = await EmbeddingService.generateEmbedding(query, aiClient);
    const denseResults = VectorStore.search(queryVector, userId, 20, options.docIds);

    // 2. Sparse Lexical Search (BM25 / Term Overlap)
    const userChunks = storageEngine.getChunksForUser(userId, options.docIds);
    const sparseResults = this.lexicalSearch(query, userChunks, 20);

    // 3. Reciprocal Rank Fusion (RRF)
    const candidateMap = new Map<string, {
      chunk: ChunkRecord;
      denseScore: number;
      sparseScore: number;
      denseRank: number;
      sparseRank: number;
    }>();

    // Index dense ranks
    denseResults.forEach((item, idx) => {
      candidateMap.set(item.chunk.chunk_id, {
        chunk: item.chunk,
        denseScore: item.vectorScore,
        sparseScore: 0,
        denseRank: idx + 1,
        sparseRank: 999
      });
    });

    // Index sparse ranks
    sparseResults.forEach((item, idx) => {
      const existing = candidateMap.get(item.chunk.chunk_id);
      if (existing) {
        existing.sparseScore = item.lexicalScore;
        existing.sparseRank = idx + 1;
      } else {
        candidateMap.set(item.chunk.chunk_id, {
          chunk: item.chunk,
          denseScore: 0,
          sparseScore: item.lexicalScore,
          denseRank: 999,
          sparseRank: idx + 1
        });
      }
    });

    // Compute RRF combined score
    const scoredChunks: ScoredChunk[] = [];
    for (const item of candidateMap.values()) {
      const denseRrf = denseWeight / (k + item.denseRank);
      const sparseRrf = sparseWeight / (k + item.sparseRank);
      const rrfScore = denseRrf + sparseRrf;

      // Normalized relevance score (0..1)
      const combinedRelevance = Math.min(1.0, (item.denseScore * 0.6) + (item.sparseScore * 0.4));

      scoredChunks.push({
        chunk: item.chunk,
        relevance_score: Math.round(combinedRelevance * 100) / 100,
        vector_score: Math.round(item.denseScore * 100) / 100,
        lexical_score: Math.round(item.sparseScore * 100) / 100,
        rerank_score: Math.round(rrfScore * 1000) / 1000,
        rank: 0
      });
    }

    // Sort by RRF score descending
    scoredChunks.sort((a, b) => b.rerank_score - a.rerank_score);
    scoredChunks.forEach((item, idx) => { item.rank = idx + 1; });

    const totalCandidates = scoredChunks.length;
    const finalSelection = scoredChunks.slice(0, topK);
    const latencyMs = Date.now() - startTime;

    return {
      scoredChunks: finalSelection,
      totalCandidates,
      latencyMs
    };
  }

  /**
   * Fast lexical term-frequency and BM25 approximation
   */
  private static lexicalSearch(
    query: string,
    chunks: ChunkRecord[],
    topK = 20
  ): Array<{ chunk: ChunkRecord; lexicalScore: number }> {
    const queryTerms = query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    if (queryTerms.length === 0) return [];

    const scored: Array<{ chunk: ChunkRecord; lexicalScore: number }> = [];

    for (const chunk of chunks) {
      const lower = chunk.text.toLowerCase();
      let matchCount = 0;
      let exactPhraseBonus = 0;

      if (lower.includes(query.toLowerCase().trim())) {
        exactPhraseBonus = 0.5;
      }

      for (const term of queryTerms) {
        if (lower.includes(term)) {
          matchCount++;
        }
      }

      if (matchCount > 0 || exactPhraseBonus > 0) {
        const termRatio = matchCount / queryTerms.length;
        const lexicalScore = Math.min(1.0, (termRatio * 0.7) + exactPhraseBonus);
        scored.push({ chunk, lexicalScore });
      }
    }

    return scored.sort((a, b) => b.lexicalScore - a.lexicalScore).slice(0, topK);
  }
}
