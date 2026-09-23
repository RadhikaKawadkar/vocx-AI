import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  BarChart3,
  Languages,
  Globe,
  Tag,
  Smile,
  Zap,
  Cpu,
  Settings,
  ShieldAlert
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Feedback Explorer', path: '/explorer', icon: MessageSquare },
    { name: 'Ingestion Manager', path: '/ingestion', icon: Upload },
    { name: 'Language Engine', path: '/language', icon: Languages },
    { name: 'Translation Engine', path: '/translation', icon: Globe },
    { name: 'Category Taxonomy', path: '/categories', icon: Tag },
    { name: 'Sentiment Trends', path: '/sentiment', icon: Smile },
    { name: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
    { name: 'Automations', path: '/automation', icon: Zap },
    { name: 'NLP Live Sandbox', path: '/nlp-sandbox', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Core Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Supported Languages
          </div>
          <div className="px-3 flex flex-wrap gap-1.5">
            {[
              { code: 'HI', name: 'हिन्दी' },
              { code: 'TA', name: 'தமிழ்' },
              { code: 'TE', name: 'తెలుగు' },
              { code: 'KN', name: 'ಕನ್ನಡ' },
              { code: 'BN', name: 'বাংলা' },
              { code: 'MR', name: 'मराठी' },
              { code: 'GU', name: 'ગુજરાતી' },
              { code: 'HIN-EN', name: 'Hinglish' },
            ].map((lang) => (
              <span
                key={lang.code}
                className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/60"
              >
                {lang.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-indigo-950/40 border border-indigo-900/40 rounded-xl">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold mb-1">
          <ShieldAlert className="h-4 w-4" />
          <span>IndicBERT Core</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Real-time multilingual cross-script sentiment & aspect extraction active.
        </p>
      </div>
    </aside>
  );
};
