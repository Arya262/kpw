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
      // Pre-load the default audio file
      this.preloadAudio();
    } catch (error) {
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
      
      // Test if the audio file can be loaded
      this.audioElement.addEventListener('canplaythrough', () => {
        
      });
      
      this.audioElement.addEventListener('error', (e) => {
      
        this.audioElement = null;
      });
    } catch (error) {
      
    }
  }

  async resumeAudioContextIfNeeded() {
    try {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
        
      }
    } catch (e) {
      
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
        console.log("🎵 Custom notification sound played");
        return;
      }

      // Try preloaded default audio
      if (this.audioElement) {
        this.audioElement.currentTime = 0; // Reset to start
        await this.audioElement.play();
        console.log("🎵 Default notification sound played");
        return;
      }

      // Fallback to oscillator if no audio files work
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
        
        console.log("🎵 Fallback oscillator sound played");
      } else {
        console.warn("🔇 No audio system available");
      }
    } catch (error) {
      console.warn("🔇 Error playing sound:", error.message);
      
      // Try one more fallback - create a new audio element
      try {
        const fallbackAudio = new Audio(this.defaultAudioUrl);
        fallbackAudio.volume = 0.5;
        await fallbackAudio.play();
        console.log("🎵 Fallback audio element played");
      } catch (fallbackError) {
        console.warn("🔇 All audio methods failed:", fallbackError.message);
      }
    }
  }

showBrowserNotification(title, options = {}, onClick) {
  if (!("Notification" in window)) {
    console.warn("🚫 Browser notifications not supported");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, options);

    if (onClick) {
      notification.onclick = (event) => {
        event.preventDefault();
        onClick(options.data);
        window.focus();
      };
    }
  } else {
    console.warn("🚫 Notification permission not granted");
  }
}

  showInAppNotification(message, type = "info", options = {}) {
    // ✅ Uses react-toastify for in-app notifications
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
        const permission = await Notification.requestPermission();
        console.log("🔔 Notification permission:", permission);
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
    
    // Always play sound and show in-app notification
    await this.playNotificationSound();
    this.showInAppNotification(
      `${contactName}: ${message.content || "New message"}`,
      "success"
    );

    // Show browser notification only if page is not focused
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
