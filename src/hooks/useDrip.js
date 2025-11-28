import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export const useDrip = () => {
  const { user } = useAuth();
  const customer_id = user?.customer_id;

  const [drips, setDrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const convertDelayToMinutes = (value, unit) => {
    const num = Number(value) || 0;
    switch (unit) {
      case "hours":
        return num * 60;
      case "days":
        return num * 60 * 24;
      default:
        return num;
    }
  };

  const transformToBackendFormat = (seqData) => ({
    customer_id: seqData.customer_id || customer_id,
    drip_name: seqData.drip_name,
    drip_description: seqData.drip_description || "",
    status: seqData.status || "active",

    delivery_preferences: {
      allow_once: seqData.delivery_preferences?.[0]?.allow_once ?? false,
      continue_after_delivery:
        seqData.delivery_preferences?.[0]?.continue_after_delivery ?? true,
      days: seqData.delivery_preferences?.[0]?.days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      time_type: "Time Range",
      time_from: seqData.delivery_preferences?.[0]?.time_from || null,
      time_to: seqData.delivery_preferences?.[0]?.time_to || null,
    },

    retry_settings: {
      max_attempts: seqData.retry_settings?.max_attempts || 3,
      retry_delay_minutes: seqData.retry_settings?.retry_delay_minutes || 10,
    },

    steps: seqData.steps.map((s, index) => ({
      step: index + 1,
      step_name: s.step_name || `Step ${index + 1}`,
      template_name: s.template?.element_name || "",
      parameters: s.parameters?.map((p) => ({
        key: p.param,
        value: p.mappedTo,
      })) || [],
      delay_minutes: convertDelayToMinutes(s.delay_value, s.delay_unit),
      conditions: null,
      message_preview: s.template?.container_meta?.sampleText || s.template?.data || "",
    })),
  });

  const transformToUIFormat = (drip, index) => ({
    id: drip.id || drip.drip_id,
    name: drip.drip_name,
    description: drip.drip_description || "",
    stepCount: drip.steps?.length || 0,
    contactCount: drip.contact_count || 0,
    status: drip.status || "draft",
    enrolled: drip.enrolled_count || 0,
    completed: drip.completed_count || 0,
    goal: drip.goal_count || 0,
    color: ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"][
      index % 4
    ],
  });

  // Fetch drip list
  const fetchDrips = useCallback(async () => {
    if (!customer_id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: result } = await axios.get(
        API_ENDPOINTS.DRIP.GET_ALL(customer_id),
        { withCredentials: true }
      );

      const list = result.data || result.drips || [];
      const transformed = list.map((d, i) => transformToUIFormat(d, i));
      setDrips(transformed);
    } catch (err) {
      console.error("Failed to fetch sequences:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [customer_id]);

  // Create new drip
  const createDrip = async (seqData) => {
    try {
      const payload = transformToBackendFormat(seqData);
      console.log("CREATING DRIP - Full Payload:", JSON.stringify(payload, null, 2));

      const { data: result } = await axios.post(
        API_ENDPOINTS.DRIP.CREATE,
        payload,
        { withCredentials: true }
      );

      toast.success("Sequence created successfully!");
      await fetchDrips();

      return { success: true, data: result };
    } catch (err) {
      console.error("CREATE DRIP ERROR:", err.response?.data || err.message);
      const msg = err.response?.data?.message || "Failed to create sequence";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Update existing drip
  const updateDrip = async (dripId, seqData) => {
    try {
      const payload = transformToBackendFormat(seqData);
      console.log("UPDATING DRIP", payload);

      const { data: result } = await axios.put(
        API_ENDPOINTS.DRIP.UPDATE(dripId),
        payload,
        { withCredentials: true }
      );

      toast.success("Sequence updated successfully!");
      await fetchDrips();

      return { success: true, data: result };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update sequence";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Delete drip
  const deleteDrip = async (dripId) => {
    try {
      await axios.delete(API_ENDPOINTS.DRIP.DELETE(dripId), {
        withCredentials: true,
      });

      toast.success("Sequence deleted successfully!");
      setDrips((prev) => prev.filter((d) => d.id !== dripId));

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete sequence";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchDrips();
  }, [fetchDrips]);

  return {
    data: { drips, loading, error },
    actions: { fetchDrips, createDrip, updateDrip, deleteDrip },
  };
};
