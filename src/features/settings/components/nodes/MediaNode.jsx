import { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Upload, Loader2 } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";
import { uploadToCloudinary, validateFile } from "../../../../utils/cloudinaryUpload";

const MediaNode = memo(({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    mediaType: "",
    mediaUrl: "",
    caption: "",
    delay: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize from props
  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        mediaType: data.mediaType || "",
        mediaUrl: data.mediaUrl || "",
        caption: data.caption || "",
        delay: typeof data?.delay === "number" ? data.delay : "",
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
        delay: Number(formData.delay),
      });
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelayChange = useCallback((e) => {
    let value = Number(e.target.value);
    if (isNaN(value)) value = 0;
    value = Math.max(0, value);
    setFormData(prev => ({ ...prev, delay: value }));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    
    const mediaType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "document";

    setFormData((prev) => ({
      ...prev,
      mediaUrl: previewUrl,
      mediaType,
    }));

    // Upload to Cloudinary
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      console.log('✅ Cloudinary upload successful:', result);

      // Update with Cloudinary URL
      setFormData((prev) => ({
        ...prev,
        mediaUrl: result.url,
      }));

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      alert('Failed to upload file to Cloudinary. Please try again.');
      
      // Reset on error
      setUploadedFile(null);
      setFormData((prev) => ({
        ...prev,
        mediaUrl: "",
        mediaType: "",
      }));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    
    const mediaType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "document";

    setFormData((prev) => ({
      ...prev,
      mediaUrl: previewUrl,
      mediaType,
    }));

    // Upload to Cloudinary
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      console.log('✅ Cloudinary upload successful:', result);

      // Update with Cloudinary URL
      setFormData((prev) => ({
        ...prev,
        mediaUrl: result.url,
      }));

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      alert('Failed to upload file to Cloudinary. Please try again.');
      
      // Reset on error
      setUploadedFile(null);
      setFormData((prev) => ({
        ...prev,
        mediaUrl: "",
        mediaType: "",
      }));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById(`file-upload-${id}`).click();
  };

  const handlePreview = useCallback(() => {
    if (onPreviewRequest) {
      onPreviewRequest(id, 'media');
    }
  }, [onPreviewRequest, id]);

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Media Message"
        subtitle="Send media without buttons"
        onPreview={handlePreview}
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
              isDragging ? "border-blue-500 bg-blue-50" : 
              isUploading ? "border-green-500 bg-green-50" : 
              "border-gray-300"
            } rounded-lg p-6 text-center transition-all ${!isUploading && 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isUploading ? handleBrowseClick : undefined}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="mx-auto h-10 w-10 text-blue-600 mb-2 animate-spin" />
                <p className="text-sm text-blue-600 font-medium">Uploading to Cloudinary...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            ) : uploadedFile ? (
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

        {/* Delay Input */}
        <FormInput
          label="Delay (Optional)"
          type="number"
          value={formData.delay}
          onChange={handleDelayChange}
          placeholder="0"
          min="0"
          helpText="Wait time in seconds before sending this message"
        />
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
        className="hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-handle"
        isConnectable={isConnectable}
        style={sourceHandleStyle}
        className="hover:scale-125 transition-transform"
      />
    </div>
  );
});

MediaNode.displayName = 'MediaNode';

export default MediaNode;
