import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import pricingData from "../../../pricing.json";
import { toast } from "react-toastify";
import axios from "axios";
import { useWalletBalance } from "./useWalletBalance";
import { useCustomerLists } from "./useCustomerLists";
import { calculateEstimatedCost } from "../utils/costCalculation";
import { validateStep as validateStepUtil } from "../utils/validation";
export const useBroadcastForm = (
  formData,
  setFormData,
  onTemplateSelect,
  step,
  setStep,
  selectedDate,
  setSelectedDate,
  wabaInfo
) => {
  const { user } = useAuth();
  const location = useLocation();

  const walletHook = useWalletBalance();
  const customerListsHook = useCustomerLists();
  const [validationErrors, setValidationErrors] = useState({});
  const [warningMessage, setWarningMessage] = useState("");

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    isLoadingMore: false
  });

  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);

  // Use helpers from customerLists
  const selectedGroups = customerListsHook.getSelectedGroups(formData.group_id);
  const totalSelectedContacts = formData.isDirectBroadcast
    ? (formData.directContacts?.length || 0)
    : customerListsHook.calculateTotalContacts(formData.group_id);

  // Estimated cost calculation
  const estimatedCost = calculateEstimatedCost({
    contactCount: totalSelectedContacts,
    template: formData.selectedTemplate,
    country: formData.country || "India",
  });

  const fetchTemplates = useCallback(
    async (page = 1, append = false, searchTerm = "") => {
      if (!user?.customer_id) {
        setTemplatesError("Missing customer ID");
        return;
      }
      if (page === 1) {
        setTemplatesLoading(true);
      } else {
        setPagination((prev) => ({ ...prev, isLoadingMore: true }));
      }
      setTemplatesError(null);
      try {
        const params = {
          customer_id: user.customer_id,
          page,
          search: searchTerm,
          sub_category: "PROMOTION",
          status: "APPROVED",
        };
        const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
          params,
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        const data = response.data;
        if (data && Array.isArray(data.templates)) {
          const normalizedTemplates = data.templates.map((t) => ({
            ...t,
            container_meta: {
              ...t.container_meta,
              sampleText:
                t.container_meta?.sampleText || t.container_meta?.sample_text,
            },
          }));
          setTemplates((prev) =>
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
          setTemplates((prev) => (append ? prev : []));
          setPagination({
            currentPage: 1,
            totalPages: 1,
            hasMore: false,
            isLoadingMore: false,
          });
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch templates";
        setTemplatesError(message);
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

const getStepSequence = useCallback(() => {
    const isDirectBroadcast = location.state?.directBroadcast || formData.isDirectBroadcast;
    // Skip step 2 (Group Selection) when direct broadcast is true
    if (isDirectBroadcast) {
      return [1, 3, 4, 5]; 
    }
    return [1, 2, 3, 4, 5]; 
  }, [location.state?.directBroadcast, formData.isDirectBroadcast]);

  const getCurrentStepIndex = useCallback(() => {
    const sequence = getStepSequence();
    return sequence.indexOf(step);
  }, [step, getStepSequence]);

  const validateStep = useCallback(
    (stepNumber) => {
      const customerListContactIds = formData.isDirectBroadcast && formData.directContacts
        ? formData.directContacts.map(c => c.phone || c.phoneNumber || c.id)
        : selectedGroups.reduce((ids, group) => {
            if (Array.isArray(group.contacts)) {
              ids.push(...group.contacts.map(contact => contact.phone || contact.phoneNumber || contact.id));
            }
            return ids;
          }, []);
      const errors = validateStepUtil(formData, stepNumber, {
        selectedDate,
        wabaInfo,
        totalSelectedContacts,
      });
     
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError, { autoClose: 3000 });
      }
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [formData, selectedDate, wabaInfo, totalSelectedContacts,selectedGroups]
  );

  const handleNext = useCallback(() => {
    const isDirectBroadcast = location.state?.directBroadcast || formData.isDirectBroadcast;
    
    if (step === 2 && isDirectBroadcast) {
      setStep(3);
      return;
    }
    
    const isValid = validateStep(step);
    if (isValid) {
      const sequence = getStepSequence();
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < sequence.length - 1) {
        setStep(sequence[currentIndex + 1]);
      }
    }
  }, [validateStep, getStepSequence, getCurrentStepIndex, setStep, step, location.state?.directBroadcast, formData.isDirectBroadcast]);

  const handlePrevious = useCallback(() => {
    const sequence = getStepSequence();
    const currentIndex = getCurrentStepIndex();
    if (step === 3 && (location.state?.directBroadcast || formData.isDirectBroadcast)) {
      setStep(1);
      return;
    }
    if (currentIndex > 0) {
      setStep(sequence[currentIndex - 1]);
    }
  }, [getStepSequence, getCurrentStepIndex, setStep, step, location.state?.directBroadcast, formData.isDirectBroadcast]);

  const validateForm = useCallback(() => {
    const sequence = getStepSequence();
    const finalStep = sequence[sequence.length - 1];
    return validateStep(finalStep);
  }, [getStepSequence, validateStep]);


  useEffect(() => {
    if (user?.customer_id) {
     fetchTemplates(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.customer_id]);

  useEffect(() => {
    if (location.state?.selectedTemplate) {
      onTemplateSelect(location.state.selectedTemplate);
    }
  }, [location.state, onTemplateSelect]);


  useEffect(() => {
    if (!customerListsHook.customerLists) {
      customerListsHook.setSearchTerm("");
    }
  }, [customerListsHook.customerLists]);

  return {
   
    templates,
    templatesLoading,
    templatesError,
    estimatedCost,
    availableWCC: walletHook.availableWCC,
    pagination,
    validationErrors,
    templateSearchTerm,
    setTemplateSearchTerm,
    customerSearchTerm,
    setCustomerSearchTerm,
    showList,
    setShowList,
    filteredCustomerLists: customerListsHook.filteredCustomerLists,
    warningMessage,
    setWarningMessage,
    selectedGroups,
    totalSelectedContacts,

    customerLists: customerListsHook.customerLists,
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