import React from "react";
import DOMPurify from "dompurify";
import MessageStatusIcon from "./MessageStatusIcon";

const parseWhatsAppFormatting = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*(.*?)\*/g, "<b>$1</b>")
    .replace(/_(.*?)_/g, "<i>$1</i>")
    .replace(/~(.*?)~/g, "<s>$1</s>")
    .replace(/\n/g, "<br>");
};

const TextMessage = ({ msg, sent }) => {
  const bubbleBg = sent ? "#dcf8c6" : "#f0f0f0";
  const tailAlignment = sent ? "right-[-4px]" : "left-[-4px]";
  const tailPath = sent
    ? "M0 0 Q10 20 20 0"
    : "M20 0 Q10 20 0 0";

  return (
    <div className={`relative flex ${sent ? "justify-end" : "justify-start"} px-2`}>
      <div className="relative max-w-[60%]">
        <svg className={`absolute top-1 ${tailAlignment}`} width="20" height="20" viewBox="0 0 20 20">
          <path d={tailPath} fill={bubbleBg} />
        </svg>

        <div
          className="rounded-2xl px-4 pt-2 pb-[6px] text-sm leading-snug shadow-sm"
          style={{ backgroundColor: bubbleBg }}
        >
          <div
            className="whitespace-pre-wrap break-words text-black"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(parseWhatsAppFormatting(msg.content || ""))
            }}
          />
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
