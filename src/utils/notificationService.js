const APP_NAME = "My App";

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.customAudioUrl = null;
    this.defaultAudioUrl = '/sound/notification.mp3';
    this.audioElement = null;
    this.inAppRoutePrefix = '/chats';
    this.recentToastKeys = new Set();
    this.toastContainer = null;
    this.defaultVolume = 0.5;
    this.initAudio();
    this.createToastContainer();
  }

  // ---------------- Audio ----------------
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.preloadAudio(this.defaultAudioUrl).catch(() => {});
    } catch (error) {
      console.warn('AudioContext not supported', error);
    }

    document.addEventListener("click", this.resumeAudioContextIfNeeded.bind(this), {
      once: true,
      passive: true,
    });
  }

  async preloadAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.defaultVolume;

      const onReady = () => {
        audio.removeEventListener('canplaythrough', onReady);
        audio.removeEventListener('error', onError);
        this.audioElement = audio;
        resolve();
      };

      const onError = (e) => {
        audio.removeEventListener('canplaythrough', onReady);
        audio.removeEventListener('error', onError);
        this.audioElement = null;
        reject(new Error('Failed to load audio'));
      };

      audio.addEventListener('canplaythrough', onReady, { once: true });
      audio.addEventListener('error', onError, { once: true });
    });
  }

  async resumeAudioContextIfNeeded() {
    try {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    } catch (e) {
      console.warn('Failed to resume audio context:', e);
    }
  }

  setCustomAudio(url) {
    this.customAudioUrl = url;
    this.preloadAudio(url).catch(() => {});
  }

  setVolume(level) {
    this.defaultVolume = Math.max(0, Math.min(1, level));
    if (this.audioElement) this.audioElement.volume = this.defaultVolume;
  }

  async playNotificationSound(type = 'sine') {
    try {
      if (this.customAudioUrl && this.audioElement) {
        this.audioElement.currentTime = 0;
        await this.audioElement.play();
        return;
      }

      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        await this.audioElement.play();
        return;
      }

      if (this.audioContext) {
        await this.resumeAudioContextIfNeeded();
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type; // sine, square, triangle, sawtooth
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // ---------------- Browser Notifications ----------------
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.warn("Browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === 'granted') return true;

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  showBrowserNotification(title, options = {}) {
    if (!("Notification" in window) || Notification.permission !== "granted") return null;
    return new Notification(title, options);
  }

  // ---------------- In-App Toasts ----------------
  createToastContainer() {
    if (this.toastContainer) return;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
    this.toastContainer = container;
  }

  showInAppNotification(message, options = {}) {
    const force = !!options.force;
    const key = options.key || message;

    // Route-gate unless forced
    const onRoute = typeof window !== 'undefined' && window.location?.pathname?.startsWith(this.inAppRoutePrefix);
    if (!force && !onRoute) return null;

    // Deduplication
    if (key && this.recentToastKeys.has(key)) return null;
    if (key) {
      this.recentToastKeys.add(key);
      setTimeout(() => this.recentToastKeys.delete(key), 20000);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.innerText = message;
    toastEl.style.background = options.background || '#333';
    toastEl.style.color = options.color || '#fff';
    toastEl.style.padding = '10px 15px';
    toastEl.style.borderRadius = '5px';
    toastEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    toastEl.style.opacity = '0';
    toastEl.style.transition = 'opacity 0.3s, transform 0.3s';
    toastEl.style.transform = 'translateY(-10px)';

    this.toastContainer.appendChild(toastEl);

    // Animate in
    requestAnimationFrame(() => {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateY(0)';
    });

    // Auto remove
    const duration = options.duration || 4000;
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-10px)';
      setTimeout(() => toastEl.remove(), 300);
    }, duration);

    return toastEl;
  }

  // ---------------- Utils ----------------
  isPageFocused() {
    return document.hasFocus();
  }

  setInAppRoutePrefix(prefix) {
    this.inAppRoutePrefix = prefix || '/chats';
  }
}

const notificationService = new NotificationService();
export default notificationService;
