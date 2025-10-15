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
  // Deduplicate notifications for the same message to avoid delayed re-toasts after navigation
  const recentMessageIds = useRef(new Set());
  const addRecentMessageId = (id) => {
    if (!id) return;
    recentMessageIds.current.add(id);
    setTimeout(() => recentMessageIds.current.delete(id), 20000);
  };

  useEffect(() => {
    // Set custom audio path relative to public directory
    notificationService.setCustomAudio("/sound/notification.mp3");
    
    // Request notification permission on component mount
    const requestPermissions = async () => {
      try {
        await notificationService.requestNotificationPermission();
      } catch (error) {
        console.warn('🔔 Failed to request notification permissions:', error);
      }
    };
    
    requestPermissions();
  }, []);

  const playSound = async () => {
    if (!isNotificationEnabled) return;
    
    const now = Date.now();
    if (now - lastSoundTime.current > 3000) {
      lastSoundTime.current = now;
      try {
        await notificationService.playNotificationSound();
      } catch (error) {
        console.warn('🔇 Error playing notification sound:', error.message);
      }
    }
  };

  const markConversationAsRead = (conversationId) => {
    setUnreadConversations((prev) => {
      if (!prev[conversationId]) return prev;
      const newMap = { ...prev };
      const removedCount = newMap[conversationId];
      delete newMap[conversationId];
      setUnreadCount((prevUnread) =>
        Math.max(prevUnread - removedCount, 0)
      );
      return newMap;
    });
  };

  const handleIncomingMessage = async (data) => {
    // console.log("📩 Raw incoming data:", data);
    if (!data) return;

    const message = normalizeMessageData(data);
    if (!message) return;

    // console.log("📩 Parsed message:", message);

    // ✅ Normalize conversationId using shared utility
    const conversationId = extractConversationId(message);
    if (conversationId === "unknown") {
      console.warn("⚠️ No conversation_id/chat_id/contact_id in message:", message);
      return;
    }

    // Skip if user is already viewing this conversation
    const currentSelectedId = selectedConversationIdRef.current;
    if (conversationId === currentSelectedId) {
      // console.log("Skipping notification for selected conversation");
      return;
    }

    // Dedupe by message id to prevent late duplicate toasts after navigation
    const messageId = message.message_id || message.id || `${conversationId}-${message.sent_at || message.time || Date.now()}`;
    if (recentMessageIds.current.has(messageId)) {
      return;
    }

    // Extract contact name and message text using shared utilities
    const contactName = extractContactName(message);
    const messageText = extractMessageText(message, contactName);

    const now = Date.now();
    if (now - (lastNotificationTime.current[conversationId] || 0) < 2000) return;
    lastNotificationTime.current[conversationId] = now;

    await playSound();

    // Only show in-app (toast-like) notification while on chats page
    const isOnChatsPage = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/chats');
    if (isOnChatsPage) {
      notificationService.showInAppNotification(messageText, "info", {
        key: `${conversationId}-${messageId}`,
        force: false,
      });
      addRecentMessageId(messageId);
    }

  if (isNotificationEnabled && !notificationService.isPageFocused()) {
    try {
      // Use timestamp in tag to make each notification unique while still grouping by conversation
      const timestamp = Date.now();
      await notificationService.showBrowserNotification(`${contactName}`, {
        body: messageText,
        icon: '/mobile_logo.webp',
        data: { 
          conversationId,
          timestamp
        },
        tag: `message-${conversationId}-${timestamp}`,
        renotify: true
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
      message: messageText,
      conversationId,
      contactName,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          n.message === messageText && n.conversationId === conversationId
      );
      if (exists) return prev;
      return [newNotification, ...prev].slice(0, 10);
    });

    window.dispatchEvent(new CustomEvent("message_received", { detail: data }));
  };

  useEffect(() => {
    const preloadSound = () => {
      const s = new Audio("/sound/notification.mp3");
      s.load();
      document.removeEventListener("click", preloadSound);
    };
    document.addEventListener("click", preloadSound);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // console.log("[NotificationContext] Attaching socket listeners for chat events");

    const onAny = (event, ...args) => {
      try {
        // console.log("[Socket][onAny]", event, args?.[0]);
      } catch (e) {
        // console.log("[Socket][onAny]", event);
      }
    };

    const handleMessage = (data) => {
      // console.log("[NotificationContext] newMessage received", data);
      handleIncomingMessage(data);
      // Dispatch custom event for chat logic to handle
      window.dispatchEvent(new CustomEvent('chatMessage', { detail: data }));
    };

    const handleAlert = (alert) => {
      // console.log("[NotificationContext] newMessageAlert received", alert);
      const { contact_id, name, content } = alert;
      const conversationId = String(contact_id);

      if (conversationId === selectedConversationIdRef.current) {
        // console.log("Skipping alert for active conversation");
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
      // Dispatch custom event for chat logic
      window.dispatchEvent(new CustomEvent('chatMessage', { detail: messageData }));
    };

    socket.off("newMessage");
    socket.off("newMessageAlert");
    socket.onAny(onAny);
    socket.on("newMessage", handleMessage);
    socket.on("newMessageAlert", handleAlert);

    return () => {
      socket.off("newMessage", handleMessage);
      socket.off("newMessageAlert", handleAlert);
      socket.offAny(onAny);
    };
  }, [socket]);

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

      // ✅ Ensure array
      const conversations = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // ✅ Total unread count
      const totalUnread = conversations.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0
      );
      setUnreadCount(totalUnread);

      // ✅ Map contact_id -> unread count
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
      const granted = await notificationService.requestNotificationPermission();
      if (!granted) {
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
    [
      unreadCount,
      unreadConversations,
      notifications,
      isNotificationEnabled,
      setSelectedConversationId,
      selectedConversationId,
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
