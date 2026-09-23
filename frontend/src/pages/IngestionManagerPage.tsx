import React, { useState, useEffect } from 'react';
import { feedbackApi, IngestionStats } from '../services/feedback';
import { CSVUploadModal } from '../components/feedback/CSVUploadModal';
import { JSONUploadModal } from '../components/feedback/JSONUploadModal';
import { FeedbackIngestModal } from '../components/feedback/FeedbackIngestModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Database, Upload, FileCode, Plus, Copy, ShieldCheck, Layers } from 'lucide-react';

export const IngestionManagerPage: React.FC = () => {
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackApi.getIngestionStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load ingestion stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return <LoadingSpinner label="Fetching feedback ingestion statistics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Feedback Ingestion Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest feedback across CSV datasets, JSON files, API webhooks, or manual entry with duplicate hash detection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsManualOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>Manual Entry</span>
          </button>

          <button
            onClick={() => setIsCsvOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-indigo-600/30"
          >
            <Upload className="h-4 w-4" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={() => setIsJsonOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition border border-slate-700"
          >
            <FileCode className="h-4 w-4 text-emerald-400" />
            <span>Upload JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Ingested Records</span>
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.total_ingested}</div>
          <div className="text-[11px] text-slate-500">Across all active source connectors</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Duplicates Flagged</span>
            <Copy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.duplicates_flagged_count}</div>
          <div className="text-[11px] text-slate-500">Identified via SHA-256 text content hashing</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Source Channels</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{Object.keys(stats.by_source).length}</div>
          <div className="text-[11px] text-slate-500">PlayStore, AppStore, Support, CSV, JSON</div>
        </div>
      </div>

      {/* Sources & Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Volume by Source Channel</h3>
          <div className="space-y-2">
            {Object.entries(stats.by_source).map(([src, cnt]) => (
              <div key={src} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-300">{src}</span>
                <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 rounded font-bold">{cnt} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Batches breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Recent Ingestion Batches</h3>
          <div className="space-y-2">
            {Object.entries(stats.by_batch).length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No named import batches registered yet.</div>
            ) : (
              Object.entries(stats.by_batch).map(([batch, cnt]) => (
                <div key={batch} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                  <span className="font-mono text-slate-300">{batch}</span>
                  <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold">{cnt} records</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CSVUploadModal isOpen={isCsvOpen} onClose={() => setIsCsvOpen(false)} onSuccess={loadStats} />
      <JSONUploadModal isOpen={isJsonOpen} onClose={() => setIsJsonOpen(false)} onSuccess={loadStats} />
      <FeedbackIngestModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} onSuccess={loadStats} />
    </div>
  );
};
