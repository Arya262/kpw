import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { debounce } from "lodash";
import { API_ENDPOINTS } from "../../../config/api";
import axios from "axios";
import { toast } from "react-toastify";
import { FileText } from "lucide-react";

const SendTemplate = ({ onSelect, onClose, returnFullTemplate = false }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [dynamicFields, setDynamicFields] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: true,
    pageSize: 10,
  });

  const { user } = useAuth();
  const isFetchingRef = useRef(false);

  // Refs to keep latest state inside handleScroll
  const paginationRef = useRef(pagination);
  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(loadingMore);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchTemplates = async (page = 1, search = "") => {
    if (!user?.customer_id) {
      setError("User authentication required.");
      setLoading(false);
      return;
    }

    const isNewSearch = page === 1;
    if (isNewSearch) setLoading(true);
    else setLoadingMore(true);

    setError(null);

    try {
      // console.log("📤 Fetching:", { page, search, limit: pagination.pageSize });

      const response = await axios.get(`${API_ENDPOINTS.TEMPLATES.GET_ALL}`, {
        params: {
          customer_id: user.customer_id,
          page,
          search,
          status: "approved",
          limit: pagination.pageSize,
        },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      let { templates: fetchedTemplates, pagination: paginationData } =
        response.data;
      // console.log("📥 Response:", { response: response.data, paginationData });
      // ✅ Extra safety: filter only approved
      fetchedTemplates = Array.isArray(fetchedTemplates)
        ? fetchedTemplates.filter((t) => t.status?.toUpperCase() === "APPROVED")
        : [];

      const {
        page: currentPage = 1,
        totalPages = 1,
        limit = pagination.pageSize,
        totalRecords,
      } = paginationData || {};
      const hasMore = currentPage < totalPages;
      // console.log("📊 Pagination:", { currentPage, totalPages, hasMore, totalRecords });

      if (Array.isArray(fetchedTemplates)) {
        if (isNewSearch) {
          setTemplates(fetchedTemplates);
          setFilteredTemplates(fetchedTemplates);
        } else {
          setTemplates((prev) => [...prev, ...fetchedTemplates]);
          setFilteredTemplates((prev) => [...prev, ...fetchedTemplates]);
        }

        setPagination({ currentPage, totalPages, hasMore, pageSize: limit });
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (err) {
      console.error("Template fetch error:", err);
      setError(`Failed to load templates. Error: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const scrollContainerRef = useRef(null);

  // Handle load more button click
  const handleLoadMore = useCallback(() => {
    const { currentPage, hasMore } = paginationRef.current;
    if (hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setLoadingMore(true);

      fetchTemplates(currentPage + 1, searchTerm)
        .catch(console.error)
        .finally(() => {
          isFetchingRef.current = false;
          setLoadingMore(false);
        });
    }
  }, [searchTerm]);

  useEffect(() => {
    if (user?.customer_id) {
      fetchTemplates(1, "");
    }
  }, [user?.customer_id]);

  const debouncedSearch = useCallback(
    debounce((term) => fetchTemplates(1, term), 500),
    [user?.customer_id, pagination.pageSize]
  );

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      debouncedSearch(searchTerm);
    } else {
      // When search is cleared, fetch first page without search term
      fetchTemplates(1, "");
    }
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

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
    } else if (templateType === "TEXT") {
      const hasHeader = template.container_meta?.components?.some(
        (component) => component.type === "HEADER"
      );
      if (hasHeader) {
        fieldArray.push({
          placeholder: "header",
          name: "header",
          label: "Header Text",
          type: "text",
          templateType: templateType,
        });
      }
    }

    // console.log(
    //   "Extracted dynamic fields for template:",
    //   template.element_name,
    //   fieldArray
    // );
    return fieldArray;
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
      const response = await axios.post(
        API_ENDPOINTS.CHAT.SEND_MEDIA,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("Backend upload response:", response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload media.");
      }

      return {
        mediaId: response.data.mediaId,
        fileName: response.data.fileName,
      };
    } catch (error) {
      console.error(
        "Error uploading to backend:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload media."
      );
    }
  };

  const handleMediaUpload = async (file, templateType) => {
    setUploading(true);
    try {
      const { mediaId, fileName } = await uploadToBackend(file);
      setDynamicFields((prev) => ({
        ...prev,
        headerType: templateType.toLowerCase(),
        headerValue: mediaId,
        headerIsId: true,
        media: mediaId,
        fileName: fileName || file.name,
      }));
      return { mediaId, fileName: fileName || file.name };
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error(error.message || "Failed to upload media. Please try again.");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSendTemplate = () => {
    if (!previewTemplate) return;

    const parameters = [];
    const dynamicFieldsCopy = { ...dynamicFields };
    const { headerType, headerValue, headerIsId, fileName, ...restFields } =
      dynamicFieldsCopy;

    // console.log("Dynamic fields in handleSendTemplate:", dynamicFields);
    // console.log("Rest fields:", restFields);

    let finalHeaderType = headerType;
    let finalHeaderValue = headerValue;
    let finalHeaderIsId = headerIsId;

    // Handle media field for IMAGE, VIDEO, DOCUMENT templates
    if (
      restFields["media"] &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(
        previewTemplate.template_type?.toUpperCase()
      )
    ) {
      finalHeaderType = previewTemplate.template_type.toLowerCase();
      finalHeaderValue = restFields["media"];
      finalHeaderIsId = !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(
        restFields["media"]
      ); // Set to false for URLs
    }

    // Add non-media fields to parameters
    Object.entries(restFields).forEach(([key, value]) => {
      if (key !== "media" && value && value.trim()) {
        parameters.push(value.trim());
      }
    });

    // console.log("Parameters before validation:", parameters);
    const expectedParamCount = (
      previewTemplate.container_meta?.data?.match(/\{\{\d+\}\}/g) || []
    ).length;
    if (parameters.length !== expectedParamCount) {
      toast.error(
        `Template requires exactly ${expectedParamCount} parameters, but ${parameters.length} provided.`
      );
      return;
    }

    // Validate header requirement
    const requiresHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
      previewTemplate.template_type?.toUpperCase()
    );
    if (requiresHeader && !finalHeaderValue) {
      toast.error(
        `Template ${previewTemplate.element_name} requires a media header.`
      );
      return;
    }

    // Validate URL if provided
    if (requiresHeader && finalHeaderValue && !finalHeaderIsId) {
      if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(finalHeaderValue)) {
        toast.error("Invalid media URL provided.");
        return;
      }
    }

    // Update dynamicFields with filled values
    const filledDynamicFields = previewTemplate.dynamicFields.map((field) => ({
      ...field,
      value:
        field.placeholder === "media"
          ? finalHeaderValue
          : restFields[field.placeholder]?.trim() || "",
    }));

    const templateData = {
      templateId: previewTemplate.id,
      element_name: previewTemplate.element_name || previewTemplate.name,
      templateType: previewTemplate.template_type?.toUpperCase(),
      category: previewTemplate.category,
      headerType: finalHeaderType,
      headerValue: finalHeaderValue,
      headerIsId: finalHeaderIsId,
      fileName: fileName,
      parameters: parameters,
      language_code: previewTemplate.language || "en",
      dynamicFields: filledDynamicFields,
    };

    // console.log("Sending template data:", templateData);
    onSelect(returnFullTemplate ? templateData : templateData.element_name);
  };

  const handleTemplateClick = (template) => {
    if (onSelect) {
      const dynamicFields = extractDynamicFields(template);
      if (dynamicFields.length > 0) {
        const fields = {};
        dynamicFields.forEach((field) => {
          fields[field.placeholder] = "";
          if (field.type === "media") {
            fields.headerType = field.templateType.toLowerCase();
            fields.headerValue = "";
            fields.headerIsId = true;
          }
        });
        setDynamicFields(fields);
        setPreviewTemplate({
          ...template,
          dynamicFields: dynamicFields,
          language_code: template.language_code || "en",
        });
      } else {
        onSelect(
          returnFullTemplate
            ? {
                ...template,
                language_code: template.language_code || "en",
              }
            : template.element_name
        );
      }
    }
  };

  const handlePreviewClick = (template, e) => {
    e.stopPropagation();
    const dynamicFields = extractDynamicFields(template);
    const fields = {};
    dynamicFields.forEach((field) => {
      fields[field.placeholder] = "";
      if (field.type === "media") {
        fields.headerType = field.templateType.toLowerCase();
        fields.headerValue = "";
        fields.headerIsId = true;
      }
    });
    // Reset preview state when opening a new template
    setSelectedFile(null);
    setPreviewUrl("");
    setDynamicFields(fields);
    setPreviewTemplate({
      ...template,
      dynamicFields: dynamicFields,
      language_code: template.language_code || "en",
    });
  };

  return (
    <div role="dialog" aria-modal="true">
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
        <p id="error-message" className="text-red-500 text-sm text-center mb-4">
          {error}
        </p>
      )}

      <input
        type="text"
        placeholder="Search templates by name..."
        className="mb-4 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-describedby="error-message"/>
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
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-hide pb-4"
            style={{
              overflowAnchor: "none",
              WebkitOverflowScrolling: "touch",
              position: "relative",
            }}
          >
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
                {pagination.hasMore && (
                  <tr>
                    <td colSpan="4" className="py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          {loadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Loading...
                            </>
                          ) : (
                            "Load More Templates"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-[#000]/50 flex items-center justify-center px-4">
          <div className="bg-white w-full sm:max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-y-auto p-4 relative mx-auto my-20 rounded-lg">
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
            <div className="flex flex-col sm:flex-row gap-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
              <div className="flex-1 w-full sm:w-1/2 text-gray-800 text-sm">
                {previewTemplate.dynamicFields?.length > 0 ? (
                  <div className="space-y-3">
                    {/* {console.log("Current dynamicFields:", dynamicFields)} */}
                    {previewTemplate.dynamicFields?.map((field, index) => (
                      <div key={index} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          {field.label || field.name}:
                        </label>
                        {field.type === "image" ||
                        field.type === "video" ||
                        field.type === "document" ? (
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept={
                                  field.type === "image"
                                    ? "image/*"
                                    : field.type === "video"
                                    ? "video/*"
                                    : ".pdf,.doc,.docx"
                                }
                                disabled={uploading}
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setSelectedFile(file);
                                    setPreviewUrl(URL.createObjectURL(file));
                                    try {
                                      const { mediaId, fileName } =
                                        await handleMediaUpload(
                                          file,
                                          field.templateType
                                        );
                                      setDynamicFields((prev) => ({
                                        ...prev,
                                        [field.placeholder]: mediaId,
                                        headerType: field.type,
                                        headerValue: mediaId,
                                        headerIsId: true,
                                        fileName: fileName || file.name,
                                      }));
                                    } catch (error) {
                                      console.error(
                                        "Error uploading media:",
                                        error
                                      );
                                      setSelectedFile(null);
                                      setPreviewUrl("");
                                    }
                                  }
                                }}
                                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                              />
                              {uploading && (
                                <p className="text-sm text-gray-500">
                                  Uploading...
                                </p>
                              )}
                            </div>
                            <div className="text-center text-gray-400">OR</div>
                            <input
                              type="text"
                              placeholder={`Enter ${field.type} URL or media ID`}
                              value={dynamicFields[field.placeholder] || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                const isUrl =
                                  /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value);
                                setDynamicFields((prev) => ({
                                  ...prev,
                                  [field.placeholder]: value,
                                  headerType: field.type,
                                  headerValue: value,
                                  headerIsId: !isUrl,
                                }));
                              }}
                              className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none"
                              aria-describedby="media-input-description"
                            />
                            <p
                              id="media-input-description"
                              className="text-xs text-gray-500"
                            >
                              Enter a public URL (e.g.,
                              https://example.com/image.jpg) or a media ID.
                            </p>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={dynamicFields[field.placeholder] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // console.log(
                              //   `Updating ${field.placeholder}:`,
                              //   value
                              // );
                              setDynamicFields((prev) => ({
                                ...prev,
                                [field.placeholder]: value,
                              }));
                            }}
                            placeholder={field.label}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                    <button
                      disabled={
                        uploading ||
                        previewTemplate.dynamicFields.some(
                          (field) =>
                            !dynamicFields[field.placeholder] ||
                            !dynamicFields[field.placeholder].trim()
                        )
                      }
                      onClick={handleSendTemplate}
                      className={`w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                        uploading ||
                        previewTemplate.dynamicFields.some(
                          (field) =>
                            !dynamicFields[field.placeholder] ||
                            !dynamicFields[field.placeholder].trim()
                        )
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Send Template
                    </button>
                  </div>
                ) : (
                  <div>
                    <pre className="bg-gray-100 text-gray-800 rounded p-3 whitespace-pre-wrap text-sm border border-gray-200 min-h-[50px]">
                      {previewTemplate.container_meta?.data ||
                        "No template content available"}
                    </pre>
                    <button
                      onClick={handleSendTemplate}
                      className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Send Template
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full sm:w-1/2 flex justify-center">
                <div className="rounded-[2rem] shadow-xl w-full max-w-[320px] h-[75vh] max-h-[650px] flex flex-col overflow-hidden border-[6px] border-gray-200">
                  <div className="bg-[#075E54] h-12 flex items-center px-4 text-white font-semibold"></div>
                  <div
                    className="flex-1 p-3 overflow-auto scrollbar-hide"
                    style={{
                      backgroundImage: `url('/light.png')`,
                      backgroundSize: "cover",
                    }}
                  >
                    <div className="bg-white rounded-lg p-3 text-sm shadow mb-2 max-w-[85%]">
                      {previewTemplate.container_meta?.header && (
                        <div className="font-bold mb-1">
                          {previewTemplate.container_meta.header}
                        </div>
                      )}
                      {selectedFile && (
                        <div className="mb-2">
                          {previewTemplate.template_type?.toUpperCase() ===
                          "IMAGE" ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-48 object-contain rounded mx-auto"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : previewTemplate.template_type?.toUpperCase() ===
                            "VIDEO" ? (
                            <video
                              src={previewUrl}
                              controls
                              className="max-w-full max-h-48 object-contain rounded mx-auto"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : previewTemplate.template_type?.toUpperCase() ===
                            "DOCUMENT" ? (
                            <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <span className="text-sm truncate">
                                {selectedFile.name}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
                      {!selectedFile &&
                        ["IMAGE", "VIDEO", "DOCUMENT"].includes(
                          previewTemplate.template_type?.toUpperCase()
                        ) &&
                        dynamicFields["media"] && (
                          <div className="mb-2">
                            {/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(
                              dynamicFields["media"]
                            ) ? (
                              <>
                                {previewTemplate.template_type.toUpperCase() ===
                                  "IMAGE" && (
                                  <img
                                    src={dynamicFields["media"]}
                                    alt="Template media"
                                    className="max-w-full h-auto rounded"
                                    onError={() =>
                                      toast.error("Failed to load image URL.")
                                    }
                                  />
                                )}
                                {previewTemplate.template_type.toUpperCase() ===
                                  "VIDEO" && (
                                  <video
                                    src={dynamicFields["media"]}
                                    controls
                                    className="max-w-full h-auto rounded"
                                    onError={() =>
                                      toast.error("Failed to load video URL.")
                                    }
                                  />
                                )}
                                {previewTemplate.template_type.toUpperCase() ===
                                  "DOCUMENT" && (
                                  <a
                                    href={dynamicFields["media"]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                  >
                                    View Document
                                  </a>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-600">
                                Media ID: {dynamicFields["media"]}
                              </p>
                            )}
                          </div>
                        )}
                      <div className="whitespace-pre-wrap break-words mb-1 mt-2">
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
                      {previewTemplate.container_meta?.footer && (
                        <div className="text-xs text-gray-600 mb-2">
                          {previewTemplate.container_meta.footer}
                        </div>
                      )}
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
                      {(previewTemplate.container_meta?.urlCtas?.length > 0 ||
                        previewTemplate.container_meta?.offerCode ||
                        previewTemplate.container_meta?.phoneCta?.title) && (
                        <div className="bg-white border-t border-b border-gray-200 mt-2">
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
