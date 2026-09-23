import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Database, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h1 className="text-xl font-bold text-slate-100">Platform Settings & Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user account permissions, API access keys, and NLP model parameters.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <div className="h-16 w-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center text-indigo-300 font-bold text-xl">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{user?.full_name || 'VOCX Analyst'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'admin@vocx.ai'}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] font-semibold border border-indigo-800">
              Role: {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Cpu className="h-4 w-4" />
              <h4 className="text-xs font-bold text-slate-200">ML Model Engine</h4>
            </div>
            <p className="text-xs text-slate-400">Primary Model: <strong>IndicBERT / XLM-RoBERTa-base</strong></p>
            <p className="text-[11px] text-slate-500">Fallback: Multilingual Script Lexicon & Regex Matcher</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Database className="h-4 w-4" />
              <h4 className="text-xs font-bold text-slate-200">Database Connection</h4>
            </div>
            <p className="text-xs text-slate-400">ORM: <strong>SQLAlchemy 2.0</strong></p>
            <p className="text-[11px] text-slate-500">PostgreSQL / SQLite Storage Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};
