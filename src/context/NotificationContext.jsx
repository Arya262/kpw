import React, {
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

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState({});
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [selectedConversationId, _setSelectedConversationId] = useState(null);
  const selectedConversationIdRef = useRef(null);

  // Keep ref in sync with state
  const setSelectedConversationId = useCallback((id) => {

    selectedConversationIdRef.current = id;
    _setSelectedConversationId(id);
  }, []);

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
  console.log("📩 Raw incoming data:", data);
  if (!data) return;

  let message = data?.message || data?.data || data;
  if (typeof message === "string") {
    try {
      message = JSON.parse(message);
    } catch {
      return;
    }
  }

  console.log("📩 Parsed message:", message);

  // ✅ Normalize conversationId (accepts conversation_id, chat_id, or contact_id)
  const conversationId =
    message.conversation_id ||
    message.chat_id ||
    message.contact_id ||
    "unknown";

  if (conversationId === "unknown") {
    console.warn("⚠️ No conversation_id/chat_id/contact_id in message:", message);
    return;
  }

  // Skip notification if this is the currently selected conversation
  const currentSelectedId = selectedConversationIdRef.current;
  console.log(
    "Incoming message - Conversation ID:",
    conversationId,
    "Selected ID (ref):",
    currentSelectedId
  );
  if (conversationId === currentSelectedId) {
    console.log("Skipping notification for selected conversation");
    return;
  }

  const contactName =
    message.contact_name ||
    message.sender_name ||
    message.name ||
    message.from ||
    message.customerName || 
    "Unknown";

  const messageText =
    message.content ||
    message.element_name ||
    message.message ||
    message.text ||
    `New message from ${contactName}`;

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

  // Handler for full chat messages
  const handleMessage = (data) => {
    handleIncomingMessage(data);
  };

  // Handler for lightweight alerts (global notifications)
  const handleAlert = (alert) => {
    console.log("🔔 Received alert:", alert);
    const { contact_id, name, content } = alert;

    const conversationId = String(contact_id);

    // Skip if user is already viewing this conversation
    if (conversationId === selectedConversationIdRef.current) {
      console.log("Skipping alert for active conversation");
      return;
    }

    handleIncomingMessage({
      message: {
        conversation_id: conversationId,
        contact_name: name,
        content,
      },
    });
  };

  socket.on("newMessage", handleMessage);      // detailed message payload
  socket.on("newMessageAlert", handleAlert);   // global lightweight alert

  return () => {
    socket.off("newMessage", handleMessage);
    socket.off("newMessageAlert", handleAlert);
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

      // Ensure we have an array
      const conversations = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.items)
        ? response.data.items
        : [];

      // Total unread count
      const totalUnread = conversations.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0
      );
      setUnreadCount(totalUnread);

      // Map conversationId -> unread count
      const unreadMap = {};
      conversations.forEach(c => {
        if (c.unread_count > 0 && c.conversation_id)
          unreadMap[c.conversation_id] = c.unread_count;
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
      unreadConversations,
      notifications,
      isNotificationEnabled,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      toggleNotifications,
      addAlert: handleIncomingMessage,
      markConversationAsRead,
      setSelectedConversationId,
      selectedConversationId,
    }),
    [unreadCount, unreadConversations, notifications, isNotificationEnabled, setSelectedConversationId, selectedConversationId]
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
