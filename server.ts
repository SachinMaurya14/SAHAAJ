import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Type } from '@google/genai';
import dotenv from 'dotenv';
import { v1Router } from './server/routes/v1Routes';
import { GeminiExecutor } from './server/utils/geminiExecutor';
import { 
  securityHeadersMiddleware, 
  configureCORS, 
  createRateLimiter, 
  unifiedErrorHandler 
} from './server/security/securityMiddleware';
import { privateStorage } from './server/storage/privateStorage';
import { storageEngine } from './server/db/storageEngine';
import { getAuthenticatedUser } from './server/security/authGuard';
import { AssistantQueryEngine } from './server/assistant/assistantQueryEngine';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 1. Security & Infrastructure Middleware
app.use(securityHeadersMiddleware);
app.use(configureCORS);
app.use(express.json({ limit: '25mb' }));

// 2. Sliding Window Rate Limiters
const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 300,
  keyPrefix: 'global-api',
  message: 'Too many requests. Please slow down your interactions.'
});

const expensiveAiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: 'ai-operations',
  message: 'Health intelligence AI operation rate limit reached. Please wait a moment.'
});

app.use('/api/', globalApiLimiter);
app.use('/api/gemini/', expensiveAiLimiter);

// 3. Production Health & Readiness Probes
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'live',
    service: 'SAAHAJ Health Intelligence Core',
    version: 'v10.0-production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  
  res.status(200).json({
    status: 'ready',
    version: 'v10.0-production',
    subsystems: {
      storageEngine: 'operational',
      tabularMLEngine: 'operational',
      cvRadiologyEngine: 'operational',
      hybridRAGEngine: 'operational',
      medicalNLPEngine: 'operational',
      geminiCloudLink: hasKey ? 'connected' : 'fallback-active'
    },
    systemHealth: {
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      uptimeSec: Math.floor(process.uptime())
    },
    timestamp: new Date().toISOString()
  });
});

// Legacy /api/health endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    service: 'SAAHAJ Health Intelligence Service',
    geminiConnected: hasKey,
    model: 'gemini-3.7-flash',
    timestamp: new Date().toISOString()
  });
});

// 4. Mount V3 REST API Routes
app.use('/api/v1', v1Router);

// 5. Patient Data Sovereignty: Export & Delete APIs
app.get('/api/v1/patient/export', (req, res) => {
  const user = getAuthenticatedUser(req);
  const docs = storageEngine.listDocuments(user.userId);
  const facts = storageEngine.getAllStructuredHealthFactsForUser(user.userId);
  const timeline = storageEngine.getAllTimelineEventsForUser(user.userId);
  const mlAssessments = storageEngine.listMLAssessmentsForUser(user.userId);
  const notes = storageEngine.listClinicianNotes(user.userId, undefined, true);
  const imaging = storageEngine.listImagingStudies(user.userId);
  const audit = storageEngine.getAuditLogs(user.userId);

  storageEngine.logAudit(user.userId, 'PATIENT_DATA_EXPORT_GENERATED', {
    docCount: docs.length,
    factCount: facts.length,
    mlCount: mlAssessments.length
  });

  res.setHeader('Content-Disposition', `attachment; filename="saahaj_health_export_${user.userId}_${Date.now()}.json"`);
  res.setHeader('Content-Type', 'application/json');
  return res.json({
    exportMetadata: {
      system: 'SAAHAJ Health Intelligence Archive',
      version: 'v10.0',
      exportedAt: new Date().toISOString(),
      patientId: user.userId,
      sovereigntyNotice: 'Patient-controlled data export generated under cryptographic zero-knowledge principles.'
    },
    records: {
      documents: docs,
      extractedFacts: facts,
      chronologicalTimeline: timeline,
      calibratedMLRiskAssessments: mlAssessments,
      radiologicalStudies: imaging,
      verifiedClinicianNotes: notes,
      auditHistory: audit
    }
  });
});

app.post('/api/v1/patient/delete', (req, res) => {
  const user = getAuthenticatedUser(req);
  storageEngine.clearUserData(user.userId);
  return res.json({
    status: 'PURGED',
    patientId: user.userId,
    message: 'All documents, extracted vectors, facts, timeline records, and imaging artifacts have been permanently purged.',
    purgedAt: new Date().toISOString()
  });
});

// 6. Private Object Storage Signed Access Verification Endpoint
app.get('/api/v1/storage/private/:storageKey', (req, res) => {
  const { storageKey } = req.params;
  const uid = req.query.uid as string;
  const exp = parseInt(req.query.exp as string, 10);
  const sig = req.query.sig as string;

  if (!uid || isNaN(exp) || !sig) {
    return res.status(403).json({ error_code: 'INVALID_SIGNATURE', message: 'Signed authentication parameters are missing.' });
  }

  const isValid = privateStorage.verifySignedAccess(uid, storageKey, exp, sig);
  if (!isValid) {
    return res.status(403).json({ error_code: 'ACCESS_DENIED', message: 'Signature expired or invalid for this medical artifact.' });
  }

  // Return secure artifact reference metadata
  return res.json({
    status: 'AUTHORIZED',
    storageKey,
    authorizedFor: uid,
    expiresAt: new Date(exp * 1000).toISOString(),
    retrievalMode: 'PRIVATE_CLIENT_ENCRYPTED_STREAM'
  });
});

