import { useState, useRef, useCallback } from "react";
import { Pencil, Upload } from "lucide-react";
import { Switch, Tooltip } from "@mui/material";

const Header = ({
  title = "Untitled",
  onTitleChange,
  onSave,
  isEnabled = true,
  onEnabledChange,
  isSaving = false,
  onImport,
  isEditingFlow = false
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localTitle, isEnabled);
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white">
      <div className="flex items-center gap-2">
        {isEditingTitle ? (
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress}
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
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default Header;
