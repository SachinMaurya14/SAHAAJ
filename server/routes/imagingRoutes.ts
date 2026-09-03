/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ REST API v1 Imaging Routes (V6)
 * Endpoints for Medical Image Ingestion, Quality Pre-flight, Calibrated Deep Learning Inference,
 * Grad-CAM Saliency Overlays, Multimodal Report Comparison, Clinician Feedback, and DICOM Anonymization.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { storageEngine } from '../db/storageEngine';
import { VisionInferenceService } from '../cv/visionInferenceService';
import { ImageQualityService } from '../cv/imageQualityService';
import { VisionModelRegistry } from '../cv/registry';
import { MedicalModality, BodyRegion } from '../cv/types';

export const imagingRouter = Router();

function getUserId(req: Request): string {
  const headerUser = req.headers['x-user-id'] as string;
  return headerUser || req.query.user_id as string || 'patient-user-primary';
}

// 1. Upload and Analyze Image Study
imagingRouter.post('/studies', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { 
      filename, 
      imageBase64, 
      mimeType, 
      studyTitle, 
      modality, 
      bodyRegion, 
      indication, 
      modelId,
      reportText,
      studyDate
    } = req.body;

    if (!filename || !imageBase64) {
      return res.status(400).json({ error: 'filename and imageBase64 are required.' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
    const fileBuffer = Buffer.from(cleanBase64, 'base64');

    const studyRecord = await VisionInferenceService.analyzeImage(
      userId,
      fileBuffer,
      filename,
      mimeType || 'image/png',
      {
        studyTitle,
        modality: (modality as MedicalModality) || 'X-Ray',
        bodyRegion: (bodyRegion as BodyRegion) || 'Chest',
        indication,
        modelId,
        reportText,
        studyDate
      }
    );

    storageEngine.saveImagingStudy(studyRecord);

    return res.status(201).json({
      study: studyRecord,
      message: studyRecord.status === 'ABSTAINED' 
        ? 'Image quality failed pre-flight gate. Inference abstained.'
        : 'Image ingested, validated, and analyzed successfully.'
    });
  } catch (err: any) {
    console.error('Imaging upload error:', err);
    return res.status(500).json({ error: 'Failed to process medical image', details: err.message });
  }
});

// 2. List Image Studies for User
imagingRouter.get('/studies', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const studies = storageEngine.listImagingStudies(userId);
    return res.json({
      studies_count: studies.length,
      studies
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list imaging studies', details: err.message });
  }
});

// 3. Get Single Study Record
imagingRouter.get('/studies/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const study = storageEngine.getImagingStudy(req.params.id, userId);
    if (!study) return res.status(404).json({ error: 'Imaging study not found or unauthorized' });
    return res.json({ study });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch imaging study', details: err.message });
  }
});

// 4. Get Processing Status & Quality Summary
imagingRouter.get('/studies/:id/status', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const study = storageEngine.getImagingStudy(req.params.id, userId);
    if (!study) return res.status(404).json({ error: 'Imaging study not found' });
    return res.json({
      studyId: study.studyId,
      status: study.status,
      qualityMetrics: study.qualityMetrics,
      findingsCount: study.findings?.length || 0,
      hasGradCam: Boolean(study.gradCamHeatmapBase64),
      hasMultimodalComparison: Boolean(study.multimodalComparison)
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch status', details: err.message });
  }
});

