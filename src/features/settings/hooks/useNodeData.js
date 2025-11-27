import { useState, useEffect, useMemo, useRef } from "react";
import debounce from "lodash.debounce";

export const useNodeData = (data, id, initializer, debounceMs = 500) => {

  const [formData, setFormData] = useState(() => initializer(data));


  const prevDataRef = useRef(data);


  useEffect(() => {
    if (prevDataRef.current !== data) {
      prevDataRef.current = data;

      // Reinitialize form data only if actual values changed
      const next = initializer(data);
      const isDifferent = JSON.stringify(next) !== JSON.stringify(formData);

      if (isDifferent) {
        setFormData(next);
      }
    }
  }, [data, initializer, formData]);


  const debouncedUpdate = useMemo(() => {
    return debounce((updated) => {
      if (updated && data?.updateNodeData) {
        data.updateNodeData(id, updated);
      }
    }, debounceMs);
  }, [data, id, debounceMs]);

 
  useEffect(() => {
    debouncedUpdate(formData);
  }, [formData, debouncedUpdate]);


  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  return [formData, setFormData];
};
