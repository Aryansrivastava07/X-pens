import { ExpenseCategory, PaymentMethod } from '../types';

export interface CategoryMeta {
  name: ExpenseCategory;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  defaultType: 'expense' | 'income';
}

export const CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  'Food & Dining': {
    name: 'Food & Dining',
    color: '#f97316', // orange
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    icon: 'Utensils',
    defaultType: 'expense',
  },
  'Groceries': {
    name: 'Groceries',
    color: '#10b981', // emerald
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    icon: 'ShoppingCart',
    defaultType: 'expense',
  },
  'Transportation': {
    name: 'Transportation',
    color: '#06b6d4', // cyan
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    icon: 'Car',
    defaultType: 'expense',
  },
  'Shopping': {
    name: 'Shopping',
    color: '#ec4899', // pink
    bgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
    icon: 'ShoppingBag',
    defaultType: 'expense',
  },
  'Bills & Utilities': {
    name: 'Bills & Utilities',
    color: '#eab308', // amber
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
    icon: 'Zap',
    defaultType: 'expense',
  },
  'Entertainment': {
    name: 'Entertainment',
    color: '#8b5cf6', // purple
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    icon: 'Film',
    defaultType: 'expense',
  },
  'Health & Fitness': {
    name: 'Health & Fitness',
    color: '#ef4444', // red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    icon: 'Activity',
    defaultType: 'expense',
  },
  'Travel': {
    name: 'Travel',
    color: '#3b82f6', // blue
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    icon: 'Plane',
    defaultType: 'expense',
  },
  'Education': {
    name: 'Education',
    color: '#14b8a6', // teal
    bgColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: 'rgba(20, 184, 166, 0.4)',
    icon: 'BookOpen',
    defaultType: 'expense',
  },
  'Investments': {
    name: 'Investments',
    color: '#6366f1', // indigo
    bgColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    icon: 'TrendingUp',
    defaultType: 'expense',
  },
  'Salary & Income': {
    name: 'Salary & Income',
    color: '#22c55e', // green
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
    icon: 'ArrowDownLeft',
    defaultType: 'income',
  },
  'Other': {
    name: 'Other',
    color: '#94a3b8', // slate
    bgColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
    icon: 'MoreHorizontal',
    defaultType: 'expense',
  },
};

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', icon: 'Smartphone' },
  { id: 'Credit Card', label: 'Credit Card', icon: 'CreditCard' },
  { id: 'Debit Card', label: 'Debit Card', icon: 'CreditCard' },
  { id: 'Cash', label: 'Cash', icon: 'Banknote' },
  { id: 'Net Banking', label: 'Net Banking', icon: 'Building' },
  { id: 'Wallet', label: 'Digital Wallet', icon: 'Wallet' },
  { id: 'Other', label: 'Other', icon: 'HelpCircle' },
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];
