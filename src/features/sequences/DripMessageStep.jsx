import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
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

  // Template state
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    isLoadingMore: false
  });

  // Fetch templates from API
  const fetchTemplates = useCallback(async (page = 1, append = false, search = "") => {
    if (!user?.customer_id) return;

    if (page === 1) {
      setTemplatesLoading(true);
    } else {
      setPagination(prev => ({ ...prev, isLoadingMore: true }));
    }

    try {
      const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
        params: {
          customer_id: user.customer_id,
          page,
          limit: 10,
          search,
          sub_category: "PROMOTION",
          status: "APPROVED",
        },
        withCredentials: true,
      });

      const data = response.data;
      if (data && Array.isArray(data.templates)) {
        const normalizedTemplates = data.templates.map(t => ({
          ...t,
          container_meta: {
            ...t.container_meta,
            sampleText: t.container_meta?.sampleText || t.container_meta?.sample_text,
          },
        }));

        setTemplates(prev => append ? [...prev, ...normalizedTemplates] : normalizedTemplates);

        const { page: current = page, totalPages = 1 } = data.pagination || {};
        setPagination({
          currentPage: current,
          totalPages,
          hasMore: current < totalPages,
          isLoadingMore: false,
        });
      } else {
        setTemplates(prev => append ? prev : []);
        setPagination({ currentPage: 1, totalPages: 1, hasMore: false, isLoadingMore: false });
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      toast.error("Failed to load templates");
    } finally {
      setTemplatesLoading(false);
    }
  }, [user?.customer_id]);

  // Load more templates
  const loadMoreTemplates = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      fetchTemplates(pagination.currentPage + 1, true, searchQuery);
    }
  }, [pagination.hasMore, pagination.isLoadingMore, pagination.currentPage, fetchTemplates, searchQuery]);

  // Fetch templates when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchTemplates(1, false, searchQuery);
    }
  }, [isModalOpen]);

  // Debounced search
  useEffect(() => {
    if (!isModalOpen) return;
    const timer = setTimeout(() => {
      fetchTemplates(1, false, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (fieldErrors.parameters) {
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

  // Templates are already filtered by API (sub_category=PROMOTION)

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
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          Sequence Summary
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Sequence Name</p>
            <p className="text-gray-900 font-medium mt-1">{seqData.drip_name || "-"}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Trigger</p>
            <p className="text-gray-900 font-medium mt-1">{seqData.trigger_type || "Not selected"}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Delivery Days</p>
            <div className="flex flex-wrap gap-1.5">
              {seqDay.length > 0 ? (
                seqDay.map((d, i) => (
                  <span key={i} className="bg-teal-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">{d}</span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Any day</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Delivery Time</p>
            <p className="text-gray-900 font-medium mt-1">
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
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No steps added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first step to start building your sequence</p>
            <button
              onClick={handleAddStep}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Step
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {seqData.steps.map((step, index) => (
              <div key={index} className="w-full">
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
              <div className="flex flex-col items-center mt-3">
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={handleAddStep}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <TemplatePickerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSearchQuery(""); }}
        templates={templates}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={handleTemplateSelect}
        onLoadMore={loadMoreTemplates}
        hasMore={pagination.hasMore}
        isLoadingMore={pagination.isLoadingMore}
        isLoading={templatesLoading && templates.length === 0}
      />

      <ParameterMappingModal
        isOpen={isParaModalOpen && selectedTemplate}
        onClose={() => setIsParaModalOpen(false)}
        template={selectedTemplate}
        parameters={seqData.steps[selectedStepIndex]?.parameters || []}
        onParamChange={handleParamMapping}
        onMediaUpdate={handleMediaUpdate}
        onChangeTemplate={() => { setIsParaModalOpen(false); setIsModalOpen(true); }}
      />

      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        currentIndex={reorderStepIndex}
        totalSteps={seqData.steps.length}
        onMove={handleReorderStep}
      />

      <DeleteConfirmationDialog
        showDialog={isDeleteModalOpen}
        title="Delete Step"
        message={`Are you sure you want to delete "${deleteStepIndex !== null ? seqData.steps[deleteStepIndex]?.step_name : "this step"}"? This action cannot be undone.`}
        onCancel={() => { setIsDeleteModalOpen(false); setDeleteStepIndex(null); }}
        onConfirm={handleDeleteStep}
        isDeleting={false}
      />
    </div>
  );
};


const StepConnector = ({ delay }) => (
  <div className="flex flex-col items-center py-2">
    <div className="w-px h-5 bg-gray-300"></div>
    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full border border-teal-200">
      <Clock className="w-3.5 h-3.5 text-teal-600" />
      <span className="text-xs text-teal-700 font-medium">{delay}</span>
    </div>
    <div className="w-px h-5 bg-gray-300"></div>
  </div>
);

const StepCard = ({ step, index, isExpanded, stepsLength, onToggle, onUpdate, onDelete, onDuplicate, onReorder, onSelectTemplate, onEditParams, hasUnmappedParams, showError }) => {
  const delayLabel = index === 0 ? "From Enrollment" : "From previous step";
  const hasError = showError && hasUnmappedParams;
  
  return (
    <div className={`rounded-xl border ${hasError ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-white"} overflow-hidden shadow-sm`}>
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${hasError ? "bg-red-50" : "bg-gray-50 hover:bg-gray-100"} transition-colors`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-900">{step.step_name || "Untitled Step"}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onReorder(); }}
            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Reorder"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          {stepsLength > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-white">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-sm font-medium text-gray-700 sm:w-28 shrink-0">
                  Send after <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
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
                  <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded">{delayLabel}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <label className="text-sm font-medium text-gray-700 sm:w-28 shrink-0 pt-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  {step.template ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-200">
                        {step.template.element_name}
                        <button onClick={() => onUpdate({ template: null, parameters: [] })} className="text-teal-500 hover:text-teal-700">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                      <button onClick={onEditParams} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <Pen className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onSelectTemplate}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Pick Template
                    </button>
                  )}
                </div>
              </div>

              {hasError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-red-500 text-sm mt-0.5">⚠</span>
                  <p className="text-sm text-red-700">Please map all template variables before continuing.</p>
                </div>
              )}

              {step.template?.category === "MARKETING" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-500 text-sm mt-0.5">ⓘ</span>
                  <p className="text-sm text-amber-700">Only marketing opted-in contacts will receive this message.</p>
                </div>
              )}
            </div>

            {step.template && <TemplatePreviewCard template={step.template} parameters={step.parameters} />}
          </div>
        </div>
      )}
    </div>
  );
};

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
    <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 p-4 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div
          className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="text-sm font-medium text-gray-900 truncate">{template.element_name}</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Active
              </span>
              <span className="text-xs text-gray-500 uppercase">{template.category || "MARKETING"}</span>
            </div>
            <div className="bg-teal-50 rounded-lg p-3 text-sm text-gray-700 border border-teal-100">
              <p className="whitespace-pre-wrap text-xs leading-relaxed">{getPreviewText()}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">Reply STOP to unsubscribe</p>
          </div>
        )}
      </div>
    </div>
  );
};


const TemplatePickerModal = ({ isOpen, onClose, templates, searchQuery, onSearchChange, onSelect, onLoadMore, hasMore, isLoadingMore, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-gray-900 text-xl">Select Template</h4>
              <p className="text-sm text-gray-500 mt-1">Choose a promotional template for your drip message</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by template name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white text-sm transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              <p className="text-gray-500 mt-4 text-sm">Loading templates...</p>
            </div>
          ) : templates.length > 0 ? (
            <>
              {/* Template Count */}
              <p className="text-sm text-gray-500 mb-4">{templates.length} template{templates.length !== 1 ? 's' : ''} found</p>
              
              {/* Template Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((t) => (
                  <TemplateCard key={t.id} template={t} onSelect={onSelect} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                        Loading more...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Load More Templates
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-lg">No templates found</p>
              <p className="text-gray-500 text-sm mt-1 text-center max-w-sm">
                {searchQuery 
                  ? `No templates match "${searchQuery}". Try a different search term.`
                  : "Create a PROMOTION template first to use in your drip sequence."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ template, onSelect }) => {
  const isTextOnly = template.template_type?.toUpperCase() === "TEXT";
  
  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-teal-400 hover:shadow-lg hover:-translate-y-0.5"
      onClick={() => onSelect(template)}
    >
      {/* Media/Preview Section */}
      <div className={`relative ${isTextOnly ? "h-24 bg-gradient-to-br from-teal-50 to-cyan-50" : "h-32 bg-gray-100"} overflow-hidden`}>
        {isTextOnly ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="text-gray-600 text-xs text-center line-clamp-3 leading-relaxed">
              {template.container_meta?.sampleText || template.data || "Text template"}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {renderMedia(template)}
          </div>
        )}
        
        {/* Type Badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[10px] font-semibold text-gray-700 uppercase shadow-sm">
          {template.template_type || "TEXT"}
        </span>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-teal-500/0 group-hover:bg-teal-500/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg">
            Select Template
          </span>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-4">
        <h5 className="font-semibold text-gray-900 text-sm truncate group-hover:text-teal-600 transition-colors">
          {template.element_name}
        </h5>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">
            {template.category || "Marketing"}
          </span>
          {template.sub_category && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              {template.sub_category}
            </span>
          )}
        </div>
        
        {!isTextOnly && (
          <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
            {template.container_meta?.sampleText || "No preview available"}
          </p>
        )}
      </div>
    </div>
  );
};

const ParameterMappingModal = ({ isOpen, onClose, template, parameters, onParamChange, onMediaUpdate, onChangeTemplate }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const isMediaTemplate = ["IMAGE", "VIDEO", "DOCUMENT"].includes(template?.template_type?.toUpperCase());
  const hasVariables = parameters.length > 0;

  // Upload file to backend and get mediaId
  const uploadToBackend = async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customer_id', user?.customer_id || '');
    formData.append('file_type', type);
    formData.append('is_template', 'true');
    formData.append('is_media', 'true');

    const response = await axios.post(
      API_ENDPOINTS.CHAT.SEND_MEDIA,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );

    if (response.data?.success && response.data?.mediaId) {
      return {
        mediaId: response.data.mediaId,
        fileName: response.data.fileName || file.name,
      };
    }
    throw new Error('Failed to upload media');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create preview URL for display
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Determine file type
      const extension = file.name.split(".").pop().toLowerCase();
      const isVideo = ["mp4", "mov", "avi"].includes(extension);
      const fileType = isVideo ? "video" : "image";

      // Upload to backend
      const { mediaId } = await uploadToBackend(file, fileType);

      // Update with mediaId (this is what the API needs)
      onMediaUpdate(mediaId, isVideo ? "VIDEO" : "IMAGE");
      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  };

  // If no variables and no media to edit, just show preview
  const showRightPanel = isMediaTemplate || hasVariables;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${showRightPanel ? "max-w-3xl" : "max-w-md"} max-h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {hasVariables ? "Map Template Variables" : isMediaTemplate ? "Edit Media" : "Template Preview"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasVariables ? "Connect variables to contact fields" : isMediaTemplate ? "Update the media for this template" : "Review your selected template"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          <div className={`grid ${showRightPanel ? "grid-cols-1 lg:grid-cols-2 gap-6" : "grid-cols-1"}`}>
            {/* Template Preview - Left Side */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-gray-600 uppercase">{template?.category || "Marketing"}</span>
                </div>
                <button onClick={onChangeTemplate} className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:underline">
                  Change
                </button>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Template Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-medium text-gray-900 text-sm">{template?.element_name}</h3>
                  <span className="text-xs text-gray-500">{template?.template_type || "TEXT"}</span>
                </div>
                
                {/* Media Preview */}
                {template?.media_url && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      {renderMedia({ ...template, mediaUrl: template.media_url, template_type: template.template_type || "IMAGE" })}
                    </div>
                  </div>
                )}
                
                {/* Message Body */}
                <div className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{template?.data || template?.container_meta?.data}</p>
                </div>
                
                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400 text-center italic">Reply STOP to unsubscribe</p>
                </div>
              </div>
            </div>

            {/* Right Side - Variables/Media */}
            {showRightPanel && (
              <div className="space-y-6">
                {/* Media Section - Only for IMAGE/VIDEO templates */}
                {isMediaTemplate && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Media
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter media URL"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        value={template?.media_url || ""}
                        onChange={(e) => onMediaUpdate(e.target.value)}
                      />
                      {/* Preview uploaded image */}
                      {previewUrl && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                          <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className={`flex-1 px-3 py-2.5 ${uploading ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'} text-white rounded-lg transition-colors text-sm font-medium text-center cursor-pointer flex items-center justify-center gap-2`}>
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Uploading...
                            </>
                          ) : (
                            'Upload File'
                          )}
                          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                        {template?.media_url && (
                          <button
                            onClick={() => onMediaUpdate(null)}
                            className="px-3 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Variables Section - Only if there are parameters */}
                {hasVariables && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {isMediaTemplate ? "2" : "1"}
                      </span>
                      Variables
                    </h3>
                    <div className="space-y-3">
                      {parameters.map((paramObj, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            {paramObj.param} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={paramObj.mappedTo}
                            onChange={(e) => onParamChange(idx, e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                          >
                            <option value="">Select field...</option>
                            <option value="customer_name">Customer Name</option>
                            <option value="mobile">Customer Mobile</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <span className="font-medium">Tip:</span> Variables like {"{{1}}"} will be replaced with the selected contact field value when the message is sent.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
            Cancel
          </button>
          <button onClick={onClose} className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ReorderModal = ({ isOpen, onClose, currentIndex, totalSteps, onMove }) => {
  const availablePositions = Array.from({ length: totalSteps }, (_, i) => i + 1).filter(
    (pos) => pos !== currentIndex + 1
  );
  const [selectedPosition, setSelectedPosition] = useState(availablePositions[0] || 1);

  if (isOpen && availablePositions.length > 0 && !availablePositions.includes(selectedPosition)) {
    setSelectedPosition(availablePositions[0]);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Rearrange Steps</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Move to position</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-sm"
            >
              {availablePositions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={() => onMove(selectedPosition - 1)}
            className="px-4 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors text-sm"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default DripMessageStep;
