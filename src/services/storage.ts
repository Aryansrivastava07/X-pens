import { AppSettings, DailyReminderSettings, Expense } from '../types';

const SETTINGS_KEY = 'xpens_settings_v2';
const REMINDER_KEY = 'xpens_reminder_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  geminiApiKey: '',
  useGeminiAI: false,
  monthlyBudget: 35000,
  userName: 'Explorer',
  theme: 'dark'
};

export const DEFAULT_REMINDER: DailyReminderSettings = {
  enabled: true,
  time: '21:00', // 9:00 PM
  hasPermission: false,
};

// No mock data - completely clean slate as requested!
export const INITIAL_EXPENSES: Expense[] = [];

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getReminderSettings(): DailyReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return DEFAULT_REMINDER;
    return { ...DEFAULT_REMINDER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDER;
  }
}

export function saveReminderSettings(settings: DailyReminderSettings): void {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

export function exportToCSV(expenses: Expense[]): void {
  if (expenses.length === 0) {
    alert('No transactions to export yet!');
    return;
  }
  const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Description', 'Merchant', 'Amount', 'Currency', 'Payment Method', 'Tags'];
  const rows = expenses.map(e => [
    e.id,
    e.date,
    e.time,
    e.type,
    `"${e.category}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${(e.merchant || '').replace(/"/g, '""')}"`,
    e.amount,
    e.currency,
    e.paymentMethod,
    `"${(e.tags || []).join(', ')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `x-pens-export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
