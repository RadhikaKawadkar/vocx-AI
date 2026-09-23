import React, { useState, useEffect } from 'react';
import { sentimentApi, SentimentStatsResponse, SentimentTrendPoint, SentimentPredictResponse } from '../services/sentiment';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SentimentChart } from '../components/dashboard/SentimentChart';
import { Smile, Frown, Meh, RefreshCcw, TrendingUp, Play, Sparkles } from 'lucide-react';

export const SentimentAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<SentimentStatsResponse | null>(null);
  const [trends, setTrends] = useState<SentimentTrendPoint[]>([]);
  const [testText, setTestText] = useState('पैसा कट गया पर रिफंड नहीं मिला। कस्टमर केयर एग्जीक्यूटिव का व्यवहार खराब था।');
  const [testResult, setTestResult] = useState<SentimentPredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, trendsRes] = await Promise.all([
        sentimentApi.getStats(),
        sentimentApi.getTrends(),
      ]);
      setStats(statsRes);
      setTrends(trendsRes);
    } catch (err) {
      console.error('Failed to load sentiment metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestPredict = async () => {
    if (!testText.trim()) return;
    setIsPredicting(true);
    try {
      const res = await sentimentApi.predict(testText);
      setTestResult(res);
    } catch (err) {
      alert('Prediction error: ' + err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleBulkRecalculate = async () => {
    if (confirm('Recalculate sentiment predictions across all stored feedback records?')) {
      setIsRecalculating(true);
      try {
        const res = await sentimentApi.bulkAnalyze();
        alert(`Recalculated sentiment for ${res.processed_records} records.`);
        loadData();
      } catch (err) {
        alert('Recalculate error: ' + err);
      } finally {
        setIsRecalculating(false);
      }
    }
  };

  if (isLoading || !stats) {
    return <LoadingSpinner label="Compiling Indic Sentiment Analytics & Trends..." />;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-2xl">
            <Smile className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Indic Sentiment Intelligence & Trends</h1>
            <p className="text-xs text-slate-400 mt-1">
              Multilingual sentiment classification across Positive, Neutral, and Negative categories.
            </p>
          </div>
        </div>

        <button
          onClick={handleBulkRecalculate}
          disabled={isRecalculating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/30"
        >
          <RefreshCcw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>{isRecalculating ? 'Recalculating...' : 'Bulk Re-Analyze Sentiment'}</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Promoter (NPS)</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {stats.net_promoter_score > 0 ? '+' : ''}{stats.net_promoter_score}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">% Positive minus % Negative</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Positive Feedback</span>
            <Smile className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{stats.positive_percentage}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.positive_count} total entries</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Negative Feedback</span>
            <Frown className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{stats.negative_percentage}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.negative_count} customer issues</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Neutral / Mixed</span>
            <Meh className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300 mt-2">{stats.neutral_percentage}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.neutral_count} total entries</div>
        </div>
      </div>

      {/* Main Trend Visualization */}
      <SentimentChart data={trends} />

      {/* Live Predictor Playground */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Real-Time Multilingual Sentiment Predictor</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <textarea
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste text in Hindi, Tamil, Telugu, Marathi, Hinglish, etc..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleTestPredict}
              disabled={isPredicting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
            >
              <Play className="h-4 w-4" />
              <span>{isPredicting ? 'Predicting Sentiment...' : 'Predict Sentiment'}</span>
            </button>
          </div>

          {testResult ? (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Predicted Sentiment Class</span>
                  <span
                    className={`px-3 py-1 font-bold rounded-lg text-xs border ${
                      testResult.sentiment === 'Positive'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : testResult.sentiment === 'Negative'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {testResult.sentiment}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg">
                    <div className="text-slate-500">Continuous Score</div>
                    <div className="font-bold text-slate-100 mt-0.5">{testResult.sentiment_score} (-1.0 to +1.0)</div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg">
                    <div className="text-slate-500">Model Confidence</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{Math.round(testResult.confidence_score * 100)}%</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
              <span>Enter text and click "Predict Sentiment" to view real-time score.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
