import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';

/**
 * Custom hook for managing node data with debounced updates to parent
 * @param {Object} data - Initial data from parent
 * @param {string} id - Node ID
 * @param {Function} initializer - Function to initialize form data from props
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 500)
 */
export const useNodeData = (data, id, initializer, debounceMs = 500) => {
  const [formData, setFormData] = useState(() => initializer(data));

  // Debounced update to parent
  const debouncedUpdate = useMemo(
    () => debounce((updatedData) => {
      if (data?.updateNodeData) {
        data.updateNodeData(id, updatedData);
      }
    }, debounceMs),
    [data, id, debounceMs]
  );

  // Update parent when formData changes
  useEffect(() => {
    debouncedUpdate(formData);
  }, [formData, debouncedUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  return [formData, setFormData];
};
