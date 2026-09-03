import { 
  MedicalDocument, 
  LongitudinalComparison, 
  TimelineItem, 
  TabularRiskModel, 
  MedicalImageStudy, 
  HealthProfile, 
  HealthInsight,
  AppointmentPrep
} from '../types';

export const initialHealthProfile: HealthProfile = {
  personal: {
    fullName: "Aarav Sharma",
    age: 44,
    sex: "Male",
    heightCm: 176,
    weightKg: 81.5,
    bloodType: "B+",
    bpSystolic: 134,
    bpDiastolic: 86,
    restingHeartRate: 72
  },
  lifestyle: {
    activityLevel: "Moderately Active",
    sleepHoursPerNight: 6.5,
    dietaryPattern: "Balanced",
    smokingStatus: "Former",
    alcoholUnitsPerWeek: 3
  },
  medicalHistory: {
    diagnosedConditions: ["Pre-Diabetes (Screened 2024)", "Mild Primary Hypertension"],
    familyHistory: ["Type 2 Diabetes (Maternal)", "Coronary Artery Disease (Paternal)"],
    medications: [
      { name: "Metformin", dosage: "500 mg", frequency: "Once daily with dinner", adherenceRate: 94, prescribedFor: "Glycemic regulation" },
      { name: "Telmisartan", dosage: "20 mg", frequency: "Once daily morning", adherenceRate: 98, prescribedFor: "Blood pressure management" },
      { name: "Vitamin D3", dosage: "2000 IU", frequency: "Daily morning", adherenceRate: 85, prescribedFor: "Supplementation" }
    ],
    allergies: ["Penicillin (Mild Urticaria)", "Dust Mites"]
  }
};

