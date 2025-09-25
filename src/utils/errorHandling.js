import { toast } from 'react-toastify';

// Common user-friendly error messages
export const USER_MESSAGES = {
  // Generic messages
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
  SERVER_ERROR: 'Service temporarily unavailable. Please try again later.',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
  
  // Authentication
  LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
  LOGOUT_FAILED: 'Unable to log out. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Data operations
  FETCH_FAILED: 'Unable to load data. Please try again later.',
  SAVE_FAILED: 'Unable to save changes. Please try again.',
  DELETE_FAILED: 'Unable to delete item. Please try again.',
  UPDATE_FAILED: 'Unable to update. Please try again.',
  
  // Specific features
  CONTACT_LOAD_FAILED: 'Unable to load contacts. Please try again later.',
  CONTACT_SAVE_FAILED: 'Unable to save contact. Please try again.',
  CONTACT_DELETE_FAILED: 'Unable to delete contact. Please try again.',
  
  TEMPLATE_LOAD_FAILED: 'Unable to load templates. Please try again later.',
  TEMPLATE_SAVE_FAILED: 'Unable to save template. Please try again.',
  TEMPLATE_DELETE_FAILED: 'Unable to delete template. Please try again.',
  
  BROADCAST_LOAD_FAILED: 'Unable to load broadcasts. Please try again later.',
  BROADCAST_SAVE_FAILED: 'Unable to save broadcast. Please try again.',
  BROADCAST_DELETE_FAILED: 'Unable to delete broadcast. Please try again.',
  
  CHAT_LOAD_FAILED: 'Unable to load messages. Please try again later.',
  CHAT_SEND_FAILED: 'Unable to send message. Please try again.',
  CHAT_DELETE_FAILED: 'Unable to delete chat. Please try again.',
  
  GROUP_LOAD_FAILED: 'Unable to load groups. Please try again later.',
  GROUP_SAVE_FAILED: 'Unable to save group. Please try again.',
  GROUP_DELETE_FAILED: 'Unable to delete group. Please try again.',
  
  SETTINGS_LOAD_FAILED: 'Unable to load settings. Please try again later.',
  SETTINGS_SAVE_FAILED: 'Unable to save settings. Please try again.',
  
  // File operations
  FILE_UPLOAD_FAILED: 'Unable to upload file. Please try again.',
  FILE_DOWNLOAD_FAILED: 'Unable to download file. Please try again.',
  
  // Validation
  VALIDATION_FAILED: 'Please check your input and try again.',
  INVALID_FORMAT: 'Invalid format. Please check your input.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
};

/**
 * Handle errors consistently across the application
 * @param {Error} error - The error object
 * @param {string} userMessage - User-friendly message to display
 * @param {Object} context - Additional context for logging
 */
export const handleError = (error, userMessage = USER_MESSAGES.GENERIC_ERROR, context = {}) => {
  // Log technical details for developers
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Show user-friendly message
  toast.error(userMessage);
};

/**
 * Handle API errors specifically
 * @param {Error} error - The error object
 * @param {Response} response - The fetch response object (optional)
 * @param {string} operation - The operation being performed
 */
export const handleApiError = (error, response = null, operation = 'operation') => {
  console.error(`API Error during ${operation}:`, {
    error: error.message,
    status: response?.status,
    statusText: response?.statusText,
    timestamp: new Date().toISOString(),
  });

  let userMessage = USER_MESSAGES.GENERIC_ERROR;
  
  if (!navigator.onLine) {
    userMessage = USER_MESSAGES.NETWORK_ERROR;
  } else if (response) {
    switch (response.status) {
      case 401:
        userMessage = USER_MESSAGES.SESSION_EXPIRED;
        break;
      case 403:
        userMessage = USER_MESSAGES.PERMISSION_DENIED;
        break;
      case 404:
        userMessage = USER_MESSAGES.FETCH_FAILED;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        userMessage = USER_MESSAGES.SERVER_ERROR;
        break;
      default:
        userMessage = USER_MESSAGES.GENERIC_ERROR;
    }
  }
  
  toast.error(userMessage);
};

/**
 * Handle success messages consistently
 * @param {string} message - Success message to display
 */
export const handleSuccess = (message) => {
  toast.success(message);
};

/**
 * Handle info messages consistently
 * @param {string} message - Info message to display
 */
export const handleInfo = (message) => {
  toast.info(message);
};

/**
 * Handle warning messages consistently
 * @param {string} message - Warning message to display
 */
export const handleWarning = (message) => {
  toast.warning(message);
};

/**
 * Utility to safely extract error message for logging
 * @param {any} error - Error object or message
 * @returns {string} - Extracted error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Unknown error occurred';
};

export default {
  handleError,
  handleApiError,
  handleSuccess,
  handleInfo,
  handleWarning,
  getErrorMessage,
  USER_MESSAGES,
};
