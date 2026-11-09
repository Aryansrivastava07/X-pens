import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Seed initial default tags if table is empty
async function seedDefaultTags() {
  try {
    const count = await prisma.tag.count();
    if (count === 0) {
      const defaultTags = [
        { name: 'Personal', color: '#10b981' },
        { name: 'Work', color: '#3b82f6' },
        { name: 'Family', color: '#8b5cf6' },
        { name: 'Food', color: '#f97316' },
        { name: 'Groceries', color: '#14b8a6' },
        { name: 'Travel', color: '#06b6d4' },
        { name: 'Bills', color: '#eab308' },
        { name: 'Shopping', color: '#ec4899' },
        { name: 'Health', color: '#ef4444' },
      ];
      for (const t of defaultTags) {
        await prisma.tag.create({ data: t });
      }
      console.log('Seeded default tags into Prisma database.');
    }
  } catch (err) {
    console.warn('Tag seeding note:', err);
  }
}

// ----------------- TAGS ENDPOINTS -----------------

// GET /api/tags - Get all tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tags', details: err.message });
  }
});

// POST /api/tags - Create a new tag
app.post('/api/tags', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const trimmed = name.trim();
    const existing = await prisma.tag.findUnique({
      where: { name: trimmed },
    });

    if (existing) {
      return res.json(existing);
    }

    const newTag = await prisma.tag.create({
      data: {
        name: trimmed,
        color: color || '#10b981',
      },
    });
    res.status(201).json(newTag);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create tag', details: err.message });
  }
});

// DELETE /api/tags/:id - Delete a tag
app.delete('/api/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete tag', details: err.message });
  }
});

// ----------------- EXPENSES ENDPOINTS -----------------

// Helper to format expense with tag names
function formatExpense(exp: any) {
  return {
    id: exp.id,
    amount: exp.amount,
    currency: exp.currency,
    category: exp.category,
    description: exp.description,
    merchant: exp.merchant || undefined,
    date: exp.date,
    time: exp.time,
    paymentMethod: exp.paymentMethod,
    type: exp.type,
    rawInput: exp.rawInput || undefined,
    createdAt: new Date(exp.createdAt).getTime(),
    tags: exp.tags ? exp.tags.map((t: any) => t.tag?.name || t.tagId) : [],
  };
}

// GET /api/expenses - Get all transactions
app.get('/api/expenses', async (req, res) => {
  try {
    const rawExpenses = await prisma.expense.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rawExpenses.map(formatExpense));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
  }
});

// POST /api/expenses - Create an expense with tag associations
app.post('/api/expenses', async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      category,
      description,
      merchant,
      date,
      time,
      paymentMethod,
      type = 'expense',
      rawInput,
      tags = [],
    } = req.body;

    // Resolve tag IDs
    const tagIds: string[] = [];
    for (const tagName of tags) {
      if (!tagName || !tagName.trim()) continue;
      const cleanName = tagName.trim();
      let tagObj = await prisma.tag.findUnique({ where: { name: cleanName } });
      if (!tagObj) {
        tagObj = await prisma.tag.create({
          data: { name: cleanName, color: '#10b981' },
        });
      }
      tagIds.push(tagObj.id);
    }

    const created = await prisma.expense.create({
      data: {
        amount: Number(amount) || 0,
        currency,
        category: category || 'Other',
        description: description || 'Expense',
        merchant: merchant || null,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '12:00',
        paymentMethod: paymentMethod || 'UPI',
        type: type === 'income' ? 'income' : 'expense',
        rawInput: rawInput || null,
        tags: {
          create: tagIds.map((tid) => ({
            tagId: tid,
          })),
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    res.status(201).json(formatExpense(created));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create expense', details: err.message });
  }
});

// PUT /api/expenses/:id - Update an expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      currency,
      category,
      description,
      merchant,
      date,
      time,
      paymentMethod,
      type,
      tags = [],
    } = req.body;

    // First delete existing tags relations for this expense
    await prisma.expenseTag.deleteMany({ where: { expenseId: id } });

    // Resolve new tag IDs
    const tagIds: string[] = [];
    for (const tagName of tags) {
      if (!tagName || !tagName.trim()) continue;
      const cleanName = tagName.trim();
      let tagObj = await prisma.tag.findUnique({ where: { name: cleanName } });
      if (!tagObj) {
        tagObj = await prisma.tag.create({
          data: { name: cleanName, color: '#10b981' },
        });
      }
      tagIds.push(tagObj.id);
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount: Number(amount),
        currency,
        category,
        description,
        merchant: merchant || null,
        date,
        time,
        paymentMethod,
        type,
        tags: {
          create: tagIds.map((tid) => ({ tagId: tid })),
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    res.json(formatExpense(updated));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update expense', details: err.message });
  }
});

