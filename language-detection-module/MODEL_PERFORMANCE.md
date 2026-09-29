# Model Performance Report

## Test Set Results

**Accuracy**: 99.99%
- Total Samples: 12,000
- Correct: 11,999
- Errors: 1

## Per-Language Metrics

| Language | Precision | Recall | F1-Score | Support |
|----------|-----------|--------|----------|---------|
| Bangla   | 1.00      | 1.00   | 1.00     | 2000    |
| English  | 1.00      | 1.00   | 1.00     | 2000    |
| Hindi    | 1.00      | 1.00   | 1.00     | 2000    |
| Marathi  | 1.00      | 1.00   | 1.00     | 2000    |
| Tamil    | 1.00      | 1.00   | 1.00     | 2000    |
| Telugu   | 1.00      | 1.00   | 1.00     | 2000    |

## Comparison with Other Models

| Model | Accuracy | Notes |
|-------|----------|-------|
| **This Model** | **99.99%** | Best performing |
| Classical (TF-IDF + LR) | 99.91% | Fast but less accurate |
| XLM-R base (120K, 2 ep) | 99.85% | Initial version |

## Error Analysis

Only 1 error found:
- **Error**: Hindi → Marathi (confusion due to Devanagari script)

## Inference Speed

- CPU: ~1.2 samples/second
- 12,000 samples: ~14.8 minutes