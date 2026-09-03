/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinical Critical Value Detection Engine
 * Validated, evidence-based laboratory threshold alerts with conservative fallbacks.
 * Never invents arbitrary thresholds.
 */

interface CriticalThreshold {
  canonical_name: string;
  unit: string;
  critical_low?: number;
  critical_high?: number;
  clinical_rationale: string;
}

// Established, standardized laboratory critical panic values (CAP / CLSI consensus)
const VALIDATED_CRITICAL_THRESHOLDS: Record<string, CriticalThreshold> = {
  'Serum Potassium': {
    canonical_name: 'Serum Potassium',
    unit: 'mmol/L',
    critical_low: 2.8,
    critical_high: 6.2,
    clinical_rationale: 'Severe cardiac arrhythmia risk (hyperkalemia/hypokalemia)'
  },
  'Serum Sodium': {
    canonical_name: 'Serum Sodium',
    unit: 'mmol/L',
    critical_low: 120,
    critical_high: 160,
    clinical_rationale: 'Severe neurological compromise / osmotic demyelination or cerebral edema'
  },
  'Fasting Blood Glucose': {
    canonical_name: 'Fasting Blood Glucose',
    unit: 'mg/dL',
    critical_low: 45,
    critical_high: 450,
    clinical_rationale: 'Severe hypoglycemic coma risk or hyperosmolar hyperglycemic crisis'
  },
  'Random Blood Glucose': {
    canonical_name: 'Random Blood Glucose',
    unit: 'mg/dL',
    critical_low: 45,
    critical_high: 450,
    clinical_rationale: 'Severe hypoglycemic neuroglycopenia or DKA/HHS'
  },
  'Hemoglobin': {
    canonical_name: 'Hemoglobin',
    unit: 'g/dL',
    critical_low: 6.5,
    critical_high: 20.0,
    clinical_rationale: 'Severe tissue hypoxia / hemodynamic collapse or severe hyperviscosity'
  },
  'Platelet Count': {
    canonical_name: 'Platelet Count',
    unit: 'x10³/µL',
    critical_low: 20,
    critical_high: 1000,
    clinical_rationale: 'Spontaneous life-threatening intracranial/gastrointestinal hemorrhage or thrombosis'
  },
  'Serum Creatinine': {
    canonical_name: 'Serum Creatinine',
    unit: 'mg/dL',
    critical_high: 5.0,
    clinical_rationale: 'Acute oliguric or anuric renal failure requiring urgent nephrology evaluation'
  }
};

export interface CriticalValueEvaluation {
  is_critical: boolean;
  status_message: string;
  threshold_rule_available: boolean;
  severity?: 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'NORMAL' | 'ELEVATED' | 'LOW';
  rationale?: string;
}

export class CriticalValueDetector {
  /**
   * Evaluates if a numeric lab observation breaches a validated critical threshold
   */
  public static evaluate(
    canonicalConcept: string,
    numericVal: number | undefined,
    unit: string
  ): CriticalValueEvaluation {
    const threshold = VALIDATED_CRITICAL_THRESHOLDS[canonicalConcept];

    if (!threshold || numericVal === undefined || isNaN(numericVal)) {
      return {
        is_critical: false,
        status_message: 'Critical-value interpretation unavailable for this parameter.',
        threshold_rule_available: false
      };
    }

    if (threshold.critical_low !== undefined && numericVal <= threshold.critical_low) {
      return {
        is_critical: true,
        severity: 'CRITICAL_LOW',
        status_message: `CRITICAL LOW: Value (${numericVal} ${unit}) is below validated panic threshold (≤ ${threshold.critical_low} ${threshold.unit}).`,
        threshold_rule_available: true,
        rationale: threshold.clinical_rationale
      };
    }

    if (threshold.critical_high !== undefined && numericVal >= threshold.critical_high) {
      return {
        is_critical: true,
        severity: 'CRITICAL_HIGH',
        status_message: `CRITICAL HIGH: Value (${numericVal} ${unit}) exceeds validated panic threshold (≥ ${threshold.critical_high} ${threshold.unit}).`,
        threshold_rule_available: true,
        rationale: threshold.clinical_rationale
      };
    }

    return {
      is_critical: false,
      severity: 'NORMAL',
      status_message: 'Value is within safe clinical monitoring bounds.',
      threshold_rule_available: true
    };
  }
}
