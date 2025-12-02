import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import debounce from "lodash.debounce";

import { useAuth } from "../../context/AuthContext";
import FlowSidebar from "./FlowSidebar";
import Header from "./Header";
import FlowTable from "./FlowTable";
import WhatsAppPreviewPanel from "../../components/WhatsAppPreviewPanel";
import FlowCanvas from "./components/flow/FlowCanvas";
import FlowNameModal from "./components/ui/FlowNameModal";

import { useFlowOperations } from "./hooks/useFlowOperations";
import { useEdgeHandlers } from "./hooks/useEdgeHandlers";
import { useNodeHandlers } from "./hooks/useNodeHandlers";
import { useDropHandler } from "./hooks/useDropHandler";
import { useStartNode } from "./hooks/useStartNode";
import { useNodeTypes } from "./hooks/useNodeTypes.jsx";
import { useFlowImport } from "./hooks/useFlowImport";

import { FLOW_CONSTANTS } from "./config/flowConfig";
import "./FlowEditor.css";

const FlowEditor = () => {
  const reactFlowWrapperRef = useRef(null);
  const { screenToFlowPosition, setCenter, getViewport, setViewport } = useReactFlow();
  const { user } = useAuth();

  const [mode, setMode] = useState("table");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingFlowId, setEditingFlowId] = useState(null);
  const [previewNodeId, setPreviewNodeId] = useState(null);
  const [previewNodeType, setPreviewNodeType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFlowNameModal, setShowFlowNameModal] = useState(false);
  const [shouldFitView, setShouldFitView] = useState(true);
  const [flowType, setFlowType] = useState("inbound"); // "inbound" or "outbound"

  const previewData = useMemo(() => {
    if (!previewNodeId) return null;
    const node = nodes.find(n => n.id === previewNodeId);
    if (!node) return null;

    const nodeData = { ...node.data };

    if (nodeData.interactiveButtonsItems || nodeData.buttons) {
      const buttons = nodeData.interactiveButtonsItems || nodeData.buttons || [];
      
      // Map button IDs to their target nodes from edges
      const enrichedButtons = buttons.map(btn => {
        const buttonHandle = `btn-${btn.id}`;
        const connectedEdge = edges.find(e => 
          e.source === previewNodeId && e.sourceHandle === buttonHandle
        );
        
        return {
          ...btn,
          nodeResultId: connectedEdge?.target || btn.nodeResultId || '',
        };
      });

      nodeData.interactiveButtonsItems = enrichedButtons;
      if (nodeData.buttons) {
        nodeData.buttons = enrichedButtons;
      }
    }

    return nodeData;
  }, [previewNodeId, nodes, edges]);

  const {
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
  } = useFlowOperations(user, setNodes, setEdges, setMode);

  const debouncedUpdateRef = useRef(null);

  useEffect(() => {
    debouncedUpdateRef.current = debounce((nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    }, FLOW_CONSTANTS.DEBOUNCE_DELAY);

    return () => {
      debouncedUpdateRef.current?.cancel?.();
      debouncedUpdateRef.current = null;
    };
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId, newData) => {
    if (!debouncedUpdateRef.current) return;
    debouncedUpdateRef.current(nodeId, newData);
  }, []);

  const handlePreviewRequest = useCallback((nodeId, nodeType) => {
    setPreviewNodeId(nodeId);
    setPreviewNodeType(nodeType);
    setShowPreview(true);
  }, []);

  const closePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewNodeId(null);
    setPreviewNodeType(null);
  }, []);

  // ---------- Custom hooks ----------
  const { createStartNode } = useStartNode(setNodes, edges);
  const {
    handleNodeDelete,
    handleNodeDuplicate,
    createNewNode,
    handleAddNodeClick,
  } = useNodeHandlers(setNodes, setEdges, updateNodeData);

  const { onConnect, onEdgeClick, onEdgeContextMenu } = useEdgeHandlers(
    nodes,
    edges,
    setEdges
  );

  const rawNodeTypes = useNodeTypes(
    handlePreviewRequest,
    handleNodeDelete,
    handleNodeDuplicate
  );

  // Memoize nodeTypes to avoid passing a fresh object to ReactFlow every render
  const nodeTypes = useMemo(() => rawNodeTypes, [rawNodeTypes]);

  const { handleImportFlow, isImporting } = useFlowImport(
    setNodes,
    setEdges,
    setFlowTitle,
    flowTitle,
    createStartNode,
    nodeTypes,
    updateNodeData,
    setCenter
  );


  // ---------- Flow management ----------
  const handleAddFlow = useCallback(() => {
    setShowFlowNameModal(true);
  }, []);

  const handleFlowNameConfirm = useCallback((flowName, selectedFlowType) => {
    setShowFlowNameModal(false);
    setShouldFitView(true);
    setMode("edit");
    setEditingFlowId(null);
    setFlowType(selectedFlowType);
    
    // Only add start node for inbound flows
    if (selectedFlowType === "inbound") {
      setNodes([createStartNode()]);
    } else {
      // Outbound flows start with empty canvas (no start node)
      setNodes([]);
    }
    
    setEdges([]);
    setFlowTitle(flowName);
    setFlowEnabled(true);
  }, [createStartNode, setNodes, setEdges, setFlowTitle, setFlowEnabled]);

  const handleLoadFlowAndEdit = useCallback(
    async (flow) => {
      console.log('🔵 LOADING FLOW:', flow.id);
      
      setMode("edit");
      setEditingFlowId(flow.id);
      setFlowType(flow.flowType || "inbound"); // Load flow type
      
      const savedTransform = await handleLoadFlow(flow);
      const hasTransform = !!savedTransform;
      setShouldFitView(!hasTransform);
      
      if (hasTransform) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              console.log('🔵 RESTORING viewport from API:', savedTransform);
              setViewport(savedTransform, { duration: 0 });
              
              setTimeout(() => {
                const currentViewport = getViewport();
                console.log('🔵 Current viewport after restore:', currentViewport);
              }, 100);
            }, 200);
          });
        });
      }
    },
    [handleLoadFlow, setViewport, getViewport]
  );

  const handleSaveFlow = useCallback(
    async (title, enabled) => {
      const currentViewport = getViewport();
      console.log('🟢 SAVING viewport to API:', currentViewport);
      
      if (editingFlowId) {
        const success = await handleUpdateFlow(
          editingFlowId,
          title,
          enabled,
          nodes,
          edges,
          currentViewport,
          flowType
        );
        if (success) {
          setMode("table");
          setNodes([]);
          setEdges([]);
          setFlowTitle("Untitled");
          setFlowEnabled(true);
          setEditingFlowId(null);
          setFlowType("inbound");
        }
      } else {
        handleSaveFlowFromHeader(title, enabled, nodes, edges, currentViewport, flowType);
      }
    },
    [
      handleSaveFlowFromHeader,
      handleUpdateFlow,
      editingFlowId,
      nodes,
      edges,
      setNodes,
      setEdges,
      setFlowTitle,
      setFlowEnabled,
      getViewport,
      flowType,
    ]
  );

  // ---------- Drag & drop ----------
  const { onDrop, onDragOver } = useDropHandler(
    reactFlowWrapperRef,
    screenToFlowPosition,
    createNewNode,
    setNodes,
    nodeTypes
  );

  const handleAddNodeClickWrapper = useCallback(
    (type, label) => {
      handleAddNodeClick(
        type,
        label,
        screenToFlowPosition,
        reactFlowWrapperRef,
        nodeTypes,
        setNodes
      );
    },
    [handleAddNodeClick, screenToFlowPosition, nodeTypes, setNodes]
  );


  return (
    <div className="flow-editor-container">
      
      <FlowNameModal
        isOpen={showFlowNameModal}
        onClose={() => setShowFlowNameModal(false)}
        onConfirm={handleFlowNameConfirm}
        initialName=""
      />
      
      {mode === "edit" && <FlowSidebar onAddNode={handleAddNodeClickWrapper} />}

      <div className="flow-editor-main" ref={reactFlowWrapperRef}>
        {mode === "table" && (
          <FlowTable
            savedFlows={savedFlows}
            onLoadFlow={handleLoadFlowAndEdit}
            onDeleteFlow={handleDeleteFlow}
            onAddFlow={handleAddFlow}
            loadingFlow={loadingFlow}
            initialLoading={initialLoading}
          />
        )}

        {mode === "edit" && (
          <div className="flex h-full min-h-0" key={`edit-${editingFlowId || 'new'}`}>
            <div className="flex flex-col flex-1 min-h-0 min-w-0">
              <Header
                key={`header-${editingFlowId || 'new'}`}
                title={flowTitle}
                onTitleChange={setFlowTitle}
                onSave={handleSaveFlow}
                isEnabled={flowEnabled}
                onEnabledChange={setFlowEnabled}
                isSaving={loadingFlow}
                onImport={handleImportFlow}
                isEditingFlow={!!editingFlowId}
                flowType={flowType}
                onBack={() => {
                  setMode("table");
                  setNodes([]);
                  setEdges([]);
                  setFlowTitle("Untitled");
                  setFlowEnabled(true);
                  setEditingFlowId(null);
                  setFlowType("inbound");
                }}
              />

              <div className="flow-editor-canvas flex-1 min-h-0">
                <FlowCanvas
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onEdgeClick={onEdgeClick}
                  onEdgeContextMenu={onEdgeContextMenu}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  isImporting={isImporting}
                  shouldFitView={shouldFitView}
                />
              </div>
            </div>

            {showPreview && (
              <div className="w-96 h-full border-l border-gray-200 bg-white">
                <WhatsAppPreviewPanel
                  nodeData={previewData}
                  nodeType={previewNodeType}
                  isVisible={showPreview}
                  onClose={closePreview}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function FlowEditorWrapper() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
