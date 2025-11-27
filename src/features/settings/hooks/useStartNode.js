import { useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { FLOW_CONSTANTS } from "../config/flowConfig";

/**
 * Start Node Management Hook
 * - Clean separation between backend-safe data and UI handlers
 * - No functions saved to backend
 * - Correct triggerConfig structure
 */
export const useStartNode = (setNodes, edges) => {

  /* -------------------------------------------------------------------------- */
  /*                         SAFE UPDATE START NODE DATA                        */
  /* -------------------------------------------------------------------------- */
  const updateStartNode = useCallback(
    (updater) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === "start"
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updater(node.data),
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  /* -------------------------------------------------------------------------- */
  /*                     MEMOIZED & DEBOUNCED START NODE HANDLERS              */
  /* -------------------------------------------------------------------------- */
  const handlers = useMemo(() => {
    return {
      /** KEYWORDS */
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

      /** REGEX */
      onChangeRegex: debounce((value) => {
        updateStartNode(() => ({ regex: value }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),

      /** CASE SENSITIVE */
      onToggleCaseSensitive: debounce(() => {
        updateStartNode((data) => ({
          caseSensitive: !data.caseSensitive,
        }));
      }, FLOW_CONSTANTS.DEBOUNCE_DELAY),
    };
  }, [updateStartNode]);

  /* -------------------------------------------------------------------------- */
  /*                         FLOW TRIGGER DEMONSTRATION                         */
  /* -------------------------------------------------------------------------- */
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
        }, (i + 1) * 700);
      });
    },
    [edges]
  );

  /* -------------------------------------------------------------------------- */
  /*                        CREATE START NODE (BACKEND SAFE)                     */
  /* -------------------------------------------------------------------------- */
  const createStartNode = useCallback(() => {
    return {
      id: "start",
      type: "flowStartNode",
      position: { x: 0, y: 100 },

      // ONLY backend-safe fields here
      data: {
        keywords: [],
        regex: "",
        caseSensitive: false,

        /** UI HANDLERS (runtime only, NOT saved to backend) */
        ...handlers,
        onFlowTriggered,
        onChooseTemplate: () => alert("Choose Template Clicked"),
      },
    };
  }, [handlers, onFlowTriggered]);

  return { createStartNode };
};
