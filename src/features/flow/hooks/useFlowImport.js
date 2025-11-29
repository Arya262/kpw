import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import {
  buildFrontendFlow, // <-- from FlowTransformService.js
} from "../../../services/flowTransformers";

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
          toast.error("Invalid flow file — JSON object expected.");
          return;
        }

        // Accept backend format (flowNodes/flowEdges)
        const rawNodes = jsonData.flowNodes || jsonData.nodes;
        const rawEdges = jsonData.flowEdges || jsonData.edges;

        if (!Array.isArray(rawNodes)) {
          toast.error("Invalid flow file — flowNodes must be array.");
          return;
        }

        // 🚀 Use unified backend → frontend transformer
        const { nodes, edges } = buildFrontendFlow(
          { flowNodes: rawNodes, flowEdges: rawEdges },
          updateNodeData
        );

        // Apply to canvas
        setNodes(nodes);
        setEdges(edges);

        // Title update
        if (jsonData.name && jsonData.name !== flowTitle) {
          setFlowTitle(jsonData.name);
        }

        // Center camera on start node
        setTimeout(() => {
          const startNode = nodes.find((n) => n.id === "start");
          if (startNode) {
            setCenter(startNode.position.x + 150, startNode.position.y, {
              zoom: 0.75,
              duration: 450,
            });
          }
        }, 200);

        setIsImporting(false);
        toast.success("Flow imported successfully!");
      } catch (error) {
        console.error("❌ Flow import failed:", error);
        toast.error("Failed to import flow. Invalid JSON structure.");
        setIsImporting(false);
      }
    },
    [setNodes, setEdges, setFlowTitle, flowTitle, updateNodeData, setCenter]
  );

  return { handleImportFlow, isImporting };
};