export const sampleMedicalDocuments: MedicalDocument[] = [
  {
    id: "doc-aug-2026-cmp",
    title: "Comprehensive Metabolic & Lipid Panel",
    type: "lab_report",
    date: "2026-08-14",
    facility: "Metropolis Diagnostics & Health Sciences",
    orderingPhysician: "Dr. Sunita Rao, MD (Internal Medicine)",
    status: "Analyzed",
    fileSize: "1.8 MB",
    parametersCount: 14,
    abnormalCount: 3,
    summary: "Routine 6-month follow-up metabolic panel. Shows mild elevation in Fasting Blood Glucose and LDL-C; Kidney function (eGFR & Creatinine) and Electrolytes remain well within normal reference thresholds.",
    rawTextPreview: `METROPOLIS DIAGNOSTICS LAB REPORT
Patient: Aarav Sharma | Age/Sex: 44Y/M | Date: 14-Aug-2026
Test: Comprehensive Metabolic Panel & Lipid Profile

GLUCOSE, FASTING: 118 mg/dL (Ref: 70 - 99 mg/dL) [HIGH]
HbA1c (GLYCATED HEMOGLOBIN): 6.2 % (Ref: 4.0 - 5.6 %) [HIGH]
TOTAL CHOLESTEROL: 204 mg/dL (Ref: < 200 mg/dL) [HIGH]
LDL CHOLESTEROL: 128 mg/dL (Ref: < 100 mg/dL) [HIGH]
HDL CHOLESTEROL: 46 mg/dL (Ref: > 40 mg/dL) [NORMAL]
TRIGLYCERIDES: 155 mg/dL (Ref: < 150 mg/dL) [BORDERLINE]
SERUM CREATININE: 0.95 mg/dL (Ref: 0.70 - 1.30 mg/dL) [NORMAL]
eGFR (CKD-EPI): 91 mL/min/1.73m² (Ref: > 60 mL/min/1.73m²) [NORMAL]
ALT (SGPT): 38 U/L (Ref: 10 - 40 U/L) [NORMAL]
AST (SGOT): 29 U/L (Ref: 10 - 35 U/L) [NORMAL]
SERUM SODIUM: 140 mEq/L (Ref: 135 - 145 mEq/L) [NORMAL]
SERUM POTASSIUM: 4.3 mEq/L (Ref: 3.5 - 5.0 mEq/L) [NORMAL]
HEMOGLOBIN: 14.8 g/dL (Ref: 13.5 - 17.5 g/dL) [NORMAL]
WBC COUNT: 6.8 x10^3/uL (Ref: 4.5 - 11.0 x10^3/uL) [NORMAL]`,
    extractedParameters: [
      {
        id: "p-glu-aug",
        name: "Fasting Blood Glucose",
        category: "Metabolic & Glycemic",
        value: 118,
        unit: "mg/dL",
        referenceRangeMin: 70,
        referenceRangeMax: 99,
        referenceRangeText: "70 – 99 mg/dL",
        status: "high",
        patientExplanation: "Your fasting glucose is slightly above the standard fasting range (70–99 mg/dL). It indicates blood sugar levels following an overnight fast, commonly monitored in pre-diabetes management.",
        clinicianNotes: "Fasting glucose elevated. Patient has existing metformin 500mg daily regimen.",
        sourcePage: 1,
        sourceSnippet: "GLUCOSE, FASTING: 118 mg/dL (Ref: 70 - 99 mg/dL) [HIGH]",
        confidence: 0.98,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-hba1c-aug",
        name: "Glycated Hemoglobin (HbA1c)",
        category: "Metabolic & Glycemic",
        value: 6.2,
        unit: "%",
        referenceRangeMin: 4.0,
        referenceRangeMax: 5.6,
        referenceRangeText: "4.0 – 5.6 %",
        status: "high",
        patientExplanation: "HbA1c reflects your average blood sugar over the last 2 to 3 months. A level of 6.2% is within the pre-diabetes reference category (5.7%–6.4%), improved from your previous report.",
        clinicianNotes: "Decreased from 6.6% in Jan 2026. Demonstrates positive trajectory with lifestyle + metformin.",
        sourcePage: 1,
        sourceSnippet: "HbA1c (GLYCATED HEMOGLOBIN): 6.2 % (Ref: 4.0 - 5.6 %) [HIGH]",
        confidence: 0.99,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-ldl-aug",
        name: "LDL Cholesterol",
        category: "Lipid Profile",
        value: 128,
        unit: "mg/dL",
        referenceRangeMin: 0,
        referenceRangeMax: 100,
        referenceRangeText: "< 100 mg/dL",
        status: "high",
        patientExplanation: "LDL is often called 'low-density lipoprotein' or cholesterol carrying particles. Your value is slightly above the optimal 100 mg/dL target.",
        clinicianNotes: "LDL 128 mg/dL. Monitor alongside ASCVD 10-year risk profile.",
        sourcePage: 1,
        sourceSnippet: "LDL CHOLESTEROL: 128 mg/dL (Ref: < 100 mg/dL) [HIGH]",
        confidence: 0.97,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-creat-aug",
        name: "Serum Creatinine",
        category: "Kidney Function",
        value: 0.95,
        unit: "mg/dL",
        referenceRangeMin: 0.70,
        referenceRangeMax: 1.30,
        referenceRangeText: "0.70 – 1.30 mg/dL",
        status: "within_range",
        patientExplanation: "Creatinine is a waste product filtered by your kidneys. Your level is completely normal, showing healthy filtration balance.",
        clinicianNotes: "Normal baseline kidney filtration indicator.",
        sourcePage: 1,
        sourceSnippet: "SERUM CREATININE: 0.95 mg/dL (Ref: 0.70 - 1.30 mg/dL) [NORMAL]",
        confidence: 0.99,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-egfr-aug",
        name: "Estimated GFR (eGFR)",
        category: "Kidney Function",
        value: 91,
        unit: "mL/min/1.73m²",
        referenceRangeMin: 60,
        referenceRangeMax: 120,
        referenceRangeText: "> 60 mL/min/1.73m²",
        status: "within_range",
        patientExplanation: "eGFR estimates how efficiently your kidneys filter blood. 91 mL/min indicates normal kidney function.",
        sourcePage: 1,
        sourceSnippet: "eGFR (CKD-EPI): 91 mL/min/1.73m² (Ref: > 60 mL/min/1.73m²)",
        confidence: 0.96,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-alt-aug",
        name: "ALT (Alanine Aminotransferase)",
        category: "Liver Function",
        value: 38,
        unit: "U/L",
        referenceRangeMin: 10,
        referenceRangeMax: 40,
        referenceRangeText: "10 – 40 U/L",
        status: "within_range",
        patientExplanation: "ALT is a liver enzyme. A level of 38 U/L is within the laboratory's expected normal range.",
        sourcePage: 1,
        sourceSnippet: "ALT (SGPT): 38 U/L (Ref: 10 - 40 U/L) [NORMAL]",
        confidence: 0.98,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-hb-aug",
        name: "Hemoglobin",
        category: "Hematology",
        value: 14.8,
        unit: "g/dL",
        referenceRangeMin: 13.5,
        referenceRangeMax: 17.5,
        referenceRangeText: "13.5 – 17.5 g/dL",
        status: "within_range",
        patientExplanation: "Hemoglobin carries oxygen in your red blood cells. Your value is healthy and well-balanced.",
        sourcePage: 1,
        sourceSnippet: "HEMOGLOBIN: 14.8 g/dL (Ref: 13.5 - 17.5 g/dL) [NORMAL]",
        confidence: 0.99,
        provenance: "EXTRACTED_FACT"
      }
    ],
    provenanceDetails: {
      ocrEngine: "DeepDoc-Medical OCR v2.4 (High-Density Layout)",
      nlpModel: "Clinical-BioNLP-NER v3.1",
      extractionDate: "2026-08-14 16:42:10 UTC",
      extractionConfidence: 0.982
    }
  },
  {
    id: "doc-jan-2026-cmp",
    title: "Baseline Comprehensive Metabolic Panel",
    type: "lab_report",
    date: "2026-01-18",
    facility: "Metropolis Diagnostics & Health Sciences",
    orderingPhysician: "Dr. Sunita Rao, MD",
    status: "Analyzed",
    fileSize: "1.6 MB",
    parametersCount: 12,
    abnormalCount: 4,
    summary: "Annual executive health checkup. Revealed elevated Fasting Blood Sugar (134 mg/dL), HbA1c (6.6%), and mild hepatic transaminase elevation (ALT 46 U/L).",
    extractedParameters: [
      {
        id: "p-glu-jan",
        name: "Fasting Blood Glucose",
        category: "Metabolic & Glycemic",
        value: 134,
        unit: "mg/dL",
        referenceRangeMin: 70,
        referenceRangeMax: 99,
        referenceRangeText: "70 – 99 mg/dL",
        status: "high",
        patientExplanation: "Significantly elevated fasting blood sugar prompting initiation of lifestyle and dietary intervention.",
        sourcePage: 1,
        sourceSnippet: "GLUCOSE, FASTING: 134 mg/dL (Ref: 70 - 99 mg/dL)",
        confidence: 0.99,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-hba1c-jan",
        name: "Glycated Hemoglobin (HbA1c)",
        category: "Metabolic & Glycemic",
        value: 6.6,
        unit: "%",
        referenceRangeMin: 4.0,
        referenceRangeMax: 5.6,
        referenceRangeText: "4.0 – 5.6 %",
        status: "high",
        patientExplanation: "HbA1c above 6.5% threshold indicating formal pre-diabetic / early glycemic dysregulation state.",
        sourcePage: 1,
        sourceSnippet: "HbA1c: 6.6 % (Ref: 4.0 - 5.6 %)",
        confidence: 0.99,
        provenance: "EXTRACTED_FACT"
      },
      {
        id: "p-alt-jan",
        name: "ALT (Alanine Aminotransferase)",
        category: "Liver Function",
        value: 46,
        unit: "U/L",
        referenceRangeMin: 10,
        referenceRangeMax: 40,
        referenceRangeText: "10 – 40 U/L",
        status: "high",
        patientExplanation: "Mild elevation in liver enzyme, often seen with dietary weight shifts or metabolic changes.",
        sourcePage: 1,
        sourceSnippet: "ALT (SGPT): 46 U/L (Ref: 10 - 40 U/L)",
        confidence: 0.98,
        provenance: "EXTRACTED_FACT"
      }
    ],
    provenanceDetails: {
      ocrEngine: "DeepDoc-Medical OCR v2.4",
      nlpModel: "Clinical-BioNLP-NER v3.1",
      extractionDate: "2026-01-18 11:15:02 UTC",
      extractionConfidence: 0.988
    }
  },
  {
    id: "doc-cxr-jun-2026",
    title: "Chest Radiograph (PA & Lateral View)",
    type: "x_ray",
    date: "2026-06-02",
    facility: "Apollo Imaging & Radiology Institute",
    orderingPhysician: "Dr. K. Narayanan, MD (Pulmonology)",
    status: "Analyzed",
    fileSize: "8.4 MB",
    parametersCount: 6,
    abnormalCount: 0,
    summary: "Routine pre-employment and wellness digital radiograph. Clear lung fields, normal cardiothoracic ratio, no active consolidation or pleural effusion.",
    extractedParameters: [],
    provenanceDetails: {
      ocrEngine: "DICOM-Structured Report Reader v1.8",
      nlpModel: "Rad-BERT Section Parser",
      extractionDate: "2026-06-02 14:20:00 UTC",
      extractionConfidence: 0.975
    }
  }
];

