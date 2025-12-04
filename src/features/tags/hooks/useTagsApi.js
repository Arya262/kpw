import { useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { showSuccessToast, showErrorToast } from "../../../utils/toastConfig";

export const useTagsApi = (customerId) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all tags
  const fetchTags = useCallback(async () => {
    if (!customerId) return [];
    
    try {
      setIsLoading(true);
      const response = await axios.get(
        API_ENDPOINTS.TAGS.GET_ALL(customerId),
        { withCredentials: true }
      );

      let fetchedTags = [];
      if (response.data && response.data.success !== false) {
        fetchedTags = response.data.data || [];
      }
      
      setTags(fetchedTags);
      return fetchedTags;
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setTags([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // Create a new tag
  const createTag = useCallback(async (tagData) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.TAGS.ADD,
        { customer_id: customerId, ...tagData },
        { withCredentials: true }
      );

      if (response.data && response.data.success !== false) {
        const newTag = {
          id: response.data.tag_id,
          customer_id: customerId,
          tag: tagData.tag,
          created_at: new Date().toISOString(),
        };
        setTags((prev) => [newTag, ...prev]); 
        showSuccessToast("Tag created successfully");
        return { success: true, tag: newTag };
      }
      showErrorToast(response.data?.message || "Failed to create tag");
      return { success: false };
    } catch (error) {
      console.error("Failed to create tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to create tag");
      return { success: false };
    }
  }, [customerId]);

  const assignTag = useCallback(async (contactId, tagId, options = {}) => {
    const { showToast = true } = options;
    
    try {
      const response = await axios.post(
        API_ENDPOINTS.TAGS.ASSIGN,
        { contact_id: contactId, tag_id: tagId },
        { withCredentials: true }
      );

      if (response.data && response.data.success !== false) {
        if (showToast) showSuccessToast("Tag assigned successfully");
        return { success: true, data: response.data };
      }
      if (showToast) showErrorToast(response.data?.message || "Failed to assign tag");
      return { success: false };
    } catch (error) {
      console.error("Failed to assign tag:", error);
      if (showToast) showErrorToast(error.response?.data?.message || "Failed to assign tag");
      return { success: false };
    }
  }, []);

  // Unassign tag from a contact
  const unassignTag = useCallback(async (contactId, tagId, options = {}) => {
    const { showToast = true } = options;
    
    try {
      const response = await axios.post(
        API_ENDPOINTS.TAGS.UNASSIGN,
        { contact_id: contactId, tag_id: tagId },
        { withCredentials: true }
      );

      if (response.data && response.data.success !== false) {
        if (showToast) showSuccessToast("Tag removed successfully");
        return { success: true, data: response.data };
      }
      if (showToast) showErrorToast(response.data?.message || "Failed to remove tag");
      return { success: false };
    } catch (error) {
      console.error("Failed to unassign tag:", error);
      if (showToast) showErrorToast(error.response?.data?.message || "Failed to remove tag");
      return { success: false };
    }
  }, []);

  return {
    tags,
    setTags,
    isLoading,
    fetchTags,
    createTag,
    assignTag,
    unassignTag,
  };
};
