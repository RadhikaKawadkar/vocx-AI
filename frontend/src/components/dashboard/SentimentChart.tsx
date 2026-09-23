import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SentimentTrendItem } from '../../types';

interface SentimentChartProps {
  data: SentimentTrendItem[];
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Customer Sentiment Trends</h3>
          <p className="text-xs text-slate-400">Volume distribution over time across all regional channels</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>Positive</span>
          <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-slate-400 mr-1.5"></span>Neutral</span>
          <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-rose-500 mr-1.5"></span>Negative</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#posGrad)" />
            <Area type="monotone" dataKey="negative" stroke="#f43f5e" fillOpacity={1} fill="url(#negGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