export const longitudinalComparisons: LongitudinalComparison[] = [
  {
    markerName: "Glycated Hemoglobin (HbA1c)",
    category: "Metabolic & Glycemic",
    unit: "%",
    baselineDate: "Jan 2026",
    baselineValue: 6.6,
    currentDate: "Aug 2026",
    currentValue: 6.2,
    referenceRange: "4.0 – 5.6 %",
    deltaPercent: -6.06,
    status: "improved",
    clinicalSignificance: "Significant downward trend (-0.4 percentage points) reflecting positive response to Metformin and physical activity.",
    patientTakeaway: "Your average blood sugar over 3 months improved from 6.6% to 6.2%. This shows your lifestyle adjustments and medication are working in the right direction."
  },
  {
    markerName: "Fasting Blood Glucose",
    category: "Metabolic & Glycemic",
    unit: "mg/dL",
    baselineDate: "Jan 2026",
    baselineValue: 134,
    currentDate: "Aug 2026",
    currentValue: 118,
    referenceRange: "70 – 99 mg/dL",
    deltaPercent: -11.94,
    status: "improved",
    clinicalSignificance: "Decrease of 16 mg/dL. Remains in impaired fasting glucose band.",
    patientTakeaway: "Your morning fasting glucose dropped by 16 points. It is still slightly above normal, so continued monitoring is recommended."
  },
  {
    markerName: "ALT (Liver Enzyme)",
    category: "Liver Function",
    unit: "U/L",
    baselineDate: "Jan 2026",
    baselineValue: 46,
    currentDate: "Aug 2026",
    currentValue: 38,
    referenceRange: "10 – 40 U/L",
    deltaPercent: -17.39,
    status: "improved",
    clinicalSignificance: "Normalized from borderline elevated (46 U/L) to normal physiologic range (38 U/L).",
    patientTakeaway: "Your ALT enzyme returned to normal limits, which often correlates with improved dietary patterns."
  },
  {
    markerName: "LDL Cholesterol",
    category: "Lipid Profile",
    unit: "mg/dL",
    baselineDate: "Jan 2026",
    baselineValue: 122,
    currentDate: "Aug 2026",
    currentValue: 128,
    referenceRange: "< 100 mg/dL",
    deltaPercent: +4.92,
    status: "worsened",
    clinicalSignificance: "Mild upward drift (+6 mg/dL). Deserves discussion regarding saturated fat intake and cardiovascular risk score.",
    patientTakeaway: "Your LDL (often called LDL cholesterol) rose slightly from 122 to 128 mg/dL. This is an ideal topic to review with your doctor."
  },
  {
    markerName: "Serum Creatinine",
    category: "Kidney Function",
    unit: "mg/dL",
    baselineDate: "Jan 2026",
    baselineValue: 0.94,
    currentDate: "Aug 2026",
    currentValue: 0.95,
    referenceRange: "0.70 – 1.30 mg/dL",
    deltaPercent: +1.06,
    status: "stable",
    clinicalSignificance: "Stable renal filtration biomarker without clinical variation.",
    patientTakeaway: "Your kidney filtration markers remain rock solid and steady."
  }
];

