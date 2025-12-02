import { useCallback } from "react";
import { toast } from "react-toastify";

export const useNodeHandlers = (setNodes, setEdges, updateNodeData) => {
  /* -------------------------------------------------------------------------- */
  /*                                 DELETE NODE                                 */
  /* -------------------------------------------------------------------------- */
  const handleNodeDelete = useCallback(
    (nodeId) => {
      setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
      setEdges((edges) =>
        edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      toast.success("Node deleted", { autoClose: 1500 });
    },
    [setNodes, setEdges]
  );

  /* -------------------------------------------------------------------------- */
  /*                           DUPLICATE → CLEAN EMPTY NODE                      */
  /* -------------------------------------------------------------------------- */
  const handleNodeDuplicate = useCallback(
    (nodeId) => {
      setNodes((nodes) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return nodes;

        const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // IMPORTANT:
        // When duplicating, we must produce a CLEAN EMPTY node of same type,
        // without copying old values (buttons, media, lists, etc.)
        const getEmptyData = (type) => {
          const base = { updateNodeData, label: "New Node" };

          switch (type) {
            case "text-button":
              return {
                ...base,
                text: "",
                buttons: [],
                interactiveButtonsItems: [],
                interactiveButtonsHeader: { type: "text", text: "" },
                interactiveButtonsFooter: "",
              };

            case "media-button":
              return {
                ...base,
                mediaUrl: "",
                mediaId: "",
                mediaType: node.data.mediaType || "image",
                caption: "",
                buttons: [],
                interactiveButtonsItems: [],
                interactiveButtonsHeader: { type: "text", text: "" },
                interactiveButtonsFooter: "",
              };

            case "list":
              return {
                ...base,
                listHeader: "",
                listBody: "",
                listFooter: "",
                listSections: [],
              };

            case "ask-question":
              return {
                ...base,
                questionText: "",
                customField: "",
                validationType: node.data.validationType || "None",
                isMediaAccepted: false,
                expectedAnswers: [],
              };

            case "ask-address":
              return {
                ...base,
                questionText: "",
                customField: "",
              };

            case "ask-location":
              return {
                ...base,
                questionText: "",
                longitudeField: "",
                latitudeField: "",
              };

            case "single-product":
              return {
                ...base,
                body: "",
                footer: "",
                product: {},
              };

            case "multi-product":
              return {
                ...base,
                header: "",
                body: "",
                footer: "",
                products: [],
              };

            case "catalog":
              return {
                ...base,
                body: "",
                footer: "",
                catalogId: "",
              };

            case "summary":
              return {
                ...base,
                title: "Summary",
                messageText: "",
                includeTimestamp: false,
              };

            case "set-variable":
              return {
                ...base,
                variableName: "",
                value: "",
              };

            case "set-custom-field":
              return {
                ...base,
                customField: "",
                value: "",
              };

            case "template":
              return {
                ...base,
                selectedTemplate: null,
                templateId: "",
                templateName: "",
              };

            default:
              return base;
          }
        };

        const cleanEmptyData = getEmptyData(node.type);

        const duplicated = {
          ...node,
          id: newId,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
          data: cleanEmptyData,
          selected: true,
        };

        return nodes.map((n) => ({ ...n, selected: false })).concat(duplicated);
      });

      toast.success("Empty node created", { autoClose: 1200 });
    },
    [setNodes, updateNodeData]
  );

  /* -------------------------------------------------------------------------- */
  /*                                  CREATE NODE                                */
  /* -------------------------------------------------------------------------- */
  const createNewNode = useCallback(
    (type, label, position, nodeTypes) => {
      if (!nodeTypes[type]) {
        toast.error(`Invalid node type: ${type}`);
        return null;
      }

      const base = {
        updateNodeData,
        label: label || "New Node",
      };

      const typeDefaults = {
        "text-button": {
          text: "",
          buttons: [],
          interactiveButtonsItems: [],
          interactiveButtonsHeader: { type: "text", text: "" },
          interactiveButtonsFooter: "",
        },
        "media-button": {
          mediaUrl: "",
          mediaId: "",
          mediaType: "image",
          caption: "",
          buttons: [],
          interactiveButtonsItems: [],
          interactiveButtonsHeader: { type: "text", text: "" },
          interactiveButtonsFooter: "",
        },
        list: {
          listHeader: "",
          listBody: "",
          listFooter: "",
          listSections: [],
        },
        "ask-question": {
          questionText: "",
          customField: "",
          validationType: "None",
          isMediaAccepted: false,
          expectedAnswers: [],
        },
        "ask-address": {
          questionText: "",
          customField: "",
        },
        "ask-location": {
          questionText: "",
          longitudeField: "",
          latitudeField: "",
        },
        template: {
          selectedTemplate: null,
          buttons: [],
          interactiveButtonsItems: [],
        },
        delay: {
          delayValue: 1,
          delayUnit: "hours",
          delayType: "duration",
          specificTime: "",
          specificDate: "",
        },
        condition: {
          conditionType: "tag",
          conditions: [
            {
              id: Date.now(),
              field: "",
              operator: "equals",
              value: "",
            },
          ],
          matchType: "all",
        },
        goal: {
          goalName: "",
          goalDescription: "",
          goalType: "conversion",
          actionOnComplete: "continue",
          completionTag: "",
          trackMetrics: true,
        },
      };

      const initialData = { ...base, ...(typeDefaults[type] || {}) };

      return {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        position,
        data: initialData,
      };
    },
    [updateNodeData]
  );

  /* -------------------------------------------------------------------------- */
  /*                            ADD NODE FROM TOOLBAR                            */
  /* -------------------------------------------------------------------------- */
  const handleAddNodeClick = useCallback(
    (type, label, screenToFlowPosition, wrapperRef, nodeTypes, setNodesState) => {
      if (!wrapperRef.current) {
        toast.error("Flow editor not ready.");
        return;
      }

      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: bounds.width / 2,
        y: bounds.height / 2,
      });

      const newNode = createNewNode(type, label, position, nodeTypes);
      if (!newNode) return;

      setNodesState((nodes) => [...nodes, newNode]);

      toast.success(`✓ Added ${label}`, { autoClose: 1500, icon: "➕" });
    },
    [createNewNode]
  );

  return {
    handleNodeDelete,
    handleNodeDuplicate,
    createNewNode,
    handleAddNodeClick,
  };
};
