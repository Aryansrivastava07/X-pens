import React, { useMemo } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Calendar,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { AppSettings, Expense } from '../types';
import { CATEGORIES } from '../utils/categories';

interface DashboardViewProps {
  expenses: Expense[];
  appSettings: AppSettings;
  onViewAllClick: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  appSettings,
  onViewAllClick,
  onEditExpense,
}) => {
  const isDark = appSettings.theme === 'dark';
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];

  const currentMonthTransactions = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(currentMonthStr));
  }, [expenses, currentMonthStr]);

  const totalSpent = useMemo(() => {
    return currentMonthTransactions
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthTransactions]);

  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthTransactions]);

  const netSavings = totalIncome - totalSpent;

  const todaySpent = useMemo(() => {
    return expenses
      .filter(e => e.date === todayStr && e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const budgetUsedPct = appSettings.monthlyBudget > 0
    ? Math.min(100, Math.round((totalSpent / appSettings.monthlyBudget) * 100))
    : 0;

  // Chart 1: 14-day spending trend
  const trendData = useMemo(() => {
    const daysMap = new Map<string, number>();
    const dates: string[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dates.push(dateKey);
      daysMap.set(dateKey, 0);
    }

    expenses.forEach(e => {
      if (e.type === 'expense' && daysMap.has(e.date)) {
        daysMap.set(e.date, (daysMap.get(e.date) || 0) + e.amount);
      }
    });

    return dates.map(dateKey => {
      const d = new Date(dateKey);
      return {
        date: dateKey,
        label: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        amount: daysMap.get(dateKey) || 0,
      };
    });
  }, [expenses]);

  // Chart 2: Category breakdown data
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();

    currentMonthTransactions
      .filter(e => e.type === 'expense')
      .forEach(e => {
        map.set(e.category, (map.get(e.category) || 0) + e.amount);
      });

    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORIES[name as keyof typeof CATEGORIES]?.color || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  // Chart 3: Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const map = new Map<string, number>();

    currentMonthTransactions
      .filter(e => e.type === 'expense')
      .forEach(e => {
        map.set(e.paymentMethod, (map.get(e.paymentMethod) || 0) + e.amount);
      });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [expenses]);

  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#ffffff' : '#0f172a';

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Spent This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {appSettings.currencySymbol} {totalSpent.toLocaleString()}
            </span>
          </div>
          {/* Budget progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Budget: {appSettings.currencySymbol} {appSettings.monthlyBudget.toLocaleString()}</span>
              <span className={budgetUsedPct > 90 ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'}>
                {budgetUsedPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsedPct > 90 ? 'bg-rose-500' : budgetUsedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetUsedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Income This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {appSettings.currencySymbol} {totalIncome.toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Total positive cash inflow
          </p>
        </div>

        {/* Net Savings */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-extrabold ${netSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
              {appSettings.currencySymbol} {netSavings.toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {netSavings >= 0 ? 'Retained surplus' : 'Deficit this month'}
          </p>
        </div>

        {/* Today's Spend */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Spend
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {appSettings.currencySymbol} {todaySpent.toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {expenses.filter(e => e.date === todayStr).length} entries recorded today
          </p>
        </div>
      </div>

      {/* Empty State when zero transactions */}
      {expenses.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Your expense database is ready!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No mock data. Start logging your real expenses in natural language above (e.g. <em>"Coffee with Alex 140 GPay"</em>) or paste any bank debit SMS!
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Area Chart (2 Cols) */}
            <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    14-Day Spending Trend
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daily expenses over the last two weeks</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="label" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }} className="border p-2.5 rounded-lg shadow-xl text-xs">
                              <p className="text-slate-400 font-medium">{data.date}</p>
                              <p className="text-emerald-500 font-bold mt-1 text-sm">
                                {appSettings.currencySymbol} {Number(data.amount).toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#spendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Donut Chart (1 Col) */}
            <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-cyan-500" />
                    Category Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Monthly expenses by category</p>
                </div>
              </div>

              {categoryData.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                  <PieIcon className="w-8 h-8 mb-2 opacity-40" />
                  <span>No expenses for this month yet.</span>
                </div>
              ) : (
                <>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const pct = totalSpent > 0 ? Math.round((data.value / totalSpent) * 100) : 0;
                              return (
                                <div style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }} className="border p-2.5 rounded-lg shadow-xl text-xs">
                                  <p className="font-semibold" style={{ color: textColor }}>{data.name}</p>
                                  <p className="text-emerald-500 font-bold mt-1">
                                    {appSettings.currencySymbol} {data.value.toLocaleString()} ({pct}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend List */}
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {categoryData.slice(0, 4).map((item) => {
                      const pct = totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-2">
                            {appSettings.currencySymbol} {item.value.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Methods & Recent Transactions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Modes Chart (1 Col) */}
            <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Payment Methods
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Where money was spent from</p>
              </div>

              <div className="h-56 w-full">
                {paymentMethodData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No payment data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethodData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} tickLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }} className="border p-2 rounded-lg text-xs">
                                <span className="font-semibold" style={{ color: textColor }}>{data.name}: </span>
                                <span className="text-emerald-500 font-bold">
                                  {appSettings.currencySymbol} {data.value.toLocaleString()}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Transactions (2 Cols) */}
            <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      Recent Activity
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Latest natural language entries</p>
                  </div>

                  <button
                    onClick={onViewAllClick}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>View Table</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentTransactions.map((tx) => {
                    const catMeta = CATEGORIES[tx.category] || CATEGORIES.Other;
                    return (
                      <div
                        key={tx.id}
                        onClick={() => onEditExpense(tx)}
                        className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                            style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
                          >
                            {tx.category.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>{tx.date}</span>
                              <span>•</span>
                              <span>{tx.paymentMethod}</span>
                              {tx.tags && tx.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    #{tx.tags[0]}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <span
                            className={`text-sm font-bold ${
                              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'} {appSettings.currencySymbol} {tx.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
