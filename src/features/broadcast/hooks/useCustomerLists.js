import { useState, useCallback, useEffect, useMemo } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

export const useCustomerLists = () => {
  const [customerLists, setCustomerLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const fetchCustomerLists = useCallback(async () => {
    if (!user?.customer_id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.GROUPS.GET_ALL}?customer_id=${user.customer_id}`,
        { 
          headers: { "Content-Type": "application/json" }, 
          credentials: "include" 
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setCustomerLists(result.data);
        setError(null);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error("Error fetching customer lists:", err);
      setError("Unable to load customer lists. Please try again later.");
      setCustomerLists([]);
    } finally {
      setLoading(false);
    }
  }, [user?.customer_id]);


  const filteredCustomerLists = useMemo(() => {
    if (!searchTerm) return customerLists;
    
    return customerLists.filter((list) =>
      list.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customerLists, searchTerm]);

  const getSelectedGroups = useCallback((groupIds) => {
    if (!customerLists || !groupIds) return [];
    return customerLists.filter((c) => groupIds.includes(c.group_id));
  }, [customerLists]);


  const calculateTotalContacts = useCallback((groupIds) => {
    if (!groupIds || groupIds.length === 0) return 0;
    
    const selectedGroups = getSelectedGroups(groupIds);
    return selectedGroups.reduce((sum, group) => {
      return sum + (parseInt(group.total_contacts) || 0);
    }, 0);
  }, [getSelectedGroups]);


  useEffect(() => {
    if (user?.customer_id) {
      fetchCustomerLists();
    }
  }, [user?.customer_id, fetchCustomerLists]);

  return {
    customerLists,
    filteredCustomerLists,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCustomerLists,
    getSelectedGroups,
    calculateTotalContacts,
  };
};
