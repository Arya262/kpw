import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import notificationService from "../utils/notificationService";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { 
  normalizeMessageData, 
  extractConversationId, 
  extractContactName, 
  extractMessageText 
} from "../utils/chatUtils";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState({});
  const [selectedConversationId, _setSelectedConversationId] = useState(null);
  const selectedConversationIdRef = useRef(null);

  // Load preferences from service
  const [preferences, setPreferences] = useState(() => notificationService.getPreferences());

  // Keep ref in sync with state
  const setSelectedConversationId = useCallback((id) => {
    selectedConversationIdRef.current = id;
    _setSelectedConversationId(id);
  }, []);

  const socket = useSocket();
  const { user } = useAuth();

  const lastNotificationTime = useRef({});
  const lastSoundTime = useRef(0);
  const recentMessageIds = useRef(new Set());
  
  const addRecentMessageId = (id) => {
    if (!id) return;
    recentMessageIds.current.add(id);
    setTimeout(() => recentMessageIds.current.delete(id), 20000);
  };

  // ==================== PREFERENCE HANDLERS ====================

  const updatePreferences = useCallback((updates) => {
    const newPrefs = notificationService.updatePreferences(updates);
    setPreferences({ ...newPrefs });
    return newPrefs;
  }, []);

  const toggleNotifications = useCallback(async () => {
    const newState = !preferences.enabled;
    if (newState) {
      const granted = await notificationService.requestNotificationPermission();
      if (!granted) {
        updatePreferences({ enabled: false });
        return false;
      }
    }
    updatePreferences({ enabled: newState });
    return newState;
  }, [preferences.enabled, updatePreferences]);

  const toggleSound = useCallback(() => {
    updatePreferences({ soundEnabled: !preferences.soundEnabled });
  }, [preferences.soundEnabled, updatePreferences]);

  const setVolume = useCallback((volume) => {
    notificationService.setVolume(volume);
    setPreferences(prev => ({ ...prev, soundVolume: volume }));
  }, []);

  const togglePrivacyMode = useCallback(() => {
    notificationService.setPrivacyMode(!preferences.privacyMode);
    setPreferences(prev => ({ ...prev, privacyMode: !prev.privacyMode }));
  }, [preferences.privacyMode]);

  const setDoNotDisturb = useCallback((enabled, startTime, endTime) => {
    notificationService.setDoNotDisturb(enabled, startTime, endTime);
    setPreferences(prev => ({
      ...prev,
      doNotDisturb: { enabled, startTime: startTime || prev.doNotDisturb.startTime, endTime: endTime || prev.doNotDisturb.endTime }
    }));
  }, []);

  const snoozeNotifications = useCallback((minutes) => {
    const until = notificationService.snoozeNotifications(minutes);
    setPreferences(prev => ({ ...prev, snoozedUntil: until }));
    return until;
  }, []);

  const cancelSnooze = useCallback(() => {
    notificationService.cancelSnooze();
    setPreferences(prev => ({ ...prev, snoozedUntil: null }));
  }, []);

  const setCategoryEnabled = useCallback((category, enabled) => {
    notificationService.setCategoryEnabled(category, enabled);
    setPreferences(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: enabled }
    }));
  }, []);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    notificationService.setCustomAudio("/sound/notification.mp3");
    
    const requestPermissions = async () => {
      try {
        await notificationService.requestNotificationPermission();
      } catch (error) {
        console.warn('🔔 Failed to request notification permissions:', error);
      }
    };
    
    requestPermissions();
  }, []);

  // ==================== SOUND HANDLING ====================

  const playSound = useCallback(async () => {
    if (!preferences.enabled || !preferences.soundEnabled) return;
    
    const now = Date.now();
    if (now - lastSoundTime.current > 3000) {
      lastSoundTime.current = now;
      try {
        await notificationService.playNotificationSound();
      } catch (error) {
        console.warn('🔇 Error playing notification sound:', error.message);
      }
    }
  }, [preferences.enabled, preferences.soundEnabled]);

  // ==================== NOTIFICATION HANDLERS ====================

  const markConversationAsRead = useCallback((conversationId) => {
    setUnreadConversations((prev) => {
      if (!prev[conversationId]) return prev;
      const newMap = { ...prev };
      const removedCount = newMap[conversationId];
      delete newMap[conversationId];
      setUnreadCount((prevUnread) => Math.max(prevUnread - removedCount, 0));
      return newMap;
    });
  }, []);

  const handleIncomingMessage = useCallback(async (data) => {
    if (!data) return;

    const message = normalizeMessageData(data);
    if (!message) return;

    const conversationId = extractConversationId(message);
    if (conversationId === "unknown") {
      console.warn("⚠️ No conversation_id/chat_id/contact_id in message:", message);
      return;
    }

    const currentSelectedId = selectedConversationIdRef.current;
    if (conversationId === currentSelectedId) {
      return;
    }

    const messageId = message.message_id || message.id || `${conversationId}-${message.sent_at || message.time || Date.now()}`;
    if (recentMessageIds.current.has(messageId)) {
      return;
    }

    const contactName = extractContactName(message);
    const messageText = extractMessageText(message, contactName);

    const now = Date.now();
    if (now - (lastNotificationTime.current[conversationId] || 0) < 2000) return;
    lastNotificationTime.current[conversationId] = now;

    await playSound();

    // Show in-app toast notification on any page (not just chats)
    if (preferences.enabled) {
      const displayText = notificationService.getNotificationText(messageText, 'New message');
      notificationService.showInAppNotification(
        `💬 ${contactName}: ${displayText}`, 
        "info", 
        {
          key: `${conversationId}-${messageId}`,
          force: false,
          category: 'message',
          autoClose: 5000,
          onClick: () => {
            window.location.href = `/chats?conversation=${conversationId}`;
          },
        }
      );
      addRecentMessageId(messageId);
    }

    // Browser notification when page not focused
    if (preferences.enabled && !notificationService.isPageFocused()) {
      try {
        const timestamp = Date.now();
        const displayText = notificationService.getNotificationText(messageText, 'New message');
        await notificationService.showBrowserNotification(contactName, {
          body: displayText,
          icon: '/mobile_logo.webp',
          data: { conversationId, timestamp },
          tag: `message-${conversationId}-${timestamp}`,
          renotify: true,
          category: 'message',
        });
      } catch (error) {
        console.warn('🔔 Failed to show browser notification:', error);
      }
    }

    setUnreadCount((prev) => prev + 1);
    setUnreadConversations((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || 0) + 1,
    }));

    const newNotification = {
      id: now,
      type: "message",
      title: `New message from ${contactName}`,
      message: preferences.privacyMode ? 'New message' : messageText,
      conversationId,
      contactName,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const exists = prev.some(
        (n) => n.message === newNotification.message && n.conversationId === conversationId
      );
      if (exists) return prev;
      return [newNotification, ...prev].slice(0, 50); // Increased from 10 to 50
    });

    window.dispatchEvent(new CustomEvent("message_received", { detail: data }));
  }, [playSound, preferences.enabled, preferences.privacyMode]);

  // ==================== AUDIO PRELOAD ====================

  useEffect(() => {
    const preloadSound = () => {
      const s = new Audio("/sound/notification.mp3");
      s.load();
      document.removeEventListener("click", preloadSound);
    };
    document.addEventListener("click", preloadSound);
    return () => document.removeEventListener("click", preloadSound);
  }, []);

  // ==================== SOCKET LISTENERS ====================

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      handleIncomingMessage(data);
      window.dispatchEvent(new CustomEvent('chatMessage', { detail: data }));
    };

    const handleAlert = (alert) => {
      const { contact_id, name, content } = alert;
      const conversationId = String(contact_id);

      if (conversationId === selectedConversationIdRef.current) {
        return;
      }

      const messageData = {
        message: {
          conversation_id: conversationId,
          contact_name: name,
          content,
        },
      };
      
      handleIncomingMessage(messageData);
      window.dispatchEvent(new CustomEvent('chatMessage', { detail: messageData }));
    };

    socket.off("newMessage");
    socket.off("newMessageAlert");
    socket.on("newMessage", handleMessage);
    socket.on("newMessageAlert", handleAlert);

    return () => {
      socket.off("newMessage", handleMessage);
      socket.off("newMessageAlert", handleAlert);
    };
  }, [socket, handleIncomingMessage]);

  // ==================== FETCH UNREAD COUNT ====================

  useEffect(() => {
    if (!user?.customer_id) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINTS.CHAT.CONVERSATIONS}?customer_id=${user.customer_id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const conversations = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const totalUnread = conversations.reduce(
          (sum, c) => sum + (c.unread_count || 0),
          0
        );
        setUnreadCount(totalUnread);

        const unreadMap = {};
        conversations.forEach(c => {
          if (c.unread_count > 0 && c.contact_id)
            unreadMap[c.contact_id] = c.unread_count;
        });
        setUnreadConversations(unreadMap);

      } catch (error) {
        console.error("Failed to fetch contacts for unread count:", error);
      }
    };

    fetchUnreadCount();
  }, [user?.customer_id]);

  // ==================== NOTIFICATION ACTIONS ====================

  const markNotificationAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setUnreadConversations({});
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setUnreadConversations({});
  }, []);

  // ==================== CONTEXT VALUE ====================

  const contextValue = useMemo(
    () => ({
      // State
      unreadCount,
      unreadConversations,
      notifications,
      selectedConversationId,
      preferences,
      
      // Notification actions
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      addAlert: handleIncomingMessage,
      markConversationAsRead,
      setSelectedConversationId,
      
      // Preference actions
      toggleNotifications,
      toggleSound,
      setVolume,
      togglePrivacyMode,
      setDoNotDisturb,
      snoozeNotifications,
      cancelSnooze,
      setCategoryEnabled,
      updatePreferences,
      
      // Computed
      isNotificationEnabled: preferences.enabled,
      isSoundEnabled: preferences.soundEnabled,
      isPrivacyMode: preferences.privacyMode,
      isDoNotDisturb: notificationService.isInDoNotDisturbMode(),
      snoozeRemaining: notificationService.getSnoozeRemaining(),
    }),
    [
      unreadCount,
      unreadConversations,
      notifications,
      selectedConversationId,
      preferences,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      handleIncomingMessage,
      markConversationAsRead,
      setSelectedConversationId,
      toggleNotifications,
      toggleSound,
      setVolume,
      togglePrivacyMode,
      setDoNotDisturb,
      snoozeNotifications,
      cancelSnooze,
      setCategoryEnabled,
      updatePreferences,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export { NotificationContext };
