/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Assistant REST Endpoints
 * Provides authorized context retrieval and zero-hallucination query execution.
 */

import { Router, Request, Response } from 'express';
import { getAuthenticatedUser } from '../security/authGuard';
import { AssistantContextService } from '../assistant/assistantContextService';
import { AssistantQueryEngine } from '../assistant/assistantQueryEngine';

export const assistantRouter = Router();

/**
 * GET /api/v1/assistant/context
 * Returns strictly authorized context, domain availability, and data-aware suggested prompts.
 */
assistantRouter.get('/context', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const selectedPatientId = (req.query.selected_patient_id as string) || (req.query.patient_id as string) || undefined;
    
    const context = AssistantContextService.buildAssistantContextResponse(
      user.userId,
      user.role === 'clinician' ? 'clinician' : 'patient',
      user.name,
      selectedPatientId
    );

    return res.json(context);
  } catch (err: any) {
    console.error('[Assistant Context API Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve assistant context', details: err.message });
  }
});

/**
 * POST /api/v1/assistant/query
 * Executes intent classification, deterministic checks, context minimization, and grounded synthesis.
 */
assistantRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { message, scope, selected_patient_id, document_ids, record_ids, assessment_ids, context_type } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'A query message is required.' });
    }

    const queryResponse = await AssistantQueryEngine.executeQuery(
      user.userId,
      (scope || user.role) as 'patient' | 'clinician',
      {
        message,
        scope: (scope || user.role) as 'patient' | 'clinician',
        selected_patient_id,
        document_ids,
        record_ids,
        assessment_ids,
        context_type
      }
    );

    return res.json(queryResponse);
  } catch (err: any) {
    console.error('[Assistant Query API Error]:', err);
    return res.status(500).json({ error: 'Failed to process assistant query', details: err.message });
  }
});
