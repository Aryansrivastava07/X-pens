import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Sparkles, 
  Trash2,
  Download,
  Upload,
  CheckCircle,
  Tag as TagIcon
} from 'lucide-react';
import { AppSettings, Expense, TagItem } from '../types';
import { CURRENCIES } from '../utils/categories';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  availableTags: TagItem[];
  onDeleteTag: (id: string) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onClearAllData: () => void;
  expenses: Expense[];
  onImportExpenses: (expenses: Expense[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  availableTags,
  onDeleteTag,
  onSaveSettings,
  onClearAllData,
  expenses,
  onImportExpenses,
}) => {
  const [currency, setCurrency] = useState(settings.currency);
  const [budget, setBudget] = useState(settings.monthlyBudget);
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [useGeminiAI, setUseGeminiAI] = useState(settings.useGeminiAI);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestGemini = async () => {
    if (!geminiApiKey.trim()) {
      alert('Please enter a Gemini API Key first.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, reply with "OK"' }] }]
        })
      });
      if (res.ok) {
        setTestResult('success');
      } else {
        const err = await res.text();
        setTestResult(`error: ${err.substring(0, 100)}`);
      }
    } catch (e: any) {
      setTestResult(`error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const curObj = CURRENCIES.find((c) => c.code === currency);
    onSaveSettings({
      ...settings,
      currency,
      currencySymbol: curObj?.symbol || '₹',
      monthlyBudget: Number(budget) || 35000,
      geminiApiKey: geminiApiKey.trim(),
      useGeminiAI: useGeminiAI && geminiApiKey.trim().length > 5,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `xpens-backup-${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportExpenses(parsed);
            alert(`Successfully restored ${parsed.length} transactions!`);
          } else {
            alert('Invalid backup file format.');
          }
        } catch {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">App Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Currency, Gemini AI & Prisma Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Currency */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol} - {c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Budget */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Budget</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 35000"
            />
          </div>

          {/* Google Gemini AI API Configuration */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Google Gemini AI API</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Native NLP + Gemini
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your Google Gemini API key to enable cloud AI parsing. (Also works offline with enhanced Native NLP if no key is entered).
            </p>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  if (e.target.value.length > 5) setUseGeminiAI(true);
                }}
                placeholder="Paste Gemini API Key (AIzaSy...)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={isTesting || !geminiApiKey}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40"
              >
                {isTesting ? 'Testing...' : 'Test Key'}
              </button>
            </div>

            {testResult === 'success' && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Gemini API connection verified successfully!
              </p>
            )}

            {testResult && testResult.startsWith('error') && (
              <p className="text-xs text-rose-500 font-semibold">
                Connection failed: {testResult}
              </p>
            )}

            {geminiApiKey && (
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={useGeminiAI}
                  onChange={(e) => setUseGeminiAI(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span className="font-medium">Use Gemini AI as primary parser</span>
              </label>
            )}
          </div>

          {/* Manage Tags in Database */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <TagIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Database Tags ({availableTags.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
              {availableTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${tag.color || '#10b981'}15`,
                    borderColor: `${tag.color || '#10b981'}40`,
                    color: tag.color || '#10b981',
                  }}
                >
                  <span>#{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete tag "${tag.name}" from database?`)) {
                        onDeleteTag(tag.id);
                      }
                    }}
                    className="p-0.5 hover:text-rose-500 rounded-full"
                    title="Delete tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Backup & Data Management */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Data Management</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>Backup JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Restore JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear ALL transactions? This cannot be undone!')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
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
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
