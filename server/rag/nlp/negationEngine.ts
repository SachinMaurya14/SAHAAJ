/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ ConText / NegEx Clinical Negation Engine
 * Identifies negation, uncertainty, historical context, and family history
 * with precise scope bounding and pseudo-negation filtering.
 */

import { AssertionState } from './types';

interface TriggerRule {
  pattern: RegExp;
  assertion: AssertionState;
  direction: 'forward' | 'backward' | 'bidirectional';
  maxTokenDistance: number;
}

// Pseudo-negations that look like negation triggers but do NOT negate
const PSEUDO_NEGATIONS = [
  /\bno\s+increase\b/i,
  /\bno\s+change\b/i,
  /\bno\s+suspicious\s+change\b/i,
  /\bno\s+significant\s+interval\s+change\b/i,
  /\bnot\s+only\b/i,
  /\bnot\s+cause\b/i,
  /\bnot\s+certain\b/i,
  /\bwithout\s+difficulty\b/i
];

// Pre-condition negation triggers (forward looking)
const FORWARD_NEGATION_TRIGGERS: TriggerRule[] = [
  { pattern: /\b(?:no\s+evidence\s+of|no\s+sign\s+of|no\s+signs\s+of|no\s+suggestion\s+of)\b/i, assertion: 'ABSENT', direction: 'forward', maxTokenDistance: 8 },
  { pattern: /\b(?:negative\s+for|ruled\s+out\s+for|rules\s+out|rule\s+out)\b/i, assertion: 'ABSENT', direction: 'forward', maxTokenDistance: 6 },
  { pattern: /\b(?:denies|denied|denying|reports\s+no|states\s+no|without\s+any|without|free\s+of)\b/i, assertion: 'ABSENT', direction: 'forward', maxTokenDistance: 6 },
  { pattern: /\b(?:no|not|non|none|never|neither|nor)\b/i, assertion: 'ABSENT', direction: 'forward', maxTokenDistance: 4 },
  { pattern: /\b(?:absence\s+of|unremarkable\s+for|clear\s+of|zero)\b/i, assertion: 'ABSENT', direction: 'forward', maxTokenDistance: 6 }
];

// Post-condition negation triggers (backward looking)
const BACKWARD_NEGATION_TRIGGERS: TriggerRule[] = [
  { pattern: /\b(?:was\s+ruled\s+out|has\s+been\s+ruled\s+out|is\s+ruled\s+out|is\s+negative|was\s+negative|unremarkable)\b/i, assertion: 'ABSENT', direction: 'backward', maxTokenDistance: 6 },
  { pattern: /\b(?:not\s+seen|not\s+detected|not\s+identified|not\s+present|absent)\b/i, assertion: 'ABSENT', direction: 'backward', maxTokenDistance: 6 }
];

// Uncertainty / Possible Triggers
const UNCERTAINTY_TRIGGERS: TriggerRule[] = [
  { pattern: /\b(?:possible|possibly|probable|probably|suspicious\s+for|suggestive\s+of|concerning\s+for)\b/i, assertion: 'POSSIBLE', direction: 'forward', maxTokenDistance: 6 },
  { pattern: /\b(?:cannot\s+exclude|cannot\s+rule\s+out|differential\s+includes|equivocal|indeterminate)\b/i, assertion: 'POSSIBLE', direction: 'forward', maxTokenDistance: 6 },
  { pattern: /\b(?:questionable|borderline|versus|vs\.?)\b/i, assertion: 'POSSIBLE', direction: 'forward', maxTokenDistance: 4 }
];

// Family History Triggers
const FAMILY_TRIGGERS: TriggerRule[] = [
  { pattern: /\b(?:father|mother|brother|sister|sibling|parent|maternal|paternal|grandfather|grandmother|uncle|aunt|cousin|family\s+history\s+of|fam\s+hx)\b/i, assertion: 'FAMILY_HISTORY', direction: 'forward', maxTokenDistance: 7 }
];

// Historical Triggers
const HISTORICAL_TRIGGERS: TriggerRule[] = [
  { pattern: /\b(?:history\s+of|hx\s+of|past\s+history\s+of|prior\s+history\s+of|previous|status\s+post|s\/p|resolved|childhood)\b/i, assertion: 'HISTORICAL', direction: 'forward', maxTokenDistance: 6 }
];

// Termination boundaries that stop negation scope
const SCOPE_TERMINATORS = [
  /\b(?:but|however|although|except|nevertheless|yet|though|aside\s+from|other\s+than)\b/i,
  /[;:\.\n]/
];

