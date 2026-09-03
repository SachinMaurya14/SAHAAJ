/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ V5 Machine Learning Engine Types
 * Pure TypeScript types for Model Artifacts, Feature Schemas, Evaluation Reports,
 * Calibration Curves, Local Attributions, and Quality Gates.
 */

export type ModelSystemDomain = 
  | 'Cardiovascular'
  | 'Metabolic & Diabetes'
  | 'Renal / CKD'
  | 'Hepatic / Liver'
  | 'Hypertension'
  | 'Anemia'
  | 'Metabolic Syndrome'
  | 'Respiratory'
  | 'Stroke';

export type ModelAlgorithmType = 
  | 'Logistic Regression'
  | 'Random Forest'
  | 'Gradient Boosting'
  | 'XGBoost-Equivalent Tree Ensemble'
  | 'Elastic-Net Regularized Regressor';

export type CalibrationMethod = 
  | 'Platt Scaling (Sigmoid)'
  | 'Isotonic Regression'
  | 'Beta Calibration'
  | 'Temperature Scaling';

export type FeatureValueType = 'number' | 'category' | 'boolean';

export type FeatureStatusType = 'AVAILABLE' | 'MISSING' | 'INVALID' | 'OUTDATED' | 'UNSUPPORTED';

export type FeatureDirection = 'elevating' | 'protective' | 'neutral';

export type UncertaintyStatus = 'calibrated' | 'moderate_uncertainty' | 'high_uncertainty' | 'out_of_distribution';

export interface FeatureSchemaDefinition {
  name: string;
  displayName: string;
  type: FeatureValueType;
  required: boolean;
  standardUnit: string;
  allowedUnits?: string[];
  unitConversion?: Record<string, number>; // multiplier to standard unit
  minVal?: number;
  maxVal?: number;
  categories?: string[];
  imputationStrategy: 'median' | 'mode' | 'zero' | 'missing_indicator';
  imputationValue: number | string;
  biologicalRole: string;
  defaultPrompt: string;
}

export interface ModelFeatureContribution {
  featureName: string;
  displayName: string;
  rawValue: number | string;
  normalizedValue: number;
  contribution: number; // SHAP value (log-odds impact)
  direction: FeatureDirection;
  percentageImpact: number; // Normalized contribution share
  biologicalRelevance: string;
  isMissing?: boolean;
}

export interface ModelEvaluationReport {
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  expectedCalibrationError: number; // ECE
  accuracy: number;
  sensitivity: number; // Recall
  specificity: number;
  f1Score: number;
  optimalThreshold: number;
  thresholdSelectionCriterion: string; // e.g. "Youden's J index (sensitivity 0.81, specificity 0.83)"
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  subgroupMetrics?: Array<{
    subgroup: string;
    sampleSize: number;
    rocAuc: number;
    sensitivity: number;
    specificity: number;
  }>;
  calibrationCurvePoints: Array<{
    meanPredictedProbability: number;
    fractionOfPositives: number;
    binCount: number;
  }>;
  candidateComparisons: Array<{
    algorithm: ModelAlgorithmType;
    rocAuc: number;
    prAuc: number;
    brierScore: number;
    f1Score: number;
    selected: boolean;
    selectionRationale: string;
  }>;
}

export interface MLModelArtifact {
  modelId: string;
  modelName: string;
  version: string;
  system: ModelSystemDomain;
  status: 'AVAILABLE' | 'RESEARCH_PROTOTYPE' | 'PENDING_VALIDATION';
  algorithm: ModelAlgorithmType;
  datasetName: string;
  datasetSource: string;
  datasetYear: string;
  sampleSize: number;
  targetDefinition: string;
  featureSchema: FeatureSchemaDefinition[];
  requiredFeatures: string[];
  optionalFeatures: string[];
  evaluation: ModelEvaluationReport;
  calibration: {
    method: CalibrationMethod;
    brierScore: number;
    ece: number;
    isCalibrated: boolean;
    sigmoidParams?: { a: number; b: number };
  };
  decisionThreshold: number;
  riskCategories: {
    lowMax: number;
    moderateMax: number;
    elevatedMax: number;
  };
  limitations: string[];
  populationDescription: string;
  biasConsiderations: string[];
  intendedUse: string;
  nonIntendedUse: string;
  // Linear / Logistic Model weights or Tree Ensemble splits
  modelParameters: {
    intercept: number;
    coefficients?: Record<string, number>;
    featureMeans?: Record<string, number>;
    featureStds?: Record<string, number>;
    treeEnsemble?: Array<{
      weight: number;
      feature: string;
      threshold: number;
      leftVal: number;
      rightVal: number;
    }>;
  };
  biologicalContextIds: string[];
  evidenceSourceIds: string[];
  trainingTimestamp: string;
}

