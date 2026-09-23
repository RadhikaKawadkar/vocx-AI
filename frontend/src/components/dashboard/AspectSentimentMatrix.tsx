import React from 'react';
import { AspectSentimentItem } from '../../types';

interface AspectSentimentMatrixProps {
  data: AspectSentimentItem[];
}

export const AspectSentimentMatrix: React.FC<AspectSentimentMatrixProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Aspect-Based Sentiment Analysis (ABSA)</h3>
        <p className="text-xs text-slate-400">Operational category breakdown of positive vs negative feedback</p>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const total = item.positive + item.neutral + item.negative;
          const posPct = total > 0 ? (item.positive / total) * 100 : 0;
          const neuPct = total > 0 ? (item.neutral / total) * 100 : 0;
          const negPct = total > 0 ? (item.negative / total) * 100 : 0;

          return (
            <div key={item.aspect_name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.aspect_name}</span>
                <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                  <span className="text-emerald-400">{item.positive} pos</span>
                  <span className="text-rose-400">{item.negative} neg</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    Avg Score: {item.avg_score}
                  </span>
                </div>
              </div>

              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${posPct}%` }}></div>
                <div className="bg-slate-500 h-full transition-all duration-500" style={{ width: `${neuPct}%` }}></div>
                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${negPct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
