import { toast } from "react-toastify";

// Default toast configuration
export const defaultToastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light",
};

// ===== Generic Toast Helpers =====

// Success
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, { ...defaultToastConfig, ...options });
};

// Error (defaults to 5s autoClose but can be overridden)
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    ...defaultToastConfig,
    autoClose: options.autoClose ?? 5000,
    ...options,
  });
};

// Info
export const showInfoToast = (message, options = {}) => {
  toast.info(message, { ...defaultToastConfig, ...options });
};

// Warning
export const showWarningToast = (message, options = {}) => {
  toast.warn(message, { ...defaultToastConfig, ...options });
};

// ===== Config Factory =====
export const createToastConfig = (
  autoClose = 3000,
  position = "top-right"
) => ({
  ...defaultToastConfig,
  autoClose,
  position,
});

// ===== Common Reusable Toasts =====
export const showPermissionDeniedToast = (action = "perform this action") => {
  showErrorToast(`You do not have permission to ${action}.`);
};

export const showBulkDeleteSuccessToast = (count, itemType = "item") => {
  const message = `${count} ${itemType}${count > 1 ? "s" : ""} deleted successfully!`;
  showSuccessToast(message);
};

// Reusable entity success factory
const createEntityToast = (action, itemType = "item") => {
  showSuccessToast(`${itemType} ${action} successfully!`);
};

export const showCreateSuccessToast = (itemType) =>
  createEntityToast("created", itemType);

export const showUpdateSuccessToast = (itemType) =>
  createEntityToast("updated", itemType);

export const showDeleteSuccessToast = (itemType) =>
  createEntityToast("deleted", itemType);
