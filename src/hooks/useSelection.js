import { useState, useCallback } from "react";

export const useSelection = () => {
  const [selection, setSelection] = useState({
    mode: 'none', // 'none', 'page', 'all'
    selected: {},
    excluded: {},
  });

  const handleCheckboxChange = useCallback((itemId, isChecked) => {
    setSelection((prev) => {
      const newSelected = { ...prev.selected };
      const newExcluded = { ...prev.excluded };
      if (prev.mode === 'all') {
        if (!isChecked) {
          newExcluded[itemId] = true;
        } else {
          delete newExcluded[itemId];
        }
      } else {
        if (isChecked) {
          newSelected[itemId] = true;
        } else {
          delete newSelected[itemId];
        }
      }
      return { ...prev, selected: newSelected, excluded: newExcluded };
    });
  }, []);

  const handleSelectAllChange = useCallback((event, displayedItems) => {
    const checked = event.target.checked;
    setSelection((prev) => ({
      ...prev,
      mode: checked ? 'page' : 'none',
      selected: checked ? displayedItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}) : {},
      excluded: {},
    }));
  }, []);

  const handleSelectAllAcrossPages = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      mode: 'all',
      selected: {},
      excluded: {},
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ mode: 'none', selected: {}, excluded: {} });
  }, []);

  const getSelectedCount = useCallback((totalItems) => {
    return selection.mode === 'all'
      ? totalItems - Object.keys(selection.excluded).length
      : Object.keys(selection.selected).length;
  }, [selection]);

  const hasSelectedItems = selection.mode === 'all' || Object.keys(selection.selected).length > 0;

  const isItemSelected = useCallback((itemId) => {
    return selection.mode === 'all'
      ? !selection.excluded[itemId]
      : !!selection.selected[itemId];
  }, [selection]);

  const getSelectedIds = useCallback(() => {
    if (selection.mode === 'all') {
      // Return all IDs except excluded ones
      // This would need to be provided by the component using this hook
      return [];
    }
    return Object.keys(selection.selected);
  }, [selection]);

  return {
    selection,
    hasSelectedItems,
    handleCheckboxChange,
    handleSelectAllChange,
    handleSelectAllAcrossPages,
    clearSelection,
    getSelectedCount,
    isItemSelected,
    getSelectedIds,
  };
};
