import React, { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SampleValuesSection from "./SampleValuesSection";
import QuickRepliesSection from "./QuickRepliesSection";
import CallToActionSection from "./CallToActionSection";
import OfferCodeSection from "./OfferCodeSection";
import LivePreview from "./LivePreview";
import ExitConfirmationDialog from "./ExitConfirmationDialog";
import { useAuth } from "../../context/AuthContext";

const templateSchema = z.object({
  category: z.string().min(1, "Please select a template category"),
  templateName: z
    .string()
    .min(1, "Template name is required")
    .max(50, "Template name must be 50 characters or less")
    .regex(
      /^[a-z0-9_]+$/,
      "Template name must contain only lowercase letters, numbers and underscores"
    ),
  language: z.string().min(1, "Please select a language"),
  header: z.string().max(60, "Header must be 60 characters or less").optional(),
  templateType: z.enum(["Text", "Image", "Video", "Document"], {
    required_error: "Please select a template type",
  }),
  format: z
    .string()
    .min(1, "Template format is required")
    .max(1024, "Template format must be 1024 characters or less"),
  footer: z.string().max(60, "Footer must be 60 characters or less").optional(),
  selectedAction: z.enum(["None", "Call To Actions", "Quick Replies", "All"], {
    required_error: "Please select an interactive action",
  }),
});

const TemplateModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues = {},
  mode = "add",
}) => {
  const [templateType, setTemplateType] = useState("None");
  const [header, setHeader] = useState("");
  const [format, setFormat] = useState("");
  const [footer, setFooter] = useState("");
  const [urlCtas, setUrlCtas] = useState([{ title: "", url: "" }]);
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("MARKETING");
  const [language, setLanguage] = useState("en_US");
  const [phoneCta, setPhoneCta] = useState({
    title: "",
    country: "",
    number: "",
  });
  const [quickReplies, setQuickReplies] = useState([""]);
  const [offerCode, setOfferCode] = useState("");
  const [selectedAction, setSelectedAction] = useState("None");
  const [variables, setVariables] = useState([]);
  const [sampleValues, setSampleValues] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  // Validation errors state
  const [errors, setErrors] = useState({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [exampleMedia, setExampleMedia] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const customerId = user?.customer_id;

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation
    const maxSize = 10 * 1024 * 1024;
    const validTypes = {
      Image: ["image/jpeg", "image/png"],
      Video: ["video/mp4"],
      Document: ["application/pdf", "text/plain"],
    };
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, file: "File size must be under 10MB" }));
      toast.error("File size must be under 10MB");
      return;
    }
    if (!validTypes[templateType]?.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        file: `Invalid file type for ${templateType}`,
      }));
      toast.error(`Invalid file type for ${templateType}`);
      return;
    }

    setSelectedFile(file);
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setIsUploading(true);

    // Upload file to server
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customer_id", customerId);
    formData.append("fileType", file.type);
    console.log("Uploading file:", file.name, "to customer ID:", customerId);
    try {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.UPLOAD_MEDIA, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Upload response:", data); // Temporary for debugging
      // Check for possible field names, prioritizing handleId
      const mediaIdentifier =
        data.handleId ||
        data.exampleMedia ||
        data.mediaId ||
        data.url ||
        data.fileUrl;
      if (!mediaIdentifier) {
        throw new Error(
          "No media identifier returned from server (expected handleId, exampleMedia, mediaId, url, or fileUrl)"
        );
      }
      // Handle multiple handleId values
      const firstMediaIdentifier =
        typeof mediaIdentifier === "string"
          ? mediaIdentifier.split("\n")[0]
          : mediaIdentifier;
      if (
        typeof mediaIdentifier === "string" &&
        mediaIdentifier.includes("\n")
      ) {
        console.warn(
          "Multiple handleId values detected; using the first one:",
          firstMediaIdentifier
        );
      }
      setExampleMedia(firstMediaIdentifier);
      setErrors((prev) => ({ ...prev, file: null }));
      toast.success("File uploaded successfully!");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        file: `Upload failed: ${error.message}`,
      }));
      toast.error(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Retry upload without re-selecting file
  const handleRetryUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected to retry");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("customer_id", customerId);
    formData.append("fileType", selectedFile.type);

    try {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.UPLOAD_MEDIA, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Retry upload failed: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Retry upload response:", data); 
      const mediaIdentifier =
        data.handleId ||
        data.exampleMedia ||
        data.mediaId ||
        data.url ||
        data.fileUrl;
      if (!mediaIdentifier) {
        throw new Error(
          "No media identifier returned from server (expected handleId, exampleMedia, mediaId, url, or fileUrl)"
        );
      }
      const firstMediaIdentifier =
        typeof mediaIdentifier === "string"
          ? mediaIdentifier.split("\n")[0]
          : mediaIdentifier;
      if (
        typeof mediaIdentifier === "string" &&
        mediaIdentifier.includes("\n")
      ) {
        console.warn(
          "Multiple handleId values detected; using the first one:",
          firstMediaIdentifier
        );
      }
      setExampleMedia(firstMediaIdentifier);
      setErrors((prev) => ({ ...prev, file: null }));
      toast.success("File uploaded successfully!");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        file: `Retry upload failed: ${error.message}`,
      }));
      toast.error(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset form function
  const resetForm = () => {
    setTemplateType("None");
    setHeader("");
    setFormat("");
    setFooter("");
    setUrlCtas([{ title: "", url: "" }]);
    setCategory("MARKETING");
    setTemplateName("");
    setLanguage("en_US");
    setPhoneCta({ title: "", country: "", number: "" });
    setQuickReplies([""]);
    setOfferCode("");
    setSelectedAction("None");
    setVariables([]);
    setSampleValues({});
    setSelectedFile(null);
    setPreviewUrl("");
    setExampleMedia("");
    setErrors({});
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
    setIsUploading(false);
  };

  // Detect variables from format
  useEffect(() => {
    const regex = /{{\s*(\d+)\s*}}/g;
    const matches = [...format.matchAll(regex)];
    const uniqueVariables = [...new Set(matches.map((match) => match[1]))].sort(
      (a, b) => a - b
    );
    setVariables(uniqueVariables);
    setSampleValues((prev) => {
      const newValues = {};
      uniqueVariables.forEach((v) => {
        if (prev[v]) newValues[v] = prev[v];
      });
      return newValues;
    });
  }, [format]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      category.trim() ||
      templateName.trim() ||
      language.trim() ||
      header.trim() ||
      format.trim() ||
      footer.trim() ||
      selectedAction !== "None" ||
      quickReplies.some((q) => q.trim()) ||
      urlCtas.some((cta) => cta.title.trim() || cta.url.trim()) ||
      phoneCta.title.trim() ||
      phoneCta.number.trim() ||
      offerCode.trim() ||
      selectedFile;
    setHasUnsavedChanges(hasChanges);
  }, [
    category,
    templateName,
    language,
    header,
    format,
    footer,
    selectedAction,
    quickReplies,
    urlCtas,
    phoneCta,
    offerCode,
    selectedFile,
  ]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setShowExitDialog(false);
    }
  }, [isOpen]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowExitDialog(false);
    }
  }, [isOpen]);

  // Add a useEffect to pre-fill fields if initialValues is provided (edit mode)
  useEffect(() => {
    if (isOpen && mode === "edit" && Object.keys(initialValues).length > 0) {
      setCategory(initialValues.category || "MARKETING");
      setTemplateName(initialValues.elementName || "");
      setLanguage(initialValues.languageCode || "en_US");
      setTemplateType(
        initialValues.templateType
          ? initialValues.templateType.charAt(0).toUpperCase() +
              initialValues.templateType.slice(1).toLowerCase()
          : "Text"
      );
      setHeader(initialValues.header || "");
      setFormat(initialValues.content || "");
      setFooter(initialValues.footer || "");
      setUrlCtas(initialValues.urlCtas || [{ title: "", url: "" }]);
      setPhoneCta(
        initialValues.phoneCta || { title: "", country: "", number: "" }
      );
      setQuickReplies(
        initialValues.buttons
          ?.filter((b) => b.type === "QUICK_REPLY")
          .map((b) => b.text) || [""]
      );
      setOfferCode(initialValues.offerCode || "");
      setSelectedAction(
        initialValues.buttons?.length > 0
          ? initialValues.buttons.some((b) => b.type === "QUICK_REPLY") &&
            initialValues.buttons.some(
              (b) => b.type === "URL" || b.type === "PHONE"
            )
            ? "All"
            : initialValues.buttons.some((b) => b.type === "QUICK_REPLY")
            ? "Quick Replies"
            : "Call To Actions"
          : "None"
      );
      setExampleMedia(initialValues.exampleMedia || "");

      const formatStr = initialValues.content || "";
      const sampleText = initialValues.example || "";
      const regex = /{{\s*(\d+)\s*}}/g;
      const matches = [...formatStr.matchAll(regex)];
      const uniqueVariables = [
        ...new Set(matches.map((match) => match[1])),
      ].sort((a, b) => a - b);
      setVariables(uniqueVariables);

      if (initialValues.sampleValues) {
        setSampleValues(initialValues.sampleValues);
      } else if (formatStr && sampleText) {
        const formatLines = formatStr.split("\n");
        const sampleLines = sampleText.split("\n");
        const sampleValues = {};
        let varIdx = 0;
        for (let i = 0; i < formatLines.length; i++) {
          let fLine = formatLines[i];
          let sLine = sampleLines[i] || "";
          let m;
          while ((m = regex.exec(fLine)) !== null) {
            const before = fLine.slice(0, m.index);
            const after = fLine.slice(m.index + m[0].length);
            let value = sLine;
            if (before) value = value.replace(before, "");
            if (after) value = value.replace(after, "");
            value = value.replace(/^[^\w\d]*/, "").replace(/[^\w\d]*$/, "");
            sampleValues[m[1]] = value.trim();
            varIdx++;
          }
        }
        setSampleValues(sampleValues);
      } else {
        setSampleValues({});
      }
    }
  }, [isOpen, mode, initialValues]);

  // Validation function
  const validateForm = () => {
    try {
      const formData = {
        category,
        templateName,
        language,
        templateType,
        format,
        footer,
        selectedAction,
      };

      templateSchema.parse(formData);

      // Validate sample values
      const sampleErrors = {};
      variables.forEach((v) => {
        if (!sampleValues[v]?.trim()) {
          sampleErrors[v] = "Sample value is required";
        }
      });

      if (Object.keys(sampleErrors).length > 0) {
        setErrors((prev) => ({ ...prev, sampleValues: sampleErrors }));
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const handleSampleValueChange = (variable, value) => {
    setSampleValues((prev) => ({ ...prev, [variable]: value }));
    // Clear error for this field on change
    if (errors.sampleValues?.[variable]) {
      setErrors((prev) => {
        const newSampleErrors = { ...prev.sampleValues };
        delete newSampleErrors[variable];
        return { ...prev, sampleValues: newSampleErrors };
      });
    }
  };

  // Real-time validation for individual fields
  const validateField = (fieldName, value) => {
    try {
      const fieldSchema = templateSchema.shape[fieldName];
      fieldSchema.parse(value);
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error.errors[0].message,
        }));
      }
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      onClose();
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    resetForm();
    onClose();
  };

  const handleCancelClick = () => {
    setShowExitDialog(false);
  };

