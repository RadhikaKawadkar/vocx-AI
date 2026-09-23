import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { SentimentTrendItem } from '../../types';

interface TrendAnalysisProps {
  trends: SentimentTrendItem[];
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ trends }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Volume & Sentiment Trends Over Time</h3>
        <p className="text-xs text-slate-400">Daily breakdown of customer sentiment categories</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="positive" name="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="neutral" name="Neutral" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="negative" name="Negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
