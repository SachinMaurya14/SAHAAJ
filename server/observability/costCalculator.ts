/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Model Cost & Token Economics Calculator
 * Provides deterministic, configurable cost calculations for LLMs and Embeddings.
 * Clearly marks all values as "Estimated" unless direct billing integration is present.
 */

import { ModelPricingConfig } from './types';

export class CostCalculator {
  private static pricingRegistry = new Map<string, ModelPricingConfig>([
    [
      'gemini-3.7-flash',
      {
        modelId: 'gemini-3.7-flash',
        inputCostPerMillion: 0.15,  // $0.15 per 1M input tokens
        outputCostPerMillion: 0.60, // $0.60 per 1M output tokens
        currency: 'USD',
        effectiveDate: '2025-02-01'
      }
    ],
    [
      'gemini-1.5-pro',
      {
        modelId: 'gemini-1.5-pro',
        inputCostPerMillion: 1.25,
        outputCostPerMillion: 5.00,
        currency: 'USD',
        effectiveDate: '2025-01-01'
      }
    ],
    [
      'text-embedding-004',
      {
        modelId: 'text-embedding-004',
        inputCostPerMillion: 0.025,
        outputCostPerMillion: 0.0,
        currency: 'USD',
        effectiveDate: '2025-01-01'
      }
    ]
  ]);

  /**
   * Calculate estimated cost for an LLM execution
   */
  public static calculateCost(
    modelId: string = 'gemini-3.7-flash',
    inputTokens: number = 0,
    outputTokens: number = 0
  ): { estimatedCostUsd: number; isConfigured: boolean; pricingSource: string } {
    const config = this.pricingRegistry.get(modelId) || this.pricingRegistry.get('gemini-3.7-flash');

    if (!config) {
      return {
        estimatedCostUsd: 0,
        isConfigured: false,
        pricingSource: 'Cost unavailable'
      };
    }

    const inputCost = (inputTokens / 1_000_000) * config.inputCostPerMillion;
    const outputCost = (outputTokens / 1_000_000) * config.outputCostPerMillion;
    const totalCost = Number((inputCost + outputCost).toFixed(6));

    return {
      estimatedCostUsd: totalCost,
      isConfigured: true,
      pricingSource: `Configured rates (${config.currency}): $${config.inputCostPerMillion}/M in, $${config.outputCostPerMillion}/M out`
    };
  }

  /**
   * Estimate tokens from string if provider did not return exact usage
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    // Standard rule-of-thumb: ~4 chars per token for English medical text
    return Math.ceil(text.length / 4);
  }

  public static getPricingConfigs(): ModelPricingConfig[] {
    return Array.from(this.pricingRegistry.values());
  }
}
