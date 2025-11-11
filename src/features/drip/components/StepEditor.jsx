import { useState } from "react";
import { X, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { renderMedia } from "../../../utils/renderMedia";
import fallbackImage from "../../../assets/fallback.jpg";

const StepEditor = ({ step, index, templates, onSave, onClose }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    step_name: step?.step_name || "",
    template_id: step?.template_id || "",
    template_name: step?.template_name || "",
    delay_value: step?.delay_value || 0,
    delay_unit: step?.delay_unit || "hours",
    parameters: step?.parameters || {}, // Store parameter mappings
  });

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  
  // Get selected template details
  const selectedTemplate = templates.find(t => t.id === formData.template_id);
  
  // Extract parameter count from template
  const getTemplateParameterCount = () => {
    if (!selectedTemplate) return 0;
    const sampleText = selectedTemplate.container_meta?.sampleText || "";
    const matches = sampleText.match(/\{\{(\d+)\}\}/g);
    return matches ? matches.length : 0;
  };
  
  const parameterCount = getTemplateParameterCount();

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      template_id: template.id,
      template_name: template.element_name,
    });
    setShowTemplateSelector(false);
    setTemplateSearch("");
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template?.element_name?.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template?.category?.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.template_id) {
      toast.error("Please select a template");
      return;
    }

    if (formData.delay_value < 0) {
      toast.error("Delay cannot be negative");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {step ? `Edit Step ${index + 1}` : "Add New Step"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Step Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Name (Optional)
              </label>
              <input
                type="text"
                value={formData.step_name}
                onChange={(e) =>
                  setFormData({ ...formData, step_name: e.target.value })
                }
                placeholder="e.g., Welcome Message"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E]"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Template <span className="text-red-500">*</span>
              </label>
              
              {/* Selected Template Display */}
              {formData.template_id ? (
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{formData.template_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {templates.find(t => t.id === formData.template_id)?.category || "Template"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTemplateSelector(true)}
                      className="px-3 py-1.5 text-sm text-[#0AA89E] hover:bg-[#0AA89E]/10 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(true)}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0AA89E] hover:bg-[#0AA89E]/5 transition-colors text-gray-600 hover:text-[#0AA89E]"
                >
                  + Select a template
                </button>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Only approved templates can be used
              </p>
            </div>

            {/* Template Parameters Mapping */}
            {formData.template_id && parameterCount > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Template Parameters
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Map template variables to contact fields. These will be automatically filled for each contact.
                </p>
                
                <div className="space-y-3">
                  {Array.from({ length: parameterCount }, (_, i) => {
                    const paramKey = `param_${i + 1}`;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-700">
                          {`{{${i + 1}}}`}
                        </div>
                        <select
                          value={formData.parameters[paramKey] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              parameters: {
                                ...formData.parameters,
                                [paramKey]: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E] text-sm"
                        >
                          <option value="">Select field...</option>
                          <option value="first_name">First Name</option>
                          <option value="last_name">Last Name</option>
                          <option value="mobile_no">Phone Number</option>
                          <option value="email">Email</option>
                          <option value="custom_1">Custom Field 1</option>
                          <option value="custom_2">Custom Field 2</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>Example:</strong> If you map {"{{"} 1 {"}}"} to "First Name", the message will automatically use each contact's first name.
                </div>
              </div>
            )}

            {/* Delay Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {index === 0 ? "Start Delay" : "Wait Time After Previous Step"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={formData.delay_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delay_value: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E]"
                />
                <select
                  value={formData.delay_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, delay_unit: e.target.value })
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E]"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {index === 0
                  ? "Time to wait before sending the first message"
                  : "Time to wait after the previous step completes"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0AA89E] text-white rounded-lg hover:bg-[#099890] transition-colors"
            >
              {step ? "Update Step" : "Add Step"}
            </button>
          </div>
        </form>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col m-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Select Template</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a WhatsApp template for this step</p>
              </div>
              <button
                onClick={() => {
                  setShowTemplateSelector(false);
                  setTemplateSearch("");
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E]"
                />
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No Templates Available</p>
                  <p className="text-sm text-gray-500 mb-4">
                    You need to create WhatsApp templates first
                  </p>
                  <button
                    onClick={() => {
                      setShowTemplateSelector(false);
                      navigate('/templates');
                    }}
                    className="px-4 py-2 bg-[#0AA89E] text-white rounded-lg hover:bg-[#099890] transition-colors"
                  >
                    Go to Templates
                  </button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">No templates match your search</p>
                  <button
                    onClick={() => setTemplateSearch("")}
                    className="text-[#0AA89E] hover:underline text-sm"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredTemplates.map((template) => {
                    const isSelected = formData.template_id === template.id;
                    const isApproved = template?.status?.toLowerCase() === "approved";
                    
                    return (
                      <div
                        key={template.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Template Header */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 text-sm flex-1 truncate min-w-0">
                              {template.element_name}
                            </h4>
                            <button
                              onClick={() => isApproved && handleTemplateSelect(template)}
                              disabled={!isApproved}
                              className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded ${
                                isApproved
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Select
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                              {isApproved ? "Approved" : "Pending"}
                            </span>
                            <span className="text-xs text-gray-500 uppercase">
                              {template.category || "MARKETING"}
                            </span>
                          </div>
                        </div>

                        {/* Template Preview */}
                        <div className="p-3 bg-gray-50 min-h-[200px]">
                          {/* Template Media */}
                          {(() => {
                            const mediaTemplate = {
                              ...template,
                              ...template.container_meta,
                              media_url: template.media_url || template.container_meta?.media_url,
                              template_type: template.template_type || template.container_meta?.templateType,
                            };
                            
                            if (mediaTemplate.template_type?.toLowerCase() !== "text") {
                              const mediaContent = renderMedia(mediaTemplate);
                              return (
                                <div className="relative w-full aspect-video overflow-hidden bg-gray-200 rounded mb-3">
                                  {mediaContent || (
                                    <img
                                      src={fallbackImage}
                                      alt="Template"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Template Text */}
                          <div className="text-xs text-gray-700 whitespace-pre-wrap">
                            {template.container_meta?.sampleText || "No preview available"}
                          </div>
                        </div>

                        {/* Template Buttons (if any) */}
                        {template.container_meta?.buttons && template.container_meta.buttons.length > 0 && (
                          <div className="p-3 border-t border-gray-200 space-y-2">
                            {template.container_meta.buttons.map((button, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="w-full px-3 py-1.5 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                              >
                                {button.text || button.type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {templates.length === 0 
                    ? "No templates available" 
                    : `${filteredTemplates.length} of ${templates.length} templates`}
                </span>
                <button
                  onClick={() => {
                    setShowTemplateSelector(false);
                    setTemplateSearch("");
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepEditor;