export const sampleTimelineItems: TimelineItem[] = [
  {
    id: "time-1",
    date: "August 14, 2026",
    title: "6-Month Follow-Up Metabolic Panel",
    category: "Lab Panel",
    type: "report",
    summary: "HbA1c lowered to 6.2%, Fasting Glucose down to 118 mg/dL. Kidney and Liver markers normal.",
    badge: "14 Biomarkers Analyzed",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    relatedDocId: "doc-aug-2026-cmp",
    metrics: [
      { label: "HbA1c", value: "6.2%", status: "high" },
      { label: "Glucose", value: "118 mg/dL", status: "high" },
      { label: "eGFR", value: "91 mL/min", status: "within_range" }
    ],
    physician: "Dr. Sunita Rao, MD"
  },
  {
    id: "time-2",
    date: "June 02, 2026",
    title: "Digital Chest Radiography (PA)",
    category: "Imaging",
    type: "imaging",
    summary: "Clear lung parenchymal architecture. Normal cardiac silhouette. No focal consolidation.",
    badge: "Deep Learning Screening",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    relatedDocId: "doc-cxr-jun-2026",
    physician: "Dr. K. Narayanan, MD"
  },
  {
    id: "time-3",
    date: "April 10, 2026",
    title: "Cardiovascular 10-Year ASCVD Risk Re-evaluation",
    category: "Risk Evaluation",
    type: "risk_model",
    summary: "Tabular XGBoost model evaluated risk score at 6.4% (Moderate/Borderline category).",
    badge: "Model v2.3.1",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    metrics: [
      { label: "ASCVD Risk", value: "6.4%", status: "within_range" },
      { label: "Completeness", value: "92%", status: "within_range" }
    ]
  },
  {
    id: "time-4",
    date: "February 01, 2026",
    title: "Medication Adjustment: Metformin 500mg",
    category: "Prescription",
    type: "medication",
    summary: "Prescribed Metformin 500mg once daily with dinner for glycemic moderation following Jan labs.",
    badge: "Active Regimen",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    physician: "Dr. Sunita Rao, MD"
  },
  {
    id: "time-5",
    date: "January 18, 2026",
    title: "Annual Health Assessment & Baseline Panel",
    category: "Lab Panel",
    type: "report",
    summary: "Initial baseline screening. Identified pre-diabetes markers (HbA1c 6.6%, Fasting Glucose 134 mg/dL).",
    badge: "Baseline Captured",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    relatedDocId: "doc-jan-2026-cmp",
    physician: "Dr. Sunita Rao, MD"
  }
];

