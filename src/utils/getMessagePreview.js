export const getMessagePreview = (message, type) => {
  if (!message && !type) return null;
  if (message && type === "text") return message;

  switch (type) {
    case "image": return "📷 Photo";
    case "video": return "🎥 Video";
    case "document": return "📄 Document";
    case "audio": return "🎵 Audio";
    case "location": return "📍 Location";
    case "contact": return "👤 Contact";
    case "template": return "📋 Template";
    default: return message || "";
  }
};
