import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import notificationService from "../utils/notificationService";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState({});
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const socket = useSocket();
  const { user } = useAuth();

  const lastNotificationTime = useRef({});
  const lastSoundTime = useRef(0);

  useEffect(() => {
    notificationService.setCustomAudio("/notification.mp3");
  }, []);

  const playSound = async () => {
    const now = Date.now();
    if (now - lastSoundTime.current > 3000) {
      lastSoundTime.current = now;
      await notificationService.playNotificationSound();
    }
  };

  const markConversationAsRead = (conversationId) => {
    setUnreadConversations((prev) => {
      const newMap = { ...prev };
      const removedCount = newMap[conversationId] || 0;
      delete newMap[conversationId];
      setUnreadCount((prevUnread) => Math.max(prevUnread - removedCount, 0));
      return newMap;
    });
  };

  const handleIncomingMessage = async (data) => {
    if (!data) return;

    let message = data?.message || data?.data || data;
    if (typeof message === "string") {
      try {
        message = JSON.parse(message);
      } catch {
        return;
      }
    }

    const contactName =
      message.contact_name ||
      message.sender_name ||
      message.name ||
      message.from ||
      "Unknown";

    const messageText =
      message.content ||
      message.element_name ||
      message.message ||
      message.text ||
      `New message from ${contactName}`;

    const conversationId = message.conversation_id || message.chat_id || "unknown";
    if (conversationId === "unknown") return;

    const now = Date.now();
    if (now - (lastNotificationTime.current[conversationId] || 0) < 2000) return;
    lastNotificationTime.current[conversationId] = now;

    await playSound();

    notificationService.showInAppNotification(messageText, "info");

    if (!notificationService.isPageFocused()) {
      notificationService.showBrowserNotification(`💬 ${contactName}`, {
        body: messageText,
      });
    }

    // Update unread count (global and per conversation)
    setUnreadCount((prev) => prev + 1);
    setUnreadConversations((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || 0) + 1,
    }));

    const newNotification = {
      id: now,
      type: "message",
      title: `New message from ${contactName}`,
      message: messageText,
      conversationId,
      contactName,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

    window.dispatchEvent(new CustomEvent("message_received", { detail: data }));
  };

  useEffect(() => {
    const preloadSound = () => {
      const s = new Audio("/notification.mp3");
      s.load();
      document.removeEventListener("click", preloadSound);
    };
    document.addEventListener("click", preloadSound);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const events = [
      "newMessage",
      "message",
      "chat_message",
      "incoming_message",
      "whatsapp_message",
      "msg",
      "data",
    ];

    events.forEach((event) => socket.on(event, handleIncomingMessage));
    return () => {
      events.forEach((event) => socket.off(event, handleIncomingMessage));
    };
  }, [socket]);

  useEffect(() => {
    const onFocus = () => {
      if (!document.hidden) setUnreadCount(0);
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, []);

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
        const totalUnread = response.data.reduce(
          (sum, c) => sum + (c.unread_count || 0),
          0
        );
        setUnreadCount(totalUnread);

        const unreadMap = {};
        response.data.forEach(c => {
          if (c.unread_count > 0 && c.conversation_id) unreadMap[c.conversation_id] = c.unread_count;
        });
        setUnreadConversations(unreadMap);
      } catch (error) {
        console.error("Failed to fetch contacts for unread count:", error);
      }
    };

    fetchUnreadCount();
  }, [user?.customer_id]);

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setUnreadConversations({});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setUnreadConversations({});
  };

  const toggleNotifications = async () => {
    const newState = !isNotificationEnabled;
    if (newState) {
      const granted = await notificationService.requestPermission();
      if (granted !== "granted") {
        setIsNotificationEnabled(false);
        return;
      }
    }
    setIsNotificationEnabled(newState);
  };

  const contextValue = useMemo(
    () => ({
      unreadCount,
      unreadConversations, // ✅ per-conversation unread map
      notifications,
      isNotificationEnabled,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      toggleNotifications,
      addAlert: handleIncomingMessage,
      markConversationAsRead, // ✅ expose this to reset per-chat
    }),
    [unreadCount, unreadConversations, notifications, isNotificationEnabled]
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
