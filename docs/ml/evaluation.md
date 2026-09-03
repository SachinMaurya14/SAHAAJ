# SAAHAJ Model Evaluation & Cross-Validation Methodology (V5)

## 1. Cross-Validation Protocol
- **Split Strategy**: Stratified 5-Fold Cross-Validation on training subsets (80% train-val, 20% holdout test).
- **Hyperparameter Optimization**: Grid search over regularizations (`L1`, `L2`, Elastic-Net mixing ratio `l1_ratio`), tree depth (3–6), learning rates (0.01–0.1), and min child weights.
- **Threshold Selection**: Youden's J Index ($J = \text{Sensitivity} + \text{Specificity} - 1$) maximized on validation folds.
- **Calibration Assessment**: Brier Score and Expected Calibration Error (ECE) across 10 quantile bins.

## 2. Evaluation Metrics Summary

| Model | ROC-AUC | PR-AUC | Sensitivity | Specificity | F1 Score | Brier Score | Selected Algorithm |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cardiovascular ASCVD** | 0.842 | 0.612 | 0.806 | 0.822 | 0.724 | 0.089 | Elastic-Net Logistic |
| **Diabetes 5-Year** | 0.865 | 0.684 | 0.824 | 0.838 | 0.748 | 0.078 | Gradient Boosting |
| **Renal / CKD Staging** | 0.891 | 0.742 | 0.852 | 0.874 | 0.792 | 0.065 | Elastic-Net Logistic |
| **Hepatic / Liver FIB-4** | 0.812 | 0.584 | 0.782 | 0.804 | 0.698 | 0.096 | Gradient Boosting |
| **Hypertension Risk** | 0.835 | 0.662 | 0.798 | 0.816 | 0.732 | 0.088 | Elastic-Net Logistic |
| **Anemia CBC** | 0.942 | 0.885 | 0.912 | 0.924 | 0.874 | 0.042 | Calibrated Logistic |
| **Metabolic Syndrome** | 0.882 | 0.764 | 0.846 | 0.858 | 0.812 | 0.071 | Gradient Boosting |
