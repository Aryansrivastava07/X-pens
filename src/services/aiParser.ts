import { ExpenseCategory, ParsedExpenseResult, PaymentMethod, TagItem, TransactionType } from '../types';

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  'Food & Dining': [
    'food', 'lunch', 'dinner', 'breakfast', 'brunch', 'cafe', 'coffee', 'tea', 'chai',
    'starbucks', 'mcdonalds', 'kfc', 'burger', 'pizza', 'dominos', 'subway', 'swiggy',
    'zomato', 'restaurant', 'snack', 'snacks', 'biryani', 'dine', 'dining', 'drinks',
    'bar', 'pub', 'beer', 'wine', 'shawarma', 'dosa', 'samosa', 'maggi', 'dessert'
  ],
  'Groceries': [
    'groceries', 'grocery', 'supermarket', 'mart', 'dmart', 'blinkit', 'zepto', 'instamart',
    'bigbasket', 'vegetables', 'fruits', 'milk', 'bread', 'eggs', 'rice', 'dal', 'provisions',
    'whole foods', 'walmart', 'target', 'trader joe', 'costco', 'ration', 'kirana'
  ],
  'Transportation': [
    'uber', 'ola', 'rapido', 'taxi', 'cab', 'auto', 'metro', 'subway', 'bus', 'train',
    'petrol', 'diesel', 'fuel', 'gas', 'toll', 'fastag', 'parking', 'bike', 'scooter', 'flight ticket'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'zara', 'h&m', 'clothes', 'shoes', 'dress',
    'shopping', 'electronics', 'gadget', 't-shirt', 'pants', 'mall', 'store', 'retail', 'meesho'
  ],
  'Bills & Utilities': [
    'bill', 'electricity', 'water', 'power', 'internet', 'wifi', 'broadband', 'recharge',
    'mobile', 'jio', 'airtel', 'vi', 'gas cylinder', 'maintenance', 'rent', 'piped gas', 'dth'
  ],
  'Entertainment': [
    'netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'movie', 'cinema', 'pvr', 'inox',
    'theatre', 'gaming', 'steam', 'playstation', 'concert', 'show', 'amusement', 'bookmyshow'
  ],
  'Health & Fitness': [
    'doctor', 'hospital', 'clinic', 'medicine', 'pharmacy', 'chemist', 'apollo', '1mg',
    'gym', 'fitness', 'workout', 'supplements', 'protein', 'dental', 'health insurance', 'cult'
  ],
  'Travel': [
    'flight', 'hotel', 'airbnb', 'makemytrip', 'goibibo', 'booking.com', 'vacation',
    'resort', 'luggage', 'visa', 'trip', 'tour', 'hostel'
  ],
  'Education': [
    'course', 'udemy', 'coursera', 'books', 'tuition', 'school', 'college', 'exam',
    'classes', 'training', 'certification', 'fees'
  ],
  'Investments': [
    'stocks', 'zerodha', 'groww', 'mutual fund', 'sip', 'crypto', 'bitcoin', 'shares',
    'gold', 'fd', 'fixed deposit'
  ],
  'Salary & Income': [
    'salary', 'bonus', 'dividend', 'interest', 'freelance', 'received from', 'cashback',
    'refund', 'credited from', 'payment received', 'stipend'
  ],
  'Other': []
};

const PAYMENT_KEYWORDS: { method: PaymentMethod; keywords: string[] }[] = [
  { method: 'UPI', keywords: ['upi', 'gpay', 'google pay', 'phonepe', 'paytm', 'bhim', 'vpa', '@ok', '@upi', 'cred'] },
  { method: 'Credit Card', keywords: ['credit card', 'cc', 'hdfc card', 'icici card', 'sbi card', 'amex', 'mastercard', 'visa card', 'axis card'] },
  { method: 'Debit Card', keywords: ['debit card', 'atm card', 'dc'] },
  { method: 'Cash', keywords: ['cash', 'in hand', 'hard cash', 'notes', 'paid cash'] },
  { method: 'Net Banking', keywords: ['net banking', 'netbanking', 'neft', 'rtgs', 'imps', 'bank transfer', 'wire transfer'] },
  { method: 'Wallet', keywords: ['wallet', 'apple pay', 'paytm wallet', 'amazon pay'] },
];

/**
 * Supercharged Native NLP heuristic parser
 */
