import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import pricingData from "../../../pricing.json";
import { toast } from "react-toastify";

export const useBroadcastForm = (
  formData,
  setFormData,
  customerLists,
  onTemplateSelect,
  step,
  setStep,
  selectedDate,
  setSelectedDate,
  wabaInfo
) => {
  const location = useLocation();
  
  // Define step sequence after hooks
  const getStepSequence = useCallback(() => {
    const isDirectBroadcast = location.state?.directBroadcast || formData.isDirectBroadcast;
    const sequence = [1, 2, 3, 4, 5]; // Always include all steps
    
    // console.group('getStepSequence');
    // console.log('location.state.directBroadcast:', location.state?.directBroadcast);
    // console.log('formData.isDirectBroadcast:', formData.isDirectBroadcast);
    // console.log('isDirectBroadcast:', isDirectBroadcast);
    // console.log('Returning sequence:', sequence);
    // console.groupEnd();
    
    return sequence;
  }, [location.state?.directBroadcast, formData.isDirectBroadcast]);
  
  // Log when step changes
  useEffect(() => {
    // console.group('Step Change');
    // console.log('Current step:', step);
    // const sequence = getStepSequence();
    // console.log('Current sequence:', sequence);
    // console.log('Is valid step:', sequence.includes(step));
    // console.log('Current step index:', sequence.indexOf(step));
    // console.groupEnd();
    
    // Ensure we don't stay on step 2 for direct broadcasts
    const isDirectBroadcast = location.state?.directBroadcast || formData.isDirectBroadcast;
    if (isDirectBroadcast && step === 2) {
      setStep(3); // Skip step 2 for direct broadcasts
    }
  }, [step, getStepSequence, setStep, location.state?.directBroadcast, formData.isDirectBroadcast]);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [availableWCC, setAvailableWCC] = useState(0);
  const { user } = useAuth();
  const [templatesError, setTemplatesError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    isLoadingMore: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const [filteredCustomerLists, setFilteredCustomerLists] = useState(customerLists || []);
  
  // Get the message limit based on the user's WABA tier
  const getMessageLimit = (wabaInfo) => {
    if (!wabaInfo?.messagingLimit) return 250; // Default to 250 if no tier info

    const tierLimits = {
      'TIER_1K': 1000,
      'TIER_10K': 10000,
      'TIER_100K': 100000,
      // Add more tiers as needed
    };

    return tierLimits[wabaInfo.messagingLimit] || 250; // Default to 250 if tier not found
  };
  
  const messageLimit = getMessageLimit(wabaInfo);
  const [warningMessage, setWarningMessage] = useState("");
  
  // Step navigation helpers
  const getCurrentStepIndex = useCallback(() => {
    const sequence = getStepSequence();
    return sequence.indexOf(step);
  }, [step, getStepSequence]);

  // Template fetching
  const fetchTemplates = useCallback(
    async (page = 1, append = false, searchTerm = "") => {
      if (!user?.customer_id) {
        setTemplatesError("Missing customer ID");
        return;
      }

      if (page === 1) {
      setTemplatesLoading(true);
    } else {
      setPagination(prev => ({ ...prev, isLoadingMore: true }));
    }
    setTemplatesError(null);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user.customer_id}&page=${page}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No templates found for this search
          setTemplates(prev => append ? prev : []);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            hasMore: false,
            isLoadingMore: false,
          });
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.templates)) {
        const normalizedTemplates = data.templates.map(t => ({
          ...t,
          container_meta: {
            ...t.container_meta,
            sampleText: t.container_meta?.sampleText || t.container_meta?.sample_text,
          },
        }));

        setTemplates(prev =>
          append ? [...prev, ...normalizedTemplates] : normalizedTemplates
        );

        const { page: current = page, totalPages = 1 } = data.pagination || {};
        setPagination({
          currentPage: current,
          totalPages,
          hasMore: current < totalPages,
          isLoadingMore: false,
        });
      } else {
       
        setTemplates(append ? templates : []);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
          isLoadingMore: false,
        });
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setTemplatesError("Failed to fetch templates");
    } finally {
      setTemplatesLoading(false);
    }
  },
  [user?.customer_id]
);

  const loadMoreTemplates = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      fetchTemplates(pagination.currentPage + 1, true);
    }
  }, [pagination.hasMore, pagination.isLoadingMore, pagination.currentPage, fetchTemplates]);

  // Wallet balance fetching
  const fetchWalletBalance = useCallback(async () => {
    if (!user?.customer_id) return;

    const url = `${API_ENDPOINTS.CREDIT.GRAPH}?customer_id=${user.customer_id}`;

    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.total_credit_remaining !== 'undefined') {
        setAvailableWCC(Number(data.total_credit_remaining));
      } else {
        setAvailableWCC(0);
      }
    } catch (error) {
      console.error('Error in fetchWalletBalance:', error.message);
      setAvailableWCC(0);
    }
  }, [user?.customer_id]);

  // Debug effect for step changes
  const stepDebugEffect = useCallback(() => {
    console.log('Current step changed to:', step);
    const sequence = getStepSequence();
    console.log('Current sequence:', sequence);
    console.log('Is last step:', step === sequence[sequence.length - 1]);
  }, [step, getStepSequence]);

  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

  // Debug effect for validation errors
  useEffect(() => {
    console.log('Current validation errors:', validationErrors);
  }, [validationErrors]);

  // Initial data fetching
  useEffect(() => {
    if (user?.customer_id) {
      fetchTemplates(1, false);
      fetchWalletBalance();
    }
  }, [user?.customer_id, fetchTemplates, fetchWalletBalance]);

  // Template selection from location state
  useEffect(() => {
    if (location.state?.selectedTemplate) {
      onTemplateSelect(location.state.selectedTemplate);
    }
  }, [location.state, onTemplateSelect]);

  // Customer list filtering
  useEffect(() => {
    if (!customerLists) {
      setFilteredCustomerLists([]);
      return;
    }

    const filtered = customerLists.filter((list) =>
      list.group_name?.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
    setFilteredCustomerLists(filtered);
  }, [customerSearchTerm, customerLists]);

  // Selected groups calculation
  const selectedGroups = useMemo(() => {
    if (!customerLists || !formData.group_id) return [];
    return customerLists.filter((c) => formData.group_id.includes(c.group_id));
  }, [customerLists, formData.group_id]);

  const totalSelectedContacts = useMemo(() => {
    // For direct broadcasts, use the length of the directContacts array
    if (formData.isDirectBroadcast) {
      return formData.directContacts?.length || 0;
    }
    // For group broadcasts, sum up contacts from selected groups
    if (!formData.group_id || formData.group_id.length === 0) return 0;
    
    console.log('Selected groups:', selectedGroups);
    console.log('Group IDs:', formData.group_id);
    
    const total = selectedGroups.reduce((sum, group) => {
      console.log('Processing group:', group.group_name, 'with contacts:', group.total_contacts);
      return sum + (parseInt(group.total_contacts) || 0);
    }, 0);
    
    console.log('Total contacts calculated:', total);
    return total;
  }, [selectedGroups, formData.isDirectBroadcast, formData.directContacts, formData.group_id]);

  // Cost calculation
  useEffect(() => {
    if (!formData.selectedTemplate) {
      // console.log('No template selected, setting cost to 0');
      setEstimatedCost(0);
      return;
    }
    
    let contactCount = 0;
    
    if (formData.isDirectBroadcast && formData.directContacts?.length > 0) {
      contactCount = formData.directContacts.length;
    } else {
      contactCount = totalSelectedContacts;
    }
    
    const category = formData.selectedTemplate.category?.toLowerCase() || "marketing";
    const country = formData.country || "India";
    const countryPricing = pricingData[country] || pricingData["All other countries"];
    const matchingCategory = Object.keys(countryPricing || {}).find(
      key => key.toLowerCase() === category.toLowerCase()
    ) || "marketing";
    
    const costPerMessage = countryPricing?.[matchingCategory] ?? 0.88;
    const calculatedCost = contactCount * costPerMessage;
    setEstimatedCost(calculatedCost);
  }, [formData.selectedTemplate, formData.group_id, formData.country, totalSelectedContacts]);


  // Step navigation

  // Validation
  const validateStep = useCallback((currentStep) => {
    console.log('Validating step:', currentStep);
    const newErrors = {};
    const isDirectBroadcast = location.state?.directBroadcast || formData.isDirectBroadcast;
    const sequence = getStepSequence();
    const isFinalStep = currentStep === sequence[sequence.length - 1]; // Last step in sequence
    
    console.log('isDirectBroadcast:', isDirectBroadcast, 'currentStep:', currentStep, 'isFinalStep:', isFinalStep);
    
    // Adjust step for direct broadcast flow
    let adjustedStep = currentStep;
    if (isDirectBroadcast && currentStep >= 2) {
      adjustedStep = currentStep + 1;
    }
    
    console.log('isDirectBroadcast:', isDirectBroadcast, 'currentStep:', currentStep, 'adjustedStep:', adjustedStep, 'isFinalStep:', isFinalStep);

    // Common validation for contact limits - only runs on final step
    const validateContactLimits = () => {
      if (isFinalStep && totalSelectedContacts > messageLimit) {
        newErrors.audience = `You can only send to a maximum of ${messageLimit.toLocaleString()} contacts at once`;
        toast.error(`You can only send to a maximum of ${messageLimit.toLocaleString()} contacts`, {
          toastId: 'contactLimitExceeded',
          autoClose: 5000
        });
        return false;
      }
      return true;
    };

    switch (adjustedStep) {
      case 1:
        if (!formData.broadcastName?.trim()) {
          newErrors.broadcastName = "Campaign name is required";
          toast.error("Campaign name is required", { 
            toastId: "broadcastNameRequiredStep1",
            autoClose: 3000
          });
        }
        break;

      case 2:
        if (!isDirectBroadcast) {
          if (!Array.isArray(formData.group_id) || formData.group_id.length === 0) {
            newErrors.group_id = "Please select at least one group";
            toast.error("Please select at least one group", {
              toastId: 'noGroupSelected',
              autoClose: 3000
            });
          }
        } else if (formData.isDirectBroadcast) {
          if (!formData.directContacts || formData.directContacts.length === 0) {
            newErrors.audience = "Please add at least one contact";
            toast.error("Please add at least one contact", {
              toastId: 'noContactsAdded',
              autoClose: 3000
            });
          }
        }
        break;

      case 3:
        if (!formData.selectedTemplate) {
          newErrors.template = "Please select a template";
          toast.error("Please select a template", { 
            toastId: "templateRequiredStep3",
            autoClose: 3000
          });
        } else if (formData.templatePlaceholders?.length > 0) {
          // Check if all placeholders are filled
          const emptyPlaceholders = formData.templateParameters?.some(
            (param, index) => !param?.trim() && formData.templatePlaceholders[index]
          );
          
          if (emptyPlaceholders) {
            newErrors.template = "Please fill in all template variables";
            toast.error("Please fill in all template variables", {
              toastId: "templateVariablesRequired",
              autoClose: 3000
            });
          }
        }
        break;
      case 4:
        // Only validate schedule on step 4, not contact limits
        if (formData.schedule === "Yes" && !selectedDate) {
          newErrors.schedule = "Please select a date and time";
          toast.error("Please select a date and time", {
            toastId: 'scheduleRequired',
            autoClose: 3000
          });
        }
        break;

      case 5:
        // Final validation before submission
        if (!formData.broadcastName?.trim()) {
          newErrors.broadcastName = "Campaign name is required";
        }
        if (!isDirectBroadcast && (!Array.isArray(formData.group_id) || formData.group_id.length === 0)) {
          newErrors.group_id = "Please select at least one group";
        }
        // Only validate contact limits on final step
        if (isFinalStep) {
          validateContactLimits();
        }
        if (!formData.selectedTemplate) {
          newErrors.template = "Please select a template";
        }
        if (formData.schedule === "Yes" && !selectedDate) {
          newErrors.schedule = "Please select a date and time";
        }
        break;
    }

  setValidationErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [formData, selectedDate, location.state?.directBroadcast, totalSelectedContacts, messageLimit]);

const validateForm = useCallback(() => {
  const sequence = getStepSequence();
  const finalStep = sequence[sequence.length - 1];
  return validateStep(finalStep);
}, [getStepSequence, validateStep]);

const handleNext = useCallback(() => {
  console.log('Current step before validation:', step);
  const isValid = validateStep(step);
  console.log('Is valid:', isValid);
  
  if (isValid) {
    const sequence = getStepSequence();
    const currentIndex = getCurrentStepIndex();
    console.log('Current sequence:', sequence);
    console.log('Current index:', currentIndex);
    console.log('Next step would be:', sequence[currentIndex + 1]);
    
    if (currentIndex < sequence.length - 1) {
      console.log('Setting step to:', sequence[currentIndex + 1]);
      setStep(sequence[currentIndex + 1]);
    } else {
      console.log('Already at the last step');
    }
  } else {
    console.log('Validation failed with errors:', validationErrors);
  }
}, [validateStep, getStepSequence, getCurrentStepIndex, setStep, step, validationErrors]);

const handlePrevious = useCallback(() => {
  const sequence = getStepSequence();
  const currentIndex = getCurrentStepIndex();
  if (currentIndex > 0) {
    setStep(sequence[currentIndex - 1]);
  }
}, [getStepSequence, getCurrentStepIndex, setStep]);
  return {
    // States
    templates,
    templatesLoading,
    templatesError,
    estimatedCost,
    availableWCC,
    pagination,
    validationErrors,
    templateSearchTerm,
    setTemplateSearchTerm,
    customerSearchTerm,
    setCustomerSearchTerm,
    showList,
    setShowList,
    filteredCustomerLists,
    warningMessage,
    setWarningMessage,
    selectedGroups,
    totalSelectedContacts,

    // Functions
    fetchTemplates,
    loadMoreTemplates,
    validateStep,
    validateForm, 
    handleNext,
    handlePrevious,
    getStepSequence,
    getCurrentStepIndex
  };
};