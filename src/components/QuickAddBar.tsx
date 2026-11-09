import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Check, 
  X, 
  Receipt, 
  TrendingDown,
  TrendingUp,
  Tag as TagIcon
} from 'lucide-react';
import { AppSettings, Expense, ParsedExpenseResult, TagItem } from '../types';
import { parseNaturalLanguageExpense } from '../services/aiParser';
import { TagSelector } from './TagSelector';

interface QuickAddBarProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  appSettings: AppSettings;
  onOpenPhoneModal: () => void;
  availableTags: TagItem[];
  onAddNewTag: (name: string, color?: string) => Promise<TagItem | null>;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  onAddExpense,
  appSettings,
  onOpenPhoneModal,
  availableTags,
  onAddNewTag,
}) => {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedExpenseResult | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-IN';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleParse(transcript);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      recognitionRef.current = recog;
    }
  }, [appSettings]);

  const toggleVoice = () => {
    if (!speechSupported) {
      alert('Voice dictation is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleParse = async (textToParse?: string) => {
    const query = (textToParse ?? inputText).trim();
    if (!query) return;

    setIsParsing(true);
    try {
      const apiKey = appSettings.useGeminiAI ? appSettings.geminiApiKey : undefined;
      const result = await parseNaturalLanguageExpense(
        query,
        apiKey,
        appSettings.currency,
        availableTags
      );
      setParsedPreview(result);
      setSelectedTags(result.tags || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedPreview) return;

    onAddExpense({
      amount: parsedPreview.amount,
      currency: parsedPreview.currency || appSettings.currency,
      category: parsedPreview.category,
      description: parsedPreview.description,
      merchant: parsedPreview.merchant,
      date: parsedPreview.date,
      time: parsedPreview.time,
      paymentMethod: parsedPreview.paymentMethod,
      type: parsedPreview.type,
      rawInput: inputText,
      tags: selectedTags,
    });

    // Reset
    setInputText('');
    setParsedPreview(null);
    setSelectedTags([]);
  };

  const handleCancelPreview = () => {
    setParsedPreview(null);
    setSelectedTags([]);
  };

  const sampleChips = [
    '☕ Coffee with Alex 140 GPay',
    '🚗 Uber 240 to airport',
    '🛒 Blinkit groceries 680 card',
    '⚡ Electricity bill 1250 netbanking',
    '💼 Salary credited 80000',
  ];

  return (
    <div className="w-full">
      <div className="rounded-2xl p-4 sm:p-5 shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Natural Language AI Logger
            </span>
            {appSettings.useGeminiAI && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-semibold border border-cyan-500/20">
                Gemini Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPhoneModal}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors font-medium"
            >
              <Receipt className="w-3.5 h-3.5 text-cyan-500" />
              <span>Paste Bank SMS</span>
            </button>
          </div>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (parsedPreview) {
              handleConfirmAdd();
            } else {
              handleParse();
            }
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (parsedPreview) setParsedPreview(null);
              }}
              placeholder="Add like a WhatsApp message: 'Dinner 650 with team via UPI'..."
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />

            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setParsedPreview(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Voice Input */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              className={`p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isListening ? 'Listening...' : 'Speak your expense'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!inputText.trim() || isParsing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold flex items-center gap-2 hover:opacity-95 transition-all disabled:opacity-40 shadow-sm"
          >
            {isParsing ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI Extract</span>
                <Send className="w-4 h-4 sm:hidden" />
              </>
            )}
          </button>
        </form>

        {/* Quick Example Chips */}
        {!parsedPreview && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500 dark:text-slate-400 no-scrollbar">
            <span className="font-medium shrink-0">Try:</span>
            {sampleChips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(chip);
                  handleParse(chip);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all text-xs"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* AI Parsed Preview Card */}
        {parsedPreview && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  AI Parsed Result
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono">
                  {Math.round(parsedPreview.confidence * 100)}% confidence
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelPreview}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Amount</span>
                <div className="flex items-center gap-1 font-bold text-base sm:text-lg">
                  {parsedPreview.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  )}
                  <span className={parsedPreview.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                    {appSettings.currencySymbol} {parsedPreview.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  {parsedPreview.category}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Payment</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                  {parsedPreview.paymentMethod}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Date & Time</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {parsedPreview.date} {parsedPreview.time}
                </span>
              </div>
            </div>

            {/* Tag Selector dropdown with "+ Add New Tag / Other" */}
            <div className="pt-1">
              <TagSelector
                availableTags={availableTags}
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                onAddNewTag={onAddNewTag}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <p className="truncate mr-2">
                <span className="font-semibold">Summary:</span> {parsedPreview.description}
                {parsedPreview.merchant && ` (@ ${parsedPreview.merchant})`}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save to Table</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
