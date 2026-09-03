/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Biomarker Observation Extractor & Normalization Layer
 * Extracts candidate clinical observations, normalizes canonical lab concepts,
 * preserves printed document reference ranges, assigns confidence and flags.
 */

import { ChunkRecord, ObservationRecord } from '../types';

interface CanonicalConceptDef {
  canonical: string;
  aliases: RegExp[];
  category: string;
  defaultUnit: string;
  defaultLow?: number;
  defaultHigh?: number;
}

const CANONICAL_CONCEPTS: CanonicalConceptDef[] = [
  {
    canonical: 'HbA1c',
    aliases: [/hba1c/i, /hemoglobin\s+a1c/i, /glycated\s+hemoglobin/i, /a1c/i],
    category: 'Metabolic & Glycemic',
    defaultUnit: '%',
    defaultLow: 4.0,
    defaultHigh: 5.6
  },
  {
    canonical: 'Fasting Blood Glucose',
    aliases: [/fasting\s+blood\s+(?:sugar|glucose)/i, /fbs/i, /glucose[,\s]+fasting/i, /\bglucose\b/i],
    category: 'Metabolic & Glycemic',
    defaultUnit: 'mg/dL',
    defaultLow: 70,
    defaultHigh: 99
  },
  {
    canonical: 'Serum Creatinine',
    aliases: [/serum\s+creatinine/i, /\bcreatinine\b/i, /s\.?\s*creatinine/i],
    category: 'Kidney Function',
    defaultUnit: 'mg/dL',
    defaultLow: 0.7,
    defaultHigh: 1.3
  },
  {
    canonical: 'eGFR',
    aliases: [/egfr/i, /estimated\s+gfr/i, /glomerular\s+filtration/i],
    category: 'Kidney Function',
    defaultUnit: 'mL/min/1.73m²',
    defaultLow: 60,
    defaultHigh: 120
  },
  {
    canonical: 'Total Cholesterol',
    aliases: [/total\s+cholesterol/i, /serum\s+cholesterol/i, /\bcholesterol\b/i],
    category: 'Lipid Profile',
    defaultUnit: 'mg/dL',
    defaultLow: 125,
    defaultHigh: 200
  },
  {
    canonical: 'LDL-C',
    aliases: [/ldl\s+cholesterol/i, /ldl-c/i, /ldl\s+direct/i, /\bldl\b/i, /bad\s+cholesterol/i],
    category: 'Lipid Profile',
    defaultUnit: 'mg/dL',
    defaultLow: 50,
    defaultHigh: 100
  },
  {
    canonical: 'HDL-C',
    aliases: [/hdl\s+cholesterol/i, /hdl-c/i, /\bhdl\b/i, /good\s+cholesterol/i],
    category: 'Lipid Profile',
    defaultUnit: 'mg/dL',
    defaultLow: 40,
    defaultHigh: 60
  },
  {
    canonical: 'Triglycerides',
    aliases: [/triglycerides/i, /serum\s+triglycerides/i, /\btg\b/i],
    category: 'Lipid Profile',
    defaultUnit: 'mg/dL',
    defaultLow: 50,
    defaultHigh: 150
  },
  {
    canonical: 'ALT (SGPT)',
    aliases: [/alt\s*\(sgpt\)/i, /\balt\b/i, /\bsgpt\b/i, /alanine\s+aminotransferase/i],
    category: 'Liver Function',
    defaultUnit: 'U/L',
    defaultLow: 7,
    defaultHigh: 45
  },
  {
    canonical: 'AST (SGOT)',
    aliases: [/ast\s*\(sgot\)/i, /\bast\b/i, /\bsgot\b/i, /aspartate\s+aminotransferase/i],
    category: 'Liver Function',
    defaultUnit: 'U/L',
    defaultLow: 8,
    defaultHigh: 40
  },
  {
    canonical: 'Hemoglobin',
    aliases: [/\bhemoglobin\b/i, /\bhgb\b/i, /\bhb\b/i],
    category: 'Hematology',
    defaultUnit: 'g/dL',
    defaultLow: 13.0,
    defaultHigh: 17.0
  },
  {
    canonical: 'Platelet Count',
    aliases: [/platelet\s+count/i, /\bplatelets\b/i, /\bplt\b/i],
    category: 'Hematology',
    defaultUnit: '10^3/mcL',
    defaultLow: 150,
    defaultHigh: 450
  },
  {
    canonical: 'White Blood Cell (WBC)',
    aliases: [/wbc\s+count/i, /white\s+blood\s+cells/i, /\bwbc\b/i, /total\s+leukocyte/i],
    category: 'Hematology',
    defaultUnit: '10^3/mcL',
    defaultLow: 4.5,
    defaultHigh: 11.0
  },
  {
    canonical: 'TSH',
    aliases: [/\btsh\b/i, /thyroid\s+stimulating\s+hormone/i],
    category: 'Thyroid',
    defaultUnit: 'uIU/mL',
    defaultLow: 0.4,
    defaultHigh: 4.0
  },
  {
    canonical: 'Systolic Blood Pressure',
    aliases: [/systolic(?:\s+bp)?/i, /blood\s+pressure\s+systolic/i],
    category: 'Cardiovascular',
    defaultUnit: 'mmHg',
    defaultLow: 90,
    defaultHigh: 120
  },
  {
    canonical: 'Diastolic Blood Pressure',
    aliases: [/diastolic(?:\s+bp)?/i, /blood\s+pressure\s+diastolic/i],
    category: 'Cardiovascular',
    defaultUnit: 'mmHg',
    defaultLow: 60,
    defaultHigh: 80
  }
];

