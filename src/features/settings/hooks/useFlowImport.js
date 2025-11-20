import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { NORMALIZED_NODE_TYPES, DEFAULT_EDGE_OPTIONS } from "../config/flowConfig";

export const useFlowImport = (
  setNodes,
  setEdges,
  setFlowTitle,
  flowTitle,
  createStartNode,
  nodeTypes,
  updateNodeData,
  setCenter
) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFlow = useCallback(
    (jsonData) => {
      try {
        setIsImporting(true);

        if (!jsonData || typeof jsonData !== "object") {
          toast.error("Invalid flow data: JSON object required.");
          return;
        }

        // Support both flowNodes/flowEdges and nodes/edges formats
        const nodesArray = jsonData.flowNodes || jsonData.nodes;
        const edgesArray = jsonData.flowEdges || jsonData.edges;

        if (!Array.isArray(nodesArray)) {
          toast.error("Invalid flow data: nodes must be an array.");
          return;
        }

        const nodeMap = {};
        let startAssigned = false;

        // ---- PROCESS NODES ----
        const importedNodes = nodesArray
          .map((node, index) => {
            // ---------- POSITION ----------
            let posX, posY;

            if (node.position) {
              posX = parseFloat(node.position.x);
              posY = parseFloat(node.position.y);
            } else if (node.flowNodePosition) {
              posX = parseFloat(node.flowNodePosition.posX || 0);
              posY = parseFloat(node.flowNodePosition.posY || 0);
            } else {
              posX = Math.random() * 500;
              posY = Math.random() * 500;
            }

            if (isNaN(posX) || isNaN(posY)) {
              posX = Math.random() * 500;
              posY = Math.random() * 500;
            }

            // ---------- TYPE NORMALIZATION ----------
            const originalType = node.type || node.flowNodeType || "";
            let nodeType = originalType.toLowerCase();

            if (NORMALIZED_NODE_TYPES[nodeType]) {
              nodeType = NORMALIZED_NODE_TYPES[nodeType];
            } else if (!nodeTypes[nodeType]) {
              const foundType = Object.keys(nodeTypes).find(
                (t) => t.toLowerCase() === nodeType
              );
              nodeType = foundType || "default";
            }

            let nodeData = { ...(node.data || {}) };

            // ---------- START NODE ----------
            const looksLikeStart =
              node.isStartNode ||
              node.flowNodeType === "start" ||
              node.id === "start" ||
              index === 0;

            const isStart = !startAssigned && looksLikeStart;

            if (isStart) {
              startAssigned = true;
              nodeType = "flowStartNode";

              nodeData = {
                ...createStartNode().data, // defaults
                ...nodeData, // imported overrides
                keywords:
                  nodeData.keywords ||
                  jsonData.triggerConfig?.keywords ||
                  [],
                substrings:
                  nodeData.substrings ||
                  jsonData.triggerConfig?.substrings ||
                  [],
                regex:
                  nodeData.regex ||
                  jsonData.triggerConfig?.regex ||
                  "",
                caseSensitive:
                  nodeData.caseSensitive ??
                  jsonData.triggerConfig?.caseSensitive ??
                  false,
              };
            }

            // ---------- TEXT BUTTON ----------
            if (
              node.flowNodeType === "InteractiveButtons" ||
              nodeType === "text-button"
            ) {
              nodeType = "text-button";

              const buttons =
                nodeData.buttons ||
                (node.interactiveButtonsItems || []).map((btn) => ({
                  id:
                    btn.id ||
                    btn.buttonId ||
                    `btn-${Math.random().toString(36).substr(2, 9)}`,
                  text: btn.buttonText || "",
                  targetNodeId: btn.nodeResultId,
                }));

              nodeData = {
                ...nodeData,
                text: node.interactiveButtonsBody || nodeData.text || "",
                buttons,
              };
            }

            // ---------- MEDIA BUTTON ----------
            if (
              node.flowNodeType === "MediaButton" ||
              nodeType === "media-button"
            ) {
              nodeType = "media-button";

              const buttons =
                nodeData.buttons ||
                (node.interactiveButtonsItems || []).map((btn) => ({
                  id:
                    btn.id ||
                    btn.buttonId ||
                    `btn-${Math.random().toString(36).substr(2, 9)}`,
                  text: btn.buttonText || "",
                  targetNodeId: btn.nodeResultId,
                }));

              nodeData = {
                ...nodeData,
                caption:
                  node.caption ||
                  node.interactiveButtonsBody ||
                  nodeData.caption ||
                  "",
                mediaUrl: node.mediaUrl || nodeData.mediaUrl || "",
                mediaType:
                  (node.mediaType || nodeData.mediaType || "image").toLowerCase(),
                buttons,
              };
            }

            // ---------- FLOW REPLIES ----------
            if (node.flowReplies?.length) {
              const message = node.flowReplies[0];

              const buttons = (message.interactiveButtonsItems || []).map(
                (btn) => ({
                  id:
                    btn.id ||
                    btn.buttonId ||
                    `btn-${Math.random().toString(36).substr(2, 9)}`,
                  text: btn.buttonText || "",
                  targetNodeId: btn.nodeResultId,
                })
              );

              if (message.flowReplyType === "List" || nodeType === "list") {
                nodeType = "list";

                nodeData = {
                  ...nodeData,
                  listHeader: message.listHeader || "",
                  listBody: message.listBody || "",
                  listFooter: message.listFooter || "",
                  listSections: message.listSections || [],
                  buttons,
                };
              } else {
                nodeData = {
                  ...nodeData,
                  text: message.data || nodeData.text || "",
                  mediaType:
                    (nodeData.mediaType ||
                      message.mimeType ||
                      "text").toLowerCase(),
                  mediaUrl: message.mediaUrl || nodeData.mediaUrl || "",
                  caption: message.caption || nodeData.caption || "",
                  buttons,
                };
              }
            }

            const finalId = node.id || `node-${Date.now() + index}`;

            const newNode = {
              id: finalId,
              type: nodeType,
              position: { x: posX, y: posY },
              data: {
                ...nodeData,
                label: nodeData.label || nodeType,
                updateNodeData,
              },
            };

            nodeMap[finalId] = newNode; // 🔥 FIXED (was node.id)

            return newNode;
          })
          .filter(Boolean);

        // ---------- PROCESS EDGES ----------
        const importedEdges = processEdges(edgesArray, nodeMap);

        setNodes(importedNodes);

        if (jsonData.name && jsonData.name !== flowTitle) {
          setFlowTitle(jsonData.name);
        }

        setTimeout(() => {
          setEdges(importedEdges);
          setIsImporting(false);
          toast.success("Flow imported successfully!");

          const startNode = importedNodes.find((n) => n.id === "start");
          if (startNode) {
            setTimeout(() => {
              setCenter(startNode.position.x + 150, startNode.position.y, {
                zoom: 0.75,
                duration: 400,
              });
            }, 100);
          }
        }, 200);
      } catch (error) {
        console.error("Error processing imported flow:", error);
        toast.error("Failed to import flow. Please check the file format.");
        setIsImporting(false);
      }
    },
    [
      setNodes,
      setEdges,
      setFlowTitle,
      flowTitle,
      createStartNode,
      nodeTypes,
      updateNodeData,
      setCenter,
    ]
  );

  return { handleImportFlow, isImporting };
};

