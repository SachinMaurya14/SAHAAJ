/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Vision Model Registry
 * Central registry for calibrated deep learning models, training dataset provenance,
 * benchmark evaluations, and multi-modal screening architectures.
 */

import { VisionModelArtifact, MedicalModality, BodyRegion } from './types';
import { ALL_VISION_MODEL_ARTIFACTS, CHEST_XRAY_DENSENET121_V1 } from './artifacts/visionModelArtifacts';

export class VisionModelRegistry {
  private static models: Map<string, VisionModelArtifact> = new Map();

  static {
    for (const artifact of ALL_VISION_MODEL_ARTIFACTS) {
      this.models.set(artifact.modelId, artifact);
    }
  }

  public static getModels(): VisionModelArtifact[] {
    return Array.from(this.models.values());
  }

  public static getModelById(modelId: string): VisionModelArtifact | null {
    return this.models.get(modelId) || null;
  }

  public static getDefaultModel(modality: MedicalModality = 'X-Ray', bodyRegion: BodyRegion = 'Chest'): VisionModelArtifact {
    for (const model of this.models.values()) {
      if (model.modality === modality && model.bodyRegion === bodyRegion && model.status === 'PRODUCTION_ACTIVE') {
        return model;
      }
    }
    return CHEST_XRAY_DENSENET121_V1;
  }

  public static listAvailableModalities(): Array<{ modality: MedicalModality; bodyRegions: BodyRegion[]; defaultModelId: string }> {
    return [
      { modality: 'X-Ray', bodyRegions: ['Chest'], defaultModelId: 'cxr-densenet121-chexpert-v1.0' },
      { modality: 'CT', bodyRegions: ['Chest'], defaultModelId: 'ct-lung-nodule-scaffold-v0.1' },
      { modality: 'MRI', bodyRegions: ['Brain'], defaultModelId: 'mri-brain-scaffold-v0.1' }
    ];
  }

  public static getCandidateComparisons(modelId: string) {
    const model = this.getModelById(modelId);
    if (!model) return null;
    return {
      modelId: model.modelId,
      architecture: model.architecture,
      candidates: model.evaluation.candidateComparisons,
      metrics: model.evaluation
    };
  }
}
