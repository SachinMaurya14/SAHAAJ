# SAAHAJ Clinical Privacy & Scoping Specification (V8)

## 1. Role-Based Access Control (RBAC)
- **PATIENT**: Scoped strictly to own health profile, uploaded documents, and clinician-approved `PATIENT_VISIBLE` notes and explanations.
- **CLINICIAN**: Scoped to authorized patient records (`ClinicianPatientAccess`). Can author private `CLINICIAN_ONLY` consultation notes.
- **ADMIN**: System administration and telemetry monitoring.

## 2. Content Visibility Tiers
1. `PATIENT_VISIBLE`: Shared with the patient on the client portal.
2. `CLINICIAN_ONLY`: Visible exclusively to licensed clinicians during consultation and review.
3. `INTERNAL_AI_DRAFT`: System-internal draft prior to clinician review.
