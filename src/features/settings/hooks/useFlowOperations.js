import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import { flowAPI } from "../../../services/flowService";
import { buildFrontendFlow } from "../../../services/flowTransformers";

export const useFlowOperations = (user, setNodes, setEdges, setMode) => {
  const [savedFlows, setSavedFlows] = useState([]);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [flowTitle, setFlowTitle] = useState("Untitled");
  const [flowEnabled, setFlowEnabled] = useState(true);

  // ---------------------------------------------------------
  // LOAD ALL FLOWS FOR CUSTOMER
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchFlows = async () => {
      if (!user?.customer_id) {
        setInitialLoading(false);
        return;
      }

      try {
        const flows = await flowAPI.getAll(user.customer_id);

        if (Array.isArray(flows)) {
          const transformed = flows.map((flow) => {
            let triggerConfig = {
              keywords: [],
              regex: "",
              caseSensitive: false,
            };

            if (flow.triggers_list) {
              const keywords = [];
              let regex = "";

              flow.triggers_list.forEach((t) => {
                if (t.match_type === "regex") regex = t.keyword;
                else keywords.push(t.keyword);
              });

              triggerConfig = {
                keywords,
                regex,
                caseSensitive: flow.triggers_list.some(
                  (t) => t.match_type === "exact"
                ),
              };
            }

            return {
              id: flow.id,
              name: flow.flow_name,
              isActive: flow.status === "ACTIVE",
              created_at: flow.created_at,
              updated_at: flow.updated_at,
              flow_data: flow.flow_json,
              triggerConfig,
            };
          });

          setSavedFlows(transformed);
        }
      } catch (err) {
        console.error("Error fetching flows:", err);
      }

      setInitialLoading(false);
    };

    fetchFlows();
  }, [user?.customer_id]);

  // ---------------------------------------------------------
  // SAVE NEW FLOW
  // ---------------------------------------------------------
  const handleSaveFlowFromHeader = useCallback(
    async (title, enabled, nodes, edges, viewport) => {
      if (!title.trim()) {
        toast.error("Please enter a flow name");
        return;
      }

      setLoadingFlow(true);

      try {
        const metadata = {
          customer_id: user?.customer_id,
          name: title.trim(),
          enabled,
        };

        const result = await flowAPI.save(nodes, edges, metadata, viewport);

        toast.success(`Flow "${title}" saved successfully!`);

        setSavedFlows((prev) => [
          {
            id: result.id || Date.now(),
            name: title.trim(),
            isActive: enabled,
            flow_data: result.flow_json,
            triggerConfig: result.triggerConfig,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ]);

        // Reset editor
        setNodes([]);
        setEdges([]);
        setFlowTitle("Untitled");
        setFlowEnabled(true);
        setMode("table");
      } catch (err) {
        console.error("Save error:", err);
        toast.error("Failed to save flow");
      } finally {
        setLoadingFlow(false);
      }
    },
    [user?.customer_id, setNodes, setEdges, setMode]
  );

  // ---------------------------------------------------------
  // LOAD FLOW
  // ---------------------------------------------------------
  const handleLoadFlow = useCallback(
    (flow) => {
      setLoadingFlow(true);

      try {
        const rawFlow = flow.flow_data || flow.flow_json;

        if (!rawFlow) {
          toast.error("No flow data found");
          setLoadingFlow(false);
          return null;
        }

        const safeFlow =
          typeof rawFlow === "string" ? JSON.parse(rawFlow) : rawFlow;

        const rawNodes = safeFlow.flowNodes || [];
        const rawEdges = safeFlow.flowEdges || [];

        // Build frontend structure
        const { nodes, edges } = buildFrontendFlow(
          { flowNodes: rawNodes, flowEdges: rawEdges },
          (nodeId, newData) =>
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
              )
            )
        );

        // Set editor data
        setNodes(nodes);
        setEdges(edges);
        setFlowTitle(flow.name || "Untitled");
        setFlowEnabled(flow.isActive || false);

        // Handle viewport transform
        if (safeFlow.transform) {
          return {
            x: parseFloat(safeFlow.transform.posX || 0),
            y: parseFloat(safeFlow.transform.posY || 0),
            zoom: parseFloat(safeFlow.transform.zoom || 1),
          };
        }

        return null;
      } catch (err) {
        console.error("Load flow error:", err);
        toast.error("Failed to load flow");
        return null;
      } finally {
        setLoadingFlow(false);
      }
    },
    [setNodes, setEdges]
  );

  // ---------------------------------------------------------
  // UPDATE FLOW
  // ---------------------------------------------------------
  const handleUpdateFlow = useCallback(
    async (flowId, title, enabled, nodes, edges, viewport) => {
      if (!title.trim()) {
        toast.error("Please enter a flow name");
        return false;
      }

      setLoadingFlow(true);

      try {
        const metadata = {
          customer_id: user?.customer_id,
          name: title.trim(),
          enabled,
        };

        const result = await flowAPI.update(
          flowId,
          nodes,
          edges,
          metadata,
          viewport
        );

        toast.success(`Flow "${title}" updated successfully!`);

        setSavedFlows((prev) =>
          prev.map((f) =>
            f.id === flowId
              ? {
                  ...f,
                  name: title.trim(),
                  isActive: enabled,
                  flow_data: result.flow_json,
                  updated_at: new Date().toISOString(),
                }
              : f
          )
        );

        return true;
      } catch (err) {
        console.error("Update error:", err);
        toast.error("Failed to update flow");
        return false;
      } finally {
        setLoadingFlow(false);
      }
    },
    [user?.customer_id]
  );

  // ---------------------------------------------------------
  // DELETE FLOW
  // ---------------------------------------------------------
  const handleDeleteFlow = useCallback(async (flowId) => {
    try {
      await flowAPI.delete(flowId);
      setSavedFlows((prev) => prev.filter((f) => f.id !== flowId));
      toast.success("Flow deleted successfully");
    } catch (err) {
      console.error("Delete flow error:", err);
      toast.error("Failed to delete flow");
    }
  }, []);

  return {
    savedFlows,
    loadingFlow,
    initialLoading,
    flowTitle,
    flowEnabled,
    setFlowTitle,
    setFlowEnabled,
    handleSaveFlowFromHeader,
    handleLoadFlow,
    handleUpdateFlow,
    handleDeleteFlow,
  };
};
