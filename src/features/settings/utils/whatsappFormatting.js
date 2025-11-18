/**
 * WhatsApp text formatting utilities
 * Converts HTML formatting to WhatsApp markdown and vice versa
 */

/**
 * Convert HTML formatted text to WhatsApp markdown
 * @param {string} html - HTML formatted text
 * @returns {string} - WhatsApp markdown formatted text
 */
export const htmlToWhatsAppMarkdown = (html) => {
  if (!html) return '';
  
  let text = html;
  
  // Convert HTML tags to WhatsApp markdown
  // Bold: <b>, <strong> -> *text*
  text = text.replace(/<(b|strong)>(.*?)<\/(b|strong)>/gi, '*$2*');
  
  // Italic: <i>, <em> -> _text_
  text = text.replace(/<(i|em)>(.*?)<\/(i|em)>/gi, '_$2_');
  
  // Strikethrough: <s>, <strike>, <del> -> ~text~
  text = text.replace(/<(s|strike|del)>(.*?)<\/(s|strike|del)>/gi, '~$2~');
  
  // Monospace: <code>, <pre> -> ```text```
  text = text.replace(/<(code|pre)>(.*?)<\/(code|pre)>/gi, '```$2```');
  
  // Remove other HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  return text;
};

/**
 * Handle paste event to preserve WhatsApp formatting
 * @param {ClipboardEvent} event - Paste event
 * @param {Function} setValue - Function to set the textarea value
 * @param {string} currentValue - Current textarea value
 * @param {number} selectionStart - Current cursor position
 */
export const handleWhatsAppPaste = (event, setValue, currentValue, selectionStart) => {
  event.preventDefault();
  
  const clipboardData = event.clipboardData || window.clipboardData;
  
  // Try to get HTML content first (preserves formatting)
  const htmlData = clipboardData.getData('text/html');
  
  // Get plain text as fallback
  const plainText = clipboardData.getData('text/plain');
  
  // Convert HTML to WhatsApp markdown if available
  const textToInsert = htmlData ? htmlToWhatsAppMarkdown(htmlData) : plainText;
  
  // Insert at cursor position
  const before = currentValue.substring(0, selectionStart);
  const after = currentValue.substring(selectionStart);
  const newValue = before + textToInsert + after;
  
  setValue(newValue);
  
  // Set cursor position after pasted text
  setTimeout(() => {
    const textarea = event.target;
    const newPosition = selectionStart + textToInsert.length;
    textarea.setSelectionRange(newPosition, newPosition);
  }, 0);
};

/**
 * Preview WhatsApp formatted text (for display purposes)
 * @param {string} text - Text with WhatsApp markdown
 * @returns {string} - HTML formatted text for preview
 */
export const whatsAppMarkdownToHtml = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // Escape HTML first
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
  
  // Bold: *text* -> <strong>text</strong>
  html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  
  // Italic: _text_ -> <em>text</em>
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Strikethrough: ~text~ -> <del>text</del>
  html = html.replace(/~([^~]+)~/g, '<del>$1</del>');
  
  // Monospace: ```text``` -> <code>text</code>
  html = html.replace(/```([^`]+)```/g, '<code>$1</code>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

/**
 * Add WhatsApp formatting to selected text
 * @param {string} text - Current text
 * @param {number} start - Selection start
 * @param {number} end - Selection end
 * @param {string} format - Format type: 'bold', 'italic', 'strikethrough', 'monospace'
 * @returns {object} - { text: newText, cursorPosition: newPosition }
 */
export const addWhatsAppFormatting = (text, start, end, format) => {
  const selectedText = text.substring(start, end);
  
  if (!selectedText) {
    return { text, cursorPosition: start };
  }
  
  const formatMap = {
    bold: { prefix: '*', suffix: '*' },
    italic: { prefix: '_', suffix: '_' },
    strikethrough: { prefix: '~', suffix: '~' },
    monospace: { prefix: '```', suffix: '```' },
  };
  
  const { prefix, suffix } = formatMap[format] || formatMap.bold;
  
  const before = text.substring(0, start);
  const after = text.substring(end);
  const formattedText = `${prefix}${selectedText}${suffix}`;
  const newText = before + formattedText + after;
  const newPosition = start + formattedText.length;
  
  return { text: newText, cursorPosition: newPosition };
};

/**
 * Check if text has WhatsApp formatting
 * @param {string} text - Text to check
 * @returns {boolean} - True if text has formatting
 */
export const hasWhatsAppFormatting = (text) => {
  if (!text) return false;
  
  return /\*[^*]+\*|_[^_]+_|~[^~]+~|```[^`]+```/.test(text);
};

/**
 * Strip WhatsApp formatting (get plain text)
 * @param {string} text - Text with WhatsApp markdown
 * @returns {string} - Plain text without formatting
 */
export const stripWhatsAppFormatting = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*([^*]+)\*/g, '$1')  // Remove bold
    .replace(/_([^_]+)_/g, '$1')    // Remove italic
    .replace(/~([^~]+)~/g, '$1')    // Remove strikethrough
    .replace(/```([^`]+)```/g, '$1'); // Remove monospace
};
