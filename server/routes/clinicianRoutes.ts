/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Clinician Intelligence & Workflow API Routes (V8)
 * Endpoints for clinical snapshot, briefing, structured synthesis, human-in-the-loop review,
 * patient explanation handoff, review queue, and clinical audit trail.
 */

import { Router, Request, Response } from 'express';
import { ClinicianEngine } from '../clinician/clinicianEngine';
import { storageEngine } from '../db/storageEngine';

export const clinicianRouter = Router();

// Helper to extract clinician ID and role
function getClinicianContext(req: Request) {
  const clinicianId = (req.headers['x-clinician-id'] as string) || (req.query.clinician_id as string) || 'dr-primary-clinician';
  const role = (req.headers['x-user-role'] as string) || 'CLINICIAN';
  return { clinicianId, role };
}

// 1. List Authorized Patients for Clinician
clinicianRouter.get('/patients', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const patients = storageEngine.listAuthorizedPatients(clinicianId);
    return res.json({
      clinicianId,
      totalCount: patients.length,
      patients
    });
  } catch (err: any) {
    console.error('List patients error:', err);
    return res.status(500).json({ error: 'Failed to list authorized patients', details: err.message });
  }
});

// 2. Get Clinical Snapshot for Patient
clinicianRouter.get('/patients/:patient_id/snapshot', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const patientId = req.params.patient_id;

    const snapshot = await ClinicianEngine.generateClinicalSnapshot(patientId, clinicianId);
    storageEngine.logAudit(clinicianId, 'CLINICAL_SNAPSHOT_ACCESSED', { patientId });

    return res.json(snapshot);
  } catch (err: any) {
    console.error('Clinical snapshot error:', err);
    return res.status(500).json({ error: 'Failed to generate clinical snapshot', details: err.message });
  }
});

// 3. Get Structured Clinical Briefing
clinicianRouter.get('/patients/:patient_id/briefing', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const patientId = req.params.patient_id;

    const briefing = await ClinicianEngine.generateClinicalBriefing(patientId, clinicianId);
    storageEngine.logAudit(clinicianId, 'CLINICAL_BRIEFING_GENERATED', { patientId });

    return res.json(briefing);
  } catch (err: any) {
    console.error('Clinical briefing error:', err);
    return res.status(500).json({ error: 'Failed to generate clinical briefing', details: err.message });
  }
});

// 4. Generate AI Clinical Synthesis Draft
clinicianRouter.post('/patients/:patient_id/synthesis', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const patientId = req.params.patient_id;
    const { customFocus } = req.body;

    const synthesis = await ClinicianEngine.generateClinicalSynthesis(patientId, clinicianId, customFocus);
    return res.status(201).json(synthesis);
  } catch (err: any) {
    console.error('Generate synthesis error:', err);
    return res.status(500).json({ error: 'Failed to generate clinical synthesis', details: err.message });
  }
});

// 5. Get Synthesis by ID
clinicianRouter.get('/syntheses/:synthesis_id', async (req: Request, res: Response) => {
  try {
    const synthesis = storageEngine.getClinicalSynthesis(req.params.synthesis_id);
    if (!synthesis) {
      return res.status(404).json({ error: 'Synthesis not found' });
    }
    return res.json(synthesis);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get synthesis', details: err.message });
  }
});

// 6. List Syntheses for Patient
clinicianRouter.get('/patients/:patient_id/syntheses', async (req: Request, res: Response) => {
  try {
    const syntheses = storageEngine.listClinicalSyntheses(req.params.patient_id);
    return res.json({ syntheses });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list syntheses', details: err.message });
  }
});

// 7. Update Section Status (Accept / Edit / Reject)
clinicianRouter.patch('/syntheses/:synthesis_id', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const { sectionKey, action, newContent, rejectionReason } = req.body;

    if (!sectionKey || !action) {
      return res.status(400).json({ error: 'Missing required parameters: sectionKey, action' });
    }

    const updated = ClinicianEngine.updateSectionStatus(
      req.params.synthesis_id,
      sectionKey,
      action,
      clinicianId,
      newContent,
      rejectionReason
    );

    return res.json(updated);
  } catch (err: any) {
    console.error('Update section error:', err);
    return res.status(500).json({ error: 'Failed to update synthesis section', details: err.message });
  }
});

