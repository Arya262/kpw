import { useState, useMemo, useEffect, useRef } from "react";
import { Send, X, Paperclip, FileText } from "lucide-react";
import SendTemplate from "./chatfeautures/SendTemplate";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ onSendMessage, selectedContact }) => {
  const [message, setMessage] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [caption, setCaption] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeFormatting, setActiveFormatting] = useState({ bold: false, italic: false, strikethrough: false, link: false });
  const inputRef = useRef();
  const fileInputRef = useRef();
  const modalRef = useRef();

  const isWithin24Hours = useMemo(() => {
    const time = selectedContact?.lastMessageTime;
    if (!time) return true;
    try {
      const lastTime = new Date(time).getTime();
      const now = Date.now();
      if (isNaN(lastTime)) return true;
      const hoursDiff = (now - lastTime) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    } catch {
      return true;
    }
  }, [selectedContact?.lastMessageTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (attachments.length > 0) {
      if (!caption.trim()) return;
      onSendMessage({ caption, attachments });
      setAttachments([]);
      setCaption("");
      return;
    }
    if (!message.trim()) {
      setShowTemplates(true);
      return;
    }
    if (!isWithin24Hours) {
      setShowTemplates(true);
      return;
    }
    onSendMessage(message);
    setMessage("");
  };

  const isTextDisabled = selectedContact?.lastMessageTime
    ? !isWithin24Hours
    : false;

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowTemplates(false);
      }
    };
    if (showTemplates) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showTemplates]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowTemplates(false);
      }
    };
    if (showTemplates) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplates]);

  const handleEmojiSelect = (emojiObject) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBefore = message.substring(0, cursorPos);
    const textAfter = message.substring(cursorPos);
    setMessage(textBefore + emojiObject.emoji + textAfter);
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionEnd = cursorPos + emojiObject.emoji.length;
    }, 0);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({ file }))
    ]);
    e.target.value = null; // reset input
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Formatting handlers
  const handleFormatting = (formatType) => {
    if (!inputRef.current || !isWithin24Hours) return;
    
    const textarea = inputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = "";
    let newCursorPos = start;
    
    switch (formatType) {
      case "bold":
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case "italic":
        formattedText = `_${selectedText}_`;
        newCursorPos = start + 1;
        break;
      case "strikethrough":
        formattedText = `~${selectedText}~`;
        newCursorPos = start + 1;
        break;
      case "link":
        if (selectedText) {
          formattedText = `[${selectedText}](url)`;
          newCursorPos = start + selectedText.length + 3; // Position after the text, before the URL
        } else {
          formattedText = "[link text](url)";
          newCursorPos = start + 10; // Position after "link text"
        }
        break;
      default:
        return;
    }
    
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Update selectedImageIdx if attachments change
  useEffect(() => {
    if (attachments.length === 0) setSelectedImageIdx(0);
    else if (selectedImageIdx >= attachments.length) setSelectedImageIdx(0);
  }, [attachments, selectedImageIdx]);

  // Detect current formatting at cursor position
  const detectFormatting = () => {
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    const cursorPos = textarea.selectionStart;
    const text = message;
    
    // Check for formatting markers around cursor position
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
    
    // Check for bold (*text*)
    const boldMatch = beforeCursor.match(/\*[^*]*$/);
    const boldEndMatch = afterCursor.match(/^[^*]*\*/);
    const isBold = boldMatch && boldEndMatch;
    
    // Check for italic (_text_)
    const italicMatch = beforeCursor.match(/_[^_]*$/);
    const italicEndMatch = afterCursor.match(/^[^_]*_/);
    const isItalic = italicMatch && italicEndMatch;
    
    // Check for strikethrough (~text~)
    const strikethroughMatch = beforeCursor.match(/~[^~]*$/);
    const strikethroughEndMatch = afterCursor.match(/^[^~]*~/);
    const isStrikethrough = strikethroughMatch && strikethroughEndMatch;
    
    // Check for link ([text](url))
    const linkMatch = beforeCursor.match(/\[[^\]]*$/);
    const linkEndMatch = afterCursor.match(/^[^\]]*\]\([^)]*\)/);
    const isLink = linkMatch && linkEndMatch;
    
    setActiveFormatting({
      bold: isBold,
      italic: isItalic,
      strikethrough: isStrikethrough,
      link: isLink
    });
  };

  // Helper: get all image attachments
  const imageAttachments = attachments.filter(att => att.file.type.startsWith("image/"));
  // Helper: get all non-image attachments
  const nonImageAttachments = attachments.filter(att => !att.file.type.startsWith("image/"));

  return (
    <>
      <div className="p-3 bg-white">
        {/* Session Expired Banner */}
        {!isWithin24Hours && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-between">
            <div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-6 h-6 mr-2 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <span className="font-medium text-gray-800">Session has expired. To continue chat, you can send template based messages. When the customer sends a message, the session will automatically reopen.</span>
              </div>
              <div className="text-xs text-gray-500">A session automatically expires after 24 hours.</div>
            </div>
            <button
              className="ml-4 px-4 py-2 border border-teal-500 text-teal-600 rounded hover:bg-teal-50 font-medium"
              onClick={() => setShowTemplates(true)}
            >
              Select template
            </button>
          </div>
        )}
        <div className="relative w-full max-w-3xl mx-auto">
          {attachments.length > 0 && (
            <>
              {/* Large image preview if any image is selected */}
              {imageAttachments.length > 0 && (
                <div className="flex justify-center mb-2">
                  <img
                    src={URL.createObjectURL(imageAttachments[selectedImageIdx]?.file)}
                    alt={imageAttachments[selectedImageIdx]?.file.name}
                    className="max-h-64 max-w-full rounded-lg object-contain border"
                  />
                </div>
              )}
              {/* Caption input always below large preview (if any) */}
              <textarea
                value={caption}
                onChange={e => {
                  setCaption(e.target.value);
                  setTimeout(detectFormatting, 0);
                }}
                onKeyUp={detectFormatting}
                onMouseUp={detectFormatting}
                onSelect={detectFormatting}
                placeholder="Caption (optional)"
                className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                rows={1}
                aria-label="Attachment Caption"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={!isWithin24Hours}
              />
              {/* Thumbnails row for all attachments (images and non-images) */}
              <div className="flex flex-row items-center gap-2 mb-2">
                <button
                  type="button"
                  className="flex items-center justify-center w-12 h-12 border-2 border-dashed border-gray-300 rounded hover:bg-gray-100"
                  onClick={() => fileInputRef.current.click()}
                  aria-label="Add more attachments"
                  disabled={!isWithin24Hours}
                >
                  <span className="text-2xl">+</span>
                </button>
                {imageAttachments.map((att, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <img
                      src={URL.createObjectURL(att.file)}
                      alt={att.file.name}
                      className={`w-12 h-12 object-cover rounded cursor-pointer border-2 ${selectedImageIdx === idx ? 'border-teal-500' : 'border-transparent'}`}
                      onClick={() => setSelectedImageIdx(idx)}
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-gray-400 hover:text-red-500 shadow"
                      onClick={() => {
                        const imgIdx = attachments.findIndex(a => a === att);
                        handleRemoveAttachment(imgIdx);
                        if (selectedImageIdx >= idx && selectedImageIdx > 0) setSelectedImageIdx(selectedImageIdx - 1);
                      }}
                      aria-label="Remove attachment"
                      disabled={!isWithin24Hours}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {nonImageAttachments.map((att, idx) => (
                  <div key={imageAttachments.length + idx} className="relative flex items-center">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-100 rounded">
                      <FileText className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] truncate w-10 text-center">{att.file.name}</span>
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-gray-400 hover:text-red-500 shadow"
                      onClick={() => {
                        const nonImgIdx = attachments.findIndex(a => a === att);
                        handleRemoveAttachment(nonImgIdx);
                      }}
                      aria-label="Remove attachment"
                      disabled={!isWithin24Hours}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {showEmojiPicker && (
            <div className="absolute left-0 bottom-full mb-2 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                theme="light"
              />
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex items-center w-full"
          >
            <button
              type="button"
              className="h-10 px-2 border border-gray-300 border-r-0 rounded-l-lg bg-white hover:bg-gray-100 flex items-center"
              onClick={() => setShowEmojiPicker((v) => !v)}
              tabIndex={-1}
              aria-label="Open Emoji Picker"
              disabled={!isWithin24Hours}
            >
              <span role="img" aria-label="emoji">😊</span>
            </button>
            {/* Formatting buttons */}
            <div className="flex items-center h-10 bg-white border-t border-b border-gray-300 px-1">
              <button 
                type="button" 
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  activeFormatting.bold 
                    ? 'bg-teal-100 text-teal-700' 
                    : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50'
                }`}
                onClick={() => handleFormatting('bold')}
                disabled={!isWithin24Hours}
                title="Bold"
              >
                <b>B</b>
              </button>
              <button 
                type="button" 
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  activeFormatting.italic 
                    ? 'bg-teal-100 text-teal-700' 
                    : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50'
                }`}
                onClick={() => handleFormatting('italic')}
                disabled={!isWithin24Hours}
                title="Italic"
              >
                <i>I</i>
              </button>
              <button 
                type="button" 
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  activeFormatting.strikethrough 
                    ? 'bg-teal-100 text-teal-700' 
                    : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50'
                }`}
                onClick={() => handleFormatting('strikethrough')}
                disabled={!isWithin24Hours}
                title="Strikethrough"
              >
                <s>S</s>
              </button>
              <button 
                type="button" 
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  activeFormatting.link 
                    ? 'bg-teal-100 text-teal-700' 
                    : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50'
                }`}
                onClick={() => handleFormatting('link')}
                disabled={!isWithin24Hours}
                title="Add Link"
              >
                🔗
              </button>
            </div>
            <button
              type="button"
              className="h-10 px-2 border border-gray-300 border-r-0 bg-white hover:bg-gray-100 flex items-center"
              onClick={() => fileInputRef.current.click()}
              tabIndex={-1}
              aria-label="Attach Files"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              disabled={!isWithin24Hours}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={!isWithin24Hours}
            />
            {attachments.length === 0 && (
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setTimeout(detectFormatting, 0);
                }}
                onKeyUp={detectFormatting}
                onMouseUp={detectFormatting}
                onSelect={detectFormatting}
                placeholder={
                  isTextDisabled
                    ? "Conversation expired. Please send templates."
                    : "Send Message"
                }
                disabled={!isWithin24Hours}
                className={`text-sm border border-gray-300 px-4 py-2 h-10 flex-1 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none ${
                  !isWithin24Hours ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                aria-label="Message Input"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                rows={1}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            )}
            <button
              type="submit"
              className="flex items-center gap-2 h-10 px-4 text-white text-sm rounded-r-lg border border-l-0 bg-teal-500 hover:bg-teal-600 border-teal-500"
              aria-label={attachments.length > 0 || message.trim() ? "Send Message" : "Send Template"}
              disabled={!isWithin24Hours && attachments.length === 0}
            >
              <Send className="w-4 h-4" />
              {attachments.length > 0 || message.trim() ? "Send Message" : "Send Template"}
            </button>
          </form>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex justify-center items-center">
          <div ref={modalRef} className="relative bg-white rounded-xl shadow-lg w-full max-w-3xl p-6">
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
