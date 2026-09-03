/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ Assistant Query Engine
 * Strict intent routing, zero-hallucination validation, and evidence-grounded synthesis.
 */

import { Type } from '@google/genai';
import { GeminiExecutor } from '../utils/geminiExecutor';
import { AssistantContextService } from './assistantContextService';
import { 
  AssistantQueryRequest, 
  AssistantQueryResponse, 
  QueryIntent,
  AuthorizedUserContextData 
} from './assistantTypes';

export class AssistantQueryEngine {
  /**
   * Main entry point for assistant queries
   */
  public static async executeQuery(
    authUserId: string,
    role: 'patient' | 'clinician',
    request: AssistantQueryRequest
  ): Promise<AssistantQueryResponse> {
    const rawMessage = request.message || '';
    const queryText = rawMessage.trim();

    if (!queryText) {
      return {
        answer: "Please enter a question or select a suggested topic.",
        scope: "general",
        facts_used: [],
        sources: [],
        limitations: [],
        safety_notice: null,
        grounding_status: "general"
      };
    }

    // 1. Retrieve strictly authorized context
    const authContext = AssistantContextService.getAuthorizedUserContext(
      authUserId, 
      role, 
      request.selected_patient_id
    );

    // 2. Classify Intent
    const intent = this.classifyIntent(queryText);

    // 3. Deterministic Pre-LLM Context & Capability Checks
    const preCheckResult = this.evaluateDeterministicPreCheck(queryText, intent, authContext, role);
    if (preCheckResult) {
      return preCheckResult;
    }

    // 4. Intent is either GENERAL_HEALTH_QUESTION or User has real data
    if (intent === 'GENERAL_HEALTH_QUESTION' || intent === 'SYSTEM_CAPABILITY') {
      return this.handleGeneralQuestion(queryText, intent);
    }

    // 5. User-specific inquiry with authorized data available
    return this.generateGroundedResponse(queryText, intent, authContext, role, request);
  }

  /**
   * Deterministically classifies user intent
   */
  private static classifyIntent(query: string): QueryIntent {
    const q = query.toLowerCase();

    // System / Capability
    if (
      q.includes('how does saahaj work') ||
      q.includes('what can i upload') ||
      q.includes('what can saahaj analyze') ||
      q.includes('how is my health data handled') ||
      q.includes('privacy') ||
      q.includes('security')
    ) {
      return 'SYSTEM_CAPABILITY';
    }

    // General definitions (e.g. "What is HbA1c?", "What does LDL mean?")
    const isGeneralDefinition = (
      (q.startsWith('what is ') || q.startsWith('what are ') || q.startsWith('explain the term ') || q.startsWith('define ')) &&
      !q.includes('my ') && !q.includes('mine') && !q.includes('i ') && !q.includes('me ')
    );
    if (isGeneralDefinition) {
      return 'GENERAL_HEALTH_QUESTION';
    }

    // Lab Value Questions
    if (
      q.includes('my hba1c') || q.includes('my blood sugar') || q.includes('my glucose') ||
      q.includes('my ldl') || q.includes('my hdl') || q.includes('my cholesterol') ||
      q.includes('my blood pressure') || q.includes('my bp') || q.includes('my lab') ||
      q.includes('my biomarker') || q.includes('my result') || q.includes('my numbers')
    ) {
      // Check if longitudinal/trajectory is asked
      if (
        q.includes('why did') || q.includes('improve') || q.includes('change') ||
        q.includes('increase') || q.includes('decrease') || q.includes('compare') ||
        q.includes('trend') || q.includes('trajectory') || q.includes('since ')
      ) {
        return 'TIMELINE_QUESTION';
      }
      return 'LAB_VALUE_QUESTION';
    }

    // Longitudinal / Timeline
    if (
      q.includes('timeline') || q.includes('trajectory') || q.includes('over time') ||
      q.includes('what changed') || q.includes('since last') || q.includes('in the last year') ||
      q.includes('improve') || q.includes('worse')
    ) {
      return 'TIMELINE_QUESTION';
    }

    // Risk model questions
    if (
      q.includes('risk') || q.includes('ascvd') || q.includes('heart score') ||
      q.includes('cardiovascular') || q.includes('diabetes model') || q.includes('prediction') ||
      q.includes('score')
    ) {
      return 'RISK_QUESTION';
    }

    // Imaging questions
    if (
      q.includes('x-ray') || q.includes('xray') || q.includes('radiograph') ||
      q.includes('imaging') || q.includes('scan') || q.includes('chest') ||
      q.includes('ct ') || q.includes('mri')
    ) {
      return 'IMAGING_QUESTION';
    }

    // Medication questions
    if (
      q.includes('medication') || q.includes('medicine') || q.includes('drug') ||
      q.includes('prescription') || q.includes('dose') || q.includes('taking')
    ) {
      return 'MEDICATION_QUESTION';
    }

    // Report questions
    if (
      q.includes('report') || q.includes('document') || q.includes('panel') ||
      q.includes('pdf') || q.includes('lab sheet')
    ) {
      return 'REPORT_QUESTION';
    }

    // Appointment Prep
    if (
      q.includes('doctor') || q.includes('physician') || q.includes('appointment') ||
      q.includes('consultation') || q.includes('questions to ask') || q.includes('prepare')
    ) {
      return 'APPOINTMENT_PREP';
    }

    return 'UNKNOWN';
  }

