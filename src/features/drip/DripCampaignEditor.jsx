import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Save } from "lucide-react";
import axios from "axios";
import { API_BASE, API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import StepCard from "./components/StepCard";
import StepEditor from "./components/StepEditor";
import TargetSelector from "./components/TargetSelector";
import TriggerSelector from "./components/TriggerSelector";
import { renderMedia } from "../../utils/renderMedia";
import fallbackImage from "../../assets/fallback.jpg";

const DripCampaignEditor = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { user } = useAuth();
  const isEditMode = !!campaignId;

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templateSelectorIndex, setTemplateSelectorIndex] = useState(null);
  const [currentWizardStep, setCurrentWizardStep] = useState(1); // Wizard step tracker
  const [showConditionDropdown, setShowConditionDropdown] = useState(null); // 'start', 'stop_success', 'stop_failure', or null
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null); // { type: 'start' | 'stop', field: 'Name', operator: 'is', value: '', stopType: 'success' | 'failure' }

  const [campaignData, setCampaignData] = useState({
    campaign_name: "",
    description: "",
    trigger_type: "on_create",
    trigger_conditions: {
      start_conditions: [],
      stop_conditions: [],
    },
    delivery_preferences: {
      days: ["all"],
      time_type: "any",
      time_from: null,
      time_to: null,
      allow_once: true,
      continue_after_delivery: false,
    },
    target_type: "all_contacts",
    target_ids: [],
    status: "draft",
  });

  const [steps, setSteps] = useState([]);
  const [stepCustomDelivery, setStepCustomDelivery] = useState({}); 
  const [stepCollapsed, setStepCollapsed] = useState({});

  useEffect(() => {
    fetchTemplates();
    fetchGroups();
    if (isEditMode) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
        params: { customer_id: user.customer_id },
        withCredentials: true,
        validateStatus: (status) => status < 500, 
      });
      
      // Handle both response formats (templates or data)
      const templateData = response.data.templates || response.data.data || [];
      console.log("📋 Templates fetched for drip campaign:", templateData.length, "templates");
      setTemplates(templateData);
      
      if (templateData.length === 0) {
        console.log("⚠️ No templates found. User needs to create templates first.");
      }
    } catch (error) {
      console.error("❌ Error fetching templates:", error);
      toast.error("Failed to load templates");
      setTemplates([]); // Set empty array on error
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE}/returnGroups`, {
        params: { customer_id: user.customer_id },
        withCredentials: true,
      });
      setGroups(response.data.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/drip-campaigns/${campaignId}`, {
        params: { customer_id: user.customer_id },
        withCredentials: true,
      });

      const campaign = response.data.data;
      setCampaignData({
        campaign_name: campaign.campaign_name,
        description: campaign.description || "",
        trigger_type: campaign.trigger_type,
        target_type: campaign.target_type,
        target_ids: campaign.target_ids || [],
        status: campaign.status,
      });
      setSteps(campaign.steps || []);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Failed to load campaign");
      navigate("/drip-campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    if (currentWizardStep === 3) {
      // Add a default step for the new Step 3 design
      const newStep = {
        step_name: `Untitled Step`,
        template_id: "",
        template_name: "",
        delay_value: 1,
        delay_unit: "minutes",
        parameters: {},
        step_order: steps.length,
      };
      setSteps([...steps, newStep]);
    } else {
      // Original behavior for other steps
      setEditingStep(null);
      setEditingStepIndex(null);
      setShowStepEditor(true);
    }
  };

  const handleEditStep = (step, index) => {
    setEditingStep(step);
    setEditingStepIndex(index);
    setShowStepEditor(true);
  };

  const handlePickTemplate = (index) => {
    setTemplateSelectorIndex(index);
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (template) => {
    if (templateSelectorIndex !== null) {
      const newSteps = [...steps];
      newSteps[templateSelectorIndex] = {
        ...newSteps[templateSelectorIndex],
        template_id: template.id,
        template_name: template.element_name,
      };
      setSteps(newSteps);
      setShowTemplateSelector(false);
      setTemplateSelectorIndex(null);
      toast.success("Template selected successfully");
    }
  };

  const handleSaveStep = (stepData) => {
    if (editingStepIndex !== null) {
      // Update existing step
      const updatedSteps = [...steps];
      updatedSteps[editingStepIndex] = {
        ...updatedSteps[editingStepIndex],
        ...stepData,
        step_order: editingStepIndex,
      };
      setSteps(updatedSteps);
      toast.success("Step updated successfully");
    } else {
      // Add new step
      setSteps([
        ...steps,
        {
          ...stepData,
          step_order: steps.length,
        },
      ]);
      toast.success("Step added successfully");
    }
    setShowStepEditor(false);
    setEditingStep(null);
    setEditingStepIndex(null);
  };

  const handleDeleteStep = (index) => {
    if (!window.confirm("Are you sure you want to delete this step?")) return;

    const updatedSteps = steps.filter((_, i) => i !== index);
    // Reorder remaining steps
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      step_order: i,
    }));
    setSteps(reorderedSteps);
    toast.success("Step deleted successfully");
  };

  const handleSaveCampaign = async (status = "draft") => {
    if (!campaignData.campaign_name.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    if (steps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...campaignData,
        customer_id: user.customer_id,
        status,
        steps,
      };

      // Log the payload to see what would be sent to the backend
      console.log("=== DRIP CAMPAIGN PAYLOAD ===");
      console.log("Status:", status);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("============================");

      // BACKEND API CALLS - COMMENTED OUT FOR TESTING
      // if (isEditMode) {
      //   await axios.put(`${API_BASE}/drip-campaigns/${campaignId}`, payload, {
      //     withCredentials: true,
      //   });
      //   toast.success("Campaign updated successfully");
      // } else {
      //   await axios.post(`${API_BASE}/drip-campaigns`, payload, {
      //     withCredentials: true,
      //   });
      //   toast.success("Campaign created successfully");
      // }

      // TEMPORARY: Save to localStorage for frontend preview (without API)
      const mockCampaign = {
        campaign_id: Date.now(), // Generate a temporary ID
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Get existing campaigns from localStorage
      const existingCampaigns = JSON.parse(localStorage.getItem('temp_drip_campaigns') || '[]');
      
      if (isEditMode) {
        // Update existing campaign
        const updatedCampaigns = existingCampaigns.map(c => 
          c.campaign_id === parseInt(campaignId) ? mockCampaign : c
        );
        localStorage.setItem('temp_drip_campaigns', JSON.stringify(updatedCampaigns));
        toast.success("Campaign updated successfully (Frontend only - no API call)");
      } else {
        // Add new campaign
        existingCampaigns.push(mockCampaign);
        localStorage.setItem('temp_drip_campaigns', JSON.stringify(existingCampaigns));
        toast.success("Campaign created successfully (Frontend only - no API call)");
      }

      // Navigate to campaigns list to see the result
      navigate("/drip-campaigns", { state: { refresh: true } });
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error(error.response?.data?.message || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA89E]"></div>
      </div>
    );
  }

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (currentWizardStep === 1) {
      if (!campaignData.campaign_name.trim()) {
        toast.error("Please enter a sequence name");
        return;
      }
    }
    
    if (currentWizardStep === 2) {
      // Validate trigger settings if needed
    }
    
    setCurrentWizardStep(currentWizardStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentWizardStep(currentWizardStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Only show "Back to campaigns" button on Step 1 */}
            {currentWizardStep === 1 && (
              <button
                onClick={() => navigate("/drip-campaigns")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* On Steps 2 and 3, show campaign name with back arrow that goes to previous step */}
            {currentWizardStep > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousStep}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {campaignData.campaign_name || "Sequence"}
                  </h1>
                  {currentWizardStep === 3 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded mt-1">
                      Draft
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Title - only show on Step 1 */}
            {currentWizardStep === 1 && (
              <h1 className="text-xl font-semibold text-gray-900">
                Create Sequence
              </h1>
            )}
          </div>

          {/* Action Buttons - Show on Step 3 */}
          {currentWizardStep === 3 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSaveCampaign("draft")}
                disabled={loading || steps.length === 0}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => handleSaveCampaign("active")}
                disabled={loading || steps.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish & Close
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                ⋮
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          
          {/* Step 1: Basic Information */}
          {currentWizardStep === 1 && (
            <div>
          {/* Basic Info Section */}
          <div className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sequence Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignData.campaign_name}
                  onChange={(e) =>
                    setCampaignData({
                      ...campaignData,
                      campaign_name: e.target.value,
                    })
                  }
                  placeholder="e.g., House2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E]"
                />
              </div>

              {/* Sequence Based On */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Sequence Based on
                  <span className="text-gray-400 text-xs">ⓘ</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCampaignData({ ...campaignData, target_type: "all_contacts" })
                    }
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      campaignData.target_type === "all_contacts"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                     Contacts
                  </button>
                  {/* <button
                    onClick={() =>
                      setCampaignData({ ...campaignData, target_type: "group" })
                    }
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      campaignData.target_type === "group"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                     Groups
                  </button> */}
                </div>
              </div>

              {/* Send From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send from <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-green-600">📱</span>
                    <span className="text-gray-700">TastyFood</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What is Sequence Info Box */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src="https://via.placeholder.com/150x200?text=Sequence+Flow"
                  alt="Sequence illustration"
                  className="w-32 h-auto rounded"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">What is Sequence</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Sequence allows you to send multiple WhatsApp Templates to your customers based on certain triggers and intervals.
                </p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Create a sequence</li>
                  <li>Set the condition triggers</li>
                  <li>Add steps - message templates</li>
                  <li>Add delays</li>
                  <li>Execute</li>
                </ol>
              </div>
            </div>
          </div>

              {/* Next Button */}
              <div className="flex justify-start">
                <button
                  onClick={handleNextStep}
                  disabled={!campaignData.campaign_name}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Trigger and Conditions */}
          {currentWizardStep === 2 && (
            <div>
              {/* Sequence Type Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Sequence Type: Based on enrollment date
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        📋 Contacts
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        📱 TastyFood
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      The sequence will be triggered based on the enrollment date with conditions.
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    ▲
                  </button>
                </div>
              </div>

              {/* Set trigger and conditions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Set trigger and conditions
                </h3>

                {/* Trigger */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trigger"
                        value="on_create"
                        checked={campaignData.trigger_type === "on_create"}
                        onChange={(e) =>
                          setCampaignData({ ...campaignData, trigger_type: e.target.value })
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm">On create</span>
                      <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trigger"
                        value="on_update"
                        checked={campaignData.trigger_type === "on_update"}
                        onChange={(e) =>
                          setCampaignData({ ...campaignData, trigger_type: e.target.value })
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm">On update</span>
                      <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trigger"
                        value="both"
                        checked={campaignData.trigger_type === "both"}
                        onChange={(e) =>
                          setCampaignData({ ...campaignData, trigger_type: e.target.value })
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm">Both (create & update)</span>
                      <span className="text-gray-400 text-xs">ⓘ</span>
                    </label>
                  </div>
                </div>

                {/* Start conditions */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Start conditions
                    <span className="text-gray-400 text-xs">ⓘ</span>
                  </label>
                  
                  {/* Display added conditions */}
                  {campaignData.trigger_conditions.start_conditions.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {campaignData.trigger_conditions.start_conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          <span className="text-sm text-gray-700">{condition.field}</span>
                          <button
                            onClick={() => {
                              const newConditions = campaignData.trigger_conditions.start_conditions.filter((_, i) => i !== index);
                              setCampaignData({
                                ...campaignData,
                                trigger_conditions: {
                                  ...campaignData.trigger_conditions,
                                  start_conditions: newConditions,
                                },
                              });
                            }}
                            className="ml-auto text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    type="button"
                    onClick={() => setShowConditionDropdown('start')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add
                  </button>

                  {/* Condition Dropdown */}
                  {showConditionDropdown === 'start' && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowConditionDropdown(null)}
                      />
                      <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        {[
                          { icon: "T", label: "Name" },
                          { icon: "⚙", label: "Marketing Optin" },
                          { icon: "T", label: "Phone" },
                          { icon: "T", label: "Email" },
                          { icon: "T", label: "Instagram ID" },
                          { icon: "🏷", label: "Tags" },
                          { icon: "📅", label: "Created At" },
                          { icon: "📅", label: "Updated At" },
                          { icon: "👤", label: "Creator" },
                          { icon: "👤", label: "Contact Owner" },
                        ].map((field) => (
                          <button
                            key={field.label}
                            type="button"
                            onClick={() => {
                              setEditingCondition({
                                type: 'start',
                                field: field.label,
                                operator: 'is',
                                value: '',
                              });
                              setShowConditionDropdown(null);
                              setShowConditionModal(true);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <span className="text-gray-400">{field.icon}</span>
                            {field.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Stop conditions */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Stop conditions
                    <span className="text-gray-400 text-xs">ⓘ</span>
                  </label>
                  
                  {/* Display added conditions */}
                  {campaignData.trigger_conditions.stop_conditions.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {campaignData.trigger_conditions.stop_conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            condition.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {condition.type}
                          </span>
                          <span className="text-sm text-gray-700">{condition.field}</span>
                          <button
                            onClick={() => {
                              const newConditions = campaignData.trigger_conditions.stop_conditions.filter((_, i) => i !== index);
                              setCampaignData({
                                ...campaignData,
                                trigger_conditions: {
                                  ...campaignData.trigger_conditions,
                                  stop_conditions: newConditions,
                                },
                              });
                            }}
                            className="ml-auto text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowConditionDropdown('stop_success')}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      + Success
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowConditionDropdown('stop_failure')}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      + Failure
                    </button>
                  </div>

                  {/* Condition Dropdown for Stop conditions */}
                  {(showConditionDropdown === 'stop_success' || showConditionDropdown === 'stop_failure') && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowConditionDropdown(null)}
                      />
                      <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        {[
                          { icon: "T", label: "Name" },
                          { icon: "⚙", label: "Marketing Optin" },
                          { icon: "T", label: "Phone" },
                          { icon: "T", label: "Email" },
                          { icon: "T", label: "Instagram ID" },
                          { icon: "🏷", label: "Tags" },
                          { icon: "📅", label: "Created At" },
                          { icon: "📅", label: "Updated At" },
                          { icon: "👤", label: "Creator" },
                          { icon: "👤", label: "Contact Owner" },
                        ].map((field) => (
                          <button
                            key={field.label}
                            type="button"
                            onClick={() => {
                              setEditingCondition({
                                type: 'stop',
                                stopType: showConditionDropdown === 'stop_success' ? 'success' : 'failure',
                                field: field.label,
                                operator: 'is',
                                value: '',
                              });
                              setShowConditionDropdown(null);
                              setShowConditionModal(true);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <span className="text-gray-400">{field.icon}</span>
                            {field.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Set sequence delivery preference */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-1">
                  Set sequence delivery preference
                  <span className="text-gray-400 text-xs">ⓘ</span>
                </h3>

                {/* Days */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["All days", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const dayValue = day === "All days" ? "all" : day.toLowerCase();
                      const isAllDays = campaignData.delivery_preferences.days.includes("all");
                      // If "All days" is selected, all buttons should be green
                      const isSelected = isAllDays || campaignData.delivery_preferences.days.includes(dayValue);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (day === "All days") {
                              // Select all days
                              setCampaignData({
                                ...campaignData,
                                delivery_preferences: {
                                  ...campaignData.delivery_preferences,
                                  days: ["all"],
                                },
                              });
                            } else {
                              // Toggle individual day
                              const currentDays = campaignData.delivery_preferences.days.filter(d => d !== "all");
                              const newDays = currentDays.includes(dayValue)
                                ? currentDays.filter(d => d !== dayValue)
                                : [...currentDays, dayValue];
                              
                              setCampaignData({
                                ...campaignData,
                                delivery_preferences: {
                                  ...campaignData.delivery_preferences,
                                  days: newDays.length === 0 ? ["all"] : newDays,
                                },
                              });
                            }
                          }}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            isSelected
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Time
                    <span className="text-gray-400 text-xs">ⓘ</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select 
                      value={campaignData.delivery_preferences.time_type || "any"}
                      onChange={(e) => {
                        setCampaignData({
                          ...campaignData,
                          delivery_preferences: {
                            ...campaignData.delivery_preferences,
                            time_type: e.target.value,
                            time_from: e.target.value === "range" ? "09:00" : null,
                            time_to: e.target.value === "range" ? "17:00" : null,
                          },
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="any">Any time</option>
                      <option value="range">Time range</option>
                    </select>

                    {/* Show time range inputs if "Time range" is selected */}
                    {campaignData.delivery_preferences.time_type === "range" && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={campaignData.delivery_preferences.time_from || "09:00"}
                            onChange={(e) =>
                              setCampaignData({
                                ...campaignData,
                                delivery_preferences: {
                                  ...campaignData.delivery_preferences,
                                  time_from: e.target.value,
                                },
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-500">→</span>
                          <input
                            type="time"
                            value={campaignData.delivery_preferences.time_to || "17:00"}
                            onChange={(e) =>
                              setCampaignData({
                                ...campaignData,
                                delivery_preferences: {
                                  ...campaignData.delivery_preferences,
                                  time_to: e.target.value,
                                },
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}

                    {campaignData.delivery_preferences.time_type === "any" && (
                      <span className="text-sm text-gray-500">
                        ⓘ Messages can be sent anytime between 12:00 am to 11:59 pm
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaignData.delivery_preferences.allow_once}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          delivery_preferences: {
                            ...campaignData.delivery_preferences,
                            allow_once: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Allow contacts to enter this sequence only once
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaignData.delivery_preferences.continue_after_delivery}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          delivery_preferences: {
                            ...campaignData.delivery_preferences,
                            continue_after_delivery: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Continue Sequence only after message is successfully delivered
                    </span>
                  </label>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-start gap-2">
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Message Steps */}
          {currentWizardStep === 3 && (
            <div>
              {/* Sequence Summary Header - Collapsible */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Sequence Type: Based on enrollment date
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Trigger:</span>
                        <span>On create</span>
                      </div>
                      <span>|</span>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>Any time</span>
                      </div>
                      <span>|</span>
                      <div className="flex gap-1">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center gap-1">
                        📋 Contacts
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    ▼
                  </button>
                </div>
              </div>

              {/* Steps with Timeline */}
              <div>
                {steps.map((step, index) => (
                  <div key={index}>
                    {/* Timeline connector before step */}
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-px bg-gray-300"></div>
                    </div>

                    {/* Timing badge before first step OR between steps */}
                    {index === 0 ? (
                      // First step - show timing from enrollment
                      <>
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <span>⏱️</span>
                            <span>After {step.delay_value || 1} {step.delay_unit || "minute"}{(step.delay_value || 1) > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-px bg-gray-300"></div>
                        </div>
                      </>
                    ) : null}

                    {/* Step Card */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                      {/* Step Header */}
                      <div className={`p-4 ${!stepCollapsed[index] ? 'border-b border-gray-200' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-600">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={step.step_name || "Untitled Step"}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[index] = { ...newSteps[index], step_name: e.target.value };
                                setSteps(newSteps);
                              }}
                              className="font-medium text-gray-900 border-none focus:outline-none bg-transparent"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              ⇅
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              📋
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              🗑️
                            </button>
                            <button 
                              onClick={() => {
                                setStepCollapsed({
                                  ...stepCollapsed,
                                  [index]: !stepCollapsed[index]
                                });
                              }}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500"
                            >
                              {stepCollapsed[index] ? '▼' : '▲'}
                            </button>
                          </div>
                        </div>
                        
                        {/* Time and Days badges - Only show when NOT collapsed */}
                        {!stepCollapsed[index] && (
                          <div className="flex items-center gap-2 mt-2 ml-9">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span>⏱️</span>
                              <span>Any time</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <div className="flex gap-1">
                              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step Body - Only show when NOT collapsed */}
                      {!stepCollapsed[index] && (
                        <div className="p-4">
                        {/* Send after */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send after <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={step.delay_value || 1}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[index] = { ...newSteps[index], delay_value: parseInt(e.target.value) || 0 };
                                setSteps(newSteps);
                              }}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                              value={step.delay_unit || "hours"}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[index] = { ...newSteps[index], delay_unit: e.target.value };
                                setSteps(newSteps);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                            <span className="text-sm text-cyan-500 font-medium">
                              {index === 0 ? "From Enrollment" : "From previous step"}
                            </span>
                          </div>
                        </div>

                        {/* Send Message */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send Message <span className="text-red-500">*</span>
                          </label>
                          {step.template_id ? (
                            <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                              <span className="flex-1 text-sm text-gray-900">{step.template_name}</span>
                              <button
                                onClick={() => handleEditStep(step, index)}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePickTemplate(index)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                            >
                              <span>+</span>
                              <span>Pick template</span>
                            </button>
                          )}
                        </div>

                        {/* Set custom delivery preference */}
                        <div className="mb-4">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300"
                              checked={stepCustomDelivery[index] || false}
                              onChange={(e) => {
                                setStepCustomDelivery({
                                  ...stepCustomDelivery,
                                  [index]: e.target.checked
                                });
                              }}
                            />
                            <span>Set custom delivery preference</span>
                            <span className="text-gray-400 text-xs">ⓘ</span>
                          </label>
                        </div>

                        {/* Custom Delivery Options - Show when checkbox is checked */}
                        {stepCustomDelivery[index] && (
                          <div className="space-y-4 mt-4">
                            {/* Days */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Days <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2 flex-wrap">
                                {[
                                  { label: "All days", value: "all" },
                                  { label: "Mon", value: "mon" },
                                  { label: "Tue", value: "tue" },
                                  { label: "Wed", value: "wed" },
                                  { label: "Thu", value: "thu" },
                                  { label: "Fri", value: "fri" },
                                  { label: "Sat", value: "sat" },
                                  { label: "Sun", value: "sun" },
                                ].map((day) => {
                                  const customDays = step.custom_days || ["all"];
                                  const isAllDays = customDays.includes("all");
                                  const isSelected = isAllDays || customDays.includes(day.value);
                                  
                                  return (
                                    <button
                                      key={day.value}
                                      type="button"
                                      onClick={() => {
                                        const newSteps = [...steps];
                                        if (day.value === "all") {
                                          // Select all days
                                          newSteps[index] = { ...newSteps[index], custom_days: ["all"] };
                                        } else {
                                          // Toggle individual day
                                          const currentDays = (newSteps[index].custom_days || ["all"]).filter(d => d !== "all");
                                          const newDays = currentDays.includes(day.value)
                                            ? currentDays.filter(d => d !== day.value)
                                            : [...currentDays, day.value];
                                          
                                          newSteps[index] = { 
                                            ...newSteps[index], 
                                            custom_days: newDays.length === 0 ? ["all"] : newDays 
                                          };
                                        }
                                        setSteps(newSteps);
                                      }}
                                      className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                                        isSelected
                                          ? "bg-green-100 text-green-700 border-green-300"
                                          : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                                      }`}
                                    >
                                      {day.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Time */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                Time <span className="text-gray-400 text-xs">ⓘ</span> <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <select 
                                  value={step.custom_time_type || "any"}
                                  onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[index] = { ...newSteps[index], custom_time_type: e.target.value };
                                    setSteps(newSteps);
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  <option value="any">Any time</option>
                                  <option value="range">Time range</option>
                                </select>
                                
                                {/* Show time range inputs when "Time range" is selected */}
                                {step.custom_time_type === "range" ? (
                                  <>
                                    <input
                                      type="time"
                                      value={step.custom_time_from || ""}
                                      onChange={(e) => {
                                        const newSteps = [...steps];
                                        newSteps[index] = { ...newSteps[index], custom_time_from: e.target.value };
                                        setSteps(newSteps);
                                      }}
                                      placeholder="--:--"
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="button" className="text-gray-400 hover:text-gray-600">
                                      🕐
                                    </button>
                                    <span className="text-gray-400">→</span>
                                    <input
                                      type="time"
                                      value={step.custom_time_to || ""}
                                      onChange={(e) => {
                                        const newSteps = [...steps];
                                        newSteps[index] = { ...newSteps[index], custom_time_to: e.target.value };
                                        setSteps(newSteps);
                                      }}
                                      placeholder="--:--"
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="button" className="text-gray-400 hover:text-gray-600">
                                      🕐
                                    </button>
                                  </>
                                ) : (
                                  /* Info message - only show when "Any time" is selected */
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="text-gray-400">ⓘ</span>
                                    <span>Messages can be sent anytime between 12:00 am to 11:59 pm</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    {/* Timeline connector after step with timing badge */}
                    {index < steps.length - 1 && (
                      <>
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-px bg-gray-300"></div>
                        </div>
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <span>⏱️</span>
                            <span>After {steps[index + 1]?.delay_value || 1} {steps[index + 1]?.delay_unit || "minute"}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-px bg-gray-300"></div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Step Button - Only show if less than 10 steps */}
              {steps.length < 10 && (
                <>
                  {/* Timeline connector before Add button */}
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-px bg-gray-300"></div>
                  </div>

                  {/* Add Step Button */}
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={handleAddStep}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add step
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Step Editor Modal */}
      {showStepEditor && (
        <StepEditor
          step={editingStep}
          index={editingStepIndex ?? steps.length}
          templates={templates}
          onSave={handleSaveStep}
          onClose={() => {
            setShowStepEditor(false);
            setEditingStep(null);
            setEditingStepIndex(null);
          }}
        />
      )}

      {/* Template Selector Modal - Direct from Step 3 */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Select Template</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a WhatsApp template for this step</p>
              </div>
              <button
                onClick={() => {
                  setShowTemplateSelector(false);
                  setTemplateSelectorIndex(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {templates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No templates available</p>
                  <button
                    onClick={() => navigate('/templates')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Template
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => {
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {templates.length} template{templates.length !== 1 ? 's' : ''} available
              </span>
              <button
                onClick={() => {
                  setShowTemplateSelector(false);
                  setTemplateSelectorIndex(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Condition Configuration Modal */}
      {showConditionModal && editingCondition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xl">T</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCondition.field}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowConditionModal(false);
                  setEditingCondition(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* Condition Rows */}
              {(editingCondition.conditions || [{ operator: 'is', value: '' }]).map((condition, index) => (
                <div key={index}>
                  {/* AND label for subsequent conditions */}
                  {index > 0 && (
                    <div className="text-xs font-medium text-gray-500 mb-2">AND</div>
                  )}
                  
                  {/* Operator */}
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      value={condition.operator}
                      onChange={(e) => {
                        const newConditions = [...(editingCondition.conditions || [{ operator: 'is', value: '' }])];
                        newConditions[index] = { ...newConditions[index], operator: e.target.value };
                        setEditingCondition({ ...editingCondition, conditions: newConditions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="is">Is</option>
                      <option value="is_not">Is not</option>
                      <option value="contains">Contains</option>
                      <option value="not_contains">Does not contain</option>
                      <option value="starts_with">Starts with</option>
                      <option value="ends_with">Ends with</option>
                      <option value="is_empty">Is empty</option>
                      <option value="is_not_empty">Is not empty</option>
                    </select>
                    {(editingCondition.conditions || []).length > 1 && (
                      <button 
                        onClick={() => {
                          const newConditions = (editingCondition.conditions || []).filter((_, i) => i !== index);
                          setEditingCondition({ ...editingCondition, conditions: newConditions });
                        }}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Value */}
                  {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => {
                          const newConditions = [...(editingCondition.conditions || [{ operator: 'is', value: '' }])];
                          newConditions[index] = { ...newConditions[index], value: e.target.value };
                          setEditingCondition({ ...editingCondition, conditions: newConditions });
                        }}
                        placeholder="Value"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="text-gray-400 hover:text-gray-600">
                        +
                      </button>
                      <button 
                        onClick={() => {
                          const newConditions = (editingCondition.conditions || []).filter((_, i) => i !== index);
                          setEditingCondition({ ...editingCondition, conditions: newConditions.length > 0 ? newConditions : [{ operator: 'is', value: '' }] });
                        }}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Condition Button */}
              <button 
                onClick={() => {
                  const currentConditions = editingCondition.conditions || [{ operator: 'is', value: '' }];
                  setEditingCondition({
                    ...editingCondition,
                    conditions: [...currentConditions, { operator: 'is', value: '' }],
                  });
                }}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Condition
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowConditionModal(false);
                  setEditingCondition(null);
                }}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const conditions = editingCondition.conditions || [{ operator: 'is', value: '' }];
                  
                  if (editingCondition.type === 'start') {
                    setCampaignData({
                      ...campaignData,
                      trigger_conditions: {
                        ...campaignData.trigger_conditions,
                        start_conditions: [
                          ...campaignData.trigger_conditions.start_conditions,
                          {
                            field: editingCondition.field,
                            conditions: conditions,
                          },
                        ],
                      },
                    });
                  } else {
                    setCampaignData({
                      ...campaignData,
                      trigger_conditions: {
                        ...campaignData.trigger_conditions,
                        stop_conditions: [
                          ...campaignData.trigger_conditions.stop_conditions,
                          {
                            type: editingCondition.stopType,
                            field: editingCondition.field,
                            conditions: conditions,
                          },
                        ],
                      },
                    });
                  }
                  setShowConditionModal(false);
                  setEditingCondition(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DripCampaignEditor;
