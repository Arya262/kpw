/**
 * Shared styles for all custom nodes
 * Standardized styling for consistent look and feel
 */

import { NODE_DIMENSIONS, NODE_COLORS } from '../../constants/nodeConstants';

export const nodeContainerStyle = {
  color: 'var(--palette-text-primary)',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: '2px solid #e5e7eb',
  width: `${NODE_DIMENSIONS.WIDTH}px`,
  minWidth: `${NODE_DIMENSIONS.MIN_WIDTH}px`,
  maxWidth: `${NODE_DIMENSIONS.MAX_WIDTH}px`,
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  position: 'relative',
  padding: '16px',
};

export const handleStyle = {
  background: 'white',
  border: `2px solid ${NODE_COLORS.HANDLE_TARGET}`,
  width: 12,
  height: 12,
  borderRadius: '50%',
  cursor: 'crosshair',
  transition: 'all 0.2s ease',
};

/**
 * Get source handle style with proper positioning
 * @param {number} index - Button index (0-based)
 * @param {number} total - Total number of buttons
 * @returns {object} Style object for source handle
 */
export const getSourceHandleStyle = (index, total) => {
  // Distribute handles evenly on the right side
  const spacing = 100 / (total + 1);
  const top = `${spacing * (index + 1)}%`;
  
  return {
    ...handleStyle,
    position: 'absolute',
    right: -7, // Half of handle width + 1px for border
    top,
    transform: 'translateY(-50%)',
  };
};

/**
 * Target handle style (left side, centered)
 */
export const targetHandleStyle = {
  ...handleStyle,
  position: 'absolute',
  left: -7, // Half of handle width + 1px for border
  top: '50%',
  transform: 'translateY(-50%)',
};

/**
 * Single source handle style (right side, centered)
 */
export const sourceHandleStyle = {
  ...handleStyle,
  position: 'absolute',
  right: -7,
  top: '50%',
  transform: 'translateY(-50%)',
};

/**
 * Get character count color based on current count and limit
 * @param {number} count - Current character count
 * @param {number} limit - Maximum character limit
 * @param {number} warningThreshold - Warning threshold (default 90% of limit)
 * @returns {string} Tailwind color class
 */
export const getCharCountColor = (count, limit, warningThreshold = limit * 0.9) => {
  if (count > limit) return 'text-red-500';
  if (count > warningThreshold) return 'text-yellow-600';
  return 'text-gray-400';
};

/**
 * Get input border color based on error state
 * @param {boolean} isError - Whether input has error
 * @returns {string} Tailwind border class
 */
export const getInputBorderColor = (isError) => {
  return isError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
};

/**
 * Common input classes
 */
export const inputClasses = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all';

/**
 * Common textarea classes
 */
export const textareaClasses = 'w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all';

/**
 * Common button classes
 */
export const buttonClasses = {
  primary: 'px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium',
  secondary: 'px-3 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium',
  danger: 'px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium',
  icon: 'p-1 hover:bg-gray-100 rounded transition-colors',
};

/**
 * Content area classes (main content area inside nodes)
 */
export const contentAreaClasses = 'bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4';

export default {
  nodeContainerStyle,
  handleStyle,
  getSourceHandleStyle,
  targetHandleStyle,
  sourceHandleStyle,
  getCharCountColor,
  getInputBorderColor,
  inputClasses,
  textareaClasses,
  buttonClasses,
  contentAreaClasses,
};
