import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import { toast } from "react-toastify";

export const useDripCampaigns = (customerId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(
    async (page = 1, limit = 10, search = "") => {
      if (!customerId) return { data: [], pagination: null };

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE}/drip-campaigns`, {
          params: {
            customer_id: customerId,
            page,
            limit,
            ...(search ? { search } : {}),
          },
          withCredentials: true,
        });

        return {
          data: response.data.data || [],
          pagination: response.data.pagination || null,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch campaigns";
        setError(errorMessage);
        toast.error(errorMessage);
        return { data: [], pagination: null };
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const fetchCampaignById = useCallback(
    async (campaignId) => {
      if (!customerId || !campaignId) return null;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE}/drip-campaigns/${campaignId}`,
          {
            params: { customer_id: customerId },
            withCredentials: true,
          }
        );

        return response.data.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch campaign";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const createCampaign = useCallback(
    async (campaignData) => {
      if (!customerId) return null;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${API_BASE}/drip-campaigns`,
          {
            ...campaignData,
            customer_id: customerId,
          },
          { withCredentials: true }
        );

        toast.success("Campaign created successfully");
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to create campaign";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const updateCampaign = useCallback(
    async (campaignId, campaignData) => {
      if (!customerId || !campaignId) return null;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.put(
          `${API_BASE}/drip-campaigns/${campaignId}`,
          {
            ...campaignData,
            customer_id: customerId,
          },
          { withCredentials: true }
        );

        toast.success("Campaign updated successfully");
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to update campaign";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const deleteCampaign = useCallback(
    async (campaignId) => {
      if (!customerId || !campaignId) return false;

      try {
        setLoading(true);
        setError(null);

        await axios.delete(`${API_BASE}/drip-campaigns/${campaignId}`, {
          params: { customer_id: customerId },
          withCredentials: true,
        });

        toast.success("Campaign deleted successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to delete campaign";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const toggleCampaignStatus = useCallback(
    async (campaignId, newStatus) => {
      if (!customerId || !campaignId) return false;

      try {
        setLoading(true);
        setError(null);

        await axios.post(
          `${API_BASE}/drip-campaigns/${campaignId}/toggle-status`,
          {
            status: newStatus,
            customer_id: customerId,
          },
          { withCredentials: true }
        );

        toast.success(
          `Campaign ${newStatus === "active" ? "activated" : "paused"} successfully`
        );
        return true;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to update campaign status";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const enrollContacts = useCallback(
    async (campaignId, contactIds) => {
      if (!customerId || !campaignId) return false;

      try {
        setLoading(true);
        setError(null);

        await axios.post(
          `${API_BASE}/drip-campaigns/${campaignId}/enroll`,
          {
            customer_id: customerId,
            contact_ids: contactIds,
          },
          { withCredentials: true }
        );

        toast.success("Contacts enrolled successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to enroll contacts";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const fetchAnalytics = useCallback(
    async (campaignId) => {
      if (!customerId || !campaignId) return null;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE}/drip-campaigns/${campaignId}/analytics`,
          {
            params: { customer_id: customerId },
            withCredentials: true,
          }
        );

        return response.data.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch analytics";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  return {
    loading,
    error,
    fetchCampaigns,
    fetchCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    enrollContacts,
    fetchAnalytics,
  };
};