export const sampleRiskModels: TabularRiskModel[] = [
  {
    id: "risk-cardio",
    name: "Cardiovascular ASCVD Risk Screening",
    system: "Cardiovascular",
    riskLevel: "moderate",
    riskScore: 6.4,
    inputCompleteness: 92,
    statusText: "Moderate Screening Signal (Estimated 10-year risk ~6.4%)",
    contributingFactors: [
      { factor: "Systolic Blood Pressure (134 mmHg)", value: "134 mmHg", impact: "elevating", weight: 0.34 },
      { factor: "Age (44 Years, Male)", value: "44 Yrs", impact: "neutral", weight: 0.22 },
      { factor: "LDL Cholesterol (128 mg/dL)", value: "128 mg/dL", impact: "elevating", weight: 0.28 },
      { factor: "Former Smoking History", value: "Quit > 3 yrs ago", impact: "elevating", weight: 0.16 },
      { factor: "HDL Cholesterol (46 mg/dL)", value: "46 mg/dL", impact: "protective", weight: 0.18 }
    ],
    modelProvenance: {
      modelName: "AHA/ACC Pooled Cohort Calibrated Gradient Booster",
      version: "v2.3.1-clinical",
      architecture: "Gradient Boosting (XGBoost)",
      validationDataset: "Multi-Ethnic Study of Atherosclerosis (MESA) + NHANES benchmark",
      calibrationMetric: "Brier Score: 0.084 | C-Statistic: 0.812",
      timestamp: "2026-08-14 17:00:00 UTC",
      limitations: "Model assumes untreated lipid parameters unless statin intensity is explicitly declared. Requires clinician confirmation before changing cardiovascular therapy."
    },
    missingInputs: ["High-Sensitivity CRP (hs-CRP)", "Coronary Artery Calcium (CAC) Score"],
    patientExplanation: "This estimated risk score helps doctors understand long-term heart and vessel health. Your current numbers place you in a moderate screening band, where lifestyle factors like blood pressure control and dietary choices have a strong positive impact.",
    clinicianGuidance: "ASCVD 10-year risk estimated at 6.4%. Review lifestyle optimization and discuss lipid target thresholds based on family history."
  },
  {
    id: "risk-diabetes",
    name: "Type 2 Diabetes Progression Screening",
    system: "Metabolic & Diabetes",
    riskLevel: "elevated",
    riskScore: 14.8,
    inputCompleteness: 100,
    statusText: "Elevated Glycemic Progression Signal (3-Year Horizon)",
    contributingFactors: [
      { factor: "Recent HbA1c (6.2%)", value: "6.2 %", impact: "elevating", weight: 0.42 },
      { factor: "Fasting Glucose (118 mg/dL)", value: "118 mg/dL", impact: "elevating", weight: 0.30 },
      { factor: "Body Mass Index (BMI 26.3)", value: "26.3 kg/m²", impact: "elevating", weight: 0.18 },
      { factor: "Down-trend from Baseline (-0.4% HbA1c)", value: "-0.4 %", impact: "protective", weight: 0.25 }
    ],
    modelProvenance: {
      modelName: "Glycemic Trajectory Random Forest Ensemble",
      version: "v1.9.4",
      architecture: "Random Forest Ensemble",
      validationDataset: "DPP (Diabetes Prevention Program) validation cohort",
      calibrationMetric: "AUC-ROC: 0.84 | Precision-Recall AUC: 0.76",
      timestamp: "2026-08-14 17:00:00 UTC",
      limitations: "Assumes adherence to current metformin regimen. Does not account for acute illness or corticosteroid usage."
    },
    missingInputs: [],
    patientExplanation: "While your HbA1c has improved nicely, your blood sugar is still in the pre-diabetes zone. Keeping up your daily habits and medication adherence helps maintain this downward trend.",
    clinicianGuidance: "Patient responding well to Metformin 500mg. Recommend continuing current pharmacotherapy and repeating HbA1c in 6 months."
  },
  {
    id: "risk-ckd",
    name: "Kidney Health & CKD Screening",
    system: "Renal / CKD",
    riskLevel: "low",
    riskScore: 1.8,
    inputCompleteness: 85,
    statusText: "Low Risk Signal (Kidney filtration optimal)",
    contributingFactors: [
      { factor: "eGFR (91 mL/min/1.73m²)", value: "91 mL/min", impact: "protective", weight: 0.55 },
      { factor: "Serum Creatinine (0.95 mg/dL)", value: "0.95 mg/dL", impact: "protective", weight: 0.35 },
      { factor: "Controlled Blood Pressure", value: "134/86 mmHg", impact: "neutral", weight: 0.10 }
    ],
    modelProvenance: {
      modelName: "CKD-EPI 2021 Calibrated Logistic Regressor",
      version: "v3.0.0",
      architecture: "Calibrated Logistic Regressor",
      validationDataset: "CKD-EPI Consortium Validation",
      calibrationMetric: "R-squared: 0.89",
      timestamp: "2026-08-14 17:00:00 UTC",
      limitations: "Urinary Albumin-to-Creatinine Ratio (uACR) is absent from latest panel. Urine spot check recommended at next annual visit."
    },
    missingInputs: ["Urine Albumin-to-Creatinine Ratio (uACR)"],
    patientExplanation: "Your kidney filtration values are healthy and stable. Routine monitoring continues as part of regular checkups.",
    clinicianGuidance: "Preserved renal function (eGFR > 90). Order spot uACR at next scheduled metabolic panel."
  },
  {
    id: "risk-liver",
    name: "Hepatic & Steatosis Screening",
    system: "Hepatic / Liver",
    riskLevel: "low",
    riskScore: 2.1,
    inputCompleteness: 90,
    statusText: "Low Screening Signal (ALT/AST normalized)",
    contributingFactors: [
      { factor: "ALT (38 U/L)", value: "38 U/L", impact: "protective", weight: 0.40 },
      { factor: "AST (29 U/L)", value: "29 U/L", impact: "protective", weight: 0.30 },
      { factor: "AST/ALT Ratio (0.76)", value: "0.76", impact: "protective", weight: 0.20 }
    ],
    modelProvenance: {
      modelName: "FIB-4 / NAFLD Fibrosis Score Predictor",
      version: "v1.4.2",
      architecture: "Calibrated Logistic Regressor",
      validationDataset: "Hepatology Multi-Center Registry",
      calibrationMetric: "Negative Predictive Value: 96%",
      timestamp: "2026-08-14 17:00:00 UTC",
      limitations: "Cannot replace dedicated ultrasound or elastography (FibroScan) if clinical suspicion exists."
    },
    missingInputs: ["Serum Platelet Count (from recent CBC)"],
    patientExplanation: "Your liver enzyme levels have returned to normal bounds, indicating healthy liver cell function.",
    clinicianGuidance: "FIB-4 indeterminate/low. Continue baseline metabolic lifestyle guidance."
  },
  {
    id: "risk-hypertension",
    name: "Hypertension Progression & Vascular Risk",
    system: "Hypertension",
    riskLevel: "moderate",
    riskScore: 7.2,
    inputCompleteness: 88,
    statusText: "Stage 1 Controlled Screening Signal",
    contributingFactors: [
      { factor: "Systolic BP (134 mmHg)", value: "134 mmHg", impact: "elevating", weight: 0.38 },
      { factor: "Diastolic BP (86 mmHg)", value: "86 mmHg", impact: "elevating", weight: 0.32 },
      { factor: "Telmisartan Regimen Adherence (98%)", value: "98 %", impact: "protective", weight: 0.30 }
    ],
    modelProvenance: {
      modelName: "AHA/ACC Stage 1 Progression Neural Classifier",
      version: "v2.1.0",
      architecture: "Multi-Layer Perceptron",
      validationDataset: "SPRINT & ACCORD Trial sub-cohorts",
      calibrationMetric: "Brier Score: 0.091",
      timestamp: "2026-08-14 17:00:00 UTC",
      limitations: "Office and ambulatory blood pressure values may fluctuate. Home BP log recommended."
    },
    missingInputs: ["24-Hour Ambulatory Blood Pressure Monitoring (ABPM)"],
    patientExplanation: "Your blood pressure is currently well-managed with your daily routine and medication, hovering close to the ideal range.",
    clinicianGuidance: "BP controlled on Telmisartan 20mg daily. Recommend patient maintaining home blood pressure log."
  },
  {
    id: "risk-respiratory",
    name: "Respiratory & Pulmonary Risk Screening",
    system: "Respiratory",
    riskLevel: "low",
    riskScore: 1.2,
    inputCompleteness: 80,
    statusText: "Low Screening Signal (Clear Radiograph)",
    contributingFactors: [
      { factor: "Chest X-Ray (Clear Lung Fields)", value: "Normal", impact: "protective", weight: 0.60 },
      { factor: "Former Smoker (>3 yrs cessation)", value: "Cessation verified", impact: "protective", weight: 0.30 }
    ],
    modelProvenance: {
      modelName: "Pulmonary Multi-Modal Screening Classifier",
      version: "v1.2.0",
      architecture: "Gradient Boosting (XGBoost)",
      validationDataset: "NLST (National Lung Screening Trial) subset",
      calibrationMetric: "Specificity: 94%",
      timestamp: "2026-08-14 17:00:00 UTC",
      limitations: "Spirometry (FEV1/FVC) not recorded. Not a substitute for clinical pulmonary function tests if symptoms arise."
    },
    missingInputs: ["Spirometry / Peak Flow Data"],
    patientExplanation: "Your chest X-ray and respiratory indicators are clear and healthy.",
    clinicianGuidance: "No active pulmonary findings on imaging or history."
  }
];

