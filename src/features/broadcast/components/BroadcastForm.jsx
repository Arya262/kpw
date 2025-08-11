import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ScheduleSelector from "./ScheduleSelector";
import MessageTypeSelector from "./MessageTypeSelector";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FolderOffIcon from "@mui/icons-material/FolderOff";
const BroadcastForm = ({
  formData,
  setFormData,
  handleInputChange,
  handleRadioChange,
  handleMediaChange,
  selectedDate,
  setSelectedDate,
  isTemplateOpen,
  openTemplate,
  closeTemplate,
  SendTemplate,
  loading,
  error,
  customerLists,
  onSubmit,
  isSubmitting,
  onTemplateSelect,
  step,
  setStep,
}) => {
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const [filteredCustomerLists, setFilteredCustomerLists] = useState(
    customerLists || []
  );
  const [warningMessage, setWarningMessage] = useState("");
  useEffect(() => {
    if (location.state?.selectedTemplate) {
      onTemplateSelect(location.state.selectedTemplate);
    }
  }, [location.state, onTemplateSelect]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user?.customer_id}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await response.json();
        if (Array.isArray(data.templates)) {
          const normalizedTemplates = data.templates.map((t) => ({
            ...t,
            container_meta: {
              ...t.container_meta,
              sampleText:
                t.container_meta?.sampleText || t.container_meta?.sample_text,
            },
          }));
          setTemplates(normalizedTemplates);
        } else {
          setTemplatesError("Invalid response format");
        }
      } catch (err) {
        setTemplatesError("Failed to fetch templates");
      } finally {
        setTemplatesLoading(false);
      }
    };
    if (user?.customer_id) {
      fetchTemplates();
    }
  }, [user?.customer_id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.broadcastName.trim()) {
      newErrors.broadcastName = "Broadcast name is required";
    }

    if (!Array.isArray(formData.group_id) || formData.group_id.length === 0) {
      newErrors.group_id = "Please select at least one group";
    }

    if (!formData.selectedTemplate) {
      newErrors.template = "Please select a template";
    }

    if (formData.schedule === "Yes" && !selectedDate) {
      newErrors.schedule = "Please select a date and time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  // Validate individual steps
  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 1:
        if (!formData.broadcastName.trim()) {
          newErrors.broadcastName = "Campaign name is required";
        }
        break;
      case 2:
        if (
          !Array.isArray(formData.group_id) ||
          formData.group_id.length === 0
        ) {
          newErrors.group_id = "Please select at least one group";
        }
        break;
      case 3:
        if (!formData.selectedTemplate) {
          newErrors.template = "Please select a template";
        }
        break;
      case 4:
        if (formData.schedule === "Yes" && !selectedDate) {
          newErrors.schedule = "Please select a date and time";
        }
        break;
      case 5:
        // Final validation before submission
        if (!formData.broadcastName.trim()) {
          newErrors.broadcastName = "Campaign name is required";
        }
        if (!formData.group_id) {
          newErrors.group_id = "Please select a group";
        }
        if (!formData.selectedTemplate) {
          newErrors.template = "Please select a template";
        }
        if (formData.schedule === "Yes" && !selectedDate) {
          newErrors.schedule = "Please select a date and time";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  useEffect(() => {
    if (!customerLists) return;

    const filtered = customerLists.filter((list) =>
      list.group_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomerLists(filtered);
  }, [searchTerm, customerLists]);

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 5 && (
              <div
                className={`w-12 h-0.5 ${
                  step > stepNumber ? "bg-teal-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div
        style={{ minHeight: 500, overflowY: "auto" }}
        className="scrollbar-hide"
      >
        {/* Step 1: Campaign Name */}
        {step === 1 && (
          <Box display="flex" flexDirection="column" gap={3} p={2}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Campaign Name
            </Typography>
            <TextField
              name="broadcastName"
              label="Campaign Name"
              placeholder="Enter Campaign Name"
              value={formData.broadcastName}
              onChange={handleInputChange}
              error={Boolean(errors.broadcastName)}
              helperText={errors.broadcastName}
              fullWidth
              disabled={isSubmitting}
              inputProps={{ maxLength: 30 }}
            />
            <Box
              display="flex"
              justifyContent="flex-end"
              fontSize="12px"
              color="text.secondary"
              mt={-2}
            >
              {formData.broadcastName.length}/30
            </Box>
            <Box
              border="1px dashed #D97706"
              bgcolor="#FFF7ED"
              p={2}
              borderRadius="8px"
              display="flex"
              flexDirection="column"
              gap={1}
              color="#92400E"
              fontSize="14px"
            >
              <Box fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <span style={{ color: "#B45309" }}>⚠️</span> IMPORTANT:
              </Box>
              <Box>
                WhatsApp messages can only be sent to customers who have allowed
                (given consent) to your business to receive messages.
              </Box>
              <Box>Messages can be informational ℹ️ or semi-promotional ℹ️</Box>
            </Box>
          </Box>
        )}

        {/* Step 2: Select Group */}
        {step === 2 && (
          <Box display="flex" gap={6} p={2}>
            {/* Tier Info */}
            <Box minWidth="250px" textAlign="center">
              <Box
                width={120}
                height={120}
                borderRadius="50%"
                border="8px solid #E5E7EB"
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="0 auto"
                fontWeight="bold"
                fontSize="18px"
                color="#10B981"
              >
                1000
              </Box>
              <Typography mt={2} variant="body2" color="textSecondary">
                TIER #1000
              </Typography>
              <Typography variant="body2" mt={1} color="text.secondary">
                You can only send up to <br />
                1000 messages in 24 hrs
              </Typography>
            </Box>

            {/* Customer List Selector */}
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Select List
              </Typography>

              {/* Warning message */}
              {warningMessage && (
                <Typography color="error" variant="body2">
                  {warningMessage}
                </Typography>
              )}

              {(() => {
                const selectedGroups = customerLists.filter((c) =>
                  formData.group_id.includes(c.group_id)
                );
                const selectedCount = selectedGroups.length;
                const totalContacts = selectedGroups.reduce(
                  (sum, group) => sum + (group.total_contacts || 0),
                  0
                );

                return !showList ? (
                  // Collapsed view
                  <Box
                    onClick={() => setShowList((prev) => !prev)}
                    sx={{
                      border: "1px solid #E5E7EB",
                      backgroundColor: "#FAFAFA",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      minHeight: "56px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      "&:hover": { borderColor: "#CBD5E1" },
                    }}
                  >
                    <Typography
                      color={
                        selectedCount > 0 ? "text.primary" : "text.secondary"
                      }
                    >
                      {selectedCount > 0
                        ? `${selectedCount} list${
                            selectedCount > 1 ? "s" : ""
                          } with < ${totalContacts} customers selected`
                        : "Select list with < 1000 customers"}
                    </Typography>
                    <ArrowDropDownIcon />
                  </Box>
                ) : (
                  // Expanded view
                  <>
                    <TextField
                      placeholder="Search contact lists"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <Box
                      border="1px solid #E5E7EB"
                      borderRadius="8px"
                      height="300px"
                      overflow="auto"
                      p={2}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent={
                        filteredCustomerLists.length === 0
                          ? "center"
                          : "flex-start"
                      }
                    >
                      {filteredCustomerLists.length === 0 ? (
                        <Box textAlign="center" color="text.secondary">
                          <FolderOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                          <Typography>No results</Typography>
                        </Box>
                      ) : (
                        filteredCustomerLists.map((customer) => {
                          return (
                            <Box
                              key={customer.group_id}
                              display="flex"
                              alignItems="flex-start"
                              justifyContent="space-between"
                              py={1}
                              borderBottom="1px solid #F3F4F6"
                              width="100%"
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formData.group_id.includes(
                                      customer.group_id
                                    )}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      const selectedGroups =
                                        customerLists.filter((c) =>
                                          formData.group_id.includes(c.group_id)
                                        );
                                      const totalSelectedContacts =
                                        selectedGroups.reduce(
                                          (sum, group) =>
                                            sum + (group.total_contacts || 0),
                                          0
                                        );
                                      if (
                                        isChecked &&
                                        totalSelectedContacts +
                                          customer.total_contacts >
                                          1000
                                      ) {
                                        setWarningMessage(
                                          `Selecting "${customer.group_name}" would exceed the 1000 contact limit.`
                                        );
                                        setTimeout(
                                          () => setWarningMessage(""),
                                          3000
                                        );
                                        return;
                                      }
                                      setWarningMessage("");
                                      setFormData((prev) => ({
                                        ...prev,
                                        group_id: isChecked
                                          ? [
                                              ...prev.group_id,
                                              customer.group_id,
                                            ]
                                          : prev.group_id.filter(
                                              (id) => id !== customer.group_id
                                            ),
                                      }));
                                      setShowList(false);
                                    }}
                                    disabled={isSubmitting || loading}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography fontWeight="medium">
                                      {`${customer.group_name} (${customer.total_contacts} contacts)`}
                                    </Typography>
                                    {customer.initial_contacts && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Initial contacts:{" "}
                                        {customer.initial_contacts}
                                        {customer.unsubscribed_contacts
                                          ? ` | Unsubscribed contacts: ${customer.unsubscribed_contacts}`
                                          : ""}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                              <Box
                                px={1}
                                py={0.5}
                                border="1px dashed #10B981"
                                borderRadius="4px"
                                fontSize="12px"
                                color="#10B981"
                                alignSelf="center"
                              >
                                Exported data
                              </Box>
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </>
                );
              })()}

              {errors.group_id && (
                <Typography color="error" variant="body2" mt={1}>
                  {errors.group_id}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {/* Step 3: Select Template */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Select Template
            </h3>

            {templatesLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-2 text-gray-600">Loading templates...</span>
              </div>
            ) : templatesError ? (
              <p className="text-red-500 text-center py-8">{templatesError}</p>
            ) : templates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No templates available.
              </p>
            ) : (
              /* Template Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto scrollbar-hide">
                {templates.map((template) => (
                  <div
                    key={template.id || template.element_name}
                    className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                      formData.selectedTemplate?.id === template.id ||
                      formData.selectedTemplate?.element_name ===
                        template.element_name
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-300 hover:shadow-lg"
                    }`}
                    onClick={() => {
                      onTemplateSelect(template);
                      setErrors((prev) => ({ ...prev, template: "" }));
                    }}
                  >
                    {template.container_meta?.mediaUrl && (
                      <img
                        src={template.container_meta.mediaUrl}
                        alt={template.element_name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">
                          {template.element_name}
                        </h4>
                        {(formData.selectedTemplate?.id === template.id ||
                          formData.selectedTemplate?.element_name ===
                            template.element_name) && (
                          <div className="flex-shrink-0 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
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
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {template.category}
                      </p>
                      <p className="text-xs text-gray-700 line-clamp-3">
                        {template.container_meta?.sampleText ||
                          "No sample text available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.template && (
              <p className="text-red-500 text-sm">{errors.template}</p>
            )}
          </div>
        )}

        {/* Step 4: Schedule Campaign */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Schedule Campaign
            </h3>
            <ScheduleSelector
              formData={formData}
              handleRadioChange={handleRadioChange}
              selectedDate={selectedDate}
              setSelectedDate={(date) => {
                setSelectedDate(date);
                setErrors((prev) => ({ ...prev, schedule: "" }));
              }}
              disabled={isSubmitting}
            />
            {errors.schedule && (
              <p className="text-red-500 text-sm">{errors.schedule}</p>
            )}
          </div>
        )}

        {/* Step 5: Preview and Create Campaign */}
        {step === 5 && (
          <div className="space-y-6 p-2">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 max-w-xl mx-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl">
                    <p>
                      <span className="font-medium text-gray-600">Name:</span>{" "}
                      {formData.broadcastName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Groups:</span>{" "}
                      {formData.group_id
                        .map(
                          (id) =>
                            customerLists.find((g) => g.group_id === id)
                              ?.group_name || "Unknown"
                        )
                        .join(", ")}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">
                        Schedule:
                      </span>{" "}
                      {formData.schedule === "Yes"
                        ? selectedDate
                          ? new Date(selectedDate).toLocaleString()
                          : "Not set"
                        : "Send Now"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {formData.selectedTemplate ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                    {formData.selectedTemplate.container_meta?.mediaUrl && (
                      <div>
                        {/\.(mp4|webm|ogg)$/i.test(
                          formData.selectedTemplate.container_meta.mediaUrl
                        ) ? (
                          <video
                            controls
                            className="w-full h-48 rounded-md object-cover"
                          >
                            <source
                              src={
                                formData.selectedTemplate.container_meta
                                  .mediaUrl
                              }
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={
                              formData.selectedTemplate.container_meta.mediaUrl
                            }
                            alt="Media Preview"
                            className="w-full h-48 rounded-md object-cover"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                      </div>
                    )}
                    <p className="font-semibold text-gray-800">
                      {formData.selectedTemplate.element_name}
                    </p>
                    {formData.selectedTemplate.container_meta?.header?.trim?.() && (
                      <p className="text-sm text-gray-600">
                        {formData.selectedTemplate.container_meta.header}
                      </p>
                    )}
                    {formData.selectedTemplate.container_meta?.data?.trim?.() && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {(() => {
                          let content =
                            formData.selectedTemplate.container_meta.sampleText;
                          if (
                            formData.selectedTemplate.container_meta
                              .dynamicFields
                          ) {
                            formData.selectedTemplate.container_meta.dynamicFields.forEach(
                              (field) => {
                                const regex = new RegExp(
                                  `\\{\\{${field.index}\\}}`,
                                  "g"
                                );
                                content = content.replace(regex, field.value);
                              }
                            );
                          }
                          return content;
                        })()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No template selected
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Navigation Buttons - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white p-4">
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
            >
              Previous
            </button>
          )}

          <div style={{ marginLeft: step === 1 ? "auto" : "0" }}>
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg flex items-center justify-center transition-colors font-medium cursor-pointer ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    Sending...
                  </>
                ) : (
                  "Send Now"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastForm;
