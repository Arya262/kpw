import React, { useEffect, useLayoutEffect, useRef, useMemo, useCallback, useState } from "react";
import TextMessage from "./chatfeautures/TextMessage";
import ImageMessage from "./chatfeautures/ImageMessage";
import VideoMessage from "./chatfeautures/VideoMessage";
import TemplateMessage from "./chatfeautures/TemplateMessage";
import TypingIndicator from "./chatfeautures/TypingIndicator";
import AudioMessage from "./chatfeautures/AudioMessage";
import LocationMessage from "./chatfeautures/LocationMessage";
import ContactMessage from "./chatfeautures/ContactMessage";
import DocumentMessage from "./chatfeautures/DocumentMessage";
import { format, isToday, isYesterday } from "date-fns";
import { ArrowDown } from "lucide-react";
const ChatMessages = ({
  selectedContact,
  messages = [],
  isTyping,
  fetchMessagesForContact,
}) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const prevMessagesLength = useRef(0);
  const prevContactId = useRef(null);
  const firstLoadRef = useRef(false);

  // 🔹 New states for scroll button
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollToBottom = (instant = false) => {
    const container = chatContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      try {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: instant ? "auto" : "smooth",
        });
      } catch (e) {
        // Fallback for older browsers
        container.scrollTop = container.scrollHeight;
      }
    });
  };

  // 🔹 Load older messages when user scrolls to top
  const handleScroll = useCallback(async () => {
    const container = chatContainerRef.current;
    if (!container || !selectedContact?.contact_id) return;

    // Show/hide scroll button depending on position
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShowScrollButton(!nearBottom);
    if (nearBottom) setUnreadCount(0);

    // Load older when at top
    if (container.scrollTop === 0) {
      const prevHeight = container.scrollHeight;
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      setLoadingOlder(true);

      await fetchMessagesForContact(selectedContact.contact_id, {
        limit: 20,
        cursor: oldestMessage.sent_at,
      });

      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - prevHeight;
        setLoadingOlder(false);
      });
    }
  }, [messages, selectedContact, fetchMessagesForContact]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // 🔹 Mark first load on contact change and try to scroll immediately if messages already present
  useLayoutEffect(() => {
    if (selectedContact?.contact_id && prevContactId.current !== selectedContact.contact_id) {
      firstLoadRef.current = true;
      // If messages already present (fast path), scroll now
      if (messages.length > 0) {
        scrollToBottom(true);
        setUnreadCount(0);
        firstLoadRef.current = false;
      }
    }
    prevContactId.current = selectedContact?.contact_id;
  }, [selectedContact?.contact_id]);

  // 🔹 Auto scroll when new messages arrive
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = chatContainerRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const sentByUser = lastMessage && lastMessage.status !== "received";

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    const isNewMessage = messages.length > prevMessagesLength.current;

    if (isNewMessage && !loadingOlder) {
      if (firstLoadRef.current) {
        scrollToBottom(true);
        setUnreadCount(0);
        firstLoadRef.current = false;
      } else if (sentByUser || nearBottom || isTyping) {
        scrollToBottom();
      } else {
        setUnreadCount((prev) => prev + 1);
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, isTyping, loadingOlder]);

  // 🔹 Re-scroll after images or media load to prevent layout push
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const imgs = Array.from(container.querySelectorAll('img'));
    if (imgs.length === 0) return;

    const onLoad = () => {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (firstLoadRef.current || nearBottom) {
        scrollToBottom(true);
        firstLoadRef.current = false;
      }
    };
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onLoad);
    });
    return () => {
      imgs.forEach((img) => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onLoad);
      });
    };
  }, [messages]);

  // 🔹 Group messages by date
  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const groupMessagesByDate = (msgs) =>
    msgs.reduce((acc, msg) => {
      const rawDate = msg.sent_at ? new Date(msg.sent_at) : new Date();
      const label = getDateLabel(rawDate);
      if (!acc[label]) acc[label] = [];
      acc[label].push(msg);
      return acc;
    }, {});

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  const renderMessage = (msg, index) => {
    const sent = msg.status !== "received";
    const time = msg.sent_at
      ? new Date(msg.sent_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).toLowerCase()
      : "";

    const message = { ...msg, sent_at: time };

    switch (msg.message_type) {
      case "text":
      case "button":
        return <TextMessage msg={message} sent={sent} />;
      case "image":
        return <ImageMessage msg={message} sent={sent} />;
      case "video":
        return <VideoMessage msg={message} sent={sent} />;
      case "template":
        return <TemplateMessage msg={message} sent={sent} />;
      case "audio":
        return <AudioMessage msg={message} sent={sent} />;
      case "location":
        return <LocationMessage msg={message} sent={sent} />;
      case "contact":
        return <ContactMessage msg={message} sent={sent} />;
      case "document":
        return <DocumentMessage msg={message} sent={sent} />;
      default:
        return (
          <div className="text-red-500 text-sm italic">
            Unsupported message type: {msg.message_type}
          </div>
        );
    }
  };

  return (
    <div className="relative h-full min-h-0">
      <div
        ref={chatContainerRef}
        className="flex flex-col min-h-0 h-full overflow-y-auto scrollbar-hide 
                   bg-[url('/light.png')]
                   bg-repeat transition-colors duration-300 ease-in-out"
        aria-live="polite"
        role="list">
        {messages.length > 0 ? (
          Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel}>
              <div className="flex justify-center my-2">
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full shadow-sm">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((msg, i) => (
                <div
                  key={msg.message_id || `${msg.message_type}-${i}`}
                  className="mb-4"
                  role="listitem"
                >
                  {renderMessage(msg, i)}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-4">
            {selectedContact?.contact_id
              ? "No messages to display."
              : "This contact has no visible conversation."}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 🔹 Floating scroll button */}
      {showScrollButton && unreadCount > 0 && (
        <button
        onClick={() => {
          scrollToBottom(true);
          setUnreadCount(0);
        }}
        className="absolute bottom-20 right-4 bg-[#0AA89E] hover:bg-[#099086] rounded-full shadow-lg flex items-center justify-center w-12 h-12 transition-transform transform hover:scale-110"
      >
        <ArrowDown className="w-6 h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
      </button>
      
      )}
    </div>
  );
};

export default ChatMessages;
