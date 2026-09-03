# SAAHAJ Machine Learning Risk Engine Architecture (V5)

## 1. Overview
The SAAHAJ Machine Learning Engine is an offline-trained, production-grade clinical risk screening system. It provides calibrated, transparent, and explainable risk estimates across 7 specialized physiological domains.

```
+---------------------------------------------------------------------------------------------------+
|                                      SAAHAJ ML PIPELINE (V5)                                      |
+---------------------------------------------------------------------------------------------------+

   1. User / Report Data       2. Data Quality Gate        3. Feature Preprocessing
   +--------------------+      +--------------------+      +------------------------+
   | - Health Profile   | ---> | - Type validation  | ---> | - Unit conversion      |
   | - V4 Health Facts  |      | - Range checking   |      | - Median/mode impute   |
   | - Manual Inputs    |      | - Required fields  |      | - Standard z-scaling   |
   +--------------------+      | - OOD detection    |      +------------------------+
                               +--------------------+                  |
                                         |                             v
                                         | (Abstain if data    4. Model Inference
                                         |  is insufficient)   +------------------------+
                                         v                     | - Elastic-Net Logistic |
                                   [ABSTENTION]                | - Gradient Boosting    |
                                                               | - Linear Log-Odds      |
                                                               +------------------------+
                                                                       |
                                                                       v
   7. Grounded Explanation     6. Multi-Layer Explain      5. Probability Calibration
   +--------------------+      +--------------------+      +------------------------+
   | - Gemini / RAG     | <--- | - Local SHAP bars  | <--- | - Platt Sigmoid        |
   | - Biological facts |      | - Waterfall decomp |      | - Isotonic Regression  |
   | - Evidence papers  |      | - Sensitivity plot |      | - Conformal intervals  |
   +--------------------+      | - What-If counter  |      +------------------------+
                               +--------------------+
```

## 2. Core Architectural Invariants
1. **Model-First Execution**: Statistical and machine learning models compute all probabilities and feature attributions deterministically. Gemini **NEVER** invents numbers or calculates predictions.
2. **Quality Gate & Abstention**: If required primary predictors are missing or invalid, the engine refuses inference with `INSUFFICIENT_DATA` or `INVALID_INPUTS`.
3. **Transparent Provenance**: Every feature value retains its source (e.g. "From Report: Metabolic Panel p. 2" vs "Manual User Entry").
4. **Local vs Global Explanations**: Individual predictions are explained using local SHAP-equivalent feature log-odds attributions, distinguishing individual contributions from global model metrics.
5. **Separation of Concerns**:
   - **Model Output**: Mathematical score and calibrated probability.
   - **Biological Context**: Physiological mechanisms (e.g. LDL particles in subendothelial space).
   - **Clinical Responsibility**: Physician diagnosis and patient counseling.
