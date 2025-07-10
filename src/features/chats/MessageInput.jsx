import { useState, useMemo, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import SendTemplate from "./chatfeautures/SendTemplate";
import EmojiPicker from "emoji-picker-react";
import DOMPurify from "dompurify";

const MessageInput = ({ onSendMessage, selectedContact }) => {
  const [message, setMessage] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const emojiBtnRef = useRef(null);

  const isWithin24Hours = useMemo(() => {
    const time = selectedContact?.lastMessageTime;
    if (!time) return true;
    try {
      const lastTime = new Date(time).getTime();
      const now = Date.now();
      const hoursDiff = (now - lastTime) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    } catch {
      return true;
    }
  }, [selectedContact?.lastMessageTime]);

  const sanitizeHtml = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["b", "i", "s", "strong", "em"],
      ALLOWED_ATTR: [],
    })
      .replace(/<div>|<\/div>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/&nbsp;/gi, " ")
      .trim();
  };

  const extractPlainText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const convertHtmlToWhatsAppMarkdown = (html) => {
    let text = html;

    // Convert bold <b> or <strong>
    text = text.replace(/<(b|strong)>(.*?)<\/\1>/gi, "*$2*");

    // Convert italic <i> or <em>
    text = text.replace(/<(i|em)>(.*?)<\/\1>/gi, "_$2_");

    // Convert strikethrough <s>
    text = text.replace(/<s>(.*?)<\/s>/gi, "~$1~");

    // Remove all other HTML tags
    text = text.replace(/<\/?[^>]+(>|$)/g, "");

    return text.trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = sanitizeHtml(message);
    const plain = extractPlainText(cleaned);
    if (!plain.trim()) {
      setShowTemplates(true);
      return;
    }
    if (!isWithin24Hours) {
      setShowTemplates(true);
      return;
    }

    const whatsappFormattedMessage = convertHtmlToWhatsAppMarkdown(cleaned);
    onSendMessage(whatsappFormattedMessage);
    setMessage("");
    if (inputRef.current) inputRef.current.innerHTML = "";
  };

  const handleFormatting = (command) => {
    if (!isWithin24Hours) return;
    document.execCommand(command, false, null);
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(emoji));
    sel.collapseToEnd();
    setMessage(inputRef.current.innerHTML);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowTemplates(false);
    };
    if (showTemplates) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showTemplates]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target) &&
        !document.querySelector(".epr-main")?.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <>
      <div className="sticky bottom-0 bg-white border-t border-gray-200 z-10 px-2 py-2">
        {!isWithin24Hours && (
          <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
            <div className="flex justify-between items-center mb-2 text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Session expired. Send a template to reopen.</span>
              </div>
              <button
                onClick={() => setShowTemplates(true)}
                className="h-8 px-3 flex items-center justify-center text-white bg-teal-500 hover:bg-teal-600 rounded-full text-xs whitespace-nowrap"
              >
                Select Template
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Session expires after 24 hours of inactivity.
            </div>
          </div>
        )}

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiSelect} theme="light" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex items-center flex-1 bg-gray-100 rounded-full px-3 py-2 relative">
            <button
              ref={emojiBtnRef}
              type="button"
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="text-xl mr-2 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              disabled={!isWithin24Hours}
            >
              😊
            </button>

            <div className="flex gap-1 mr-2">
              <button type="button" onClick={() => handleFormatting("bold")} className="font-bold text-sm hover:text-gray-700" title="Bold">B</button>
              <button type="button" onClick={() => handleFormatting("italic")} className="italic text-sm hover:text-gray-700" title="Italic">I</button>
              <button type="button" onClick={() => handleFormatting("strikeThrough")} className="line-through text-sm hover:text-gray-700" title="Strikethrough">S</button>
            </div>

            <div
              ref={inputRef}
              contentEditable={isWithin24Hours}
              suppressContentEditableWarning
              onInput={(e) => setMessage(e.currentTarget.innerHTML)}
              onKeyDown={(e) => {
                if (!isWithin24Hours) {
                  e.preventDefault();
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              onPaste={(e) => {
                if (!isWithin24Hours) e.preventDefault();
              }}
              className={`flex-1 text-sm focus:outline-none max-h-36 overflow-y-auto ${
                !isWithin24Hours ? "text-gray-400 cursor-not-allowed" : ""
              }`}
              style={{ minHeight: "20px" }}
            ></div>

            <button
              type="submit"
              className="ml-2 h-8 px-3 flex items-center justify-center text-white bg-teal-500 hover:bg-teal-600 rounded-full text-xs whitespace-nowrap"
              disabled={!isWithin24Hours}
            >
              <Send className="w-4 h-4 mr-1" />
              {sanitizeHtml(message).trim()
                ? "Send Message"
                : "Send Template"}
            </button>
          </div>
        </form>
      </div>

      {showTemplates && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex justify-center items-center p-2">
          <div ref={modalRef} className="relative bg-white rounded-xl shadow-lg w-full max-w-3xl p-4 sm:p-6">
            <SendTemplate
              onSelect={(templateName) => {
                onSendMessage({ template_name: templateName });
                setShowTemplates(false);
              }}
              onClose={() => setShowTemplates(false)}
              returnFullTemplate={false}
            />
            <button
              onClick={() => setShowTemplates(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              aria-label="Close Template Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageInput;