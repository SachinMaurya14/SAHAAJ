/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Computer Vision & Medical Imaging Architecture (V6)
 * Type Definitions for Vision Deep Learning, DICOM Ingestion, Quality Checks,
 * Model Registry, Multi-label Predictions, Grad-CAM Explainability, and Multimodal Comparisons.
 */

export type MedicalModality = 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound';
export type BodyRegion = 'Chest' | 'Brain' | 'Musculoskeletal' | 'Abdomen' | 'Spine' | 'Pelvis';

export type ImageProcessingStatus = 
  | 'UPLOADED'
  | 'VALIDATING'
  | 'QUALITY_CHECK'
  | 'PREPROCESSING'
  | 'INFERENCE'
  | 'EXPLANATION'
  | 'READY'
  | 'FAILED'
  | 'ABSTAINED';

export type QualityGrade = 'EXCELLENT' | 'ACCEPTABLE' | 'DEGRADED' | 'ABSTAINED';

export interface ImageDimensions {
  width: number;
  height: number;
  channels: number;
  aspectRatio: number;
}

export interface ImageQualityMetrics {
  status: QualityGrade;
  blurVariance: number;          // Laplacian variance metric (higher = sharper)
  meanBrightness: number;        // 0 to 255
  contrastRatio: number;         // Standard deviation of pixel intensities
  dynamicRangePercent: number;   // Percentage of dynamic range utilized (0 to 100)
  exposureCategory: 'under_exposed' | 'optimal' | 'over_exposed';
  noiseLevelEstimate: number;    // High-frequency noise estimation
  warnings: string[];
  isAbstained: boolean;
  abstentionReason?: string;
  technicalMetadata: {
    fileFormat: string;
    fileSizeBytes: number;
    dimensions: ImageDimensions;
    colorSpace: 'grayscale' | 'rgb' | 'rgba';
    preprocessingVersion: string;
    timestamp: string;
  };
}

export interface DicomMetadata {
  sopInstanceUID?: string;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
  modality: MedicalModality;
  bodyPartExamined: BodyRegion;
  viewPosition?: 'PA' | 'AP' | 'LATERAL' | 'OBLIQUE';
  patientOrientation?: string;
  photometricInterpretation?: string;
  rows?: number;
  columns?: number;
  bitsAllocated?: number;
  bitsStored?: number;
  windowCenter?: number;
  windowWidth?: number;
  rescaleIntercept?: number;
  rescaleSlope?: number;
  sliceThicknessMm?: number;
  pixelSpacingMm?: [number, number];
  isAnonymized: boolean;
  anonymizationTimestamp?: string;
}

export type VisionArchitecture = 
  | 'DenseNet-121'
  | 'ResNet-50'
  | 'EfficientNet-B4'
  | 'Vision-Transformer (ViT-B/16)'
  | 'U-Net (Scaffold)'
  | '3D-CNN (CT/MRI Scaffold)';

export interface VisionModelEvaluationMetrics {
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  expectedCalibrationError: number;
  sensitivity: number;
  specificity: number;
  f1Score: number;
  optimalThreshold: number;
  cohortSize: number;
  crossValidationFolds: number;
  perClassMetrics: Record<string, {
    rocAuc: number;
    prAuc: number;
    sensitivity: number;
    specificity: number;
    threshold: number;
    positivePrevalence: number;
  }>;
  candidateComparisons: Array<{
    algorithm: VisionArchitecture;
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    latencyMs: number;
    notes: string;
  }>;
  subgroupPerformance: Array<{
    subgroup: string;
    sampleSize: number;
    rocAuc: number;
    sensitivity: number;
    specificity: number;
  }>;
}

