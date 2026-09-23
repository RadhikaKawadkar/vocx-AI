import React, { useState, useEffect } from 'react';
import { translationApi, TranslationStatsResponse, TranslationRecordItem, SingleTranslateResponse } from '../services/translation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Languages, RefreshCw, Zap, CheckCircle2, AlertTriangle, Play, History, ArrowRight } from 'lucide-react';

export const TranslationManagerPage: React.FC = () => {
  const [stats, setStats] = useState<TranslationStatsResponse | null>(null);
  const [history, setHistory] = useState<TranslationRecordItem[]>([]);
  const [testText, setTestText] = useState('பணம் உடனே டிரான்ஸ்பர் ஆகுது. மிக அருமையான சேவை!');
  const [testLang, setTestLang] = useState('ta');
  const [testResult, setTestResult] = useState<SingleTranslateResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        translationApi.getStats(),
        translationApi.getHistory(50),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load translation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestTranslate = async () => {
    if (!testText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translationApi.translate(testText, testLang);
      setTestResult(res);
    } catch (err) {
      alert('Translation error: ' + err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBulkTranslate = async () => {
    setIsProcessingBulk(true);
    try {
      const res = await translationApi.bulkTranslate(100);
      alert(`Bulk translation complete! Processed ${res.processed_count} records.`);
      loadData();
    } catch (err) {
      alert('Bulk translation error: ' + err);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      const res = await translationApi.retryFailed();
      alert(`Retried ${res.retried_count} failed translation jobs.`);
      loadData();
    } catch (err) {
      alert('Retry error: ' + err);
    }
  };

  if (isLoading || !stats) {
    return <LoadingSpinner label="Compiling Indic Translation Engine metrics..." />;
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
            <h1 className="text-xl font-bold text-slate-100">Indic Translation Engine & History</h1>
            <p className="text-xs text-slate-400 mt-1">
              Cross-lingual translation pipeline converting Hindi, Tamil, Telugu, Marathi, Hinglish to English.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRetryFailed}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition border border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
            <span>Retry Failed</span>
          </button>

          <button
            onClick={handleBulkTranslate}
            disabled={isProcessingBulk}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-indigo-600/30"
          >
            <Zap className={`h-4 w-4 ${isProcessingBulk ? 'animate-spin' : ''}`} />
            <span>{isProcessingBulk ? 'Translating...' : 'Bulk Translate DB'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Translation Jobs</div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{stats.total_translations}</div>
          <div className="text-[11px] text-slate-500 mt-1">Indic-Trans2 & NLLB-200</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Translation Success Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{stats.success_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Status COMPLETED / BYPASSED</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Average Latency</div>
          <div className="text-2xl font-bold text-indigo-400 mt-2">{stats.avg_latency_ms} ms</div>
          <div className="text-[11px] text-slate-500 mt-1">Per feedback item translation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Active Providers</div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{Object.keys(stats.provider_breakdown).length} Engine</div>
          <div className="text-[11px] text-slate-500 mt-1">indic-trans2, nllb-200, fallback</div>
        </div>
      </div>

      {/* Interactive Playground & Provider Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Translator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Live Translation Playground</h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <select
                value={testLang}
                onChange={(e) => setTestLang(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="hi-en">Hinglish</option>
              </select>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-300">English</span>
            </div>

            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleTestTranslate}
              disabled={isTranslating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <Play className="h-4 w-4" />
              <span>{isTranslating ? 'Translating...' : 'Translate to English'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Translation Output</div>
              <p className="text-slate-100 font-medium">{testResult.translated_text}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Provider: <strong>{testResult.provider}</strong></span>
                <span>Latency: <strong>{testResult.latency_ms} ms</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Translation History Audit Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recent Translation Audit Logs</h3>
            <History className="h-4 w-4 text-slate-500" />
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No translation records logged yet.</div>
            ) : (
              history.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">#{rec.feedback_id} • {rec.source_language.toUpperCase()} → EN</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                      {rec.status} ({rec.latency_ms}ms)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{rec.original_text}</p>
                  <p className="text-[11px] text-indigo-300 italic line-clamp-1">{rec.translated_text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
