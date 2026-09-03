# Research Datasets Provenance & Partitioning

## 1. CheXpert (Stanford AIMI)
- **Institution**: Stanford Machine Learning Group & Stanford Center for Artificial Intelligence in Medicine & Imaging.
- **Cohort Size**: 224,316 chest radiographs across 65,240 unique patients.
- **Labels**: 14 observation categories annotated by expert thoracic radiologists.
- **Data Partition**: Patient-level stratified split (80% Train, 10% Validation, 10% Holdout Test) ensuring zero cross-set patient data leakage.

## 2. MIMIC-CXR-JPG (MIT PhysioNet / BIDMC)
- **Institution**: MIT Laboratory for Computational Physiology & Beth Israel Deaconess Medical Center.
- **Version**: v2.0.0
- **Cohort Size**: 377,110 radiographs across 65,379 distinct patients.
- **Multi-modal Pairing**: Radiographs paired with semi-structured free-text radiology reports, enabling multimodal vision-language verification.

## 3. NIH ChestX-ray14 (Clinical Center, NIH)
- **Institution**: National Institutes of Health Clinical Center.
- **Cohort Size**: 112,120 frontal-view X-ray images from 30,805 unique patients.
- **Use in SAAHAJ**: Cross-domain external validation for generalization testing across clinical sites.
