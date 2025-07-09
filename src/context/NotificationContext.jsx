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

const NotificationContext = createContext(null);

const SOUND_PATH = "/sound/notification.mp3"; // ✅ Centralized sound path

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const socket = useSocket();
  const { user } = useAuth();

  const lastNotificationTime = useRef({});
  const lastSoundTime = useRef(0);

  // ✅ Set custom .mp3 sound
  useEffect(() => {
    notificationService.setCustomAudio(SOUND_PATH);
  }, []);

  const playSound = async () => {
    const now = Date.now();
    if (now - lastSoundTime.current > 3000) {
      lastSoundTime.current = now;
      await notificationService.playNotificationSound();
    }
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

    setUnreadCount((prev) => prev + 1);

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

  // ✅ Preload audio safely (without .play())
  useEffect(() => {
    const preloadSound = () => {
      const s = new Audio(SOUND_PATH);
      s.load();
      document.removeEventListener("click", preloadSound);
    };
    document.addEventListener("click", preloadSound);
  }, []);

  // ✅ Listen to socket messages
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

  // ✅ Reset unread count when tab becomes visible
  useEffect(() => {
    const onFocus = () => {
      if (!document.hidden) setUnreadCount(0);
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, []);

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
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
      notifications,
      isNotificationEnabled,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      toggleNotifications,
      addAlert: handleIncomingMessage, 
    }),
    [unreadCount, notifications, isNotificationEnabled]
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
