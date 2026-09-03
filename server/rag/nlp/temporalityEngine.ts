/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Temporality Engine
 * Distinguishes current vs historical vs future/planned vs recent clinical events.
 */

import { TemporalityState } from './types';

interface TemporalTrigger {
  pattern: RegExp;
  state: TemporalityState;
}

const TEMPORAL_PATTERNS: TemporalTrigger[] = [
  // Future / Planned
  { pattern: /\b(?:follow[\s-]?up\s+in|scheduled\s+for|plan\s+for|recommend(?:ed)?\s+in|return\s+in|repeat\s+in|due\s+in|next\s+visit|will\s+start|to\s+be\s+done)\b/i, state: 'future_planned' },
  // Historical
  { pattern: /\b(?:history\s+of|hx\s+of|prior\s+to|past\s+medical|diagnosed\s+in\s+\d{4}|previous|previously|status\s+post|s\/p|in\s+the\s+past|years?\s+ago|months?\s+ago|childhood|former)\b/i, state: 'historical' },
  // Recent
  { pattern: /\b(?:started\s+\d+\s+days?\s+ago|onset\s+\d+\s+days?\s+ago|recent|recently|yesterday|last\s+night|for\s+the\s+past\s+(?:\d+|few)\s+days?|acute\s+onset)\b/i, state: 'recent' },
  // Current
  { pattern: /\b(?:currently|current|now|presently|today|active|on\s+exam|noted\s+today|present\s+on\s+admission)\b/i, state: 'current' }
];

export class TemporalityEngine {
  public static evaluateTemporality(
    entityText: string,
    contextSentence: string,
    sectionName: string = ''
  ): { temporality: TemporalityState; temporal_phrase?: string; confidence: number } {
    const lowerContext = contextSentence.toLowerCase();
    const lowerSection = sectionName.toLowerCase();

    // Section Level Rules
    if (lowerSection.includes('past medical history') || lowerSection.includes('pmhx') || lowerSection.includes('prior procedures')) {
      return { temporality: 'historical', temporal_phrase: 'Section context: Past Medical History', confidence: 0.94 };
    }
    if (lowerSection.includes('plan') || lowerSection.includes('recommendations') || lowerSection.includes('follow-up') || lowerSection.includes('discharge instructions')) {
      // If mentions future time frame
      if (/\b(?:in\s+\d+\s+(?:weeks?|months?|days?)|scheduled|repeat)\b/i.test(lowerContext)) {
        return { temporality: 'future_planned', temporal_phrase: 'Plan/Recommendation window', confidence: 0.92 };
      }
    }
    if (lowerSection.includes('history of present illness') || lowerSection.includes('hpi')) {
      if (/\b(?:\d+\s+days?\s+ago|recently|acute)\b/i.test(lowerContext)) {
        return { temporality: 'recent', temporal_phrase: 'HPI recent onset', confidence: 0.90 };
      }
    }

    // Pattern Matching around context
    for (const item of TEMPORAL_PATTERNS) {
      const match = lowerContext.match(item.pattern);
      if (match) {
        return {
          temporality: item.state,
          temporal_phrase: match[0],
          confidence: 0.88
        };
      }
    }

    // Default by section or finding type
    if (lowerSection.includes('laboratory') || lowerSection.includes('findings') || lowerSection.includes('impression')) {
      return { temporality: 'current', confidence: 0.85 };
    }

    return { temporality: 'current', confidence: 0.80 };
  }
}
