import { useState, useCallback } from "react";

export const useContactSelection = () => {
  const [selection, setSelection] = useState({
    mode: 'none', // 'none', 'page', 'all'
    selected: {},
    excluded: {},
  });

  const handleCheckboxChange = useCallback((contactId, isChecked) => {
    setSelection((prev) => {
      const newSelected = { ...prev.selected };
      const newExcluded = { ...prev.excluded };
      if (prev.mode === 'all') {
        if (!isChecked) {
          newExcluded[contactId] = true;
        } else {
          delete newExcluded[contactId];
        }
      } else {
        if (isChecked) {
          newSelected[contactId] = true;
        } else {
          delete newSelected[contactId];
        }
      }
      return { ...prev, selected: newSelected, excluded: newExcluded };
    });
  }, []);

  const handleSelectAllChange = useCallback((event, displayedContacts) => {
    const checked = event.target.checked;
    setSelection((prev) => ({
      ...prev,
      mode: checked ? 'page' : 'none',
      selected: checked ? displayedContacts.reduce((acc, c) => ({ ...acc, [c.contact_id]: true }), {}) : {},
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

  const hasSelectedContacts = selection.mode === 'all' || Object.keys(selection.selected).length > 0;

  const isContactSelected = useCallback((contactId) => {
    return selection.mode === 'all'
      ? !selection.excluded[contactId]
      : !!selection.selected[contactId];
  }, [selection]);

  return {
    selection,
    hasSelectedContacts,
    handleCheckboxChange,
    handleSelectAllChange,
    handleSelectAllAcrossPages,
    clearSelection,
    getSelectedCount,
    isContactSelected,
  };
};
