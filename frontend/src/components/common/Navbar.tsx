import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, Sparkles, Database } from 'lucide-react';
import { feedbackApi } from '../../services/feedback';

interface NavbarProps {
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefreshData }) => {
  const { user, logout } = useAuth();

  const handleSeed = async () => {
    try {
      await feedbackApi.seedSampleData();
      if (onRefreshData) onRefreshData();
      alert('Sample Indian Regional Dataset seeded into database!');
    } catch (err) {
      alert('Failed to seed dataset: ' + err);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold p-2 rounded-lg flex items-center shadow-lg shadow-blue-500/20">
          <Sparkles className="h-5 w-5 mr-1" />
          <span className="tracking-wide">VOCX AI</span>
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-indigo-950 text-indigo-300 rounded-full border border-indigo-800">
          Indian Language Intelligence
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleSeed}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition"
          title="Populate realistic Indian regional feedback dataset"
        >
          <Database className="h-3.5 w-3.5 text-blue-400" />
          <span>Seed Dataset</span>
        </button>

        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition">
            <Bell className="h-4 w-4" />
          </button>
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800"></div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-semibold text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-200">{user?.full_name || 'Analyst'}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || 'Analyst'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
