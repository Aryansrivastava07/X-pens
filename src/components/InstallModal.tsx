import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  Download, 
  Share2, 
  MoreVertical, 
  Globe, 
  Check, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  QrCode
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'network'>('android');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = window.location.host;
  const currentUrl = window.location.href;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Use X-pens on Your Phone</h2>
              <p className="text-xs text-slate-400">Install as a standalone mobile app (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Native Install Button (if browser triggered beforeinstallprompt) */}
        {deferredPrompt && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-white block">Ready to Install!</span>
              <span className="text-xs text-emerald-300">Tap to install X-pens to your home screen right now.</span>
            </div>
            <button
              onClick={onInstallClick}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setPlatform('android')}
            className={`py-2 rounded-lg transition-all ${
              platform === 'android' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`py-2 rounded-lg transition-all ${
              platform === 'ios' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            iPhone (iOS)
          </button>
          <button
            onClick={() => setPlatform('network')}
            className={`py-2 rounded-lg transition-all ${
              platform === 'network' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Connect Phone
          </button>
        </div>

        {/* Tab 1: Android Guide */}
        {platform === 'android' && (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-slate-400">
              On Android, X-pens behaves exactly like a native app installed from the Google Play Store (full screen, app icon on home screen, offline cache, and daily push notifications).
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5">Open in Google Chrome</span>
                  <span className="text-slate-400">Open the X-pens URL in Google Chrome on your Android phone.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5 flex items-center gap-1.5">
                    <span>Tap Menu</span>
                    <MoreVertical className="w-3.5 h-3.5 text-slate-400 inline" />
                    <span>(Three dots in the top right)</span>
                  </span>
                  <span className="text-slate-400">Tap the three vertical dots icon in Chrome's top address bar.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5 flex items-center gap-1.5">
                    <span>Tap "Install app" or "Add to Home screen"</span>
                    <Download className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </span>
                  <span className="text-slate-400">
                    Chrome will prompt you to install. Tap <strong>Install</strong>.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              ✓ Once installed, open <strong>X-pens</strong> from your home screen. It will open without browser address bars, with full daily notification support!
            </div>
          </div>
        )}

        {/* Tab 2: iPhone / iOS Guide */}
        {platform === 'ios' && (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-slate-400">
              Apple iOS supports Progressive Web Apps directly through Safari. It gives you an app icon on your home screen and full standalone screen mode.
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5">Open in Safari</span>
                  <span className="text-slate-400">Open the X-pens URL using Apple Safari on your iPhone.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5 flex items-center gap-1.5">
                    <span>Tap the Share Button</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  </span>
                  <span className="text-slate-400">Tap the square with an arrow pointing up at the bottom toolbar of Safari.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    Select "Add to Home Screen"
                  </span>
                  <span className="text-slate-400">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong> in the top-right corner.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              ✓ X-pens is now on your iPhone home screen! Tap it anytime to add expenses in natural language.
            </div>
          </div>
        )}

        {/* Tab 3: Connecting Phone to Local PC / Cloud */}
        {platform === 'network' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Method A: Connect on Same Wi-Fi Network</span>
              <p className="text-slate-400 leading-relaxed">
                Make sure your phone and PC are connected to the same Wi-Fi. In your PC terminal, run:
              </p>
              <div className="p-2 rounded bg-slate-950 font-mono text-emerald-400 text-xs">
                npm run dev -- --host
              </div>
              <p className="text-slate-400">
                Vite will print a Network URL (e.g. <code className="text-cyan-300">http://192.168.1.X:5173</code>). Type that address into your phone's browser!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Method B: Free 24/7 Cloud Hosting (Recommended for Push Notifications)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Mobile browsers require an <strong>HTTPS</strong> address to enable full Web Push Notifications and offline PWA installation. You can deploy this app in 1 minute for free using <strong>Vercel</strong> or <strong>Netlify</strong>:
              </p>
              <div className="p-2.5 rounded bg-slate-950 font-mono text-slate-200 text-xs space-y-1">
                <div className="text-slate-400"># Using Vercel CLI:</div>
                <div className="text-emerald-400">npx vercel</div>
              </div>
              <p className="text-slate-400">
                You will get an instant permanent link like <code className="text-cyan-300">https://x-pens.vercel.app</code> that works everywhere on any phone!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
