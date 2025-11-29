export const handleNodeDelete = (nodeId, setNodes, setEdges) => {
 
  setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  
 
  setEdges((edges) => 
    edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  );
};


export const handleNodeDuplicate = (nodeId, setNodes, offsetX = 50, offsetY = 50) => {
  setNodes((nodes) => {
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return nodes;

    const newNode = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + offsetX,
        y: nodeToDuplicate.position.y + offsetY,
      },
      data: {
        ...nodeToDuplicate.data,
      },
      selected: false,
    };

    return [...nodes, newNode];
  });
};


export const validateCharCount = (text, limit) => {
  const count = (text || '').length;
  const warningThreshold = Math.floor(limit * 0.9);
  
  return {
    isValid: count <= limit,
    isWarning: count > warningThreshold && count <= limit,
    isError: count > limit,
    count,
    limit,
    remaining: limit - count,
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

export const validateByType = (value, type) => {
  if (!value) return type !== 'Required';
  
  switch (type) {
    case 'Email':
      return validateEmail(value);
    case 'Phone':
      return validatePhone(value);
    case 'Number':
      return !isNaN(value) && value.trim() !== '';
    case 'Text':
      return typeof value === 'string' && value.trim().length > 0;
    case 'Required':
      return value.trim().length > 0;
    default:
      return true;
  }
};


export const formatVariableUsage = (variableName) => {
  if (!variableName) return '{{user.variable_name}}';
  return `{{user.${variableName}}}`;
};


export const generateButtonId = () => {
  return `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};


export const generateNodeId = () => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};


export const sanitizeWhatsAppText = (text) => {
  if (!text) return '';
  return text.replace(/\0/g, '').trim();
};

export const hasUnsavedChanges = (currentData, savedData) => {
  return JSON.stringify(currentData) !== JSON.stringify(savedData);
};

export const getNodeIcon = (nodeType) => {
  const icons = {
    'flowStartNode': '▶️',
    'text-button': '💬',
    'media-button': '🖼️',
    'list': '📋',
    'ask-question': '❓',
    'ask-address': '📍',
    'ask-location': '🗺️',
    'single-product': '🛍️',
    'multi-product': '🛒',
    'catalog': '📦',
    'template': '📄',
    'set-variable': '🔧',
    'summary': '📊',
  };
  return icons[nodeType] || '📌';
};

/**
 * Export node data for debugging
 * @param {object} nodeData - Node data to export
 * @returns {string} JSON string of node data
 */
export const exportNodeData = (nodeData) => {
  return JSON.stringify(nodeData, null, 2);
};

/**
 * Import node data from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {object|null} Parsed node data or null if invalid
 */
export const importNodeData = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to import node data:', error);
    return null;
  }
};

export default {
  handleNodeDelete,
  handleNodeDuplicate,
  validateCharCount,
  validateEmail,
  validatePhone,
  validateByType,
  formatVariableUsage,
  generateButtonId,
  generateNodeId,
  sanitizeWhatsAppText,
  hasUnsavedChanges,
  getNodeIcon,
  exportNodeData,
  importNodeData,
};
