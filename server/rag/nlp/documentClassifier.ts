/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinical Document Type Classifier
 * Classifies medical reports into clinical specialties and functional document archetypes.
 */

import { DocumentTypeCategory, DocumentTypeClassificationResult } from './types';

interface ClassifierRule {
  type: DocumentTypeCategory;
  strongKeywords: RegExp[];
  supportingKeywords: RegExp[];
  specialtyTag: string;
}

const DOCUMENT_RULES: ClassifierRule[] = [
  {
    type: 'Laboratory',
    strongKeywords: [/\b(?:laboratory\s+report|pathology\s+and\s+laboratory|biochemistry|hematology|complete\s+blood\s+count|lipid\s+profile|reference\s+range|specimen\s+type)\b/i],
    supportingKeywords: [/\b(?:mg\/dl|mmol\/l|u\/l|g\/dl|µiu\/ml|serum|plasma|fasting)\b/i],
    specialtyTag: 'Laboratory Medicine'
  },
  {
    type: 'Radiology',
    strongKeywords: [/\b(?:x-ray|computed\s+tomography|ct\s+scan|mri|magnetic\s+resonance|ultrasound|sonography|radiology\s+report|chest\s+radiograph)\b/i],
    supportingKeywords: [/\b(?:technique|impression|findings|no\s+focal\s+consolidation|contrast|radiologist|sagittal|axial)\b/i],
    specialtyTag: 'Diagnostic Radiology'
  },
  {
    type: 'Pathology',
    strongKeywords: [/\b(?:surgical\s+pathology|histopathology|biopsy\s+report|cytology|gross\s+description|microscopic\s+examination)\b/i],
    supportingKeywords: [/\b(?:malignancy|staining|carcinoma|dysplasia|margin|specimen)\b/i],
    specialtyTag: 'Anatomical Pathology'
  },
  {
    type: 'Prescription',
    strongKeywords: [/\b(?:prescription|rx\b|medication\s+order|take\s+\d+\s+tablet|sig:|dispense)\b/i],
    supportingKeywords: [/\b(?:po\s+daily|bid|tid|qid|prn|capsule|tablet|oral)\b/i],
    specialtyTag: 'Pharmacotherapy'
  },
  {
    type: 'Discharge Summary',
    strongKeywords: [/\b(?:discharge\s+summary|discharge\s+instructions|hospital\s+course|admission\s+date|discharge\s+date)\b/i],
    supportingKeywords: [/\b(?:admitted\s+with|condition\s+on\s+discharge|discharge\s+medications|follow[\s-]?up\s+with)\b/i],
    specialtyTag: 'Inpatient Medicine'
  },
  {
    type: 'Cardiology',
    strongKeywords: [/\b(?:echocardiogram|ecg|electrocardiogram|cardiology\s+consultation|ejection\s+fraction|coronary\s+angiography)\b/i],
    supportingKeywords: [/\b(?:left\s+ventricle|sinus\s+rhythm|stenosis|valvular|troponin)\b/i],
    specialtyTag: 'Cardiovascular Medicine'
  },
  {
    type: 'Clinical Note',
    strongKeywords: [/\b(?:clinical\s+note|progress\s+note|outpatient\s+visit|consultation\s+note|soap\s+note|clinic\s+visit)\b/i],
    supportingKeywords: [/\b(?:chief\s+complaint|history\s+of\s+present\s+illness|assessment\s+and\s+plan|vital\s+signs)\b/i],
    specialtyTag: 'General Medicine'
  }
];

export class DocumentTypeClassifier {
  public static classify(fullText: string): DocumentTypeClassificationResult {
    const text = fullText || '';
    let bestType: DocumentTypeCategory = 'Other';
    let maxScore = 0;
    const detectedSpecialties: string[] = [];
    const detectedFeatures: string[] = [];

    for (const rule of DOCUMENT_RULES) {
      let score = 0;

      for (const strong of rule.strongKeywords) {
        const matches = text.match(strong);
        if (matches) {
          score += 3.0;
          detectedFeatures.push(matches[0]);
        }
      }

      for (const supp of rule.supportingKeywords) {
        const matches = text.match(supp);
        if (matches) {
          score += 1.0;
          if (!detectedFeatures.includes(matches[0])) {
            detectedFeatures.push(matches[0]);
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestType = rule.type;
        if (!detectedSpecialties.includes(rule.specialtyTag)) {
          detectedSpecialties.push(rule.specialtyTag);
        }
      }
    }

    const confidence = Math.min(0.98, Math.max(0.55, maxScore > 0 ? (maxScore / (maxScore + 2.0)) : 0.50));

    return {
      document_type: maxScore >= 2.0 ? bestType : 'Other',
      confidence: Math.round(confidence * 100) / 100,
      detected_specialties: detectedSpecialties.length > 0 ? detectedSpecialties : ['General Healthcare'],
      model_version: 'saahaj-doc-classifier-v4.1.0',
      features: detectedFeatures.slice(0, 8)
    };
  }
}