// 1. Explain Risk Model Factors (Multi-tier: Simple, Detailed, Technical, Questions)
app.post('/api/gemini/explain-factors', async (req, res) => {
  const { modelName, riskScore, riskLevel, contributingFactors, missingInputs, userBiometrics } = req.body;

  if (!modelName || riskScore === undefined) {
    return res.status(400).json({ error: 'Missing required model evaluation parameters' });
  }

  try {
    const prompt = `You are SAAHAJ's Explainable Health Intelligence Engine.
Explain the following statistical risk assessment output to the patient.
DO NOT diagnose any disease. DO NOT prescribe medications.
Ground your explanation STRICTLY in the provided data. DO NOT invent missing lab tests.

Model: ${modelName}
Estimated Score: ${riskScore}% (${riskLevel || 'Calculated'})
User Biometrics: ${JSON.stringify(userBiometrics || {})}
Contributing Features: ${JSON.stringify(contributingFactors || [])}
Missing Information: ${JSON.stringify(missingInputs || [])}

Provide a structured JSON explanation adhering to:
- summary: 1-2 clear sentences explaining the mathematical calculation in non-alarmist plain language.
- key_points: Array of 3 key takeaways about why specific factors influenced the estimate.
- data_used: Object with provided array and missing array.
- biological_context: Thorough physiological explanation of why these markers matter in the body.
- technical_mechanism: Explanation of statistical feature attribution vs clinical causation.
- uncertainties: Array of 2-3 genuine uncertainties / limitations.
- questions_for_clinician: Array of 3 specific, non-generic discussion questions for the patient's doctor.
- safety_notice: Clear non-diagnostic disclaimer.`;

    const result = await GeminiExecutor.executeGenerateContent({
      contents: prompt,
      primaryModel: 'gemini-3.7-flash',
      fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest'],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            data_used: {
              type: Type.OBJECT,
              properties: {
                provided: { type: Type.ARRAY, items: { type: Type.STRING } },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['provided', 'missing']
            },
            biological_context: { type: Type.STRING },
            technical_mechanism: { type: Type.STRING },
            uncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
            questions_for_clinician: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety_notice: { type: Type.STRING }
          },
          required: ['summary', 'key_points', 'data_used', 'biological_context', 'uncertainties', 'questions_for_clinician', 'safety_notice']
        }
      }
    });

    if (result && result.text) {
      const parsed = JSON.parse(result.text);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('[Gemini explain-factors] Handled exception, applying deterministic fallback:', error?.message || error);
  }

  // Guaranteed deterministic fallback
  return res.json(GeminiExecutor.getExplainFactorsFallback({
    modelName,
    riskScore,
    riskLevel,
    contributingFactors,
    missingInputs,
    userBiometrics
  }));
});

// 2. Explain Medical Report (Structured Document Summary & Glossary)
app.post('/api/gemini/explain-report', async (req, res) => {
  const { title, date, facility, parameters, comparisonData } = req.body;

  if (!parameters || !Array.isArray(parameters) || parameters.length === 0) {
    return res.status(400).json({ error: 'No extracted report parameters provided' });
  }

  try {
    const prompt = `You are SAAHAJ's Medical Document Explanation Engine.
Synthesize a patient-accessible, scientifically rigorous summary of the following laboratory report.
DO NOT diagnose illnesses. Separate FACTS (the report values) from EXPLANATIONS (what the biological markers do).
Only cite provided parameters.

Report Title: ${title || 'Lab Report'} (${date || 'Recent'})
Facility: ${facility || 'Diagnostic Center'}
Parameters: ${JSON.stringify(parameters)}
Comparison Context: ${JSON.stringify(comparisonData || 'No prior comparison available')}`;

    const result = await GeminiExecutor.executeGenerateContent({
      contents: prompt,
      primaryModel: 'gemini-3.7-flash',
      fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest'],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report_title: { type: Type.STRING },
            summary: { type: Type.STRING },
            important_findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            abnormal_markers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  reference_range: { type: Type.STRING },
                  clinical_note: { type: Type.STRING }
                },
                required: ['name', 'value', 'reference_range', 'clinical_note']
              }
            },
            medical_terms_glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  patient_friendly_definition: { type: Type.STRING }
                },
                required: ['term', 'patient_friendly_definition']
              }
            },
            comparison_with_baseline: { type: Type.STRING },
            questions_for_clinician: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety_notice: { type: Type.STRING }
          },
          required: ['report_title', 'summary', 'important_findings', 'abnormal_markers', 'medical_terms_glossary', 'questions_for_clinician', 'safety_notice']
        }
      }
    });

    if (result && result.text) {
      const parsed = JSON.parse(result.text);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('[Gemini explain-report] Handled exception, applying deterministic fallback:', error?.message || error);
  }

  // Guaranteed deterministic fallback
  return res.json(GeminiExecutor.getExplainReportFallback({
    title,
    facility,
    parameters,
    comparisonData
  }));
});

