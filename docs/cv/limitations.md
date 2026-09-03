# Limitations & Clinical Safety Disclaimers

## 1. Non-Diagnostic Assistive AI Scope
- SAAHAJ Computer Vision is an **assistive screening intelligence tool**. It is **not** a primary diagnostic medical device and does not replace examination by a certified radiologist.
- Model probabilities represent statistical alignment with training cohorts (CheXpert / MIMIC-CXR) rather than definitive medical certainty.

## 2. Anatomical & Projection Limitations
- Verified primarily on standard PA (posteroanterior) and AP (anteroposterior) erect chest radiographs.
- Portable lateral decubitus films, severe patient rotation, or intense surgical hardware artifacts may reduce specificity.

## 3. Visual Saliency Disclaimer
- Grad-CAM heatmap highlights indicate mathematical neural receptive fields, not pathological boundaries or biopsy margins.
- A highlight on a healthy anatomical structure indicates that the network's filters evaluated that region during classification.
