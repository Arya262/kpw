import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { formatDate } from "../../../utils/formatters";


const transformContact = (item, customerId) => ({
  ...item,
  status: "Opted-in",
  customer_id: customerId,
  date: formatDate(item.created_at),
  number: `${item.country_code || ""} ${item.mobile_no}`,
  fullName: `${item.first_name} ${item.last_name || ""}`.trim(),
  tags: item.tags || [],
});

export const useContactData = (user, searchTerm, filterOptions) => {
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState({ contacts: false, export: false, delete: false });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });


  const fetchContacts = useCallback(async (page = 1, limit = 10, search = "") => {
    if (!user?.customer_id) return;

    try {
      setLoading((prev) => ({ ...prev, contacts: true }));
      const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          page,
          limit,
          ...(search ? { search } : {}),
          ...filterOptions,
        },
        withCredentials: true,
      });

      if (response.status >= 400 || !response.data || !Array.isArray(response.data.data)) {
        throw new Error(response.data?.message || "Failed to fetch contacts");
      }

      const result = response.data;
      const contacts = Array.isArray(result.data) ? result.data : [];

      const transformedContacts = contacts.map((item) => transformContact(item, user?.customer_id));
      setContacts(transformedContacts);

      setAllContacts((prev) => {
        const map = new Map(prev.map((c) => [c.contact_id, c]));
        transformedContacts.forEach((c) => map.set(c.contact_id, c));
        return Array.from(map.values());
      });

      const paginationData = response.data.pagination || {
        page: 1,
        totalPages: 1,
        total: 0,
        limit: limit,
      };
      setPagination({
        currentPage: paginationData.page || page,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.total || 0,
        itemsPerPage: paginationData.limit || limit,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch contacts";
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, contacts: false }));
    }
  }, [user?.customer_id, filterOptions]);

  // Fetch all contacts for export/selection
  const fetchAllContacts = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, contacts: true }));
      const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_ALL, {
        params: {
          customer_id: user?.customer_id,
          limit: pagination.totalItems,
        },
        withCredentials: true,
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Failed to fetch contacts");
      }

      return response.data.data.map((item) => transformContact(item, user?.customer_id));
    } catch (error) {
      console.error("Failed to fetch contacts for export", error);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, contacts: false }));
    }
  }, [user?.customer_id, pagination.totalItems]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContacts(1, pagination.itemsPerPage, searchTerm);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm, pagination.itemsPerPage, fetchContacts]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      fetchContacts(newPage, pagination.itemsPerPage);
    }
  }, [pagination.totalPages, pagination.itemsPerPage, fetchContacts]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }));
    fetchContacts(1, newItemsPerPage);
  }, [fetchContacts]);

  return {
    contacts,
    allContacts,
    loading,
    error,
    pagination,
    setError,
    setLoading,
    fetchContacts,
    fetchAllContacts,
    handlePageChange,
    handleItemsPerPageChange,
  };
};