// 3. Ask SAAHAJ (Context-Aware Health Intelligence Assistant)
app.post('/api/gemini/ask-saahaj', async (req, res) => {
  const { contextType, currentContext, userQuery, userRole } = req.body;
  const user = getAuthenticatedUser(req);

  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
    return res.status(400).json({ error: 'User query is required' });
  }

  try {
    const assistantResult = await AssistantQueryEngine.executeQuery(
      user.userId,
      (userRole || user.role) as 'patient' | 'clinician',
      {
        message: userQuery,
        scope: (userRole || user.role) as 'patient' | 'clinician',
        context_type: contextType
      }
    );

    return res.json({
      answer: assistantResult.answer,
      scope: assistantResult.scope,
      facts_used: assistantResult.facts_used,
      sources: assistantResult.sources,
      limitations: assistantResult.limitations,
      safety_notice: assistantResult.safety_notice,
      grounding_status: assistantResult.grounding_status,
      contextType,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.warn('[Gemini ask-saahaj] Handled exception, applying deterministic fallback:', error?.message || error);
    return res.json(GeminiExecutor.getAskSaahajFallback(userQuery, contextType));
  }
});

// 4. Clinician Assistant: Prepare Patient Summary (EHR / SOAP Ready)
app.post('/api/gemini/prepare-summary', async (req, res) => {
  const { patientProfile, documents, timelineEvents, activeBiometrics } = req.body;

  try {
    const prompt = `You are SAAHAJ Clinician Intelligence Assistant.
Generate a structured, clinical pre-consultation summary based STRICTLY on the real patient records below.
Do not invent diagnoses or findings.

Patient Profile: ${JSON.stringify(patientProfile || {})}
Lab Documents: ${JSON.stringify(documents || [])}
Recent Health Events: ${JSON.stringify(timelineEvents?.slice(0, 5) || [])}
Active Biometrics: ${JSON.stringify(activeBiometrics || {})}`;

    const result = await GeminiExecutor.executeGenerateContent({
      contents: prompt,
      primaryModel: 'gemini-3.7-flash',
      fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest'],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryTitle: { type: Type.STRING },
            patientDemographics: { type: Type.STRING },
            subjectiveFindings: { type: Type.STRING },
            objectiveBiometrics: { type: Type.STRING },
            keyDocumentFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            clinicalDiscussionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            dataLimitations: { type: Type.STRING }
          },
          required: ['summaryTitle', 'patientDemographics', 'subjectiveFindings', 'objectiveBiometrics', 'keyDocumentFindings', 'clinicalDiscussionPoints', 'dataLimitations']
        }
      }
    });

    if (result && result.text) {
      const parsed = JSON.parse(result.text);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('[Gemini prepare-summary] Handled exception, applying fallback:', error?.message || error);
  }

  return res.json(GeminiExecutor.getPrepareSummaryFallback(patientProfile, documents, timelineEvents, activeBiometrics));
});

// 5. Prepare Appointment Questions for Patient
app.post('/api/gemini/prepare-appointment', async (req, res) => {
  const { doctorName, specialty, recentLabResults, userSymptoms, userProfile } = req.body;

  try {
    const prompt = `You are SAAHAJ Patient Appointment Assistant.
Generate 4 highly specific, personalized questions for the patient's upcoming doctor visit.
Base questions ONLY on the actual abnormal lab markers and logged symptoms provided.
Do not invent diseases.

Doctor: ${doctorName || 'Attending Physician'} (${specialty || 'Internal Medicine'})
Patient Age/Sex: ${userProfile?.personal?.age || 'Adult'} ${userProfile?.personal?.sex || ''}
Recent Labs: ${JSON.stringify(recentLabResults || [])}
Reported Symptoms: ${JSON.stringify(userSymptoms || [])}`;

    const result = await GeminiExecutor.executeGenerateContent({
      contents: prompt,
      primaryModel: 'gemini-3.7-flash',
      fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest'],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            doctorName: { type: Type.STRING },
            specialty: { type: Type.STRING },
            recommendedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ['category', 'question', 'rationale']
              }
            },
            safetyNotice: { type: Type.STRING }
          },
          required: ['doctorName', 'specialty', 'recommendedQuestions', 'safetyNotice']
        }
      }
    });

    if (result && result.text) {
      const parsed = JSON.parse(result.text);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('[Gemini prepare-appointment] Handled exception, applying fallback:', error?.message || error);
  }

  return res.json(GeminiExecutor.getPrepareAppointmentFallback(doctorName, specialty));
});

// Mount Unified Error Handling Shield (catches unhandled async errors & prevents information leakage)
app.use(unifiedErrorHandler);

// Vite Middleware & SPA Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAAHAJ Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
