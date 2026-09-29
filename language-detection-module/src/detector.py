"""
Language Detection Module
"""

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

class LanguageDetector:
    """
    Detect language of text using fine-tuned XLM-RoBERTa
    
    Supported languages: Bangla, English, Hindi, Marathi, Tamil, Telugu
    """
    
    def __init__(self, model_path: str, device: int = -1):
        """
        Initialize detector
        
        Args:
            model_path: Path to fine-tuned model
            device: -1 for CPU, 0+ for GPU
        """
        self.device = device
        self.classifier = pipeline(
            "text-classification",
            model=model_path,
            device=device,
            truncation=True,
            max_length=128
        )
        self.languages = ['Bangla', 'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu']
    
    def detect(self, text: str) -> dict:
        """
        Detect language of single text
        
        Args:
            text: Input text
            
        Returns:
            dict: {'language': str, 'confidence': float}
        """
        result = self.classifier(text)[0]
        return {
            'language': result['label'],
            'confidence': round(result['score'], 4)
        }
    
    def detect_batch(self, texts: list) -> list:
        """
        Detect language for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            list: List of detection results
        """
        results = []
        for text in texts:
            results.append(self.detect(text))
        return results