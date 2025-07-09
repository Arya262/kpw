import MessageStatusIcon from "./MessageStatusIcon";

const TextMessage = ({ msg, sent }) => {
  const bubbleBg = sent ? "#dcf8c6" : "#f0f0f0";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent
    ? "M0 0 Q10 20 20 0"   // Tail points leftward (for right-side bubble)
    : "M20 0 Q10 20 0 0";  // Tail points rightward (for left-side bubble)

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2`}>
      <div className="relative max-w-[60%]">
        {/* SVG Tail */}
        <svg
          className={`absolute top-1 ${tailAlignment}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        {/* Bubble */}
        <div
          className="bg-white rounded-2xl px-4 pt-2 pb-[6px] text-sm leading-snug shadow-sm"
          style={{ backgroundColor: bubbleBg }}
        >
          <p className="whitespace-pre-wrap break-words text-black">{msg.content}</p>
          <div className="flex justify-end items-center space-x-1 mt-1">
            <span className="text-[10px] text-gray-500">{msg.sent_at}</span>
            {sent && <MessageStatusIcon status={msg.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextMessage;