export const sampleImageStudies: MedicalImageStudy[] = [
  {
    id: "study-cxr-2026",
    title: "Posteroanterior (PA) Chest Radiograph",
    modality: "X-Ray",
    bodyRegion: "Chest",
    date: "2026-06-02",
    indication: "Routine wellness follow-up and baseline respiratory evaluation.",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    gradcamOverlayUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    modelStatus: "Available",
    modelConfidence: 0.964,
    findings: [
      {
        finding: "Clear Lung Parenchyma",
        probability: 0.98,
        region: "Bilateral Lung Fields",
        clinicalNote: "No focal consolidation, nodular opacity, or vascular congestion detected."
      },
      {
        finding: "Normal Cardiothoracic Ratio (< 0.50)",
        probability: 0.95,
        region: "Cardiac Silhouette",
        clinicalNote: "Cardiac size and mediastinal contours appear within normal limits."
      },
      {
        finding: "Sharp Costophrenic Angles",
        probability: 0.99,
        region: "Pleural Bases",
        clinicalNote: "No blunting or evidence of pleural effusion."
      }
    ],
    modelProvenance: {
      architecture: "DenseNet-121 / Vision Transformer Hybrid (CheXNet Foundation)",
      modelName: "SAAHAJ-Vision-Chest-XRay-Screening",
      version: "v2.5.0-gradcam",
      inputResolution: "1024 x 1024 px DICOM (16-bit)",
      gradCamTargetLayer: "features.denseblock4.denselayer16.conv2",
      limitations: "Screening model output intended solely to aid clinician workflow. Subtle micro-nodules or portable AP projections require direct radiologist review."
    }
  },
  {
    id: "study-mri-brain-2025",
    title: "Brain MRI (T1 / T2 FLAIR Coronal & Axial)",
    modality: "MRI",
    bodyRegion: "Brain",
    date: "2025-11-20",
    indication: "Evaluation for tension-type headache history (resolved).",
    imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80",
    gradcamOverlayUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    modelStatus: "Available",
    modelConfidence: 0.941,
    findings: [
      {
        finding: "Age-Appropriate Ventricular Volume",
        probability: 0.96,
        region: "Lateral & 3rd Ventricles",
        clinicalNote: "Symmetric ventricles without hydrocephalus."
      },
      {
        finding: "No Acute Intracranial Hemorrhage or Mass Effect",
        probability: 0.97,
        region: "Cerebral Hemispheres",
        clinicalNote: "Gray-white matter differentiation is preserved."
      }
    ],
    modelProvenance: {
      architecture: "3D-ResNet50 / U-Net Segmentation Ensemble",
      modelName: "SAAHAJ-Neuro-MRI-Pattern-Analyzer",
      version: "v1.8.2",
      inputResolution: "512 x 512 x 128 (3D Volumetric T2-FLAIR)",
      gradCamTargetLayer: "layer4.2.conv3",
      limitations: "Does not detect micro-vascular white matter lesions below 2mm slice resolution."
    }
  }
];

