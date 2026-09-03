# SAAHAJ Model Cards, Specifications & Schemas (V5)

## 1. Registered Model Specs

### 1.1 Cardiovascular 10-Year ASCVD Screener (`cv-ascvd-v1.4`)
- **Version**: `v1.4.2`
- **Algorithm**: Elastic-Net Regularized Logistic Regressor with Platt Scaling
- **Decision Threshold**: `0.15` (15% 10-year probability)
- **Primary Inputs**: Age, Biological Sex, Systolic BP, LDL Cholesterol, HDL Cholesterol, Smoking Status
- **Secondary Inputs**: Diastolic BP, Total Cholesterol, Diabetes History, BMI
- **Calibration**: Brier Score `0.089`, ECE `0.021`

### 1.2 Metabolic & Type 2 Diabetes 5-Year Progression (`diabetes-prog-v2.1`)
- **Version**: `v2.1.0`
- **Algorithm**: Gradient Boosting with Platt Sigmoid Calibration
- **Decision Threshold**: `0.20` (20% 5-year progression)
- **Primary Inputs**: Fasting Blood Glucose, BMI, Age
- **Secondary Inputs**: HbA1c, Systolic BP, Triglycerides, Family History, Physical Activity
- **Calibration**: Brier Score `0.078`, ECE `0.024`

### 1.3 Renal Function & CKD Microvascular Screener (`ckd-prog-v1.2`)
- **Version**: `v1.2.0`
- **Algorithm**: Elastic-Net Regularized Regressor
- **Decision Threshold**: `0.18`
- **Primary Inputs**: Serum Creatinine (IDMS), Age, Systolic BP
- **Secondary Inputs**: eGFR (CKD-EPI), Urine Albumin, Diabetes History, Hemoglobin
- **Calibration**: Brier Score `0.065`, ECE `0.018`

### 1.4 Hepatic Steatosis & Liver Health Screener (`hepatic-fib4-v1.1`)
- **Version**: `v1.1.8`
- **Algorithm**: Gradient Boosting with Isotonic Calibration
- **Decision Threshold**: `0.22`
- **Primary Inputs**: ALT (SGPT), AST (SGOT), Age
- **Secondary Inputs**: Total Bilirubin, Alkaline Phosphatase (ALP), Albumin, BMI
- **Calibration**: Brier Score `0.096`, ECE `0.029`

### 1.5 Hypertension Risk & Vascular Load Screener (`htn-risk-v1.0`)
- **Version**: `v1.0.4`
- **Algorithm**: Elastic-Net Regularized Regressor
- **Decision Threshold**: `0.24`
- **Primary Inputs**: Systolic BP, Diastolic BP, Age, BMI
- **Secondary Inputs**: Resting Heart Rate, Family History, Smoking
- **Calibration**: Brier Score `0.088`, ECE `0.022`

### 1.6 Hematologic / Anemia CBC Screener (`anemia-cbc-v1.0`)
- **Version**: `v1.0.8`
- **Algorithm**: Calibrated Logistic Regressor
- **Decision Threshold**: `0.30`
- **Primary Inputs**: Serum Hemoglobin, Biological Sex, Age
- **Secondary Inputs**: RBC Count, Hematocrit (PCV), MCV, MCH, RDW
- **Calibration**: Brier Score `0.042`, ECE `0.012`

### 1.7 Metabolic Syndrome Multi-System Screener (`metabolic-atp3-v1.3`)
- **Version**: `v1.3.0`
- **Algorithm**: Gradient Boosting with Platt Calibration
- **Decision Threshold**: `0.25`
- **Primary Inputs**: Fasting Glucose, Triglycerides, HDL-C, Systolic BP, BMI, Sex, Age
- **Calibration**: Brier Score `0.071`, ECE `0.019`
