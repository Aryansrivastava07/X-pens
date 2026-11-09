import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowUpDown, 
  Calendar,
  Edit2, 
  Trash2, 
  FileSpreadsheet,
  Tag as TagIcon
} from 'lucide-react';
import { AppSettings, Expense, ExpenseCategory, TagItem } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/categories';
import { exportToCSV } from '../services/storage';

interface ExpenseTableProps {
  expenses: Expense[];
  appSettings: AppSettings;
  availableTags: TagItem[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  appSettings,
  availableTags,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter and sort
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        // Search filter
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchMerchant = item.merchant?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchAmount = item.amount.toString().includes(q);
          const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchDesc && !matchMerchant && !matchCat && !matchAmount && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Payment filter
        if (selectedPayment !== 'all' && item.paymentMethod !== selectedPayment) {
          return false;
        }

        // Type filter
        if (selectedType !== 'all' && item.type !== selectedType) {
          return false;
        }

        // Tag filter
        if (selectedTag !== 'all' && !(item.tags || []).includes(selectedTag)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const comp = a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
          return sortOrder === 'desc' ? -comp : comp;
        } else {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [expenses, searchTerm, selectedCategory, selectedPayment, selectedType, selectedTag, sortField, sortOrder]);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const allCategories = Object.keys(CATEGORIES) as ExpenseCategory[];

  return (
    <div className="space-y-4">
      {/* Top action & filter bar */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses, merchants, tags, amounts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportToCSV(expenses)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 max-w-[140px]"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Tag filter (From DB Tags Table) */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 max-w-[130px]"
          >
            <option value="all">All Tags (DB)</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                #{tag.name}
              </option>
            ))}
          </select>

          {/* Payment Method filter */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Payments</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.label}
              </option>
            ))}
          </select>

          {/* Sort Toggles */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                sortField === 'date'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Date {sortField === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                sortField === 'amount'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Amount {sortField === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {expenses.length === 0
                ? 'No transactions in database yet. Add your first expense above!'
                : 'No transactions match your search or filter criteria.'}
            </p>
            {expenses.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedPayment('all');
                  setSelectedType('all');
                  setSelectedTag('all');
                }}
                className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Tags (DB)</th>
                    <th className="py-3 px-4 font-semibold">Payment</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredExpenses.map((tx) => {
                    const catMeta = CATEGORIES[tx.category] || CATEGORIES.Other;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                          <div>{tx.date}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{tx.time}</div>
                        </td>

                        {/* Description & Merchant */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{tx.description}</div>
                          {tx.merchant && (
                            <div className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                              @ {tx.merchant}
                            </div>
                          )}
                          {tx.rawInput && tx.rawInput !== tx.description && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs italic mt-0.5">
                              "{tx.rawInput}"
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor: catMeta.bgColor,
                              color: catMeta.color,
                              borderColor: catMeta.borderColor,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catMeta.color }} />
                            {tx.category}
                          </span>
                        </td>

                        {/* Tags */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {tx.tags && tx.tags.length > 0 ? (
                              tx.tags.map((tagName) => {
                                const tagMeta = availableTags.find((t) => t.name === tagName);
                                const color = tagMeta?.color || '#10b981';
                                return (
                                  <span
                                    key={tagName}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border"
                                    style={{
                                      backgroundColor: `${color}15`,
                                      borderColor: `${color}35`,
                                      color: color,
                                    }}
                                  >
                                    #{tagName}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {tx.paymentMethod}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-sm">
                          <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                            {tx.type === 'income' ? '+' : '-'} {appSettings.currencySymbol} {tx.amount.toLocaleString()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditExpense(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${tx.description}"?`)) {
                                  onDeleteExpense(tx.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((tx) => {
                const catMeta = CATEGORIES[tx.category] || CATEGORIES.Other;
                return (
                  <div key={tx.id} className="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border mb-1"
                          style={{
                            backgroundColor: catMeta.bgColor,
                            color: catMeta.color,
                            borderColor: catMeta.borderColor,
                          }}
                        >
                          {tx.category}
                        </span>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{tx.description}</h3>
                        {tx.merchant && <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">@ {tx.merchant}</p>}
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-base font-bold ${
                            tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {appSettings.currencySymbol} {tx.amount.toLocaleString()}
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono">{tx.date}</p>
                      </div>
                    </div>

                    {/* Tags in mobile */}
                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {tx.tags.map((tagName) => (
                          <span
                            key={tagName}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            #{tagName}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.paymentMethod}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditExpense(tx)}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${tx.description}"?`)) {
                              onDeleteExpense(tx.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
