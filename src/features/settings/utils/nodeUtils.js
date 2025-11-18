/**
 * Utility functions for node operations
 */

/**
 * Handle node deletion
 * @param {string} nodeId - ID of node to delete
 * @param {Function} setNodes - React Flow setNodes function
 * @param {Function} setEdges - React Flow setEdges function
 */
export const handleNodeDelete = (nodeId, setNodes, setEdges) => {
  // Remove the node
  setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
  
  // Remove all edges connected to this node
  setEdges((edges) => 
    edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  );
};

/**
 * Handle node duplication
 * @param {string} nodeId - ID of node to duplicate
 * @param {Function} setNodes - React Flow setNodes function
 * @param {number} offsetX - X offset for duplicated node (default: 50)
 * @param {number} offsetY - Y offset for duplicated node (default: 50)
 */
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

/**
 * Validate character count
 * @param {string} text - Text to validate
 * @param {number} limit - Character limit
 * @returns {object} Validation result { isValid, isWarning, count }
 */
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

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate based on type
 * @param {string} value - Value to validate
 * @param {string} type - Validation type
 * @returns {boolean} Whether value is valid
 */
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

/**
 * Format variable name for display
 * @param {string} variableName - Variable name
 * @returns {string} Formatted variable usage
 */
export const formatVariableUsage = (variableName) => {
  if (!variableName) return '{{user.variable_name}}';
  return `{{user.${variableName}}}`;
};

/**
 * Generate unique button ID
 * @returns {string} Unique button ID
 */
export const generateButtonId = () => {
  return `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique node ID
 * @returns {string} Unique node ID
 */
export const generateNodeId = () => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize text for WhatsApp (remove unsupported characters)
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeWhatsAppText = (text) => {
  if (!text) return '';
  // Remove null bytes and other problematic characters
  return text.replace(/\0/g, '').trim();
};

/**
 * Check if node has unsaved changes
 * @param {object} currentData - Current node data
 * @param {object} savedData - Saved node data
 * @returns {boolean} Whether node has unsaved changes
 */
export const hasUnsavedChanges = (currentData, savedData) => {
  return JSON.stringify(currentData) !== JSON.stringify(savedData);
};

/**
 * Get node icon by type
 * @param {string} nodeType - Node type
 * @returns {string} Icon name or emoji
 */
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
