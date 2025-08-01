import React, { useState, Fragment } from "react";
import { Handle, Position } from "reactflow";
import {
  Trash2,
  Copy,
  MousePointerClick,
  Video,
  List,
  Box,
  Boxes,
  LayoutTemplate,
  Image,
  FileText,
  Plus,
  X,
} from "lucide-react";

// Define content types for the dropdown
const contentTypes = [
  { id: "text", label: "Text", icon: <FileText size={18} /> },
  { id: "image", label: "Image", icon: <Image size={18} /> },
  { id: "video", label: "Video", icon: <Video size={18} /> },
  { id: "list", label: "List", icon: <List size={18} /> },
  { id: "product", label: "Product", icon: <Box size={18} /> },
  { id: "products", label: "Products", icon: <Boxes size={18} /> },
  { id: "template", label: "Template", icon: <LayoutTemplate size={18} /> },
];

// Placeholder components for different content types
const contentComponents = {
  text: ({ data }) => (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="text-sm">{data?.text || "Text content"}</p>
    </div>
  ),
  image: ({ data }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <img 
        src={data?.url || "https://via.placeholder.com/300x150"} 
        alt="Content preview"
        className="w-full h-auto"
      />
    </div>
  ),
  video: ({ data }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <video 
        src={data?.url || "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"}
        controls
        className="w-full h-auto"
      />
    </div>
  ),
  list: ({ data }) => (
    <div className="border border-gray-200 rounded-lg p-3">
      <h4 className="font-medium mb-2">List Content</h4>
      <ul className="list-disc pl-5 space-y-1">
        {data?.items?.map((item, i) => (
          <li key={i} className="text-sm">{item}</li>
        )) || <li className="text-sm text-gray-400">No items</li>}
      </ul>
    </div>
  ),
  product: ({ data }) => (
    <div className="border border-gray-200 rounded-lg p-3">
      <h4 className="font-medium">Product</h4>
      <p className="text-sm text-gray-600">{data?.name || "Product name"}</p>
    </div>
  ),
  products: ({ data }) => (
    <div className="border border-gray-200 rounded-lg p-3">
      <h4 className="font-medium">Products</h4>
      <p className="text-sm text-gray-600">{data?.count || 0} products</p>
    </div>
  ),
  template: ({ data }) => (
    <div className="border border-gray-200 rounded-lg p-3">
      <h4 className="font-medium">Template</h4>
      <p className="text-sm text-gray-600">{data?.name || "Template name"}</p>
    </div>
  ),
};

const MediaButtonPreview = ({ data, isConnectable }) => {
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({
    mediaType: "",
    mediaUrl: "",
    caption: "",
    buttons: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleContentSelect = (contentType) => {
    setSelectedContent(contentType);
    setShowContentMenu(false);

    // Add the new content to the contents array with default data
    const newContent = {
      id: `content-${Date.now()}`,
      type: contentType,
      data: {
        // Default data for each content type
        text: "",
        buttons: [],
        // Add other default properties as needed
      },
    };

    setContents([...contents, newContent]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addButton = () => {
    if (formData.buttons.length >= 3) return;

    setFormData((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          id: `btn-${Date.now()}`,
          text: "",
          isSelected: false,
          charCount: 0,
          isError: false,
        },
      ],
    }));
  };

  const handleTextChange = (id, text) => {
    const charCount = text.length;
    updateButton(id, {
      text,
      charCount,
      isError: charCount > 20,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Create a local URL for preview
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
    }
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
    if (file) {
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
    }
  };

  const handleBrowseClick = () => {
    document.getElementById("file-upload").click();
  };

  const removeButton = (id) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((btn) => btn.id !== id),
    }));
  };

  const updateButton = (id, updates) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.map((btn) =>
        btn.id === id ? { ...btn, ...updates } : btn
      ),
    }));
  };

  const selectButton = (id) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.map((btn) => ({
        ...btn,
        isSelected: btn.id === id,
      })),
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
              isError: charCount > 20,
            }
          : btn
      ),
    }));
  };

  return (
      <div className="space-y-4">
        {/* Media Button Form */}
        <div className="border-2 border-red-300 rounded-lg p-4 space-y-4">
        <div>
          <select
            name="mediaType"
            value={formData.mediaType}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          >
            <option value="">Select Media Type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select media type you want.
          </p>
        </div>

        <div>
          <input
            type="text"
            name="mediaUrl"
            value={formData.mediaUrl}
            onChange={handleInputChange}
            placeholder="Enter or Paste URL"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter media URL here.
          </p>
        </div>

        <div
          className={`w-full border-2 border-dashed ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } rounded-lg p-6 text-center transition-colors`}
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
                  alt="Uploaded preview"
                  className="max-h-32 max-w-full mb-2 rounded"
                />
              )}
              {formData.mediaType === "video" && (
                <video
                  src={formData.mediaUrl}
                  controls
                  className="max-h-32 max-w-full mb-2 rounded"
                />
              )}
              <p className="text-sm text-gray-700 truncate max-w-full">
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
                className="mt-2 text-red-500 text-xs hover:text-red-700"
              >
                Remove file
              </button>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Upload a file
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, MP4 up to 10MB
              </p>
            </>
          )}
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept="image/*,video/*"
          />
        </div>

        <div>
          <input
            type="text"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            placeholder="Enter Caption"
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter caption text here.
          </p>
        </div>

        {/* Buttons with right-side handles */}
        <div className="space-y-3">
          {formData.buttons.map((button) => (
            <div key={button.id} className="space-y-1 relative">
              <div className="flex items-center gap-2 pr-6">
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) =>
                    handleButtonTextChange(button.id, e.target.value)
                  }
                  placeholder="Button text"
                  className={`w-full border ${
                    button.isError ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  maxLength={20}
                />
                <button
                  onClick={() => removeButton(button.id)}
                  className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>

                {/* Right-side source handle per button */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`btn-${button.id}`}
                  isConnectable={isConnectable}
                  style={{
                    background: "white",
                    border: "2px solid rgb(7, 141, 238)",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    position: "absolute",
                    right: 0,
                    top: "25%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
              <p
                className={`text-xs pl-6 ${
                  button.isError ? "text-red-500" : "text-gray-400"
                }`}
              >
                Enter button text here, {button.charCount}/20 characters allowed
              </p>
            </div>
          ))}
        </div>

        {/* Add Button */}
        {formData.buttons.length < 3 && (
          <button
            type="button"
            onClick={addButton}
            className="w-full flex items-center justify-center gap-2 text-blue-500 border border-blue-500 rounded-lg py-2 hover:bg-blue-50 transition-colors text-sm font-medium mt-2"
          >
            <span className="text-xl">+</span> Add Button
          </button>
        )}
      </div>

      {/* Added Contents List */}
      {contents.length > 0 && (
        <div className="mt-4 space-y-4">
          {contents.map((content) => {
            const ContentComponent = contentComponents[content.type];

            return (
              <div key={content.id} className="relative">
                {ContentComponent ? (
                  <div className="relative">
                    <ContentComponent
                      data={content.data}
                      isConnectable={false}
                    />
                    <button
                      onClick={() =>
                        setContents(
                          contents.filter((c) => c.id !== content.id)
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      style={{
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {content.type} (No component available)
                      </span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          setContents(
                            contents.filter((c) => c.id !== content.id)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaButtonPreview;