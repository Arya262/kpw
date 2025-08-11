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
          // const approvedTemplates = data.templates.filter(
          //   (t) => t.status?.toLowerCase() === "approved"
          // );
          // setTemplates(approvedTemplates);
          // setFilteredTemplates(approvedTemplates);
          setTemplates(data.templates);
          setFilteredTemplates(data.templates);
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
    const fieldRegex = /\{\{(\d+)\}\}/g;
    const fields = new Set();
    let match;

    while ((match = fieldRegex.exec(content)) !== null) {
      fields.add(match[1]); // Add the number inside {{}}
    }

    return Array.from(fields).map((num) => ({
      placeholder: `{{${num}}}`,
      name: num,
      label: `Field ${num}`,
    }));
  };

  const handleTemplateClick = (template) => {
    if (onSelect) {
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
        onSelect(returnFullTemplate ? template : template.element_name);
      }
    }
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
    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg sm:max-w-2xl relative p-6">
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
      <div className="bg-blue-50 text-gray-800 rounded-xl p-5 text-sm whitespace-pre-wrap leading-relaxed">
        {previewTemplate.container_meta?.header && (
          <div className="font-medium mb-2">
            {previewTemplate.container_meta.header}
          </div>
        )}
        {previewTemplate.container_meta?.mediaUrl && (
          <div className="mb-4">
            <img
              src={previewTemplate.container_meta.mediaUrl}
              alt="Template visual"
              className="w-full rounded-lg border border-gray-200 shadow-sm"
              onError={() => console.log("Failed to load media:", previewTemplate.container_meta.mediaUrl)}
            />
          </div>
        )}
        <div className="mb-2 space-y-3">
          {previewTemplate.dynamicFields?.length > 0 ? (
            <div className="space-y-3">
              {previewTemplate.dynamicFields.map((field, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {field.label || field.name}:
                  </label>
                  <input
                    type="text"
                    value={dynamicFields[field.placeholder] || ""}
                    onChange={(e) => {
                      console.log("Updating field:", field.placeholder, e.target.value);
                      setDynamicFields((prev) => ({
                        ...prev,
                        [field.placeholder]: e.target.value,
                      }));
                    }}
                    placeholder={field.label}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                  Final Message Preview:
                </h4>
                <pre className="bg-gray-100 text-gray-800 rounded p-3 whitespace-pre-wrap text-sm border border-gray-200 min-h-[50px]">
                  {(() => {
                    let message = previewTemplate.container_meta?.data || "No template content available";
                    console.log("Rendering preview with:", { message, dynamicFields });
                    Object.entries(dynamicFields).forEach(([placeholder, value]) => {
                      message = message.replace(
                        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                        value || placeholder // Fallback to placeholder if value is empty
                      );
                    });
                    return message;
                  })()}
                </pre>
              </div>
              <button
                disabled={Object.values(dynamicFields).some((value) => !value.trim())}
                onClick={() => {
                  let finalTemplate = { ...previewTemplate };
                  let message = previewTemplate.container_meta?.data || "";
                  Object.entries(dynamicFields).forEach(([placeholder, value]) => {
                    message = message.replace(
                      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                      value
                    );
                  });
                  const dynamicFieldsWithValues = previewTemplate.dynamicFields.map((field) => ({
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
                  Object.values(dynamicFields).some((value) => !value.trim())
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Send with Customized Text
              </button>
            </div>
          ) : (
            <pre className="bg-gray-100 text-gray-800 rounded p-3 whitespace-pre-wrap text-sm border border-gray-200 min-h-[50px]">
              {previewTemplate.container_meta?.data || "No template content available"}
            </pre>
          )}
        </div>
        {previewTemplate.container_meta?.footer && (
          <div className="mt-4 font-medium">
            {previewTemplate.container_meta.footer}
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SendTemplate;