// 5. Run Quality Pre-flight Check On Demand
imagingRouter.post('/studies/validate-raw', (req: Request, res: Response) => {
  try {
    const { filename, imageBase64, mimeType } = req.body;
    if (!filename || !imageBase64) {
      return res.status(400).json({ error: 'filename and imageBase64 are required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
    const fileBuffer = Buffer.from(cleanBase64, 'base64');

    const metrics = ImageQualityService.evaluateQuality(fileBuffer, filename, mimeType || 'image/png');
    return res.json({ qualityMetrics: metrics });
  } catch (err: any) {
    return res.status(500).json({ error: 'Quality validation failed', details: err.message });
  }
});

// 6. Get Model Registry Catalog
imagingRouter.get('/models', (req: Request, res: Response) => {
  try {
    const models = VisionModelRegistry.getModels();
    const modalities = VisionModelRegistry.listAvailableModalities();
    return res.json({
      models_count: models.length,
      models,
      modalities
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch vision models', details: err.message });
  }
});

// 7. Get Single Vision Model Card
imagingRouter.get('/models/:modelId', (req: Request, res: Response) => {
  try {
    const model = VisionModelRegistry.getModelById(req.params.modelId);
    if (!model) return res.status(404).json({ error: `Vision model ${req.params.modelId} not found` });
    return res.json({ model });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch model card', details: err.message });
  }
});

// 8. Get Candidate Algorithm Benchmarks for Model
imagingRouter.get('/models/:modelId/candidates', (req: Request, res: Response) => {
  try {
    const candidateData = VisionModelRegistry.getCandidateComparisons(req.params.modelId);
    if (!candidateData) return res.status(404).json({ error: 'Model not found' });
    return res.json({ candidateData });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch candidate benchmarks', details: err.message });
  }
});

// 9. Multimodal Report Comparison
imagingRouter.post('/studies/:id/compare-report', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { reportText, reportId } = req.body;

    if (!reportText) return res.status(400).json({ error: 'reportText is required' });

    const study = storageEngine.getImagingStudy(req.params.id, userId);
    if (!study) return res.status(404).json({ error: 'Imaging study not found' });

    // Clean base64 string to re-run with report
    const cleanBase64 = study.originalImageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
    const fileBuffer = Buffer.from(cleanBase64, 'base64');

    VisionInferenceService.analyzeImage(userId, fileBuffer, study.originalFilename, study.mimeType, {
      studyTitle: study.title,
      modality: study.modality,
      bodyRegion: study.bodyRegion,
      indication: study.indication,
      modelId: study.activeModelId,
      reportText,
      studyDate: study.studyDate
    }).then(updatedStudy => {
      storageEngine.saveImagingStudy(updatedStudy);
    });

    return res.json({ message: 'Multimodal report comparison initiated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compare with report', details: err.message });
  }
});

// 10. Add Clinician Annotation (Point, Box, Note)
imagingRouter.post('/studies/:id/annotations', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { type, coordinates, label, notes, authorRole } = req.body;

    const study = storageEngine.getImagingStudy(req.params.id, userId);
    if (!study) return res.status(404).json({ error: 'Study not found' });

    const annotation = {
      annotationId: `ann-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      studyId: req.params.id,
      userId,
      type: type || 'point',
      coordinates: coordinates || { x: 50, y: 50 },
      label: label || 'ROI Finding',
      notes: notes || '',
      authorRole: authorRole || 'clinician',
      createdAt: new Date().toISOString()
    };

    storageEngine.saveImagingAnnotation(annotation);
    return res.status(201).json({ annotation });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save annotation', details: err.message });
  }
});

// 11. List Annotations for Study
imagingRouter.get('/studies/:id/annotations', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const annotations = storageEngine.listImagingAnnotations(req.params.id, userId);
    return res.json({ annotations });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch annotations', details: err.message });
  }
});

// 12. Submit Clinician Feedback on AI Finding
imagingRouter.post('/studies/:id/feedback', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { findingLabel, clinicianDecision, comments } = req.body;

    if (!findingLabel || !clinicianDecision) {
      return res.status(400).json({ error: 'findingLabel and clinicianDecision are required' });
    }

    const feedback = {
      feedbackId: `fb-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      studyId: req.params.id,
      userId,
      findingLabel,
      clinicianDecision,
      comments: comments || '',
      submittedAt: new Date().toISOString()
    };

    storageEngine.saveImagingFeedback(feedback);
    return res.status(201).json({ feedback, message: 'Feedback recorded successfully for audit provenance.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record feedback', details: err.message });
  }
});

// 13. Delete Imaging Study
imagingRouter.delete('/studies/:id', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const success = storageEngine.deleteImagingStudy(req.params.id, userId);
    if (!success) return res.status(404).json({ error: 'Study not found or unauthorized' });
    return res.json({ success: true, message: 'Study and all derived heatmaps deleted cleanly.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete study', details: err.message });
  }
});
