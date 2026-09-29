"""
Simple usage example
"""

from detector import LanguageDetector

# Initialize
detector = LanguageDetector(
    model_path=r"D:\TY\EDI TY\xlm_roberta_language_detection_v2_600k_final"
)

# Single detection
text = "मुझे अपने भुगतान की जानकारी चाहिए।"
result = detector.detect(text)
print(f"Language: {result['language']}, Confidence: {result['confidence']}")

# Batch detection
feedback = [
    "मुझे अपने भुगतान की जानकारी चाहिए।",
    "నా ఆర్డర్ ఇంకా చేరలేదు",
    "The delivery was late",
]

print("\nBatch Detection:")
for text in feedback:
    result = detector.detect(text)
    print(f"✅ {result['language']}: {text}")