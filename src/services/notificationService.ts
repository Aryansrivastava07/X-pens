import { DailyReminderSettings, Expense } from '../types';
import { getReminderSettings, saveReminderSettings } from './storage';

class NotificationService {
  private timerId: number | null = null;
  private onTriggerCallback: (() => void) | null = null;

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      const settings = getReminderSettings();
      saveReminderSettings({ ...settings, hasPermission: granted });
      return granted;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  public sendNotification(title: string, options?: NotificationOptions): boolean {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          requireInteraction: false,
          ...options
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        // Also play a friendly soft chime
        this.playChime();
        return true;
      } catch (e) {
        console.error('Failed to trigger notification', e);
        return false;
      }
    }
    return false;
  }

  public playChime(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Gentle double chime (E5 -> B5)
      playTone(659.25, 0, 0.15);
      playTone(987.77, 0.12, 0.25);
    } catch {
      // Audio not permitted or supported, silent fallback
    }
  }

  public sendDailyReminderTest(): boolean {
    return this.sendNotification("Time to log today's expenses! 💰", {
      body: "Did you buy coffee, lunch, or pay any bills today? Add them with a quick message in X-pens!",
    });
  }

  public startDailyCheck(onReminderTriggered?: () => void): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }

    if (onReminderTriggered) {
      this.onTriggerCallback = onReminderTriggered;
    }

    // Check every 30 seconds if it's reminder time
    this.timerId = window.setInterval(() => {
      this.checkAndTriggerReminder();
    }, 30000);

    // Initial check right now
    this.checkAndTriggerReminder();
  }

  public stopDailyCheck(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private checkAndTriggerReminder(): void {
    const settings = getReminderSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Already sent today?
    if (settings.lastNotifiedDate === todayStr) return;

    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    // Compare hours and minutes
    const [targetH, targetM] = settings.time.split(':').map(Number);
    const nowH = now.getHours();
    const nowM = now.getMinutes();

    // Check if current time has reached or passed target time within the same day
    if (nowH > targetH || (nowH === targetH && nowM >= targetM)) {
      // Trigger notification
      this.sendNotification("X-pens Daily Reminder ⏰", {
        body: `It's ${settings.time}! Take 15 seconds to log today's expenses before you forget.`,
      });

      // Update last notified
      saveReminderSettings({ ...settings, lastNotifiedDate: todayStr });

      if (this.onTriggerCallback) {
        this.onTriggerCallback();
      }
    }
  }

  public hasAddedToday(expenses: Expense[]): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    return expenses.some(e => e.date === todayStr);
  }
}

export const notificationService = new NotificationService();
