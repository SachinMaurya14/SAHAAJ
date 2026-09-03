# Explainability: Grad-CAM Saliency Maps & Multimodal Verification

## 1. Grad-CAM Mechanics in SAAHAJ
Grad-CAM (Gradient-weighted Class Activation Mapping) computes the gradients of the score for target class $c$ ($y^c$) with respect to feature activation map $A^k$ of the final convolutional layer:

$$\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A_{i,j}^k}$$

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$

- **Positive Activation Focus**: The $\text{ReLU}$ operator isolates features that positively contribute to the target finding (e.g. opacities for pneumonia or widened mediastinum for cardiomegaly).
- **Overlay Rendering**: Gradients are normalized $[0.0, 1.0]$ and interpolated as a smooth SVG overlay that can be dynamically toggled and adjusted in opacity on the client viewport.

## 2. Multimodal Image-Report Verification
SAAHAJ cross-references the computer vision model's output probabilities with clinical entities parsed from the accompanying radiology report:
1. **Full Agreement**: Both model screening signals and radiologist impressions identify the same pathology.
2. **Additional Model Signal**: Neural features indicate subtle probability elevation above decision threshold in regions not explicitly stated in a brief report.
3. **Potential Discrepancy**: Model triggers high probability where the report explicitly notes negation (e.g. "no evidence of pneumothorax"). Prompts clinician review.
