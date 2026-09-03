# SAAHAJ Clinician Workflow & Review Lifecycle (V8)

## 1. Clinician Workspace Workflow
The clinician experience proceeds in five distinct phases:

1. **Patient Context & Snapshot**:
   - The clinician opens an authorized patient record.
   - SAAHAJ loads the deterministic `ClinicalSnapshot` (vitals, laboratory facts with longitudinal deltas, V5 ML risk scores, V6 imaging saliency findings, data gaps, and inter-source conflicts).

2. **AI Clinical Synthesis Generation**:
   - The engine generates a structured synthesis draft covering 9 validated sections:
     1. Patient Context & Demographics
     2. Recent Longitudinal Changes
     3. Key Laboratory & Biomarker Findings
     4. Tabular Risk Signals & Feature Contributions
     5. Medical Imaging Signals & Radiologic Context
     6. Medication & Regimen Context
     7. Information & Documentation Gaps
     8. Cross-Modality / Historical Conflicts
     9. Questions for Clinical Review
     10. Structured SOAP Consultation Synthesis (Subjective, Objective, Assessment Support, Plan Discussion Points)

3. **Human-in-the-Loop Review**:
   - For every section, the clinician can:
     - **Accept**: Validates the section as clinician-approved.
     - **Edit**: Modifies the text directly in the rich clinician editor with version diff tracking.
     - **Reject**: Removes the section with mandatory audit rationale.
     - **Regenerate**: Re-queries the engine with refined context.

4. **Quality Gates & Finalization**:
   - Before signing, the system checks:
     - No unsupported numbers or hallucinated biomarker deltas.
     - All structured claims mapped to source records.
     - All sections reviewed by clinician.
   - Finalized output is stamped as **"Clinician-Reviewed Summary (v2+)"**.

5. **Patient Handoff & Explanation**:
   - Clinician selects technical findings and generates plain-language, 8th-grade explanations.
   - Clinician reviews, edits, and approves before sharing to the Patient Portal.