export interface DataQualityValidationResult {
  isReady: boolean;
  status: 'READY' | 'INSUFFICIENT_DATA' | 'OUT_OF_DISTRIBUTION' | 'INVALID_INPUTS';
  completenessPercentage: number;
  availableFeatures: Array<{
    name: string;
    value: any;
    unit: string;
    source: string;
    sourceDocId?: string;
    sourcePage?: number;
    isOutdated?: boolean;
  }>;
  missingRequiredFeatures: Array<{
    name: string;
    displayName: string;
    unit: string;
    reason: string;
  }>;
  missingOptionalFeatures: Array<{
    name: string;
    displayName: string;
    unit: string;
  }>;
  invalidFeatures: Array<{
    name: string;
    value: any;
    error: string;
  }>;
  outOfDistributionWarnings: string[];
  conflictingValues: Array<{
    feature: string;
    sourceA: { name: string; value: any; date: string };
    sourceB: { name: string; value: any; date: string };
  }>;
}

export interface MLInferenceResult {
  assessmentId: string;
  modelId: string;
  modelName: string;
  modelVersion: string;
  system: ModelSystemDomain;
  status: 'SUCCESS' | 'ABSTAINED';
  abstentionReason?: string;
  rawScore: number; // log-odds / regression raw
  calibratedProbability: number; // 0.00 to 1.00
  formattedPercentage: string; // e.g. "18.2%"
  riskCategory: 'Low Signal' | 'Moderate Signal' | 'Elevated Signal' | 'High Signal' | 'Insufficient Data';
  decisionThreshold: number;
  confidenceInterval: [number, number]; // e.g. [14.5, 22.0]
  uncertaintyStatus: UncertaintyStatus;
  inputCompleteness: number; // 0 to 100
  featureContributions: ModelFeatureContribution[];
  baselineRisk: number; // Average population risk
  inputSnapshot: Record<string, { value: any; unit: string; source: string; normalizedValue: number }>;
  missingInputsUsedMedian: string[];
  dataQuality: DataQualityValidationResult;
  limitations: string[];
  biologicalContextIds: string[];
  evidenceIds: string[];
  timestamp: string;
  reproducibilityHash: string;
}

export interface MLSimulationResult {
  baselineAssessmentId: string;
  modelId: string;
  modelVersion: string;
  baselineProbability: number;
  simulatedProbability: number;
  probabilityDelta: number; // simulated - baseline
  baselineCategory: string;
  simulatedCategory: string;
  changedFeatures: Array<{
    feature: string;
    displayName: string;
    baselineValue: any;
    simulatedValue: any;
    unit: string;
    deltaImpact: number;
    direction: FeatureDirection;
  }>;
  disclaimer: string;
  timestamp: string;
}

export interface MLSensitivityPoint {
  featureValue: number;
  calibratedProbability: number;
  formattedPercentage: string;
  riskCategory: string;
}

export interface MLSensitivityAnalysisResult {
  modelId: string;
  featureName: string;
  displayName: string;
  unit: string;
  currentValue: number;
  currentProbability: number;
  sweepRange: [number, number];
  points: MLSensitivityPoint[];
}

export interface MLRiskChangeDecomposition {
  assessmentA: {
    id: string;
    date: string;
    modelVersion: string;
    probability: number;
    category: string;
  };
  assessmentB: {
    id: string;
    date: string;
    modelVersion: string;
    probability: number;
    category: string;
  };
  probabilityDelta: number;
  isModelVersionSame: boolean;
  modelVersionWarning?: string;
  featureDeltas: Array<{
    feature: string;
    displayName: string;
    unit: string;
    valA: any;
    valB: any;
    changeDirection: 'increased' | 'decreased' | 'unchanged';
    contributionDelta: number; // How much this change moved the model output
    direction: FeatureDirection;
    interpretation: string;
  }>;
  summaryExplanation: string;
}
