import React from 'react';
import { FeedbackItem } from '../../types';
import { X, Languages, ShieldAlert, Cpu, Tag, Calendar, MapPin, Building2 } from 'lucide-react';

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Feedback #{item.id} Intelligence Report</h3>
              <p className="text-xs text-slate-400">Customer ID: {item.customer_id || 'Anonymous'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Comparison */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                <Languages className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                Original ({item.language_name})
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded font-mono">
                {item.detected_language.toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed">{item.original_text}</p>
          </div>

          {item.english_translation && item.detected_language !== 'en' && (
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Unified English Translation
              </span>
              <p className="text-xs text-slate-300 italic">{item.english_translation}</p>
            </div>
          )}
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Sentiment</div>
            <div className="text-sm font-bold text-slate-200 mt-1">{item.sentiment}</div>
            <div className="text-[10px] text-slate-400">Score: {item.sentiment_score}</div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Aspect Category</div>
            <div className="text-xs font-bold text-indigo-400 mt-1 truncate">{item.aspect_category}</div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Urgency Level</div>
            <div className={`text-xs font-bold mt-1 ${item.urgency_level === 'Critical' ? 'text-rose-400' : 'text-slate-200'}`}>
              {item.urgency_level}
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Confidence</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">{Math.round(item.confidence_score * 100)}%</div>
          </div>
        </div>

        {/* Tags & Metadata */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Tag className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-300">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-500" />{item.location_state || 'India'}</span>
            <span className="flex items-center"><Building2 className="h-3.5 w-3.5 mr-1 text-slate-500" />Source: {item.source}</span>
            <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-500" />{new Date(item.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
