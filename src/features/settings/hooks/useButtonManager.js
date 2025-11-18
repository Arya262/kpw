import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useButtonManager = (
  initialButtons = [],
  maxButtons = 3,
  buttonCharLimit = 20
) => {
  const [buttons, setButtons] = useState(initialButtons);

  const addButton = useCallback(() => {
    if (buttons.length >= maxButtons) {
      toast.warning(`Maximum ${maxButtons} buttons allowed`);
      return;
    }
    
    setButtons(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: '',
        charCount: 0,
        isError: false,
        nodeResultId: '', 
      }
    ]);
  }, [buttons.length, maxButtons]);

  const removeButton = useCallback((id) => {
    setButtons(prev => prev.filter(btn => btn.id !== id));
  }, []);

  const updateButton = useCallback((id, updates) => {
    setButtons(prev =>
      prev.map(btn => (btn.id === id ? { ...btn, ...updates } : btn))
    );
  }, []);

  const updateButtonText = useCallback(
    (id, text) => {
      const charCount = text.length;
      updateButton(id, {
        text,
        charCount,
        isError: charCount > buttonCharLimit,
      });
    },
    [updateButton, buttonCharLimit]
  );

  return {
    buttons,
    setButtons,
    addButton,
    removeButton,
    updateButton,
    updateButtonText,
  };
};
