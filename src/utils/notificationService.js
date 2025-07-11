// --- IMPORTS ---
import { toast } from 'react-toastify';

const APP_NAME = "My App";

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.customAudioUrl = null;
    this.customAudioElement = null; // ✅ Cached audio element
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log("🎵 AudioContext initialized:", this.audioContext.state);
    } catch (error) {
      console.warn("🚫 AudioContext not available:", error.message);
    }

    document.addEventListener("click", this.resumeAudioContextIfNeeded.bind(this), {
      once: true,
      passive: true,
    });
  }

  async resumeAudioContextIfNeeded() {
    try {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
        console.log("🎵 AudioContext resumed");
      }
    } catch (e) {
      console.warn("🚫 Failed to resume AudioContext:", e.message);
    }
  }

  setCustomAudio(url) {
    this.customAudioUrl = url;
    this.customAudioElement = new Audio(url);  // ✅ Cache audio
    this.customAudioElement.volume = 0.5;
    this.customAudioElement.load();            // ✅ Preload
  }

  async playNotificationSound() {
    try {
      if (!this.audioContext) {
        console.warn("🔇 AudioContext not initialized");
        return;
      }

      await this.resumeAudioContextIfNeeded();

      if (this.customAudioElement) {
        this.customAudioElement.currentTime = 0;  // ✅ Rewind before play
        await this.customAudioElement.play();
      } else {
        // ✅ Fallback beep
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.warn("🔇 Error playing sound:", error.message);
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

  // ✅ Toast now delayed to avoid React DOM race condition
  showInAppNotification(message, type = "info", options = {}) {
    setTimeout(() => {
      if (toast[type]) {
        toast[type](message, options);
      } else {
        toast(message, options);
      }
    }, 0);
  }

  updateTabTitle(unreadCount, appName = APP_NAME) {
    document.title = unreadCount > 0
      ? `(${unreadCount}) New Message`
      : appName;
  }

  async requestPermission() {
    if ("Notification" in window && Notification.permission !== "granted") {
      try {
        const permission = await Notification.requestPermission();
        console.log("🔔 Notification permission:", permission);
        return permission;
      } catch (e) {
        console.warn("❌ Notification permission failed:", e.message);
      }
    }
  }

  isPageFocused() {
    return document.hasFocus();
  }

  async showNewMessageNotification(message, contactName, conversationId, onClick) {
    console.log("🔈 Triggering sound + notification for:", contactName);
    console.log("🔈 Message content:", message.content);
    console.log("🔈 Page focused:", this.isPageFocused());
    console.log("🔈 Notification permission:", Notification.permission);
    console.log("🔈 Page hidden:", document.hidden);
    
    // ✅ Always play sound and show toast
    await this.playNotificationSound();
    this.showInAppNotification(
      `${contactName}: ${message.content || "New message"}`,
      "success"
    );

    // ✅ Show browser notification only if tab is not focused
    if (!this.isPageFocused()) {
      this.showBrowserNotification(
        contactName,
        {
          body: message.content || "New message",
          data: { conversationId },
        },
        onClick
      );
    } else {
      console.log("🔈 Page is focused, skipping browser notification");
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
