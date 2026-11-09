import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Volume2
} from 'lucide-react';
import { DailyReminderSettings } from '../types';
import { notificationService } from '../services/notificationService';

interface DailyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DailyReminderSettings;
  onSaveSettings: (settings: DailyReminderSettings) => void;
}

export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [time, setTime] = useState(settings.time || '21:00');
  const [permissionStatus, setPermissionStatus] = useState(notificationService.getPermissionStatus());
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    if (granted) {
      notificationService.sendNotification('X-pens Notifications Enabled! 🎉', {
        body: `You will be prompted every day at ${time} to log your expenses.`,
      });
    }
  };

  const handleTestNotification = () => {
    const success = notificationService.sendDailyReminderTest();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      alert('Please enable browser notification permissions first!');
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      enabled,
      time,
      hasPermission: permissionStatus === 'granted',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Expense Reminder</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Get prompted daily at your preferred hour</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission status card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Browser Permission:</span>
            {permissionStatus === 'granted' ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
              </span>
            ) : permissionStatus === 'denied' ? (
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Blocked in browser
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                Not Yet Enabled
              </span>
            )}
          </div>

          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Allow Daily Notifications</span>
            </button>
          )}
        </div>

        {/* Settings Form */}
        <div className="space-y-4 text-sm">
          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Enable Daily Notification</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Prompt you once a day to log your transactions</span>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Reminder Time (24-Hour Format)</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Test Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestNotification}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span>{testSent ? '✓ Sent Test Notification!' : 'Send Test Notification & Sound Now'}</span>
            </button>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
