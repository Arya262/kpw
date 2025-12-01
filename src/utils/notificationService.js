import { toast } from 'react-toastify';

const STORAGE_KEY = 'notification_preferences';

// Default preferences
const DEFAULT_PREFERENCES = {
  enabled: true,
  soundEnabled: true,
  soundVolume: 0.5,
  privacyMode: false, // Hide message content in notifications
  doNotDisturb: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  snoozedUntil: null, // Timestamp when snooze ends
  categories: {
    message: true,
    alert: true,
    event: true,
    system: true,
  },
};

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.customAudioUrl = null;
    this.defaultAudioUrl = '/sound/notification.mp3';
    this.audioElement = null;
    this.preferences = this.loadPreferences();
    this.initAudio();
  }

  // ==================== PREFERENCES MANAGEMENT ====================

  loadPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }

  getPreferences() {
    return { ...this.preferences };
  }

  updatePreferences(updates) {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    return this.preferences;
  }

  // ==================== DO NOT DISTURB ====================

  setDoNotDisturb(enabled, startTime = '22:00', endTime = '08:00') {
    this.preferences.doNotDisturb = { enabled, startTime, endTime };
    this.savePreferences();
  }

  isInDoNotDisturbMode() {
    const { doNotDisturb, snoozedUntil } = this.preferences;
    
    // Check snooze first
    if (snoozedUntil && Date.now() < snoozedUntil) {
      return true;
    } else if (snoozedUntil && Date.now() >= snoozedUntil) {
      // Snooze expired, clear it
      this.preferences.snoozedUntil = null;
      this.savePreferences();
    }

    if (!doNotDisturb.enabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = doNotDisturb.startTime.split(':').map(Number);
    const [endH, endM] = doNotDisturb.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Handle overnight DND (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  // ==================== SNOOZE ====================

  snoozeNotifications(durationMinutes) {
    this.preferences.snoozedUntil = Date.now() + (durationMinutes * 60 * 1000);
    this.savePreferences();
    return this.preferences.snoozedUntil;
  }

  cancelSnooze() {
    this.preferences.snoozedUntil = null;
    this.savePreferences();
  }

  getSnoozeRemaining() {
    if (!this.preferences.snoozedUntil) return 0;
    const remaining = this.preferences.snoozedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  // ==================== VOLUME CONTROL ====================

  setVolume(volume) {
    this.preferences.soundVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.preferences.soundVolume;
    }
    this.savePreferences();
  }

  getVolume() {
    return this.preferences.soundVolume;
  }

  // ==================== PRIVACY MODE ====================

  setPrivacyMode(enabled) {
    this.preferences.privacyMode = enabled;
    this.savePreferences();
  }

  isPrivacyModeEnabled() {
    return this.preferences.privacyMode;
  }

  getNotificationText(originalText, fallback = 'New message') {
    return this.preferences.privacyMode ? fallback : originalText;
  }

  // ==================== CATEGORY FILTERS ====================

  setCategoryEnabled(category, enabled) {
    if (this.preferences.categories.hasOwnProperty(category)) {
      this.preferences.categories[category] = enabled;
      this.savePreferences();
    }
  }

  isCategoryEnabled(category) {
    return this.preferences.categories[category] !== false;
  }

  // ==================== AUDIO ====================

  initAudio() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
      this.preloadAudio();
    } catch (error) {
      console.warn('AudioContext not supported', error);
    }

    document.addEventListener("click", this.resumeAudioContextIfNeeded.bind(this), {
      once: true,
      passive: true,
    });
  }

  async preloadAudio() {
    try {
      this.audioElement = new Audio(this.defaultAudioUrl);
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.preferences.soundVolume;
      
      await new Promise((resolve, reject) => {
        const onReady = () => {
          this.audioElement.removeEventListener('canplaythrough', onReady);
          this.audioElement.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = () => {
          this.audioElement.removeEventListener('canplaythrough', onReady);
          this.audioElement.removeEventListener('error', onError);
          this.audioElement = null;
          reject(new Error('Failed to load audio file'));
        };
        
        this.audioElement.addEventListener('canplaythrough', onReady, { once: true });
        this.audioElement.addEventListener('error', onError, { once: true });
      });
    } catch (error) {
      console.warn('Audio preload failed:', error);
      this.audioElement = null;
    }
  }

  async resumeAudioContextIfNeeded() {
    try {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
    }
  }

  setCustomAudio(url) {
    this.customAudioUrl = url;
  }

  async playNotificationSound() {
    // Check if sound should be played
    if (!this.preferences.soundEnabled || this.isInDoNotDisturbMode()) {
      return;
    }

    try {
      // Try custom audio first
      if (this.customAudioUrl) {
        const audio = new Audio(this.customAudioUrl);
        audio.volume = this.preferences.soundVolume;
        await audio.play();
        return;
      }

      // Try preloaded default audio
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        this.audioElement.volume = this.preferences.soundVolume;
        await this.audioElement.play();
        return;
      }

      // Fallback to oscillator
      if (this.audioContext) {
        await this.resumeAudioContextIfNeeded();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.preferences.soundVolume * 0.2, this.audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // ==================== BROWSER NOTIFICATIONS ====================

  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }

  showBrowserNotification(title, options = {}) {
    if (!("Notification" in window)) {
      console.warn("Browser doesn't support notifications");
      return null;
    }

    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // Check DND and category
    if (this.isInDoNotDisturbMode()) {
      return null;
    }

    const category = options.category || 'message';
    if (!this.isCategoryEnabled(category)) {
      return null;
    }

    // Apply privacy mode
    const notificationOptions = { ...options };
    if (this.preferences.privacyMode && notificationOptions.body) {
      notificationOptions.body = 'New message received';
    }

    const notification = new Notification(title, notificationOptions);

    // Handle click to navigate
    if (options.data?.conversationId) {
      notification.onclick = () => {
        window.focus();
        const conversationId = options.data.conversationId;
        window.location.href = `/chats?conversation=${conversationId}`;
        notification.close();
      };
    }

    return notification;
  }

  // ==================== IN-APP NOTIFICATIONS ====================

  showInAppNotification(message, type = "info", options = {}) {
    // Check DND
    if (this.isInDoNotDisturbMode() && !options.force) {
      return null;
    }

    const category = options.category || 'message';
    if (!this.isCategoryEnabled(category) && !options.force) {
      return null;
    }

    // Apply privacy mode
    const displayMessage = this.preferences.privacyMode && !options.force
      ? 'New notification received'
      : message;

    if (toast[type]) {
      return toast[type](displayMessage, options);
    }
    return toast(displayMessage, options);
  }

  // ==================== UTILITIES ====================

  isPageFocused() {
    return document.hasFocus();
  }

  canShowNotification(category = 'message') {
    return (
      this.preferences.enabled &&
      !this.isInDoNotDisturbMode() &&
      this.isCategoryEnabled(category)
    );
  }
}

const notificationService = new NotificationService();
export default notificationService;
