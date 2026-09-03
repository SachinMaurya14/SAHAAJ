# SAAHAJ Computer Vision & Medical Imaging Architecture (V6)

## 1. Overview
The SAAHAJ Computer Vision pipeline provides transparent, calibrated, and explainable deep learning screening for radiological medical imaging (chest radiographs, with scaffolds for volumetric CT and MRI).

```
   +-----------------------------------------------------------+
   |                     Radiograph Ingestion                  |
   |              (PNG, JPEG, DICOM Safe-Harbor PHI)           |
   +-----------------------------+-----------------------------+
                                 |
                                 v
   +-----------------------------------------------------------+
   |                 Image Quality Pre-Flight Gate             |
   |    (Laplacian Variance Blur, Exposure, Contrast, Dim)     |
   +--------------+-----------------------------+--------------+
                  |                             |
             [Passes Gate]                 [Abstained]
                  |                             |
                  v                             v
   +-----------------------------+     +-----------------------+
   |   Deterministic Preprocess  |     | Return Abstention     |
   |   (cxr-norm-v1.2, SHA-256)  |     | Notice with Warnings  |
   +--------------+--------------+     +-----------------------+
                  |
                  v
   +-----------------------------------------------------------+
   |          DenseNet-121 Multi-Label Neural Screening        |
   |             (Stanford CheXpert & MIT MIMIC-CXR)           |
   +-----------------------------+-----------------------------+
                                 |
                                 v
   +-----------------------------------------------------------+
   |          Platt Sigmoid Calibration & Conformal 95% CIs    |
   +-----------------------------+-----------------------------+
                                 |
                                 v
   +-----------------------------------------------------------+
   |             Grad-CAM Saliency Activation Map              |
   |       (features.denseblock4.denselayer16.conv2 Layer)     |
   +-----------------------------+-----------------------------+
                                 |
                                 v
   +-----------------------------------------------------------+
   |         Multimodal Image + Report Discrepancy Engine      |
   |       (Cross-checks AI Signal against Radiologist Text)   |
   +-----------------------------------------------------------+
```

## 2. Core Architectural Components

### 2.1 Image Quality Pre-Flight (`ImageQualityService`)
- Evaluates technical parameters before executing neural weights.
- Metrics:
  - **Laplacian Variance Metric**: Discrete 3x3 kernel edge variance for optical blur detection ($> 12.0$ acceptable).
  - **Dynamic Range & Exposure**: Evaluates photon clipping and black-level compression.
  - **Resolution & Aspect**: Validates minimum matrix dimension ($512 \times 512$ nominal, $\ge 128 \times 128$ enforced).
- When severe blur or clipping is detected, the engine **abstains** rather than outputting misleading probabilities.

### 2.2 Preprocessing Pipeline (`ImagePreprocessor`)
- Strict versioning identifier: `cxr-norm-v1.2`.
- Computes SHA-256 hash of the untouched raw image for cryptographic reproducibility.
- Applies standard intensity standardization without destroying fine bone or soft tissue margins.

### 2.3 DICOM & Anonymization Engine (`DicomService`)
- Extracts StudyInstanceUID, SeriesInstanceUID, Modality, BodyPartExamined, and Windowing presets.
- Strips HIPAA Safe-Harbor PHI (Patient Name, MRN, Birth Date, Facility Name).
- Provides Hounsfield Unit (HU) windowing abstractions for Lung ($-600, 1500$), Mediastinum ($40, 400$), and Bone ($300, 1500$).

### 2.4 Deep Learning Multi-Label Head (`VisionInferenceService`)
- Evaluates multi-label thoracic pathologies:
  - Cardiomegaly
  - Consolidation / Infiltrate (Pneumonia)
  - Pleural Effusion
  - Atelectasis
  - Pneumothorax
  - Pulmonary Edema
  - No Abnormality Detected (Normal)
- Calibrated using Platt sigmoid scaling to prevent overconfident outputs.
