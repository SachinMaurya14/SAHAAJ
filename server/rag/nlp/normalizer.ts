/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Medical Entity Normalization & Unit Standardization Engine
 * Maps text variants to canonical clinical concepts, parses reference intervals,
 * and performs mathematically and clinically verified unit conversions.
 */

export interface ConceptNormalization {
  canonical_name: string;
  canonical_code?: string; // LOINC, SNOMED, or RxNorm standard where verified
  category: 'LAB' | 'MEDICATION' | 'CONDITION' | 'SYMPTOM' | 'IMAGING' | 'VITAL';
  standard_unit?: string;
  confidence: number;
  source: 'SAAHJ_CLINICAL_ONTOLOGY_V4';
}

export interface UnitConversionResult {
  original_value: number;
  original_unit: string;
  normalized_value: number;
  normalized_unit: string;
  conversion_applied: boolean;
  status: 'SUCCESS' | 'UNIT_MISSING' | 'UNSUPPORTED_CONVERSION' | 'INVALID_NUMERIC';
}

export interface ReferenceRangeParsed {
  raw_text: string;
  low?: number;
  high?: number;
  comparator?: '<' | '<=' | '>' | '>=' | '=' | 'range' | 'qualitative';
  qualitative_expected?: 'Negative' | 'Non-reactive' | 'Normal' | 'Trace';
  is_valid: boolean;
}

