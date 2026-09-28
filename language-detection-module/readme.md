# Language Detection Module

Multilingual language detection using XLM-RoBERTa fine-tuned on IndicLID dataset.

## Features

- **Accuracy**: 99.99% on test set
- **Languages**: Bangla, English, Hindi, Marathi, Tamil, Telugu
- **Model**: XLM-RoBERTa (fine-tuned for 5 epochs on 600K samples)
- **Speed**: ~15 minutes for 12K samples on CPU

## Performance

| Language | Precision | Recall | F1-Score |
|----------|-----------|--------|----------|
| Bangla   | 1.00      | 1.00   | 1.00     |
| English  | 1.00      | 1.00   | 1.00     |
| Hindi    | 1.00      | 1.00   | 1.00     |
| Marathi  | 1.00      | 1.00   | 1.00     |
| Tamil    | 1.00      | 1.00   | 1.00     |
| Telugu   | 1.00      | 1.00   | 1.00     |

**Overall Accuracy**: 99.99% (11,999/12,000 correct)

## Installation

```bash
pip install -r requirements.txt
```

## Quick Start

```python
from src.detector import LanguageDetector

detector = LanguageDetector(model_path="model/xlm_roberta_language_detection_v2_600k_final")

# Single prediction
result = detector.detect("मुझे अपने भुगतान की जानकारी चाहिए।")
print(result)
# Output: {'language': 'Hindi', 'confidence': 0.9999}

# Batch prediction
texts = [
    "मेरा नाम राहुल है",
    "నా పేరు రాజు",
    "This is English"
]
results = detector.detect_batch(texts)
```

## Model Details

- **Base Model**: xlm-roberta-base
- **Training Dataset**: IndicLID (AI4Bharat)
- **Training Samples**: 600,000 (100K per language)
- **Train/Val/Test Split**: 80/10/10
- **Epochs**: 5
- **Learning Rate**: 1e-5
- **Batch Size**: 8 (effective 64 with accumulation)
- **Max Sequence Length**: 128 tokens

## Training Results

- **Validation Accuracy**: 99.85%
- **Test Accuracy**: 99.99%
- **Training Time**: 4.5 hours (Colab T4 GPU)

## API Usage

```python
from src.detector import LanguageDetectorAPI
from fastapi import FastAPI

app = FastAPI()
detector = LanguageDetectorAPI(model_path="model/...")

@app.post("/detect-language")
async def detect(text: str):
    return detector.detect(text)
```

## Testing

```bash
pytest tests/
```

## Project Structure

This is **Member 1** of the Multilingual Customer Feedback Intelligence Platform.

**Pipeline**:

Customer Feedback
↓
Language Detection (THIS MODULE) ✅
↓
Translation (Member 2)
↓
Category Classification (Member 3)
↓
Sentiment Analysis (Member 4)
↓
Dashboard


## Authors

- Harsh Mahajan - Language Detection Module
- Part of EDI TY Project - Multilingual Customer Feedback Intelligence

## License

MIT License - See LICENSE file

## Citation

If you use this model, please cite:

```bibtex
@inproceedings{ramesh2021indiclid,
  title={IndicLID: Language Identification for Indic Languages},
  author={Ramesh, Gowtham and others},
  booktitle={AI4Bharat},
  year={2021}
}
```