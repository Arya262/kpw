import { useEffect, useState } from "react";
import { Trash2, Plus, Upload } from "lucide-react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import ButtonInput from "../forms/ButtonInput";
import { nodeContainerStyle, targetHandleStyle, getSourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";
import { generateButtonId } from "../../utils/nodeUtils";

const MediaButtonNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    mediaType: "",
    mediaUrl: "",
    caption: "",
    buttons: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        mediaType: data.mediaType || "",
        mediaUrl: data.mediaUrl || "",
        caption: data.caption || "",
        buttons: (data.buttons || data.interactiveButtonsItems || []).map((btn) => ({
          id: btn.id || generateButtonId(),
          text: btn.text || btn.buttonText || "",
          charCount: (btn.text || btn.buttonText || "").length,
          isError: (btn.text || btn.buttonText || "").length > CHAR_LIMITS.BUTTON_TEXT,
          nodeResultId: btn.nodeResultId || "",
        })),
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  // Update parent when data changes
  useEffect(() => {
    if (!initialized) return;
    if (data?.updateNodeData) {
      data.updateNodeData(id, {
        mediaType: formData.mediaType,
        mediaUrl: formData.mediaUrl,
        caption: formData.caption,
        text: formData.caption,
        buttons: formData.buttons,
        interactiveButtonsItems: formData.buttons.map((btn) => ({
          id: btn.id,
          buttonText: btn.text,
          nodeResultId: btn.nodeResultId || "",
        })),
        interactiveButtonsHeader: {
          type: "Media",
          text: formData.mediaUrl,
          media: formData.mediaType,
        },
      });
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addButton = () => {
    if (formData.buttons.length >= CHAR_LIMITS.MAX_BUTTONS) return;

    setFormData((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          id: generateButtonId(),
          text: "",
          charCount: 0,
          isError: false,
          nodeResultId: "",
        },
      ],
    }));
  };

  const removeButton = (id) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((btn) => btn.id !== id),
    }));
  };

  const handleButtonTextChange = (id, text) => {
    const charCount = text.length;
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.map((btn) =>
        btn.id === id
          ? {
              ...btn,
              text,
              charCount,
              isError: charCount > CHAR_LIMITS.BUTTON_TEXT,
            }
          : btn
      ),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setUploadedFile(file);

    setFormData((prev) => ({
      ...prev,
      mediaUrl: fileUrl,
      mediaType: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "document",
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF, or MP4 files are allowed.");
      return;
    }

    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      mediaUrl: fileUrl,
      mediaType: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "document",
    }));
  };

  const handleBrowseClick = () => {
    document.getElementById(`file-upload-${id}`).click();
  };

  const getPreviewData = () => ({
    mediaUrl: formData.mediaUrl,
    mediaType: formData.mediaType,
    caption: formData.caption,
    interactiveButtonsItems: formData.buttons.map((btn) => ({
      id: btn.id,
      text: btn.text,
      buttonText: btn.text,
    })),
  });

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Media Button"
        icon="🖼️"
        subtitle="Send media with interactive buttons"
        onPreview={() => onPreviewRequest?.(id, "media-button")}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Media Upload Section */}
        <FormSection title="Media Content" icon="📸" defaultOpen={true}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Media Type</label>
            <select
              name="mediaType"
              value={formData.mediaType}
              onChange={(e) => handleInputChange("mediaType", e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
            >
              <option value="">Select media type</option>
              <option value="image">📷 Image</option>
              <option value="video">🎥 Video</option>
              <option value="document">📄 Document</option>
            </select>
          </div>

          <FormInput
            label="Media URL"
            value={formData.mediaUrl}
            onChange={(e) => handleInputChange("mediaUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
            helpText="Direct link to your media file (HTTPS required)"
          />

          {/* File Upload Area */}
          <div
            className={`w-full border-2 border-dashed ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } rounded-lg p-6 text-center transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            {uploadedFile ? (
              <div className="flex flex-col items-center">
                {formData.mediaType === "image" && (
                  <img
                    src={formData.mediaUrl}
                    alt="Preview"
                    className="max-h-32 max-w-full mb-2 rounded-lg shadow-sm"
                  />
                )}
                {formData.mediaType === "video" && (
                  <video
                    src={formData.mediaUrl}
                    controls
                    className="max-h-32 max-w-full mb-2 rounded-lg shadow-sm"
                  />
                )}
                <p className="text-sm text-gray-700 font-medium truncate max-w-full">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(uploadedFile.size / 1024)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setFormData((prev) => ({
                      ...prev,
                      mediaUrl: "",
                      mediaType: "",
                    }));
                  }}
                  className="mt-2 px-3 py-1 text-red-600 text-xs hover:bg-red-50 rounded transition-colors"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-700">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, MP4 up to 10MB</p>
              </>
            )}
            <input
              id={`file-upload-${id}`}
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
          </div>

          <FormTextarea
            label="Caption"
            value={formData.caption}
            onChange={(e) => handleInputChange("caption", e.target.value)}
            placeholder="Add a caption to your media..."
            maxLength={CHAR_LIMITS.CAPTION}
            rows={2}
            helpText="Optional text to accompany the media"
            showCounter={true}
          />
        </FormSection>

        {/* Buttons Section */}
        <FormSection 
          title="Interactive Buttons" 
          icon="🔘" 
          badge={formData.buttons.length > 0 ? formData.buttons.length : null}
          defaultOpen={true}
        >
          {formData.buttons.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">No buttons added yet</p>
              <p className="text-xs text-gray-400">Add up to {CHAR_LIMITS.MAX_BUTTONS} interactive buttons</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.buttons.map((button, index) => (
                <div key={button.id} className="relative">
                  <ButtonInput
                    button={button}
                    index={index}
                    totalButtons={formData.buttons.length}
                    onTextChange={handleButtonTextChange}
                    onRemove={removeButton}
                    isConnectable={isConnectable}
                    placeholder={`Button ${index + 1} (e.g., "View Details", "Buy Now")`}
                  />
                </div>
              ))}
            </div>
          )}

          {formData.buttons.length < CHAR_LIMITS.MAX_BUTTONS && (
            <button
              type="button"
              onClick={addButton}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed
                rounded-lg hover:bg-blue-100 hover:border-blue-300 
                transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Add Button ({formData.buttons.length}/{CHAR_LIMITS.MAX_BUTTONS})
            </button>
          )}
        </FormSection>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
      />
    </div>
  );
};

export default MediaButtonNode;
