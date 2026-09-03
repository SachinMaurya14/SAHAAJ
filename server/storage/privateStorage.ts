/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Private Object Storage & File Security Engine (V10 Production)
 */

import crypto from 'crypto';
import path from 'path';

export interface SignedStorageUrl {
  signedUrl: string;
  storageKey: string;
  expiresAt: string;
  mimeType: string;
  sizeBytes: number;
}

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  mimeType: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/dicom',
  'application/dicom',
  'text/plain'
]);

const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;    // 15 MB

export class PrivateStorageManager {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STORAGE_SIGNING_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validates file upload metadata, defending against path traversal, unexpected extensions, and oversized payloads.
   */
  public validateUpload(
    filename: string,
    mimeType: string,
    sizeBytes: number,
    isImaging: boolean = false
  ): FileValidationResult {
    // 1. Path traversal & shell injection defense
    const cleanBasename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!cleanBasename || cleanBasename.startsWith('.')) {
      return { isValid: false, sanitizedFilename: '', mimeType, error: 'Invalid or malicious filename detected.' };
    }

    // 2. MIME type verification
    const normalizedMime = mimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      return {
        isValid: false,
        sanitizedFilename: cleanBasename,
        mimeType: normalizedMime,
        error: `Unsupported file format (${normalizedMime}). Please upload PDF, JPEG, PNG, or DICOM.`
      };
    }

    // 3. File size limit verification
    const limit = isImaging ? MAX_IMAGE_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
    if (sizeBytes > limit) {
      const limitMb = Math.round(limit / (1024 * 1024));
      return {
        isValid: false,
        sanitizedFilename: cleanBasename,
        mimeType: normalizedMime,
        error: `File size exceeds the allowed limit of ${limitMb}MB.`
      };
    }

    return {
      isValid: true,
      sanitizedFilename: cleanBasename,
      mimeType: normalizedMime
    };
  }

  /**
   * Generates a time-bound HMAC-SHA256 signed URL for accessing private medical artifacts.
   */
  public generateSignedAccessUrl(
    userId: string,
    storageKey: string,
    mimeType: string,
    ttlMinutes: number = 30
  ): SignedStorageUrl {
    const expiresAtEpoch = Math.floor(Date.now() / 1000) + ttlMinutes * 60;
    const dataToSign = `${userId}:${storageKey}:${expiresAtEpoch}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(dataToSign)
      .digest('hex');

    const signedUrl = `/api/v1/storage/private/${storageKey}?uid=${encodeURIComponent(userId)}&exp=${expiresAtEpoch}&sig=${signature}`;

    return {
      signedUrl,
      storageKey,
      expiresAt: new Date(expiresAtEpoch * 1000).toISOString(),
      mimeType,
      sizeBytes: 0
    };
  }

  /**
   * Verifies the authenticity and expiration of a signed access URL.
   */
  public verifySignedAccess(userId: string, storageKey: string, exp: number, sig: string): boolean {
    const nowEpoch = Math.floor(Date.now() / 1000);
    if (nowEpoch > exp) {
      return false; // Expired token
    }

    const dataToSign = `${userId}:${storageKey}:${exp}`;
    const expectedSig = crypto
      .createHmac('sha256', this.secretKey)
      .update(dataToSign)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
  }
}

export const privateStorage = new PrivateStorageManager();
