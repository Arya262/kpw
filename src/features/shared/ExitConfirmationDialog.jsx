import React, { useRef, useEffect } from "react";

const ExitConfirmationDialog = ({
  showDialog,
  onCancel,
  onConfirm,
  title = "Exit Confirmation",
  message = "Are you sure you want to exit?",
  hasUnsavedChanges = false,
  confirmButtonText = "OK",
  cancelButtonText = "Cancel"
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!showDialog) return null;

  const displayMessage = hasUnsavedChanges
    ? "You have unsaved changes. Are you sure you want to exit?"
    : message;

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 transition-opacity duration-300"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        tabIndex="-1"
      >
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
            {title}
          </h3>
        </div>
        <p id="dialog-message" className="text-gray-600 mb-6">
          {displayMessage}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            aria-label={cancelButtonText}
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 w-[70px] bg-[#0AA89E] text-white rounded-md hover:bg-[#0AA89E] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            aria-label={confirmButtonText}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationDialog;
