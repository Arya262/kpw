import MessageStatusIcon from "./MessageStatusIcon";

const MessageBubble = ({ 
  sent, 
  children, 
  timestamp, 
  status,
  maxWidth = "65%",
  noPadding = false,
  className = ""
}) => {
  const bubbleBg = sent ? "#d9fdd3" : "#ffffff";

  return (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} px-2 mb-1`}>
      <div className="relative" style={{ maxWidth }}>
        {/* WhatsApp-style curved tail */}
        <svg 
          className={`absolute top-0 ${sent ? "right-[-4px]" : "left-[-4px]"}`} 
          width="20" 
          height="20" 
          viewBox="0 0 20 20"
        >
          <path 
            d={sent ? "M0 0 Q10 20 20 0" : "M20 0 Q10 20 0 0"} 
            fill={bubbleBg}
          />
        </svg>

        {/* Bubble */}
        <div
          className={`rounded-lg shadow-sm ${noPadding ? "" : "px-3 py-2"} ${className}`}
          style={{ backgroundColor: bubbleBg }}
        >
          {children}

          {/* Time and Status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[11px] text-gray-500">{timestamp}</span>
            {sent && <MessageStatusIcon status={status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
