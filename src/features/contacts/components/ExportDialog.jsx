import { useState } from "react";
import { Download } from 'lucide-react';

const ExportDialog = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  totalCount,
  isExporting = false
}) => {
  if (!isOpen) return null;
const [highlightCancel, setHighlightCancel] = useState(false);
  return (
    <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export Contacts</h3>
            <button
              onClick={onClose}
              disabled={isExporting}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer
              ${
                highlightCancel
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
              }`}
              aria-label="Close modal">
                <svg
                className="w-4 h-4 sm:w-5 sm:h-5 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
                </svg>
            </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-700">
            Exporting {selectedCount === 'all' ? `all ${totalCount} contacts` : `${selectedCount} selected contacts`} as CSV.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isExporting}
              className={`px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer ${
                isExporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isExporting}
              className={`px-4 py-2 bg-[#0AA89E] text-white rounded-md hover:bg-[#089A8B] flex items-center space-x-2 cursor-pointer ${
                isExporting ? 'opacity-70 cursor-not-allowed' : ''
              }`}>
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
