/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinical Relation Extraction Engine
 * Extracts semantic links between medical entities based on syntactic adjacency,
 * table row-column bindings, and clinical discourse patterns.
 */

import { MedicalEntity, ClinicalRelation } from './types';

export class RelationExtractor {
  public static extractRelations(
    entities: MedicalEntity[],
    documentId: string,
    modelName: string = 'saahaj-relation-engine-v4',
    modelVersion: string = '1.0.0'
  ): ClinicalRelation[] {
    const relations: ClinicalRelation[] = [];
    const entityMap = new Map<string, MedicalEntity>();
    entities.forEach(e => entityMap.set(e.entity_id, e));

    // Group entities by page and chunk
    const chunkGroups = new Map<string, MedicalEntity[]>();
    for (const ent of entities) {
      const key = `${ent.page_number}-${ent.chunk_id}`;
      if (!chunkGroups.has(key)) chunkGroups.set(key, []);
      chunkGroups.get(key)!.push(ent);
    }

    for (const [, group] of chunkGroups) {
      // 1. Lab Test -> Value / Unit / Range
      const labTests = group.filter(e => e.entity_type === 'LAB_TEST');
      const labValues = group.filter(e => e.entity_type === 'LAB_VALUE');
      const units = group.filter(e => e.entity_type === 'UNIT');
      const ranges = group.filter(e => e.entity_type === 'REFERENCE_RANGE');

      for (const test of labTests) {
        // Nearest value following test or on same table row
        const nearestVal = this.findNearestEntity(test, labValues, 80);
        if (nearestVal) {
          relations.push({
            relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            document_id: documentId,
            source_entity_id: test.entity_id,
            source_text: test.text,
            target_entity_id: nearestVal.entity_id,
            target_text: nearestVal.text,
            relation_type: 'has_value',
            confidence: 0.94,
            model_name: modelName,
            model_version: modelVersion
          });

          // Nearest unit following value
          const nearestUnit = this.findNearestEntity(nearestVal, units, 30);
          if (nearestUnit) {
            relations.push({
              relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              document_id: documentId,
              source_entity_id: test.entity_id,
              source_text: test.text,
              target_entity_id: nearestUnit.entity_id,
              target_text: nearestUnit.text,
              relation_type: 'has_unit',
              confidence: 0.92,
              model_name: modelName,
              model_version: modelVersion
            });
          }

          // Nearest range
          const nearestRange = this.findNearestEntity(test, ranges, 120);
          if (nearestRange) {
            relations.push({
              relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              document_id: documentId,
              source_entity_id: test.entity_id,
              source_text: test.text,
              target_entity_id: nearestRange.entity_id,
              target_text: nearestRange.text,
              relation_type: 'has_reference_range',
              confidence: 0.90,
              model_name: modelName,
              model_version: modelVersion
            });
          }
        }
      }

      // 2. Medication -> Dosage / Frequency / Route
      const medications = group.filter(e => e.entity_type === 'MEDICATION');
      const dosages = group.filter(e => e.entity_type === 'DOSAGE');
      const frequencies = group.filter(e => e.entity_type === 'FREQUENCY');
      const routes = group.filter(e => e.entity_type === 'ROUTE');

      for (const med of medications) {
        const nearestDose = this.findNearestEntity(med, dosages, 40);
        if (nearestDose) {
          relations.push({
            relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            document_id: documentId,
            source_entity_id: med.entity_id,
            source_text: med.text,
            target_entity_id: nearestDose.entity_id,
            target_text: nearestDose.text,
            relation_type: 'has_dose',
            confidence: 0.93,
            model_name: modelName,
            model_version: modelVersion
          });
        }

        const nearestFreq = this.findNearestEntity(med, frequencies, 60);
        if (nearestFreq) {
          relations.push({
            relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            document_id: documentId,
            source_entity_id: med.entity_id,
            source_text: med.text,
            target_entity_id: nearestFreq.entity_id,
            target_text: nearestFreq.text,
            relation_type: 'has_frequency',
            confidence: 0.91,
            model_name: modelName,
            model_version: modelVersion
          });
        }
      }

      // 3. Symptom -> Duration / Body Site
      const symptoms = group.filter(e => e.entity_type === 'SYMPTOM');
      const durations = group.filter(e => e.entity_type === 'DURATION');
      const bodySites = group.filter(e => e.entity_type === 'BODY_SITE' || e.entity_type === 'ANATOMICAL_STRUCTURE');

      for (const sym of symptoms) {
        const nearestDur = this.findNearestEntity(sym, durations, 50);
        if (nearestDur) {
          relations.push({
            relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            document_id: documentId,
            source_entity_id: sym.entity_id,
            source_text: sym.text,
            target_entity_id: nearestDur.entity_id,
            target_text: nearestDur.text,
            relation_type: 'has_duration',
            confidence: 0.90,
            model_name: modelName,
            model_version: modelVersion
          });
        }

        const nearestSite = this.findNearestEntity(sym, bodySites, 40);
        if (nearestSite) {
          relations.push({
            relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            document_id: documentId,
            source_entity_id: sym.entity_id,
            source_text: sym.text,
            target_entity_id: nearestSite.entity_id,
            target_text: nearestSite.text,
            relation_type: 'located_at',
            confidence: 0.89,
            model_name: modelName,
            model_version: modelVersion
          });
        }
      }

      // 4. Imaging Finding -> Body Site
      const imagingFindings = group.filter(e => e.entity_type === 'IMAGING_FINDING');
      for (const finding of imagingFindings) {
        const nearestSite = this.findNearestEntity(finding, bodySites, 50);
        if (nearestSite) {
          relations.push({
            relation_id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            document_id: documentId,
            source_entity_id: finding.entity_id,
            source_text: finding.text,
            target_entity_id: nearestSite.entity_id,
            target_text: nearestSite.text,
            relation_type: 'located_at',
            confidence: 0.92,
            model_name: modelName,
            model_version: modelVersion
          });
        }
      }
    }

    return relations;
  }

  private static findNearestEntity(
    anchor: MedicalEntity,
    candidates: MedicalEntity[],
    maxCharDistance: number
  ): MedicalEntity | null {
    let bestMatch: MedicalEntity | null = null;
    let minDistance = Infinity;

    for (const cand of candidates) {
      if (cand.entity_id === anchor.entity_id) continue;
      // Distance between spans
      const dist = cand.start_offset >= anchor.end_offset
        ? cand.start_offset - anchor.end_offset
        : anchor.start_offset - cand.end_offset;

      if (dist >= 0 && dist < maxCharDistance && dist < minDistance) {
        minDistance = dist;
        bestMatch = cand;
      }
    }

    return bestMatch;
  }
}
