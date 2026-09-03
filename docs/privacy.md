# SAAHAJ Privacy & Data Sovereignty Specification

## 1. Zero-Knowledge Principles
SAAHAJ treats patient privacy as an immutable mathematical contract. Medical information is never sold, never leveraged for model training without consent, and never shared across organizational tenants.

## 2. Patient Sovereignty Primitives

### 2.1 Complete Patient Data Export (`GET /api/v1/patient/export`)
Generates a portable, cryptographically signed JSON archive containing:
- Ingested document records and bounding-box coordinates
- Structured biomarker extractions and normalized units
- Chronological timeline events
- Machine learning risk assessments and SHAP factor weights
- Medical imaging studies and annotations
- Approved clinician consultation notes
- Full security audit log

### 2.2 Complete Cryptographic Purge (`POST /api/v1/patient/delete`)
Permanently removes all database rows, vector embeddings, cached OCR outputs, extracted facts, timeline records, and imaging heatmaps belonging to the requesting user.
