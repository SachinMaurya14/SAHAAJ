/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Structured Health Fact Validator & Quality Gate
 * Enforces quality criteria before clinical facts are promoted to MODEL_READY status.
 */

import { StructuredHealthFact } from './types';

export class FactValidator {
  public static validateFact(fact: StructuredHealthFact): {
    validation_status: 'MODEL_READY' | 'NEEDS_REVIEW';
    quality_notes: string[];
  } {
    const notes: string[] = [];
    let isValid = true;

    // 1. Source existence check
    if (!fact.source_text || fact.source_text.trim().length === 0) {
      notes.push('Missing explicit source text span');
      isValid = false;
    }

    // 2. Canonical concept normalization check
    if (!fact.canonical_concept || fact.canonical_concept === 'Unknown' || fact.canonical_concept === 'Other') {
      notes.push('Concept is not normalized to canonical ontology');
      isValid = false;
    }

    // 3. Unit validation for numeric lab concepts
    if (fact.numeric_value !== undefined && !isNaN(fact.numeric_value)) {
      if (!fact.unit || fact.unit.trim().length === 0) {
        notes.push('Unit is missing for numeric measurement');
        isValid = false;
      }

      // Check biological physiological sanity bounds
      if (fact.canonical_concept.includes('Glucose') && (fact.numeric_value <= 10 || fact.numeric_value >= 1500)) {
        notes.push(`Glucose value (${fact.numeric_value}) is physiologically implausible`);
        isValid = false;
      }
      if (fact.canonical_concept === 'HbA1c' && (fact.numeric_value < 2.0 || fact.numeric_value > 25.0)) {
        notes.push(`HbA1c value (${fact.numeric_value}%) is outside plausible range (2.0 - 25.0%)`);
        isValid = false;
      }
      if (fact.canonical_concept === 'Serum Potassium' && (fact.numeric_value < 1.0 || fact.numeric_value > 12.0)) {
        notes.push(`Potassium value (${fact.numeric_value}) is physiologically implausible`);
        isValid = false;
      }
    }

    // 4. Assertion & Temporality integrity
    if (fact.assertion === 'UNKNOWN') {
      notes.push('Assertion status is ambiguous');
      isValid = false;
    }
    if (fact.temporality === 'unknown') {
      notes.push('Temporality could not be resolved with certainty');
    }

    // 5. Extraction confidence threshold
    if (fact.confidence < 0.75) {
      notes.push(`Low extraction confidence score (${Math.round(fact.confidence * 100)}%)`);
      isValid = false;
    }

    return {
      validation_status: isValid ? 'MODEL_READY' : 'NEEDS_REVIEW',
      quality_notes: notes.length > 0 ? notes : ['Validated against SAAHAJ clinical quality criteria']
    };
  }
}
