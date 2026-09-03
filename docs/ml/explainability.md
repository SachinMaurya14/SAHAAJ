# SAAHAJ Explainability & Local Attribution Architecture (V5)

## 1. Local vs Global Attributions
SAAHAJ enforces a strict mathematical separation between:
1. **Global Model Feature Importance**: Mean absolute SHAP values across the entire population cohort.
2. **Local Prediction Attribution**: The exact log-odds / probability deviation caused by THIS specific user's inputs relative to population baseline means.

$$\text{Log-Odds Impact}_i = (x_i - \bar{x}_i) \cdot \beta_i$$

## 2. Waterfall Decomposition
The prediction waterfall starts at the baseline population intercept $\beta_0$, shows each elevating (+) and protective (-) feature contribution, and arrives at the calibrated probability.

## 3. What-If / Counterfactual Analysis
Allows temporary exploratory simulations:
- Changing $x_i \to x'_i$
- Re-evaluating the deterministic pipeline
- Stamping output as **SIMULATED MODEL INPUT**
- Protecting actual medical history from any modification
