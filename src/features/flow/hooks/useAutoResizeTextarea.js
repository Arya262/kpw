import { useEffect, useRef } from 'react';

export const useAutoResizeTextarea = (value, minHeight = 80, maxHeight) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';

    let newHeight = textarea.scrollHeight;

    // Apply minimum height rule
    if (newHeight < minHeight) {
      newHeight = minHeight;
    }

    // Only apply maxHeight if it exists
    if (maxHeight && newHeight > maxHeight) {
      newHeight = maxHeight;
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }

    textarea.style.height = `${newHeight}px`;
  }, [value, minHeight, maxHeight]);

  return textareaRef;
};