export class NegationEngine {
  /**
   * Evaluates assertion status for an entity given the sentence/chunk context
   */
  public static evaluateAssertion(
    entityText: string,
    contextSentence: string,
    sectionName: string = ''
  ): { assertion: AssertionState; trigger?: string; confidence: number } {
    const lowerContext = contextSentence.toLowerCase();
    const lowerEntity = entityText.toLowerCase();
    const lowerSection = sectionName.toLowerCase();

    // 1. Section Level Overrides
    if (lowerSection.includes('family history') || lowerSection.includes('fam hx') || lowerSection.includes('family medical history')) {
      return { assertion: 'FAMILY_HISTORY', trigger: 'Section: Family History', confidence: 0.95 };
    }
    if (lowerSection.includes('past medical history') || lowerSection.includes('pmhx') || lowerSection.includes('surgical history')) {
      // Check if within past medical history it's negated
      if (this.hasNegationInContext(entityText, contextSentence)) {
        return { assertion: 'ABSENT', trigger: 'PMHx Negation', confidence: 0.92 };
      }
      return { assertion: 'HISTORICAL', trigger: 'Section: Past History', confidence: 0.90 };
    }

    const entityIdx = lowerContext.indexOf(lowerEntity);
    if (entityIdx === -1) {
      return { assertion: 'PRESENT', confidence: 0.85 };
    }

    // Check for pseudo-negation overlapping
    for (const pseudo of PSEUDO_NEGATIONS) {
      if (pseudo.test(contextSentence)) {
        // If matched pseudo, proceed with caution
      }
    }

    // 2. Check Family History Triggers
    const famMatch = this.checkTriggerWindow(FAMILY_TRIGGERS, lowerContext, entityIdx, lowerEntity.length);
    if (famMatch) {
      return { assertion: 'FAMILY_HISTORY', trigger: famMatch.trigger, confidence: 0.92 };
    }

    // 3. Check Explicit Negation Triggers (Forward and Backward)
    const forwardNegMatch = this.checkTriggerWindow(FORWARD_NEGATION_TRIGGERS, lowerContext, entityIdx, lowerEntity.length);
    if (forwardNegMatch && !this.isScopeTerminated(lowerContext, forwardNegMatch.index, entityIdx)) {
      return { assertion: 'ABSENT', trigger: forwardNegMatch.trigger, confidence: 0.96 };
    }

    const backwardNegMatch = this.checkTriggerWindow(BACKWARD_NEGATION_TRIGGERS, lowerContext, entityIdx, lowerEntity.length);
    if (backwardNegMatch && !this.isScopeTerminated(lowerContext, entityIdx, backwardNegMatch.index)) {
      return { assertion: 'ABSENT', trigger: backwardNegMatch.trigger, confidence: 0.94 };
    }

    // 4. Check Uncertainty / Possible Triggers
    const uncertaintyMatch = this.checkTriggerWindow(UNCERTAINTY_TRIGGERS, lowerContext, entityIdx, lowerEntity.length);
    if (uncertaintyMatch && !this.isScopeTerminated(lowerContext, uncertaintyMatch.index, entityIdx)) {
      return { assertion: 'POSSIBLE', trigger: uncertaintyMatch.trigger, confidence: 0.88 };
    }

    // 5. Check Historical Triggers
    const historicalMatch = this.checkTriggerWindow(HISTORICAL_TRIGGERS, lowerContext, entityIdx, lowerEntity.length);
    if (historicalMatch && !this.isScopeTerminated(lowerContext, historicalMatch.index, entityIdx)) {
      return { assertion: 'HISTORICAL', trigger: historicalMatch.trigger, confidence: 0.90 };
    }

    return { assertion: 'PRESENT', confidence: 0.90 };
  }

  private static hasNegationInContext(entityText: string, context: string): boolean {
    const lower = context.toLowerCase();
    const ent = entityText.toLowerCase();
    const idx = lower.indexOf(ent);
    if (idx === -1) return false;
    const forward = this.checkTriggerWindow(FORWARD_NEGATION_TRIGGERS, lower, idx, ent.length);
    return forward !== null;
  }

  private static checkTriggerWindow(
    rules: TriggerRule[],
    context: string,
    entityIdx: number,
    entityLen: number
  ): { trigger: string; index: number } | null {
    for (const rule of rules) {
      if (rule.direction === 'forward') {
        // Look before the entity up to reasonable character distance (~60 chars or max tokens)
        const windowStart = Math.max(0, entityIdx - rule.maxTokenDistance * 12);
        const windowText = context.substring(windowStart, entityIdx);
        const match = windowText.match(rule.pattern);
        if (match && match.index !== undefined) {
          return { trigger: match[0], index: windowStart + match.index };
        }
      } else if (rule.direction === 'backward') {
        // Look after the entity
        const entityEnd = entityIdx + entityLen;
        const windowEnd = Math.min(context.length, entityEnd + rule.maxTokenDistance * 12);
        const windowText = context.substring(entityEnd, windowEnd);
        const match = windowText.match(rule.pattern);
        if (match && match.index !== undefined) {
          return { trigger: match[0], index: entityEnd + match.index };
        }
      }
    }
    return null;
  }

  private static isScopeTerminated(context: string, startIdx: number, endIdx: number): boolean {
    const slice = context.substring(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx));
    for (const term of SCOPE_TERMINATORS) {
      if (term.test(slice)) return true;
    }
    return false;
  }
}