// DELETE /api/expenses/:id - Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete expense', details: err.message });
  }
});

// ----------------- GEMINI AI TEXT PARSING -----------------
app.post('/api/parse-gemini', async (req, res) => {
  try {
    const { text, apiKey, existingTags = [] } = req.body;
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `You are a financial AI inside an expense tracking app.
Extract transaction details from this user text or bank SMS:
"${text}"

Current Date: ${new Date().toISOString().split('T')[0]}
Known Available Tags in app: ${JSON.stringify(existingTags)}

Respond with a raw JSON object (NO markdown formatting, NO backticks) matching this structure:
{
  "amount": number,
  "currency": string (e.g. "INR", "USD", "EUR"),
  "category": one of ["Food & Dining", "Groceries", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Health & Fitness", "Travel", "Education", "Investments", "Salary & Income", "Other"],
  "description": string,
  "merchant": string or null,
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "paymentMethod": one of ["UPI", "Credit Card", "Debit Card", "Cash", "Net Banking", "Wallet", "Other"],
  "type": "expense" or "income",
  "tags": string[] (pick 1 or 2 relevant tags from known tags or propose a concise tag),
  "confidence": number between 0.0 and 1.0,
  "reasoning": string
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini API Error', details: errText });
    }

    const data = await geminiRes.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return res.status(500).json({ error: 'Empty response from Gemini' });
    }

    const clean = rawContent.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to parse with Gemini', details: err.message });
  }
});

// ----------------- MOBILE PHONE SMS WEBHOOK -----------------
// For Android automation (MacroDroid, Tasker, Shortcuts) to auto-forward bank SMS
app.post('/api/webhook/sms', async (req, res) => {
  try {
    const { message, text, sender } = req.body;
    const smsContent = message || text;
    if (!smsContent) {
      return res.status(400).json({ error: 'Missing SMS text' });
    }

    console.log(`Received incoming SMS from phone (${sender || 'Unknown'}):`, smsContent);

    // Call heuristic extraction or Gemini
    // For now, simple fallback extraction:
    const amountMatch = smsContent.match(/(?:(?:rs\.?|inr|\$|€|£)\s*|debited\s+(?:by\s+)?(?:rs\.?|inr)?\s*|spent\s+(?:rs\.?|inr)?\s*)([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    const lower = smsContent.toLowerCase();
    let paymentMethod = 'UPI';
    if (lower.includes('credit card') || lower.includes('card ending')) paymentMethod = 'Credit Card';
    else if (lower.includes('debit card')) paymentMethod = 'Debit Card';

    const newExpense = await prisma.expense.create({
      data: {
        amount: amount || 0,
        currency: 'INR',
        category: 'Other',
        description: `SMS debit: ${smsContent.substring(0, 45)}...`,
        date: new Date().toISOString().split('T')[0],
        time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        paymentMethod,
        type: 'expense',
        rawInput: smsContent,
      },
      include: { tags: { include: { tag: true } } },
    });

    res.status(201).json({
      success: true,
      message: 'Logged SMS payment into database',
      expense: formatExpense(newExpense),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Webhook processing error', details: err.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`X-pens Prisma API server running on port ${PORT}`);
  await seedDefaultTags();
});