export const sampleAppointmentPrep: AppointmentPrep = {
  targetDate: "2026-09-05",
  doctorName: "Dr. Sunita Rao, MD",
  specialty: "Internal Medicine & Metabolic Health",
  reasonForVisit: "6-Month Routine Follow-up & Lab Panel Review",
  keyChangesSinceLastVisit: [
    "HbA1c decreased from 6.6% to 6.2% (-0.4 percentage points)",
    "Fasting blood glucose decreased from 134 to 118 mg/dL (-16 points)",
    "ALT liver enzyme normalized from 46 to 38 U/L",
    "LDL cholesterol increased slightly from 122 to 128 mg/dL (+6 points)"
  ],
  abnormalMarkersToDiscuss: [
    "Fasting Blood Glucose (118 mg/dL - Target: < 100 mg/dL)",
    "LDL Cholesterol (128 mg/dL - Target: < 100 mg/dL)"
  ],
  userReportedSymptoms: [
    {
      symptom: "Occasional afternoon fatigue after heavy carbohydrate lunch",
      duration: "Past 3 weeks, 2-3 times/week",
      severity: "Mild",
      notes: "Resolves within 45 minutes with a brief walk or hydration."
    }
  ],
  tailoredQuestionsForDoctor: [
    {
      category: "Medication & Target Review",
      question: "My HbA1c came down to 6.2% on Metformin 500mg. What is our target goal for the next 6 months, and should I maintain this current dosage?",
      rationale: "Addresses the 0.4% HbA1c drop and checks whether the current dose remains optimal."
    },
    {
      category: "Lipid & Heart Health",
      question: "My LDL cholesterol rose from 122 to 128 mg/dL. Are there specific dietary adjustments I should prioritize before considering cholesterol medication?",
      rationale: "Addresses the upward drift in LDL while heart risk remains in the moderate 6.4% band."
    },
    {
      category: "Lifestyle & Testing",
      question: "Since my liver enzymes (ALT) normalized, are there any additional annual tests like a urine microalbumin test you would recommend for my next visit?",
      rationale: "Proactively fills the missing kidney urine ACR input noted in the CKD screening."
    }
  ]
};

