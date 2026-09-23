import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  color = 'indigo',
}) => {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-800/40' },
    green: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
    red: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' },
    amber: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
    blue: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800/40' },
  };

  const style = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} border ${style.border}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isPositive ? 'bg-emerald-950/80 text-emerald-400' : 'bg-rose-950/80 text-rose-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && <div className="mt-1 text-[11px] text-slate-500">{subtitle}</div>}
    </div>
  );
};
