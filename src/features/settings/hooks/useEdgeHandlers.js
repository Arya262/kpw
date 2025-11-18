import { useCallback } from "react";
import { addEdge } from "reactflow";
import { toast } from "react-toastify";

export const useEdgeHandlers = (nodes, edges, setEdges) => {
  /* -------------------------------------------------------------------------- */
  /*                                 VALIDATIONS                                */
  /* -------------------------------------------------------------------------- */

  const checkValidConnection = useCallback(
    (source, target) => {
      if (source === target) {
        toast.error("Cannot connect a node to itself", { icon: "🔗" });
        return false;
      }

      const targetNode = nodes.find((n) => n.id === target);
      if (targetNode?.type === "flowStartNode") {
        toast.error("Cannot connect to the start node", { icon: "🚫" });
        return false;
      }

      const isDuplicate = edges.some(
        (e) => e.source === source && e.target === target
      );
      if (isDuplicate) {
        toast.error("This connection already exists", { icon: "⚠️" });
        return false;
      }

      if (source === "start") {
        const hasStartConnection = edges.some((e) => e.source === "start");
        if (hasStartConnection) {
          toast.error("Only one node can connect from Flow Start", {
            icon: "🚫",
          });
          return false;
        }
      }

      return true;
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;

      if (!checkValidConnection(source, target)) return;

      const edgeId = `edge-${source}-${target}-${Date.now()}`;

      setEdges((eds) =>
        addEdge(
          {
            id: edgeId,
            ...params,
            type: "default",
            animated: true,
            style: { stroke: "#0ea5e9", strokeWidth: 2 },
            markerEnd: { type: "arrowclosed", color: "#0ea5e9" },
          },
          eds
        )
      );

      toast.success("✓ Connection created", {
        autoClose: 1500,
        icon: "🔗",
      });
    },
    [setEdges, checkValidConnection]
  );

  /* -------------------------------------------------------------------------- */
  /*                              DELETE EDGE (COMMON)                           */
  /* -------------------------------------------------------------------------- */

  const deleteEdge = useCallback(
    (edge) => {
      const confirmed = window.confirm(
        `Delete connection from "${edge.source}" → "${edge.target}"?`
      );

      if (confirmed) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        toast.success("✓ Connection deleted", {
          autoClose: 1500,
          icon: "🗑️",
        });
      }
    },
    [setEdges]
  );

  /* -------------------------------------------------------------------------- */
  /*                           DELETE EDGE EVENTS                               */
  /* -------------------------------------------------------------------------- */

  const onEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      deleteEdge(edge);
    },
    [deleteEdge]
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      deleteEdge(edge);
    },
    [deleteEdge]
  );

  /* -------------------------------------------------------------------------- */

  return { onConnect, onEdgeClick, onEdgeContextMenu };
};
