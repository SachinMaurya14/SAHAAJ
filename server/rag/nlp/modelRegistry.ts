/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Medical NLP Model Registry & Engine Abstraction
 * Supports pluggable clinical NLP model backends with strict version tracking.
 */

import { MedicalEntity, EntityType, ClinicalRelation } from './types';

export interface NLPInferenceInput {
  text: string;
  document_id: string;
  chunk_id: string;
  page_number: number;
  section: string;
}

export interface NLPInferenceOutput {
  entities: MedicalEntity[];
  relations: ClinicalRelation[];
  model_name: string;
  model_version: string;
  execution_ms: number;
}

export interface IMedicalNLPModel {
  name: string;
  version: string;
  description: string;
  supportedEntityTypes: EntityType[];
  initialize(): Promise<void>;
  isReady(): boolean;
  infer(input: NLPInferenceInput): Promise<NLPInferenceOutput>;
}

export class MedicalNLPModelRegistry {
  private static models = new Map<string, IMedicalNLPModel>();
  private static defaultModelName = 'saahaj-clinical-hybrid-v4';
  private static isInitialized = false;

  public static registerModel(model: IMedicalNLPModel): void {
    this.models.set(model.name, model);
  }

  public static getModel(name?: string): IMedicalNLPModel {
    const targetName = name || this.defaultModelName;
    const model = this.models.get(targetName);
    if (!model) {
      // Fallback to first available model or default
      const first = Array.from(this.models.values())[0];
      if (!first) {
        throw new Error(`No Medical NLP models registered in registry.`);
      }
      return first;
    }
    return model;
  }

  public static listModels(): Array<{ name: string; version: string; description: string; isReady: boolean }> {
    return Array.from(this.models.values()).map(m => ({
      name: m.name,
      version: m.version,
      description: m.description,
      isReady: m.isReady()
    }));
  }

  public static async initializeAll(): Promise<void> {
    if (this.isInitialized) return;
    for (const model of this.models.values()) {
      await model.initialize();
    }
    this.isInitialized = true;
  }
}
