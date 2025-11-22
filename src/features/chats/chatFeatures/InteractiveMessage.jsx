import DOMPurify from "dompurify";
import MessageBubble from "./MessageBubble";
import { parseWhatsAppFormatting } from "./messageUtils";

const InteractiveMessage = ({ msg, sent }) => {
  const bodyText = msg.content || msg.text || msg.body || "";
  const buttons = msg.buttons || msg.interactiveButtonsItems || [];
  const headerText = msg.header?.text || msg.interactiveButtonsHeader?.text || "";
  const footerText = msg.footer || "";

  return (
    <MessageBubble sent={sent} timestamp={msg.sent_at} status={msg.status} maxWidth="70%">
      {/* Header */}
      {headerText && (
        <div className="font-semibold text-[14.2px] text-gray-900 mb-2 pb-2 border-b border-gray-200">
          {headerText}
        </div>
      )}

      {/* Body Text */}
      {bodyText && (
        <div
          className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words text-gray-900"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(parseWhatsAppFormatting(bodyText))
          }}
        />
      )}

      {/* Interactive Buttons */}
      {buttons.length > 0 && (
        <div className="mt-2 -mx-3 -mb-2 border-t border-gray-200">
          {buttons.map((button, index) => (
            <button
              key={button.id || index}
              className="w-full px-3 py-2.5 text-[14.2px] font-medium text-[#00a5f4] hover:bg-gray-50 transition-colors text-center border-b border-gray-200 last:border-b-0 cursor-not-allowed"
              disabled
            >
              {button.text || button.buttonText || `Button ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      {footerText && (
        <div className="mt-2 pt-2 text-[13px] text-gray-500 border-t border-gray-200">
          {footerText}
        </div>
      )}
    </MessageBubble>
  );
};

export default InteractiveMessage;
