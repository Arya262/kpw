import React from "react";

const ExitConfirmationDialog = ({
  open,
  hasUnsavedChanges,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-[60] transition-opacity duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-[#00BBA7]"
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
          <h3 className="text-lg font-semibold text-gray-800">
            Exit Confirmation
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          {hasUnsavedChanges
            ? "You have unsaved changes. Are you sure you want to exit?"
            : "Are you sure you want to exit?"}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none  font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#0AA89E] text-white rounded-md hover:bg-[#00BBA7] transition-colors duration-200 focus:outline-none  font-medium cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationDialog;