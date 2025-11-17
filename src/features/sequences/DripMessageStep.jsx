import React, { useState } from "react";
import { useTemplates } from "../../hooks/useTemplates";
import { renderMedia } from "../../utils/renderMedia";
import {
  Pen,
  Search,
  Trash2,
  Clock,
  Calendar,
  MessageSquare,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";

const DripMessageStep = ({ seqData, setSeqData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParaModalOpen, setIsParaModalOpen] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Template data
  const { data } = useTemplates();
  const templates = data?.templates || [];

  // Days and time for preview
  const seqDay = seqData.delivery_preferences?.[0]?.days || [];
  const seqtime_from = seqData.delivery_preferences?.[0]?.time_from || "";
  const seqtime_to = seqData.delivery_preferences?.[0]?.time_to || "";

  //  Extract placeholders like {{1}} or {{name}}
  const extractPlaceholders = (text) => {
    const matches = text.match(/{{\s*[\w.]+\s*}}/g);
    return matches ? matches.map((m) => m.trim()) : [];
  };

  //  Open Template Picker
  const openTemplatePicker = (index) => {
    setSelectedStepIndex(index);
    setIsModalOpen(true);
  };
  //open parameter popup
  const openParaModal = (index) => {
    setSelectedStepIndex(index);

    const step = seqData.steps[index];
    if (step.template) {
      setSelectedTemplate(step.template);
      setIsParaModalOpen(true);
    } else {
      toast.error("Please select a template first");
    }
  };

  //  Handle Template Selection
  const handleTemplateSelect = (template) => {
    if (!template) {
      toast.error("No template selected!");
      return;
    }

    const newSteps = [...seqData.steps];
    const placeholders = extractPlaceholders(
      template?.container_meta?.data || ""
    );

    newSteps[selectedStepIndex].template = template;
    newSteps[selectedStepIndex].templatePlaceholders = placeholders.map(
      (p) => ({
        param: p,
        mappedTo: "",
      })
    );

    setSeqData({ ...seqData, steps: newSteps });
    setIsModalOpen(false);
    if (placeholders.length > 0) {
      setSelectedTemplate(template);
      setIsParaModalOpen(true);
    }
  };

  // Add Step
  const handleAddStep = () => {
    if (seqData.steps.length < 10) {
      setSeqData({
        ...seqData,
        steps: [
          ...seqData.steps,
          {
            step_name: "Untitled",
            step_order: seqData.steps.length + 1,
            delay_value: 1,
            delay_unit: "minutes",
            template: null,
            use_custom_time: false,
            custom_time_type: "Any Time",
            custom_time_from: "",
            custom_time_to: "",
            custom_days: [],
          },
        ],
      });
    } else {
      toast("You can only add up to 10 steps.");
    }
  };

  // Delete Step
  const handleDeleteStep = (index) => {
    const updatedSteps = seqData.steps.filter((_, i) => i !== index);
    setSeqData({ ...seqData, steps: updatedSteps });
  };

  // Filter Templates
  const filteredTemplates = templates.filter((t) =>
    t.element_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //  Handle parameter dropdown change
  const handleParamMapping = (paramIndex, value) => {
    const newSteps = [...seqData.steps];
    newSteps[selectedStepIndex].templatePlaceholders[paramIndex].mappedTo =
      value;
    setSeqData({ ...seqData, steps: newSteps });

    console.log(
      " Parameter Mapping:",
      newSteps[selectedStepIndex].templatePlaceholders
    );
  };
  const contactFields = [
    { value: "contact.name", label: "Contact Name", icon: User },
    { value: "contact.email", label: "Contact Email", icon: Mail },
    { value: "contact.phone", label: "Contact Phone", icon: Phone },
    { value: "contact.company", label: "Company Name", icon: Building },
    { value: "contact.location", label: "Location", icon: MapPin },
    { value: "contact.owner", label: "Contact Owner", icon: User },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <h4 className="text-lg font-semibold text-gray-900">Drip Messages</h4>
        <p className="text-sm text-gray-600 mt-1">
          Configure your sequence steps and timing
        </p>
      </div>

      {/* Sequence Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          Sequence Summary
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">Sequence Name</p>
            <p className="text-gray-900 mt-1">{seqData.sequence_name || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Trigger</p>
            <p className="text-gray-900 mt-1">
              {seqData.trigger_type || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Delivery Days</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {seqDay.length > 0 ? (
                seqDay.map((d, i) => (
                  <span
                    key={i}
                    className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full"
                  >
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Any day</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Delivery Time</p>
            <p className="text-gray-900 mt-1">
              {seqData.delivery_preferences?.[0]?.time_type === "Time Range"
                ? `${seqtime_from || "-"} to ${seqtime_to || "-"}`
                : "Any Time"}
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Sequence Steps ({seqData.steps.length}/10)
            </h5>
            <p className="text-sm text-gray-500 mt-1">
              Add messages and configure when they should be sent
            </p>
          </div>
          {seqData.steps.length < 10 && (
            <button
              onClick={handleAddStep}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          )}
        </div>

        {/* Step Cards */}
        <div className="space-y-4">
          {seqData.steps.map((step, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
            >
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-semibold"></div>
                  <div className="flex items-center gap-2">
                    <Pen className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={step.step_name}
                      onChange={(e) => {
                        const newSteps = [...seqData.steps];
                        newSteps[index].step_name = e.target.value;
                        setSeqData({ ...seqData, steps: newSteps });
                      }}
                      className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                      placeholder="Enter step name"
                    />
                  </div>
                </div>

                {seqData.steps.length > 1 && (
                  <button
                    onClick={() => handleDeleteStep(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                {/* Delay Configuration */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 sm:w-48 flex-shrink-0">
                    Send after:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                      value={step.delay_value}
                      onChange={(e) => {
                        const newSteps = [...seqData.steps];
                        newSteps[index].delay_value =
                          parseInt(e.target.value) || 1;
                        setSeqData({ ...seqData, steps: newSteps });
                      }}
                    />
                    <select
                      value={step.delay_unit}
                      onChange={(e) => {
                        const newSteps = [...seqData.steps];
                        newSteps[index].delay_unit = e.target.value;
                        setSeqData({ ...seqData, steps: newSteps });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 sm:w-48 flex-shrink-0">
                    Send Message:
                  </label>
                  <div className="flex-1">
                    {step.template ? (
                      <div className="flex items-center justify-between p-3 border border-teal-200 bg-teal-50 rounded-lg">
                        <div
                          className="flex items-center gap-3"
                          onClick={() => openTemplatePicker(index)}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {step.template.element_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {step.template.category || "Marketing"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => openParaModal(index)}
                          className="w-full sm:w-auto border-2 border-dashed border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Map Variables
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openTemplatePicker(index)}
                          className="w-full sm:w-auto border-2 border-dashed border-gray-300 hover:border-teal-400 text-gray-500 hover:text-teal-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Select Template
                        </button>
                        <button
                          onClick={() => openParaModal(index)}
                          className="w-full sm:w-auto border-2 border-dashed border-gray-300 hover:border-teal-500 text-gray-500 hover:text-teal-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Map Variables
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Timing Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.use_custom_time || false}
                      onChange={(e) => {
                        const newSteps = [...seqData.steps];
                        newSteps[index].use_custom_time = e.target.checked;
                        setSeqData({ ...seqData, steps: newSteps });
                      }}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Use Custom Timing
                    </span>
                  </label>

                  {step.use_custom_time && (
                    <div className="mt-4 space-y-4 pl-7">
                      {/* Time Type Selection */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <label className="text-sm text-gray-600 sm:w-32 flex-shrink-0">
                          Time Type:
                        </label>
                        <select
                          value={step.custom_time_type}
                          onChange={(e) => {
                            const newSteps = [...seqData.steps];
                            newSteps[index].custom_time_type = e.target.value;
                            setSeqData({ ...seqData, steps: newSteps });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                        >
                          <option value="Any Time">Any Time</option>
                          <option value="Time Range">Time Range</option>
                        </select>
                      </div>

                      {/* Time Range */}
                      {step.custom_time_type === "Time Range" && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <label className="text-sm text-gray-600 sm:w-32 flex-shrink-0">
                            Time Range:
                          </label>
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input
                              type="time"
                              value={step.custom_time_from || ""}
                              onChange={(e) => {
                                const newSteps = [...seqData.steps];
                                newSteps[index].custom_time_from =
                                  e.target.value;
                                setSeqData({ ...seqData, steps: newSteps });
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <input
                              type="time"
                              value={step.custom_time_to || ""}
                              onChange={(e) => {
                                const newSteps = [...seqData.steps];
                                newSteps[index].custom_time_to = e.target.value;
                                setSeqData({ ...seqData, steps: newSteps });
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Days Selector */}
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <label className="text-sm text-gray-600 sm:w-32 flex-shrink-0">
                          Days:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "All Days",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ].map((day) => {
                            const allDays = [
                              "Mon",
                              "Tue",
                              "Wed",
                              "Thu",
                              "Fri",
                              "Sat",
                              "Sun",
                            ];
                            const isAll = day === "All Days";
                            const currentDays = step.custom_days || [];
                            const isSelected = isAll
                              ? currentDays.length === 7
                              : currentDays.includes(day);

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const newSteps = [...seqData.steps];
                                  let updatedDays;
                                  if (isAll) {
                                    updatedDays =
                                      currentDays.length === 7 ? [] : allDays;
                                  } else {
                                    updatedDays = isSelected
                                      ? currentDays.filter((d) => d !== day)
                                      : [...currentDays, day];
                                  }
                                  newSteps[index].custom_days = updatedDays;
                                  setSeqData({ ...seqData, steps: newSteps });
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  isSelected
                                    ? "bg-teal-500 text-white shadow-sm"
                                    : "bg-white border border-gray-300 text-gray-700 hover:border-teal-400"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {seqData.steps.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No steps added yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first step to start building your sequence
            </p>
          </div>
        )}
      </div>

      {/* Template Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  Select Template
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a message template for this step
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
            {/* Template Grid */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((t) => (
                    <div
                      key={t.id}
                      className="border border-gray-200 rounded-xl hover:border-teal-400 hover:shadow-md cursor-pointer transition-all bg-white group"
                      onClick={() => handleTemplateSelect(t)}
                    >
                      <div className="h-32 overflow-hidden rounded-t-xl flex items-center justify-center bg-gray-50">
                        {renderMedia(t)}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {t.element_name}
                        </p>
                        <p className="text-teal-600 text-xs font-medium uppercase mt-1">
                          {t.category || "Marketing"}
                        </p>
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                          {t.container_meta?.sampleText ||
                            "No preview text available"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      No templates found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your search terms
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== Parameter Mapping Section ===== */}
      {isParaModalOpen && selectedTemplate && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Map Template Variables
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Connect template variables to your contact fields
                </p>
              </div>
              <button
                onClick={() => setIsParaModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Left Column - Template Preview */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {/* Template Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          MARKETING
                        </span>
                      </div>
                      <button
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        onClick={() => {
                          setIsParaModalOpen(false);
                          setIsModalOpen(true);
                        }}
                      >
                        Change
                      </button>
                    </div>

                    {/* Template Content */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {selectedTemplate?.element_name || "Template"}
                        </h3>
                      </div>

                      <div className="min-h-[120px] flex items-center justify-center">
                        <div className="text-start w-full">
                          {selectedTemplate?.media_url ? (
                            <div className="mb-4">
                              {renderMedia({
                                ...selectedTemplate,
                                mediaUrl: selectedTemplate.media_url,
                                template_type:
                                  selectedTemplate.template_type || "IMAGE", // fallback
                              })}
                            </div>
                          ) : null}

                          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {selectedTemplate?.data}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          Reply with STOP to unsubscribe from marketing
                          messages.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Variable Mapping & Media Editor */}
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold">Variable</h1>

                  {/* Media Editor Section */}
                  <div className="space-y-4">
                    {/* Media URL Input */}
                    <div>
                      <label
                        htmlFor="editimage"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Media URL
                      </label>
                      <input
                        type="text"
                        name="editimage"
                        id="editimage"
                        placeholder="Enter media URL or upload file"
                        className="bg-white border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        value={selectedTemplate?.media_url || ""}
                        onChange={(e) => {
                          const updatedTemplate = {
                            ...selectedTemplate,
                            media_url: e.target.value,
                            template_type: "IMAGE",
                          };
                          setSelectedTemplate(updatedTemplate);

                          const newSteps = [...seqData.steps];
                          if (newSteps[selectedStepIndex]?.template) {
                            newSteps[selectedStepIndex].template.media_url =
                              e.target.value;
                            setSeqData({ ...seqData, steps: newSteps });
                          }

                          console.log("Media URL updated:", e.target.value);
                        }}
                      />
                    </div>

                    {/* File Upload Section */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          document.getElementById("media-file-upload").click()
                        }
                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                      >
                        Upload File
                      </button>
                      {selectedTemplate?.media_url && (
                        <button
                          onClick={() => {
                            const updatedTemplate = {
                              ...selectedTemplate,
                              media_url: null,
                            };
                            setSelectedTemplate(updatedTemplate);

                            const newSteps = [...seqData.steps];
                            if (newSteps[selectedStepIndex]?.template) {
                              newSteps[selectedStepIndex].template.media_url =
                                null;
                              setSeqData({ ...seqData, steps: newSteps });
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      id="media-file-upload"
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const objectUrl = URL.createObjectURL(file);
                          const extension = file.name
                            .split(".")
                            .pop()
                            .toLowerCase();
                          const isVideo = ["mp4"].includes(extension);
                          const templateType = isVideo ? "VIDEO" : "IMAGE";

                          const updatedTemplate = {
                            ...selectedTemplate,
                            media_url: objectUrl,
                            template_type: templateType,
                          };
                          setSelectedTemplate(updatedTemplate);

                          const newSteps = [...seqData.steps];
                          if (newSteps[selectedStepIndex]?.template) {
                            newSteps[selectedStepIndex].template.media_url =
                              objectUrl;
                            newSteps[selectedStepIndex].template.template_type =
                              templateType;
                            setSeqData({ ...seqData, steps: newSteps });
                          }

                          console.log(" File uploaded:", file.name);
                        }
                      }}
                    />
                  </div>

                  {/* Variables List */}
                  <div className="space-y-3 mb-6">
                    {seqData.steps[
                      selectedStepIndex
                    ]?.templatePlaceholders?.map((paramObj, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {paramObj.param}
                          </span>
                          <span className="text-red-500">*</span>
                        </div>
                        <select
                          value={paramObj.mappedTo}
                          onChange={(e) =>
                            handleParamMapping(idx, e.target.value)
                          }
                          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="">Select field...</option>
                          <option disabled>--- Contact Fields ---</option>
                          <option value="contact.name">Contact Name</option>
                          <option value="contact.email">Contact Email</option>
                          <option value="contact.phone">Contact Phone</option>
                          <option disabled>--- Company Fields ---</option>
                          <option value="company.name">Company Name</option>
                          <option value="company.industry">
                            Company Industry
                          </option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsParaModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsParaModalOpen(false);
                  toast.success("Variable mappings saved successfully");
                }}
                className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium order-1 sm:order-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DripMessageStep;


