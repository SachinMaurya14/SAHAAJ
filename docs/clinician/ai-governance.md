# SAAHAJ AI Clinical Governance & Safety Boundaries (V8)

## 1. Safety Boundaries
SAAHAJ is designed strictly as a Clinical Decision Support (CDS) tool.

### Permitted System Functions:
- Summarizing and organizing structured medical records.
- Detecting longitudinal trajectories and mathematical deltas.
- Highlighting information gaps and data conflicts.
- Presenting machine vision saliency maps and tabular ML probabilities.
- Generating draft plain-language patient education materials for physician review.

### Prohibited Autonomous Actions:
- SAAHAJ does NOT autonomously make medical diagnoses.
- SAAHAJ does NOT prescribe medications, alter dosages, or order medical tests.
- SAAHAJ does NOT declare clinical clearance.

## 2. Distinction of Artifacts
- **AI-Generated Draft**: Labeled clearly as `AI Draft (v1)`.
- **Clinician-Edited Draft**: Labeled as `Clinician Edited (v2)`.
- **Clinician-Approved Final**: Labeled as `Clinician-Reviewed Summary (v3)`.
