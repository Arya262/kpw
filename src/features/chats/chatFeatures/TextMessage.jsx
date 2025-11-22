import DOMPurify from "dompurify";
import MessageBubble from "./MessageBubble";
import { parseWhatsAppFormatting } from "./messageUtils";

const TextMessage = ({ msg, sent }) => {
  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status}>
      <div
        className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words text-gray-900"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(parseWhatsAppFormatting(msg.content || ""))
        }}
      />
    </MessageBubble>
  );
};

export default TextMessage;
