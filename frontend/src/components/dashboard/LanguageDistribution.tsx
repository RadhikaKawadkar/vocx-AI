import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { LanguageDistributionItem } from '../../types';

interface LanguageDistributionProps {
  data: LanguageDistributionItem[];
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const LanguageDistribution: React.FC<LanguageDistributionProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Indian Language Breakdown</h3>
        <p className="text-xs text-slate-400">Share of feedback by detected script/language</p>
      </div>

      <div className="h-52 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
              nameKey="language_name"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: any, name: any) => [`${value} feedbacks`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.slice(0, 4).map((item, idx) => (
          <div key={item.language} className="flex items-center justify-between p-1.5 bg-slate-800/40 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span className="text-slate-300 font-medium">{item.language_name}</span>
            </div>
            <span className="text-slate-400 font-semibold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
