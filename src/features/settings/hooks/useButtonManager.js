import { useState, useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Centralized button manager hook.
 * Keeps button data simple: { id, text, nodeResultId }
 * Transformer handles conversion to backend format.
 */
export const useButtonManager = (
  initialButtons = [],
  maxButtons = 3,
  buttonCharLimit = 20
) => {
  // Normalize button from any format
  const normalizeButton = (btn) => {
    const text = btn.text || btn.title || btn.buttonText || "";
    return {
      id: btn.id || crypto.randomUUID(),
      text,
      nodeResultId: btn.nodeResultId || "",
      charCount: text.length,
      isError: text.length > buttonCharLimit,
    };
  };

  const [buttons, setButtons] = useState(() =>
    initialButtons.map(normalizeButton)
  );

  const addButton = useCallback(() => {
    if (buttons.length >= maxButtons) {
      toast.warning(`Maximum ${maxButtons} buttons allowed`);
      return;
    }

    setButtons((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: "",
        charCount: 0,
        isError: false,
        nodeResultId: "",
      },
    ]);
  }, [buttons.length, maxButtons]);

  const removeButton = useCallback((id) => {
    setButtons((prev) => prev.filter((btn) => btn.id !== id));
  }, []);

  const updateButtonText = useCallback(
    (id, text) => {
      setButtons((prev) =>
        prev.map((btn) =>
          btn.id === id
            ? {
                ...btn,
                text,
                charCount: text.length,
                isError: text.length > buttonCharLimit,
              }
            : btn
        )
      );
    },
    [buttonCharLimit]
  );

  return {
    buttons,
    setButtons,
    addButton,
    removeButton,
    updateButtonText,
    canAddMore: buttons.length < maxButtons,
  };
};

export default useButtonManager;