// ========================================================
//   EDGE PROCESSOR (FULL FIXED VERSION)
// ========================================================
function processEdges(flowEdges, nodeMap) {
  const importedEdges = [];

  if (!Array.isArray(flowEdges)) return importedEdges;

  // FIX: longest match logic
  const resolveNodeId = (id) => {
    if (nodeMap[id]) return id;

    // try handle → nodeId-left-handle
    if (id.endsWith("-left-handle")) {
      const base = id.replace("-left-handle", "");
      if (nodeMap[base]) return base;
    }

    // longest key match
    const keys = Object.keys(nodeMap);
    const match =
      keys
        .filter((k) => id === k || id.startsWith(k))
        .sort((a, b) => b.length - a.length)[0] || null;

    return match;
  };

  flowEdges.forEach((edge) => {
    try {
      const sourceId = edge.sourceNodeId || edge.source;
      const targetId = edge.targetNodeId || edge.target;

      let resolvedSourceId = resolveNodeId(sourceId);
      let resolvedTargetId = resolveNodeId(targetId);

      if (!resolvedSourceId || !resolvedTargetId) return;

      let sourceHandle, targetHandle;

      // FIX: regex button detection
      const isButtonSource = /btn[-_]/i.test(sourceId);

      if (isButtonSource) {
        const nodeId = resolvedSourceId;
        const node = nodeMap[nodeId];

        if (node?.data?.buttons?.length) {
          const btnId = sourceId.split(/btn[-_]/i)[1];
          const foundBtn = node.data.buttons.find(
            (b) => b.id === btnId || sourceId.endsWith(b.id)
          );

          if (foundBtn) {
            sourceHandle = `btn-${foundBtn.id}`;
          }
        }
      }

      if (targetId.endsWith("-left-handle")) {
        targetHandle = "left-handle";
      }

      const newEdge = {
        id: edge.id || `e${Math.random().toString(36).substr(2, 9)}`,
        source: resolvedSourceId,
        target: resolvedTargetId,
        sourceHandle,
        targetHandle,

        // Use consistent edge styling - merge imported style with defaults
        animated: edge.animated ?? DEFAULT_EDGE_OPTIONS.animated,
        style: edge.style && Object.keys(edge.style).length > 0 
          ? edge.style 
          : DEFAULT_EDGE_OPTIONS.style,
        markerEnd: edge.markerEnd ?? DEFAULT_EDGE_OPTIONS.markerEnd,
        type: edge.type || DEFAULT_EDGE_OPTIONS.type,

        data: { ...edge },
      };

      importedEdges.push(newEdge);
    } catch (err) {
      console.error("Error processing edge:", err);
    }
  });

  return importedEdges;
}