import React, { useMemo, useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import { TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import { FileText } from "lucide-react";
import { renderMedia } from "../../../utils/renderMedia";
import { Plus } from "lucide-react";

const TemplateSelectionStep = ({
  templates, templatesLoading, templatesError, onTemplateSelect, validationErrors, setValidationErrors, pagination, loadMoreTemplates,
  templateSearchTerm, setTemplateSearchTerm, setIsTemplateModalOpen, formData, setFormData,
  }) => {
  const approvedTemplates = useMemo(() => {
    const searchTerm = (templateSearchTerm || "").toLowerCase();
    return (templates || []).filter(
      ({
        status,
        template_type,
        element_name,
        container_meta,
        category,
        sub_category, 
      }) => {
        const isApproved = status?.toUpperCase() === "APPROVED";
        const isSupportedType = ["TEXT", "IMAGE"].includes(template_type?.toUpperCase());
        const matchesSearch =
          !searchTerm ||
          element_name?.toLowerCase().includes(searchTerm) ||
          container_meta?.sampleText?.toLowerCase().includes(searchTerm);
  
        const upperCategory = category?.trim().toUpperCase();
        const upperSubcategory = sub_category?.trim().toUpperCase();
  
        const isValidCategory =
          upperCategory !== "AUTHENTICATION" && 
          upperSubcategory === "PROMOTION";
  
        return isApproved && isSupportedType && matchesSearch && isValidCategory;
      }
    );
  }, [templates, templateSearchTerm]);
  const getTemplateParameters = (template) => {
    if (!template) return [];
  
    if (template.template_type?.toUpperCase() === 'TEXT') {
      const templateData = template.data || '';
      const dataMatches = templateData.match(/\{\{\d+\}\}/g) || [];
      const alternativeDataMatches = templateData.match(/\{\{[^{}]+\}\}/g) || [];
      const allMatches = [...new Set([...dataMatches, ...alternativeDataMatches])];
  
      return allMatches.map((placeholder) => ({
        type: 'text',
        placeholder,
        value: '',
      }));
    }
  
    else if (template.template_type?.toUpperCase() === 'IMAGE') {
      const templateData = template.data || '';
      const dataMatches = templateData.match(/\{\{\d+\}\}/g) || [];
      const alternativeDataMatches = templateData.match(/\{\{[^{}]+\}\}/g) || [];
      const allMatches = [...new Set([...dataMatches, ...alternativeDataMatches])];
  
      // Always include the image parameter
      const params = [
        {
          type: 'image',
          image: { id: '' },
        },
      ];
  
      // Add text placeholders (if any exist)
      allMatches.forEach((placeholder) => {
        params.push({
          type: 'text',
          placeholder,
          value: '',
        });
      });
  
      return params;
    }
  
    return [];
  };

  const getTemplatePlaceholders = (template) => {
    if (!template) return [];
    
    const templateData = template.data || '';
    const sampleText = template.container_meta?.sampleText || template.container_meta?.sample_text || '';
    
    const dataMatches = templateData.match(/\{\{\d+\}\}/g) || [];
    const alternativeDataMatches = templateData.match(/\{\{[^{}]+\}\}/g) || [];
    
    const allMatches = [...new Set([...dataMatches, ...alternativeDataMatches])];
    
    return allMatches;
  };

  const handleTemplateSelect = (template) => {
    setValidationErrors((prev) => ({ ...prev, template: "" }));

    // Get template parameters based on template type
    const parameters = getTemplateParameters(template);
    
    // Call the parent's onTemplateSelect first
    onTemplateSelect(template);
    
    // Update the form data with template and parameters
    const updatedData = {
      selectedTemplate: template,
      templateParameters: parameters,
    };
    
    setFormData(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  // Handle template parameter changes
  const handleParameterChange = (index, value, field = null) => {
    const newParams = [...(formData.templateParameters || [])];
  
    if (newParams[index]?.type === 'image') {
      // For image parameters, update inside the `image` object
      if (field === 'id') {
        newParams[index] = {
          ...newParams[index],
          image: { 
            ...newParams[index].image, 
            id: value,
            // Clear URL when uploading a new file
            url: '' 
          }
        };
      } else if (field === 'url') {
        newParams[index] = {
          ...newParams[index],
          image: { 
            ...newParams[index].image, 
            url: value,
            // Clear uploaded image ID when using URL
            id: '' 
          }
        };
      } else if (field === 'previewUrl') {
        newParams[index] = {
          ...newParams[index],
          image: { 
            ...newParams[index].image, 
            previewUrl: value 
          }
        };
      }
    } else {
      // ✅ For text parameters, just update `value`
      newParams[index] = {
        ...newParams[index],
        value: value
      };
    }
  
    setFormData(prev => ({
      ...prev,
      templateParameters: newParams
    }));
  };
  
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle file upload to backend
  const uploadToBackend = async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customer_id', user?.customer_id || '');
    formData.append('file_type', type);
    formData.append('is_template', 'true');
    formData.append('is_media', 'true');

    try {
      const response = await axios.post(
        API_ENDPOINTS.CHAT.SEND_MEDIA,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      // Handle the server's response format
      if (response.data && response.data.success && response.data.mediaId) {
        return {
          mediaId: response.data.mediaId,
          fileName: response.data.fileName || file.name,
        };
      }
      
      // If we get here, the response format is unexpected
      console.error('Unexpected response format:', response.data);
      throw new Error('Unexpected response format from server');
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Handle media upload
  const handleMediaUpload = async (file, type = 'image') => {
    setUploading(true);
    try {
      const { mediaId, fileName } = await uploadToBackend(file, type);
      return { mediaId, fileName };
    } catch (error) {
      console.error('Error in media upload:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      setUploading(true);
      setSelectedFile(file);
  
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
  
      const { mediaId, fileName } = await handleMediaUpload(file, 'image');
  
      setFormData(prev => {
        const newParams = [...(prev.templateParameters || [])];
  
        if (!newParams[index]) {
          newParams[index] = { type: "image", image: {} };
        }
  
        newParams[index] = {
          ...newParams[index],
          type: "image",
          image: {
            ...newParams[index].image,
            id: mediaId,          
            fileName: fileName,   
            previewUrl: preview   
          }
        };
  
        return { ...prev, templateParameters: newParams };
      });
  
    } catch (error) {
      console.error("Error uploading image:", error);
      setSelectedFile(null);
      setPreviewUrl("");
      // Optionally: toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Select Template</h3>
        <div className="w-full sm:w-64">
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search templates..."
            value={templateSearchTerm}
            onChange={(e) => setTemplateSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
            }}
            sx={{
              "& label.Mui-focused": { color: "#0AA89E" },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#0AA89E" },
              },
              "& .MuiInputBase-input": { caretColor: "#0AA89E" },
            }}
          />
        </div>
      </div>

      {/* Loading and Empty States */}
      {templatesLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      ) : approvedTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FolderOffIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {templateSearchTerm ? "No matching templates" : "No templates available"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {templateSearchTerm
              ? `No templates found matching "${templateSearchTerm}". Try a different search term or create a new template.`
              : "There are no approved templates available at the moment."}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create New Template
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedTemplates.map((template) => {
                const isSelected =
                  formData.selectedTemplate?.id === template.id ||
                  formData.selectedTemplate?.element_name === template.element_name;

                const isText = template.template_type?.toUpperCase() === "TEXT";

                return (
                  <div
                    key={template.id || template.element_name}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTemplateSelect(template);
                      }
                  }}
                  onClick={() => handleTemplateSelect(template)}
                  className={`relative bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer border transition-all duration-300 transform 
                    ${isSelected
                      ? "border-teal-500 ring-offset-1 shadow-md"
                      : "border-gray-200 hover:border-teal-300 hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                  {!isText && (
                    <div className="relative w-full h-40 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {renderMedia({
                        ...template,
                        mediaUrl: template.container_meta?.mediaUrl,
                        template_type: template.container_meta?.type,
                        element_name: template.element_name,
                      }) || (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <FileText className="w-8 h-8 mb-1" />
                          <span className="text-xs">No Preview</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-gray-800 uppercase tracking-wide shadow-sm">
                        {template.template_type}
                      </span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4 mt-2">
                    {/* Badge inside card for TEXT templates */}
                    {isText && (
                      <span className="inline-block mb-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {template.template_type}
                      </span>
                    )}

                    {/* Title + Checkmark */}
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-sm text-gray-900 truncate pr-2 group-hover:text-teal-600 transition-colors">
                        {template.element_name}
                      </h4>

                      {isSelected && (
                        <span className="flex-shrink-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <p className="text-xs font-medium text-teal-600 mb-2 uppercase tracking-wide">
                      {template.category || "Uncategorized"}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {template.container_meta?.sampleText || "No sample text available"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Parameter Inputs */}
          {formData.selectedTemplate && formData.templateParameters?.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {formData.selectedTemplate.template_type === 'IMAGE' 
                  ? 'Upload Image' 
                  : 'Fill in template variables'}
              </h4>
              <div className="space-y-3">
                {formData.templateParameters.map((param, index) => (
                  <div key={index} className="space-y-1">
                    {param.type === 'text' && (
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          {`Variable ${index + 1} (${param.placeholder})`}
                        </label>
                        <input
                          type="text"
                          value={param.value || ''}
                          onChange={(e) => handleParameterChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          placeholder={`Enter value for ${param.placeholder}`}
                          required
                        />
                      </div>
                    )}
                    
                    {param.type === 'image' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                          <label className={`flex-1 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute w-0 h-0 opacity-0"
                              disabled={uploading}
                              onChange={(e) => handleImageUpload(e, index)}
                            />
                          </label>
                          </div>
                          {/* Image Preview */}
                          {(previewUrl || param.image?.url) && (
                            <div className="mt-2">
                            <div className="relative w-32 h-32 border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                              {previewUrl || param.image?.url ? (
                                <img
                                  src={previewUrl || param.image?.url}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                  }}
                                />
                              ) : (
                                <span className="text-gray-400 text-xs text-center">No preview available</span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 text-center">
                              {selectedFile?.name || param.image?.fileName || 'Image preview'}
                            </p>
                          </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-xs text-center text-gray-400 mb-1">OR</p>
                          <input
                            type="text"
                            placeholder="Enter image URL or media ID"
                            value={param.image?.id || param.image?.url || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // If it looks like a URL, store it in url, otherwise store in id
                              if (value.startsWith('http')) {
                                handleParameterChange(index, value, 'url');
                              } else {
                                handleParameterChange(index, value, 'id');
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMoreTemplates}
                disabled={pagination.isLoadingMore}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 flex items-center"
              >
                {pagination.isLoadingMore ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Load More Templates"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSelectionStep;