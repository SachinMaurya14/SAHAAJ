/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinical Section Classifier & Hierarchy Engine
 * Maps document headings and zones to standardized clinical section taxonomy.
 */

import { ClinicalSectionType } from './types';

interface SectionRule {
  pattern: RegExp;
  type: ClinicalSectionType;
  priority: number;
}

const SECTION_RULES: SectionRule[] = [
  // Chief Complaint
  { pattern: /\b(?:chief\s+complaint|cc|reason\s+for\s+visit|presenting\s+complaint)\b/i, type: 'CHIEF_COMPLAINT', priority: 10 },
  // HPI
  { pattern: /\b(?:history\s+of\s+present\s+illness|hpi|history\s+of\s+presenting\s+complaint)\b/i, type: 'HISTORY_OF_PRESENT_ILLNESS', priority: 10 },
  // Past Medical History
  { pattern: /\b(?:past\s+medical\s+history|pmhx|past\s+history|medical\s+history|prior\s+history)\b/i, type: 'PAST_MEDICAL_HISTORY', priority: 10 },
  // Family History
  { pattern: /\b(?:family\s+history|fam\s+hx|family\s+medical\s+history)\b/i, type: 'FAMILY_HISTORY', priority: 12 },
  // Social History
  { pattern: /\b(?:social\s+history|soc\s+hx|tobacco\s+history|habits|substance\s+use)\b/i, type: 'SOCIAL_HISTORY', priority: 10 },
  // Medications
  { pattern: /\b(?:medications?|meds|current\s+medications|medication\s+list|rx|prescriptions?|discharge\s+medications)\b/i, type: 'MEDICATIONS', priority: 11 },
  // Allergies
  { pattern: /\b(?:allergies|allergies\s+and\s+adverse\s+reactions|nkda|adverse\s+drug\s+reactions)\b/i, type: 'ALLERGIES', priority: 12 },
  // Review of Systems
  { pattern: /\b(?:review\s+of\s+systems|ros)\b/i, type: 'REVIEW_OF_SYSTEMS', priority: 9 },
  // Physical Exam
  { pattern: /\b(?:physical\s+examination|physical\s+exam|pe|objective\s+findings|on\s+examination)\b/i, type: 'PHYSICAL_EXAMINATION', priority: 9 },
  // Vital Signs
  { pattern: /\b(?:vital\s+signs?|vitals?)\b/i, type: 'VITAL_SIGNS', priority: 10 },
  // Laboratory Results
  { pattern: /\b(?:laboratory\s+results?|lab\s+results?|labs?|biochemistry|hematology|complete\s+blood\s+count|lipid\s+profile|metabolic\s+panel|urinalysis)\b/i, type: 'LABORATORY_RESULTS', priority: 10 },
  // Radiology Technique
  { pattern: /\b(?:technique|protocol|examination\s+type|modality)\b/i, type: 'IMAGING_TECHNIQUE', priority: 9 },
  // Radiology Findings
  { pattern: /\b(?:findings|imaging\s+findings|radiological\s+findings|observations)\b/i, type: 'IMAGING_FINDINGS', priority: 10 },
  // Radiology Impression (Highest Priority for Imaging)
  { pattern: /\b(?:impression|conclusion|diagnostic\s+impression|summary\s+of\s+findings|opinion)\b/i, type: 'IMAGING_IMPRESSION', priority: 15 },
  // Imaging Recommendations
  { pattern: /\b(?:imaging\s+recommendations?|recommendations?|advice|suggested\s+follow-up)\b/i, type: 'IMAGING_RECOMMENDATIONS', priority: 10 },
  // Pathology
  { pattern: /\b(?:gross\s+description|microscopic\s+description|specimen)\b/i, type: 'PATHOLOGY_SPECIMEN', priority: 10 },
  { pattern: /\b(?:pathologic\s+diagnosis|final\s+diagnosis|histopathology\s+report)\b/i, type: 'PATHOLOGY_DIAGNOSIS', priority: 11 },
  // Assessment and Plan
  { pattern: /\b(?:assessment\s+and\s+plan|assessment|plan|clinical\s+impression\s+and\s+plan|a\/p)\b/i, type: 'ASSESSMENT_AND_PLAN', priority: 10 },
  // Discharge Summary
  { pattern: /\b(?:discharge\s+summary|discharge\s+instructions|hospital\s+course|condition\s+on\s+discharge)\b/i, type: 'DISCHARGE_SUMMARY', priority: 10 }
];

export class SectionClassifier {
  /**
   * Classifies a heading or text line into a standardized ClinicalSectionType
   */
  public static classifySection(heading: string): { type: ClinicalSectionType; confidence: number } {
    const cleanHeading = heading.trim();
    if (!cleanHeading) {
      return { type: 'OTHER', confidence: 0.5 };
    }

    for (const rule of SECTION_RULES) {
      if (rule.pattern.test(cleanHeading)) {
        return { type: rule.type, confidence: 0.92 };
      }
    }

    return { type: 'OTHER', confidence: 0.6 };
  }

  /**
   * Identifies section type based on chunk header or text content
   */
  public static inferSectionFromContent(text: string, currentSection: string): ClinicalSectionType {
    if (currentSection && currentSection !== 'General' && currentSection !== 'Document Body') {
      const direct = this.classifySection(currentSection);
      if (direct.type !== 'OTHER') return direct.type;
    }

    // Check first 100 characters for explicit section marker
    const firstLines = text.substring(0, 150);
    const classified = this.classifySection(firstLines);
    return classified.type;
  }
}
