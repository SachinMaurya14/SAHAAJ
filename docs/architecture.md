# SAAHAJ System Architecture Specification (V10 Production)

## 1. Executive Summary
SAAHAJ is an interpretable, patient-empowering health intelligence platform that transforms heterogeneous medical reports (PDFs, lab panels, radiology images, biometrics) into structured, chronologically aligned, and mathematically grounded health insights for patients and clinicians.

```
+-----------------------------------------------------------------------------------+
|                            SAAHAJ PRODUCTION TOPOLOGY                            |
+-----------------------------------------------------------------------------------+
| [Edge / Client] React 18 SPA + Tailwind CSS + WebGL Biophysical Interactive Scene  |
+-----------------------------------------------------------------------------------+
                                         |  (HTTPS / WSS / Bearer Token)
                                         v
+-----------------------------------------------------------------------------------+
| [API Gateway & Shield] Express + CSP + Sliding Window Rate Limiting + CORS       |
+-----------------------------------------------------------------------------------+
       |                    |                       |                    |
       v                    v                       v                    v
+---------------+  +------------------+  +--------------------+  +------------------+
| BioNLP Parser |  | Hybrid Grounding |  | Tabular ML Models  |  | DenseNet-121 CV  |
| RegEx + NegEx |  | Dense + BM25 RRF |  | ASCVD, T2D, FIB-4  |  | Grad-CAM Heatmap |
+---------------+  +------------------+  +--------------------+  +------------------+
       |                    |                       |                    |
       +--------------------+-----------------------+--------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| [Persistence Engine] PostgreSQL + pgvector + Isolated Private Storage + Audit Trail|
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| [Observability V9] OpenTelemetry Tracing + PSI Drift Monitors + Gold Probes       |
+-----------------------------------------------------------------------------------+
```

## 2. Core Subsystems

### 2.1 Clinical BioNLP & Document Ingestion
- **Document Normalizer**: PDF & Image text extraction with physical page bounding box preservation.
- **NegEx Negation Filter**: Detects clinical negations ("no evidence of infiltrates") to prevent false extraction.
- **Biomarker Standardizer**: Converts clinical lab variations (e.g. `Glycated Hemoglobin` -> `HbA1c`) with unit normalization (`mg/dL` vs `mmol/L`).

### 2.2 Hybrid Retrieval-Augmented Grounding (RAG)
- **Reciprocal Rank Fusion (RRF)**: Merges dense vector embeddings with sparse BM25 keyword matching (`RRF_score = 0.6 * Dense + 0.4 * BM25`).
- **Citation Reconciliation Engine**: Verifies that every assertion has an exact bibliographic or document chunk reference.

### 2.3 Calibrated Tabular Risk Engine
- **ASCVD 10-Year Risk**: 2013 ACC/AHA Pooled Cohort Equations.
- **Type-2 Diabetes Risk**: ADA Scoring with BMI, fasting glucose, and family history.
- **FIB-4 Liver Fibrosis Index**: Platelets, ALT, AST, and age.
- **Feature Attribution (SHAP)**: Local Shapley additive explanations for every input variable.

### 2.4 Deep Radiology & Saliency (DenseNet-121)
- 14-pathology multi-label classification trained on chest radiographs.
- Gradient-weighted Class Activation Mapping (Grad-CAM) computing gradients at `conv5_block16_concat`.

### 2.5 Clinician Intelligence & SOAP Engine
- Synthesizes longitudinal patient records into standard Subjective, Objective, Assessment, and Plan drafts.
- Strict human-in-the-loop review, edit, and sign-off workflow.
