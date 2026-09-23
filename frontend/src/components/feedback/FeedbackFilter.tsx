import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { FeedbackFilterParams } from '../../types';

interface FeedbackFilterProps {
  filters: FeedbackFilterParams;
  onChange: (newFilters: FeedbackFilterParams) => void;
  onReset: () => void;
}

export const FeedbackFilter: React.FC<FeedbackFilterProps> = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search feedback text, translations, customer ID..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sentiment Filter */}
          <select
            value={filters.sentiment || ''}
            onChange={(e) => onChange({ ...filters, sentiment: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
            <option value="Mixed">Mixed</option>
          </select>

          {/* Aspect Filter */}
          <select
            value={filters.aspect || ''}
            onChange={(e) => onChange({ ...filters, aspect: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Aspects</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Product Quality">Product Quality</option>
            <option value="Pricing & Value">Pricing & Value</option>
            <option value="Delivery & Logistics">Delivery & Logistics</option>
            <option value="App UI & Performance">App UI & Performance</option>
            <option value="Billing & Payment">Billing & Payment</option>
          </select>

          {/* Language Filter */}
          <select
            value={filters.language || ''}
            onChange={(e) => onChange({ ...filters, language: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Languages</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="hi-en">Hinglish</option>
            <option value="en">English</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={filters.urgency || ''}
            onChange={(e) => onChange({ ...filters, urgency: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Urgency Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={onReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
