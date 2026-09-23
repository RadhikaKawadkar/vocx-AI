import React from 'react';
import { AlertTriangle, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { FeedbackItem } from '../../types';

interface RecentAlertsProps {
  items: FeedbackItem[];
  onSelect: (item: FeedbackItem) => void;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ items, onSelect }) => {
  const highPriority = items.filter(
    (item) => item.urgency_level === 'Critical' || item.urgency_level === 'High'
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-200">Urgent Risk Escalations</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded-full">
            {highPriority.length} Action Required
          </span>
        </div>

        <div className="space-y-3">
          {highPriority.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No urgent risk escalations flagged right now.</div>
          ) : (
            highPriority.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-950 text-rose-400 rounded">
                      {item.urgency_level}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">{item.language_name}</span>
                    <span className="text-[10px] text-slate-500">• {item.aspect_category}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium line-clamp-2">{item.original_text}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
