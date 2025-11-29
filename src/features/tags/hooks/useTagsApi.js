import { useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { showSuccessToast, showErrorToast } from "../../../utils/toastConfig";

export const useTagsApi = (customerId) => {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        fetchedTags = response.data.tags || response.data.data || response.data || [];
      } else if (Array.isArray(response.data)) {
        fetchedTags = response.data;
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
        const newTag = response.data.tag || response.data.data || response.data;
        setTags((prev) => [...prev, newTag]);
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

  // Update a tag
  const updateTag = useCallback(async (tagId, tagData) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.TAGS.UPDATE(tagId),
        { customer_id: customerId, ...tagData },
        { withCredentials: true }
      );

      if (response.data && response.data.success !== false) {
        const updatedTag = response.data.tag || response.data.data || response.data;
        setTags((prev) =>
          prev.map((t) => {
            const id = t.tag_id || t.id || t._id;
            return id === tagId ? { ...t, ...updatedTag } : t;
          })
        );
        showSuccessToast("Tag updated successfully");
        return { success: true, tag: updatedTag };
      }
      showErrorToast(response.data?.message || "Failed to update tag");
      return { success: false };
    } catch (error) {
      console.error("Failed to update tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to update tag");
      return { success: false };
    }
  }, [customerId]);

  // Delete a single tag
  const deleteTag = useCallback(async (tagId, tagName) => {
    try {
      setIsDeleting(true);
      await axios.delete(API_ENDPOINTS.TAGS.DELETE(tagId), {
        withCredentials: true,
      });
      setTags((prev) => prev.filter((t) => (t.tag_id || t.id || t._id) !== tagId));
      showSuccessToast(`Tag "${tagName}" deleted`);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to delete tag");
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Delete multiple tags
  const deleteTags = useCallback(async (tagIds) => {
    try {
      setIsDeleting(true);
      for (const id of tagIds) {
        await axios.delete(API_ENDPOINTS.TAGS.DELETE(id), {
          withCredentials: true,
        });
      }
      const idsSet = new Set(tagIds);
      setTags((prev) => prev.filter((t) => !idsSet.has(t.tag_id || t.id || t._id)));
      showSuccessToast(`${tagIds.length} tag${tagIds.length > 1 ? "s" : ""} deleted`);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete tags:", error);
      showErrorToast(error.response?.data?.message || "Failed to delete tags");
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Toggle tag status locally
  const toggleTagStatus = useCallback((tagId) => {
    setTags((prev) =>
      prev.map((tag) => {
        const id = tag.tag_id || tag.id || tag._id;
        if (id !== tagId) return tag;
        const isActive = tag.is_active !== undefined ? tag.is_active : tag.status !== "inactive";
        return {
          ...tag,
          is_active: !isActive,
          status: !isActive ? "active" : "inactive",
        };
      })
    );
  }, []);

  // Assign tag to a contact
  const assignTag = useCallback(async (contactId, tagId) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.TAGS.ASSIGN,
        { contact_id: contactId, tag_id: tagId },
        { withCredentials: true }
      );

      if (response.data && response.data.success !== false) {
        showSuccessToast("Tag assigned successfully");
        return { success: true, data: response.data };
      }
      showErrorToast(response.data?.message || "Failed to assign tag");
      return { success: false };
    } catch (error) {
      console.error("Failed to assign tag:", error);
      showErrorToast(error.response?.data?.message || "Failed to assign tag");
      return { success: false };
    }
  }, []);

  return {
    tags,
    setTags,
    isLoading,
    isDeleting,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    deleteTags,
    toggleTagStatus,
    assignTag,
  };
};
