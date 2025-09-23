import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
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

  // 🔹 New states for scroll button
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current.scrollIntoView({
          behavior: instant ? "auto" : "smooth",
          block: "end",
        });
      });
    }
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

  // 🔹 Scroll to bottom when switching chat
  useEffect(() => {
    if (
      selectedContact?.contact_id &&
      messages.length > 0 &&
      prevContactId.current !== selectedContact.contact_id
    ) {
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
      setUnreadCount(0); // reset unread when switching contact
    }
    prevContactId.current = selectedContact?.contact_id;
    prevMessagesLength.current = messages.length;
  }, [selectedContact?.contact_id, messages.length]);

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
      if (sentByUser || nearBottom || isTyping) {
        scrollToBottom();
      } else {
        setUnreadCount((prev) => prev + 1);
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, isTyping, loadingOlder]);

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
    <div className="relative h-full">
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
            {selectedContact?.conversation_id
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
          className="absolute bottom-20 right-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-1"
        >
          ⬇️ {unreadCount}
        </button>
      )}
    </div>
  );
};

export default ChatMessages;
