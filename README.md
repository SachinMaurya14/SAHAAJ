# SAAHAJ ; Clinical Health Intelligence & Longitudinal Archive

> **Production-Grade, Explainable, and Grounded Health Intelligence Platform**
> *Bridging Patient Understanding and Clinician Decision-Support with Verifiable Provenance*

---

## 🌟 Executive Overview
**SAAHAJ** (Sanskrit: *Natural, Grounded, Intuitive*) is a medical-grade health intelligence platform engineered to transform unstructured, heterogeneous clinical records—laboratory PDFs, radiological chest X-rays, biomarker trajectories, and patient-reported symptoms—into actionable, explainable, and grounded insights.

Unlike generic conversational AI wrappers that blend search and inference into unverified hallucinations, SAAHAJ strictly isolates **deterministic BioNLP extraction**, **hybrid dense+sparse literature grounding (RAG)**, **calibrated tabular machine learning (ASCVD, Diabetes, FIB-4)**, **deep convolutional radiology (DenseNet-121 Grad-CAM)**, and **human-in-the-loop clinician SOAP synthesis**.

---

## 🏛️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                            SAAHAJ ARCHITECTURE TOPOLOGY                           |
+-----------------------------------------------------------------------------------+
| [Edge Client] React 18 + Tailwind CSS + WebGL Biophysical Interactive Experience   |
+-----------------------------------------------------------------------------------+
                                         | (HTTPS / WSS / Bearer Authentication)
                                         v
+-----------------------------------------------------------------------------------+
| [Security Gateway & Shield] Express + CSP + Sliding Window Rate Limiting + CORS  |
+-----------------------------------------------------------------------------------+
       |                    |                       |                    |
       v                    v                       v                    v
+---------------+  +------------------+  +--------------------+  +------------------+
| BioNLP Parser |  | Hybrid Grounding |  | Tabular ML Engine  |  | DenseNet-121 CV  |
| RegEx + NegEx |  | Dense + BM25 RRF |  | ASCVD, T2D, FIB-4  |  | Grad-CAM Saliency|
+---------------+  +------------------+  +--------------------+  +------------------+
       |                    |                       |                    |
       +--------------------+-----------------------+--------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| [Data Persistence] PostgreSQL + pgvector + Isolated Private Storage + Audit Trail|
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| [Observability V9] OpenTelemetry Tracing + PSI Drift Monitors + Gold Probes       |
+-----------------------------------------------------------------------------------+
```

---

## 🔬 Core Capabilities

### 1. Deterministic BioNLP & Document Ingestion
- **Bounding-Box Preservation**: Extracts clinical biomarkers with exact page coordinates.
- **NegEx Negation Detection**: Filters negated phrases (`"no signs of consolidation"`) to prevent false positive entity tagging.
- **Unit Standardizer**: Automatically normalizes clinical units across international lab standards (`mg/dL`, `mmol/L`, `g/dL`).

### 2. Hybrid Retrieval-Augmented Grounding (RAG)
- **Reciprocal Rank Fusion (RRF)**: Merges dense semantic embeddings (`Cosine Distance`) with sparse keyword matching (`BM25`) via formula: `RRF = 0.6 * Dense + 0.4 * BM25`.
- **Citation Reconciliation Engine**: Verifies that every assertion has an exact document span or literature citation anchor.

### 3. Calibrated Tabular Risk Modeling & Explainability
- **ASCVD 10-Year Risk**: 2013 ACC/AHA Pooled Cohort Equations.
- **Type-2 Diabetes Risk**: ADA Scoring framework.
- **FIB-4 Liver Fibrosis Index**: Platelets, AST, ALT, and age calculations.
- **SHAP Feature Attribution**: Explains positive and negative factor contributions to patients and doctors.

### 4. Deep Radiology & Saliency Mapping
- **CheXNet DenseNet-121 Architecture**: Multi-label classification across 14 chest pathologies.
- **Grad-CAM Saliency**: Computes gradients at `conv5_block16_concat` to visualize anatomical regions of interest.

### 5. Clinician Intelligence & SOAP Engine
- **Automated Consultation Briefcase**: Synthesizes pre-consultation Subjective, Objective, Assessment, and Plan notes.
- **Human-in-the-Loop Review**: Allows physicians to review, edit, approve, and share explanations.

### 6. Patient Sovereignty & Zero-Knowledge Privacy
- **One-Click Export**: `GET /api/v1/patient/export` exports complete structured medical records.
- **Instant Cryptographic Purge**: `POST /api/v1/patient/delete` permanently purges all documents, vectors, and facts.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 20.x LTS
- Docker Engine 24.0+
- Gemini API Key (optional for development; deterministic fallbacks active)

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```
Navigate to `http://localhost:3000`.

### Production Build & Launch
```bash
# 1. Compile Vite client and bundle server
npm run build

# 2. Run production server
npm run start
```

### Docker Container Run
```bash
docker build -t saahaj:v10 .
docker run -p 3000:3000 -e GEMINI_API_KEY="your-api-key" saahaj:v10
```

---

## 🛡️ Health & Readiness Endpoints
- **Liveness Probe**: `GET /health/live` -> Returns HTTP 200 with service uptime.
- **Readiness Probe**: `GET /health/ready` -> Returns HTTP 200 with sub-engine health and memory stats.

---

## 📜 Clinical Safety & Ethical Mandate
SAAHAJ is designed strictly as an **educational and clinical decision-support tool**. It does **not** provide autonomous medical diagnoses, does **not** prescribe pharmaceuticals, and does **not** replace consultation with a licensed medical doctor.

---

## 📄 License
SPDX-License-Identifier: Apache-2.0
&copy; MMXXVI SAAHAJ Archive. All Rights Reserved.
