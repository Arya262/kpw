import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import { defaultToastConfig } from "../utils/toastConfig";
import { useAuth } from "../context/AuthContext";

export const useTemplates = () => {
  const { user } = useAuth();
  const customer_id = user?.customer_id;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // 🔄 Normalizer for template objects
  const normalizeTemplate = (t) => ({
    ...t,
    container_meta: {
      ...t.container_meta,
      sampleText: t.container_meta?.sampleText || t.container_meta?.sample_text,
    },
  });

  // 📥 Fetch templates
  const fetchTemplates = async (page = 1, limit = 10, search = "") => {
    if (!customer_id) return;

    try {
      setLoading(true);
      setError(null);

      console.log("📤 Fetching templates with params:", {
        customer_id,
        page,
        limit,
        search,
      });

      const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
        params: {
          customer_id,
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

      const normalized = templates.map(normalizeTemplate);
      setTemplates(normalized);

      setPagination((prev) => ({
        currentPage: result.pagination?.page ?? result.current_page ?? page,
        totalPages:
          result.pagination?.totalPages ??
          result.last_page ??
          (result.total ? Math.ceil(result.total / limit) : 1) ??
          1,
        totalItems:
          result.pagination?.totalRecords ??
          result.total ??
          templates.length ??
          0,
        itemsPerPage: result.pagination?.limit ?? result.per_page ?? limit,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch templates";

      console.error("❌ Error fetching templates:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
      });

      setError(errorMessage);

      // Avoid spamming toasts while searching
      if (!search) toast.error(errorMessage, defaultToastConfig);
    } finally {
      setLoading(false);
    }
  };

  // 📄 Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchTemplates(newPage, pagination.itemsPerPage, searchTerm);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }));
    fetchTemplates(1, newItemsPerPage, searchTerm);
  };

  // ⌛ Debounced search
useEffect(() => {
  const timeout = setTimeout(() => {
    fetchTemplates(pagination.currentPage, pagination.itemsPerPage, searchTerm);
  }, 500);
  return () => clearTimeout(timeout);
}, [pagination.currentPage, pagination.itemsPerPage, searchTerm]);

  // ➕ Add template
  const addTemplate = async (newTemplate) => {
    const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
      newTemplate.templateType?.toUpperCase()
    );
    const endpoint = isMedia
      ? API_ENDPOINTS.TEMPLATES.CREATE_MEDIA
      : API_ENDPOINTS.TEMPLATES.CREATE;

    const requestBody = {
      ...newTemplate,
      customer_id,
      header: newTemplate.header || null,
      footer: newTemplate.footer || null,
      buttons: newTemplate.buttons || [],
      exampleHeader: newTemplate.exampleHeader || null,
      exampleMedia: newTemplate.exampleMedia || null,
      messageSendTTL: Number(newTemplate.messageSendTTL) || 259200,
    };

    try {
      const response = await axios.post(endpoint, requestBody, {
        withCredentials: true,
      });

      if (response.data.success) {
        const createdTemplate = normalizeTemplate(
          response.data.template || newTemplate
        );
        setTemplates((prev) => [...prev, createdTemplate]);
        toast.success("Template created successfully!", defaultToastConfig);
        return true;
      } else {
        toast.error(
          response.data.message || response.data.error || "Failed to create template",
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

  // ❌ Delete template
  const deleteTemplate = async (templateName, id) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.TEMPLATES.DELETE(), {
        data: { elementName: templateName, customer_id },
        withCredentials: true,
      });

      if (response.data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Template deleted successfully", defaultToastConfig);
        return true;
      } else {
        toast.error(
          response.data.error || "Failed to delete template",
          defaultToastConfig
        );
        return false;
      }
    } catch (err) {
      console.error("Delete template error:", err);
      toast.error("An error occurred while deleting", defaultToastConfig);
      return false;
    }
  };

  // 🎯 Return grouped state + actions
  return {
    data: { templates, loading, error },
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      onPageChange: handlePageChange,
      onItemsPerPageChange: handleItemsPerPageChange,
    },
    search: { searchTerm, setSearchTerm },
    actions: { fetchTemplates, addTemplate, deleteTemplate },
  };
};
