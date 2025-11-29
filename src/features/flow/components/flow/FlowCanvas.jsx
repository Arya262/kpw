import { memo, useMemo, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import CustomEdge from "./CustomEdge";
import {
  FLOW_CONSTANTS,
  DEFAULT_EDGE_OPTIONS,
  CONNECTION_LINE_STYLE,
  MINIMAP_NODE_COLORS,
} from "../../config/flowConfig";

const FlowCanvas = memo(({
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
  shouldFitView = true,
}) => {

  
  const edgeTypes = useMemo(
    () => ({
      default: CustomEdge,
      smoothstep: CustomEdge,
      step: CustomEdge,
      straight: CustomEdge,
    }),
    []
  );


  const memoNodeTypes = useMemo(() => nodeTypes, [nodeTypes]);

 
  const getMiniMapNodeColor = useCallback((node) => {
    if (node.selected) return "#0ea5e9";
    return (
      MINIMAP_NODE_COLORS[node.type] ||
      MINIMAP_NODE_COLORS[node.data?.subtype] ||
      MINIMAP_NODE_COLORS.default
    );
  }, []);

 
  const getMiniMapStrokeColor = useCallback((node) => {
    return node.selected ? "#0ea5e9" : "#e5e7eb";
  }, []);


  const fitViewOptions = useMemo(() => ({
    padding: FLOW_CONSTANTS.FIT_VIEW_PADDING,
    includeHiddenNodes: false,
    maxZoom: 1,
    minZoom: 0.5,
    duration: FLOW_CONSTANTS.FIT_VIEW_DURATION,
  }), []);


  const defaultViewport = useMemo(() => ({
    x: 200,
    y: 100,
    zoom: FLOW_CONSTANTS.DEFAULT_ZOOM,
  }), []);

  
  const proOptions = useMemo(() => ({
    hideAttribution: true,
  }), []);


  const canvasStyle = useMemo(() => ({
    pointerEvents: isImporting ? "none" : "auto",
    background: "#f8f9fa",
  }), [isImporting]);


  const snapGrid = useMemo(() => FLOW_CONSTANTS.SNAP_GRID, []);

  // Delete key codes - memoized array
  const deleteKeyCode = useMemo(() => ["Backspace", "Delete"], []);

  const translateExtent = useMemo(() => [
    [-1000, -1000],  
    [3000, 3000]     
  ], []);

  const nodeExtent = useMemo(() => [
    [-500, -500],   
    [2500, 2500]     
  ], []);

  return (
    <ReactFlow
      // Core data
      nodes={nodes}
      edges={edges}
      
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      onEdgeContextMenu={onEdgeContextMenu}
      onDrop={onDrop}
      onDragOver={onDragOver}
      
      // Types - memoized
      nodeTypes={memoNodeTypes}
      edgeTypes={edgeTypes}
      
      // View settings
      fitView={!isImporting && shouldFitView}
      fitViewOptions={fitViewOptions}
      defaultViewport={defaultViewport}
      
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      connectionLineStyle={CONNECTION_LINE_STYLE}
      connectionLineType="smoothstep"
      
      minZoom={FLOW_CONSTANTS.MIN_ZOOM}
      maxZoom={FLOW_CONSTANTS.MAX_ZOOM}
      zoomOnScroll={true}
      zoomOnPinch={true}
      zoomOnDoubleClick={false}
      panOnScroll={false}
      panOnDrag={true}
      preventScrolling={true}
 
      translateExtent={translateExtent}
      nodeExtent={nodeExtent}
      
      // Selection
      selectionOnDrag={false}
      multiSelectionKeyCode="Shift"
      deleteKeyCode={deleteKeyCode}
      
      // Node behavior
      nodesDraggable={!isImporting}
      nodesConnectable={!isImporting}
      nodesFocusable={true}
      edgesFocusable={true}
      elementsSelectable={!isImporting}
      
      autoPanOnNodeDrag={true}
      autoPanOnConnect={true}
      
      // Performance optimizations
      onlyRenderVisibleElements={true}
      elevateNodesOnSelect={true}
      elevateEdgesOnSelect={false}
      
      // Snapping - memoized
      snapToGrid={false}
      snapGrid={snapGrid}
      
      // Connection
      connectOnClick={true}
      
      // Misc
      proOptions={proOptions}
      style={canvasStyle}
    >
      {/* Grid background */}
      <Background
        color="#e5e7eb"
        gap={FLOW_CONSTANTS.BACKGROUND_GAP}
        size={1}
        variant="lines"
      />

      {/* Controls - top right */}
      <Controls
        showZoom={true}
        showFitView={true}
        showInteractive={true}
        position="top-right"
        fitViewOptions={fitViewOptions}
      />

      {/* MiniMap - bottom right */}
      <MiniMap
        nodeStrokeColor={getMiniMapStrokeColor}
        nodeColor={getMiniMapNodeColor}
        nodeBorderRadius={2}
        nodeStrokeWidth={1}
        position="bottom-right"
        maskColor="rgba(240, 240, 240, 0.6)"
        pannable={true}
        zoomable={true}
        ariaLabel="Flow minimap"
      />
    </ReactFlow>
  );
});

FlowCanvas.displayName = 'FlowCanvas';

export default FlowCanvas;
