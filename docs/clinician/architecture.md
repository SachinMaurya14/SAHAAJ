# SAAHAJ Clinician Intelligence Architecture (V8)

## 1. System Overview
The SAAHAJ Clinician Intelligence Workspace (V8) provides a unified clinical synthesis, human-in-the-loop review, and longitudinal intelligence platform designed for attending physicians, fellows, and primary care practitioners.

```
+-----------------------------------------------------------------------------------+
|                              PATIENT DATA LAYER                                   |
|   (OCR Reports, Structured NLP Facts, V5 ML Models, V6 Vision, V7 Timeline)      |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     DETERMINISTIC CLINICAL SNAPSHOT & BRIEFING                    |
|   (Vitals, Longitudinal Deltas, Lab Facts, ML Signals, Data Gaps & Conflicts)     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     STRUCTURED AI SYNTHESIS PIPELINE (Gemini)                     |
|   (Patient Context, Recent Changes, Findings, ML Signals, Imaging, Gaps, SOAP)    |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     HUMAN-IN-THE-LOOP CLINICIAN REVIEW ENGINE                     |
|   (Accept / Edit / Reject / Regenerate, Versioning v1->v2->v3, Quality Gates)     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     EVIDENCE LINEAGE & PATIENT HANDOFF                            |
|   (Lineage Graph, Patient-Friendly Plain Language Explanations, Scoped Visibility)|
+-----------------------------------------------------------------------------------+
```

## 2. Core Principles
1. **Human Decision Authority**: AI acts strictly as an organizational and drafting assistant. The clinician retains full legal and clinical decision authority.
2. **Deterministic Fact Grounding**: All numerical values, laboratory deltas, and dates are computed deterministically prior to LLM synthesis.
3. **Traceable Lineage**: Every claim in the synthesis maps directly to source records, ML model versions, imaging studies, or medical knowledge citations.
