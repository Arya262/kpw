import { useEffect, useState, useCallback } from "react";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import { defaultToastConfig } from "../utils/toastConfig";
import axios from "axios";
export const useTemplates = (customerId) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchTemplates = useCallback(async (page = 1, limit = 10, search = "") => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log("📤 Fetching templates with params:", {
        customer_id: customerId,
        page,
        limit,
        search,
      });

      const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
        params: {
          customer_id: customerId,
          page,
          limit,
          ...(search ? { search } : {}),
        },
        withCredentials: true,
        validateStatus: (status) => status < 500,
      });

      console.log("✅ API Response Status:", response.status);
      console.log("📄 API Response Data:", response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || "Failed to fetch templates");
      }

      const result = response.data;
      const templates = Array.isArray(result.templates) ? result.templates : [];

      const normalized = templates.map((t) => ({
        ...t,
        container_meta: {
          ...t.container_meta,
          sampleText:
            t.container_meta?.sampleText || t.container_meta?.sample_text,
        },
      }));

      setTemplates(normalized);

      // Update pagination from API response
      setPagination((prev) => ({
        currentPage: result.pagination?.page || result.current_page || page,
        totalPages:
          result.pagination?.totalPages ||
          result.last_page ||
          (result.total ? Math.ceil(result.total / limit) : 1) ||
          1,
        totalItems: result.pagination?.totalRecords || result.total || templates.length || 0,
        itemsPerPage: result.pagination?.limit || result.per_page || limit,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch templates";
      console.error("❌ Error fetching templates:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Debounced search using setTimeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTemplates(1, pagination.itemsPerPage, searchTerm);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm, pagination.itemsPerPage]);

  // ✅ update template
  const updateTemplate = async (updatedTemplate) => {
    try {
      setTemplates(prev => 
        prev.map(t => t.id === updatedTemplate.id ? { ...t, ...updatedTemplate } : t)
      );
      return true;
    } catch (error) {
      console.error("Update template error:", error);
      toast.error("Failed to update template", defaultToastConfig);
      return false;
    }
  };

  // ✅ add template
  const addTemplate = async (newTemplate) => {
    const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
      newTemplate.templateType?.toUpperCase()
    );
    const endpoint = isMedia
      ? API_ENDPOINTS.TEMPLATES.CREATE_MEDIA
      : API_ENDPOINTS.TEMPLATES.CREATE;

    const requestBody = {
      ...newTemplate,
      customer_id: customerId,
      header: newTemplate.header || null,
      footer: newTemplate.footer || null,
      buttons: newTemplate.buttons || [],
      exampleHeader: newTemplate.exampleHeader || null,
      exampleMedia: newTemplate.exampleMedia || null,
      messageSendTTL: Number(newTemplate.messageSendTTL) || 259200,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        setTemplates((prev) => [...prev, data.template || newTemplate]);
        toast.success("Template created successfully!", defaultToastConfig);
        return true;
      } else {
        toast.error(
          data.message || data.error || "Failed to create template",
          defaultToastConfig
        );
        return false;
      }
    } catch (err) {
      console.error("Add template error:", err);
      toast.error("Failed to create template", defaultToastConfig);
      return false;
    }
  };

  // ✅ delete template
  const deleteTemplate = async (templateName, id, customer_id) => {
  try {
    const response = await fetch(API_ENDPOINTS.TEMPLATES.DELETE(), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ elementName: templateName, customer_id }),
    });

    const data = await response.json();

    if (data.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted successfully", defaultToastConfig);
      return true;
    } else {
      toast.error(data.error || "Failed to delete template", defaultToastConfig);
      return false;
    }
  } catch (err) {
    console.error("Delete template error:", err);
    toast.error("An error occurred while deleting", defaultToastConfig);
    return false;
  }
};
  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchTemplates(page, pagination.itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    const newPagination = {
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when items per page changes
    };
    setPagination(newPagination);
    fetchTemplates(1, newItemsPerPage);
  };

  return { 
    templates, 
    loading, 
    error, 
    addTemplate, 
    updateTemplate,
    deleteTemplate, 
    // Pagination
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handleItemsPerPageChange,
    searchTerm,
    setSearchTerm,
    fetchTemplates
  };
};
