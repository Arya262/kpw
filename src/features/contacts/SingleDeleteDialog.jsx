import React, { useRef, useEffect } from "react";

export default function SingleDeleteDialog({
  showDialog,
  contactName,
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
      className="fixed inset-0 bg-[#4a4a4a]/90 flex items-center justify-center z-50 transition-opacity duration-300"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="single-delete-dialog-title"
        aria-describedby="single-delete-dialog-message"
        tabIndex="-1"
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-red-500"
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
          <h3 id="single-delete-dialog-title" className="text-lg font-semibold text-gray-800">
            Delete Confirmation
          </h3>
        </div>
        <p id="single-delete-dialog-message" className="text-gray-600 mb-6">
          Are you sure you want to delete {contactName}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 "
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-2 w-[70px] bg-red-500 text-white rounded-md  disabled:opacity-50 flex items-center justify-center"
            aria-label="Delete"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}