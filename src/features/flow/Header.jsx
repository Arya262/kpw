import { useState, useCallback } from "react";
import { Pencil, Upload, ArrowLeft, X } from "lucide-react";
import { Switch, Tooltip } from "@mui/material";

const Header = ({
  title = "Untitled",
  onTitleChange,
  onSave,
  isEnabled = true,
  onEnabledChange,
  isSaving = false,
  onImport,
  isEditingFlow = false,
  onBack,
  flowType = "inbound"
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (onImport) {
          onImport(jsonData);
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Invalid JSON file. Please check the file format.');
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  }, [onImport]);

  const triggerFileInput = useCallback(() => {
    if (!onImport) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = handleFileUpload;
    input.click();
  }, [handleFileUpload, onImport]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange) {
      onTitleChange(localTitle);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localTitle, isEnabled);
    }
  };

  const handleBackClick = () => {
    setShowDiscardDialog(true);
  };

  const handleDiscardFlow = () => {
    setShowDiscardDialog(false);
    if (onBack) {
      onBack();
    }
  };

  const handleSaveAndBack = () => {
    handleSave();
    setShowDiscardDialog(false);
    setTimeout(() => {
      if (onBack) {
        onBack();
      }
    }, 500);
  };

  return (
    <>
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {onBack && (
            <Tooltip title="Back to flows">
              <button
                onClick={handleBackClick}
                className="text-gray-600 hover:text-[#0AA89E] p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isSaving}
              >
                <ArrowLeft size={20} />
              </button>
            </Tooltip>
          )}

          {/* Title */}
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="text-lg font-semibold text-gray-800 border-b border-gray-300 outline-none"
              />
            ) : (
              <h2
                className="text-lg font-semibold text-gray-800 cursor-pointer flex items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {localTitle}
                <Pencil size={16} className="text-gray-500" />
              </h2>
            )}
            
            {/* Flow Type Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                flowType === "outbound"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {flowType === "outbound" ? "📤 Outbound" : "📥 Inbound"}
            </span>
          </div>
        </div>

      <div className="flex items-center gap-4">
        {onImport && (
          <Tooltip title="Import JSON">
            <button
              onClick={triggerFileInput}
              className="text-gray-500 hover:text-blue-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isSaving}
            >
              <Upload size={20} />
            </button>
          </Tooltip>
        )}

        <Tooltip title={isEnabled ? "Disable flow" : "Enable flow"}>
          <div>
            <Switch
              checked={isEnabled}
              onChange={(e) => onEnabledChange && onEnabledChange(e.target.checked)}
              inputProps={{
                "aria-label": "Toggle flow active state"
              }}
              disabled={isSaving}
            />
          </div>
        </Tooltip>

        <button
          className="bg-[#0AA89E] hover:bg-[#089086] text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving 
            ? (isEditingFlow ? "Updating..." : "Saving...") 
            : (isEditingFlow ? "Update Flow" : "Save Flow")
          }
        </button>
      </div>
    </div>

      {/* Discard Flow Dialog */}
      {showDiscardDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Discard Flow</h2>
              <button
                onClick={() => setShowDiscardDialog(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-600">
                If you discard this flow then all changes made by you will be lost. You can also save this flow.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowDiscardDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscardFlow}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Discard flow
              </button>
              <button
                onClick={handleSaveAndBack}
                className="px-4 py-2 bg-[#0AA89E] text-white rounded-lg hover:bg-[#089086] transition-colors font-medium"
                disabled={isSaving}
              >
                Save flow
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
