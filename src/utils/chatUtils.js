/**
 * Shared utilities for chat functionality
 */

/**
 * Normalizes message data from different sources
 * @param {any} data - Raw message data
 * @returns {Object} Normalized message object
 */
export const normalizeMessageData = (data) => {
  let message = data?.message || data?.data || data;
  
  if (typeof message === "string") {
    try {
      message = JSON.parse(message);
    } catch {
      return null;
    }
  }
  
  return message;
};

/**
 * Extracts conversation ID from message data
 * @param {Object} message - Message object
 * @returns {string} Conversation ID
 */
export const extractConversationId = (message) => {
  return message.conversation_id || 
         message.chat_id || 
         message.contact_id || 
         "unknown";
};

/**
 * Extracts contact name from message data
 * @param {Object} message - Message object
 * @returns {string} Contact name
 */
export const extractContactName = (message) => {
  return message.contact_name ||
         message.sender_name ||
         message.name ||
         message.from ||
         message.customerName ||
         "Unknown";
};

/**
 * Extracts message text from message data
 * @param {Object} message - Message object
 * @param {string} contactName - Contact name for fallback
 * @returns {string} Message text
 */
export const extractMessageText = (message, contactName) => {
  return message.content ||
         message.element_name ||
         message.message ||
         message.text ||
         `New message from ${contactName}`;
};

/**
 * Updates contact list with new message data
 * @param {Array} contacts - Current contacts array
 * @param {Object} msg - Message object
 * @param {boolean} isFromSelectedChat - Whether message is from currently selected chat
 * @returns {Array} Updated contacts array
 */
export const updateContactFromMessage = (contacts, msg, isFromSelectedChat) => {
  return contacts.map((c) => {
    if (c.contact_id === msg.contact_id) {
      return {
        ...c,
        lastMessage: msg.content || msg.element_name,
        lastMessageType: msg.message_type,
        lastMessageTime: msg.sent_at,
        unreadCount: isFromSelectedChat ? 0 : (c.unreadCount || 0) + 1,
      };
    }
    return c;
  });
};

/**
 * Checks if message is from currently selected contact
 * @param {Object} selectedContact - Currently selected contact
 * @param {Object} msg - Message object
 * @returns {boolean} True if message is from selected contact
 */
export const isMessageFromSelectedChat = (selectedContact, msg) => {
  return selectedContact?.contact_id === msg.contact_id;
};
