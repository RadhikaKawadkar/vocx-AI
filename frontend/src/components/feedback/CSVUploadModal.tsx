import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { feedbackApi, IngestionSummary } from '../../services/feedback';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('CSV_Import');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<IngestionSummary | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid CSV file (.csv)');
        setFile(null);
      } else {
        setError('');
        setFile(selected);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSummary(null);

    try {
      const res = await feedbackApi.uploadCSV(file, source, skipDuplicates);
      setSummary(res);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'CSV Ingestion failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Batch CSV Dataset Upload</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!summary ? (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center space-y-3 bg-slate-950 transition">
              <FileText className="h-10 w-10 text-indigo-400 mx-auto" />
              <div>
                <label className="cursor-pointer text-xs font-semibold text-indigo-400 hover:underline">
                  Choose CSV file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">Supports column headers: text, original_text, feedback, customer_id, state</p>
              </div>
              {file && (
                <div className="inline-block px-3 py-1 bg-indigo-950 text-indigo-300 text-xs rounded-lg font-mono border border-indigo-800">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Channel Source Label</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  <option value="CSV_Import">CSV Batch Import</option>
                  <option value="PlayStore">PlayStore Export</option>
                  <option value="AppStore">AppStore Export</option>
                  <option value="SupportTicket">Zendesk / Support Export</option>
                  <option value="Survey">NPS Survey CSV</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="skipDup"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="skipDup" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Skip Duplicate Content Hashes
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || isUploading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/30"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{isUploading ? 'Parsing & Ingesting...' : 'Upload & Parse CSV'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Ingestion Batch Complete</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Total Rows</div>
                  <div className="text-sm font-bold text-slate-200">{summary.total_records}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Imported</div>
                  <div className="text-sm font-bold text-emerald-400">{summary.imported_count}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Duplicates Skipped</div>
                  <div className="text-sm font-bold text-amber-400">{summary.duplicates_skipped}</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">Errors</div>
                  <div className="text-sm font-bold text-rose-400">{summary.errors_count}</div>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Batch Identifier: <code className="text-indigo-300 font-mono">{summary.batch_id}</code>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  setSummary(null);
                  setFile(null);
                  onClose();
                }}
                className="px-5 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