const handleSubmit = (e) => {
  e.preventDefault();
  console.log("handleSubmit triggered");
  console.log("TemplateName:", templateName, "TemplateType:", templateType);

  if (!validateForm()) return;

  if (!templateName || !templateType) {
    alert("Template Name and Template Type are required.");
    return;
  }

  // Generate sample text
  const generateSampleText = (formatString, samples) => {
    return formatString.replace(/{{\s*(\d+)\s*}}/g, (match, number) => {
      return samples[number] || match;
    });
  };
  const sampleText = generateSampleText(format, sampleValues);

  // Build buttons array
  const buttons = [
    ...quickReplies
      .filter((reply) => reply.trim() && reply.trim() !== "QUICK_REPLY")
      .map((text) => ({ text: text.trim(), type: "QUICK_REPLY" })),
    ...urlCtas
      .filter((cta) => cta.title && cta.url && cta.title.trim() !== "URL_TITLE")
      .map((cta) => ({ text: cta.title, type: "URL", url: cta.url })),
    ...(phoneCta.title &&
    phoneCta.number &&
    phoneCta.title.trim() !== "PHONE_NUMBER"
      ? [
          {
            text: phoneCta.title,
            type: "PHONE",
            country: phoneCta.country,
            number: phoneCta.number,
          },
        ]
      : []),
  ];

  const isMediaTemplate = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
    templateType.toUpperCase()
  );

  // Prepare template object
