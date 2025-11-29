// ------------------------------------------------------
// Flow Editor Global Configuration
// ------------------------------------------------------

export const FLOW_CONSTANTS = {
  // Zoom limits - comfortable range like AiSensy
  // MIN_ZOOM prevents zooming out too much (nodes cut off)
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 1.2,
  DEFAULT_ZOOM: 1,

  // Pan settings
  PAN_ON_SCROLL_SPEED: 0.8,

  // Grid & snapping
  SNAP_GRID: [15, 15],
  BACKGROUND_GAP: 20,

  // Smooth animation durations
  DEBOUNCE_DELAY: 300,
  FIT_VIEW_DURATION: 200,

  // FitView padding - more padding to show nodes clearly
  FIT_VIEW_PADDING: 0.5,

  // Default stroke color (single source of truth)
  EDGE_COLOR: "#0AA89E",
  EDGE_WIDTH: 2,
  EDGE_RADIUS: 20,
};


// ------------------------------------------------------
// 🎨 Unified Edge Options (No Duplication)
// ------------------------------------------------------

export const DEFAULT_EDGE_OPTIONS = {
  animated: false,
  type: "smoothstep",

  style: { 
    stroke: FLOW_CONSTANTS.EDGE_COLOR,
    strokeWidth: FLOW_CONSTANTS.EDGE_WIDTH,
    strokeLinecap: "round",
  },

  markerEnd: { 
    type: "arrowclosed",
    color: FLOW_CONSTANTS.EDGE_COLOR,
    width: 20,
    height: 20,
  },

  pathOptions: {
    borderRadius: FLOW_CONSTANTS.EDGE_RADIUS,
  },
};


// ------------------------------------------------------
// 🔄 Connection Preview — Reusing Same Color
// ------------------------------------------------------

export const CONNECTION_LINE_STYLE = { 
  stroke: FLOW_CONSTANTS.EDGE_COLOR,
  strokeWidth: FLOW_CONSTANTS.EDGE_WIDTH,
  strokeDasharray: "5 5",
};


// ------------------------------------------------------
// 🗺 MiniMap Colors — Clean + Grouped
// ------------------------------------------------------

export const MINIMAP_NODE_COLORS = {
  // System & Entry Nodes
  flowStartNode: "#3b82f6",

  // Basic content
  text: "#6366f1",
  media: "#8b5cf6",
  list: "#f59e0b",
  summary: "#0ea5e9",

  // Buttons
  "text-button": "#10b981",
  "media-button": "#14b8a6",

  // Template nodes
  template: "#ec4899",

  // Product nodes
  "single-product": "#84cc16",
  "multi-product": "#22c55e",
  catalog: "#f97316",

  // Ask/Collect nodes
  "ask-question": "#ef4444",
  "ask-address": "#f43f5e",
  "ask-location": "#06b6d4",

  // Action nodes
  "set-variable": "#a855f7",
  "set-custom-field": "#d946ef",
  "add-tag": "#0d9488",

  // Fallback
  default: "#6b7280",
};


// ------------------------------------------------------
// 🔁 Normalization Map (Completed & Safe)
// ------------------------------------------------------

export const NORMALIZED_NODE_TYPES = {
  // Core
  flowstartnode: "flowStartNode",

  // Basic content
  text: "text",
  media: "media",
  list: "list",
  summary: "summary",

  // Buttons
  textbutton: "text-button",
  mediabutton: "media-button",

  // Templates
  template: "template",

  // Products
  singleproduct: "single-product",
  multiproduct: "multi-product",
  catalog: "catalog",

  // Ask nodes
  askquestion: "ask-question",
  askaddress: "ask-address",
  asklocation: "ask-location",

  // Actions
  setvariable: "set-variable",
  setcustomfield: "set-custom-field",
  addtag: "add-tag",
};
