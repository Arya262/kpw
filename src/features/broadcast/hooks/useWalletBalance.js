import { useState, useCallback, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

export const useWalletBalance = () => {
  const [availableWCC, setAvailableWCC] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.customer_id) return;

    setLoading(true);
    setError(null);

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
      setError(error.message);
      setAvailableWCC(0);
    } finally {
      setLoading(false);
    }
  }, [user?.customer_id]);

  useEffect(() => {
    if (user?.customer_id) {
      fetchWalletBalance();
    }
  }, [user?.customer_id, fetchWalletBalance]);

  return {
    availableWCC,
    loading,
    error,
    fetchWalletBalance,
  };
};
