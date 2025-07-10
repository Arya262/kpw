import React, { useEffect, useRef, useMemo } from "react";
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

const ChatMessages = ({ selectedContact, messages = [], isTyping }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const groupMessagesByDate = (msgs) => {
    return msgs.reduce((acc, msg) => {
      const rawDate = msg.sent_at ? new Date(msg.sent_at) : new Date();
      const label = getDateLabel(rawDate);
      if (!acc[label]) acc[label] = [];
      acc[label].push(msg);
      return acc;
    }, {});
  };

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  const isSentByUser = (msg) => {
    return msg.status !== "received";
  };

  const renderMessage = (msg, index) => {
    const sent = isSentByUser(msg);
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
        console.warn("Unknown type:", msg.message_type);
        return (
          <div className="text-red-500 text-sm italic">
            Unsupported message type: {msg.message_type}
          </div>
        );
    }
  };

  return (
    <div
      className="flex flex-col min-h-0 h-full overflow-y-auto  scrollbar-hide 
                 bg-[url('/light.png')]
                 bg-repeat transition-colors duration-300 ease-in-out"
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
          {selectedContact?.conversation_id
            ? "No messages to display."
            : "This contact has no visible conversation."}
        </p>
      )}

      {isTyping && selectedContact?.conversation_id && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
