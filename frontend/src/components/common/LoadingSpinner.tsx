import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading intelligence metrics...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      <span className="text-xs text-slate-400 font-medium">{label}</span>
    </div>
  );
};
