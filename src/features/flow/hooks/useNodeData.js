import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import debounce from "lodash.debounce";

export const useNodeData = (data, id, initializer, debounceMs = 500) => {
  
  const [formData, setFormData] = useState(() => initializer(data));
  
  const isLocalUpdateRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    
    
    if (isLocalUpdateRef.current) {
      isLocalUpdateRef.current = false;
      return;
    }
  }, [data]);

  
  const debouncedUpdate = useMemo(() => {
    return debounce((updated) => {
      if (updated && data?.updateNodeData) {
        isLocalUpdateRef.current = true;
        data.updateNodeData(id, updated);
      }
    }, debounceMs);
  }, [data?.updateNodeData, id, debounceMs]);

  
  useEffect(() => {
    debouncedUpdate(formData);
  }, [formData, debouncedUpdate]);

  
  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  return [formData, setFormData];
};
