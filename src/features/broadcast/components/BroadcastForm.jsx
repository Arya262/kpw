import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ScheduleSelector from "./ScheduleSelector";
import MessageTypeSelector from "./MessageTypeSelector";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

const BroadcastForm = ({
  formData,
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

  useEffect(() => {
    if (location.state?.selectedTemplate) {
      onTemplateSelect(location.state.selectedTemplate);
    }
  }, [location.state, onTemplateSelect]);

  // Fetch templates when component mounts
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

    if (!formData.group_id || formData.group_id === "") {
      newErrors.group_id = "Please select a group";
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
        if (!formData.group_id || formData.group_id === "") {
          newErrors.group_id = "Please select a group";
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

      {/* Step 1: Campaign Name */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Campaign Name</h3>
          <input
            type="text"
            name="broadcastName"
            placeholder="Enter Campaign Name"
            value={formData.broadcastName}
            onChange={handleInputChange}
            className={`w-full p-3 border ${
              errors.broadcastName ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
            disabled={isSubmitting}
          />
          {errors.broadcastName && (
            <p className="text-red-500 text-sm">{errors.broadcastName}</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Group */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Select Group</h3>
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleInputChange}
            className={`w-full p-3 border ${
              errors.group_id ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
            disabled={isSubmitting}
          >
            <option value="">Select Group</option>
            {loading ? (
              <option>Loading...</option>
            ) : error ? (
              <option>{error}</option>
            ) : (
              customerLists.map((customer) => (
                <option key={customer.group_id} value={customer.group_id}>
                  {customer.group_name}
                </option>
              ))
            )}
          </select>
          {errors.group_id && (
            <p className="text-red-500 text-sm">{errors.group_id}</p>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
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

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Next
            </button>
          </div>
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
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Preview and Create Campaign */}
      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            📋 Campaign Preview
          </h3>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6">
            {/* Campaign Details */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                Campaign Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <p>
                    <span className="font-medium text-gray-600"> Name:</span>{" "}
                    {formData.broadcastName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600"> Group:</span>{" "}
                    {customerLists.find((g) => g.group_id === formData.group_id)
                      ?.group_name || "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      {" "}
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

            {/* Template Preview */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                Template Preview
              </h4>

              {formData.selectedTemplate ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm space-y-2">
                  <p className="font-semibold text-gray-800">
                    {formData.selectedTemplate.element_name}
                  </p>
                  {formData.selectedTemplate.container_meta?.header?.trim() && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium"></span>{" "}
                      {formData.selectedTemplate.container_meta.header}
                    </p>
                  )}
                  {formData.selectedTemplate.container_meta?.data?.trim() && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium"></span>{" "}
                      {formData.selectedTemplate.container_meta.data}
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

          {/* Footer Actions */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg flex items-center justify-center transition font-medium ${
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
                  Creating...
                </>
              ) : (
                "Create Campaign →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {isTemplateOpen && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <SendTemplate
              onClose={closeTemplate}
              onSelect={(template) => {
                onTemplateSelect(template);
                setErrors((prev) => ({ ...prev, template: "" }));
              }}
              returnFullTemplate={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BroadcastForm;