export class ObservationExtractor {
  /**
   * Extracts candidate clinical observations from document chunks
   */
  public static extractObservations(
    chunks: ChunkRecord[],
    documentId: string,
    userId: string,
    recordedDate?: string
  ): ObservationRecord[] {
    const observations: ObservationRecord[] = [];
    const seenConcepts = new Set<string>();

    for (const chunk of chunks) {
      const lines = chunk.text.split('\n');

      for (const line of lines) {
        for (const conceptDef of CANONICAL_CONCEPTS) {
          // Check if line matches any alias
          const hasMatch = conceptDef.aliases.some(rgx => rgx.test(line));
          if (!hasMatch) continue;

          // Prevent exact duplicate concept extraction from the same page unless different values
          const conceptKey = `${conceptDef.canonical}-${chunk.page_number}`;
          if (seenConcepts.has(conceptKey)) continue;

          const parsed = this.parseObservationLine(line, conceptDef);
          if (parsed) {
            seenConcepts.add(conceptKey);
            observations.push({
              observation_id: `obs-${documentId}-${observations.length + 1}`,
              document_id: documentId,
              user_id: userId,
              name: parsed.rawName || conceptDef.canonical,
              canonical_concept: conceptDef.canonical,
              value: parsed.value,
              numeric_value: parsed.numericValue,
              unit: parsed.unit || conceptDef.defaultUnit,
              canonical_unit: conceptDef.defaultUnit,
              reference_low: parsed.refLow !== undefined ? parsed.refLow : conceptDef.defaultLow,
              reference_high: parsed.refHigh !== undefined ? parsed.refHigh : conceptDef.defaultHigh,
              reference_range_text: parsed.refRangeText || (conceptDef.defaultLow !== undefined ? `${conceptDef.defaultLow} - ${conceptDef.defaultHigh} ${conceptDef.defaultUnit}` : 'Consult clinician'),
              reference_source: parsed.refRangeText ? 'PRINTED_ON_DOCUMENT' : 'STANDARD_GUIDELINE',
              flag: parsed.flag,
              page_number: chunk.page_number,
              source_chunk_id: chunk.chunk_id,
              source_snippet: line.trim(),
              extraction_confidence: parsed.confidence,
              needs_review: parsed.confidence < 0.85,
              recorded_date: recordedDate
            });
          }
        }
      }
    }

    return observations;
  }

  /**
   * Parses line for numerical value, unit, reference range, and flag
   */
  private static parseObservationLine(
    line: string,
    conceptDef: CanonicalConceptDef
  ): {
    rawName?: string;
    value: string | number;
    numericValue?: number;
    unit?: string;
    refLow?: number;
    refHigh?: number;
    refRangeText?: string;
    flag: ObservationRecord['flag'];
    confidence: number;
  } | null {
    // Regex looking for: TestName ... [Value] ... [Unit] ... [RefRange]
    // Example: "HbA1c : 6.8 % ( 4.0 - 5.6 ) HIGH"
    // Example: "Serum Creatinine | 1.1 | mg/dL | 0.7-1.3 | Normal"
    const numberMatches = line.match(/\b(\d+(?:\.\d+)?)\b/g);
    if (!numberMatches || numberMatches.length === 0) return null;

    const numericValue = parseFloat(numberMatches[0]);
    if (isNaN(numericValue)) return null;

    // Detect unit
    let unit = conceptDef.defaultUnit;
    const unitMatch = line.match(/\b(mg\/dL|g\/dL|mmol\/L|%|U\/L|10\^3\/mcL|uIU\/mL|mmHg|mcg\/dL|pg\/mL)\b/i);
    if (unitMatch) {
      unit = unitMatch[1];
    }

    // Detect Printed Reference Range (e.g. 70 - 99, < 100, 0.7 - 1.3)
    let refLow = conceptDef.defaultLow;
    let refHigh = conceptDef.defaultHigh;
    let refRangeText: string | undefined;

    const rangeMatch = line.match(/(?:ref(?:erence)?\s*(?:range)?|normal:?)?\s*[\(\[]?\s*(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*[\)\]]?/i);
    if (rangeMatch) {
      refLow = parseFloat(rangeMatch[1]);
      refHigh = parseFloat(rangeMatch[2]);
      refRangeText = `${refLow} - ${refHigh} ${unit}`;
    } else {
      const lessThanMatch = line.match(/<\s*(\d+(?:\.\d+)?)/);
      if (lessThanMatch) {
        refHigh = parseFloat(lessThanMatch[1]);
        refRangeText = `< ${refHigh} ${unit}`;
      }
    }

    // Determine Status Flag
    let flag: ObservationRecord['flag'] = 'within_range';
    if (/critical|panic|alert/i.test(line)) {
      flag = 'critical';
    } else if (/high|elevated|\bH\b|\bhigh\b/i.test(line) || (refHigh !== undefined && numericValue > refHigh)) {
      flag = (refHigh !== undefined && numericValue > refHigh * 1.5) ? 'critical' : 'high';
    } else if (/low|\bL\b|\blow\b/i.test(line) || (refLow !== undefined && numericValue < refLow)) {
      flag = 'low';
    }

    // Extraction confidence estimation
    let confidence = 0.88;
    if (line.includes('|') || line.includes('\t') || rangeMatch) confidence = 0.96;
    if (isNaN(numericValue) || numericValue <= 0) confidence = 0.65;

    return {
      value: numericValue,
      numericValue,
      unit,
      refLow,
      refHigh,
      refRangeText,
      flag,
      confidence
    };
  }
}
