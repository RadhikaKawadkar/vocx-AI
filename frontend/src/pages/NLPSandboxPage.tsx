import React, { useState } from 'react';
import { feedbackApi } from '../services/feedback';
import { TextAnalyzeResponse } from '../types';
import { Cpu, Play, Languages, Tag, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const PRESET_SAMPLES = [
  { label: 'Hindi (Devanagari)', text: 'ऐप बहुत अच्छा है और डिलीवरी समय पर हुई। धन्यवाद VOCX AI टीम!' },
  { label: 'Hindi Complaint (Urgent)', text: 'बकवास सर्विस है! पैसा कट गया पर रिफन्द नहीं मिला। Legal action लूंगा।' },
  { label: 'Tamil Review', text: 'ரொம்ப நல்லா இருக்கு ஆப், பணம் உடனே டிரான்ஸ்பர் ஆகுது. அருமை!' },
  { label: 'Telugu Fraud Alert', text: 'చెత్త యాప్, యూపీఐ పేమెంట్ ఫెయిల్ అయింది. నా డబ్బులు స్టక్ అయ్యాయి. Scam!' },
  { label: 'Hinglish Code-mixed', text: 'OTP nahi aa raha hai. Customer executive was so rude and unhelpful.' },
  { label: 'Bengali Feedback', text: 'খুব ভালো সার্ভিস! সময় মতো ডেলিভারি পেয়েছি।' },
];

export const NLPSandboxPage: React.FC = () => {
  const [inputText, setInputText] = useState(PRESET_SAMPLES[1].text);
  const [result, setResult] = useState<TextAnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await feedbackApi.analyzeText({ text: inputText });
      setResult(res);
    } catch (err) {
      alert('Analysis error: ' + err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-2xl">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Live Multilingual NLP Intelligence Sandbox</h1>
            <p className="text-xs text-slate-400 mt-1">
              Test real-time script detection, XLM-RoBERTa / IndicBERT sentiment scoring, ABSA aspect extraction, and English translation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">Input Customer Review / Ticket Text</label>
            <span className="text-[10px] text-slate-500">Supports Devanagari, Tamil, Telugu, Hinglish, etc.</span>
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste feedback text in any Indian regional language..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-sans"
          />

          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-2">Quick Test Presets:</div>
            <div className="flex flex-wrap gap-2">
              {PRESET_SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => {
                    setInputText(sample.text);
                    setResult(null);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] border border-slate-700 transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running IndicBERT Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run NLP Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            Real-Time Analysis Output
          </h3>

          {!result ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <Cpu className="h-10 w-10 text-slate-700 mb-2" />
              <span>Click "Run NLP Analysis" to evaluate the entered text.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Language Detected</span>
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded font-bold">
                    {result.language_name} ({result.detected_language.toUpperCase()})
                  </span>
                </div>
                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                  <strong>English Translation:</strong>
                  <p className="text-slate-400 italic mt-0.5">{result.english_translation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sentiment</div>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      result.sentiment === 'Positive'
                        ? 'text-emerald-400'
                        : result.sentiment === 'Negative'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {result.sentiment}
                  </div>
                  <div className="text-[10px] text-slate-400">Score: {result.sentiment_score}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Extracted Aspect</div>
                  <div className="text-xs font-bold text-indigo-400 mt-1 truncate">{result.aspect_category}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Urgency Risk</div>
                  <div
                    className={`text-xs font-bold mt-1 ${
                      result.urgency_level === 'Critical' ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {result.urgency_level}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Model Confidence</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {Math.round(result.confidence_score * 100)}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-400 font-semibold">Extracted Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {result.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
