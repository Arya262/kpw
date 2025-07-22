import React, { useRef, useEffect } from "react";

export default function DeleteConfirmationDialog({
  showDialog,
  title,
  message,
  onCancel,
  onConfirm,
  isDeleting
}) {
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

  return (
    <div
      className="fixed inset-0 bg-[#4a4a4a]/90 flex items-center justify-center z-[60]"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-message"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-orange-500"
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
          <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
        </div>
        <p id="delete-dialog-message" className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 font-medium cursor-pointer"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isDeleting}
            className="px-4 py-2 bg-[#FB2C36] text-white rounded-md hover:bg-[#FB2C36] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FB2C36] disabled:opacity-50 font-medium flex items-center justify-center cursor-pointer"
            aria-label="Confirm"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin "></div>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 