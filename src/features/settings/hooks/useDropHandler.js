import { useCallback } from "react";
import { toast } from "react-toastify";

export const useDropHandler = (
  reactFlowWrapperRef,
  screenToFlowPosition,
  createNewNode,
  setNodes,
  nodeTypes
) => {
  /* -------------------------------------------------------------------------- */
  /*                                   DROP                                     */
  /* -------------------------------------------------------------------------- */
  const onDrop = useCallback(
    (event) => {
      try {
        event.preventDefault();

        const wrapper = reactFlowWrapperRef.current;
        if (!wrapper) {
          toast.error("Flow editor is not ready.");
          return;
        }

        const bounds = wrapper.getBoundingClientRect();
        if (!bounds) {
          toast.error("Unable to determine editor boundaries.");
          return;
        }

        // Must drop inside editor
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          toast.error("Drop inside the editor.");
          return;
        }

        const raw = event.dataTransfer.getData("application/reactflow");
        if (!raw) {
          toast.error("Invalid drag data.");
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          console.error("Failed to parse drag data:", err);
          toast.error("Node data corrupted.");
          return;
        }

        let { type, label } = parsed;

        if (!type) {
          toast.error("No node type provided.");
          return;
        }

        // Normalize type (ReactFlow requires exact lowercase keys)
        const normalizedType = Object.keys(nodeTypes).find(
          (t) => t.toLowerCase() === type.toLowerCase()
        );

        if (!normalizedType) {
          toast.error(`Invalid node type: ${type}`);
          return;
        }

        type = normalizedType;

        // Ensure label exists
        if (!label) {
          label = type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        }

        // Convert cursor coordinates → canvas coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode = createNewNode(type, label, position, nodeTypes);
        if (!newNode) return;

        setNodes((prev) => [...prev, newNode]);

        toast.success(`✓ Added ${label}`, {
          autoClose: 1200,
          icon: "➕",
        });
      } catch (error) {
        console.error("❌ Drop handler error:", error);
        toast.error("Failed to drop node.");
      }
    },
    [reactFlowWrapperRef, screenToFlowPosition, createNewNode, setNodes, nodeTypes]
  );

  /* -------------------------------------------------------------------------- */
  /*                                 DRAG OVER                                  */
  /* -------------------------------------------------------------------------- */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return { onDrop, onDragOver };
};
