export const CHAT_CONFIG = {
  // Session Management
  SESSION_TIMEOUT_HOURS: 24,
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000,

  // Pagination & Scrolling
  INFINITE_SCROLL_THRESHOLD: 10,
  MESSAGE_BATCH_SIZE: 20,
  CONTACTS_BATCH_SIZE: 20,
  
  // Sidebar
  SIDEBAR_MIN_WIDTH: 200,
  SIDEBAR_MAX_WIDTH: 450,
  SIDEBAR_DEFAULT_WIDTH: 300,
  
  // Breakpoints
  MOBILE_BREAKPOINT: 768,
  
  // Message Limits
  MAX_MESSAGE_LENGTH: 4096,
  MAX_FILE_SIZE_MB: 16,
  MAX_FILE_SIZE_BYTES: 16 * 1024 * 1024,
  
  // Timeouts & Delays
  TYPING_INDICATOR_TIMEOUT: 3000,
  DEBOUNCE_SEARCH_MS: 300,
  DEBOUNCE_RESIZE_MS: 16, // 60fps
  
  // UI
  SCROLL_BEHAVIOR: 'smooth',
  SCROLL_THRESHOLD_PX: 100,
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  TEMPLATE: 'template',
  INTERACTIVE: 'interactive',
  BUTTON: 'button',
};

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  RECEIVED: 'received',
};

export const CONTACT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const ERROR_MESSAGES = {
  MESSAGE_TOO_LONG: `Message exceeds maximum length of ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters`,
  FILE_TOO_LARGE: `File size exceeds maximum of ${CHAT_CONFIG.MAX_FILE_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'File type not supported',
  SESSION_EXPIRED: 'Session has expired. Please send a template message.',
  SEND_FAILED: 'Failed to send message. Please try again.',
  LOAD_FAILED: 'Failed to load messages. Please refresh.',
  NO_PERMISSION: 'You do not have permission to perform this action.',
};

export default {
  CHAT_CONFIG,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  CONTACT_STATUS,
  ALLOWED_FILE_TYPES,
  ERROR_MESSAGES,
};
