export const parseWhatsAppFormatting = (text) => {
  if (!text) return "";

  // Escape HTML special chars first
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // WhatsApp-style formatting
  formatted = formatted
    .replace(/\*(.*?)\*/g, "<b>$1</b>")       
    .replace(/_(.*?)_/g, "<i>$1</i>")          
    .replace(/~(.*?)~/g, "<s>$1</s>")          
    .replace(/```(.*?)```/gs, "<code>$1</code>") 
    .replace(/\n/g, "<br>");               

  // Auto-detect and linkify URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formatted = formatted.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#00a5f4] underline hover:text-[#0092d9]">$1</a>'
  );

  // Auto-detect and linkify emails
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/g;
  formatted = formatted.replace(
    emailRegex,
    '<a href="mailto:$1" class="text-[#00a5f4] underline hover:text-[#0092d9]">$1</a>'
  );

  // Auto-detect and linkify phone numbers
  const phoneRegex = /(\+?\d[\d\s.-]{7,}\d)/g;
  formatted = formatted.replace(
    phoneRegex,
    '<a href="tel:$1" class="text-[#00a5f4] underline hover:text-[#0092d9]">$1</a>'
  );

  return formatted;
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format timestamp to WhatsApp-style time
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
};
