import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import CustomEdge from "./CustomEdge";
import {
  FLOW_CONSTANTS,
  DEFAULT_EDGE_OPTIONS,
  CONNECTION_LINE_STYLE,
  MINIMAP_NODE_COLORS,
} from "../../config/flowConfig";

const FlowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeClick,
  onEdgeContextMenu,
  onDrop,
  onDragOver,
  nodeTypes,
  isImporting,
}) => {

  /** Stable Edge Types */
  const edgeTypes = useMemo(
    () => ({
      default: CustomEdge,
      smoothstep: CustomEdge,
      step: CustomEdge,
      straight: CustomEdge,
    }),
    []
  );

  /** Stabilize nodeTypes to avoid unnecessary ReactFlow renders */
  const memoNodeTypes = useMemo(() => nodeTypes, [nodeTypes]);

  /** MiniMap color resolver */
  const getMiniMapNodeColor = (node) => {
    if (node.selected) return "#0ea5e9";
    return (
      MINIMAP_NODE_COLORS[node.type] ||
      MINIMAP_NODE_COLORS[node.data?.subtype] ||
      MINIMAP_NODE_COLORS.default
    );
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      onEdgeContextMenu={onEdgeContextMenu}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={memoNodeTypes}
      edgeTypes={edgeTypes}
      fitView={!isImporting}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      connectionLineStyle={CONNECTION_LINE_STYLE}
      connectionLineType="smoothstep"
      deleteKeyCode={["Backspace", "Delete"]}
      multiSelectionKeyCode="Shift"
      selectionKeyCode="Shift"
      panOnScroll={false}
      zoomOnScroll={true}
      panOnScrollMode="vertical"
      zoomOnDoubleClick={false}
      minZoom={FLOW_CONSTANTS.MIN_ZOOM}
      maxZoom={FLOW_CONSTANTS.MAX_ZOOM}
      style={{ pointerEvents: isImporting ? "none" : "auto" }} // smoother flow import
    >
      <Background
        color="#aaa"
        gap={16}
        size={1}
        variant="dots"
      />

      <Controls
        showZoom={true}
        showFitView={true}
        showInteractive={true}
        position="top-right"
        orientation="horizontal"
        style={{
          top: FLOW_CONSTANTS.CONTROLS_TOP,
          right: "0px",
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          padding: "10px",
        }}
      />

      <MiniMap
        nodeStrokeColor={(node) =>
          node.selected ? "#0ea5e9" : "#888"
        }
        nodeColor={getMiniMapNodeColor}
        nodeBorderRadius={8}
        position="top-right"
        style={{
          marginTop: FLOW_CONSTANTS.MINIMAP_MARGIN_TOP,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      />
    </ReactFlow>
  );
};

export default FlowCanvas;
