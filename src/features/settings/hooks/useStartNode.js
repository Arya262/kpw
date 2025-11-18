import { useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { FLOW_CONSTANTS } from "../config/flowConfig";

export const useStartNode = (setNodes, edges) => {
  // Helper to update start node safely
  const updateStartNode = useCallback((updater) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === "start"
          ? { ...node, data: { ...node.data, ...updater(node.data) } }
          : node
      )
    );
  }, [setNodes]);

  // Memoized debounced functions
  const handlers = useMemo(() => {
    return {
      onAddKeyword: debounce((word) => {
        const keyword = String(word || "").trim();
        if (!keyword) return;

        updateStartNode((data) => ({
          keywords: [...(data.keywords || []), keyword],
        }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),

      onRemoveKeyword: debounce((index) => {
        updateStartNode((data) => ({
          keywords: (data.keywords || []).filter((_, i) => i !== index),
        }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),

      onAddSubstring: debounce((word) => {
        const s = String(word || "").trim();
        if (!s) return;

        updateStartNode((data) => ({
          substrings: [...(data.substrings || []), s],
        }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),

      onRemoveSubstring: debounce((index) => {
        updateStartNode((data) => ({
          substrings: (data.substrings || []).filter((_, i) => i !== index),
        }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),

      onChangeRegex: debounce((value) => {
        updateStartNode(() => ({ regex: value }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),

      onToggleCaseSensitive: debounce(() => {
        updateStartNode((data) => ({
          caseSensitive: !data.caseSensitive,
        }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),
    };
  }, [updateStartNode]);

  // Flow trigger handler (not debounced)
  const onFlowTriggered = useCallback(
    (triggerData) => {
      toast.success(`Flow triggered by message: "${triggerData.message}"`);

      const connected = edges.filter((e) => e.source === "start");

      if (!connected.length) {
        toast.warn("No flow connected to start node");
        return;
      }

      connected.forEach((edge, i) => {
        setTimeout(() => {
          toast.info(`Step ${i + 1}: Executing ${edge.target}`);
        }, (i + 1) * 1000);
      });
    },
    [edges]
  );

  // Final node creator (stable)
  const createStartNode = useCallback(() => {
    return {
      id: "start",
      type: "flowStartNode",
      position: { x: 0, y: 100 },
      data: {
        keywords: [],
        substrings: [],
        caseSensitive: false,
        regex: "",
        ...handlers,
        onChooseTemplate: () => alert("Choose Template Clicked"),
        onFlowTriggered,
      },
    };
  }, [handlers, onFlowTriggered]);

  return { createStartNode };
};
