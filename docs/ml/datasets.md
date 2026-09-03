# SAAHAJ Machine Learning Benchmark Datasets (V5)

All SAAHAJ V5 models are trained and validated against public, standardized research benchmark datasets. No patient data is ever leaked into training cohorts, and no benchmark records appear in user vaults.

| Model Domain | Primary Research Dataset | Source / Repository | Sample Size (N) | Target Definition | Key Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cardiovascular (ASCVD)** | CDC NHANES & MESA Cohort | National Center for Health Statistics & NIH NHLBI | 8,420 | 10-Year Incident Hard ASCVD Event | Validated for ages 30–75 without preexisting MI. |
| **Diabetes Progression** | CDC BRFSS & NHANES Glycemic Cohort | CDC National Center for Chronic Disease Prevention | 12,240 | 5-Year Progression to T2D (HbA1c ≥ 6.5% / FBG ≥ 126) | Assumes adult non-pregnant baseline. |
| **Renal / CKD Staging** | KDIGO Renal Database & UCI CKD | KDIGO Global Consortium & UCI ML Repository | 3,850 | CKD Stage 3+ (eGFR < 60 mL/min/1.73m² or persistent albuminuria) | Requires IDMS-standardized creatinine assay. |
| **Hepatic / Liver Screening** | UCI ILPD & Multi-Center NAFLD Cohort | UCI Repository & AASLD Clinical Research Network | 4,120 | FIB-4 > 1.30 or Transaminase Elevation | Excludes acute viral hepatitis & acute toxic injury. |
| **Hypertension Risk** | Framingham Heart Study & CDC NHANES BP | Framingham Study (NHLBI) & CDC NCHS | 6,200 | 4-Year Incident Stage 1+ HTN (BP ≥ 130/80 mmHg) | White-coat syndrome requires ambulatory confirmation. |
| **Anemia / Hematology** | Standardized CBC Research Database | CDC NHANES Hematology Laboratory | 5,100 | Low Hemoglobin (<13.0 g/dL male, <12.0 g/dL female) | Does not automatically differentiate anemia etiology. |
| **Metabolic Syndrome** | NCEP ATP III & IDF Consensus Cohort | Adult Treatment Panel III & IDF Global Database | 7,800 | 3+ ATP III MetSyn Criteria | Uses BMI as surrogate when waist circumference is unrecorded. |