const newTemplate = {
  elementName: templateName,
  content: format,
  category,
  templateType: templateType.toUpperCase(),
  languageCode: "en_US",
  footer,
  buttons,
  example: sampleText,
  exampleMedia: exampleMedia, 
  messageSendTTL: 3360,
  container_meta: {
    header: isMediaTemplate
      ? { type: templateType.toUpperCase(), media: { id: exampleMedia } }
      : header || null,
    footer,
    data: format,
    sampleText,
    sampleValues,
  },
};


  console.log("Sending template:", newTemplate);
  onSubmit(newTemplate);
};


  if (!isOpen) return null;

  const generateSampleText = (bodyString, samples) => {
    return bodyString.replace(/{{\s*(\d+)\s*}}/g, (match, number) => {
      return samples[number] || match;
    });
  };

  const livePreviewSampleText = {
    text: generateSampleText(format, sampleValues),
    file:
      templateType !== "Text" && previewUrl
        ? { type: templateType, url: previewUrl }
        : null,
  };

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-7"
      onClick={showExitDialog ? undefined : handleClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 flex-shrink-0 relative">
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Template" : "Add New Template"}
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-5 right-7 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 pt-2 rounded-full transition-colors cursor-pointer bg-gray-100"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full overflow-auto">
            <div className="bg-white p-4 md:p-6 shadow rounded-md flex flex-col lg:flex-row gap-6 h-full">
              <div className="flex-1 overflow-auto scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 overflow-visible border-b-2 border-gray-200">
                  <div className="mb-4">
                    <label
                      htmlFor="templateName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Template Name
                    </label>
                    <input
                      id="templateName"
                      type="text"
                      placeholder="Template Name ex. sample (Only lowercase letters and underscores)"
                      className={`border bg-gray-100 rounded p-2.5 w-full placeholder:text-sm ${
                        errors.templateName
                          ? "border-red-500"
                          : "border-transparent"
                      } focus:outline-none focus:border-teal-500`}
                      value={templateName}
                      onChange={(e) => {
                        setTemplateName(e.target.value);
                        validateField("templateName", e.target.value);
                      }}
                      disabled={mode === "edit"}
                    />
                    {errors.templateName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.templateName}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="templateCategory"
                      className="block text-sm font-normal text-gray-700 mb-1"
                    >
                      Template Category
                    </label>
                    <select
                      id="templateCategory"
                      className={`appearance-none border rounded text-sm font-medium bg-gray-100 p-3 w-full ${
                        errors.category
                          ? "border-red-500"
                          : "border-transparent"
                      } focus:outline-none focus:border-teal-500`}
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        validateField("category", e.target.value);
                      }}
                    >
                      <option value="" disabled>
                        Select Template Category
                      </option>
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Language
                    </label>
                    <select
                      id="language"
                      className={`border appearance-none bg-gray-100 text-sm font-medium rounded p-3 w-full ${
                        errors.language
                          ? "border-red-500"
                          : "border-transparent"
                      } focus:outline-none focus:border-teal-500`}
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        validateField("language", e.target.value);
                      }}
                    >
                      <option value="" disabled>
                        Select Language
                      </option>
                      <option value="en_US">English</option>
                    </select>
                    {errors.language && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.language}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="font-semibold mb-1">Template Type</div>
                  <div className="flex gap-4">
                    {["None", "Text", "Image", "Video", "Document"].map(
                      (type) => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="templateType"
                            checked={templateType === type}
                            onChange={() => {
                              setTemplateType(type);
                              validateField("templateType", type);
                              setSelectedFile(null);
                              setPreviewUrl("");
                              setExampleMedia("");
                              setErrors((prev) => ({ ...prev, file: null }));
                            }}
                            aria-label={`Select ${type} template type`}
                          />
                          {type}
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="mb-5 mt-2 relative  ">
                  {templateType === "Text" && (
                    <>
                      <div className="mb-4  border-gray-200">
                        <input
                          id="header"
                          type="text"
                          placeholder="Template Header (optional)"
                          onChange={(e) => {
                            setHeader(e.target.value);
                            validateField("header", e.target.value);
                          }}
                          value={header}
                          className={`border text-sm font-medium bg-gray-100 rounded p-3 w-full ${
                            errors.header
                              ? "border-red-500"
                              : "border-transparent"
                          } focus:outline-none focus:border-teal-500`}
                        />
                        {errors.header && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.header}
                          </p>
                        )}
                        <p className="text-xs font-light text-gray-500 mt-1 mb-6">
                          Max 60 characters
                        </p>
                      </div>
                    </>
                  )}

                  {/* //For Image */}
                  {templateType === "Image" && (
                    <div className="flex items-center gap-3 mt-4 mb-2">
                      <div className="relative flex-1">
                        <span className="text-blue-600 text-xs">
                          (Image: .jpeg, .png)
                        </span>
                        <input
                          type="text"
                          value={selectedFile ? selectedFile.name : ""}
                          placeholder="Upload an image file"
                          readOnly
                          className={`w-full border bg-gray-100 font-medium text-sm rounded p-3 mt-4 mb-2 focus:outline-none ${
                            errors.file
                              ? "border-red-500"
                              : "border-transparent"
                          } focus:border-teal-500`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          {selectedFile ? selectedFile.name.length : 0}/2000
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="flex gap-2">
                        <label
                          className={`border border-green-500 text-green-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-green-50"
                          }`}
                        >
                          {isUploading ? "Uploading..." : "Upload Media"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                        {errors.file && selectedFile && (
                          <button
                            onClick={handleRetryUpload}
                            className={`border border-blue-500 text-blue-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${
                              isUploading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-50 cursor-pointer"
                            }`}
                            disabled={isUploading}
                          >
                            Retry Upload
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {errors.file && (
                    <p className="text-red-500 text-xs mb-2 mt-1">
                      {errors.file}
                    </p>
                  )}
                  {/* For video */}
                  {templateType === "Video" && (
                    <div className="flex items-center gap-3 mt-4 mb-2">
                      <div className="relative flex-1">
                        <span className="text-blue-600 text-xs ">
                          (Video: .mp4)
                        </span>
                        <input
                          type="text"
                          value={selectedFile ? selectedFile.name : ""}
                          placeholder="Upload a video file"
                          readOnly
                          className={`w-full border bg-gray-100 font-medium text-sm rounded p-3 mt-4 mb-2 focus:outline-none ${
                            errors.file
                              ? "border-red-500"
                              : "border-transparent"
                          } focus:border-teal-500`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          {selectedFile ? selectedFile.name.length : 0}/2000
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="flex gap-2">
                        <label
                          className={`border border-green-500 text-green-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-green-50"
                          }`}
                        >
                          {isUploading ? "Uploading..." : "Upload Media"}
                          <input
                            type="file"
                            accept="video/mp4"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                        {errors.file && selectedFile && (
                          <button
                            onClick={handleRetryUpload}
                            className={`border border-blue-500 text-blue-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${
                              isUploading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-50 cursor-pointer"
                            }`}
                            disabled={isUploading}
                          >
                            Retry Upload
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {errors.file && (
                    <p className="text-red-500 text-xs mb-2 mt-1">
                      {errors.file}
                    </p>
                  )}
                  {/* for document */}

                  {templateType === "Document" && (
                    <div className="flex items-center gap-3 mt-4 mb-2">
                      <div className="relative flex-1">
                        <span className="text-blue-600 text-xs ">
                          (Document: .pdf)
                        </span>
                        <input
                          type="text"
                          value={selectedFile ? selectedFile.name : ""}
                          placeholder="Upload a video file"
                          readOnly
                          className={`w-full border bg-gray-100 font-medium text-sm rounded p-3 mt-4 mb-2 focus:outline-none ${
                            errors.file
                              ? "border-red-500"
                              : "border-transparent"
                          } focus:border-teal-500`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          {selectedFile ? selectedFile.name.length : 0}/2000
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="flex gap-2">
                        <label
                          className={`border border-green-500 text-green-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-green-50"
                          }`}
                        >
                          {isUploading ? "Uploading..." : "Upload Media"}
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </label>
                        {errors.file && selectedFile && (
                          <button
                            onClick={handleRetryUpload}
                            className={`border border-blue-500 text-blue-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${
                              isUploading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-50 cursor-pointer"
                            }`}
                            disabled={isUploading}
                          >
                            Retry Upload
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {errors.file && (
                    <p className="text-red-500 text-xs mb-2 mt-1">
                      {errors.file}
                    </p>
                  )}
                </div>
                <div className="mb-5  border-t-2 pt-4 border-gray-200">
                  <label
                    htmlFor="body"
                    className="block w-full text-md font-semibold text-gray-700 "
                  >
                    Body
                  </label>
                  {/* Character Counter Outside (Top Right) */}
                  <div className="flex justify-end mb-1 ">
                    <span
                      className={`text-xs  ${
                        format.length === 1024
                          ? "text-red-500 font-semibold"
                          : format.length >= 950
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    >
                      {format.length}/1024
                    </span>
                  </div>
                  <textarea
                    className={`w-full border text-sm bg-gray-100 rounded p-4 pt-4 ${
                      errors.format ? "border-red-500" : "border-transparent"
                    } focus:outline-none focus:border-teal-500`}
                    rows={4}
                    placeholder="Template Format (use {{1}}, {{2}}... for variables)"
                    value={format}
                    maxLength={1024}
                    style={{ resize: "vertical" }}
                    onChange={(e) => {
                      if (e.target.value.length <= 1024) {
                        setFormat(e.target.value);
                        validateField("format", e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const cursorPosition = e.target.selectionStart;
                        const textBefore = format.substring(0, cursorPosition);
                        const textAfter = format.substring(cursorPosition);
                        const newText = textBefore + "\n" + textAfter;
                        setFormat(newText);
                        // Set cursor position after the newline
                        setTimeout(() => {
                          e.target.setSelectionRange(
                            cursorPosition + 1,
                            cursorPosition + 1
                          );
                        }, 0);
                      }
                    }}
                  ></textarea>
                  <p className="text-xs font-light text-gray-500 mb-2 ">
                    Use text formatting - bold, italic, etc. Max 1024
                    characters.
                  </p>
                  {errors.format && (
                    <p className="text-red-500 text-xs mb-2 mt-2">
                      {errors.format}
                    </p>
                  )}
                  {/* Sample Values */}
                  <SampleValuesSection
                    variables={variables}
                    sampleValues={sampleValues}
                    handleSampleValueChange={handleSampleValueChange}
                    errors={errors}
                  />
                </div>
                <div className="mb-5  border-t-2 pt-4 border-gray-200">
                  <label
                    htmlFor="footer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Footer (optional)
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-gray-100 border rounded p-3 text-sm font-medium mb-1 ${
                      errors.footer ? "border-red-500" : "border-transparent"
                    } focus:outline-none focus:border-teal-500`}
                    placeholder="Template Footer"
                    value={footer}
                    onChange={(e) => {
                      setFooter(e.target.value);
                      validateField("footer", e.target.value);
                    }}
                  />
                  {errors.footer && (
                    <p className="text-red-500 text-xs mb-1">{errors.footer}</p>
                  )}
                  <p className="text-xs font-light text-gray-500 mb-6">
                    You are allowed a maximum of 60 characters.
                  </p>
                </div>

                <div className="mb-5  border-t-2 pt-4 border-gray-200">
                  <div className="font-semibold mb-1">Interactive Actions</div>
                  <div className="flex gap-4 flex-wrap">
                    {["None", "Call To Actions", "Quick Replies", "All"].map(
                      (option) => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="actions"
                            checked={selectedAction === option}
                            onChange={() => {
                              setSelectedAction(option);
                              validateField("selectedAction", option);
                            }}
                            aria-label={`Select ${option} action`}
                          />
                          {option}
                        </label>
                      )
                    )}
                  </div>
                  {errors.selectedAction && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.selectedAction}
                    </p>
                  )}
                </div>
                {(selectedAction === "Quick Replies" ||
                  selectedAction === "All") && (
                  <QuickRepliesSection
                    quickReplies={quickReplies}
                    setQuickReplies={setQuickReplies}
                  />
                )}
                {(selectedAction === "Call To Actions" ||
                  selectedAction === "All") && (
                  <CallToActionSection
                    urlCtas={urlCtas}
                    setUrlCtas={setUrlCtas}
                    phoneCta={phoneCta}
                    setPhoneCta={setPhoneCta}
                    selectedAction={selectedAction}
                  />
                )}
                <OfferCodeSection
                  offerCode={offerCode}
                  setOfferCode={setOfferCode}
                  selectedAction={selectedAction}
                />
                <div className="flex gap-2 justify-end flex-wrap pb-4">
                  <button
                    onClick={handleSubmit}
                    className={`bg-[#05a3a3] w-25 text-white px-6 py-2 rounded font-semibold ${
                      isSubmitting || isUploading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:cursor-pointer"
                    }`}
                    disabled={isSubmitting || isUploading}
                  >
                    {mode === "edit" ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`border border-red-500 text-red-500 px-6 py-2 w-25 rounded font-semibold ${
                      isSubmitting || isUploading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-red-50 hover:cursor-pointer"
                    }`}
                    disabled={isSubmitting || isUploading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <LivePreview
                header={header}
                templateType={templateType}
                livePreviewSampleText={livePreviewSampleText}
                footer={footer}
                quickReplies={quickReplies}
                selectedAction={selectedAction}
                urlCtas={urlCtas}
                offerCode={offerCode}
                phoneCta={phoneCta}
              />
            </div>
          </div>
        </div>
        <ExitConfirmationDialog
          open={showExitDialog}
          hasUnsavedChanges={hasUnsavedChanges}
          onCancel={handleCancelClick}
          onConfirm={confirmExit}
        />
      </div>
    </div>
  );
};

export default TemplateModal;