export function parseWithHeuristics(
  rawText: string,
  defaultCurrency: string = 'INR',
  availableTags: TagItem[] = []
): ParsedExpenseResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Transaction Type
  let type: TransactionType = 'expense';
  if (
    lower.includes('credited') ||
    lower.includes('salary') ||
    lower.includes('received') ||
    lower.includes('refund') ||
    lower.includes('cashback') ||
    lower.includes('deposit') ||
    lower.includes('income') ||
    lower.includes('stipend')
  ) {
    if (!lower.includes('debited') && !lower.includes('spent') && !lower.includes('paid')) {
      type = 'income';
    }
  }

  // 2. Extract Currency
  let currency = defaultCurrency;
  if (text.includes('$') || lower.includes('usd') || lower.includes('dollars')) currency = 'USD';
  else if (text.includes('€') || lower.includes('eur') || lower.includes('euros')) currency = 'EUR';
  else if (text.includes('£') || lower.includes('gbp') || lower.includes('pounds')) currency = 'GBP';
  else if (lower.includes('aed') || lower.includes('dirham')) currency = 'AED';
  else if (text.includes('₹') || lower.includes('rs') || lower.includes('inr') || lower.includes('rupees') || lower.includes('bucks')) currency = 'INR';

  // 3. Extract Amount (Handles split bills, e.g. "my share 500", "my half 400", "450 groceries")
  let amount = 0;

  // Check for split/share patterns first: "my share 450", "share is 500", "my half 300"
  const shareMatch = text.match(/(?:my\s+share|my\s+part|my\s+half|i\s+paid|paid)\s*(?:is|was|of|:)?\s*(?:[\$₹€£]|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (shareMatch && shareMatch[1]) {
    amount = parseFloat(shareMatch[1]);
  } else {
    // Bank SMS patterns
    const smsAmountMatch = text.match(/(?:(?:rs\.?|inr|\$|€|£)\s*|debited\s+(?:by\s+)?(?:rs\.?|inr)?\s*|spent\s+(?:rs\.?|inr)?\s*)([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    if (smsAmountMatch && smsAmountMatch[1]) {
      amount = parseFloat(smsAmountMatch[1].replace(/,/g, ''));
    } else {
      // General natural language patterns: "Coffee 150", "45.50 at Trader Joe", "1200 electricity"
      const numberMatches = text.match(/(?:^|\s)(?:[\$₹€£]|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:[\$₹€£]|rs\.?|inr|bucks|rupees)?(?:\s|$)/gi);
      if (numberMatches && numberMatches.length > 0) {
        // Pick the most likely numeric amount (excluding 4-digit years like 2024 or account digits ending with 4 digits if indicated)
        for (const m of numberMatches) {
          const num = parseFloat(m.replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0 && num !== 2024 && num !== 2025 && num !== 2026) {
            amount = num;
            break;
          }
        }
      }
    }
  }

  // 4. Extract Payment Method
  let paymentMethod: PaymentMethod = 'UPI';
  for (const item of PAYMENT_KEYWORDS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      paymentMethod = item.method;
      break;
    }
  }

  // 5. Extract Category
  let category: ExpenseCategory = type === 'income' ? 'Salary & Income' : 'Other';
  let matchedKeyword = '';

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ExpenseCategory, string[]][]) {
    if (cat === 'Salary & Income' && type !== 'income') continue;
    const match = keywords.find((k) => lower.includes(k));
    if (match) {
      category = cat;
      matchedKeyword = match;
      break;
    }
  }

  // 6. Extract Merchant
  let merchant = '';
  const merchantMatch = text.match(/(?:at|to|info:?|vpa:?)\s+([A-Za-z0-9\s&'\.-]{3,25}?)(?:\s+on|\s+via|\s+upi|\s+ref|\s+avl|\s+bal|\.|$)/i);
  if (merchantMatch && merchantMatch[1]) {
    const raw = merchantMatch[1].trim();
    if (!['rs', 'inr', 'card', 'bank', 'your', 'my', 'the', 'office'].includes(raw.toLowerCase())) {
      merchant = raw;
    }
  }

  // 7. Extract Tags matching known DB tags
  const matchedTags: string[] = [];
  availableTags.forEach((t) => {
    if (lower.includes(t.name.toLowerCase())) {
      matchedTags.push(t.name);
    }
  });

  // If no tag matched, add category as tag if it exists in available tags
  if (matchedTags.length === 0) {
    const catTag = availableTags.find((t) => t.name.toLowerCase() === category.toLowerCase());
    if (catTag) matchedTags.push(catTag.name);
  }

  // 8. Clean Description
  let description = text
    .replace(/dear .* user,?/i, '')
    .replace(/avl bal.*$/i, '')
    .replace(/ref no.*$/i, '')
    .trim();

  if (description.length > 70 && merchant) {
    description = `${category} at ${merchant}`;
  }

  const now = new Date();
  let date = now.toISOString().split('T')[0];
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (lower.includes('yesterday')) {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    date = yest.toISOString().split('T')[0];
  }

  return {
    amount: isNaN(amount) ? 0 : amount,
    currency,
    category,
    description: description || `${category} expense`,
    merchant: merchant || undefined,
    date,
    time,
    paymentMethod,
    type,
    tags: matchedTags,
    confidence: amount > 0 ? 0.90 : 0.45,
    reasoning: `Extracted via Enhanced Native NLP: detected ${currency} ${amount || 0} in ${category} via ${paymentMethod}`
  };
}

/**
 * Gemini AI Extraction via Backend API or Client-side
 */
export async function parseWithGeminiAI(
  text: string,
  apiKey?: string,
  availableTags: TagItem[] = []
): Promise<ParsedExpenseResult> {
  // First try backend proxy /api/parse-gemini
  try {
    const res = await fetch('/api/parse-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        apiKey,
        existingTags: availableTags.map((t) => t.name),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        amount: Number(data.amount) || 0,
        currency: data.currency || 'INR',
        category: data.category || 'Other',
        description: data.description || text,
        merchant: data.merchant || undefined,
        date: data.date || new Date().toISOString().split('T')[0],
        time: data.time || '12:00',
        paymentMethod: data.paymentMethod || 'UPI',
        type: data.type === 'income' ? 'income' : 'expense',
        tags: Array.isArray(data.tags) ? data.tags : [],
        confidence: data.confidence || 0.96,
        reasoning: data.reasoning || 'Extracted via Google Gemini AI',
      };
    }
  } catch (err) {
    console.warn('Backend Gemini endpoint unavailable, falling back:', err);
  }

  // Client-side direct call if API key provided
  if (apiKey && apiKey.length > 10) {
    try {
      const prompt = `You are a financial AI inside an expense tracking app.
Extract transaction details from this text:
"${text}"

Current Date: ${new Date().toISOString().split('T')[0]}
Known Tags: ${JSON.stringify(availableTags.map((t) => t.name))}

Respond ONLY with a JSON object:
{
  "amount": number,
  "currency": string,
  "category": "Food & Dining" | "Groceries" | "Transportation" | "Shopping" | "Bills & Utilities" | "Entertainment" | "Health & Fitness" | "Travel" | "Education" | "Investments" | "Salary & Income" | "Other",
  "description": string,
  "merchant": string or null,
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "paymentMethod": "UPI" | "Credit Card" | "Debit Card" | "Cash" | "Net Banking" | "Wallet" | "Other",
  "type": "expense" | "income",
  "tags": string[],
  "confidence": number,
  "reasoning": string
}`;

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

      if (resp.ok) {
        const json = await resp.json();
        const rawContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const parsed = JSON.parse(rawContent.replace(/```json\n?|```/g, '').trim());
          return {
            amount: Number(parsed.amount) || 0,
            currency: parsed.currency || 'INR',
            category: parsed.category || 'Other',
            description: parsed.description || text,
            merchant: parsed.merchant || undefined,
            date: parsed.date || new Date().toISOString().split('T')[0],
            time: parsed.time || '12:00',
            paymentMethod: parsed.paymentMethod || 'UPI',
            type: parsed.type === 'income' ? 'income' : 'expense',
            tags: parsed.tags || [],
            confidence: parsed.confidence || 0.96,
            reasoning: parsed.reasoning || 'Extracted via Google Gemini AI',
          };
        }
      }
    } catch (err) {
      console.warn('Direct Gemini call failed:', err);
    }
  }

  // Fallback to Enhanced Native NLP
  return parseWithHeuristics(text, 'INR', availableTags);
}

/**
 * Universal Entrypoint
 */
export async function parseNaturalLanguageExpense(
  text: string,
  apiKey?: string,
  defaultCurrency: string = 'INR',
  availableTags: TagItem[] = []
): Promise<ParsedExpenseResult> {
  if (apiKey && apiKey.trim().length > 10) {
    return await parseWithGeminiAI(text, apiKey.trim(), availableTags);
  }
  return parseWithHeuristics(text, defaultCurrency, availableTags);
}
