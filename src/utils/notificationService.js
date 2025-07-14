// --- IMPORTS ---
import { toast } from 'react-toastify';

const APP_NAME = "My App";

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.customAudioUrl = null;
    this.defaultAudioUrl = '/sound/notification.mp3'; // Default notification sound
    this.audioElement = null;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.preloadAudio();
    } catch (error) {
      console.warn("🚫 AudioContext not available:", error.message);
    }

    document.addEventListener("click", this.resumeAudioContextIfNeeded.bind(this), {
      once: true,
      passive: true,
    });
  }

  preloadAudio() {
    try {
      this.audioElement = new Audio(this.defaultAudioUrl);
      this.audioElement.preload = 'auto';
      this.audioElement.volume = 0.5;

      this.audioElement.addEventListener('error', (e) => {
        console.warn("🔇 Failed to load default notification sound:", e);
        this.audioElement = null;
      });
    } catch (error) {
      console.warn("🔇 Error preloading audio:", error.message);
    }
  }

  async resumeAudioContextIfNeeded() {
    try {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    } catch (e) {
      console.warn("🚫 Failed to resume AudioContext:", e.message);
    }
  }

  setCustomAudio(url) {
    this.customAudioUrl = url;
  }

  async playNotificationSound() {
    try {
      if (this.customAudioUrl) {
        const audio = new Audio(this.customAudioUrl);
        audio.volume = 0.5;
        await audio.play();
        return;
      }

      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        await this.audioElement.play();
        return;
      }

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
      } else {
        console.warn("🔇 No audio system available");
      }
    } catch (error) {
      console.warn("🔇 Error playing sound:", error.message);

      try {
        const fallbackAudio = new Audio(this.defaultAudioUrl);
        fallbackAudio.volume = 0.5;
        await fallbackAudio.play();
      } catch (fallbackError) {
        console.warn("🔇 All audio methods failed:", fallbackError.message);
      }
    }
  }

  async showBrowserNotification(title, options = {}, onClick) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, options);
        if (onClick) {
          notification.onclick = (event) => {
            event.preventDefault();
            onClick(event);
          };
        }
      } catch (e) {
        console.warn("🚫 Browser notification failed:", e.message);
      }
    } else if (Notification.permission === "default") {
      await this.requestPermission();
      if (Notification.permission === "granted") {
        this.showBrowserNotification(title, options, onClick);
      }
    }
  }

  showInAppNotification(message, type = "info", options = {}) {
    if (toast[type]) {
      toast[type](message, options);
    } else {
      toast(message, options);
    }
  }

  updateTabTitle(unreadCount, appName = APP_NAME) {
    document.title = unreadCount > 0
      ? `(${unreadCount}) New Message`
      : appName;
  }

  async requestPermission() {
    if ("Notification" in window && Notification.permission !== "granted") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn("❌ Notification permission failed:", e.message);
      }
    }
  }

  isPageFocused() {
    return document.hasFocus();
  }

  async showNewMessageNotification(message, contactName, conversationId, onClick) {
    await this.playNotificationSound();
    this.showInAppNotification(
      `${contactName}: ${message.content || "New message"}`,
      "success"
    );

    if (!this.isPageFocused()) {
      this.showBrowserNotification(
        contactName,
        {
          body: message.content || "New message",
          data: { conversationId },
        },
        onClick
      );
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
