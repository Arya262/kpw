import { useState, useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Centralized button manager hook.
 * Keeps button data simple: { id, text, nodeResultId }
 * Uses simple sequential IDs (0, 1, 2) for consistency.
 */
export const useButtonManager = (
  initialButtons = [],
  maxButtons = 3,
  buttonCharLimit = 20
) => {
  // Normalize button from any format - use index-based IDs
  const normalizeButton = (btn, index) => {
    const text = btn.text || btn.title || btn.buttonText || "";
    return {
      id: String(index), // Simple sequential ID
      text,
      nodeResultId: btn.nodeResultId || "",
      charCount: text.length,
      isError: text.length > buttonCharLimit,
    };
  };

  const [buttons, setButtons] = useState(() =>
    initialButtons.map((btn, idx) => normalizeButton(btn, idx))
  );

  const addButton = useCallback(() => {
    if (buttons.length >= maxButtons) {
      toast.warning(`Maximum ${maxButtons} buttons allowed`);
      return;
    }

    setButtons((prev) => [
      ...prev,
      {
        id: String(prev.length), // Next sequential ID
        text: "",
        charCount: 0,
        isError: false,
        nodeResultId: "",
      },
    ]);
  }, [buttons.length, maxButtons]);

  const removeButton = useCallback((id) => {
    setButtons((prev) => {
      // Filter out the removed button, then re-index remaining buttons
      const filtered = prev.filter((btn) => btn.id !== id);
      return filtered.map((btn, idx) => ({ ...btn, id: String(idx) }));
    });
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
