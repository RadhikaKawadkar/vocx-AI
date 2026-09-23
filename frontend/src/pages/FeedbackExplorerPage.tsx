import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../services/feedback';
import { FeedbackItem, FeedbackFilterParams } from '../types';
import { FeedbackTable } from '../components/feedback/FeedbackTable';
import { FeedbackFilter } from '../components/feedback/FeedbackFilter';
import { FeedbackDetailModal } from '../components/feedback/FeedbackDetailModal';
import { FeedbackIngestModal } from '../components/feedback/FeedbackIngestModal';
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export const FeedbackExplorerPage: React.FC = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState<FeedbackFilterParams>({ page: 1, limit: 20 });
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await feedbackApi.list(filters);
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      console.error('Failed to load feedback catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [filters]);

  const handleReset = () => {
    setFilters({ page: 1, limit: 20 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Regional Feedback Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and analyze customer feedback items in Indian regional scripts & translations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsIngestOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Feedback</span>
          </button>
        </div>
      </div>

      <FeedbackFilter filters={filters} onChange={setFilters} onReset={handleReset} />

      <FeedbackTable items={items} onSelect={(item) => setSelectedFeedback(item)} isLoading={isLoading} />

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
          <div>
            Showing page <strong className="text-slate-200">{filters.page}</strong> of{' '}
            <strong className="text-slate-200">{pages}</strong> ({total} total items)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl transition text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={filters.page === pages}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl transition text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <FeedbackDetailModal item={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
      <FeedbackIngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={loadFeedback}
      />
    </div>
  );
};
