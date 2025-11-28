import { useState, useEffect } from "react";
import { useTemplates } from "../../hooks/useTemplates";
import { renderMedia } from "../../utils/renderMedia";
import DeleteConfirmationDialog from "../shared/DeleteConfirmationDialog";
import {
  Pen,
  Search,
  Trash2,
  Clock,
  MessageSquare,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "react-toastify";

const DripMessageStep = ({ seqData, setSeqData, fieldErrors = {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParaModalOpen, setIsParaModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStepIndex, setDeleteStepIndex] = useState(null);
  const [reorderStepIndex, setReorderStepIndex] = useState(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSteps, setExpandedSteps] = useState({});

  const { data } = useTemplates();
  const templates = data?.templates || [];

  // Auto-expand steps with errors
  useEffect(() => {
    if (fieldErrors.parameters) {
      // Find the step with unmapped params and expand it
      seqData.steps.forEach((step, index) => {
        if (step.parameters?.some((p) => !p.mappedTo || !p.mappedTo.trim())) {
          setExpandedSteps((prev) => ({ ...prev, [index]: true }));
        }
      });
    }
  }, [fieldErrors.parameters, seqData.steps]);

  const seqDay = seqData.delivery_preferences?.[0]?.days || [];
  const seqtime_from = seqData.delivery_preferences?.[0]?.time_from || "";
  const seqtime_to = seqData.delivery_preferences?.[0]?.time_to || "";

  const toggleStep = (index) => {
    setExpandedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Helper to update a specific step field
  const updateStep = (index, updates) => {
    const newSteps = [...seqData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSeqData({ ...seqData, steps: newSteps });
  };


  const updateStepTemplate = (index, templateUpdates) => {
    const newSteps = [...seqData.steps];
    if (newSteps[index]?.template) {
      newSteps[index].template = { ...newSteps[index].template, ...templateUpdates };
      setSeqData({ ...seqData, steps: newSteps });
    }
  };

  const extractPlaceholders = (text) => {
    const matches = text?.match(/{{\s*[\w.]+\s*}}/g);
    return matches ? matches.map((m) => m.trim()) : [];
  };

  const openTemplatePicker = (index) => {
    setSelectedStepIndex(index);
    setIsModalOpen(true);
  };

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

  const handleTemplateSelect = (template) => {
    if (!template) {
      toast.error("No template selected!");
      return;
    }
    const placeholders = extractPlaceholders(template?.container_meta?.data || "");
    updateStep(selectedStepIndex, {
      template,
      step_name: template.element_name,
      parameters: placeholders.map((p) => ({ param: p, mappedTo: "" })),
    });
    setIsModalOpen(false);
    if (placeholders.length > 0) {
      setSelectedTemplate(template);
      setIsParaModalOpen(true);
    }
  };

  const handleAddStep = () => {
    if (seqData.steps.length < 10) {
      const newIndex = seqData.steps.length;
      setSeqData({
        ...seqData,
        steps: [
          ...seqData.steps,
          {
            step_name: "Untitled Step",
            step_order: newIndex + 1,
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
      setExpandedSteps((prev) => ({ ...prev, [newIndex]: true }));
    } else {
      toast("You can only add up to 10 steps.");
    }
  };

  const openDeleteModal = (index) => {
    setDeleteStepIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteStep = () => {
    if (deleteStepIndex === null) return;
    const updatedSteps = seqData.steps.filter((_, i) => i !== deleteStepIndex);
    setSeqData({ ...seqData, steps: updatedSteps });
    setIsDeleteModalOpen(false);
    setDeleteStepIndex(null);
    toast.success("Step deleted successfully");
  };

  const handleDuplicateStep = (index) => {
    if (seqData.steps.length >= 10) {
      toast("You can only add up to 10 steps.");
      return;
    }
    const stepToCopy = { ...seqData.steps[index], step_name: "Untitled Step" };
    const newSteps = [...seqData.steps];
    newSteps.splice(index + 1, 0, stepToCopy);
    setSeqData({ ...seqData, steps: newSteps });
  };

  const openReorderModal = (index) => {
    setReorderStepIndex(index);
    setIsReorderModalOpen(true);
  };

  const handleReorderStep = (newPosition) => {
    if (newPosition === reorderStepIndex || newPosition < 0 || newPosition >= seqData.steps.length) {
      setIsReorderModalOpen(false);
      return;
    }
    const newSteps = [...seqData.steps];
    const [movedStep] = newSteps.splice(reorderStepIndex, 1);
    newSteps.splice(newPosition, 0, movedStep);
    setSeqData({ ...seqData, steps: newSteps });
    setIsReorderModalOpen(false);
    toast.success("Step moved successfully");
  };

  const filteredTemplates = templates.filter((t) =>
    t.element_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleParamMapping = (paramIndex, value) => {
    const newSteps = [...seqData.steps];
    newSteps[selectedStepIndex].parameters[paramIndex].mappedTo = value;
    setSeqData({ ...seqData, steps: newSteps });
  };

  const handleMediaUpdate = (mediaUrl, templateType = "IMAGE") => {
    const updatedTemplate = { ...selectedTemplate, media_url: mediaUrl, template_type: templateType };
    setSelectedTemplate(updatedTemplate);
    updateStepTemplate(selectedStepIndex, { media_url: mediaUrl, template_type: templateType });
  };

  const formatDelay = (value, unit) => {
    const unitLabel = value === 1 ? unit.slice(0, -1) : unit;
    return `After ${value} ${unitLabel}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <h4 className="text-lg font-semibold text-gray-900">Drip Messages</h4>
        <p className="text-sm text-gray-600 mt-1">Configure your sequence steps and timing</p>
      </div>

      {/* Sequence Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          Sequence Summary
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">Sequence Name</p>
            <p className="text-gray-900 mt-1">{seqData.drip_name || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Trigger</p>
            <p className="text-gray-900 mt-1">{seqData.trigger_type || "Not selected"}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Delivery Days</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {seqDay.length > 0 ? (
                seqDay.map((d, i) => (
                  <span key={i} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{d}</span>
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

      {/* Timeline Steps */}
      <div className="relative">
        {seqData.steps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No steps added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first step to start building your sequence</p>
            <button
              onClick={handleAddStep}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add step
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {seqData.steps.map((step, index) => (
              <div key={index} className="w-full">
                {/* Step Card */}
                <StepCard
                  step={step}
                  index={index}
                  isExpanded={expandedSteps[index] !== false}
                  stepsLength={seqData.steps.length}
                  onToggle={() => toggleStep(index)}
                  onUpdate={(updates) => updateStep(index, updates)}
                  onDelete={() => openDeleteModal(index)}
                  onDuplicate={() => handleDuplicateStep(index)}
                  onReorder={() => openReorderModal(index)}
                  onSelectTemplate={() => openTemplatePicker(index)}
                  onEditParams={() => openParaModal(index)}
                  hasUnmappedParams={step.parameters?.some((p) => !p.mappedTo || !p.mappedTo.trim())}
                  showError={!!fieldErrors.parameters}
                />

                {index < seqData.steps.length - 1 && (
                  <StepConnector delay={formatDelay(seqData.steps[index + 1].delay_value, seqData.steps[index + 1].delay_unit)} />
                )}
              </div>
            ))}

            {seqData.steps.length < 10 && (
              <div className="flex flex-col items-center mt-2">
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={handleAddStep}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  Add step
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="w-2 h-2 border-l-2 border-b-2 border-gray-300 transform rotate-[-45deg]"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        templates={filteredTemplates}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={handleTemplateSelect}
      />

      {/* Parameter Mapping Modal */}
      <ParameterMappingModal
        isOpen={isParaModalOpen && selectedTemplate}
        onClose={() => setIsParaModalOpen(false)}
        template={selectedTemplate}
        parameters={seqData.steps[selectedStepIndex]?.parameters || []}
        onParamChange={handleParamMapping}
        onMediaUpdate={handleMediaUpdate}
        onChangeTemplate={() => {
          setIsParaModalOpen(false);
          setIsModalOpen(true);
        }}
      />

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        currentIndex={reorderStepIndex}
        totalSteps={seqData.steps.length}
        onMove={handleReorderStep}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        showDialog={isDeleteModalOpen}
        title="Delete Step"
        message={`Are you sure you want to delete "${deleteStepIndex !== null ? seqData.steps[deleteStepIndex]?.step_name : "this step"}"? This action cannot be undone.`}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteStepIndex(null);
        }}
        onConfirm={handleDeleteStep}
        isDeleting={false}
      />
    </div>
  );
};

const StepConnector = ({ delay }) => (
  <div className="flex flex-col items-center py-2">
    <div className="w-px h-4 bg-gray-300"></div>
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
      <Clock className="w-3.5 h-3.5 text-gray-500" />
      <span className="text-xs text-gray-600 font-medium">{delay}</span>
    </div>
    <div className="w-px h-4 bg-gray-300"></div>
    <div className="w-2 h-2 border-l-2 border-b-2 border-gray-300 transform rotate-[-45deg]"></div>
  </div>
);


const StepCard = ({ step, index, isExpanded, stepsLength, onToggle, onUpdate, onDelete, onDuplicate, onReorder, onSelectTemplate, onEditParams, hasUnmappedParams, showError }) => {
  const delayLabel = index === 0 ? "From Enrollment" : "From previous step";
  const hasError = showError && hasUnmappedParams;
  
  return (
  <div className={`rounded-xl border ${hasError ? "border-red-400 bg-red-50/30" : "border-gray-200 bg-cyan-50/30"} overflow-hidden shadow-sm`}>
    <div
      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cyan-50/50 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-gray-900">{step.step_name || "Untitled Step"}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onReorder(); }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Reorder"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>
        {stepsLength > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>

    {isExpanded && (
      <div className="border-t border-gray-100 bg-white">
        <div className="flex">
          {/* Left Side - Form */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-28">
                Send after <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  value={step.delay_value}
                  onChange={(e) => onUpdate({ delay_value: parseInt(e.target.value) || 1 })}
                />
                <select
                  value={step.delay_unit}
                  onChange={(e) => onUpdate({ delay_unit: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
                <span className="text-sm text-teal-600 font-medium">{delayLabel}</span>
              </div>
            </div>

            {/* Send Message */}
            <div className="flex items-start gap-4">
              <label className="text-sm font-medium text-gray-700 w-28 pt-2">
                Send Message <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                {step.template ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                      {step.template.element_name}
                      <button onClick={() => onUpdate({ template: null, parameters: [] })} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                    <button onClick={onEditParams} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors">
                      <Pen className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onSelectTemplate}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Pick template
                  </button>
                )}
              </div>
            </div>

          
            {hasError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-600 text-sm">⚠</span>
                <p className="text-sm text-red-800">Please map all template variables before continuing. Click the edit button to map variables.</p>
              </div>
            )}

            {/* Marketing Warning */}
            {step.template?.category === "MARKETING" && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-600 text-sm">ⓘ</span>
                <p className="text-sm text-yellow-800">Only marketing opted-in contacts will receive this marketing message template.</p>
              </div>
            )}
          </div>

          {/* Right Side - Template Preview */}
          {step.template && <TemplatePreviewCard template={step.template} parameters={step.parameters} />}
        </div>
      </div>
    )}
  </div>
  );
};

// Template Preview Component
const TemplatePreviewCard = ({ template, parameters = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getPreviewText = () => {
    let text = template.data || template.container_meta?.data || "No preview";
    
    parameters.forEach((param) => {
      if (param.mappedTo) {
        
        const displayValue = param.mappedTo.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        text = text.replace(param.param, `[${displayValue}]`);
      }
    });
    
    return text;
  };

  return (
    <div className="w-72 border-l border-gray-200 p-4 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div
          className="px-3 py-2 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="text-sm font-medium text-gray-900">{template.element_name}</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Active
              </span>
              <span className="text-xs text-gray-500 uppercase">{template.category || "MARKETING"}</span>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="whitespace-pre-wrap text-xs leading-relaxed">
                {getPreviewText()}
              </p>
            </div>
            <p className="text-xs text-teal-600 mt-2 italic">Reply with 'STOP' to unsubscribe from marketing messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Template Picker Modal Component
const TemplatePickerModal = ({ isOpen, onClose, templates, searchQuery, onSearchChange, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-200">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">Select Template</h4>
            <p className="text-sm text-gray-500 mt-1">Choose a message template for this step</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.length > 0 ? (
              templates.map((t) => (
                <div
                  key={t.id}
                  className="border border-gray-200 rounded-xl hover:border-teal-400 hover:shadow-md cursor-pointer transition-all bg-white group"
                  onClick={() => onSelect(t)}
                >
                  <div className="h-32 overflow-hidden rounded-t-xl flex items-center justify-center bg-gray-50">
                    {renderMedia(t)}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 text-sm truncate">{t.element_name}</p>
                    <p className="text-teal-600 text-xs font-medium uppercase mt-1">{t.category || "Marketing"}</p>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                      {t.container_meta?.sampleText || "No preview text available"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No templates found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Parameter Mapping Modal Component
const ParameterMappingModal = ({ isOpen, onClose, template, parameters, onParamChange, onMediaUpdate, onChangeTemplate }) => {
  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const extension = file.name.split(".").pop().toLowerCase();
      const isVideo = ["mp4"].includes(extension);
      onMediaUpdate(objectUrl, isVideo ? "VIDEO" : "IMAGE");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Map Template Variables</h2>
            <p className="text-sm text-gray-600 mt-1">Connect template variables to your contact fields</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Template Preview */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">MARKETING</span>
                  </div>
                  <button onClick={onChangeTemplate} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change
                  </button>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{template?.element_name || "Template"}</h3>
                  </div>
                  <div className="min-h-[120px] flex items-center justify-center">
                    <div className="text-start w-full">
                      {template?.media_url && (
                        <div className="mb-4">
                          {renderMedia({ ...template, mediaUrl: template.media_url, template_type: template.template_type || "IMAGE" })}
                        </div>
                      )}
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{template?.data}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">Reply with STOP to unsubscribe from marketing messages.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Variable Mapping */}
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold">Variable</h1>

              {/* Media Editor */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="editimage" className="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
                  <input
                    type="text"
                    id="editimage"
                    placeholder="Enter media URL or upload file"
                    className="bg-white border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    value={template?.media_url || ""}
                    onChange={(e) => onMediaUpdate(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => document.getElementById("media-file-upload").click()}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                  >
                    Upload File
                  </button>
                  {template?.media_url && (
                    <button
                      onClick={() => onMediaUpdate(null)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input id="media-file-upload" type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
              </div>

              {/* Variables List */}
              <div className="space-y-3 mb-6">
                {parameters.map((paramObj, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium text-gray-700">{paramObj.param}</span>
                      <span className="text-red-500">*</span>
                    </div>
                    <select
                      value={paramObj.mappedTo}
                      onChange={(e) => onParamChange(idx, e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select field...</option>
                      <option value="customer_name">Customer Name</option>
                      <option value="mobile">Customer Mobile</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};


const ReorderModal = ({ isOpen, onClose, currentIndex, totalSteps, onMove }) => {
  // Get available positions (excluding current position)
  const availablePositions = Array.from({ length: totalSteps }, (_, i) => i + 1).filter(
    (pos) => pos !== currentIndex + 1
  );
  
  const [selectedPosition, setSelectedPosition] = useState(availablePositions[0] || 1);

  // Reset selected position when modal opens or currentIndex changes
  if (isOpen && availablePositions.length > 0 && !availablePositions.includes(selectedPosition)) {
    setSelectedPosition(availablePositions[0]);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Rearrange steps</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Position Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Move sequence step to</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[80px]"
            >
              {availablePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onMove(selectedPosition - 1)}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default DripMessageStep;
