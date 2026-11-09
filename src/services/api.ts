import { Expense, TagItem } from '../types';

const API_BASE = '/api';

export const api = {
  // ----------------- TAGS -----------------
  async getTags(): Promise<TagItem[]> {
    try {
      const res = await fetch(`${API_BASE}/tags`);
      if (!res.ok) throw new Error('Failed to fetch tags');
      return await res.json();
    } catch (err) {
      console.warn('API getTags offline fallback:', err);
      // Fallback from localStorage
      const local = localStorage.getItem('xpens_tags');
      if (local) return JSON.parse(local);
      const defaults: TagItem[] = [
        { id: '1', name: 'Personal', color: '#10b981' },
        { id: '2', name: 'Work', color: '#3b82f6' },
        { id: '3', name: 'Family', color: '#8b5cf6' },
        { id: '4', name: 'Food', color: '#f97316' },
        { id: '5', name: 'Groceries', color: '#14b8a6' },
        { id: '6', name: 'Travel', color: '#06b6d4' },
        { id: '7', name: 'Bills', color: '#eab308' },
        { id: '8', name: 'Shopping', color: '#ec4899' },
      ];
      localStorage.setItem('xpens_tags', JSON.stringify(defaults));
      return defaults;
    }
  },

  async createTag(name: string, color: string = '#10b981'): Promise<TagItem> {
    try {
      const res = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!res.ok) throw new Error('Failed to create tag');
      const tag: TagItem = await res.json();
      
      // Update local cache
      const local = localStorage.getItem('xpens_tags');
      const tags: TagItem[] = local ? JSON.parse(local) : [];
      if (!tags.some(t => t.name.toLowerCase() === tag.name.toLowerCase())) {
        tags.push(tag);
        localStorage.setItem('xpens_tags', JSON.stringify(tags));
      }
      return tag;
    } catch (err) {
      console.warn('API createTag fallback:', err);
      const fallbackTag: TagItem = {
        id: `tag-${Date.now()}`,
        name: name.trim(),
        color,
      };
      const local = localStorage.getItem('xpens_tags');
      const tags: TagItem[] = local ? JSON.parse(local) : [];
      tags.push(fallbackTag);
      localStorage.setItem('xpens_tags', JSON.stringify(tags));
      return fallbackTag;
    }
  },

  async deleteTag(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/tags/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ----------------- EXPENSES -----------------
  async getExpenses(): Promise<Expense[]> {
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data: Expense[] = await res.json();
      localStorage.setItem('xpens_transactions_v2', JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('API getExpenses fallback to local:', err);
      const local = localStorage.getItem('xpens_transactions_v2');
      return local ? JSON.parse(local) : [];
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) throw new Error('Failed to create expense');
      const saved: Expense = await res.json();

      // Update local storage
      const current = await this.getExpenses();
      localStorage.setItem('xpens_transactions_v2', JSON.stringify([saved, ...current]));
      return saved;
    } catch (err) {
      console.warn('API createExpense fallback to local:', err);
      const fallback: Expense = {
        ...expense,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      const local = localStorage.getItem('xpens_transactions_v2');
      const current: Expense[] = local ? JSON.parse(local) : [];
      const updated = [fallback, ...current];
      localStorage.setItem('xpens_transactions_v2', JSON.stringify(updated));
      return fallback;
    }
  },

  async updateExpense(id: string, expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) throw new Error('Failed to update expense');
      return await res.json();
    } catch (err) {
      console.warn('API updateExpense fallback:', err);
      const fallback: Expense = { ...expense, id, createdAt: Date.now() };
      return fallback;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.warn('API deleteExpense fallback:', err);
      return true;
    }
  },
};
