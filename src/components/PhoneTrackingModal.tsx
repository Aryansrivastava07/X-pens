import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Zap,
  Code
} from 'lucide-react';
import { AppSettings, Expense, ParsedExpenseResult, TagItem } from '../types';
import { parseNaturalLanguageExpense } from '../services/aiParser';

interface PhoneTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appSettings: AppSettings;
  availableTags: TagItem[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export const PhoneTrackingModal: React.FC<PhoneTrackingModalProps> = ({
  isOpen,
  onClose,
  appSettings,
  availableTags,
  onAddExpense,
}) => {
  const [smsInput, setSmsInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedExpenseResult | null>(null);
  const [added, setAdded] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  if (!isOpen) return null;

  const sampleSMSList = [
    {
      label: 'SBI Bank UPI',
      text: 'Dear SBI User, A/C *4921 debited by Rs.450.00 on 09Nov26 transfer to SWIGGY UPI:12345678 - State Bank of India'
    },
    {
      label: 'HDFC Credit Card',
      text: 'HDFC Bank Alert: Rs 1,890.00 spent on your Credit Card ending 4412 at RELIANCE RETAIL on 09-11-2026. Avl Lmt Rs 1,45,000'
    },
    {
      label: 'ICICI Bank Debit',
      text: 'ICICI Bank Acct XX102 debited for Rs 320.00 on 09-Nov-26. UPI: Zomato. Avl Bal Rs 24,150.00'
    },
    {
      label: 'US Bank / Apple Pay',
      text: 'Alert: $42.50 was charged to your Chase Sapphire card ending 8821 at WHOLE FOODS MARKET via Apple Pay.'
    }
  ];

  const handleParseSMS = async (text?: string) => {
    const raw = (text ?? smsInput).trim();
    if (!raw) return;

    setIsParsing(true);
    setAdded(false);
    try {
      const apiKey = appSettings.useGeminiAI ? appSettings.geminiApiKey : undefined;
      const res = await parseNaturalLanguageExpense(
        raw,
        apiKey,
        appSettings.currency,
        availableTags
      );
      setParsedResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddParsed = () => {
    if (!parsedResult) return;

    onAddExpense({
      amount: parsedResult.amount,
      currency: parsedResult.currency || appSettings.currency,
      category: parsedResult.category,
      description: parsedResult.description,
      merchant: parsedResult.merchant,
      date: parsedResult.date,
      time: parsedResult.time,
      paymentMethod: parsedResult.paymentMethod,
      type: parsedResult.type,
      rawInput: smsInput,
      tags: parsedResult.tags && parsedResult.tags.length > 0 ? parsedResult.tags : ['phone-sms'],
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setParsedResult(null);
      setSmsInput('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Phone Payments & SMS Forwarding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capture transactions from bank debit alerts, UPI & mobile SMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Reality & Privacy Explanation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>How Phone Payment Tracking Works</span>
          </div>
          <p className="leading-relaxed">
            Mobile operating systems (iOS and Android) intentionally prevent web pages from silently reading personal SMS in the background for banking security.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-0.5">1. Instant SMS Copy-Paste</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Copy any bank SMS; our AI extracts amount, category, and payment method instantly.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">2. Android Auto-Forwarding Webhook</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Use MacroDroid or Tasker to auto-forward bank SMS to your Prisma database.</span>
            </div>
          </div>
        </div>

        {/* Live Bank SMS AI Extractor Playground */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Try Live Bank SMS Parser</span>
            </label>
            <span className="text-[11px] text-slate-400">Click a sample to test:</span>
          </div>

          {/* Sample bank buttons */}
          <div className="flex flex-wrap gap-2">
            {sampleSMSList.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSmsInput(sample.text);
                  handleParseSMS(sample.text);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>

          {/* Input text area */}
          <div className="relative">
            <textarea
              rows={3}
              value={smsInput}
              onChange={(e) => {
                setSmsInput(e.target.value);
                if (parsedResult) setParsedResult(null);
              }}
              placeholder="Paste any bank SMS or UPI notification text here..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={() => handleParseSMS()}
            disabled={!smsInput.trim() || isParsing}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-sm"
          >
            {isParsing ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Payment Details with AI</span>
              </>
            )}
          </button>

          {/* Result Card */}
          {parsedResult && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">Extracted Information:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  {Math.round(parsedResult.confidence * 100)}% confidence
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Amount</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {appSettings.currencySymbol} {parsedResult.amount.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Category</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{parsedResult.category}</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Merchant</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400 truncate block">
                    {parsedResult.merchant || 'General'}
                  </span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Payment Via</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{parsedResult.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setParsedResult(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleAddParsed}
                  disabled={added}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{added ? 'Added to Prisma DB!' : 'Add to Expense Table'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Android Automation / Webhook Details */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showWebhookGuide ? 'Hide Android Auto-Forwarding Setup' : 'Show Automatic SMS Forwarding Webhook (MacroDroid / Tasker)'}</span>
          </button>

          {showWebhookGuide && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300 animate-in fade-in">
              <p className="font-bold text-slate-900 dark:text-white">
                How to set up hands-free SMS tracking on Android:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                <li>Install <strong>MacroDroid</strong> (Free) from Google Play Store on your Android phone.</li>
                <li>Add a Trigger: <strong>SMS Received</strong> ➔ from bank sender (e.g. SBI, HDFC, ICICI).</li>
                <li>Add an Action: <strong>HTTP Request (POST)</strong> to your server URL:</li>
              </ol>
              <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-cyan-600 dark:text-cyan-300">
                URL: https://your-domain.com/api/webhook/sms<br />
                Body: &#123; "message": "[sms_body]" &#125;
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Every time you pay via UPI or card, the bank SMS automatically forwards and gets saved straight into your Prisma database!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
