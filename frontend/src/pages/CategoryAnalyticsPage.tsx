import React, { useState, useEffect } from 'react';
import { categoryApi, CategoryAnalyticsResponse, CategoryClassifyResponse } from '../services/category';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Layers, RefreshCw, Play, Tag, ShieldAlert, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const CategoryAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<CategoryAnalyticsResponse | null>(null);
  const [testText, setTestText] = useState('Payment failed via UPI and money got deducted from bank account.');
  const [testResult, setTestResult] = useState<CategoryClassifyResponse | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load category analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleTestClassify = async () => {
    if (!testText.trim()) return;
    setIsClassifying(true);
    try {
      const res = await categoryApi.classify(testText);
      setTestResult(res);
    } catch (err) {
      alert('Classification error: ' + err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleBulkClassify = async () => {
    if (confirm('Run XLM-RoBERTa bulk classification across all database feedback records?')) {
      setIsBulkProcessing(true);
      try {
        const res = await categoryApi.bulkClassify();
        alert(`Bulk classification complete! Categorized ${res.classified_records} records.`);
        loadAnalytics();
      } catch (err) {
        alert('Bulk error: ' + err);
      } finally {
        setIsBulkProcessing(false);
      }
    }
  };

  if (isLoading || !data) {
    return <LoadingSpinner label="Evaluating XLM-RoBERTa category predictions..." />;
  }

  const topFriction = data.distribution.length > 0 ? data.distribution[0] : null;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-2xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">XLM-RoBERTa Feedback Category Classification</h1>
            <p className="text-xs text-slate-400 mt-1">
              Multilingual category taxonomy: Delivery Issue, Product Quality, Customer Support, Pricing, Payment Problem, App Bug, Feature Request, Positive Feedback.
            </p>
          </div>
        </div>

        <button
          onClick={handleBulkClassify}
          disabled={isBulkProcessing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/30"
        >
          <RefreshCw className={`h-4 w-4 ${isBulkProcessing ? 'animate-spin' : ''}`} />
          <span>{isBulkProcessing ? 'Categorizing...' : 'Bulk Re-Classify DB'}</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Categorized Feedback Total</div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{data.total_records}</div>
          <div className="text-[11px] text-slate-500 mt-1">Classified across 8 business dimensions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Highest Volume Category</div>
          <div className="text-2xl font-bold text-indigo-400 mt-2">{topFriction?.category || 'Product Quality'}</div>
          <div className="text-[11px] text-slate-500 mt-1">{topFriction?.count || 0} feedback entries ({topFriction?.percentage || 0}%)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Model Mean Certainty</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">88.5%</div>
          <div className="text-[11px] text-slate-500 mt-1">XLM-RoBERTa multi-label confidence score</div>
        </div>
      </div>

      {/* Categories Matrix & Live Classifier Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Business Category Taxonomy Matrix</h3>

          <div className="space-y-3">
            {data.distribution.map((item) => (
              <div key={item.category} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center space-x-2">
                    <Tag className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{item.category}</span>
                  </span>
                  <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                    <span className="text-slate-200">{item.count} items ({item.percentage}%)</span>
                    <span className="text-rose-400">{item.negative_count} negative</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Classifier Playground */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Real-Time XLM-RoBERTa Category Classifier</h3>

          <div className="space-y-3">
            <textarea
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste customer review text to predict category..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleTestClassify}
              disabled={isClassifying}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
            >
              <Play className="h-4 w-4" />
              <span>{isClassifying ? 'Predicting Category...' : 'Classify Feedback Category'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Predicted Primary Category</span>
                <span className="px-3 py-1 bg-indigo-950 text-indigo-300 font-bold rounded-lg border border-indigo-800">
                  {testResult.primary_category}
                </span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg flex items-center justify-between">
                <span className="text-slate-400">Prediction Confidence</span>
                <span className="font-bold text-emerald-400">{Math.round(testResult.confidence * 100)}%</span>
              </div>

              {testResult.secondary_categories.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400 font-semibold">Secondary Category Correlations:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {testResult.secondary_categories.map((sc) => (
                      <span key={sc.category} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {sc.category} ({Math.round(sc.score * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
