# SAAHAJ 5-10 Minute Demonstration Script

## Audience: Clinical Leads, HealthTech Investors, Senior Engineering Recruiters

---

### Step 1: The Landing Page & Philosophy (0:00 - 1:30)
- **Visual**: Show the editorial, high-contrast dark/light landing view with the 3D Biophysical Scene.
- **Narrative**: *"Welcome to SAAHAJ. SAAHAJ is Sanskrit for natural, grounded clarity. Today, patient health records are trapped in opaque PDF scans and fragmented portals. SAAHAJ transforms this data into an interpretable, mathematically grounded health intelligence archive."*
- **Action**: Highlight the 5-Stage Interactive Pipeline: Ingestion &rarr; Grounding &rarr; Calibrated ML &rarr; Deep Vision &rarr; Clinician Synthesis.

---

### Step 2: Patient Dashboard & Longitudinal Comparison (1:30 - 3:30)
- **Visual**: Navigate to `Health Overview` and `Report Comparison`.
- **Narrative**: *"Here in the Patient Workspace, we see Aarav Sharma, a 58-year-old male. In January 2026, his baseline HbA1c was 6.4%. In August 2026, his follow-up panel showed an increase to 6.8%."*
- **Action**: Click on `Compare My Reports` to demonstrate the split-view comparison with interactive biomarker deltas and bounding-box page citations.

---

### Step 3: Explainable Risk Screening & SHAP Attributions (3:30 - 5:00)
- **Visual**: Navigate to `Risk Assessment` (`/app/risk-assessment`).
- **Narrative**: *"Rather than guessing, SAAHAJ calculates peer-reviewed risk equations: the 2013 ACC/AHA ASCVD 10-year risk (14.2%) and ADA Diabetes risk. Notice our SHAP factor attribution breakdown: we explain to the patient exactly why systolic blood pressure (+0.42) and HbA1c drove the score, without alarming medical jargon."*

---

### Step 4: Medical Imaging & Grad-CAM Heatmaps (5:00 - 6:30)
- **Visual**: Navigate to `Imaging & Vision` (`/app/imaging`).
- **Narrative**: *"For radiology, we employ a DenseNet-121 architecture trained on 14 chest pathologies. When viewing the PA chest radiograph, the user can toggle the Grad-CAM activation heatmap, revealing localized attention over the enlarged cardiac silhouette (cardiomegaly probability 0.74)."*

---

### Step 5: Clinician Workspace & Human-in-the-Loop SOAP Synthesis (6:30 - 8:30)
- **Visual**: Switch role to `Clinician` and navigate to `Clinician Assistant` (`/app/clinician`).
- **Narrative**: *"For attending physicians, SAAHAJ generates an instant pre-consultation briefcase: structured Subjective, Objective, Assessment, and Plan notes with complete provenance back to raw records. The clinician edits, signs off, and creates an approved, patient-friendly explanation draft."*

---

### Step 6: Governance, Evaluation, & Sovereignty (8:30 - 10:00)
- **Visual**: Show `Safety Policy` (`/safety`), `Model Cards` (`/provenance`), and `Privacy Center` (`/app/privacy`).
- **Narrative**: *"Finally, our safety policy strictly enforces non-diagnostic boundaries. The patient has unconditional data sovereignty with one-click full data export and instant cryptographic deletion."*
