/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Health Fact To Model Feature Mapper (V4 -> V5 Bridge)
 * Maps validated canonical facts to ML feature inputs with quality gates.
 * NO model prediction fabrication is performed.
 */

import { StructuredHealthFact, FeatureMappingResult } from './types';

// Standardized Clinical Feature Target Slots for Future Validated ML Models (V5)
const FEATURE_SLOT_DEFINITIONS: Record<string, { name: string; standard_unit: string; model_targets: string[] }> = {
  'HbA1c': { name: 'Glycated Hemoglobin', standard_unit: '%', model_targets: ['diabetes_progression_v5', 'cardiometabolic_risk_v5'] },
  'Fasting Blood Glucose': { name: 'Fasting Blood Glucose', standard_unit: 'mg/dL', model_targets: ['diabetes_progression_v5', 'metabolic_syndrome_v5'] },
  'LDL-C': { name: 'Low Density Lipoprotein Cholesterol', standard_unit: 'mg/dL', model_targets: ['ascvd_10yr_v5', 'lipid_panel_score_v5'] },
  'HDL-C': { name: 'High Density Lipoprotein Cholesterol', standard_unit: 'mg/dL', model_targets: ['ascvd_10yr_v5', 'metabolic_syndrome_v5'] },
  'Total Cholesterol': { name: 'Total Serum Cholesterol', standard_unit: 'mg/dL', model_targets: ['ascvd_10yr_v5'] },
  'Triglycerides': { name: 'Serum Triglycerides', standard_unit: 'mg/dL', model_targets: ['metabolic_syndrome_v5', 'pancreatitis_risk_v5'] },
  'Serum Creatinine': { name: 'Serum Creatinine', standard_unit: 'mg/dL', model_targets: ['kdigo_ckd_staging_v5', 'renal_clearance_v5'] },
  'eGFR': { name: 'Estimated Glomerular Filtration Rate', standard_unit: 'mL/min/1.73m²', model_targets: ['kdigo_ckd_staging_v5', 'renal_risk_v5'] },
  'Blood Pressure Systolic': { name: 'Systolic Blood Pressure', standard_unit: 'mmHg', model_targets: ['ascvd_10yr_v5', 'framingham_risk_v5'] },
  'Blood Pressure Diastolic': { name: 'Diastolic Blood Pressure', standard_unit: 'mmHg', model_targets: ['ascvd_10yr_v5', 'framingham_risk_v5'] },
  'Serum Potassium': { name: 'Serum Potassium', standard_unit: 'mmol/L', model_targets: ['electrolyte_monitoring_v5'] },
  'Hemoglobin': { name: 'Serum Hemoglobin', standard_unit: 'g/dL', model_targets: ['anemia_classifier_v5'] }
};

export class HealthFactToFeatureMapper {
  /**
   * Evaluates if extracted facts meet feature quality gates and maps to model input schemas
   */
  public static mapFactsToFeatureSlots(facts: StructuredHealthFact[]): FeatureMappingResult[] {
    const results: FeatureMappingResult[] = [];

    for (const fact of facts) {
      const slotDef = FEATURE_SLOT_DEFINITIONS[fact.canonical_concept];
      if (!slotDef) continue;

      const isModelReady = fact.validation_status === 'MODEL_READY' && fact.assertion === 'PRESENT';
      const val = fact.normalized_value !== undefined ? fact.normalized_value : (fact.numeric_value !== undefined ? fact.numeric_value : fact.value);

      results.push({
        concept_key: fact.canonical_concept.toLowerCase().replace(/[\s\-\(\)]+/g, '_'),
        canonical_name: fact.canonical_concept,
        extracted_value: fact.value,
        normalized_value: val,
        unit: fact.normalized_unit || fact.unit,
        is_model_ready: isModelReady,
        target_model_slots: slotDef.model_targets,
        validation_criteria_met: isModelReady
      });
    }

    return results;
  }
}
