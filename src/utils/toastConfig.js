// Centralized toast configuration for the entire application
export const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Extended toast config with custom auto-close time
export const createToastConfig = (autoClose = 3000) => ({
  ...toastConfig,
  autoClose,
});