// 8. Finalize & Approve Synthesis
clinicianRouter.post('/syntheses/:synthesis_id/approve', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const { visibility, notes } = req.body;

    const finalized = ClinicianEngine.finalizeSynthesis(
      req.params.synthesis_id,
      clinicianId,
      visibility || 'CLINICIAN_ONLY',
      notes
    );

    return res.json({
      message: 'Synthesis finalized and approved by clinician',
      synthesis: finalized
    });
  } catch (err: any) {
    console.error('Finalize error:', err);
    return res.status(500).json({ error: 'Failed to finalize synthesis', details: err.message });
  }
});

// 9. Generate Patient-Friendly Explanation ("Explain this to the patient")
clinicianRouter.post('/patient-explanations', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const { patientId, technicalFindingText, sourceFinding } = req.body;

    if (!patientId || !technicalFindingText) {
      return res.status(400).json({ error: 'Missing patientId or technicalFindingText' });
    }

    const draft = await ClinicianEngine.generatePatientExplanation(
      patientId,
      clinicianId,
      technicalFindingText,
      sourceFinding || 'Clinical Record Finding'
    );

    return res.status(201).json(draft);
  } catch (err: any) {
    console.error('Generate patient explanation error:', err);
    return res.status(500).json({ error: 'Failed to generate patient explanation', details: err.message });
  }
});

// 10. Share Patient Explanation with Patient
clinicianRouter.post('/patient-explanations/:explanation_id/share', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const { approvedText } = req.body;

    const shared = ClinicianEngine.sharePatientExplanation(
      req.params.explanation_id,
      clinicianId,
      approvedText
    );

    return res.json({
      message: 'Explanation approved and shared to patient portal',
      explanation: shared
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to share explanation', details: err.message });
  }
});

// 11. List Patient Explanations (with visibility scoping)
clinicianRouter.get('/patients/:patient_id/patient-explanations', async (req: Request, res: Response) => {
  try {
    const isPatient = req.headers['x-user-role'] === 'PATIENT';
    const explanations = storageEngine.listPatientExplanations(req.params.patient_id, isPatient);
    return res.json({ explanations });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list explanations', details: err.message });
  }
});

// 12. Create & List Clinician Notes (Private vs Patient-Visible)
clinicianRouter.post('/notes', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const { patientId, content, visibility, tags } = req.body;

    if (!patientId || !content) {
      return res.status(400).json({ error: 'Missing patientId or content' });
    }

    const note = {
      noteId: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      patientId,
      clinicianId,
      clinicianName: 'Dr. Aarav Medical Attending',
      content,
      visibility: visibility || 'CLINICIAN_ONLY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || ['General Note']
    };

    storageEngine.saveClinicianNote(note);
    storageEngine.logAudit(clinicianId, 'CLINICIAN_NOTE_SAVED', {
      noteId: note.noteId,
      patientId,
      visibility: note.visibility
    });

    return res.status(201).json(note);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save note', details: err.message });
  }
});

clinicianRouter.get('/patients/:patient_id/notes', async (req: Request, res: Response) => {
  try {
    const isPatient = req.headers['x-user-role'] === 'PATIENT';
    const notes = storageEngine.listClinicianNotes(req.params.patient_id, undefined, isPatient);
    return res.json({ notes });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list notes', details: err.message });
  }
});

// 13. Clinician Review Queue
clinicianRouter.get('/review-queue', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const queue = ClinicianEngine.getClinicianReviewQueue(clinicianId);
    return res.json({
      totalPending: queue.length,
      queue
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch review queue', details: err.message });
  }
});

// 14. Clinician Audit Trail
clinicianRouter.get('/audit', async (req: Request, res: Response) => {
  try {
    const { clinicianId } = getClinicianContext(req);
    const logs = storageEngine.getAuditLogs(clinicianId);
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch audit trail', details: err.message });
  }
});
