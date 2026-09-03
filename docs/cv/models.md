# Vision Models & Benchmark Evaluations

## 1. Primary Model: DenseNet-121 (`cxr-densenet121-chexpert-v1.0`)
- **Architecture**: 121-layer Densely Connected Convolutional Network.
- **Input Resolution**: $512 \times 512$ 16-bit Grayscale.
- **Target Feature Layer**: `features.denseblock4.denselayer16.conv2` (final convolutional block preceding global average pooling).
- **Macro ROC-AUC**: **0.894** (5-fold Cross-Validation).
- **Macro PR-AUC**: **0.812**.
- **Brier Score**: **0.076** (Platt-calibrated).

### Per-Class Performance Summary
| Finding Label | ROC-AUC | PR-AUC | Sensitivity | Specificity | Calibrated Threshold |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cardiomegaly** | 0.908 | 0.835 | 86.2% | 89.1% | 0.24 |
| **Consolidation / Infiltrate** | 0.886 | 0.792 | 82.1% | 87.4% | 0.20 |
| **Pleural Effusion** | 0.924 | 0.871 | 88.4% | 91.2% | 0.25 |
| **Atelectasis** | 0.872 | 0.764 | 80.5% | 85.6% | 0.22 |
| **Pneumothorax** | 0.932 | 0.858 | 87.8% | 94.1% | 0.18 |
| **Pulmonary Edema** | 0.898 | 0.824 | 83.5% | 89.5% | 0.21 |
| **No Finding (Normal)** | 0.882 | 0.845 | 85.1% | 86.8% | 0.45 |

## 2. Benchmark Candidate Comparisons
| Architecture | Macro ROC-AUC | PR-AUC | Brier Score | Latency (ms) | Selection Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DenseNet-121** | **0.894** | **0.812** | **0.076** | 145 ms | **Selected**: Dense feature reuse and sharpest Grad-CAM gradients. |
| **ResNet-50** | 0.876 | 0.784 | 0.089 | 120 ms | Baseline comparison: slightly lower sensitivity on subtle costophrenic blunting. |
| **EfficientNet-B4** | 0.885 | 0.798 | 0.082 | 195 ms | Higher computational latency with comparable discrimination. |
| **ViT-B/16** | 0.881 | 0.789 | 0.085 | 230 ms | Transformer self-attention requires larger scale dataset pretraining. |
