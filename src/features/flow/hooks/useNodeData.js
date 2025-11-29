import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import debounce from "lodash.debounce";

export const useNodeData = (data, id, initializer, debounceMs = 500) => {
  // Initialize form data once
  const [formData, setFormData] = useState(() => initializer(data));
  
  // Track if we're the source of the update to prevent loops
  const isLocalUpdateRef = useRef(false);
  const initializedRef = useRef(false);

  // Only reinitialize on first mount or when loading different node data
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    
    // Skip if this update came from our own debounced sync
    if (isLocalUpdateRef.current) {
      isLocalUpdateRef.current = false;
      return;
    }
  }, [data]);

  // Debounced sync to parent
  const debouncedUpdate = useMemo(() => {
    return debounce((updated) => {
      if (updated && data?.updateNodeData) {
        isLocalUpdateRef.current = true;
        data.updateNodeData(id, updated);
      }
    }, debounceMs);
  }, [data?.updateNodeData, id, debounceMs]);

  // Sync form data to parent (debounced)
  useEffect(() => {
    debouncedUpdate(formData);
  }, [formData, debouncedUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  return [formData, setFormData];
};
