"""
Tests for Language Detector
"""

from detector import LanguageDetector

# Initialize
detector = LanguageDetector(
    model_path=r"D:\TY\EDI TY\xlm_roberta_language_detection_v2_600k_final"
)

# Test cases
test_cases = [
    ("मुझे अपने भुगतान की जानकारी चाहिए।", "Hindi"),
    ("నా ఆర్డర్ ఇంకా చేరలేదు", "Telugu"),
    ("আমার পণ্য ত্রুটিপূর্ণ এসেছে", "Bangla"),
    ("The delivery was late", "English"),
    ("என் வீட்டு பக்கத்தில் ஒரு அழகான பூ உள்ளது", "Tamil"),
    ("माझे नाव हर्ष आहे", "Marathi"),
]

print("Testing Language Detector:\n")

passed = 0
failed = 0

for text, expected_lang in test_cases:
    result = detector.detect(text)
    predicted = result['language']
    confidence = result['confidence']
    
    if predicted == expected_lang:
        print(f"✅ PASS: {predicted} (confidence: {confidence})")
        passed += 1
    else:
        print(f"❌ FAIL: Expected {expected_lang}, got {predicted}")
        failed += 1
    
    print(f"   Text: {text[:50]}...\n")

print(f"\nResults: {passed} passed, {failed} failed")