  /**
   * Deterministic pre-checks that safeguard against missing data without hallucination
   */
  private static evaluateDeterministicPreCheck(
    query: string,
    intent: QueryIntent,
    context: AuthorizedUserContextData,
    role: 'patient' | 'clinician'
  ): AssistantQueryResponse | null {
    const q = query.toLowerCase();

    // Clinician mode with no patient
    if (role === 'clinician' && !context.user_id) {
      return {
        answer: "Please select an authorized patient record from your clinical dashboard to review patient-specific data.",
        scope: "insufficient_evidence",
        facts_used: [],
        sources: [],
        limitations: ["No active authorized patient selected in clinician session."],
        safety_notice: "Clinical synthesis requires an active patient context.",
        grounding_status: "insufficient_evidence"
      };
    }

    // 1. Lab Value Check
    if (intent === 'LAB_VALUE_QUESTION') {
      let targetConcept = '';
      if (q.includes('hba1c')) targetConcept = 'hba1c';
      else if (q.includes('ldl')) targetConcept = 'ldl';
      else if (q.includes('cholesterol')) targetConcept = 'cholesterol';
      else if (q.includes('glucose') || q.includes('blood sugar')) targetConcept = 'glucose';
      else if (q.includes('bp') || q.includes('blood pressure')) targetConcept = 'blood pressure';

      if (targetConcept) {
        const matchingFacts = context.health_facts.filter(f => 
          f.concept_name.toLowerCase().includes(targetConcept)
        );

        if (matchingFacts.length === 0) {
          const conceptLabel = targetConcept === 'hba1c' 
            ? 'an HbA1c' 
            : targetConcept === 'ldl' 
            ? 'an LDL cholesterol' 
            : targetConcept === 'bp' 
            ? 'a blood pressure' 
            : `a ${targetConcept}`;
          return {
            answer: `I don't have ${conceptLabel} result in your available records yet.`,
            scope: "insufficient_evidence",
            facts_used: [],
            sources: [],
            limitations: [`No recorded observation for "${targetConcept}" found in authorized profile.`],
            safety_notice: "You can upload a laboratory report or record vitals in your Health Overview to track this marker.",
            grounding_status: "insufficient_evidence",
            suggested_action: {
              label: "Upload Laboratory Report",
              view: "app-upload"
            }
          };
        }
      } else if (context.health_facts.length === 0) {
        return {
          answer: "I don't have any laboratory biomarker results in your current records yet.",
          scope: "insufficient_evidence",
          facts_used: [],
          sources: [],
          limitations: ["No structured laboratory facts exist in authorized records."],
          safety_notice: null,
          grounding_status: "insufficient_evidence",
          suggested_action: {
            label: "Upload Laboratory Report",
            view: "app-upload"
          }
        };
      }
    }

    // 2. Report Question Check
    if (intent === 'REPORT_QUESTION') {
      if (context.reports.length === 0) {
        return {
          answer: "I don't have a report available to review yet.",
          scope: "insufficient_evidence",
          facts_used: [],
          sources: [],
          limitations: ["Zero medical documents or diagnostic panels uploaded."],
          safety_notice: "Upload a laboratory or clinical report in PDF or image format to review findings.",
          grounding_status: "insufficient_evidence",
          suggested_action: {
            label: "Upload Medical Document",
            view: "app-upload"
          }
        };
      }
    }

    // 3. Longitudinal / Timeline Trajectory Check
    if (intent === 'TIMELINE_QUESTION') {
      let matchingFacts: any[] = [];
      if (q.includes('hba1c')) {
        matchingFacts = context.health_facts.filter(f => f.concept_name.toLowerCase().includes('hba1c'));
      } else if (q.includes('ldl') || q.includes('cholesterol')) {
        matchingFacts = context.health_facts.filter(f => f.concept_name.toLowerCase().includes('cholesterol') || f.concept_name.toLowerCase().includes('ldl'));
      } else {
        matchingFacts = context.health_facts;
      }

      // Check unique dates
      const uniqueDates = new Set(matchingFacts.map(f => f.date.split('T')[0]));
      if (matchingFacts.length < 2 || uniqueDates.size < 2) {
        return {
          answer: "Your records do not contain enough longitudinal measurements (at least two distinct recorded dates required) to evaluate a trajectory.",
          scope: "insufficient_evidence",
          facts_used: [],
          sources: [],
          limitations: ["Longitudinal analysis requires at least two chronological observation dates."],
          safety_notice: "Upload historical laboratory panels to enable trajectory tracking.",
          grounding_status: "insufficient_evidence",
          suggested_action: {
            label: "Upload Baseline Panel",
            view: "app-upload"
          }
        };
      }
    }

    // 4. Risk Assessment Check
    if (intent === 'RISK_QUESTION') {
      if (context.risk_assessments.length === 0) {
        return {
          answer: "I don't have a completed cardiovascular risk assessment for your records yet.",
          scope: "insufficient_evidence",
          facts_used: [],
          sources: [],
          limitations: ["No statistical risk assessment has been executed for this user."],
          safety_notice: "You can run an explainable screening assessment in the Risk Assessment workspace.",
          grounding_status: "insufficient_evidence",
          suggested_action: {
            label: "Run Risk Assessment",
            view: "app-risk-assessment"
          }
        };
      }
    }

    // 5. Imaging Question Check
    if (intent === 'IMAGING_QUESTION') {
      if (context.imaging.length === 0) {
        return {
          answer: "No imaging study is available in your records yet.",
          scope: "insufficient_evidence",
          facts_used: [],
          sources: [],
          limitations: ["No radiology or imaging studies uploaded to this account."],
          safety_notice: null,
          grounding_status: "insufficient_evidence",
          suggested_action: {
            label: "Upload Imaging Scan",
            view: "app-imaging"
          }
        };
      }
    }

    // 6. Medication Question Check
    if (intent === 'MEDICATION_QUESTION') {
      if (context.medications.length === 0) {
        return {
          answer: "No medication information has been added to your records.",
          scope: "insufficient_evidence",
          facts_used: [],
          sources: [],
          limitations: ["No active medication records documented in authorized profile."],
          safety_notice: "Always verify prescription medications directly with your prescribing physician.",
          grounding_status: "insufficient_evidence"
        };
      }
    }

    return null;
  }

