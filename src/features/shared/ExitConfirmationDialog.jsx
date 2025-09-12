import React, { useEffect, useRef } from "react";

const ConfirmationDialog = ({
  open,
  hasUnsavedChanges = false,
  onCancel,
  onConfirm,
  cancelLabel = "Cancel",
  confirmLabel = "Exit",
  closeOnBackdrop = true,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }

    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel?.();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] transition-opacity duration-300"
      onClick={closeOnBackdrop ? onCancel : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        tabIndex="-1"
        className="
          bg-white rounded-xl 
          p-4 sm:p-6 
          w-full max-w-full sm:max-w-md 
          shadow-xl transform transition-all duration-300 scale-100
          mx-4 sm:mx-0
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          
          <svg
            className="w-6 h-6 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 id="dialog-title" className="text-lg font-semibold text-gray-800">
            Exit Confirmation
          </h3>
        </div>

        {/* Message */}
        <p id="dialog-message" className="text-gray-600 mb-6">
          {hasUnsavedChanges
            ? "You have unsaved changes. Are you sure you want to exit?"
            : "Are you sure you want to exit?"}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            aria-label={cancelLabel}
            className="px-4 py-2 min-w-[80px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none font-medium cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            aria-label={confirmLabel}
            className="px-6 py-2 min-w-[80px] bg-[#0AA89E] text-white rounded-md hover:bg-[#00BBA7] transition-colors duration-200 focus:outline-none font-medium cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
