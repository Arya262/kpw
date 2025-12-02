import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export const useNodeTemplate = () => {
  const { user } = useAuth();
  const customer_id = user?.customer_id;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    totalCount: 0,
  });

  const fetchTemplates = useCallback(
    async (page = 1, search = "") => {
      if (!customer_id) {
        console.warn("No customer_id available");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(API_ENDPOINTS.TEMPLATES.GET_ALL, {
          params: {
            customer_id,
            page,
            limit: pagination.pageSize,
            ...(search ? { search } : {}),
          },
          withCredentials: true,
          validateStatus: (status) => status === 404 || status < 400,
        });

        if (response.status === 404) {
          setTemplates([]);
          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            hasMore: false,
            totalCount: 0,
          }));
          return [];
        }

        const result = response.data;
        const templateList = Array.isArray(result.templates)
          ? result.templates
          : [];
        const totalCount =
          result.pagination?.totalRecords ?? result.total ?? templateList.length;

        if (page === 1) {
          setTemplates(templateList);
        } else {
          setTemplates((prev) => [...prev, ...templateList]);
        }

        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          hasMore: templateList.length === prev.pageSize,
          totalCount,
        }));

        return templateList;
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError(err.message);
        setTemplates([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [customer_id, pagination.pageSize]
  );

  useEffect(() => {
    if (customer_id) {
      fetchTemplates(1, searchTerm);
    }
  }, [searchTerm, customer_id]);

  const loadMoreTemplates = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchTemplates(pagination.currentPage + 1, searchTerm);
    }
  }, [loading, pagination.hasMore, pagination.currentPage, searchTerm, fetchTemplates]);

  return {
    templates,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    pagination,
    loadMoreTemplates,
    refetch: () => fetchTemplates(1, searchTerm),
  };
};