// Canonical Concept Lexicon
const CANONICAL_MAPPINGS: Record<string, ConceptNormalization> = {
  // Glycemic
  'hba1c': { canonical_name: 'HbA1c', canonical_code: '4548-4', category: 'LAB', standard_unit: '%', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'glycated hemoglobin': { canonical_name: 'HbA1c', canonical_code: '4548-4', category: 'LAB', standard_unit: '%', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'glycosylated hemoglobin': { canonical_name: 'HbA1c', canonical_code: '4548-4', category: 'LAB', standard_unit: '%', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'a1c': { canonical_name: 'HbA1c', canonical_code: '4548-4', category: 'LAB', standard_unit: '%', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hemoglobin a1c': { canonical_name: 'HbA1c', canonical_code: '4548-4', category: 'LAB', standard_unit: '%', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'fasting blood sugar': { canonical_name: 'Fasting Blood Glucose', canonical_code: '1558-6', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'fasting blood glucose': { canonical_name: 'Fasting Blood Glucose', canonical_code: '1558-6', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'fbs': { canonical_name: 'Fasting Blood Glucose', canonical_code: '1558-6', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.94, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'postprandial blood glucose': { canonical_name: 'Postprandial Glucose', canonical_code: '1521-4', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'ppbs': { canonical_name: 'Postprandial Glucose', canonical_code: '1521-4', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.94, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'random blood sugar': { canonical_name: 'Random Blood Glucose', canonical_code: '2345-7', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'rbs': { canonical_name: 'Random Blood Glucose', canonical_code: '2345-7', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.92, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Renal
  'serum creatinine': { canonical_name: 'Serum Creatinine', canonical_code: '2160-0', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'creatinine': { canonical_name: 'Serum Creatinine', canonical_code: '2160-0', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'serum creat': { canonical_name: 'Serum Creatinine', canonical_code: '2160-0', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'estimated gfr': { canonical_name: 'eGFR', canonical_code: '33914-3', category: 'LAB', standard_unit: 'mL/min/1.73m²', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'egfr': { canonical_name: 'eGFR', canonical_code: '33914-3', category: 'LAB', standard_unit: 'mL/min/1.73m²', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'blood urea nitrogen': { canonical_name: 'Blood Urea Nitrogen', canonical_code: '3094-0', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'bun': { canonical_name: 'Blood Urea Nitrogen', canonical_code: '3094-0', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'uric acid': { canonical_name: 'Serum Uric Acid', canonical_code: '3084-1', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Lipids
  'low density lipoprotein': { canonical_name: 'LDL-C', canonical_code: '13457-7', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'ldl': { canonical_name: 'LDL-C', canonical_code: '13457-7', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'ldl-c': { canonical_name: 'LDL-C', canonical_code: '13457-7', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'high density lipoprotein': { canonical_name: 'HDL-C', canonical_code: '2085-9', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hdl': { canonical_name: 'HDL-C', canonical_code: '2085-9', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hdl-c': { canonical_name: 'HDL-C', canonical_code: '2085-9', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'total cholesterol': { canonical_name: 'Total Cholesterol', canonical_code: '2093-3', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'triglycerides': { canonical_name: 'Triglycerides', canonical_code: '2571-8', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'tg': { canonical_name: 'Triglycerides', canonical_code: '2571-8', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.92, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Liver
  'alanine aminotransferase': { canonical_name: 'ALT (SGPT)', canonical_code: '1742-6', category: 'LAB', standard_unit: 'U/L', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'alt': { canonical_name: 'ALT (SGPT)', canonical_code: '1742-6', category: 'LAB', standard_unit: 'U/L', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'sgpt': { canonical_name: 'ALT (SGPT)', canonical_code: '1742-6', category: 'LAB', standard_unit: 'U/L', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'aspartate aminotransferase': { canonical_name: 'AST (SGOT)', canonical_code: '1920-8', category: 'LAB', standard_unit: 'U/L', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'ast': { canonical_name: 'AST (SGOT)', canonical_code: '1920-8', category: 'LAB', standard_unit: 'U/L', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'sgot': { canonical_name: 'AST (SGOT)', canonical_code: '1920-8', category: 'LAB', standard_unit: 'U/L', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'total bilirubin': { canonical_name: 'Total Bilirubin', canonical_code: '1975-2', category: 'LAB', standard_unit: 'mg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'alkaline phosphatase': { canonical_name: 'Alkaline Phosphatase', canonical_code: '6768-6', category: 'LAB', standard_unit: 'U/L', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'alp': { canonical_name: 'Alkaline Phosphatase', canonical_code: '6768-6', category: 'LAB', standard_unit: 'U/L', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Hematology
  'hemoglobin': { canonical_name: 'Hemoglobin', canonical_code: '718-7', category: 'LAB', standard_unit: 'g/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hb': { canonical_name: 'Hemoglobin', canonical_code: '718-7', category: 'LAB', standard_unit: 'g/dL', confidence: 0.94, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'platelet count': { canonical_name: 'Platelet Count', canonical_code: '777-3', category: 'LAB', standard_unit: 'x10³/µL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'platelets': { canonical_name: 'Platelet Count', canonical_code: '777-3', category: 'LAB', standard_unit: 'x10³/µL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'total wbc count': { canonical_name: 'WBC Count', canonical_code: '6690-2', category: 'LAB', standard_unit: 'x10³/µL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'wbc': { canonical_name: 'WBC Count', canonical_code: '6690-2', category: 'LAB', standard_unit: 'x10³/µL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'white blood cell count': { canonical_name: 'WBC Count', canonical_code: '6690-2', category: 'LAB', standard_unit: 'x10³/µL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Thyroid
  'thyroid stimulating hormone': { canonical_name: 'TSH', canonical_code: '3016-3', category: 'LAB', standard_unit: 'µIU/mL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'tsh': { canonical_name: 'TSH', canonical_code: '3016-3', category: 'LAB', standard_unit: 'µIU/mL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'free t4': { canonical_name: 'Free T4', canonical_code: '3024-7', category: 'LAB', standard_unit: 'ng/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'ft4': { canonical_name: 'Free T4', canonical_code: '3024-7', category: 'LAB', standard_unit: 'ng/dL', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Electrolytes
  'potassium': { canonical_name: 'Serum Potassium', canonical_code: '2823-3', category: 'LAB', standard_unit: 'mmol/L', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'sodium': { canonical_name: 'Serum Sodium', canonical_code: '2951-2', category: 'LAB', standard_unit: 'mmol/L', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'chloride': { canonical_name: 'Serum Chloride', canonical_code: '2075-0', category: 'LAB', standard_unit: 'mmol/L', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Vitamins & Minerals
  'vitamin d': { canonical_name: 'Vitamin D (25-OH)', canonical_code: '62292-8', category: 'LAB', standard_unit: 'ng/mL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  '25-hydroxy vitamin d': { canonical_name: 'Vitamin D (25-OH)', canonical_code: '62292-8', category: 'LAB', standard_unit: 'ng/mL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'vitamin b12': { canonical_name: 'Vitamin B12', canonical_code: '2132-9', category: 'LAB', standard_unit: 'pg/mL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'serum iron': { canonical_name: 'Serum Iron', canonical_code: '2498-4', category: 'LAB', standard_unit: 'µg/dL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'serum ferritin': { canonical_name: 'Serum Ferritin', canonical_code: '2276-4', category: 'LAB', standard_unit: 'ng/mL', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Medications
  'metformin': { canonical_name: 'Metformin', canonical_code: 'RxNorm:6809', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'metformin hcl': { canonical_name: 'Metformin', canonical_code: 'RxNorm:6809', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'atorvastatin': { canonical_name: 'Atorvastatin', canonical_code: 'RxNorm:83367', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'atorvastatin calcium': { canonical_name: 'Atorvastatin', canonical_code: 'RxNorm:83367', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'lisinopril': { canonical_name: 'Lisinopril', canonical_code: 'RxNorm:29046', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'amlodipine': { canonical_name: 'Amlodipine', canonical_code: 'RxNorm:17767', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'losartan': { canonical_name: 'Losartan', canonical_code: 'RxNorm:5224', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'levothyroxine': { canonical_name: 'Levothyroxine', canonical_code: 'RxNorm:6373', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'aspirin': { canonical_name: 'Aspirin', canonical_code: 'RxNorm:1191', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'empagliflozin': { canonical_name: 'Empagliflozin', canonical_code: 'RxNorm:1545653', category: 'MEDICATION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Conditions
  'type 2 diabetes': { canonical_name: 'Type 2 Diabetes Mellitus', canonical_code: 'SNOMED:44054006', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'type 2 diabetes mellitus': { canonical_name: 'Type 2 Diabetes Mellitus', canonical_code: 'SNOMED:44054006', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  't2dm': { canonical_name: 'Type 2 Diabetes Mellitus', canonical_code: 'SNOMED:44054006', category: 'CONDITION', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'diabetes mellitus': { canonical_name: 'Diabetes Mellitus', canonical_code: 'SNOMED:73211009', category: 'CONDITION', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'diabetes': { canonical_name: 'Diabetes Mellitus', canonical_code: 'SNOMED:73211009', category: 'CONDITION', confidence: 0.92, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hypertension': { canonical_name: 'Essential Hypertension', canonical_code: 'SNOMED:59621000', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'htn': { canonical_name: 'Essential Hypertension', canonical_code: 'SNOMED:59621000', category: 'CONDITION', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'high blood pressure': { canonical_name: 'Essential Hypertension', canonical_code: 'SNOMED:59621000', category: 'CONDITION', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hyperlipidemia': { canonical_name: 'Hyperlipidemia', canonical_code: 'SNOMED:55822004', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'dyslipidemia': { canonical_name: 'Dyslipidemia', canonical_code: 'SNOMED:370992007', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'chronic kidney disease': { canonical_name: 'Chronic Kidney Disease', canonical_code: 'SNOMED:709044004', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'ckd': { canonical_name: 'Chronic Kidney Disease', canonical_code: 'SNOMED:709044004', category: 'CONDITION', confidence: 0.96, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'coronary artery disease': { canonical_name: 'Coronary Artery Disease', canonical_code: 'SNOMED:53741008', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'cad': { canonical_name: 'Coronary Artery Disease', canonical_code: 'SNOMED:53741008', category: 'CONDITION', confidence: 0.94, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'pneumonia': { canonical_name: 'Pneumonia', canonical_code: 'SNOMED:233604007', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'asthma': { canonical_name: 'Asthma', canonical_code: 'SNOMED:195967001', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'hypothyroidism': { canonical_name: 'Hypothyroidism', canonical_code: 'SNOMED:40930008', category: 'CONDITION', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },

  // Symptoms
  'chest pain': { canonical_name: 'Chest Pain', canonical_code: 'SNOMED:29857009', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'chest discomfort': { canonical_name: 'Chest Pain', canonical_code: 'SNOMED:29857009', category: 'SYMPTOM', confidence: 0.95, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'shortness of breath': { canonical_name: 'Dyspnea', canonical_code: 'SNOMED:267036007', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'dyspnea': { canonical_name: 'Dyspnea', canonical_code: 'SNOMED:267036007', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'sob': { canonical_name: 'Dyspnea', canonical_code: 'SNOMED:267036007', category: 'SYMPTOM', confidence: 0.92, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'fatigue': { canonical_name: 'Fatigue', canonical_code: 'SNOMED:84229001', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'fever': { canonical_name: 'Fever', canonical_code: 'SNOMED:386661006', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'headache': { canonical_name: 'Headache', canonical_code: 'SNOMED:25064002', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'cough': { canonical_name: 'Cough', canonical_code: 'SNOMED:49727002', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'dizziness': { canonical_name: 'Dizziness', canonical_code: 'SNOMED:404640003', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'palpitations': { canonical_name: 'Palpitations', canonical_code: 'SNOMED:80313002', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' },
  'nausea': { canonical_name: 'Nausea', canonical_code: 'SNOMED:422587007', category: 'SYMPTOM', confidence: 0.98, source: 'SAAHJ_CLINICAL_ONTOLOGY_V4' }
};

export class MedicalNormalizer {
  /**
   * Normalizes raw mention text to canonical concept
   */
  public static normalizeConcept(rawText: string): ConceptNormalization | null {
    const clean = rawText.trim().toLowerCase()
      .replace(/[^\w\s\(\)\-\.]/g, '')
      .replace(/\s+/g, ' ');

    if (CANONICAL_MAPPINGS[clean]) {
      return CANONICAL_MAPPINGS[clean];
    }

    // Partial substring check for exact canonical match
    for (const [key, mapping] of Object.entries(CANONICAL_MAPPINGS)) {
      if (clean === key || (clean.length > 4 && (clean.includes(key) || key.includes(clean)))) {
        return {
          ...mapping,
          confidence: 0.88
        };
      }
    }

    return null;
  }

  /**
   * Normalizes laboratory units and converts where mathematically and clinically verified
   */
  public static normalizeLabUnit(
    canonicalConcept: string,
    rawVal: number,
    rawUnit: string
  ): UnitConversionResult {
    const cleanUnit = (rawUnit || '').trim().toLowerCase();

    if (!cleanUnit) {
      return {
        original_value: rawVal,
        original_unit: '',
        normalized_value: rawVal,
        normalized_unit: '',
        conversion_applied: false,
        status: 'UNIT_MISSING'
      };
    }

    // Glucose: mmol/L to mg/dL (factor: 18.0182)
    if (canonicalConcept.includes('Glucose')) {
      if (cleanUnit === 'mmol/l' || cleanUnit === 'mmol / l') {
        const converted = Math.round(rawVal * 18.0182 * 10) / 10;
        return {
          original_value: rawVal,
          original_unit: rawUnit,
          normalized_value: converted,
          normalized_unit: 'mg/dL',
          conversion_applied: true,
          status: 'SUCCESS'
        };
      }
      if (cleanUnit === 'mg/dl' || cleanUnit === 'mg / dl' || cleanUnit === 'mg%') {
        return {
          original_value: rawVal,
          original_unit: rawUnit,
          normalized_value: rawVal,
          normalized_unit: 'mg/dL',
          conversion_applied: false,
          status: 'SUCCESS'
        };
      }
    }

    // Cholesterol / Triglycerides: mmol/L to mg/dL
    if (canonicalConcept === 'Total Cholesterol' || canonicalConcept === 'LDL-C' || canonicalConcept === 'HDL-C') {
      if (cleanUnit === 'mmol/l') {
        const converted = Math.round(rawVal * 38.67 * 10) / 10;
        return {
          original_value: rawVal,
          original_unit: rawUnit,
          normalized_value: converted,
          normalized_unit: 'mg/dL',
          conversion_applied: true,
          status: 'SUCCESS'
        };
      }
    }
    if (canonicalConcept === 'Triglycerides' && cleanUnit === 'mmol/l') {
      const converted = Math.round(rawVal * 88.57 * 10) / 10;
      return {
        original_value: rawVal,
        original_unit: rawUnit,
        normalized_value: converted,
        normalized_unit: 'mg/dL',
        conversion_applied: true,
        status: 'SUCCESS'
      };
    }

    // Creatinine: µmol/L to mg/dL (factor: divide by 88.4)
    if (canonicalConcept === 'Serum Creatinine') {
      if (cleanUnit === 'µmol/l' || cleanUnit === 'umol/l') {
        const converted = Math.round((rawVal / 88.4) * 100) / 100;
        return {
          original_value: rawVal,
          original_unit: rawUnit,
          normalized_value: converted,
          normalized_unit: 'mg/dL',
          conversion_applied: true,
          status: 'SUCCESS'
        };
      }
    }

    // Standardized without conversion
    return {
      original_value: rawVal,
      original_unit: rawUnit,
      normalized_value: rawVal,
      normalized_unit: rawUnit,
      conversion_applied: false,
      status: 'SUCCESS'
    };
  }

  /**
   * Parses various printed reference range interval formats
   */
  public static parseReferenceRange(rangeStr: string): ReferenceRangeParsed {
    const raw = (rangeStr || '').trim();
    if (!raw) {
      return { raw_text: '', is_valid: false };
    }

    // Check qualitative forms
    if (/^(?:negative|non[\s-]?reactive|normal)$/i.test(raw)) {
      return {
        raw_text: raw,
        comparator: 'qualitative',
        qualitative_expected: /reactive/i.test(raw) ? 'Non-reactive' : /negative/i.test(raw) ? 'Negative' : 'Normal',
        is_valid: true
      };
    }

    // Numeric Range: 70 - 99 or 3.5 – 5.5
    const rangeMatch = raw.match(/([\d\.]+)\s*(?:-|–|to)\s*([\d\.]+)/);
    if (rangeMatch) {
      const low = parseFloat(rangeMatch[1]);
      const high = parseFloat(rangeMatch[2]);
      if (!isNaN(low) && !isNaN(high)) {
        return {
          raw_text: raw,
          low,
          high,
          comparator: 'range',
          is_valid: true
        };
      }
    }

    // Upper bound: < 100 or <= 100
    const upperMatch = raw.match(/(?:<|<=|less\s+than|up\s+to)\s*([\d\.]+)/i);
    if (upperMatch) {
      const high = parseFloat(upperMatch[1]);
      if (!isNaN(high)) {
        return {
          raw_text: raw,
          high,
          comparator: '<',
          is_valid: true
        };
      }
    }

    // Lower bound: > 60 or >= 60
    const lowerMatch = raw.match(/(?:>|>=|greater\s+than|above)\s*([\d\.]+)/i);
    if (lowerMatch) {
      const low = parseFloat(lowerMatch[1]);
      if (!isNaN(low)) {
        return {
          raw_text: raw,
          low,
          comparator: '>',
          is_valid: true
        };
      }
    }

    return { raw_text: raw, is_valid: false };
  }
}
