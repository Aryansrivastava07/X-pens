import React, { useState, useEffect } from 'react';
import { 
  getSettings, 
  saveSettings, 
  getReminderSettings, 
  saveReminderSettings 
} from './services/storage';
import { api } from './services/api';
import { AppSettings, DailyReminderSettings, Expense, TagItem } from './types';
import { notificationService } from './services/notificationService';
import { Navbar } from './components/Navbar';
import { QuickAddBar } from './components/QuickAddBar';
import { DashboardView } from './components/DashboardView';
import { ExpenseTable } from './components/ExpenseTable';
import { DailyReminderModal } from './components/DailyReminderModal';
import { PhoneTrackingModal } from './components/PhoneTrackingModal';
import { SettingsModal } from './components/SettingsModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { 
  LayoutDashboard, 
  ListOrdered, 
  PlusCircle, 
  Bell,
  CheckCircle
} from 'lucide-react';

export function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(getSettings());
  const [reminderSettings, setReminderSettings] = useState<DailyReminderSettings>(getReminderSettings());

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'add'>('dashboard');

  // Modals
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // In-app reminder notification state
  const [showDailyPrompt, setShowDailyPrompt] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Apply theme class to HTML element
  useEffect(() => {
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Load expenses and tags from Prisma DB / API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedExpenses, loadedTags] = await Promise.all([
          api.getExpenses(),
          api.getTags(),
        ]);
        setExpenses(loadedExpenses);
        setAvailableTags(loadedTags);

        // Check if user has already added expenses today
        const hasToday = notificationService.hasAddedToday(loadedExpenses);
        if (!hasToday && reminderSettings.enabled) {
          const hour = new Date().getHours();
          if (hour >= 18) {
            setShowDailyPrompt(true);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadData();

    // Start daily notification background listener
    notificationService.startDailyCheck(() => {
      setShowDailyPrompt(true);
    });

    return () => {
      notificationService.stopDailyCheck();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = appSettings.theme === 'dark' ? 'light' : 'dark';
    const updated: AppSettings = { ...appSettings, theme: nextTheme };
    setAppSettings(updated);
    saveSettings(updated);
  };

  // Add tag to Prisma DB Tag table
  const handleAddNewTag = async (name: string, color?: string): Promise<TagItem | null> => {
    try {
      const created = await api.createTag(name, color);
      if (!availableTags.some(t => t.id === created.id)) {
        setAvailableTags(prev => [...prev, created]);
      }
      triggerToast(`Created tag #${created.name}!`);
      return created;
    } catch {
      return null;
    }
  };

  const handleDeleteTag = async (id: string) => {
    await api.deleteTag(id);
    setAvailableTags(prev => prev.filter(t => t.id !== id));
    triggerToast('Tag removed from database.');
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const saved = await api.createExpense(expenseData);
      setExpenses(prev => [saved, ...prev]);
      setShowDailyPrompt(false);
      triggerToast(`Added ${appSettings.currencySymbol}${saved.amount.toLocaleString()} for ${saved.description}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditedExpense = async (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      try {
        const updated = await api.updateExpense(existingId, expenseData);
        setExpenses(prev => prev.map(e => (e.id === existingId ? updated : e)));
        triggerToast('Transaction updated!');
      } catch (err) {
        console.error(err);
      }
    } else {
      await handleAddExpense(expenseData);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await api.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    triggerToast('Transaction deleted.');
  };

  const handleSaveReminderSettings = (newSettings: DailyReminderSettings) => {
    setReminderSettings(newSettings);
    saveReminderSettings(newSettings);
    notificationService.startDailyCheck(() => {
      setShowDailyPrompt(true);
    });
    triggerToast('Daily reminder updated!');
  };

  const handleSaveAppSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveSettings(newSettings);
    triggerToast('Preferences saved!');
  };

  const handleClearAllData = async () => {
    for (const tx of expenses) {
      await api.deleteExpense(tx.id);
    }
    setExpenses([]);
    localStorage.removeItem('xpens_transactions_v2');
    triggerToast('Cleared all data from database.');
  };

  const handleImportExpenses = async (imported: Expense[]) => {
    for (const item of imported) {
      await api.createExpense(item);
    }
    const fresh = await api.getExpenses();
    setExpenses(fresh);
    triggerToast(`Imported ${imported.length} transactions into Prisma DB!`);
  };

  const openEditModal = (expense?: Expense) => {
    setExpenseToEdit(expense || null);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reminderSettings={reminderSettings}
        openReminderModal={() => setIsReminderOpen(true)}
        openPhoneTrackingModal={() => setIsPhoneModalOpen(true)}
        openSettingsModal={() => setIsSettingsOpen(true)}
        openAddModal={() => openEditModal()}
        appSettings={appSettings}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
        {/* Daily Reminder Banner if evening & no expenses today */}
        {showDailyPrompt && (
          <div className="p-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 dark:bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Expense Reminder ⏰</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  You haven't logged any entries yet today. Log your coffee, lunch, or bills now!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowDailyPrompt(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setShowDailyPrompt(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm"
              >
                Log Now
              </button>
            </div>
          </div>
        )}

        {/* Natural Language AI Messenger Input Bar */}
        <section aria-label="Natural Language Input">
          <QuickAddBar
            onAddExpense={handleAddExpense}
            appSettings={appSettings}
            onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
            availableTags={availableTags}
            onAddNewTag={handleAddNewTag}
          />
        </section>

        {/* Views: Dashboard or Table */}
        {activeTab === 'dashboard' ? (
          <DashboardView
            expenses={expenses}
            appSettings={appSettings}
            onViewAllClick={() => setActiveTab('table')}
            onEditExpense={(tx) => openEditModal(tx)}
          />
        ) : (
          <ExpenseTable
            expenses={expenses}
            appSettings={appSettings}
            availableTags={availableTags}
            onEditExpense={(tx) => openEditModal(tx)}
            onDeleteExpense={handleDeleteExpense}
            onOpenAddModal={() => openEditModal()}
          />
        )}
      </main>

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-300 border border-slate-700 dark:border-slate-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around transition-colors">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) input.focus();
          }}
          className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 p-3 rounded-2xl shadow-lg shadow-emerald-500/30"
          title="Add Expense"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            activeTab === 'table' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span>Table</span>
        </button>

        <button
          onClick={() => setIsReminderOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <Bell className="w-5 h-5" />
          <span>Reminder</span>
        </button>
      </div>

      {/* Modals */}
      <DailyReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        settings={reminderSettings}
        onSaveSettings={handleSaveReminderSettings}
      />

      <PhoneTrackingModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        appSettings={appSettings}
        availableTags={availableTags}
        onAddExpense={handleAddExpense}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        availableTags={availableTags}
        onDeleteTag={handleDeleteTag}
        onSaveSettings={handleSaveAppSettings}
        onClearAllData={handleClearAllData}
        expenses={expenses}
        onImportExpenses={handleImportExpenses}
      />

      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        onSave={handleSaveEditedExpense}
        onDelete={handleDeleteExpense}
        appSettings={appSettings}
        availableTags={availableTags}
        onAddNewTag={handleAddNewTag}
      />
    </div>
  );
}

export default App;
