import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";
import TextMessage from "./chatFeatures/TextMessage";
import ImageMessage from "./chatFeatures/ImageMessage";
import VideoMessage from "./chatFeatures/VideoMessage";
import TemplateMessage from "./chatFeatures/TemplateMessage";
import TypingIndicator from "./chatFeatures/TypingIndicator";
import AudioMessage from "./chatFeatures/AudioMessage";
import LocationMessage from "./chatFeatures/LocationMessage";
import ContactMessage from "./chatFeatures/ContactMessage";
import DocumentMessage from "./chatFeatures/DocumentMessage";
import InteractiveMessage from "./chatFeatures/InteractiveMessage";
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
  const isBlocked = selectedContact?.block === true;
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
        container.scrollTop = container.scrollHeight;
      }
    });
  };

  const handleScroll = useCallback(async () => {
    const container = chatContainerRef.current;
    if (!container || !selectedContact?.contact_id) return;

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;
    setShowScrollButton(!nearBottom); 

    if (nearBottom) {
      setUnreadCount(0); 
    }


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


  useLayoutEffect(() => {
    if (
      selectedContact?.contact_id &&
      prevContactId.current !== selectedContact.contact_id
    ) {
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
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

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
    const imgs = Array.from(container.querySelectorAll("img"));
    if (imgs.length === 0) return;

    const onLoad = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      if (firstLoadRef.current || nearBottom) {
        scrollToBottom(true);
        firstLoadRef.current = false;
      }
    };
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", onLoad);
      img.addEventListener("error", onLoad);
    });
    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onLoad);
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

  const formatMessageTime = useCallback((sentAt) => {
    if (!sentAt) return "";
    
    const date = sentAt instanceof Date ? sentAt : new Date(sentAt);
    if (isNaN(date.getTime())) return "";
    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  }, []);

  const renderMessage = useCallback((msg, index) => {
    const sent = msg.status !== "received";
    const time = formatMessageTime(msg.sent_at);

    const message = { ...msg, sent_at: time, originalSentAt: msg.sent_at };

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
      case "interactive":
        return <InteractiveMessage msg={message} sent={sent} />;
      default:
        return (
          <div className="text-red-500 text-sm italic">
            Unsupported message type: {msg.message_type}
          </div>
        );
    }
  }, [formatMessageTime]);


  return (
    <div className="relative h-full min-h-0">
        <div
          ref={chatContainerRef}
          className={`flex flex-col min-h-0 h-full overflow-y-auto scrollbar-hide 
            bg-[url('/light.png')] ${isBlocked ? 'opacity-75' : ''}
            bg-repeat transition-all duration-300 ease-in-out`}
          aria-live="polite"
          role="list"
        >
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

            {/* 🔹 Blocked User Notice (now in your theme color) */}
            {isBlocked && (
              <div className="flex justify-center my-3">
                <span className="flex items-center gap-2 bg-[#0AA89E]/10 border border-[#0AA89E]/40 text-[#0AA89E] text-xs px-4 py-2 rounded-full shadow-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  You’ve blocked this contact. You won’t receive new messages.
                </span>
              </div>
            )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🔹 Floating scroll button */}
      {showScrollButton && (
        <button
          onClick={() => {
            scrollToBottom(true);
            setUnreadCount(0);
          }}
          className="absolute bottom-7 right-4 bg-[#0AA89E] hover:bg-[#099086] rounded-full shadow-lg flex items-center justify-center w-12 h-12 transition-transform transform hover:scale-110"
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
