import React, { useState, useEffect, useRef } from 'react';

const GroupNameDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [groupName, setGroupName] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    } else {
      setGroupName('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(groupName.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-dialog-title"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3
            id="group-dialog-title"
            className="text-lg font-semibold text-gray-800"
          >
            Create Group
          </h3>
        </div>
        <div className="mb-6">
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a name for the contact group:
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Group name"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && groupName.trim()) {
                handleConfirm();
              }
            }}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-2 w-[70px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!groupName.trim() || isSubmitting}
            className="px-3 py-2 w-[70px] bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 flex items-center justify-center"
            aria-label="Create"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupNameDialog;
