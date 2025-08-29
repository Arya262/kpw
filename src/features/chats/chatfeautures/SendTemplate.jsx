import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../../config/api";

const SendTemplate = ({ onSelect, onClose, returnFullTemplate = false }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [dynamicFields, setDynamicFields] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user?.customer_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data.templates)) {
          const approvedTemplates = data.templates.filter(
            (t) => t.status?.toLowerCase() === "approved"
          );
          console.log("Fetched templates:", approvedTemplates);
          setTemplates(approvedTemplates);
          setFilteredTemplates(approvedTemplates);
        } else {
          setError("Unexpected response format from server.");
        }
      } catch (err) {
        setError(
          `Failed to load templates. Please try again. Error: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [user?.customer_id]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (searchTerm.trim() === "") {
        setFilteredTemplates(templates);
      } else {
        const lowerTerm = searchTerm.toLowerCase();
        setFilteredTemplates(
          templates.filter((template) =>
            template.element_name?.toLowerCase().includes(lowerTerm)
          )
        );
      }
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchTerm, templates]);

  // Extract dynamic fields from template content (e.g., {{1}}, {{2}})
  const extractDynamicFields = (template) => {
    const content = template.container_meta?.data || "";
    const templateType = template.template_type;
    const fieldRegex = /\{\{(\d+)\}\}/g;
    const fields = new Set();
    let match;

    // Extract numeric placeholders
    while ((match = fieldRegex.exec(content)) !== null) {
      fields.add(match[1]);
    }

    const fieldArray = Array.from(fields).map((num) => ({
      placeholder: `{{${num}}}`,
      name: num,
      label: `Field ${num}`,
      templateType: templateType,
    }));

    // Add media field if templateType is IMAGE, VIDEO, DOCUMENT
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

  const uploadToCloudinary = async (file, folder = "test-uploads") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "dynamic-templates");
    formData.append("folder", "dynamic-templates"); // optional

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dv20lztwm/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url; // ✅ Public URL
  };

  const handleTemplateClick = (template) => {
    if (onSelect) {
      const dynamicFields = extractDynamicFields(template);
      if (dynamicFields.length > 0) {
        const fields = {};
        dynamicFields.forEach((field) => {
          // For media fields, we'll handle them specially
          if (field.type === "media") {
            fields.headerType = field.templateType.toLowerCase();
            fields.headerValue = ""; // This will be set after upload
          } else {
            fields[field.placeholder] = "";
          }
        });
        setDynamicFields(fields);
        setPreviewTemplate({
          ...template,
          dynamicFields: dynamicFields,
        });
      } else {
        onSelect(returnFullTemplate ? template : template.element_name);
      }
    }
  };

  const handleMediaUpload = async (file, templateType) => {
    try {
      const mediaUrl = await uploadToCloudinary(file);
      setDynamicFields((prev) => ({
        ...prev,
        headerType: templateType.toLowerCase(),
        headerValue: mediaUrl,
      }));
      return mediaUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  };

  const handleSendTemplate = () => {
    if (!previewTemplate) return;

    // Extract regular parameters (non-media fields)
    const parameters = [];
    const dynamicFieldsCopy = { ...dynamicFields };

    // Remove headerType and headerValue from dynamic fields
    const { headerType, headerValue, ...restFields } = dynamicFieldsCopy;

    // Add remaining fields to parameters array
    Object.values(restFields).forEach((value) => {
      if (value) parameters.push(value);
    });

    // Prepare the template data with correct structure
    const templateData = {
      ...previewTemplate,
      headerType: headerType || undefined,
      headerValue: headerValue || undefined,
      parameters: parameters.length > 0 ? parameters : undefined,
    };
    console.log("Sending template data:", templateData);
    // If it's a media template, ensure headerType and headerValue are set
    const isMediaTemplate = ["image", "video", "document"].includes(headerType);
    if (isMediaTemplate && headerValue) {
      templateData.headerType = headerType;
      templateData.headerValue = headerValue;
    }

    onSelect(returnFullTemplate ? templateData : templateData.element_name);
  };

  const handlePreviewClick = (template, e) => {
    e.stopPropagation();
    const dynamicFields = extractDynamicFields(template);
    if (dynamicFields.length > 0) {
      const fields = {};
      dynamicFields.forEach((field) => {
        fields[field.placeholder] = "";
      });
      setDynamicFields(fields);
      setPreviewTemplate({
        ...template,
        dynamicFields: dynamicFields,
      });
    } else {
      setPreviewTemplate(template);
    }
  };

  return (
    <div
      className="w-full max-w-3xl p-4 bg-white relative "
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer bg-gray-100"
        aria-label="Close template selection modal"
      >
        ×
      </button>
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">
        Choose a Template
      </h2>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      <input
        type="text"
        placeholder="Search templates by name..."
        className="mb-4 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 h-10 rounded"
            ></div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden scroll-hiden">
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-white text-gray-700 sticky top-0 z-10 shadow">
                <tr>
                  <th className="px-4 py-3">Status / Created At</th>
                  <th className="px-4 py-3">Template Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-gray-400">
                      No templates found.
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`${
                            template.status?.toLowerCase() === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          } text-xs font-medium px-2 py-1 rounded`}
                        >
                          {template.status || "N/A"}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.created_on
                            ? new Date(
                                Number(template.created_on)
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {template.element_name || "Unnamed"}
                      </td>
                      <td className="px-4 py-4">
                        {template.template_type || "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => handlePreviewClick(template, e)}
                          className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-3 py-2 rounded cursor-pointer"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-[#000]/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl relative p-6">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-2xl font-bold"
              aria-label="Close preview modal"
            >
              <span aria-hidden="true">×</span>
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              Template Preview
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Left Column: Input Fields */}
              <div className="flex-1 text-gray-800   text-sm">
                {previewTemplate.dynamicFields?.length > 0 ? (
                  <div className="space-y-3">
                    {previewTemplate.dynamicFields?.map((field, index) => (
                      <div key={index} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {field.label || field.name}:
                        </label>
                        {field.type === "image" ||
                        field.type === "document" ||
                        field.type === "video" ? (
                          <div className="space-y-2">
                            {/* File Upload */}
                            <input
                              type="file"
                              accept={
                                field.type === "image"
                                  ? "image/*"
                                  : field.type === "video"
                                  ? "video/*"
                                  : ".pdf,.doc,.docx"
                              }
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  try {
                                    const url = await handleMediaUpload(
                                      file,
                                      field.type
                                    );
                                    setDynamicFields((prev) => ({
                                      ...prev,
                                      [field.placeholder]: url,
                                      headerType: field.type,
                                      headerValue: url,
                                    }));
                                  } catch (error) {
                                    console.error(
                                      "Error uploading media:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to upload media. Please try again."
                                    );
                                  }
                                }
                              }}
                              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                            />

                            <div className="text-center text-gray-400">OR</div>

                            {/* Direct URL Input */}
                            <input
                              type="url"
                              placeholder="Enter public media link"
                              value={dynamicFields[field.placeholder] || ""}
                              onChange={(e) => {
                                const url = e.target.value;
                                setDynamicFields((prev) => ({
                                  ...prev,
                                  [field.placeholder]: url,
                                  headerType: field.type,
                                  headerValue: url,
                                }));
                              }}
                              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                            />

                            {/* Preview */}
                            {dynamicFields[field.placeholder] && (
                              <div className="mt-2">
                                {field.type === "image" ? (
                                  <img
                                    src={dynamicFields[field.placeholder]}
                                    alt="Preview"
                                    className="max-h-40 rounded"
                                  />
                                ) : field.type === "video" ? (
                                  <video
                                    src={dynamicFields[field.placeholder]}
                                    controls
                                    className="max-h-40 rounded"
                                  />
                                ) : (
                                  <a
                                    href={dynamicFields[field.placeholder]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-sm"
                                  >
                                    View Document
                                  </a>
                                )}
                              </div>
                            )}
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
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        )}
                      </div>
                    ))}
                    <button
                      disabled={Object.values(dynamicFields).some((value) => {
                        if (typeof value === "string") {
                          return !value.trim();
                        }
                        if (value instanceof File) {
                          return false;
                        }
                        return true;
                      })}
                      onClick={() => {
                        let finalTemplate = { ...previewTemplate };
                        let message =
                          previewTemplate.container_meta?.data || "";
                        Object.entries(dynamicFields).forEach(
                          ([placeholder, value]) => {
                            message = message.replace(
                              new RegExp(
                                placeholder.replace(
                                  /[.*+?^${}()|[\]\\]/g,
                                  "\\$&"
                                ),
                                "g"
                              ),
                              value instanceof File ? value.name : value
                            );
                          }
                        );
                        const dynamicFieldsWithValues =
                          previewTemplate.dynamicFields.map((field) => ({
                            ...field,
                            value: dynamicFields[field.placeholder] || "",
                          }));
                        finalTemplate = {
                          ...finalTemplate,
                          container_meta: {
                            ...finalTemplate.container_meta,
                            data: message,
                          },
                          dynamicFields: dynamicFieldsWithValues,
                        };
                        onSelect(finalTemplate);
                        setPreviewTemplate(null);
                      }}
                      className={`w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                        Object.values(dynamicFields).some((value) => {
                          if (typeof value === "string") {
                            return !value.trim();
                          }
                          if (value instanceof File) {
                            return false;
                          }
                          return true;
                        })
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Send with Customized Text
                    </button>
                  </div>
                ) : (
                  <pre className="bg-gray-100 text-gray-800 rounded p-3 whitespace-pre-wrap text-sm border border-gray-200 min-h-[50px]">
                    {previewTemplate.container_meta?.data ||
                      "No template content available"}
                  </pre>
                )}
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-[2rem] shadow-xl w-full max-w-[320px] h-[75vh] max-h-[650px] flex flex-col overflow-hidden border-[6px] border-gray-200">
                  {/* Top bar */}
                  <div className="bg-[#075E54] h-12 flex items-center px-4 text-white font-semibold"></div>
                  <div
                    className="flex-1 p-3 overflow-auto scrollbar-hide"
                    style={{
                      backgroundImage: `url('/light.png')`,
                      backgroundSize: "cover",
                    }}
                  >
                    <div className="bg-white rounded-lg p-3 text-sm shadow mb-2 max-w-[85%]">
                      {/* Header */}
                      {previewTemplate.container_meta?.header && (
                        <div className="font-bold mb-1">
                          {previewTemplate.container_meta.header}
                        </div>
                      )}

                      {/* Media Preview */}
                      {previewTemplate.template_type !== "Text" &&
                        dynamicFields["media"] && (
                          <div className="mb-2">
                            {previewTemplate.template_type === "IMAGE" &&
                              dynamicFields["media"] && (
                                <img
                                  src={dynamicFields["media"]}
                                  alt="Preview"
                                  className="max-w-full max-h-[300px] object-contain rounded-lg"
                                />
                              )}

                            {previewTemplate.template_type === "VIDEO" &&
                              dynamicFields["media"] && (
                                <video
                                  src={dynamicFields["media"]}
                                  controls
                                  className="max-w-full max-h-[300px] object-contain rounded-lg"
                                />
                              )}

                            {previewTemplate.template_type === "DOCUMENT" &&
                              dynamicFields["media"] && (
                                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                                  <a
                                    href={dynamicFields["media"]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-sm"
                                  >
                                    View Document
                                  </a>
                                </div>
                              )}
                          </div>
                        )}

                      {/* Message Text with Placeholder Replacement */}
                      <div className="whitespace-pre-wrap break-words mb-1">
                        {(() => {
                          let message =
                            previewTemplate.container_meta?.data || "";
                          Object.entries(dynamicFields).forEach(
                            ([placeholder, value]) => {
                              const displayValue =
                                value instanceof File ? value.name : value;
                              message = message.replace(
                                new RegExp(
                                  placeholder.replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    "\\$&"
                                  ),
                                  "g"
                                ),
                                displayValue || placeholder
                              );
                            }
                          );
                          return message;
                        })()}
                      </div>

                      {/* Footer */}
                      {previewTemplate.container_meta?.footer && (
                        <div className="text-xs text-gray-600 mb-2">
                          {previewTemplate.container_meta.footer}
                        </div>
                      )}

                      {/* Quick Replies */}
                      {previewTemplate.container_meta?.quickReplies?.length >
                        0 && (
                        <div className="flex flex-col border-t border-b border-gray-200">
                          {previewTemplate.container_meta.quickReplies.map(
                            (reply, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50"
                              >
                                {reply}
                              </button>
                            )
                          )}
                        </div>
                      )}

                      {/* URL CTAs + Offer Code + Phone CTA */}
                      {(previewTemplate.container_meta?.urlCtas?.length > 0 ||
                        previewTemplate.container_meta?.offerCode ||
                        previewTemplate.container_meta?.phoneCta?.title) && (
                        <div className="bg-white border-t border-b border-gray-200 mt-2">
                          {/* Offer Code */}
                          {previewTemplate.container_meta?.offerCode && (
                            <button
                              type="button"
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  previewTemplate.container_meta.offerCode
                                )
                              }
                            >
                              {previewTemplate.container_meta.offerCode}
                            </button>
                          )}
                          {/* URL CTAs */}
                          {previewTemplate.container_meta?.urlCtas?.map(
                            (cta, idx) => (
                              <a
                                key={idx}
                                href={cta.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50"
                              >
                                {cta.title}
                              </a>
                            )
                          )}
                          {/* Phone CTA */}
                          {previewTemplate.container_meta?.phoneCta?.title && (
                            <a
                              href={`tel:${previewTemplate.container_meta.phoneCta.number}`}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50"
                            >
                              {previewTemplate.container_meta.phoneCta.title}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom input mock */}
                  <div className="h-12 bg-gray-100 flex items-center px-3 gap-2 border-t border-gray-200">
                    <span className="text-gray-500">😊</span>
                    <input
                      type="text"
                      placeholder="Type a message"
                      readOnly
                      className="flex-1 bg-white rounded-full px-3 py-1 text-sm outline-none border border-gray-300 cursor-default"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendTemplate;
