import React from 'react';
import { 
  Bell, 
  Settings, 
  Smartphone, 
  Plus, 
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { AppSettings, DailyReminderSettings } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'table' | 'add';
  setActiveTab: (tab: 'dashboard' | 'table' | 'add') => void;
  reminderSettings: DailyReminderSettings;
  openReminderModal: () => void;
  openPhoneTrackingModal: () => void;
  openSettingsModal: () => void;
  openAddModal: () => void;
  appSettings: AppSettings;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  reminderSettings,
  openReminderModal,
  openPhoneTrackingModal,
  openSettingsModal,
  openAddModal,
  appSettings,
  onToggleTheme,
}) => {
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const isDark = appSettings.theme === 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-lg sm:text-xl tracking-tighter">
            X
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                X-pens
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                  Prisma
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {todayStr}
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Dashboard & Charts
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'table'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Transactions
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Daily Reminder Pill */}
          <button
            onClick={openReminderModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              reminderSettings.enabled
                ? 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
            }`}
            title="Daily Reminder Settings"
          >
            <Bell className={`w-3.5 h-3.5 ${reminderSettings.enabled ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">
              {reminderSettings.enabled ? reminderSettings.time : 'Off'}
            </span>
          </button>

          {/* Phone Payment Tracking (Bank SMS & Forwarding) */}
          <button
            onClick={openPhoneTrackingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
            title="Track Phone Payments & Bank SMS"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Phone Payments</span>
          </button>

          {/* Settings */}
          <button
            onClick={openSettingsModal}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Quick Manual Add Button */}
          <button
            onClick={openAddModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>
        </div>
      </div>
    </header>
  );
};
