// ✅ RichTextEditor with WhatsApp formatting conversion
import React, { useRef, useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder,
  maxLength = 1024,
  className,
  onKeyDown,
}) => {
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // ✅ Convert HTML → WhatsApp Markdown
  const convertHtmlToWhatsapp = (html) => {
    let text = html;

    // Bold
    text = text.replace(/<b>(.*?)<\/b>/gi, "*$1*");
    text = text.replace(/<strong>(.*?)<\/strong>/gi, "*$1*");

    // Italic
    text = text.replace(/<i>(.*?)<\/i>/gi, "_$1_");
    text = text.replace(/<em>(.*?)<\/em>/gi, "_$1_");

    // Strikethrough
    text = text.replace(/<s>(.*?)<\/s>/gi, "~$1~");
    text = text.replace(/<strike>(.*?)<\/strike>/gi, "~$1~");

    // Line breaks
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/?div>/gi, "\n");

    // Strip any other tags
    text = text.replace(/<\/?[^>]+(>|$)/g, "");

    return text;
  };

  // ✅ Set initial value only once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, []); // run once

  const handleInput = (e) => {
    if (isComposing) return;
    let html = e.target.innerHTML;

    // Normalize empty
    if (html === "<br>" || html === "&nbsp;" || html.trim() === "") {
      html = "";
    }

    // Convert HTML → WhatsApp format before sending up
    const whatsappText = convertHtmlToWhatsapp(html);
    onChange(whatsappText);
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    handleInput(e);
  };

  const handleKeyDown = (e) => {
    if (onKeyDown) onKeyDown(e);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertHTML", false, "<br>");
    }
  };

  const updateCharCount = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length;
  };
  const charCount = updateCharCount(value);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const insertEmoji = (emoji) => {
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);

      // Move cursor after emoji
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // 🔥 Clean up trailing <br>
    if (editorRef.current.innerHTML.endsWith("<br>")) {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<br>$/, "");
    }

    editorRef.current.focus();
    const event = new Event("input", { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  return (
    <div
      className={`${className} ${
        charCount >= maxLength ? "border-red-500" : "border-transparent"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => formatText("bold")}
          className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText("italic")}
          className="px-2 py-1 italic text-sm hover:bg-gray-200 rounded"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 hover:bg-gray-200 rounded flex items-center"
          title="Insert emoji"
        >
          <InsertEmoticonIcon style={{ fontSize: 18 }} />
        </button>
      </div>

      <div
        ref={editorRef}
        className="w-full min-h-[100px] p-4 bg-gray-100 rounded focus:outline-none focus:border-teal-500 whitespace-pre-wrap"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        suppressContentEditableWarning={true}
        spellCheck="false"
      />

      <div className="flex justify-between mt-1">
        <p className="text-xs font-light text-gray-500">
          Use text formatting - bold, italic, emojis. Max {maxLength} characters.
        </p>
        <span
          className={`text-xs ${
            charCount === maxLength
              ? "text-red-500 font-semibold"
              : charCount >= maxLength * 0.9
              ? "text-yellow-500"
              : "text-gray-400"
          }`}
        >
          {charCount}/{maxLength}
        </span>
      </div>

      {showEmojiPicker && (
        <div className="absolute z-50 mt-1">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              insertEmoji(emojiData.emoji);
              setShowEmojiPicker(false);
            }}
            autoFocusSearch={false}
            width={300}
            height={350}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
            searchDisabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
