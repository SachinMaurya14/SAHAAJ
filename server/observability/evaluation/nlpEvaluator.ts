/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Medical NLP Evaluation Framework (V9)
 * Evaluates Entity Extraction, Negation, Assertion, Temporality, and Concept Normalization
 * against labeled clinical benchmark sentences.
 */

import crypto from 'crypto';
import { NLPEvalResult } from '../types';
import { NLP_GOLD_BENCHMARK_SAMPLES, GOLD_DATASET_METADATA } from './goldDatasets';
import { MedicalNLPService } from '../../rag/nlp/medicalNLPService';

export class NLPEvaluator {
  /**
   * Run Medical NLP Benchmark
   */
  public static async runBenchmark(): Promise<NLPEvalResult> {
    const runId = `nlp-eval-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const samples = NLP_GOLD_BENCHMARK_SAMPLES;

    let entityTp = 0;
    let entityFp = 0;
    let entityFn = 0;

    let negTp = 0;
    let negFp = 0;
    let negFn = 0;

    let assertionMatches = 0;
    let temporalityMatches = 0;
    let normalizationMatches = 0;
    let totalExpectedEntities = 0;
    let regressionPassed = 0;

    for (const sample of samples) {
      let isCasePass = true;
      const nlpResult = await MedicalNLPService.extractFromText(
        sample.sentence,
        'doc-bench-gold',
        'eval-user',
        1
      );

      const extractedEntities = nlpResult.entities;
      totalExpectedEntities += sample.expectedEntities.length;

      // 1. Entity Extraction Matching
      for (const expEnt of sample.expectedEntities) {
        const found = extractedEntities.find(ee => 
          ee.text.toLowerCase().includes(expEnt.text.toLowerCase()) || 
          expEnt.text.toLowerCase().includes(ee.text.toLowerCase())
        );

        if (found) {
          entityTp++;
          // 2. Concept Normalization Check
          if (found.canonical_name && (
            found.canonical_name.toLowerCase().includes(expEnt.canonicalConcept.toLowerCase()) ||
            expEnt.canonicalConcept.toLowerCase().includes(found.canonical_name.toLowerCase())
          )) {
            normalizationMatches++;
          }
        } else {
          entityFn++;
          isCasePass = false;
        }
      }

      // Check for spurious entities
      const spurious = extractedEntities.filter(ee => 
        !sample.expectedEntities.some(exp => 
          exp.text.toLowerCase().includes(ee.text.toLowerCase()) ||
          ee.text.toLowerCase().includes(exp.text.toLowerCase())
        )
      );
      entityFp += spurious.length;

      // 3. Negation Check
      const hasNegatedEntity = extractedEntities.some(e => e.assertion === 'ABSENT');
      const expectedNeg = sample.expectedNegation === 'NEGATED';

      if (hasNegatedEntity === expectedNeg) {
        negTp++;
      } else if (hasNegatedEntity && !expectedNeg) {
        negFp++;
        isCasePass = false;
      } else {
        negFn++;
        isCasePass = false;
      }

      // 4. Assertion & Temporality Checks
      for (const ent of extractedEntities) {
        if (ent.assertion === sample.expectedAssertion) {
          assertionMatches++;
        }
        if (ent.temporality.toUpperCase() === sample.expectedTemporality) {
          temporalityMatches++;
        }
      }

      if (isCasePass) regressionPassed++;
    }

    const calcF1 = (tp: number, fp: number, fn: number) => {
      const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1.0;
      const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1.0;
      const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 1.0;
      return {
        precision: Number(precision.toFixed(3)),
        recall: Number(recall.toFixed(3)),
        f1Score: Number(f1.toFixed(3))
      };
    };

    const entityMetrics = calcF1(entityTp, entityFp, entityFn);
    const negMetrics = calcF1(negTp, negFp, negFn);

    const normAccuracy = totalExpectedEntities > 0 ? Number((normalizationMatches / totalExpectedEntities).toFixed(3)) : 1.0;
    const assertPrecision = totalExpectedEntities > 0 ? Number((assertionMatches / Math.max(1, totalExpectedEntities)).toFixed(3)) : 1.0;
    const tempPrecision = totalExpectedEntities > 0 ? Number((temporalityMatches / Math.max(1, totalExpectedEntities)).toFixed(3)) : 1.0;

    return {
      runId,
      timestamp: new Date().toISOString(),
      datasetVersion: GOLD_DATASET_METADATA.version,
      totalSentences: samples.length,
      entityExtraction: {
        ...entityMetrics,
        support: totalExpectedEntities
      },
      negationDetection: {
        ...negMetrics,
        support: samples.length
      },
      assertionClassification: {
        precision: assertPrecision,
        recall: assertPrecision,
        f1Score: assertPrecision,
        support: totalExpectedEntities
      },
      temporalityClassification: {
        precision: tempPrecision,
        recall: tempPrecision,
        f1Score: tempPrecision,
        support: totalExpectedEntities
      },
      conceptNormalization: {
        accuracy: normAccuracy,
        support: totalExpectedEntities
      },
      regressionPassRate: Number(((regressionPassed / samples.length) * 100).toFixed(1))
    };
  }
}
