import React, { useState, useEffect } from "react";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmationDialog from "../shared/DeleteConfirmationDialog";

// Zod validation schema
const templateSchema = z.object({
  category: z.string().min(1, "Please select a template category"),
  templateName: z
    .string()
    .min(1, "Template name is required")
    .max(50, "Template name must be 50 characters or less")
    .regex(
      /^[a-z_]+$/,
      "Template name must contain only lowercase letters and underscores"
    ),
  language: z.string().min(1, "Please select a language"),
  header: z.string().max(60, "Header must be 60 characters or less").optional(),
  templateType: z.enum(["Text"], {
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
  console.log('Modal rendered');
  const [templateType, setTemplateType] = useState("Text");
  const [header, setHeader] = useState("");
  const [format, setFormat] = useState("");
  const [footer, setFooter] = useState("");
  const [urlCtas, setUrlCtas] = useState([{ title: "", url: "" }]);
  const [category, setCategory] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState("");

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

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Confirmation dialog states
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset form function
  const resetForm = () => {
    setTemplateType("Text");
    setHeader("");
    setFormat("");
    setFooter("");
    setUrlCtas([{ title: "", url: "" }]);
    setCategory("");
    setTemplateName("");
    setLanguage("");
    setPhoneCta({ title: "", country: "", number: "" });
    setQuickReplies([""]);
    setOfferCode("");
    setSelectedAction("None");
    setVariables([]);
    setSampleValues({});
    setErrors({});
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
  };

  // Detect variables from format
  useEffect(() => {
    const regex = /{{\s*(\d+)\s*}}/g;
    const matches = [...format.matchAll(regex)];
    const uniqueVariables = [...new Set(matches.map((match) => match[1]))].sort(
      (a, b) => a - b
    );
    setVariables(uniqueVariables);

    // Clean up sample values for variables that no longer exist
    setSampleValues((prev) => {
      const newValues = {};
      uniqueVariables.forEach((v) => {
        if (prev[v]) {
          newValues[v] = prev[v];
        }
      });
      return newValues;
    });
  }, [format]);

  // Check for unsaved changes
  useEffect(() => {
    // Check if there are any meaningful changes
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
      offerCode.trim();

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
  ]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
      setShowExitDialog(false);
    }
  }, [isOpen]);

  // Cleanup when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowExitDialog(false);
    }
  }, [isOpen]);

  // Debug effect for dialog state
  React.useEffect(() => {
    console.log("showExitDialog state changed to:", showExitDialog);
  }, [showExitDialog]);

  // Add a useEffect to pre-fill fields if initialValues is provided (edit mode)
  useEffect(() => {
    if (
      isOpen &&
      mode === "edit" &&
      initialValues &&
      Object.keys(initialValues).length > 0
    ) {
      setCategory(initialValues.category || "");
      setTemplateName(initialValues.element_name || "");
      setLanguage(initialValues.language || "en_US");
      setTemplateType(
        initialValues.template_type
          ? initialValues.template_type.charAt(0) +
              initialValues.template_type.slice(1).toLowerCase()
          : "Text"
      );
      setHeader(initialValues.container_meta?.header || "");
      setFormat(initialValues.container_meta?.data || "");
      setFooter(initialValues.container_meta?.footer || "");
      setUrlCtas(initialValues.urlCtas || [{ title: "", url: "" }]);
      setPhoneCta(
        initialValues.phoneCta || { title: "", country: "", number: "" }
      );
      setQuickReplies(initialValues.quickReplies || [""]);
      setOfferCode(initialValues.offerCode || "");
      setSelectedAction(initialValues.selectedAction || "None");
      // Set sample values for variables
      const formatStr = initialValues.container_meta?.data || "";
      const sampleText = initialValues.container_meta?.sampleText || "";
      const regex = /{{\s*(\d+)\s*}}/g;
      const matches = [...formatStr.matchAll(regex)];
      const uniqueVariables = [
        ...new Set(matches.map((match) => match[1])),
      ].sort((a, b) => a - b);
      setVariables(uniqueVariables);
      // Prefer sampleValues if present
      if (initialValues.container_meta?.sampleValues) {
        setSampleValues(initialValues.container_meta.sampleValues);
      } else if (formatStr && sampleText) {
        // Try to extract values by aligning format and sampleText
        // Split both by lines
        const formatLines = formatStr.split("\n");
        const sampleLines = sampleText.split("\n");
        const sampleValues = {};
        let varIdx = 0;
        for (let i = 0; i < formatLines.length; i++) {
          let fLine = formatLines[i];
          let sLine = sampleLines[i] || "";
          let m;
          while ((m = regex.exec(fLine)) !== null) {
            // Try to extract the value for this variable from the sample line
            // This is a best-effort guess: replace the variable in the format line with a marker, then extract
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
    // eslint-disable-next-line
  }, [isOpen, mode, initialValues]);

  // Validation function
  const validateForm = () => {
    try {
      const formData = {
        category,
        templateName,
        language,
        header,
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

  const cancelExit = () => {
    console.log("Cancel exit clicked");
    setShowExitDialog(false);
  };

  const handleCancelClick = () => {
    console.log("Cancel button clicked in dialog");
    console.log("Current showExitDialog state:", showExitDialog);
    setShowExitDialog(false);
    console.log("Setting showExitDialog to false");
  };

  const handleSubmit = (e) => {
    console.log('handleSubmit called');
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Ensure required fields are set
    if (!templateName || !templateType) {
      alert('Template Name and Template Type are required.');
      return;
    }

    const generateSampleText = (formatString, samples) => {
      return formatString.replace(/{{\s*(\d+)\s*}}/g, (match, number) => {
        return samples[number] || match;
      });
    };
    const sampleText = generateSampleText(format, sampleValues);

    // Convert form fields to buttons array in the expected format
    const buttons = [
      ...quickReplies.filter(reply => reply.trim() && reply.trim() !== 'QUICK_REPLY').map(text => ({ text: text.trim(), type: 'QUICK_REPLY' })),
      ...urlCtas.filter(cta => cta.title && cta.url && cta.title.trim() !== 'URL_TITLE').map(cta => ({ text: cta.title, type: 'URL', url: cta.url })),
      ...(phoneCta.title && phoneCta.number && phoneCta.title.trim() !== 'PHONE_NUMBER' ? [{ text: phoneCta.title, type: 'PHONE', country: phoneCta.country, number: phoneCta.number }] : [])
    ];

    // Build the newTemplate object in camelCase with container_meta
    const newTemplate = {
      elementName: templateName,
      content: format,
      category: category,
      templateType: templateType ? templateType.toUpperCase() : 'TEXT',
      languageCode: language === "en_US" ? "en" : language,
      header: header,
      footer: footer,
      buttons: buttons,
      example: sampleText,
      exampleHeader: header,
      messageSendTTL: "3360",
      // Add container_meta for downstream use
      container_meta: {
        header: header,
        footer: footer,
        data: format,
        sampleText: sampleText,
        sampleValues: sampleValues,
      },
    };

    // Debug logs
    console.log('DEBUG:', { templateName, templateType });
    console.log('Submitting newTemplate:', newTemplate);

    onSubmit(newTemplate);
    // Don't close modal here - let parent handle it after showing success/error message
  };

  if (!isOpen) return null;

  const generateSampleText = (formatString, samples) => {
    return formatString.replace(/{{\s*(\d+)\s*}}/g, (match, number) => {
      return samples[number] || match;
    });
  };
  const livePreviewSampleText = generateSampleText(format, sampleValues);

  return (
    <div
      className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={showExitDialog ? undefined : handleClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0 relative">
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Template" : "Add New Template"}
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer bg-gray-100"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full p-4 md:p-6 overflow-auto">
            <div className="bg-white p-4 md:p-6 shadow rounded-md flex flex-col lg:flex-row gap-6 h-full">
              {/* Left Side */}
              <div className="flex-1 overflow-auto scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <select
                      className={`border rounded p-2 w-full ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        validateField("category", e.target.value);
                      }}
                    >
                      <option value="">Select Template Category</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Template Name ex. sample (Only lowercase letters and underscores)"
                      className={`border rounded p-2 w-full ${
                        errors.templateName
                          ? "border-red-500"
                          : "border-gray-300"
                      } placeholder:text-sm`}
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
                  <div>
                    <select
                      className={`border rounded p-2 w-full ${
                        errors.language ? "border-red-500" : "border-gray-300"
                      }`}
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        validateField("language", e.target.value);
                      }}
                    >
                      <option value="">Select Language</option>
                      <option value="en_US">English</option>
                    </select>
                    {errors.language && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.language}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Template Header (optional)"
                      onChange={(e) => {
                        setHeader(e.target.value);
                        validateField("header", e.target.value);
                      }}
                      value={header}
                      className={`border rounded p-2 w-full ${
                        errors.header ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.header && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.header}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Max 60 characters
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-semibold mb-1">Template Type</div>
                  <div className="flex gap-4">
                    {["Text"].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="templateType"
                          checked={templateType === type}
                          onChange={() => {
                            setTemplateType(type);
                            validateField("templateType", type);
                          }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                  {errors.templateType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.templateType}
                    </p>
                  )}
                </div>

                {templateType === "Text" ? (
                  <div className="mb-4 relative">
                    {/* Character Counter Outside (Top Right) */}
                    <div className="flex justify-end mb-1">
                      <span
                        className={`text-xs ${
                          format.length === 1024
                            ? "text-red-500 font-bold"
                            : format.length >= 950
                            ? "text-yellow-500"
                            : "text-gray-500"
                        }`}
                      >
                        {format.length}/1024
                      </span>
                    </div>

                    {/* Textarea */}
                    <textarea
                      className={`w-full border rounded p-2 ${
                        errors.format ? "border-red-500" : "border-gray-300"
                      }`}
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
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const cursorPosition = e.target.selectionStart;
                          const textBefore = format.substring(0, cursorPosition);
                          const textAfter = format.substring(cursorPosition);
                          const newText = textBefore + '\n' + textAfter;
                          setFormat(newText);
                          // Set cursor position after the newline
                          setTimeout(() => {
                            e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
                          }, 0);
                        }
                      }}
                    ></textarea>
                    <p className="text-sm text-gray-500 mb-4">
                      Use text formatting - bold, italic, etc. Max 1024
                      characters.
                    </p>
                    {errors.format && (
                      <p className="text-red-500 text-sm mb-2">
                        {errors.format}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      className="w-full border rounded p-2 mb-2"
                    />
                    <p className="text-sm text-gray-500 mb-4">
                      Upload your {templateType.toLowerCase()} file.
                    </p>
                  </>
                )}

                {variables.length > 0 && (
                  <div className="border border-[#CACACA] rounded p-4 mb-4">
                    <div className="font-semibold mb-2 border-b border-[#CACACA] pb-2">
                      Sample Values
                    </div>
                    {variables.map((variable, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field {index + 1}
                          </label>
                          <input
                            type="text"
                            value={`{{${variable}}}`}
                            className="border rounded p-2 w-full bg-gray-100"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Specify the parameter to be replaced.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sample Value {index + 1}
                          </label>
                          <input
                            type="text"
                            placeholder={`Enter sample value for {{${variable}}}`}
                            value={sampleValues[variable] || ""}
                            onChange={(e) =>
                              handleSampleValueChange(variable, e.target.value)
                            }
                            className={`border rounded p-2 w-full ${
                              errors.sampleValues?.[variable]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.sampleValues?.[variable] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.sampleValues[variable]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-4">
                  <input
                    type="text"
                    className={`w-full border rounded p-2 mb-1 ${
                      errors.footer ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Template Footer"
                    value={footer}
                    onChange={(e) => {
                      setFooter(e.target.value);
                      validateField("footer", e.target.value);
                    }}
                  />
                  {errors.footer && (
                    <p className="text-red-500 text-sm mb-1">{errors.footer}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-4">
                    You are allowed a maximum of 60 characters.
                  </p>
                </div>

                <div className="mb-4">
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

                {/* Quick Replies */}
                {(selectedAction === "Quick Replies" ||
                  selectedAction === "All") && (
                  <div className="border border-[#CACACA] rounded p-4 mb-4">
                    <div className="flex justify-between items-center mb-2 border-b border-[#CACACA] pb-2">
                      <div className="font-semibold">Quick Replies</div>
                      <button
                        type="button"
                        className="bg-teal-500 text-white px-3 py-1 rounded text-sm"
                        onClick={() => setQuickReplies([...quickReplies, ""])}
                      >
                        + Add Quick Replies
                      </button>
                    </div>

                    {quickReplies.map((reply, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          className="border rounded p-2 w-full"
                          placeholder="Enter Quick Replies"
                          value={reply}
                          onChange={(e) => {
                            const updated = [...quickReplies];
                            updated[index] = e.target.value;
                            setQuickReplies(updated);
                          }}
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white p-1 rounded hover:cursor-pointer"
                          onClick={() => {
                            const updated = quickReplies.filter(
                              (_, i) => i !== index
                            );
                            setQuickReplies(updated);
                          }}
                        >
                          <img
                            src="/delete-icon2.svg"
                            alt="Delete Icon"
                            className="w-8 h-8"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Call To Action 1 */}
                {(selectedAction === "Call To Actions" ||
                  selectedAction === "All") && (
                  <>
                    <div className="border border-[#CACACA] rounded p-4 mb-4">
                      <div className="flex justify-between items-center mb-2 border-b border-[#CACACA] pb-2">
                        <div className="font-semibold">
                          Call To Action 1 (URL)
                        </div>
                        <button
                          type="button"
                          className="bg-teal-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() =>
                            setUrlCtas([...urlCtas, { title: "", url: "" }])
                          }
                        >
                          + Add URL
                        </button>
                      </div>

                      {urlCtas.map((cta, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end"
                        >
                          <input
                            type="text"
                            placeholder="Enter Button Title"
                            className="border rounded p-2 border-[#606060]"
                            value={cta.title}
                            onChange={(e) => {
                              const updated = [...urlCtas];
                              updated[index].title = e.target.value;
                              setUrlCtas(updated);
                            }}
                          />
                          <select className="border rounded p-2 border-[#606060]">
                            <option value={"Static"}>Static</option>
                            <option value={"Dynamic"}>Dynamic</option>
                          </select>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter Static URL"
                              className="border rounded p-2 w-full border-[#606060]"
                              value={cta.url}
                              onChange={(e) => {
                                const updated = [...urlCtas];
                                updated[index].url = e.target.value;
                                setUrlCtas(updated);
                              }}
                            />
                            <button
                              type="button"
                              className="bg-red-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                              onClick={() => {
                                const updated = urlCtas.filter(
                                  (_, i) => i !== index
                                );
                                setUrlCtas(updated);
                              }}
                            >
                              <img
                                src="/delete-icon2.svg"
                                alt="Delete Icon"
                                className="w-8 h-8"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Call To Action 2 */}
                    <div className="border border-[#CACACA] rounded p-4 mb-4">
                      <div className="font-semibold mb-1">
                        Call To Action 2 (Phone Number)
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <input
                          type="text"
                          placeholder="Enter Button Title"
                          className="border rounded p-2 border-[#606060]"
                          value={phoneCta.title}
                          onChange={(e) =>
                            setPhoneCta({ ...phoneCta, title: e.target.value })
                          }
                        />
                        <select
                          className="border rounded p-2 border-[#606060]"
                          value={phoneCta.country}
                          onChange={(e) =>
                            setPhoneCta({
                              ...phoneCta,
                              country: e.target.value,
                            })
                          }
                        >
                          <option>Select Country</option>
                          <option value="+91">India (+91)</option>
                          <option value="+1">USA (+1)</option>
                        </select>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter mobile Number"
                            className="border rounded p-2 w-full border-[#606060]"
                            value={phoneCta.number}
                            onChange={(e) =>
                              setPhoneCta({
                                ...phoneCta,
                                number: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            className="bg-red-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                            onClick={() =>
                              setPhoneCta({
                                title: "",
                                country: "",
                                number: "",
                              })
                            }
                          >
                            <img
                              src="/delete-icon2.svg"
                              alt="Delete Icon"
                              className="w-8 h-8"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {/* Copy Offer Code */}
                {selectedAction === "All" && (
                  <div className="border border-[#CACACA] rounded p-4 mb-4">
                    <div className="font-semibold mb-2 border-b border-[#CACACA] pb-2">
                      Copy Offer Code
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="border rounded p-2 w-full"
                        placeholder="Enter Offer Code"
                        value={offerCode}
                        onChange={(e) => setOfferCode(e.target.value)}
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                        onClick={() => setOfferCode("")}
                      >
                        <img
                          src="/delete-icon2.svg"
                          alt="Delete Icon"
                          className="w-8 h-8"
                        />
                      </button>
                    </div>
                  </div>
                )}
                {/* Buttons */}
                <div className="flex gap-4 flex-wrap pb-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-[#05a3a3] text-white px-6 py-2 rounded font-semibold hover:cursor-pointer"
                  >
                    {mode === "edit" ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-red-500 text-red-500 px-6 py-2 rounded font-semibold hover:bg-red-50 hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Right Side: Live Preview */}
              <div className="w-full lg:w-[401px] bg-green-100 border border-blue-300 rounded p-4 overflow-auto flex flex-col">
                <h4 className="text-lg font-semibold mb-3 text-gray-500 flex-shrink-0">
                  Live Preview
                </h4>

                <div className="flex-1 space-y-4 overflow-auto">
                  {header && (
                    <h2 className="text-2xl font-semibold mb-2">{header}</h2>
                  )}

                  {templateType === "Text" ? (
                    <p
                      className="text-gray-800 mb-2 overflow-x-auto"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {livePreviewSampleText}
                    </p>
                  ) : (
                    <p className="italic text-gray-500">
                      [{templateType} Preview Placeholder]
                    </p>
                  )}

                  {footer && (
                    <p className="text-sm text-gray-700 mt-2">{footer}</p>
                  )}

                  {quickReplies.filter((q) => q.trim()).length > 0 && (
                    <div className="mt-4">
                      <div className="font-semibold mb-1 text-sm">
                        Quick Replies:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies
                          .filter((q) => q.trim())
                          .map((reply, idx) => (
                            <span
                              key={idx}
                              className="block bg-blue-500 w-full text-white text-center px-3 py-1 rounded mb-2 hover:cursor-pointer"
                            >
                              {reply}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {(selectedAction === "Call To Actions" ||
                    selectedAction === "All") &&
                    urlCtas.filter((cta) => cta.title && cta.url).length >
                      0 && (
                      <div className="mt-4">
                        <span>Call To Actions:</span>
                        {urlCtas
                          .filter((cta) => cta.title && cta.url)
                          .map((cta, idx) => (
                            <a
                              key={idx}
                              href={cta.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2"
                            >
                              {cta.title}
                            </a>
                          ))}
                        {offerCode && (
                          <>
                            <span>Offer Code:</span>
                            <p className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2">
                              {offerCode}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  {(selectedAction === "Call To Actions" ||
                    selectedAction === "All") &&
                    phoneCta.title &&
                    phoneCta.number && (
                      <>
                        <span>Call To Actions :</span>
                        <p className="block bg-blue-500 text-white text-center px-3 py-1 rounded mb-2">
                          {phoneCta.title}
                        </p>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showExitDialog && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[60] transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-[#00BBA7]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">
                Exit Confirmation
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {hasUnsavedChanges
                ? "You have unsaved changes. Are you sure you want to exit?"
                : "Are you sure you want to exit?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="px-4 py-2 bg-[#00BBA7] text-white rounded-md hover:bg-[#00BBA7] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TemplateModal;
