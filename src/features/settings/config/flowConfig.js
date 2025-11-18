// Flow editor constants and configurations
export const FLOW_CONSTANTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 4,
  CONTROLS_TOP: '230px',
  MINIMAP_MARGIN_TOP: '60px',
  DEBOUNCE_DELAY: 300,
};

export const DEFAULT_EDGE_OPTIONS = {
  animated: true,
  style: { stroke: "#0ea5e9", strokeWidth: 2 },
  markerEnd: { type: "arrowclosed", color: "#0ea5e9" },
  type: 'smoothstep',
};

export const CONNECTION_LINE_STYLE = { 
  stroke: "#0ea5e9", 
  strokeWidth: 2 
};

export const MINIMAP_NODE_COLORS = {
  flowStartNode: "#3b82f6",
  "text-button": "#10b981",
  "media-button": "#8b5cf6",
  list: "#f59e0b",
  "ask-question": "#ef4444",
  default: "#6b7280",
};

export const NORMALIZED_NODE_TYPES = {
  'flowstartnode': 'flowStartNode',
  'textbutton': 'text-button',
  'mediabutton': 'media-button',
  'singleproduct': 'single-product',
  'multiproduct': 'multi-product',
  'askquestion': 'ask-question',
  'askaddress': 'ask-address',
  'asklocation': 'ask-location'
};
