import { useCallback } from "react";
import { toast } from "react-toastify";

export const useNodeHandlers = (setNodes, setEdges, updateNodeData) => {

  /* -------------------------------------------------------------------------- */
  /*                                 DELETE NODE                                */
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
  /*                               DUPLICATE NODE                               */
  /* -------------------------------------------------------------------------- */
  const handleNodeDuplicate = useCallback(
    (nodeId) => {
      setNodes((nodes) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return nodes;

        const newId = `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Create empty data based on node type
        const getEmptyData = (nodeType, originalData) => {
          const base = {
            label: originalData.label || "New Node",
            updateNodeData,
          };

          // Type-specific empty data structures
          const emptyDataMap = {
            "text-button": {
              text: "",
              buttons: [],
              interactiveButtonsBody: "",
              interactiveButtonsItems: [],
              interactiveButtonsHeader: { type: "Text", text: "", media: null },
              interactiveButtonsFooter: "",
              interactiveButtonsUserInputVariable: "",
              interactiveButtonsDefaultNodeResultId: "",
            },
            "media-button": {
              mediaUrl: "",
              mediaType: originalData.mediaType || "image", // Keep media type
              caption: "",
              buttons: [],
              interactiveButtonsItems: [],
              interactiveButtonsHeader: { type: "Text", text: "", media: null },
              interactiveButtonsFooter: "",
              interactiveButtonsUserInputVariable: "",
              interactiveButtonsDefaultNodeResultId: "",
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
              validationType: originalData.validationType || "None", // Keep validation type
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
            "single-product": {
              body: "",
              footer: "",
              product: {},
            },
            "multi-product": {
              header: "",
              body: "",
              footer: "",
              products: [],
            },
            catalog: {
              body: "",
              footer: "",
            },
            summary: {
              title: "Summary",
              messageText: "",
              includeTimestamp: false,
            },
            "set-variable": {
              variableName: "",
              value: "",
            },
            "set-custom-field": {
              customField: "",
              value: "",
            },
            template: {
              selectedTemplate: null,
              templateId: "",
              templateName: "",
            },
          };

          return {
            ...base,
            ...(emptyDataMap[nodeType] || {}),
          };
        };

        const duplicatedNode = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50,
          },
          data: getEmptyData(node.type, node.data),
          selected: true, // Select the new node
        };

        // Deselect all other nodes and add the new one
        return nodes.map(n => ({ ...n, selected: false })).concat(duplicatedNode);
      });

      toast.success("Empty node created", { autoClose: 1200 });
    },
    [setNodes, updateNodeData]
  );

  /* -------------------------------------------------------------------------- */
  /*                               CREATE NEW NODE                              */
  /* -------------------------------------------------------------------------- */
  const createNewNode = useCallback(
    (type, label, position, nodeTypes) => {
      if (!nodeTypes[type]) {
        toast.error(`Invalid node type: ${type}`);
        return null;
      }

      const base = {
        label: label || "New Node",
        updateNodeData,
      };

      const typeMap = {
        list: {
          listHeader: "",
          listBody: "",
          listFooter: "",
          listSections: [],
        },
        "text-button": {
          text: "",
          buttons: [],
          interactiveButtonsBody: "",
          interactiveButtonsItems: [],
          interactiveButtonsHeader: { type: "Text", text: "", media: null },
          interactiveButtonsFooter: "",
          interactiveButtonsUserInputVariable: "",
          interactiveButtonsDefaultNodeResultId: "",
        },
        "media-button": {
          mediaUrl: "",
          mediaType: "image",
          caption: "",
          buttons: [],
          interactiveButtonsItems: [],
          interactiveButtonsHeader: { type: "Text", text: "", media: null },
          interactiveButtonsFooter: "",
          interactiveButtonsUserInputVariable: "",
          interactiveButtonsDefaultNodeResultId: "",
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
      };

      const initialData = {
        ...base,
        ...(typeMap[type] || {}),
      };

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
  /*                               ADD NODE BUTTON                              */
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

      toast.success(`✓ Added ${label}`, {
        autoClose: 1500,
        icon: "➕",
      });
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