export const sampleHealthInsights: HealthInsight[] = [
  {
    id: "ins-1",
    type: "trend",
    title: "Positive Glycemic Trajectory",
    summary: "Your HbA1c has decreased by 0.4% over 7 months, reflecting consistent response to Metformin and regular physical activity.",
    evidenceSource: "Metropolis Lab Reports (Jan 18, 2026 vs Aug 14, 2026)",
    urgency: "routine",
    actionableStep: "Keep up your current walking routine and evening meal consistency.",
    category: "Metabolic"
  },
  {
    id: "ins-2",
    type: "report_change",
    title: "Mild LDL-C Elevation Observed",
    summary: "LDL cholesterol has increased by 6 mg/dL to 128 mg/dL. This is an ideal topic to add to your doctor's appointment checklist.",
    evidenceSource: "Lipid Profile Panel (Aug 14, 2026)",
    urgency: "attention_recommended",
    actionableStep: "Review dietary saturated fat sources and discuss target lipid bands with Dr. Rao.",
    category: "Cardiovascular"
  },
  {
    id: "ins-3",
    type: "missing_data",
    title: "Recommended Preventive Screening: Urine Microalbumin",
    summary: "Your kidney blood markers (eGFR & Creatinine) are healthy, but a simple urine microalbumin spot check has not been completed in 12 months.",
    evidenceSource: "Clinical Practice Guidelines (ADA & KDIGO 2026)",
    urgency: "informational",
    actionableStep: "Added as a question in your Appointment Prep briefcase.",
    category: "Kidney"
  },
  {
    id: "ins-4",
    type: "educational",
    title: "Understanding Reference Ranges vs Personal Baselines",
    summary: "Lab reference intervals represent 95% of a healthy population. Observing how your own numbers shift over time provides deeper context than any single isolated test.",
    evidenceSource: "SAAHAJ Evidence Grounding Engine",
    urgency: "informational",
    category: "Health Literacy"
  }
];

export const sampleAuditLogs = [
  {
    id: "log-1",
    action: "Report Ingest & OCR Grounding",
    details: "DeepDoc-Medical OCR parsed 14 parameters with 98.2% extraction confidence from Aug 2026 panel.",
    actor: "System Engine",
    timestamp: "2026-08-14 16:42 UTC"
  },
  {
    id: "log-2",
    action: "Tabular ML Inference Executed",
    details: "ASCVD Risk Booster & Diabetes Progression ensembles executed locally.",
    actor: "Client ML Worker",
    timestamp: "2026-08-14 17:00 UTC"
  },
  {
    id: "log-3",
    action: "Doctor Briefcase Generated",
    details: "Appointment prep checklist compiled with 3 tailored consultation questions.",
    actor: "User (Aarav Sharma)",
    timestamp: "2026-08-28 09:15 UTC"
  },
  {
    id: "log-4",
    action: "Cryptographic Key Rotation",
    details: "Client AES-256 GCM vault verified with zero telemetry leak.",
    actor: "Security Core",
    timestamp: "2026-08-30 11:00 UTC"
  }
];
