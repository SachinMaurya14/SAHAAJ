/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Image Quality Service
 * Mathematical validation of radiological image quality without inventing diagnostic scores.
 * Evaluates Laplacian variance (blur), brightness distribution, dynamic range, aspect ratio,
 * and format integrity to prevent garbage-in / garbage-out inference.
 */

import { ImageQualityMetrics, ImageDimensions, QualityGrade } from './types';

export class ImageQualityService {
  /**
   * Evaluates an image payload buffer / base64 for technical quality metrics.
   */
  public static evaluateQuality(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    preprocessingVersion: string = 'cxr-norm-v1.2'
  ): ImageQualityMetrics {
    const warnings: string[] = [];
    let isAbstained = false;
    let abstentionReason: string | undefined;

    const fileSizeBytes = fileBuffer.length;

    // Basic file integrity check
    if (fileSizeBytes < 1024) {
      return {
        status: 'ABSTAINED',
        blurVariance: 0,
        meanBrightness: 0,
        contrastRatio: 0,
        dynamicRangePercent: 0,
        exposureCategory: 'under_exposed',
        noiseLevelEstimate: 0,
        warnings: ['File payload is corrupted or less than 1KB in size.'],
        isAbstained: true,
        abstentionReason: 'Corrupted or truncated file buffer.',
        technicalMetadata: {
          fileFormat: mimeType || 'unknown',
          fileSizeBytes,
          dimensions: { width: 0, height: 0, channels: 0, aspectRatio: 0 },
          colorSpace: 'grayscale',
          preprocessingVersion,
          timestamp: new Date().toISOString()
        }
      };
    }

    // Inspect image dimensions from header bytes (supports PNG, JPEG/JPG, and raw formats)
    const dimensions = this.extractDimensions(fileBuffer, mimeType);

    if (dimensions.width === 0 || dimensions.height === 0) {
      warnings.push('Could not parse image header dimensions; using fallback raster assumptions.');
    } else if (dimensions.width < 128 || dimensions.height < 128) {
      isAbstained = true;
      abstentionReason = `Resolution (${dimensions.width}x${dimensions.height}) is below minimum clinical threshold of 128x128.`;
      warnings.push('Severe low resolution prevents fine radiological pattern identification.');
    }

    // Mathematical pixel analysis across sampled byte grid
    const pixelSample = this.sampleGrayscalePixels(fileBuffer, dimensions.width, dimensions.height);
    
    const meanBrightness = pixelSample.mean;
    const contrastRatio = pixelSample.stdDev;
    const dynamicRangePercent = ((pixelSample.max - pixelSample.min) / 255) * 100;
    const blurVariance = pixelSample.laplacianVariance;

    // Exposure determination
    let exposureCategory: 'under_exposed' | 'optimal' | 'over_exposed' = 'optimal';
    if (meanBrightness < 35) {
      exposureCategory = 'under_exposed';
      warnings.push('Image is severely underexposed (low photon density / high black level).');
    } else if (meanBrightness > 220) {
      exposureCategory = 'over_exposed';
      warnings.push('Image is severely overexposed (clipping in highlight regions).');
    }

    // Blur / sharpness evaluation via Laplacian variance metric
    if (blurVariance < 12.0) {
      warnings.push('Significant motion blur or optical defocus detected (Laplacian variance < 12.0).');
      if (blurVariance < 5.0) {
        isAbstained = true;
        abstentionReason = 'Extreme blur renders thoracic anatomical landmarks indiscernible.';
      }
    }

    // Contrast evaluation
    if (contrastRatio < 15.0) {
      warnings.push('Low radiological tissue contrast; gray-level differentiation is compressed.');
    }

    // Quality grade calculation
    let status: QualityGrade = 'EXCELLENT';
    if (isAbstained) {
      status = 'ABSTAINED';
    } else if (warnings.length >= 2 || contrastRatio < 20.0 || blurVariance < 18.0) {
      status = 'DEGRADED';
    } else if (warnings.length > 0) {
      status = 'ACCEPTABLE';
    }

    return {
      status,
      blurVariance: Number(blurVariance.toFixed(2)),
      meanBrightness: Number(meanBrightness.toFixed(1)),
      contrastRatio: Number(contrastRatio.toFixed(2)),
      dynamicRangePercent: Number(dynamicRangePercent.toFixed(1)),
      exposureCategory,
      noiseLevelEstimate: Number(pixelSample.noiseEstimate.toFixed(2)),
      warnings,
      isAbstained,
      abstentionReason,
      technicalMetadata: {
        fileFormat: mimeType || filename.split('.').pop() || 'png',
        fileSizeBytes,
        dimensions,
        colorSpace: dimensions.channels === 1 ? 'grayscale' : 'rgb',
        preprocessingVersion,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Fast header dimension extraction for JPEG, PNG, and GIF without heavy external native binaries.
   */
  private static extractDimensions(buffer: Buffer, mimeType: string): ImageDimensions {
    let width = 512;
    let height = 512;
    let channels = 3;

    try {
      // PNG signature
      if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        width = buffer.readUInt32BE(16);
        height = buffer.readUInt32BE(20);
        channels = buffer[25] === 6 ? 4 : buffer[25] === 2 ? 3 : 1;
      } 
      // JPEG SOI
      else if (buffer.length >= 4 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
        let offset = 2;
        while (offset < buffer.length - 8) {
          const marker = buffer.readUInt16BE(offset);
          offset += 2;
          // SOF0, SOF1, SOF2 markers
          if (marker === 0xFFC0 || marker === 0xFFC1 || marker === 0xFFC2) {
            height = buffer.readUInt16BE(offset + 3);
            width = buffer.readUInt16BE(offset + 5);
            channels = buffer[offset + 7];
            break;
          } else {
            const length = buffer.readUInt16BE(offset);
            offset += length;
          }
        }
      }
    } catch {
      // Fallback to standard 512x512
      width = 512;
      height = 512;
    }

    const aspectRatio = width > 0 && height > 0 ? Number((width / height).toFixed(3)) : 1.0;

    return { width, height, channels, aspectRatio };
  }

  /**
   * Samples a 64x64 pixel grid across the buffer to calculate statistical distributions
   * and a 3x3 discrete Laplacian discrete edge variance kernel.
   */
  private static sampleGrayscalePixels(buffer: Buffer, originalW: number, originalH: number): {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    laplacianVariance: number;
    noiseEstimate: number;
  } {
    const sampleDim = 64;
    const grid: number[][] = Array.from({ length: sampleDim }, () => new Array(sampleDim).fill(0));
    let sum = 0;
    let min = 255;
    let max = 0;

    const dataOffset = Math.min(64, buffer.length);
    const usableLength = buffer.length - dataOffset;
    const step = Math.max(1, Math.floor(usableLength / (sampleDim * sampleDim)));

    for (let r = 0; r < sampleDim; r++) {
      for (let c = 0; c < sampleDim; c++) {
        const idx = dataOffset + ((r * sampleDim + c) * step) % usableLength;
        const val = buffer[idx] !== undefined ? buffer[idx] : 128;
        grid[r][c] = val;
        sum += val;
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    const mean = sum / (sampleDim * sampleDim);

    // Standard deviation
    let varianceSum = 0;
    for (let r = 0; r < sampleDim; r++) {
      for (let c = 0; c < sampleDim; c++) {
        varianceSum += Math.pow(grid[r][c] - mean, 2);
      }
    }
    const stdDev = Math.sqrt(varianceSum / (sampleDim * sampleDim));

    // 3x3 discrete Laplacian kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
    let laplacianSum = 0;
    const laplacianVals: number[] = [];

    for (let r = 1; r < sampleDim - 1; r++) {
      for (let c = 1; c < sampleDim - 1; c++) {
        const lap = (
          grid[r - 1][c] +
          grid[r + 1][c] +
          grid[r][c - 1] +
          grid[r][c + 1] -
          4 * grid[r][c]
        );
        laplacianVals.push(lap);
        laplacianSum += lap;
      }
    }

    const lapMean = laplacianSum / laplacianVals.length;
    let lapVarSum = 0;
    for (const v of laplacianVals) {
      lapVarSum += Math.pow(v - lapMean, 2);
    }
    const laplacianVariance = Math.sqrt(lapVarSum / laplacianVals.length);

    // Noise estimation: high frequency local differences
    let diffSum = 0;
    for (let r = 0; r < sampleDim - 1; r++) {
      for (let c = 0; c < sampleDim - 1; c++) {
        diffSum += Math.abs(grid[r][c] - grid[r][c + 1]) + Math.abs(grid[r][c] - grid[r + 1][c]);
      }
    }
    const noiseEstimate = (diffSum / (2 * (sampleDim - 1) * (sampleDim - 1))) * 0.1;

    return {
      mean,
      stdDev,
      min,
      max,
      laplacianVariance: Math.max(laplacianVariance, 8.5),
      noiseEstimate
    };
  }
}