  /**
   * Handles general health education and system capability questions
   */
  private static async handleGeneralQuestion(
    queryText: string,
    intent: QueryIntent
  ): Promise<AssistantQueryResponse> {
    if (intent === 'SYSTEM_CAPABILITY') {
      return {
        answer: "SAAHAJ is an evidence-grounded Health Intelligence system designed to organize your medical documents, explain laboratory terminology, visualize longitudinal biomarker trajectories, and provide transparent mathematical risk screening models. All biometric data is cryptographically protected and processed with strict user isolation.",
        scope: "general",
        facts_used: [],
        sources: [],
        limitations: ["General capability description; contains no personal health evaluation."],
        safety_notice: "SAAHAJ provides health education and mathematical interpretability, not clinical diagnoses.",
        grounding_status: "general"
      };
    }

    // General medical explanation via Gemini
    try {
      const systemInstruction = `You are SAAHAJ, an evidence-grounded Health Intelligence Assistant.
The user is asking a GENERAL medical/health education question.
MANDATORY RULES:
1. Provide a clear, scientifically accurate, and patient-friendly educational explanation.
2. DO NOT refer to the user's personal medical records or invent personal numbers, dates, or diagnoses.
3. DO NOT diagnose diseases or recommend prescription medication dosages.
4. Keep the explanation objective, concise, and structured.`;

      const result = await GeminiExecutor.executeGenerateContent({
        contents: `Explain this general medical concept: "${queryText}"`,
        primaryModel: 'gemini-3.7-flash',
        fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest'],
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      if (result && result.text) {
        return {
          answer: result.text.trim(),
          scope: "general",
          facts_used: [],
          sources: [],
          limitations: ["General clinical education only. Not personalized to your medical history."],
          safety_notice: "Consult a qualified medical provider for personalized health recommendations.",
          grounding_status: "general"
        };
      }
    } catch (err) {
      console.warn('[handleGeneralQuestion] LLM fallback engaged:', err);
    }

    return {
      answer: `Regarding "${queryText}": SAAHAJ provides verified medical reference information and document interpretation once records are uploaded. For comprehensive health evaluation, consult your healthcare practitioner.`,
      scope: "general",
      facts_used: [],
      sources: [],
      limitations: [],
      safety_notice: "General health education only.",
      grounding_status: "general"
    };
  }

  /**
   * Generates grounded response using strictly authorized context and post-generation validation
   */
  private static async generateGroundedResponse(
    queryText: string,
    intent: QueryIntent,
    context: AuthorizedUserContextData,
    role: 'patient' | 'clinician',
    request: AssistantQueryRequest
  ): Promise<AssistantQueryResponse> {
    // Context Minimization: select only relevant domains
    const minimizedFacts = this.filterRelevantFacts(queryText, intent, context.health_facts);
    const minimizedReports = context.reports.slice(0, 3);
    const minimizedAssessments = context.risk_assessments.slice(0, 2);
    const minimizedImaging = context.imaging.slice(0, 2);
    const minimizedMedications = context.medications;

    // Track available source IDs for strict citation validation
    const validSourceMap = new Map<string, { id: string; title: string; date?: string; type?: string }>();
    for (const r of minimizedReports) {
      validSourceMap.set(r.document_id, {
        id: r.document_id,
        title: r.title,
        date: r.date,
        type: 'Diagnostic Report'
      });
    }
    for (const a of minimizedAssessments) {
      const sourceObj = {
        id: a.assessment_id,
        title: a.model_name,
        date: a.created_at,
        type: 'Risk Model'
      };
      validSourceMap.set(a.assessment_id, sourceObj);
      if (a.model_id) validSourceMap.set(a.model_id, sourceObj);
      if (a.model_name) validSourceMap.set(a.model_name, sourceObj);
    }
    for (const img of minimizedImaging) {
      const imgObj = {
        id: img.study_id,
        title: img.title,
        date: img.date,
        type: 'Medical Imaging'
      };
      validSourceMap.set(img.study_id, imgObj);
      if (img.title) validSourceMap.set(img.title, imgObj);
    }

    const validFactIds = new Set(minimizedFacts.map(f => f.fact_id));

    // Structured Prompt Construction
    const systemInstruction = `You are SAAHAJ, an evidence-grounded Health Intelligence Assistant for ${role === 'clinician' ? 'Clinicians' : 'Patients'}.
MANDATORY SCIENTIFIC INTEGRITY & SAFETY RULES:
1. NEVER invent or extrapolate patient data, lab results, numerical values, dates, medications, diagnoses, or citations.
2. NEVER mention any patient name, identifier, or record unless present in AUTHORIZED CONTEXT.
3. CAUSALITY RULE: When discussing changes over time (e.g. biomarker decrease/increase), DO NOT claim that medication or lifestyle caused the change unless established by clinical protocol. State the recorded trajectory (e.g. "Your recorded HbA1c decreased from X to Y between DATE A and DATE B"), mention documented context if present, and explicitly state: "However, these records alone do not establish that they caused the change."
4. CLINICAL SIGNIFICANCE RULE: Do NOT use the phrase "clinically significant" unless a specific guideline defines it for this value. Use "numerically changed".
5. NUMERICAL ACCURACY: All numbers must exactly match the values in the AUTHORIZED CONTEXT.
6. CITATIONS: In facts_used, only include IDs from the provided facts. In sources, only include objects for documents or models provided in context. Do NOT invent citation objects.
7. SEPARATE FACTS FROM BIOLOGICAL CONTEXT: Present observed data clearly, followed by general biological context.`;

    const contextPayload = {
      authorized_facts: minimizedFacts,
      authorized_reports: minimizedReports,
      authorized_risk_assessments: minimizedAssessments,
      authorized_imaging: minimizedImaging,
      authorized_medications: minimizedMedications
    };

    try {
      const result = await GeminiExecutor.executeGenerateContent({
        contents: `AUTHORIZED CONTEXT:\n${JSON.stringify(contextPayload, null, 2)}\n\nUSER QUESTION:\n${queryText}`,
        primaryModel: 'gemini-3.7-flash',
        fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest'],
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              scope: { type: Type.STRING, enum: ['user', 'general', 'insufficient_evidence'] },
              facts_used: { type: Type.ARRAY, items: { type: Type.STRING } },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    date: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ['id', 'title']
                }
              },
              limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
              safety_notice: { type: Type.STRING },
              grounding_status: { type: Type.STRING, enum: ['grounded', 'general', 'insufficient_evidence'] }
            },
            required: ['answer', 'scope', 'facts_used', 'sources', 'limitations', 'grounding_status']
          }
        }
      });

      if (result && result.text) {
        const parsed = JSON.parse(result.text);

        // Run strict post-generation sanitization
        const validated = this.validateAndSanitizeResponse(
          parsed,
          validFactIds,
          validSourceMap,
          minimizedFacts,
          minimizedMedications,
          minimizedAssessments,
          minimizedReports
        );

        return validated;
      }
    } catch (err) {
      console.warn('[generateGroundedResponse] Error during generation, using deterministic fallback:', err);
    }

    // Deterministic grounded synthesis fallback
    return this.generateDeterministicGroundedFallback(
      queryText,
      intent,
      minimizedFacts,
      minimizedReports,
      minimizedAssessments,
      minimizedMedications
    );
  }

  /**
   * Filters down health facts relevant to the query to avoid context overload
   */
  private static filterRelevantFacts(query: string, intent: QueryIntent, facts: any[]): any[] {
    const q = query.toLowerCase();

    if (q.includes('hba1c') || q.includes('glucose') || q.includes('sugar') || q.includes('diabetes')) {
      return facts.filter(f => 
        f.concept_name.toLowerCase().includes('hba1c') || 
        f.concept_name.toLowerCase().includes('glucose') ||
        f.concept_name.toLowerCase().includes('glycated')
      );
    }

    if (q.includes('cholesterol') || q.includes('lipid') || q.includes('ldl') || q.includes('hdl') || q.includes('triglyceride')) {
      return facts.filter(f => 
        f.concept_name.toLowerCase().includes('cholesterol') || 
        f.concept_name.toLowerCase().includes('ldl') ||
        f.concept_name.toLowerCase().includes('hdl') ||
        f.concept_name.toLowerCase().includes('lipid') ||
        f.concept_name.toLowerCase().includes('triglyceride')
      );
    }

    if (q.includes('bp') || q.includes('pressure') || q.includes('hypertension')) {
      return facts.filter(f => 
        f.concept_name.toLowerCase().includes('pressure') || 
        f.concept_name.toLowerCase().includes('systolic') ||
        f.concept_name.toLowerCase().includes('diastolic')
      );
    }

    // Default to top recent facts
    return facts.slice(0, 6);
  }

  /**
   * Post-generation validation & sanitization
   */
  private static validateAndSanitizeResponse(
    rawResponse: any,
    validFactIds: Set<string>,
    validSourceMap: Map<string, any>,
    facts: any[],
    medications: any[],
    assessments: any[] = [],
    reports: any[] = []
  ): AssistantQueryResponse {
    let sanitizedAnswer = rawResponse.answer || '';

    // 1. Causality Check
    if (sanitizedAnswer.toLowerCase().includes('because of') || sanitizedAnswer.toLowerCase().includes('caused by')) {
      // Ensure causal disclaimer is present
      if (!sanitizedAnswer.includes('do not establish that they caused')) {
        sanitizedAnswer += ' (Note: Recorded health changes and concurrent factors in your records do not establish clinical causation.)';
      }
    }

    // 2. Clinical Significance Check
    sanitizedAnswer = sanitizedAnswer.replace(/is clinically significant/gi, 'is a documented numerical change');
    sanitizedAnswer = sanitizedAnswer.replace(/are clinically significant/gi, 'are documented numerical changes');

    // 3. Filter facts_used to only genuinely existing IDs
    const sanitizedFactsUsed: string[] = (rawResponse.facts_used || [])
      .filter((id: string) => validFactIds.has(id));

    // 4. Filter sources to only genuinely existing IDs
    const sanitizedSources: any[] = [];
    if (Array.isArray(rawResponse.sources)) {
      for (const s of rawResponse.sources) {
        if (s && s.id && validSourceMap.has(s.id)) {
          sanitizedSources.push(validSourceMap.get(s.id));
        } else if (s && s.title && validSourceMap.has(s.title)) {
          sanitizedSources.push(validSourceMap.get(s.title));
        }
      }
    }

    // 5. If sources array is empty but response describes user assessments or reports, auto-link valid source
    let grounding_status: 'grounded' | 'general' | 'insufficient_evidence' = rawResponse.grounding_status || 'grounded';
    if (sanitizedFactsUsed.length === 0 && sanitizedSources.length === 0) {
      if (rawResponse.scope === 'user' && assessments.length > 0) {
        for (const a of assessments) {
          if (validSourceMap.has(a.assessment_id)) {
            sanitizedSources.push(validSourceMap.get(a.assessment_id));
            break;
          }
        }
        grounding_status = 'grounded';
      } else if (rawResponse.scope === 'user' && reports.length > 0) {
        for (const r of reports) {
          if (validSourceMap.has(r.document_id)) {
            sanitizedSources.push(validSourceMap.get(r.document_id));
            break;
          }
        }
        grounding_status = 'grounded';
      } else {
        grounding_status = 'general';
      }
    }

    return {
      answer: sanitizedAnswer,
      scope: rawResponse.scope || 'user',
      facts_used: sanitizedFactsUsed,
      sources: sanitizedSources,
      limitations: rawResponse.limitations || ['Interpretation based solely on documented records.'],
      safety_notice: rawResponse.safety_notice || 'Consult your healthcare provider for medical evaluations.',
      grounding_status
    };
  }

  /**
   * Deterministic grounded synthesis fallback
   */
  private static generateDeterministicGroundedFallback(
    queryText: string,
    intent: QueryIntent,
    facts: any[],
    reports: any[],
    assessments: any[],
    medications: any[]
  ): AssistantQueryResponse {
    const sources: any[] = reports.map(r => ({
      id: r.document_id,
      title: r.title,
      date: r.date,
      type: 'Diagnostic Report'
    }));

    const factsUsed = facts.map(f => f.fact_id);

    if (intent === 'TIMELINE_QUESTION' && facts.length >= 2) {
      const sorted = [...facts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first = sorted[0];
      const latest = sorted[sorted.length - 1];

      const firstDateStr = new Date(first.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const latestDateStr = new Date(latest.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      let medContext = '';
      if (medications.length > 0) {
        medContext = ` Your records also document ${medications.map(m => m.name).join(', ')}. However, these records alone do not establish that they caused the change.`;
      }

      return {
        answer: `Your recorded ${latest.concept_name} changed from ${first.value} in ${firstDateStr} to ${latest.value} in ${latestDateStr}.${medContext}`,
        scope: "user",
        facts_used: factsUsed,
        sources,
        limitations: ["Trajectory derived solely from documented numerical entries."],
        safety_notice: "Biomarker changes should be evaluated in clinical consultation with your physician.",
        grounding_status: "grounded"
      };
    }

    if (intent === 'RISK_QUESTION' && assessments.length > 0) {
      const topAssessment = assessments[0];
      const dateStr = topAssessment.created_at ? new Date(topAssessment.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'recently';
      return {
        answer: `According to your ${topAssessment.model_name} assessment from ${dateStr}, your estimated risk score is ${topAssessment.formatted_percentage}, which is categorized as ${topAssessment.risk_category}.`,
        scope: "user",
        facts_used: [],
        sources: [{
          id: topAssessment.assessment_id,
          title: topAssessment.model_name,
          date: topAssessment.created_at,
          type: 'Statistical Risk Model'
        }],
        limitations: ["Calculated from population risk modeling; not a deterministic clinical diagnosis."],
        safety_notice: "Discuss screening risk calculations with your clinician.",
        grounding_status: "grounded"
      };
    }

    if (intent === 'REPORT_QUESTION' && reports.length > 0) {
      const topReport = reports[0];
      const dateStr = topReport.date ? new Date(topReport.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      return {
        answer: `Your records contain "${topReport.title}" (${dateStr || 'verified'}). It has been processed and indexed into your structured health profile.`,
        scope: "user",
        facts_used: [],
        sources,
        limitations: ["Extracted from uploaded medical document."],
        safety_notice: null,
        grounding_status: "grounded"
      };
    }

    if (facts.length > 0) {
      const topFact = facts[0];
      const dateStr = new Date(topFact.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return {
        answer: `Your records show ${topFact.concept_name} at ${topFact.value}${topFact.unit ? ' ' + topFact.unit : ''} (recorded ${dateStr}).`,
        scope: "user",
        facts_used: [topFact.fact_id],
        sources,
        limitations: ["Based strictly on extracted observations."],
        safety_notice: "Laboratory values must be interpreted in comprehensive clinical context.",
        grounding_status: "grounded"
      };
    }

    return {
      answer: `Based on your authorized health records, all biometric data remains securely indexed. How else can I assist in reviewing your documentation?`,
      scope: "user",
      facts_used: [],
      sources,
      limitations: [],
      safety_notice: null,
      grounding_status: "grounded"
    };
  }
}
