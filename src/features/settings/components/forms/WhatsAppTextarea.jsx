import React, { useRef, useCallback } from 'react';
import { handleWhatsAppPaste, addWhatsAppFormatting } from '../../utils/whatsappFormatting';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea';

/**
 * Textarea component that preserves WhatsApp formatting
 * Supports: *bold*, _italic_, ~strikethrough~, ```monospace```
 */
const WhatsAppTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
  minHeight = 80,
  maxHeight = 400,
  showFormatting = true,
  ...props
}) => {
  const textareaRef = useAutoResizeTextarea(value, minHeight, maxHeight);
  const internalRef = useRef(null);

  // Combine refs
  const setRefs = useCallback((element) => {
    textareaRef.current = element;
    internalRef.current = element;
  }, [textareaRef]);

  const handlePaste = useCallback((event) => {
    const textarea = event.target;
    const selectionStart = textarea.selectionStart;
    
    handleWhatsAppPaste(
      event,
      (newValue) => {
        onChange({ target: { value: newValue } });
      },
      value,
      selectionStart
    );
  }, [value, onChange]);

  const handleKeyDown = useCallback((event) => {
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Ctrl+B for bold
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      const result = addWhatsAppFormatting(value, start, end, 'bold');
      onChange({ target: { value: result.text } });
      setTimeout(() => {
        textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
      }, 0);
    }
    // Ctrl+I for italic
    else if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
      event.preventDefault();
      const result = addWhatsAppFormatting(value, start, end, 'italic');
      onChange({ target: { value: result.text } });
      setTimeout(() => {
        textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
      }, 0);
    }
    // Ctrl+Shift+X for strikethrough
    else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'X') {
      event.preventDefault();
      const result = addWhatsAppFormatting(value, start, end, 'strikethrough');
      onChange({ target: { value: result.text } });
      setTimeout(() => {
        textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
      }, 0);
    }
    // Ctrl+Shift+M for monospace
    else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
      event.preventDefault();
      const result = addWhatsAppFormatting(value, start, end, 'monospace');
      onChange({ target: { value: result.text } });
      setTimeout(() => {
        textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
      }, 0);
    }
  }, [value, onChange]);

  return (
    <div className="relative">
      <textarea
        ref={setRefs}
        value={value}
        onChange={onChange}
        onPaste={handlePaste}
        onKeyDown={showFormatting ? handleKeyDown : undefined}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: 'hidden',
        }}
        {...props}
      />
      {showFormatting && (
        <div className="text-xs text-gray-400 mt-1">
          <span className="mr-3">💡 Formatting: *bold* _italic_ ~strike~ ```code```</span>
          <span>or Ctrl+B, Ctrl+I</span>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTextarea;
