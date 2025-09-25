import React from 'react';
import { Download } from 'lucide-react';

const ExportDialog = ({
  isOpen,
  onClose,
  exportFormat,
  onFormatChange,
  onConfirm,
  selectedCount,
  totalCount,
  isExporting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Export Contacts</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isExporting}
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-700">
            Exporting {selectedCount === 'all' ? `all ${totalCount} contacts` : `${selectedCount} selected contacts`}.
            Choose your preferred file format:
          </p>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                className="form-radio text-blue-600"
                checked={exportFormat === 'csv'}
                onChange={() => onFormatChange('csv')}
                disabled={isExporting}
              />
              <span>CSV (.csv)</span>
            </label>
            <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                className="form-radio text-blue-600"
                checked={exportFormat === 'excel'}
                onChange={() => onFormatChange('excel')}
                disabled={isExporting}
              />
              <span>Excel (.xlsx)</span>
            </label>
            <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
              <input
                type="radio"
                className="form-radio text-blue-600"
                checked={exportFormat === 'pdf'}
                onChange={() => onFormatChange('pdf')}
                disabled={isExporting}
              />
              <span>PDF (.pdf)</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isExporting}
              className={`px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 ${
                isExporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isExporting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 ${
                isExporting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download</span>
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
