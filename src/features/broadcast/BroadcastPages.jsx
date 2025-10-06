import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import SendTemplate from "../chats/chatfeautures/SendTemplate";
import BroadcastForm from "./components/BroadcastForm";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const BroadcastPages = ({ onClose, showCustomAlert, onBroadcastCreated }) => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    broadcastName: "",
    group_id: [],
    messageType: "Pre-approved template message",
    schedule: "No",
    selectedTemplate: location.state?.selectedTemplate || null,
    directContacts: location.state?.contacts || null,
    isDirectBroadcast: location.state?.directBroadcast || false,
  });

  const { user, wabaInfo } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [customerLists, setCustomerLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear location state after using it
  useEffect(() => {
    if (location.state?.selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        selectedTemplate: location.state.selectedTemplate,
      }));
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleTemplateSelect = useCallback((template) => {
    setFormData(prev => ({
      ...prev,
      selectedTemplate: template,
      
    }));
    setIsTemplateOpen(false);
  }, []);

  // Fetch customer lists
  useEffect(() => {
    let isMounted = true;

    const fetchCustomerLists = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.GROUPS.GET_ALL}?customer_id=${user?.customer_id}`,
          { headers: { "Content-Type": "application/json" }, credentials: "include" }
        );

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();

        if (isMounted && result.success && Array.isArray(result.data)) {
          setCustomerLists(result.data);
          setError(null);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching customer lists:", err);
          setError("Unable to load customer lists. Please try again later.");
          setCustomerLists([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCustomerLists();
    return () => { isMounted = false; };
  }, [user?.customer_id]);

  // Input handlers
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (e, mediaType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [mediaType]: reader.result }));
    reader.readAsDataURL(file);
  };

  const getMessageLimit = () => {
    if (!wabaInfo?.messagingLimit) return 250;
    const tierLimits = { TIER_1K: 1000, TIER_10K: 10000, TIER_100K: 100000 };
    return tierLimits[wabaInfo.messagingLimit] || 250;
  };

  // Submit broadcast
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const messageLimit = getMessageLimit();
      let totalContacts = 0;

      if (formData.isDirectBroadcast) {
        totalContacts = formData.directContacts?.length || 0;
      } else if (formData.group_id?.length > 0) {
        totalContacts = formData.group_id.reduce((sum, groupId) => {
          const group = customerLists?.find(g => g.group_id === groupId);
          return sum + (group?.total_contacts || 0);
        }, 0);
      }

      if (totalContacts > messageLimit) {
        throw new Error(
          `You can only send to a maximum of ${messageLimit.toLocaleString()} contacts. Your selection contains ${totalContacts.toLocaleString()} contacts.`
        );
      }

      const broadcastData = {
        customer_id: user?.customer_id,
        broadcastName: formData.broadcastName,
        messageType: formData.messageType,
        schedule: formData.schedule,
        scheduleDate: selectedDate ? selectedDate.toISOString() : "",
        date: formData.schedule === "Yes" && selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
        status: formData.schedule === "No" ? "Live" : "Scheduled",
        type: formData.isDirectBroadcast ? "Direct Broadcast" : "Manual Broadcast",
      };

      if (formData.isDirectBroadcast && formData.directContacts) {
        broadcastData.contacts = formData.directContacts;
        broadcastData.total_contacts = formData.directContacts.length;
      } else {
        broadcastData.group_id = Array.isArray(formData.group_id) ? formData.group_id[0] : formData.group_id;
      }

      if (formData.selectedTemplate) {
        broadcastData.template_id = formData.selectedTemplate.id;
        broadcastData.template_name = formData.selectedTemplate.element_name;
      
        if (formData.templateParameters?.length > 0) {
          const headerParam = formData.templateParameters.find(p =>
            ["image", "video", "document"].includes(p.type)
          );
      
          if (headerParam) {
            broadcastData.headerType = headerParam.type;             
            broadcastData.headerValue = headerParam.image?.id || ""; 
            broadcastData.headerIsId = true;                         
          }

          const bodyParams = formData.templateParameters
            .filter(p => p.type === "text")
            .map(p => p.value || "");
          if (bodyParams.length > 0) {
            broadcastData.parameters = bodyParams;
          }
        }
      }
      

      const endpoint = formData.isDirectBroadcast ? API_ENDPOINTS.BROADCASTS.GET_DIRECT : API_ENDPOINTS.BROADCASTS.GET_CUSTOMERS;

      console.log('Sending request to:', endpoint);
      console.log('Request data:', broadcastData);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(broadcastData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to create broadcast");

      const successMessage = formData.isDirectBroadcast
        ? `Broadcast sent to ${broadcastData.total_contacts} contacts!`
        : "Broadcast created successfully!";

      toast.success(successMessage);
      onBroadcastCreated();
      onClose();
      navigate("/broadcast", { replace: true });

    } catch (err) {
      setError(err.message || "Unable to save broadcast. Please try again later.");
      toast.error(err.message || "Failed to save broadcast. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTemplate = () => setIsTemplateOpen(true);
  const closeTemplate = () => setIsTemplateOpen(false);

  const confirmExit = () => {
    onClose();
    navigate("/broadcast");
    setShowExitDialog(false);
  };
  const cancelExit = () => setShowExitDialog(false);

  // Check for unsaved changes
  const hasUnsavedChanges = Object.entries(formData).some(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) return Object.keys(value).length > 0;
    return value && !["Select Customer List", "Text Message", "Pre-approved template message", "No"].includes(value);
  });

  // Warn on browser close if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (hasUnsavedChanges) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <>
      <div className="p-3 sm:p-4 md:p-10 lg:p-5 xl:p-8 font-poppins">
        <BroadcastForm
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          step={step}
          setStep={setStep}
          handleRadioChange={handleRadioChange}
          handleMediaChange={handleMediaChange}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isTemplateOpen={isTemplateOpen}
          openTemplate={openTemplate}
          closeTemplate={closeTemplate}
          SendTemplate={SendTemplate}
          loading={loading}
          error={error}
          customerLists={customerLists}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onTemplateSelect={handleTemplateSelect}
          wabaInfo={wabaInfo}
        />
      </div>

      <ConfirmationDialog
        showExitDialog={showExitDialog}
        hasUnsavedChanges={hasUnsavedChanges}
        cancelExit={cancelExit}
        confirmExit={confirmExit}
      />
    </>
  );
};

export default BroadcastPages;
