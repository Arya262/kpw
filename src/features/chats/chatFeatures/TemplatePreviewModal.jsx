import { useState, useEffect } from "react";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const TemplatePreviewModal = ({ template, onClose, onSelect, returnFullTemplate, user }) => {
  const [dynamicFields, setDynamicFields] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [extractedFields, setExtractedFields] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fields = extractDynamicFields(template);
    setExtractedFields(fields);
    
    const initialFields = {};
    fields.forEach((field) => {
      initialFields[field.placeholder] = "";
      if (field.type === "media") {
        initialFields.headerType = field.templateType.toLowerCase();
        initialFields.headerValue = "";
        initialFields.headerIsId = true;
      }
    });
    setDynamicFields(initialFields);
  }, [template]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (isFormValid() && !uploading) {
          handleSendTemplate();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, uploading, dynamicFields]);

  const extractDynamicFields = (template) => {
    const content = template.container_meta?.data || "";
    const templateType = template.template_type?.toUpperCase() || "";
    const fieldRegex = /\{\{(\d+)\}\}/g;
    const fields = new Set();
    let match;

    while ((match = fieldRegex.exec(content)) !== null) {
      fields.add(match[1]);
    }

    const fieldArray = Array.from(fields).map((num) => ({
      placeholder: `{{${num}}}`,
      name: num,
      label: `Field ${num}`,
      templateType: templateType,
      type: "text",
    }));

    if (["IMAGE", "VIDEO", "DOCUMENT"].includes(templateType)) {
      fieldArray.push({
        placeholder: "media",
        name: "media",
        label: `${templateType} Upload`,
        type: templateType.toLowerCase(),
        templateType: templateType,
      });
    }

    return fieldArray;
  };

  const validateFile = (file, fileType) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }

    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (validTypes[fileType] && !validTypes[fileType].includes(file.type)) {
      toast.error(`Invalid file type for ${fileType}`);
      return false;
    }

    return true;
  };

  const uploadToBackend = async (file) => {
    if (!user?.customer_id) {
      throw new Error("User authentication required.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customer_id", user.customer_id);
    formData.append("fileType", file.type);

    try {
      const response = await axios.post(API_ENDPOINTS.CHAT.SEND_MEDIA, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload media.");
      }

      return {
        mediaId: response.data.mediaId,
        fileName: response.data.fileName,
      };
    } catch (error) {
      console.error("Error uploading to backend:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Failed to upload media.");
    } finally {
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (file, field) => {
    if (!validateFile(file, field.type)) {
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const { mediaId, fileName } = await uploadToBackend(file);
      setDynamicFields((prev) => ({
        ...prev,
        headerType: field.type,
        headerValue: mediaId,
        headerIsId: true,
        media: mediaId,
        fileName: fileName || file.name,
        [field.placeholder]: mediaId,
      }));
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error(error.message || "Failed to upload media. Please try again.");
      setSelectedFile(null);
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file, field);
    }
  };

  const handleSendTemplate = () => {
    const parameters = [];
    const { headerType, headerValue, headerIsId, fileName, ...restFields } = dynamicFields;

    let finalHeaderType = headerType;
    let finalHeaderValue = headerValue;
    let finalHeaderIsId = headerIsId;

    // Handle media field
    if (restFields["media"] && ["IMAGE", "VIDEO", "DOCUMENT"].includes(template.template_type?.toUpperCase())) {
      finalHeaderType = template.template_type.toLowerCase();
      finalHeaderValue = restFields["media"];
      finalHeaderIsId = !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(restFields["media"]);
    }

    // Add non-media fields to parameters
    Object.entries(restFields).forEach(([key, value]) => {
      if (key !== "media" && value && value.trim()) {
        parameters.push(value.trim());
      }
    });

    // Validate parameter count
    const expectedParamCount = (template.container_meta?.data?.match(/\{\{\d+\}\}/g) || []).length;
    if (parameters.length !== expectedParamCount) {
      toast.error(`Template requires exactly ${expectedParamCount} parameters, but ${parameters.length} provided.`);
      return;
    }

    // Validate header requirement
    const requiresHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(template.template_type?.toUpperCase());
    if (requiresHeader && !finalHeaderValue) {
      toast.error(`Template ${template.element_name} requires a media header.`);
      return;
    }

    const templateData = {
      templateId: template.id,
      template_name: template.element_name || template.name,
      element_name: template.element_name || template.name,
      templateType: template.template_type?.toUpperCase(),
      category: template.category,
      headerType: finalHeaderType,
      headerValue: finalHeaderValue,
      headerIsId: finalHeaderIsId,
      fileName: fileName,
      parameters: parameters,
      language_code: template.language || "en",
      template_body: template.container_meta?.data || "",
      headerText: template.container_meta?.header || null,
      footerText: template.container_meta?.footer || null,
      buttons: template.container_meta?.buttons || [],
    };

    onSelect(returnFullTemplate ? templateData : templateData.element_name);
  };

  const isFormValid = () => {
    return extractedFields.every((field) => {
      const value = dynamicFields[field.placeholder];
      return value && value.trim();
    });
  };

  const renderPreviewContent = () => {
    let message = template.container_meta?.data || "";
    Object.entries(dynamicFields).forEach(([placeholder, value]) => {
      const displayValue = value instanceof File ? value.name : value;
      message = message.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), displayValue || placeholder);
    });
    return message;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#0AA89E] to-[#099086] flex-shrink-0">
          <h3 className="text-xl font-semibold text-white">Template Preview</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Fields */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">Fill Template Fields</h4>
              
              {extractedFields.length > 0 ? (
                extractedFields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    
                    {field.type === "image" || field.type === "video" || field.type === "document" ? (
                      <div className="space-y-3">
                        {/* File Upload with Drag & Drop */}
                        <div
                          className={`border-2 border-dashed rounded-xl p-4 transition-all ${
                            isDragging
                              ? "border-[#0AA89E] bg-[#0AA89E]/5"
                              : "border-gray-300 hover:border-[#0AA89E]"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, field)}
                        >
                          <label className="flex flex-col items-center cursor-pointer">
                            <Upload className={`w-8 h-8 mb-2 ${isDragging ? "text-[#0AA89E]" : "text-gray-400"}`} />
                            <span className="text-sm text-gray-600 mb-1 text-center">
                              {isDragging ? "Drop file here" : `Click or drag to upload ${field.type}`}
                            </span>
                            <span className="text-xs text-gray-400">Max size: 10MB</span>
                            <input
                              type="file"
                              accept={
                                field.type === "image" ? "image/*" :
                                field.type === "video" ? "video/*" :
                                ".pdf,.doc,.docx"
                              }
                              disabled={uploading}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleFileSelect(file, field);
                              }}
                              className="hidden"
                            />
                          </label>
                          
                          {/* Upload Progress Bar */}
                          {uploading && uploadProgress > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-[#0AA89E] h-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* OR Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">OR</span>
                          </div>
                        </div>

                        {/* URL Input */}
                        <input
                          type="text"
                          placeholder={`Enter ${field.type} URL or media ID`}
                          value={dynamicFields[field.placeholder] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const isUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value);
                            
                            if (value && selectedFile) {
                              setSelectedFile(null);
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                                setPreviewUrl("");
                              }
                            }
                            
                            setDynamicFields((prev) => ({
                              ...prev,
                              [field.placeholder]: value,
                              headerType: field.type,
                              headerValue: value,
                              headerIsId: !isUrl,
                            }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0AA89E] focus:border-transparent"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={dynamicFields[field.placeholder] || ""}
                        onChange={(e) => {
                          setDynamicFields((prev) => ({
                            ...prev,
                            [field.placeholder]: e.target.value,
                          }));
                        }}
                        placeholder={field.label}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0AA89E] focus:border-transparent"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No dynamic fields required for this template.</p>
              )}

              {/* Send Button */}
              <button
                disabled={uploading || !isFormValid()}
                onClick={handleSendTemplate}
                className={`w-full mt-6 py-3 px-4 rounded-xl font-medium transition-all ${
                  uploading || !isFormValid()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#0AA89E] text-white hover:bg-[#099086] shadow-lg hover:shadow-xl"
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Send Template"
                )}
              </button>
            </div>

            {/* Right: Phone Preview */}
            <div className="flex justify-center">
              <div className="rounded-[2.5rem] shadow-2xl w-full max-w-[340px] h-[650px] flex flex-col overflow-hidden border-[8px] border-gray-800 bg-gray-800">
                {/* Phone Header */}
                <div className="bg-[#075E54] h-14 flex items-center px-4 text-white font-semibold text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                  <span>Preview</span>
                </div>

                {/* Chat Background */}
                <div
                  className="flex-1 p-4 overflow-auto"
                  style={{
                    backgroundImage: `url('/light.png')`,
                    backgroundSize: "cover",
                  }}
                >
                  {/* Message Bubble with WhatsApp-style tail */}
                  <div className="flex justify-start px-2 mb-1">
                    <div className="relative" style={{ maxWidth: "85%" }}>
                      {/* WhatsApp-style curved tail */}
                      <svg 
                        className="absolute top-0 left-[-4px]" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          d="M20 0 Q10 20 0 0" 
                          fill="#ffffff"
                        />
                      </svg>

                      {/* Bubble */}
                      <div
                        className="rounded-lg shadow-sm px-3 py-2 text-sm"
                        style={{ backgroundColor: "#ffffff" }}
                      >
                        {/* Header */}
                        {template.container_meta?.header && (
                          <div className="font-bold text-gray-900 mb-2">
                            {template.container_meta.header}
                          </div>
                        )}

                    {/* Media Preview */}
                    {(selectedFile || dynamicFields["media"]) && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        {template.template_type?.toUpperCase() === "IMAGE" ? (
                          <img
                            src={previewUrl || dynamicFields["media"]}
                            alt="Preview"
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              toast.error("Failed to load image from URL");
                            }}
                          />
                        ) : template.template_type?.toUpperCase() === "VIDEO" ? (
                          <video
                            src={previewUrl || dynamicFields["media"]}
                            controls
                            className="w-full h-auto"
                            onError={() => toast.error("Failed to load video from URL")}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : template.template_type?.toUpperCase() === "DOCUMENT" ? (
                          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-500" />
                            <span className="text-sm truncate flex-1">
                              {selectedFile ? selectedFile.name : dynamicFields["media"] ? "Document Link" : "Document"}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Body */}
                    <div className="whitespace-pre-wrap break-words text-gray-800 mb-2">
                      {renderPreviewContent()}
                    </div>

                    {/* Footer */}
                    {template.container_meta?.footer && (
                      <div className="text-xs text-gray-500 mt-2">
                        {template.container_meta.footer}
                      </div>
                    )}

                        {/* Buttons */}
                        {template.container_meta?.buttons && template.container_meta.buttons.length > 0 && (
                          <div className="mt-3 space-y-1 border-t border-gray-200 pt-2">
                            {template.container_meta.buttons.map((button, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="w-full py-2 text-sm font-medium text-[#0AA89E] hover:bg-gray-50 rounded transition-colors"
                              >
                                {button.text || button}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[11px] text-gray-500">
                            {new Date().toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
