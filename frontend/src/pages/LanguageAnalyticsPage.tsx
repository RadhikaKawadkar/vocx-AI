import React, { useState, useEffect } from 'react';
import { languageApi, LanguageStatsResponse, LanguageDetectionResult } from '../services/language';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Languages, RefreshCcw, Sparkles, CheckCircle, Search, Cpu } from 'lucide-react';

export const LanguageAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<LanguageStatsResponse | null>(null);
  const [testText, setTestText] = useState('ऐप बहुत अच्छा है और डिलीवरी समय पर हुई।');
  const [testResult, setTestResult] = useState<LanguageDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await languageApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load language stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTestDetect = async () => {
    if (!testText.trim()) return;
    setIsDetecting(true);
    try {
      const res = await languageApi.detect(testText);
      setTestResult(res);
    } catch (err) {
      alert('Detection failed: ' + err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleReclassify = async () => {
    if (confirm('Reclassify all database records with FastText language detector?')) {
      setIsReclassifying(true);
      try {
        const res = await languageApi.reclassifyDB();
        alert(`Reclassified ${res.reclassified_records} records successfully!`);
        loadStats();
      } catch (err) {
        alert('Reclassification error: ' + err);
      } finally {
        setIsReclassifying(false);
      }
    }
  };

  if (isLoading || !stats) {
    return <LoadingSpinner label="Compiling FastText language detection analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-2xl">
            <Languages className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">FastText Multilingual Language Engine</h1>
            <p className="text-xs text-slate-400 mt-1">
              Script range & N-gram classification across English, Hindi, Marathi, Tamil, Telugu, Bengali, and Hinglish.
            </p>
          </div>
        </div>

        <button
          onClick={handleReclassify}
          disabled={isReclassifying}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition border border-slate-700"
        >
          <RefreshCcw className={`h-4 w-4 text-indigo-400 ${isReclassifying ? 'animate-spin' : ''}`} />
          <span>{isReclassifying ? 'Reclassifying...' : 'Reclassify DB Dataset'}</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Feedback Items Analyzed</div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{stats.total_records}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 7 primary Indic & Code-mixed languages</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Mean Model Confidence</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{Math.round(stats.avg_confidence * 100)}%</div>
          <div className="text-[11px] text-slate-500 mt-1">FastText Script & N-Gram certainty score</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Supported Indic Dialects</div>
          <div className="text-2xl font-bold text-indigo-400 mt-2">7 Languages</div>
          <div className="text-[11px] text-slate-500 mt-1">Hindi, Marathi, Tamil, Telugu, Bengali, Hinglish, English</div>
        </div>
      </div>

      {/* Distribution & Live Tester Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Breakdown List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Language Detection Distribution</h3>

          <div className="space-y-3">
            {stats.distribution.map((item) => (
              <div key={item.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 rounded font-mono text-[10px]">
                      {item.code.toUpperCase()}
                    </span>
                    <span>{item.name}</span>
                  </span>
                  <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                    <span>{item.count} items ({item.percentage}%)</span>
                    <span className="text-emerald-400">Conf: {Math.round(item.avg_confidence * 100)}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Detector Tester */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Real-Time FastText Language Tester</h3>

          <div className="space-y-3">
            <textarea
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text in Hindi, Marathi, Tamil, Telugu, Bengali, or Hinglish..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleTestDetect}
              disabled={isDetecting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <Cpu className="h-4 w-4" />
              <span>{isDetecting ? 'Detecting Language...' : 'Detect Language'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Identified Language</span>
                <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 font-bold rounded">
                  {testResult.language_name} ({testResult.language_code.toUpperCase()})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-slate-500">Confidence Score</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{Math.round(testResult.confidence * 100)}%</div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-slate-500">Script Family</div>
                  <div className="font-bold text-slate-200 mt-0.5">{testResult.script}</div>
                </div>
              </div>

              {testResult.is_code_mixed && (
                <div className="p-2 bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] rounded">
                  ⚡ Flagged as Code-Mixed Hinglish (Latin script Devanagari vocabulary).
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
