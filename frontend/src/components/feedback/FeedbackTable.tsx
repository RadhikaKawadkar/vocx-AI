import React from 'react';
import { FeedbackItem } from '../../types';
import { ArrowUpRight, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface FeedbackTableProps {
  items: FeedbackItem[];
  onSelect: (item: FeedbackItem) => void;
  isLoading: boolean;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({ items, onSelect, isLoading }) => {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'Negative':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'Mixed':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';
      case 'High':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
        Loading feedback catalog...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No customer feedback matching criteria</h4>
        <p className="text-xs text-slate-500 mt-1">Try resetting filters or seeding sample dataset from the top bar.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Feedback Content</th>
              <th className="py-3.5 px-4">Language</th>
              <th className="py-3.5 px-4">Sentiment</th>
              <th className="py-3.5 px-4">Aspect</th>
              <th className="py-3.5 px-4">Urgency</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="hover:bg-slate-800/50 cursor-pointer transition group"
              >
                <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                  <div className="font-medium text-slate-200 line-clamp-1">{item.original_text}</div>
                  {item.english_translation && item.detected_language !== 'en' && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                      En: {item.english_translation}
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded text-[11px] font-medium">
                    {item.language_name}
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getSentimentBadge(item.sentiment)}`}>
                    {item.sentiment} ({item.sentiment_score})
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="text-slate-300 font-medium">{item.aspect_category}</span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getUrgencyBadge(item.urgency_level)}`}>
                    {item.urgency_level}
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                  {item.source}
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button className="p-1 text-slate-400 group-hover:text-indigo-400 transition">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
