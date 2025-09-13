import { toast } from 'react-toastify';

const APP_NAME = "My App";

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.customAudioUrl = null;
    this.defaultAudioUrl = '/sound/notification.mp3';
    this.audioElement = null;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
      this.audioElement.volume = 0.5;
      
      await new Promise((resolve, reject) => {
        const onReady = () => {
          this.audioElement.removeEventListener('canplaythrough', onReady);
          this.audioElement.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (e) => {
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
    } catch (e) {
      console.warn('Failed to resume audio context:', e);
    }
  }

  setCustomAudio(url) {
    this.customAudioUrl = url;
  }

  async playNotificationSound() {
    try {
      // Try custom audio first
      if (this.customAudioUrl) {
        const audio = new Audio(this.customAudioUrl);
        audio.volume = 0.5;
        await audio.play();
        return;
      }

      // Try preloaded default audio
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
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
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

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

    return new Notification(title, options);
  }

  showInAppNotification(message, type = "info", options = {}) {
    if (toast[type]) {
      toast[type](message, options);
    } else {
      toast(message, options);
    }
  }

  isPageFocused() {
    return document.hasFocus();
  }
}

const notificationService = new NotificationService();
export default notificationService;