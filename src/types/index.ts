export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Travel'
  | 'Education'
  | 'Investments'
  | 'Salary & Income'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Net Banking'
  | 'Wallet'
  | 'Other';

export type TransactionType = 'expense' | 'income';

export interface TagItem {
  id: string;
  name: string;
  color?: string;
  createdAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  merchant?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  type: TransactionType;
  rawInput?: string;
  tags: string[];
  createdAt: number;
}

export interface DailyReminderSettings {
  enabled: boolean;
  time: string; // HH:mm 24-hr format e.g. "21:00"
  hasPermission: boolean;
  lastNotifiedDate?: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  geminiApiKey: string;
  useGeminiAI: boolean;
  monthlyBudget: number;
  userName: string;
  theme: 'dark' | 'light';
}

export interface ParsedExpenseResult {
  amount: number;
  currency?: string;
  category: ExpenseCategory;
  description: string;
  merchant?: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  type: TransactionType;
  tags?: string[];
  confidence: number;
  reasoning?: string;
}
