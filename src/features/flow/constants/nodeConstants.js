export const CHAR_LIMITS = {
  // Text content
  BODY: 1024,
  CAPTION: 1024,
  FOOTER: 60,
  HEADER: 60,

  // Buttons
  BUTTON_TEXT: 20,
  MAX_BUTTONS: 3,

  // List
  LIST_HEADER: 60,
  LIST_BODY: 1024,
  LIST_FOOTER: 60,
  LIST_SECTION_TITLE: 24,
  LIST_ITEM_TITLE: 24,
  LIST_ITEM_DESCRIPTION: 72,
  MAX_LIST_SECTIONS: 10,
  MAX_LIST_ITEMS_PER_SECTION: 10,

  // Product
  PRODUCT_NAME: 100,
  PRODUCT_DESCRIPTION: 500,

  // Question
  QUESTION_TEXT: 1024,
  CUSTOM_FIELD_NAME: 50,

  // Variables
  VARIABLE_NAME: 50,
  VARIABLE_VALUE: 500,
};



export const WARNING_THRESHOLDS = {
  BODY: Math.floor(CHAR_LIMITS.BODY * 0.9),
  CAPTION: Math.floor(CHAR_LIMITS.CAPTION * 0.9),
  FOOTER: Math.floor(CHAR_LIMITS.FOOTER * 0.9),
  HEADER: Math.floor(CHAR_LIMITS.HEADER * 0.9),
  BUTTON_TEXT: Math.floor(CHAR_LIMITS.BUTTON_TEXT * 0.9),
};



export const NODE_DIMENSIONS = {
  WIDTH: 320,
  MIN_WIDTH: 320,
  MAX_WIDTH: 320,
};



export const NODE_COLORS = {
  BORDER_DEFAULT: "#e5e7eb",
  BORDER_CONTENT: "#fca5a5",
  BORDER_HOVER: "#3b82f6",
  BORDER_ERROR: "#ef4444",

  TEXT_DEFAULT: "#374151",
  TEXT_ERROR: "#ef4444",
  TEXT_WARNING: "#d97706",
  TEXT_MUTED: "#9ca3af",

  HANDLE_TARGET: "#078ded",
  HANDLE_SOURCE: "#078ded",

  BUTTON_PRIMARY: "#3b82f6",
  BUTTON_DANGER: "#ef4444",
  BUTTON_MUTED: "#6b7280",
};



export const VALIDATION_TYPES = {
  NONE: "None",
  TEXT: "Text",
  NUMBER: "Number",
  EMAIL: "Email",
  PHONE: "Phone",
  REGEX: "Regex",
  REQUIRED: "Required",
};



export const MEDIA_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  DOCUMENT: "document",
  AUDIO: "audio",
};



export const NODE_TYPE_COLORS = {
  flowStartNode: "#3b82f6",

  "text-button": "#10b981",
  "media-button": "#8b5cf6",

  list: "#f59e0b",

  "ask-question": "#ef4444",
  "ask-address": "#ec4899",
  "ask-location": "#06b6d4",

  "single-product": "#84cc16",
  "multi-product": "#a855f7",
  catalog: "#f97316",

  template: "#6366f1",

  "set-variable": "#14b8a6",
  "add-tag": "#0d9488",

  summary: "#8b5cf6",

  default: "#6b7280",
};



export const DEBOUNCE_DELAYS = {
  INPUT: 300,
  SEARCH: 500,
  AUTO_SAVE: 1000,
};



export const Z_INDEX = {
  NODE: 0,
  HANDLE: 1,
  MODAL: 100,
  TOOLTIP: 200,
};


export default {
  CHAR_LIMITS,
  WARNING_THRESHOLDS,
  NODE_DIMENSIONS,
  NODE_COLORS,
  VALIDATION_TYPES,
  MEDIA_TYPES,
  NODE_TYPE_COLORS,
  DEBOUNCE_DELAYS,
  Z_INDEX,
};
