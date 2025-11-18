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
          toast.error("Unable to determine flow editor limits.");
          return;
        }

        // Ensure drop happens *inside* the editor
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          toast.error("Drop inside the editor to add a node.");
          return;
        }

        const rawData = event.dataTransfer.getData("application/reactflow");
        if (!rawData) {
          toast.error("Invalid node data.");
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(rawData);
        } catch (err) {
          console.error("Drag data parse failed:", err);
          toast.error("Node data is corrupted.");
          return;
        }

        const { type, label } = parsed;

        if (!type || !nodeTypes[type]) {
          toast.error("Invalid node type.");
          return;
        }

        // Convert screen → Flow coordinate
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode = createNewNode(type, label, position, nodeTypes);
        if (!newNode) return;

        setNodes((nds) => [...nds, newNode]);

        toast.success(`✓ Added ${label}`, {
          autoClose: 1500,
          icon: "➕",
        });
      } catch (error) {
        console.error("Error in onDrop:", error);
        toast.error("Failed to place node. Try again.");
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
