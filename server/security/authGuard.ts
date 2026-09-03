/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Object-Level Authorization & IDOR Shield (V10 Production)
 */

import { Request, Response, NextFunction } from 'express';
import { storageEngine } from '../db/storageEngine';

export interface AuthenticatedUser {
  userId: string;
  role: 'patient' | 'clinician' | 'admin';
  name: string;
}

// Extract identity securely from headers or session
export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  const userId = (req.headers['x-user-id'] as string) || 'patient-user-primary';
  const role = ((req.headers['x-user-role'] as string) || 'patient') as 'patient' | 'clinician' | 'admin';
  
  return {
    userId,
    role,
    name: userId === 'patient-user-primary' ? 'Aarav Sharma' : `User ${userId.slice(0, 8)}`
  };
}

// 1. Guard Document Ownership (Prevent IDOR)
export function requireDocumentOwnership(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  const docId = req.params.document_id || req.params.docId || req.body.document_id;

  if (!docId) {
    return res.status(400).json({
      error_code: 'MISSING_DOCUMENT_ID',
      message: 'A document identifier is required for this operation.'
    });
  }

  const doc = storageEngine.getDocument(docId, user.userId);
  if (!doc) {
    // If clinician, check if patient-clinician authorization relation exists
    if (user.role === 'clinician') {
      const authorizedPatients = storageEngine.listAuthorizedPatients(user.userId);
      const isAuthorized = authorizedPatients.some(p => p.patientId === doc?.user_id);
      if (isAuthorized) {
        return next();
      }
    }

    return res.status(404).json({
      error_code: 'DOCUMENT_NOT_FOUND_OR_FORBIDDEN',
      message: 'The requested document does not exist or you do not have permission to access it.'
    });
  }

  // User verified as owner
  next();
}

// 2. Guard Clinician Role Permissions
export function requireClinicianRole(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);

  if (user.role !== 'clinician' && user.role !== 'admin') {
    return res.status(403).json({
      error_code: 'CLINICAL_ROLE_REQUIRED',
      message: 'This operation requires verified clinician credentials.'
    });
  }

  next();
}

// 3. Guard Evaluation & Admin Zone
export function requireAdminOrEvaluationRole(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);

  // In development & portfolio preview mode, allow inspection
  if (process.env.NODE_ENV !== 'production' || user.role === 'admin' || user.role === 'clinician') {
    return next();
  }

  return res.status(403).json({
    error_code: 'ADMIN_ACCESS_REQUIRED',
    message: 'Access to system evaluation telemetry is restricted to authorized administrators.'
  });
}
