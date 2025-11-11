import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import SendTemplate from "../chats/chatfeautures/SendTemplate";
import BroadcastForm from "./components/BroadcastForm";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { getMessageLimit } from "./utils/messageLimits";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  // Submit broadcast
  const handleSubmit = async (e, { consumeQuota, totalSelectedContacts, selectedGroups, customerLists }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const messageLimit = getMessageLimit(wabaInfo);
      const totalContacts = totalSelectedContacts || 0;
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
            if (headerParam.image?.url) {
              broadcastData.headerValue = headerParam.image.url;
              broadcastData.headerIsId = false;  
            } else if (headerParam.image?.id) {
              broadcastData.headerValue = headerParam.image.id;
              broadcastData.headerIsId = true;   
            }
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
      
      // Check for errors in response even if status is 200
      if (!response.ok || (result.success === false)) {
        throw new Error(result.message || "Failed to create broadcast");
      }
      
      const successMessage = formData.isDirectBroadcast
        ? `Broadcast sent to ${broadcastData.total_contacts} contacts!`
        : "Broadcast created successfully!";
      // toast.success(successMessage);
      
      if (consumeQuota && totalContacts > 0) {
        try {
          let contactIds = [];
          if (formData.isDirectBroadcast && formData.directContacts) {
            contactIds = formData.directContacts.map(contact => {
             
              if (contact.contact_id) {
                return String(contact.contact_id);
              }
              const phoneNumber = contact.Phone || contact.phone || contact.phoneNumber || contact.mobile_no;
              const countryCode = contact.CountryCode || contact.country_code || '';
              if (phoneNumber) {
                return `${countryCode}${phoneNumber}`.trim();
              }
              return contact.id ? String(contact.id) : null;
            }).filter(Boolean); // Remove any undefined/null values
          } else if (selectedGroups && Array.isArray(selectedGroups) && selectedGroups.length > 0) {

            contactIds = selectedGroups.flatMap(group => {
              if (!group) return [];
              
              // If group has contacts array, use it
              if (Array.isArray(group.contacts) && group.contacts.length > 0) {
                return group.contacts.map(contact => 
                  contact?.phone || contact?.phoneNumber || contact?.id
                ).filter(Boolean);
              }
              
              return [];
            });
          }
          
          if (contactIds.length > 0) {
            const quotaResult = consumeQuota(contactIds);
            if (quotaResult && typeof quotaResult === 'object') {
              // New format: returns { success, consumed, total }
              if (quotaResult.success) {
                if (quotaResult.consumed > 0) {
                  console.log(`✓ Quota consumed: ${quotaResult.consumed} new unique contact${quotaResult.consumed !== 1 ? 's' : ''} out of ${quotaResult.total} total`);
                } else {
                  console.log(`✓ All ${quotaResult.total} contact${quotaResult.total !== 1 ? 's' : ''} were already messaged today (no new quota consumed)`);
                }
              } else {
                console.warn('Failed to consume quota - this should not happen after validation');
              }
            } else {
              // Legacy format: returns boolean (backward compatibility)
              if (quotaResult) {
                console.log(`✓ Quota processed for ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}`);
              } else {
                console.warn('Failed to consume quota - this should not happen after validation');
              }
            }
          } else if (!formData.isDirectBroadcast) {
            console.log('Quota tracking skipped for group-based broadcast (handled server-side)');
          } else {
            console.warn('No contact IDs found for quota consumption');
          }
        } catch (quotaError) {
          console.error('Error consuming quota:', quotaError);
        }
      }
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
  const hasUnsavedChanges = Object.entries(formData).some(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) return Object.keys(value).length > 0;
    return value && !["Select Customer List", "Text Message", "Pre-approved template message", "No"].includes(value);
  });

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
          loading={false}
          error={null}
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
