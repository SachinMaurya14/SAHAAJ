/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinical Timeline Event Extraction Engine
 * Converts document-derived facts into structured, chronological timeline events.
 * Retains clinical encounter dates, assertion status, and provenance links.
 */

import { MedicalEntity, DocumentTimelineEvent, StructuredHealthFact } from './types';

export class TimelineExtractor {
  public static extractTimelineEvents(
    documentId: string,
    userId: string,
    reportDate: string | undefined,
    uploadDate: string,
    entities: MedicalEntity[],
    facts: StructuredHealthFact[]
  ): DocumentTimelineEvent[] {
    const events: DocumentTimelineEvent[] = [];
    const encounterDate = reportDate || new Date().toISOString().split('T')[0];

    // 1. Group entities by clinical category to form cohesive timeline milestones
    const meds = entities.filter(e => e.entity_type === 'MEDICATION' && e.assertion !== 'ABSENT');
    const labs = facts.filter(f => f.numeric_value !== undefined && f.assertion === 'PRESENT');
    const conditions = entities.filter(e => (e.entity_type === 'CONDITION' || e.entity_type === 'DIAGNOSIS_TERM'));
    const procedures = entities.filter(e => e.entity_type === 'PROCEDURE');
    const imaging = entities.filter(e => e.entity_type === 'IMAGING_FINDING');

    // Add Lab Summary Event if labs present
    if (labs.length > 0) {
      const topLabs = labs.slice(0, 4).map(l => `${l.canonical_concept}: ${l.value} ${l.unit}`).join(', ');
      events.push({
        event_id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        document_id: documentId,
        user_id: userId,
        event_date: encounterDate,
        upload_date: uploadDate,
        event_type: 'LAB_TEST',
        title: `Diagnostic Lab Evaluation (${labs.length} markers)`,
        description: `Laboratory assessment recorded: ${topLabs}${labs.length > 4 ? ` and ${labs.length - 4} more` : ''}.`,
        assertion: 'PRESENT',
        temporality: 'current',
        page_number: labs[0]?.page || 1,
        section: labs[0]?.section || 'Laboratory Results',
        source_text: labs.map(l => l.source_text).slice(0, 3).join(' | '),
        confidence: 0.95,
        status: 'active',
        related_fact_ids: labs.map(l => l.fact_id)
      });
    }

    // Add Medications
    for (const med of meds) {
      const doseAttr = med.attributes?.dosage ? ` (${med.attributes.dosage})` : '';
      events.push({
        event_id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        document_id: documentId,
        user_id: userId,
        event_date: encounterDate,
        upload_date: uploadDate,
        event_type: 'MEDICATION_STARTED',
        title: `Medication Documented: ${med.canonical_name}${doseAttr}`,
        description: `Documented in ${med.section}: ${med.text}${med.attributes?.frequency ? ` - ${med.attributes.frequency}` : ''}.`,
        assertion: med.assertion,
        temporality: med.temporality,
        page_number: med.page_number,
        section: med.section,
        source_text: med.text,
        confidence: med.confidence,
        status: med.assertion === 'PRESENT' ? 'active' : 'historical'
      });
    }

    // Add Conditions
    for (const cond of conditions) {
      let titlePrefix = 'Condition Noted';
      let status: DocumentTimelineEvent['status'] = 'active';
      if (cond.assertion === 'FAMILY_HISTORY') {
        titlePrefix = 'Family History Noted';
        status = 'historical';
      } else if (cond.assertion === 'HISTORICAL') {
        titlePrefix = 'Historical Condition';
        status = 'historical';
      } else if (cond.assertion === 'ABSENT') {
        titlePrefix = 'Condition Excluded / Negated';
        status = 'negated';
      }

      events.push({
        event_id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        document_id: documentId,
        user_id: userId,
        event_date: encounterDate,
        upload_date: uploadDate,
        event_type: cond.temporality === 'historical' ? 'CONDITION_HISTORICALLY_NOTED' : 'CLINICAL_ENCOUNTER',
        title: `${titlePrefix}: ${cond.canonical_name}`,
        description: `Mentioned in ${cond.section}: "${cond.text}" with assertion ${cond.assertion}.`,
        assertion: cond.assertion,
        temporality: cond.temporality,
        page_number: cond.page_number,
        section: cond.section,
        source_text: cond.text,
        confidence: cond.confidence,
        status
      });
    }

    // Add Procedures
    for (const proc of procedures) {
      events.push({
        event_id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        document_id: documentId,
        user_id: userId,
        event_date: encounterDate,
        upload_date: uploadDate,
        event_type: 'PROCEDURE_PERFORMED',
        title: `Procedure: ${proc.canonical_name}`,
        description: `Documented in ${proc.section}: "${proc.text}".`,
        assertion: proc.assertion,
        temporality: proc.temporality,
        page_number: proc.page_number,
        section: proc.section,
        source_text: proc.text,
        confidence: proc.confidence,
        status: 'active'
      });
    }

    // Add Imaging Findings
    for (const img of imaging) {
      events.push({
        event_id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        document_id: documentId,
        user_id: userId,
        event_date: encounterDate,
        upload_date: uploadDate,
        event_type: 'IMAGING_PERFORMED',
        title: `Imaging Finding: ${img.canonical_name}`,
        description: `Documented in ${img.section}: "${img.text}" (Assertion: ${img.assertion}).`,
        assertion: img.assertion,
        temporality: img.temporality,
        page_number: img.page_number,
        section: img.section,
        source_text: img.text,
        confidence: img.confidence,
        status: img.assertion === 'ABSENT' ? 'negated' : 'active'
      });
    }

    return events;
  }
}
