import React, { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SampleValuesSection from "./SampleValuesSection";
import QuickRepliesSection from "./QuickRepliesSection";
import CallToActionSection from "./CallToActionSection";
import OfferCodeSection from "./OfferCodeSection";
import LivePreview from "./LivePreview";
import ConfirmationDialog from "../shared/ExitConfirmationDialog";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import Dropdown from "../../components/Dropdown";

const templateSchema = z.object({
  category: z.string().min(1, "Please select a template category"),
  sub_category: z.string().optional(),
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
  templateType: z
    .enum(["None", "Text", "Image", "Video", "Document"], {
      required_error: "Please select a template type",
    })
    .optional(),
  format: z
    .string()
    .min(1, "Template format is required")
    .max(1024, "Template format must be 1024 characters or less"),
  footer: z.string().max(60, "Footer must be 60 characters or less").optional(),
  selectedAction: z
    .enum(["None", "Call To Actions", "Quick Replies", "All"], {
      required_error: "Please select an interactive action",
    })
    .optional(),
  authButtonText: z
    .string()
    .max(25, "Button text must be 25 characters or less")
    .optional(),
}).refine(
  (data) => {
    // Only require sub_category if category is not AUTHENTICATION
    if (data.category !== "AUTHENTICATION") {
      return data.sub_category && data.sub_category.trim().length > 0;
    }
    return true;
  },
  {
    message: "Please select a subcategory",
    path: ["sub_category"],
  }
);

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
  const [sub_category, setSubCategory] = useState("");
  const [language, setLanguage] = useState("en");
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
  const [errors, setErrors] = useState({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [exampleMedia, setExampleMedia] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authButtonText, setAuthButtonText] = useState("");

  const { user } = useAuth();
  const customerId = user?.customer_id;
  const [includeSecurityMessage, setIncludeSecurityMessage] = useState(false);
  const [includeExpiry, setIncludeExpiry] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [mediaFileName, setMediaFileName] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  // Upload file to server and return media identifier
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customer_id", customerId);
    formData.append("fileType", file.type);

    try {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.UPLOAD_MEDIA, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Upload failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      // console.log("Upload API response:", data);
      const mediaIdentifier =
        data.handleId ||
        data.exampleMedia ||
        data.mediaId ||
        data.url ||
        data.fileUrl;
      const fileName = data.fileName;

      if (!mediaIdentifier && !fileName) {
        throw new Error("No media identifier or fileName returned from server");
      }
      // console.log("Media identifier returned:", mediaIdentifier);
      // console.log("File name returned:", fileName);

      // Return both as an object
      return {
        mediaIdentifier: typeof mediaIdentifier === "string"
          ? mediaIdentifier.split("\n")[0]
          : mediaIdentifier,
        fileName,
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clean up previous preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    const validTypes = {
      Image: {
        types: ["image/jpeg", "image/png"],
        maxSize: 5 * 1024 * 1024,
        extensions: [".jpeg", ".png"],
      },
      Video: {
        types: ["video/3gpp", "video/mp4"],
        maxSize: 16 * 1024 * 1024,
        extensions: [".3gp", ".mp4"],
      },
      Document: {
        types: [
          "text/plain",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/pdf",
        ],
        maxSize: 100 * 1024 * 1024,
        extensions: [
          ".txt",
          ".xls",
          ".xlsx",
          ".doc",
          ".docx",
          ".ppt",
          ".pptx",
          ".pdf",
        ],
      },
    };

    const typeConfig = validTypes[templateType];
    if (!typeConfig) {
      setErrors((prev) => ({ ...prev, file: "Invalid template type" }));
      toast.error("Invalid template type");
      return;
    }

    // Validate size
    if (file.size > typeConfig.maxSize) {
      const maxSizeMB = typeConfig.maxSize / (1024 * 1024);
      const message = `File size must be under ${maxSizeMB}MB`;
      setErrors((prev) => ({ ...prev, file: message }));
      toast.error(message);
      return;
    }

    // Validate MIME type
    if (!typeConfig.types.includes(file.type)) {
      const message = `Invalid file type for ${templateType}. Supported types: ${typeConfig.extensions.join(
        ", "
      )}`;
      setErrors((prev) => ({ ...prev, file: message }));
      toast.error(message);
      return;
    }

    // Image validation
    if (templateType === "Image") {
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          img.onload = () => {
            if (img.width < 100 || img.height < 100) {
              reject(new Error("Image dimensions must be at least 100x100"));
            }
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to validate image"));
        });
      } catch (error) {
        setErrors((prev) => ({ ...prev, file: error.message }));
        toast.error(error.message);
        return;
      }
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const { mediaIdentifier, fileName } = await uploadFile(file);
      setExampleMedia(mediaIdentifier);
      setMediaFileName(fileName);
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

  const handleRetryUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected to retry");
      return;
    }
    setIsUploading(true);
    try {
      const { mediaIdentifier, fileName } = await uploadFile(selectedFile);
      setExampleMedia(mediaIdentifier);
      setMediaFileName(fileName);
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
    setCategory("MARKETING");
    setSubCategory("");
    setHeader("");
    setFormat("");
    setFooter("");
    setUrlCtas([{ title: "", url: "" }]);
    setTemplateName("");
    setLanguage("en");
    setPhoneCta({ title: "", country: "", number: "" });
    setQuickReplies([""]);
    setOfferCode("");
    setSelectedAction("None");
    setVariables([]);
    setSampleValues({});
    setSelectedFile(null);
    setPreviewUrl("");
    setExampleMedia("");
    setMediaFileName("");
    setErrors({});
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
    setIsUploading(false);
    setAuthButtonText("");
    setIncludeSecurityMessage(false);
    setIncludeExpiry(false);
    setExpiryMinutes(10);
    setTemplateType("None");
    setPhoneNumberError("");
  };

  // Detect variables from format
  useEffect(() => {
    const regex = /{{\s*(\d+)\s*}}/g;
    const matches = [...format.matchAll(regex)];
    const uniqueVariables = [...new Set(matches.map((match) => match[1]))].sort(
      (a, b) => a - b
    );

    if (matches.length > 1 && category !== "AUTHENTICATION") {
      setSubCategory("TRANSACTIONAL");
    }

    setVariables(uniqueVariables);
    setSampleValues((prev) => {
      const newValues = {};
      uniqueVariables.forEach((v) => {
        if (prev[v]) newValues[v] = prev[v];
      });
      return newValues;
    });
  }, [format, category]);

  useEffect(() => {
    if (category === "AUTHENTICATION") {
      setTemplateType("Text");
      setSelectedAction("None");
      setFormat("{{1}} is your verification code.");
      setFooter("");
      setIncludeSecurityMessage(false);
      setIncludeExpiry(false);
      setExpiryMinutes(10);
      setAuthButtonText("Copy Code");
    } else {
      setTemplateType("None");
      setFormat("");
      setFooter("");
      setIncludeSecurityMessage(false);
      setIncludeExpiry(false);
      setExpiryMinutes(10);
      setAuthButtonText("");
    }
  }, [category]);

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
      selectedFile ||
      authButtonText.trim() ||
      includeExpiry ||
      expiryMinutes !== 10 ||
      includeSecurityMessage;
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
    authButtonText,
    includeExpiry,
    expiryMinutes,
    includeSecurityMessage,
  ]);
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setShowExitDialog(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowExitDialog(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && mode === "edit" && Object.keys(initialValues).length > 0) {
      setCategory(initialValues.category || "MARKETING");
      setSubCategory(initialValues.sub_category || "");
      setTemplateName(initialValues.elementName || "");
      setLanguage(initialValues.languageCode || "en");
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
      setAuthButtonText(initialValues.authButtonText || "");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialValues?.elementName, initialValues?.category]);

  // Validation function
  const validateForm = () => {
    try {
      const formData = {
        category,
        sub_category,
        templateName,
        language,
        format,
        footer,
        ...(category !== "AUTHENTICATION" && { templateType, selectedAction }),
        ...(category === "AUTHENTICATION" && { authButtonText }),
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

      // Validate phone number if phone CTA is provided
      if (phoneCta.title || phoneCta.number) {
        if (!phoneCta.number || phoneCta.number.trim() === "") {
          setPhoneNumberError("Phone number is required when phone CTA is added");
          return false;
        }
        if (!/^\d+$/.test(phoneCta.number)) {
          setPhoneNumberError("Phone number must contain only digits");
          return false;
        }
        if (!phoneCta.title || phoneCta.title.trim() === "") {
          setErrors((prev) => ({
            ...prev,
            phoneCtaTitle: "Button title is required for phone CTA",
          }));
          return false;
        }
      }

      // Validate dynamic variables sequence and duplicates
      if (category !== "AUTHENTICATION" && sub_category !== 'PROMOTION') {
        const dynamicValidation = validateDynamicVariables(format);
        if (!dynamicValidation.isValid) {
          toast.error(dynamicValidation.message);
          setErrors((prev) => ({ ...prev, format: dynamicValidation.message }));
          return false;
        }
      }

      setErrors({});
      setPhoneNumberError("");
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
    if (errors.sampleValues?.[variable]) {
      setErrors((prev) => {
        const newSampleErrors = { ...prev.sampleValues };
        delete newSampleErrors[variable];
        return { ...prev, sampleValues: newSampleErrors };
      });
    }
  };

  // Validate dynamic variables sequence and duplicates
  const validateDynamicVariables = (formatString) => {
    if (!formatString) return { isValid: true };

    // Extract all variable numbers from format string (e.g., {{1}}, {{2}})
    const regex = /{{\s*(\d+)\s*}}/g;
    const matches = [...formatString.matchAll(regex)];
    const variableNumbers = matches.map(match => parseInt(match[1], 10));

    if (variableNumbers.length === 0) {
      return { isValid: true };
    }

    // Check for duplicates
    const uniqueNumbers = [...new Set(variableNumbers)];
    if (uniqueNumbers.length !== variableNumbers.length) {
      const duplicates = variableNumbers.filter((num, index) => variableNumbers.indexOf(num) !== index);
      return {
        isValid: false,
        message: `Duplicate variable detected: {{${duplicates[0]}}}. Each variable number can only be used once.`
      };
    }

    // Check for sequential order starting from 1
    const sortedNumbers = [...uniqueNumbers].sort((a, b) => a - b);
    for (let i = 0; i < sortedNumbers.length; i++) {
      if (sortedNumbers[i] !== i + 1) {
        return {
          isValid: false,
          message: `Variables must be in sequential order starting from {{1}}. Found {{${sortedNumbers[i]}}} but expected {{${i + 1}}}.`
        };
      }
    }

    // Check if any variable is at the end of the string
    const trimmedFormat = formatString.trim();
    const endRegex = /{{\s*(\d+)\s*}}\s*$/;
    if (endRegex.test(trimmedFormat)) {
      const endMatch = trimmedFormat.match(endRegex);
      return {
        isValid: false,
        message: `Dynamic variable {{${endMatch[1]}}} cannot be at the end of the template. Add text after the variable.`
      };
    }

    return { isValid: true };
  };

  // Real-time validation for individual fields
  const validateField = (fieldName, value) => {
    try {
      const fieldSchema = templateSchema.shape[fieldName];
      if (!fieldSchema) {
        // Field doesn't exist in schema, skip validation
        return;
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isSubmitting || isUploading) return;

    setIsSubmitting(true);

    try {
      const generateSampleText = (formatString, samples) => {
        return formatString.replace(/{{\s*(\d+)\s*}}/g, (match, number) => {
          return samples[number] || match;
        });
      };
      const sampleText = generateSampleText(format, sampleValues);

    const buttons =
      category === "AUTHENTICATION"
        ? [{ text: authButtonText, type: "COPY_CODE" }]
        : [
          ...quickReplies
            .filter((reply) => reply.trim() && reply.trim() !== "QUICK_REPLY")
            .map((text) => ({ text: text.trim(), type: "QUICK_REPLY" })),
          ...urlCtas
            .filter(
              (cta) =>
                cta.title && cta.url && cta.title.trim() !== "URL_TITLE"
            )
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

    const newTemplate = {
      elementName: templateName,
      content: format,
      category,
      sub_category,
      templateType:
        category === "AUTHENTICATION" ? "TEXT" : templateType.toUpperCase(),
      languageCode: language,
      buttons,
      example: sampleText,
      exampleMedia,
      media_url: mediaFileName,
      messageSendTTL: 3360,
      container_meta: {
        header: header
          ? header
          : isMediaTemplate
            ? { type: templateType.toUpperCase(), media: { id: exampleMedia, media_url: mediaFileName } }
            : null,
        footer: footer || null,
        data: format,
        sampleText,
        sampleValues,
      },
      ...(category === "AUTHENTICATION" && {
        authButtonText,
        codeExpirationMinutes: expiryMinutes,
        addSecurityRecommendation: includeSecurityMessage,
      }),
    };
    // console.log("Submitting template:", newTemplate);
    await onSubmit(newTemplate);
    } catch (error) {
      toast.error(error?.message || "Failed to submit template");
      console.error("Template submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
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

  // Subcategory options based on category
  const subCategories = [
    { value: "PROMOTION", label: "Promotion" },
    { value: "TRANSACTIONAL", label: "Transactional" },
  ];

  return (
    <div
      className="fixed inset-0 bg-[#000]/50 flex items-start justify-center z-50 overflow-y-auto scrollbar-hide"
      onClick={showExitDialog ? undefined : handleClose}
    >
      <div
        className="bg-white rounded-lg w-full  overflow-hidden flex flex-col"
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
        <div className="flex-1 flex flex-col lg:flex-row bg-gray-50">
          <div className="w-full lg:flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-6 max-h-[calc(100vh-50px)]">
            <div className="bg-white p-4 lg:p-6 shadow rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {/* Template Name */}
                <div className="flex flex-col">
                  <div className="min-h-[65px]">
                    <label
                      htmlFor="templateName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Template Name
                    </label>
                    <p className="text-xs font-light text-gray-500">
                      Name can only be lowercase, alphanumeric, and underscores. No spaces or
                      special characters. e.g. sample_template
                    </p>
                  </div>
                  <input
                    id="templateName"
                    type="text"
                    placeholder="sample_template"
                    className={`rounded p-2.5 w-full placeholder:text-sm ${errors.templateName ? "border-red-500" : "border-gray-200"
                      } border bg-gray-100 focus:outline-none focus:border-teal-500`}
                    value={templateName}
                    onChange={(e) => {
                      setTemplateName(e.target.value);
                      validateField("templateName", e.target.value);
                    }}
                    disabled={mode === "edit"}
                  />
                  {errors.templateName && (
                    <p className="text-red-500 text-sm mt-1 min-h-[20px]">{errors.templateName}</p>
                  )}
                  {!errors.templateName && <div className="min-h-[20px]"></div>}
                </div>

                {/* Template Category */}
                <div className="flex flex-col">
                  <div className="min-h-[65px]">
                    <label
                      htmlFor="templateCategory"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Template Category
                    </label>
                    <p className="text-xs font-light text-gray-500">
                      your template should fall under one of these categories.
                    </p>
                  </div>
                  <Dropdown
                    options={[
                      { value: "MARKETING", label: "Marketing" },
                      { value: "UTILITY", label: "Utility" },
                      { value: "AUTHENTICATION", label: "Authentication" },
                    ]}
                    value={category}
                    onChange={(val) => {
                      setCategory(val);
                      validateField("category", val);
                    }}
                    placeholder="Select Template Category"
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 min-h-[20px]">{errors.category}</p>
                  )}
                  {!errors.category && <div className="min-h-[20px]"></div>}
                </div>

                {/* Language */}
                <div className="flex flex-col">
                  <div className="min-h-[65px]">
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Language
                    </label>
                    <p className="text-xs font-light text-gray-500">
                      you will need to specify the language in which message template is submitted.
                    </p>
                  </div>
                  <Dropdown
                    options={[
                      { value: "af", label: "Afrikaans" },
                      { value: "sq", label: "Albanian" },
                      { value: "ar", label: "Arabic" },
                      { value: "az", label: "Azerbaijani" },
                      { value: "bn", label: "Bengali" },
                      { value: "bg", label: "Bulgarian" },
                      { value: "ca", label: "Catalan" },
                      { value: "zh_CN", label: "Chinese" },
                      { value: "zh_HK", label: "Chinese (HKG)" },
                      { value: "zh_TW", label: "Chinese (TAI))" },
                      { value: "hr", label: "Croatian" },
                      { value: "cs", label: "Czech" },
                      { value: "da", label: "Danish" },
                      { value: "nl", label: "Dutch" },
                      { value: "en", label: "English" },
                      { value: "en_GB", label: "English (UK)" },
                      { value: "en_US", label: "English (US)" },
                      { value: "et", label: "Estonian" },
                      { value: "fil", label: "Filipino" },
                      { value: "fi", label: "Finnish" },
                      { value: "fr", label: "French" },
                      { value: "ka", label: "Georgian" },
                      { value: "de", label: "German" },
                      { value: "el", label: "Greek" },
                      { value: "gu", label: "Gujarati" },
                      { value: "ha", label: "Hausa" },
                      { value: "he", label: "Hebrew" },
                      { value: "hi", label: "Hindi" },
                      { value: "hu", label: "Hungarian" },
                      { value: "id", label: "Indonesian" },
                      { value: "ga", label: "Irish" },
                      { value: "it", label: "Italian" },
                      { value: "ja", label: "Japanese" },
                      { value: "kn", label: "Kannada" },
                      { value: "kk", label: "Kazakh" },
                      { value: "ko", label: "Korean" },
                      { value: "lo", label: "Lao" },
                      { value: "lv", label: "Latvian" },
                      { value: "lt", label: "Lithuanian" },
                      { value: "mk", label: "Macedonian" },
                      { value: "ms", label: "Malay" },
                      { value: "ml", label: "Malayalam" },
                      { value: "mr", label: "Marathi" },
                      { value: "nb", label: "Norwegian" },
                      { value: "fa", label: "Persian" },
                      { value: "pl", label: "Polish" },
                      { value: "pt_BR", label: "Portuguese (Brazil)" },
                      { value: "pt_PT", label: "Portuguese (Portugal)" },
                      { value: "pa", label: "Punjabi" },
                      { value: "ro", label: "Romanian" },
                      { value: "ru", label: "Russian" },
                      { value: "sr", label: "Serbian" },
                      { value: "sk", label: "Slovak" },
                      { value: "sl", label: "Slovenian" },
                      { value: "es", label: "Spanish" },
                      { value: "es_AR", label: "Spanish (ARG)" },
                      { value: "es_ES", label: "Spanish (SPA)" },
                      { value: "es_MX", label: "Spanish (MEX)" },
                      { value: "sw", label: "Swahili" },
                      { value: "sv", label: "Swedish" },
                      { value: "ta", label: "Tamil" },
                      { value: "te", label: "Telugu" },
                      { value: "th", label: "Thai" },
                      { value: "tr", label: "Turkish" },
                      { value: "uk", label: "Ukrainian" },
                      { value: "ur", label: "Urdu" },
                      { value: "uz", label: "Uzbek" },
                      { value: "vi", label: "Vietnamese" },
                      { value: "zu", label: "Zulu" },
                    ]}
                    value={language}
                    onChange={(val) => {
                      setLanguage(val);
                      validateField("language", val);
                    }}
                    placeholder="Select Language"
                  />
                  {errors.language && (
                    <p className="text-red-500 text-sm mt-1 min-h-[20px]">{errors.language}</p>
                  )}
                  {!errors.language && <div className="min-h-[20px]"></div>}
                </div>
              </div>

              {category !== "AUTHENTICATION" && (
                <>
                  <div className="mb-5 border-t-2 pt-4 border-gray-200 ">
                    <div className="font-semibold mb-1">Template Type</div>
                    <p className="text-xs font-light text-gray-500">
                      Your template type should fall under one of these categories.
                    </p>
                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4">
                      {["None", "Text", "Image", "Video", "Document"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="templateType"
                            value={type}
                            checked={templateType === type}
                            onChange={(e) => {
                              const selectedType = e.target.value;
                              // Clean up previous preview URL before changing type
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                              }
                              setTemplateType(selectedType);
                              validateField("templateType", selectedType);
                              setSelectedFile(null);
                              setPreviewUrl("");
                              setExampleMedia("");
                              setMediaFileName("");
                              setErrors((prev) => ({ ...prev, file: null }));
                            }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {category !== "AUTHENTICATION" && (
                    <div className="mb-4">
                      <div className="flex flex-col mb-1">
                        <div className="font-semibold mb-1">Template Subcategory</div>
                        <span className="text-xs font-light text-gray-500">
                          Your template type should fall under one of these categories.
                        </span>

                        {sub_category && (
                          <div className="mt-1">
                            <span className="text-yellow-600 text-xs block">
                              {sub_category === "TRANSACTIONAL"
                                ? "Transactional templates cannot be broadcast"
                                : sub_category === "PROMOTION"
                                  ? "Only one dynamic variable {{1}} is allowed for Promotion"
                                  : null}
                            </span>

                            {/* Example messages */}
                            {sub_category === "TRANSACTIONAL" && (
                              <span className="text-gray-500 text-xs mt-1 block">
                                {`Example: Hello {{1}}, your orderId {{2}} has been shipped.`}
                              </span>
                            )}
                            {sub_category === "PROMOTION" && (
                              <span className="text-gray-500 text-xs mt-1 block">
                                {`Example: Hello {{1}}, get 20% off on your next purchase!`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 mt-2">
                        {["Promotion", "Transactional"].map((option) => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sub_category"
                              value={option.toUpperCase()}
                              checked={sub_category === option.toUpperCase()}
                              onChange={(e) => {
                                setSubCategory(e.target.value);
                                validateField("sub_category", e.target.value);
                              }}
                              className="accent-blue-500"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>

                      {errors.sub_category && (
                        <p className="text-red-500 text-sm mt-1">{errors.sub_category}</p>
                      )}
                    </div>


                  )}

                  <div className="mb-5 mt-2 relative">
                    {templateType === "Text" && (
                      <>
                        <div className="mb-4 border-gray-200">
                          <input
                            id="header"
                            type="text"
                            placeholder="Template Header (optional)"
                            onChange={(e) => {
                              setHeader(e.target.value);
                              validateField("header", e.target.value);
                            }}
                            value={header}
                            className={`border text-sm font-medium bg-gray-100 rounded p-3 w-full ${errors.header
                                ? "border-red-500"
                                : "border-transparent"
                              } focus:outline-none focus:border-teal-500`}
                            aria-describedby={
                              errors.header ? "header-error" : undefined
                            }
                          />
                          {errors.header && (
                            <p
                              id="header-error"
                              className="text-red-500 text-sm mt-1"
                            >
                              {errors.header}
                            </p>
                          )}
                          <p className="text-xs font-light text-gray-500 mt-1 mb-6">
                            Max 60 characters
                          </p>
                        </div>
                      </>
                    )}

                    {["Image", "Video", "Document"].includes(templateType) && (
                      <div className="flex items-center gap-3 mt-4 mb-2">
                        <div className="relative flex-1">
                          <span className="text-blue-600 text-xs">
                            ({templateType}:{" "}
                            {templateType === "Image"
                              ? ".jpeg, .png"
                              : templateType === "Video"
                                ? ".mp4"
                                : ".pdf"}
                            )
                          </span>
                          <input
                            type="text"
                            value={selectedFile ? selectedFile.name : ""}
                            placeholder={`Upload a ${templateType.toLowerCase()} file`}
                            readOnly
                            className={`w-full border bg-gray-100 font-medium text-sm rounded p-3 mt-4 mb-1 focus:outline-none ${errors.file
                                ? "border-red-500"
                                : "border-transparent"
                              } focus:border-teal-500`}
                            aria-describedby={
                              errors.file ? "file-error" : undefined
                            }
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            {selectedFile ? selectedFile.name.length : 0}/2000
                          </span>
                          {errors.file && (
                            <p
                              id="file-error"
                              className="text-red-500 text-xs mt-1 mb-1"
                            >
                              {errors.file}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="flex gap-2">
                          <label
                            className={`border border-green-500 text-green-500 font-medium rounded p-3 mt-8 text-sm ${isUploading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-green-50 cursor-pointer"
                              }`}
                          >
                            {isUploading ? "Uploading..." : "Upload Media"}
                            <input
                              type="file"
                              accept={
                                templateType === "Image"
                                  ? "image/*"
                                  : templateType === "Video"
                                    ? "video/mp4"
                                    : "application/pdf"
                              }
                              onChange={handleFileChange}
                              className="hidden"
                              disabled={isUploading}
                              aria-label={`Upload ${templateType.toLowerCase()} file`}
                            />
                          </label>
                          {errors.file && selectedFile && (
                            <button
                              onClick={handleRetryUpload}
                              className={`border border-blue-500 text-blue-500 font-medium rounded p-3 mt-4 mb-2 text-sm ${isUploading
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-blue-50 cursor-pointer"
                                }`}
                              disabled={isUploading}
                              aria-label="Retry uploading file"
                            >
                              Retry Upload
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="mb-5 border-t-2 pt-4 border-gray-200">
                <label
                  htmlFor="body"
                  className="block w-full text-md font-semibold text-gray-700"
                >
                  Body
                </label>
                <div className="flex justify-end mb-1">
                  <span
                    className={`text-xs ${format.length === 1024
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
                  id="body"
                  className={`w-full border text-sm bg-gray-100 rounded p-4 pt-4 ${errors.format ? "border-red-500" : "border-transparent"
                    } focus:outline-none focus:border-teal-500`}
                  rows={4}
                  placeholder="Template Format (use {{1}}, {{2}}... for variables)"
                  value={format}
                  maxLength={1024}
                  style={{ resize: "vertical" }}
                  onChange={(e) => {
                    const newValue = e.target.value;

                    // Only apply restrictions for PROMOTION subcategory
                    if (sub_category === 'PROMOTION') {
                      // Count all dynamic variables
                      const dynamicVars = newValue.match(/\{\d+\}/g) || [];
                      const hasMultipleVars = dynamicVars.length > 1;

                      // Check if there are any variables other than {{1}}
                      const hasVarOtherThanOne = dynamicVars.some(v => v !== '{1}');

                      if (hasMultipleVars || hasVarOtherThanOne) {
                        toast.error('Only one dynamic variable {{1}} is allowed for Promotion templates');
                        return;
                      }
                    }

                    // Validate dynamic variables sequence and duplicates (skip for AUTHENTICATION)
                    if (category !== "AUTHENTICATION" && sub_category !== 'PROMOTION') {
                      const validation = validateDynamicVariables(newValue);
                      if (!validation.isValid) {
                        toast.error(validation.message);
                        // Still update the format so user can see what they typed
                        // but set an error state
                        setErrors((prev) => ({ ...prev, format: validation.message }));
                      } else {
                        // Clear format error if validation passes
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          if (newErrors.format && (newErrors.format.includes('Duplicate') || newErrors.format.includes('sequential'))) {
                            delete newErrors.format;
                          }
                          return newErrors;
                        });
                      }
                    }

                    // For all cases, update the format if within length limit
                    if (newValue.length <= 1024) {
                      setFormat(newValue);
                      validateField("format", newValue);
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
                      setTimeout(() => {
                        e.target.setSelectionRange(
                          cursorPosition + 1,
                          cursorPosition + 1
                        );
                      }, 0);
                    }
                  }}
                  aria-describedby={errors.format ? "format-error" : undefined}
                ></textarea>
                <p className="text-xs font-light text-gray-500 mb-2 leading-relaxed">
                  Use text formatting — <span className="font-semibold">*</span>bold<span className="font-semibold">*</span>,
                  <span className="italic">_italic_</span>, and <span>~strikethrough~</span>.
                  Your message content can be up to <span className="font-medium text-gray-600">1024 characters</span>. <br />
                  <span className="text-gray-400">Example:</span> Hey {"{{1}}"},don’t miss out on our latest offer {"{{2}}"} is live now!.
                </p>
                {category === "AUTHENTICATION" && (
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="includeSecurityMessage"
                      checked={includeSecurityMessage}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIncludeSecurityMessage(checked);
                        const newFormat = checked
                          ? "{{1}} is your verification code. For your security, do not share this code."
                          : "{{1}} is your verification code.";
                        setFormat(newFormat);
                        validateField("format", newFormat);
                      }}
                      className="mr-2"
                    />
                    <label
                      htmlFor="includeSecurityMessage"
                      className="text-sm text-gray-700"
                    >
                      Include security message
                    </label>
                  </div>
                )}
                {errors.format && (
                  <p
                    id="format-error"
                    className="text-red-500 text-xs mb-2 mt-2"
                  >
                    {errors.format}
                  </p>
                )}
                <SampleValuesSection
                  variables={variables}
                  sampleValues={sampleValues}
                  handleSampleValueChange={handleSampleValueChange}
                  errors={errors}
                />
              </div>

              <div className="mb-5 border-t-2 pt-4 border-gray-200">
                <label
                  htmlFor="footer"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Footer (Optional)
                </label>

                {category !== "AUTHENTICATION" ? (
                  <>
                    <div className="relative mb-1">
                      <input
                        id="footer"
                        type="text"
                        className={`w-full bg-gray-100 border rounded p-3 pr-12 text-sm font-medium ${errors.footer
                            ? "border-red-500"
                            : "border-transparent"
                          } focus:outline-none focus:border-teal-500`}
                        placeholder="Template Footer"
                        value={footer}
                        onChange={(e) => {
                          setFooter(e.target.value);
                          validateField("footer", e.target.value);
                        }}
                      />

                      <span
                        className={`absolute right-3 bottom-2 text-xs ${footer.length === 60
                            ? "text-red-500 font-semibold"
                            : footer.length >= 50
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`}
                      >
                        {footer.length}/60
                      </span>
                    </div>

                    {errors.footer && (
                      <p
                        id="footer-error"
                        className="text-red-500 text-xs mb-1"
                      >
                        {errors.footer}
                      </p>
                    )}
                    <p className="text-xs font-light text-gray-500 mb-6">
                      You are allowed a maximum of 60 characters.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative mb-1">
                      <input
                        id="footer"
                        type="text"
                        className="w-full bg-gray-100 rounded p-3 pr-12 text-sm font-medium cursor-not-allowed text-gray-500"
                        value={footer}
                        disabled
                      />
                      <span
                        className={`absolute right-3 bottom-2 text-xs ${footer.length === 60
                            ? "text-red-500 font-semibold"
                            : footer.length >= 50
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`}
                      >
                        {footer.length}/60
                      </span>
                    </div>

                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="includeExpiry"
                        checked={includeExpiry}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIncludeExpiry(checked);
                          const newValue = checked
                            ? `This code expires in ${expiryMinutes} minutes.`
                            : "";
                          setFooter(newValue);
                          validateField("footer", newValue);
                        }}
                        className="mr-2"
                      />
                      <label
                        htmlFor="includeExpiry"
                        className="text-sm text-gray-700"
                      >
                        Include expiry time
                      </label>
                    </div>

                    {includeExpiry && (
                      <div className="mt-2">
                        <label className="block text-sm text-gray-700 mb-1">
                          Expires in
                        </label>

                        <div className="flex items-center">
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={expiryMinutes}
                            onChange={(e) => {
                              const value = Math.max(
                                1,
                                Math.min(90, Number(e.target.value))
                              );
                              setExpiryMinutes(value);
                              const newValue = `This code expires in ${value} minutes.`;
                              setFooter(newValue);
                              validateField("footer", newValue);
                            }}
                            className="w-16 bg-gray-100  rounded p-2 text-sm font-medium mr-2 focus:outline-none focus:border-teal-500"
                          />
                          <span className="text-sm text-gray-700">minutes</span>
                        </div>
                      </div>
                    )}

                    {errors.footer && (
                      <p
                        id="footer-error"
                        className="text-red-500 text-xs mb-1"
                      >
                        {errors.footer}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Authentication Section */}
              {category === "AUTHENTICATION" && (
                <div className="mb-5 border-t-2 pt-4 border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Basic authentication with quick setup. Your customers copy
                    and paste the code into your app.
                  </p>
                  <label
                    htmlFor="authButtonText"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Button Text
                  </label>

                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">
                      Max 25 characters
                    </span>
                    <span
                      className={`text-xs ${authButtonText.length === 25
                          ? "text-red-500 font-semibold"
                          : authButtonText.length >= 20
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                    >
                      {authButtonText.length}/25
                    </span>
                  </div>

                  <input
                    id="authButtonText"
                    type="text"
                    className={`w-full bg-gray-100 border rounded p-3 text-sm font-medium mb-1 ${errors.authButtonText
                        ? "border-red-500"
                        : "border-transparent"
                      } focus:outline-none focus:border-teal-500`}
                    placeholder="Button Text"
                    value={authButtonText}
                    onChange={(e) => {
                      setAuthButtonText(e.target.value);
                      validateField("authButtonText", e.target.value);
                    }}
                    maxLength={25}
                  />
                  {errors.authButtonText && (
                    <p
                      id="authButtonText-error"
                      className="text-red-500 text-xs mb-1"
                    >
                      {errors.authButtonText}
                    </p>
                  )}
                </div>
              )}

              {category !== "AUTHENTICATION" && (
                <>
                  <div className="mb-5 border-t-2 pt-4 border-gray-200">
                    <div className="font-semibold mb-1">Buttons (Optional)</div>
                    <p className="text-sm text-gray-600 mb-2">
                      Insert buttons so your customers can take action and
                      engage with your message!
                    </p>

                    {/* Dropdown instead of radio buttons */}
                    <div style={{ width: "40%" }}>
                      <Dropdown
                        options={[
                          {
                            value: "None",
                            label: "None",
                            color: "text-gray-700",
                          },
                          {
                            value: "Call To Actions",
                            label: "Call to action",
                          },
                          { value: "Quick Replies", label: "Quick reply" },
                        ]}
                        value={selectedAction}
                        onChange={setSelectedAction}
                        placeholder="Choose action"
                      />
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
                        phoneNumberError={phoneNumberError}
                        setPhoneNumberError={setPhoneNumberError}
                      />
                    )}

                  <OfferCodeSection
                    offerCode={offerCode}
                    setOfferCode={setOfferCode}
                    selectedAction={selectedAction}
                  />
                </>
              )}

              <div className="flex gap-2 justify-end flex-wrap pb-4">
                <button
                  onClick={handleSubmit}
                  className={`bg-[#05a3a3] w-25 text-white px-6 py-2 rounded font-semibold ${isSubmitting || isUploading
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
                  className={`border border-red-500 text-red-500 px-6 py-2 w-25 rounded font-semibold ${isSubmitting || isUploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-50 hover:cursor-pointer"
                    }`}
                  disabled={isSubmitting || isUploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[400px]  p-4 lg:p-6  lg:flex-shrink-0">
            <LivePreview
              header={header}
              templateType={
                category === "AUTHENTICATION" ? "Text" : templateType
              }
              livePreviewSampleText={livePreviewSampleText}
              footer={footer}
              quickReplies={category === "AUTHENTICATION" ? [] : quickReplies}
              selectedAction={
                category === "AUTHENTICATION" ? "None" : selectedAction
              }
              urlCtas={category === "AUTHENTICATION" ? [] : urlCtas}
              offerCode={category === "AUTHENTICATION" ? "" : offerCode}
              phoneCta={
                category === "AUTHENTICATION"
                  ? { title: "", country: "", number: "" }
                  : phoneCta
              }
              authButtonText={
                category === "AUTHENTICATION" ? authButtonText : ""
              }
            />
          </div>
        </div>
        <ConfirmationDialog
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