export interface VisionModelArtifact {
  modelId: string;
  modelName: string;
  version: string;
  modality: MedicalModality;
  bodyRegion: BodyRegion;
  task: 'Multi-label Abnormality Screening' | 'Lesion Detection (Scaffold)' | 'Volumetric Organ Segmentation (Scaffold)';
  architecture: VisionArchitecture;
  inputSize: [number, number]; // e.g. [512, 512] or [224, 224]
  preprocessingVersion: string;
  outputLabels: string[];
  trainingDataset: {
    name: string;
    source: string;
    license: string;
    patientCount: number;
    imageCount: number;
    splitStrategy: string; // e.g. 'Patient-level stratified holdout (80/10/10)'
    populationContext: string;
  };
  evaluation: VisionModelEvaluationMetrics;
  calibrationMethod: 'Platt Sigmoid Calibration' | 'Temperature Scaling' | 'Isotonic Regression';
  explainabilityMethod: 'Grad-CAM' | 'Grad-CAM++' | 'Integrated Gradients';
  targetFeatureLayer: string; // e.g. 'features.denseblock4.denselayer16.conv2'
  status: 'PRODUCTION_ACTIVE' | 'EXPERIMENTAL' | 'DEPRECATED';
  releaseDate: string;
  limitations: string[];
  intendedUse: string;
  nonIntendedUse: string;
}

export interface GradCamExplanation {
  method: 'Grad-CAM' | 'Grad-CAM++';
  modelId: string;
  modelVersion: string;
  targetFinding: string;
  targetLayer: string;
  heatmapBase64?: string;
  heatmapGrid: number[][]; // 2D normalized intensity map [0.0 - 1.0] for client rendering
  activeFocalPoints: Array<{
    xPercent: number;
    yPercent: number;
    intensity: number;
    anatomicalRegionHint: string;
  }>;
  timestamp: string;
  disclaimer: string;
}

export interface ImagingFinding {
  findingId: string;
  label: string;
  displayName: string;
  calibratedProbability: number; // 0.0 to 1.0
  formattedPercentage: string;    // e.g. "24.5%"
  decisionThreshold: number;     // e.g. 0.22
  status: 'ELEVATED_SIGNAL' | 'WITHIN_BASELINE' | 'BORDERLINE' | 'UNASSESSED';
  confidenceInterval: [number, number]; // 95% conformal bounds
  clinicalImplication: string;
  anatomicalLocation?: string;   // Only if model actually supports localization
  biologicalMechanism: string;
  explainabilityAvailable: boolean;
}

export interface MultimodalReportComparison {
  studyId: string;
  reportId?: string;
  comparisonStatus: 'FULL_AGREEMENT' | 'ADDITIONAL_MODEL_SIGNAL' | 'POTENTIAL_DISCREPANCY' | 'INSUFFICIENT_EVIDENCE' | 'NO_REPORT_LINKED';
  summary: string;
  itemComparisons: Array<{
    findingLabel: string;
    modelProbability: number;
    modelStatus: string;
    reportWording?: string;
    reportAssertion?: 'positive' | 'negated' | 'uncertain' | 'absent';
    alignment: 'agrees' | 'diverges' | 'unmentioned';
    explanation: string;
  }>;
  clinicalGuidance: string;
}

export interface ImagingStudyRecord {
  studyId: string;
  userId: string;
  title: string;
  modality: MedicalModality;
  bodyRegion: BodyRegion;
  indication?: string;
  studyDate: string;
  status: ImageProcessingStatus;
  
  // Storage assets
  originalAssetId: string;
  originalImageBase64: string; // Stored securely
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  imageDimensions: ImageDimensions;
  
  // Derived artifacts
  thumbnailBase64?: string;
  normalizedImageBase64?: string;
  gradCamHeatmapBase64?: string;
  
  // Quality & DICOM
  qualityMetrics?: ImageQualityMetrics;
  dicomMetadata?: DicomMetadata;
  
  // Inference results
  activeModelId?: string;
  activeModelVersion?: string;
  findings: ImagingFinding[];
  primaryExplanation?: GradCamExplanation;
  multimodalComparison?: MultimodalReportComparison;
  
  // Provenance & Audit
  provenance: {
    imageSha256: string;
    preprocessingVersion: string;
    inferenceTimestamp?: string;
    pipelineVersion: string;
    isAnonymized: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface ImagingAnnotationRecord {
  annotationId: string;
  studyId: string;
  userId: string;
  type: 'point' | 'bounding_box' | 'region' | 'clinical_note';
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  label: string;
  notes: string;
  authorRole: 'clinician' | 'radiologist' | 'user';
  createdAt: string;
}

export interface ImagingFeedbackRecord {
  feedbackId: string;
  studyId: string;
  userId: string;
  findingLabel: string;
  clinicianDecision: 'AGREE' | 'DISAGREE' | 'NEEDS_SECOND_OPINION';
  comments: string;
  submittedAt: string;
}
