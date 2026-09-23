import React from 'react';
import { RegionalDistributionItem } from '../../types';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface RegionalHeatmapProps {
  data: RegionalDistributionItem[];
}

export const RegionalHeatmap: React.FC<RegionalHeatmapProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Indian State Regional Intelligence</h3>
        <p className="text-xs text-slate-400">Feedback volume and negative sentiment risk ratio by state</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item) => {
          const isHighRisk = item.negative_ratio > 40;

          return (
            <div
              key={item.state}
              className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                isHighRisk
                  ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700'
                  : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className={`h-4 w-4 ${isHighRisk ? 'text-rose-400' : 'text-indigo-400'}`} />
                  <span className="text-xs font-bold text-slate-200">{item.state}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isHighRisk ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.total_volume} Feedbacks
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Negative Ratio</span>
                  <span className={`font-semibold ${isHighRisk ? 'text-rose-400' : 'text-slate-200'}`}>
                    {item.negative_ratio}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isHighRisk ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${item.negative_ratio}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Top Script: <strong className="text-slate-200">{item.top_language.toUpperCase()}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
