import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import pricingData from "../../../pricing.json";
export const useBroadcastForm = (formData, setFormData, customerLists, onTemplateSelect, step, setStep, selectedDate, setSelectedDate) => {
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
  const location = useLocation();
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const [filteredCustomerLists, setFilteredCustomerLists] = useState(customerLists || []);
  const [warningMessage, setWarningMessage] = useState("");

  // Template fetching
  const fetchTemplates = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setTemplatesLoading(true);
    } else {
      setPagination(prev => ({ ...prev, isLoadingMore: true }));
    }
    setTemplatesError(null);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user?.customer_id}&page=${page}`,
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data && Array.isArray(data.templates)) {
        const normalizedTemplates = data.templates.map((t) => ({
          ...t,
          container_meta: {
            ...t.container_meta,
            sampleText: t.container_meta?.sampleText || t.container_meta?.sample_text,
          },
        }));

        setTemplates(prev => append ? [...prev, ...normalizedTemplates] : normalizedTemplates);

        const paginationData = data.pagination || {};
        const hasMoreTemplates = paginationData.page < paginationData.totalPages;

        setPagination({
          currentPage: paginationData.page || page,
          totalPages: paginationData.totalPages || 1,
          hasMore: hasMoreTemplates,
          isLoadingMore: false
        });
      } else {
        setTemplatesError("Invalid response format");
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setTemplatesError("Failed to fetch templates");
    } finally {
      setTemplatesLoading(false);
    }
  }, [user?.customer_id]);

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

  // Log formData changes for debugging
  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

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
    return selectedGroups.reduce((sum, group) => sum + (group.total_contacts || 0), 0);
  }, [selectedGroups]);

  // Cost calculation
  useEffect(() => {
    if (!formData.selectedTemplate) {
      console.log('No template selected, setting cost to 0');
      setEstimatedCost(0);
      return;
    }
    
    console.log('--- Cost Calculation Debug ---');
    console.log('Selected template:', formData.selectedTemplate);
    console.log('Selected groups:', selectedGroups);
    console.log('Direct contacts:', formData.directContacts);
    
    // Calculate total contacts (from groups or direct contacts)
    let contactCount = 0;
    
    if (formData.isDirectBroadcast && formData.directContacts?.length > 0) {
      // Use direct contacts count if in direct broadcast mode
      contactCount = formData.directContacts.length;
    } else {
      // Otherwise use group contacts count
      contactCount = totalSelectedContacts;
    }
    
    console.log('Total selected contacts:', contactCount);

    // Get category and country with fallbacks
    const category = formData.selectedTemplate.category?.toLowerCase() || "marketing";
    const country = formData.country || "India";
    
    console.log('Using category:', category, 'country:', country);

    // Get pricing data
    const countryPricing = pricingData[country] || pricingData["All other countries"];
    console.log('Available pricing data:', countryPricing);

    // Find matching category (case-insensitive)
    const matchingCategory = Object.keys(countryPricing || {}).find(
      key => key.toLowerCase() === category.toLowerCase()
    ) || "marketing";
    
    console.log('Matching category:', matchingCategory);
    
    // Get cost per message
    const costPerMessage = countryPricing?.[matchingCategory] ?? 0.88;
    console.log('Cost per message:', costPerMessage);
    
    // Calculate total cost
    const calculatedCost = contactCount * costPerMessage;
    console.log('Calculated cost:', calculatedCost, 'for', contactCount, 'contacts');
    
    setEstimatedCost(calculatedCost);
  }, [formData.selectedTemplate, formData.group_id, formData.country, totalSelectedContacts]);


  // Step navigation
  const getStepSequence = useCallback(() => {
    const isDirectBroadcast = location.state?.directBroadcast;
    return isDirectBroadcast ? [1, 3, 4, 5] : [1, 2, 3, 4, 5];
  }, [location.state?.directBroadcast]);

  const getCurrentStepIndex = useCallback(() => {
    const sequence = getStepSequence();
    return sequence.indexOf(step);
  }, [step, getStepSequence]);

  // Validation
  const validateStep = useCallback((currentStep) => {
    const newErrors = {};
    const isDirectBroadcast = location.state?.directBroadcast;
    let adjustedStep = isDirectBroadcast && currentStep >= 2 ? currentStep + 1 : currentStep;

    switch (adjustedStep) {
      case 1:
        if (!formData.broadcastName?.trim()) {
          newErrors.broadcastName = "Campaign name is required";
        }
        break;
      case 2:
        if (!isDirectBroadcast) {
          if (!Array.isArray(formData.group_id) || formData.group_id.length === 0) {
            newErrors.group_id = "Please select at least one group";
          } else if (totalSelectedContacts > 250) {
            newErrors.group_id = "Selected audience exceeds the 250 contact limit";
          }
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
        if (!formData.broadcastName?.trim()) {
          newErrors.broadcastName = "Campaign name is required";
        }
        if (!isDirectBroadcast && (!Array.isArray(formData.group_id) || formData.group_id.length === 0)) {
          newErrors.group_id = "Please select at least one group";
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
  }, [formData, selectedDate, location.state?.directBroadcast]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const isDirectBroadcast = location.state?.directBroadcast;

    if (!formData.broadcastName?.trim()) {
      newErrors.broadcastName = "Broadcast name is required";
    }

    if (!isDirectBroadcast && (!Array.isArray(formData.group_id) || formData.group_id.length === 0)) {
      newErrors.group_id = "Please select at least one group";
    }

    if (!formData.selectedTemplate) {
      newErrors.template = "Please select a template";
    }

    if (formData.schedule === "Yes" && !selectedDate) {
      newErrors.schedule = "Please select a date and time";
    }

    if (!isDirectBroadcast && totalSelectedContacts > 250) {
      newErrors.group_id = "Selected audience exceeds the 250 contact limit";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedDate, location.state?.directBroadcast, totalSelectedContacts]);

  const handleNext = useCallback(() => {
    const isValid = validateStep(step);
    if (isValid) {
      const sequence = getStepSequence();
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < sequence.length - 1) {
        setStep(sequence[currentIndex + 1]);
      }
    }
  }, [validateStep, getStepSequence, getCurrentStepIndex, setStep, step]);

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