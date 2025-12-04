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
    tag: seqData.tag || [], // Array of tag IDs
    trigger_type: seqData.trigger_type || "",
    status: seqData.status || "active",

    delivery_preferences: {
      allow_once: seqData.delivery_preferences?.[0]?.allow_once ?? false,
      continue_after_delivery:
        seqData.delivery_preferences?.[0]?.continue_after_delivery ?? true,
      days: seqData.delivery_preferences?.[0]?.days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      time_type: seqData.delivery_preferences?.[0]?.time_type || "Any Time",
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

  const convertMinutesToDelay = (minutes) => {
    const num = Number(minutes) || 0;
    if (num >= 1440 && num % 1440 === 0) {
      return { value: num / 1440, unit: "days" };
    }
    if (num >= 60 && num % 60 === 0) {
      return { value: num / 60, unit: "hours" };
    }
    return { value: num, unit: "minutes" };
  };

  const transformToEditFormat = (drip, allTags = []) => {
    const steps = drip.steps || [];
    const deliveryPrefs = drip.delivery_preferences || {};
    const tagIdsFromDrip = drip.tags || [];
    
    const tagIds = tagIdsFromDrip.map(t => {
      if (typeof t === 'number') return t;
      return t.id || t.tag_id;
    }).filter(Boolean);
    
    const tagObjects = tagIds.map(tagId => {
      const foundTag = allTags.find(t => (t.id || t.tag_id) === tagId);
      if (foundTag) {
        return foundTag;
      }
      return { id: tagId, tag_id: tagId, tag: `Tag ${tagId}`, name: `Tag ${tagId}` };
    });
    
    const tagNames = tagObjects.map(t => t.tag || t.name || "").filter(Boolean);

    return {
      id: drip.drip_id || drip.id,
      drip_name: drip.drip_name || "",
      drip_description: drip.drip_description || "",
      tag: tagIds, 
      selectedTagObjects: tagObjects, 
      target_type: tagNames.join(", "),
      trigger_type: drip.trigger_type || "",
      status: drip.status || "active",
      color: "bg-teal-500",
      icon: "📧",
      customer_id: drip.customer_id,
      delivery_preferences: [
        {
          days: deliveryPrefs.days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
          time_type: deliveryPrefs.time_type || "Any Time",
          time_from: deliveryPrefs.time_from || "",
          time_to: deliveryPrefs.time_to || "",
          timezone: deliveryPrefs.timezone || "",
          allow_once: Boolean(deliveryPrefs.allow_once ?? true), // Convert 1/0 to boolean
          continue_after_delivery: Boolean(deliveryPrefs.continue_after_delivery ?? false), // Convert 1/0 to boolean
        },
      ],
      retry_settings: {
        max_attempts: drip.max_attempts || 3,
        retry_delay_minutes: drip.retry_delay_minutes || 10,
      },
      steps: steps.map((s) => {
        const delay = convertMinutesToDelay(s.delay_minutes);
        return {
          step_name: s.step_name || "",
          step_order: s.step,
          delay_value: delay.value,
          delay_unit: delay.unit,
          template: s.template_name ? { element_name: s.template_name, data: s.message_preview } : null,
          parameters: s.parameters?.map((p) => ({ param: p.key, mappedTo: p.value })) || [],
          use_custom_time: false,
          custom_time_type: "Any Time",
          custom_time_from: "",
          custom_time_to: "",
          custom_days: [],
        };
      }),
      updated_at: drip.updated_at || new Date().toLocaleString(),
    };
  };

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

  // Fetch single drip by ID - fetches from the full list API
  const fetchDripById = useCallback(async (dripId) => {
    if (!customer_id) {
      return { success: false, error: "No customer ID" };
    }
    
    console.log("=== FETCHING DRIP BY ID ===");
    console.log("Looking for dripId:", dripId);
    
    try {
      // Fetch drip data
      const { data: result } = await axios.get(
        API_ENDPOINTS.DRIP.GET_ALL(customer_id),
        { withCredentials: true }
      );

      const list = result.data || result.drips || [];
      console.log("=== BACKEND RESPONSE (all drips) ===");
      console.log(JSON.stringify(list, null, 2));
      
      const drip = list.find((d) => String(d.drip_id) === String(dripId));
      console.log("=== FOUND DRIP (raw from backend) ===");
      console.log(JSON.stringify(drip, null, 2));
      
      if (!drip) {
        return { success: false, error: "Sequence not found" };
      }
      
      // Fetch all tags to match with tag IDs
      let allTags = [];
      try {
        const { data: tagsResult } = await axios.get(
          API_ENDPOINTS.TAGS.GET_ALL(customer_id),
          { withCredentials: true }
        );
        allTags = tagsResult?.tags || tagsResult?.data || tagsResult || [];
      } catch (tagErr) {
        console.warn("Failed to fetch tags:", tagErr);
      }
      
      const transformed = transformToEditFormat(drip, allTags);
      console.log("=== TRANSFORMED FOR EDIT ===");
      console.log(JSON.stringify(transformed, null, 2));
      
      return { success: true, data: transformed };
    } catch (err) {
      console.error("Failed to fetch drip:", err);
      const msg = err.response?.data?.message || "Failed to fetch sequence";
      return { success: false, error: msg };
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
    // Validate dripId before making API call
    if (!dripId || dripId === "null" || dripId === "undefined") {
      console.error("UPDATE DRIP ERROR: Invalid dripId:", dripId);
      toast.error("Cannot update: Invalid sequence ID");
      return { success: false, error: "Invalid sequence ID" };
    }

    try {
      const payload = transformToBackendFormat(seqData);
      console.log("UPDATING DRIP - ID:", dripId);
      console.log("UPDATING DRIP - URL:", API_ENDPOINTS.DRIP.UPDATE(dripId));
      console.log("UPDATING DRIP - Payload:", payload);

      const { data: result } = await axios.put(
        API_ENDPOINTS.DRIP.UPDATE(dripId),
        payload,
        { withCredentials: true }
      );

      await fetchDrips();

      return { success: true, data: result };
    } catch (err) {
      console.error("UPDATE DRIP ERROR:", err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || "Failed to update sequence";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Delete drip
  const deleteDrip = async (dripId) => {
    try {
      await axios.delete(API_ENDPOINTS.DRIP.DELETE(dripId), {
        params: { customer_id },
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

  const toggleDripStatus = async (dripId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      const fetchResult = await fetchDripById(dripId);
      if (!fetchResult.success) {
        throw new Error(fetchResult.error);
      }
      const dripData = fetchResult.data;
      const payload = transformToBackendFormat({
        ...dripData,
        status: newStatus,
      });

      const { data: result } = await axios.put(
        API_ENDPOINTS.DRIP.UPDATE(dripId),
        payload,
        { withCredentials: true }
      );

      setDrips((prev) =>
        prev.map((d) =>
          d.id === dripId ? { ...d, status: newStatus } : d
        )
      );

      toast.success(`Sequence ${newStatus === "active" ? "resumed" : "paused"} successfully!`);
      return { success: true, data: result };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update sequence status";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Duplicate drip
  const duplicateDrip = async (dripId) => {
    try {
      // First fetch the drip data
      const fetchResult = await fetchDripById(dripId);
      if (!fetchResult.success) {
        throw new Error(fetchResult.error);
      }

      const originalDrip = fetchResult.data;
      
      // Create a copy with modified name
      const duplicateData = {
        ...originalDrip,
        drip_name: `${originalDrip.drip_name} (Copy)`,
        status: "draft", // New duplicates start as draft
      };
      
      // Remove the ID so it creates a new one
      delete duplicateData.id;

      const createResult = await createDrip(duplicateData);
      
      if (createResult.success) {
        toast.success("Sequence duplicated successfully!");
      }
      
      return createResult;
    } catch (err) {
      const msg = err.message || "Failed to duplicate sequence";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchDrips();
  }, [fetchDrips]);

  return {
    data: { drips, loading, error },
    actions: { fetchDrips, fetchDripById, createDrip, updateDrip, deleteDrip, toggleDripStatus, duplicateDrip },
  };
};
