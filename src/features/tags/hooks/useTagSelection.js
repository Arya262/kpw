import { useState, useCallback } from "react";
import { getTagId } from "../utils/tagUtils";

export const useTagSelection = () => {
  const [selectedIds, setSelectedIds] = useState({});

  const hasSelection = Object.keys(selectedIds).length > 0;
  const selectedCount = Object.keys(selectedIds).length;

  // Check if a specific tag is selected
  const isSelected = useCallback((tagId) => !!selectedIds[tagId], [selectedIds]);

  // Toggle single tag selection
  const toggleSelection = useCallback((tagId, checked) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (checked) {
        next[tagId] = true;
      } else {
        delete next[tagId];
      }
      return next;
    });
  }, []);

  // Select/deselect all visible tags
  const toggleAllVisible = useCallback((checked, visibleTags) => {
    if (checked) {
      const next = {};
      visibleTags.forEach((tag) => {
        const id = getTagId(tag);
        if (id) next[id] = true;
      });
      setSelectedIds(next);
    } else {
      setSelectedIds({});
    }
  }, []);

  // Check if all visible tags are selected
  const areAllSelected = useCallback((visibleTags) => {
    if (visibleTags.length === 0) return false;
    return visibleTags.every((tag) => selectedIds[getTagId(tag)]);
  }, [selectedIds]);

  // Get list of selected tags from a tags array
  const getSelectedTags = useCallback((tags) => {
    return tags.filter((tag) => selectedIds[getTagId(tag)]);
  }, [selectedIds]);

  // Get list of selected tag IDs
  const getSelectedIds = useCallback(() => {
    return Object.keys(selectedIds);
  }, [selectedIds]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds({});
  }, []);

  // Remove specific ID from selection
  const removeFromSelection = useCallback((tagId) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      delete next[tagId];
      return next;
    });
  }, []);

  return {
    selectedIds,
    hasSelection,
    selectedCount,
    isSelected,
    toggleSelection,
    toggleAllVisible,
    areAllSelected,
    getSelectedTags,
    getSelectedIds,
    clearSelection,
    removeFromSelection,
  };
};
