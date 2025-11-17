import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  useReactFlow,
  ReactFlowProvider 
} from "reactflow";
import "reactflow/dist/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FlowService from "../../services/flowService";
import FlowStartNode from "./FlowStartNode";
import TemplateNode from "./TemplateNode";
import CustomEdge from "./CustomEdge";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import FlowSidebar from "./FlowSidebar";
import TextButtonNode from "./customNodeFormessage/TextButtonNode";
import MediaButtonNode from "./customNodeFormessage/MediaButtonNode";
import ListNode from "./customNodeFormessage/ListNode";
import TemplateboxNode from "./customNodeFormessage/TemplateboxNode";
import SingleProductNode from "./customNodeFormessage/SingleProductNode";
import MultiProductNode from "./customNodeFormessage/MultiProductNode";
import CatalogNode from "./customNodeFormessage/CatalogNode";
import QuestionNode from "./customNodeFormessage/QuestionNode";
import AddressNode from "./customNodeFormessage/AddressNode";
import LocationNode from "./customNodeFormessage/LocationNode";
import ContactCustomFieldNode from "./customNodeFormessage/ContactCustomFieldNode";

const normalize = (str) =>
  str
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const FlowEditor = () => {
  const reactFlowWrapperRef = useRef(null);
  const { project } = useReactFlow();
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { user } = useAuth();
  const [savedFlows, setSavedFlows] = useState(() => {
    // Load from localStorage on mount
    const data = localStorage.getItem("savedFlows");
    return data ? JSON.parse(data) : [];
  });
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [mode, setMode] = useState(() => {
    const data = localStorage.getItem("savedFlows");
    const flows = data ? JSON.parse(data) : [];
    return flows.length > 0 ? "table" : "edit";
  });

  const nodeTypes = useMemo(
    () => ({
      flowStartNode: FlowStartNode,
      templateNode: TemplateNode,
      "text-button": TextButtonNode,
      "media-button": MediaButtonNode,
      "list": ListNode,
      "template": TemplateboxNode,
      "single-product": SingleProductNode,
      "multi-product": MultiProductNode,
      "catalog": CatalogNode,
      "ask-question": QuestionNode,
      "ask-address": AddressNode,
      "ask-location": LocationNode,
      "set-custom-field": ContactCustomFieldNode
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const handleDelete = useCallback(
    (id) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
    },
    [setNodes]
  );

  const handleClone = useCallback(
    (template, position) => {
      const newId = `clone-${Date.now()}`;
      const offset = 50;
      const containerMeta = template.container_meta || {};

      const newNode = {
        id: newId,
        type: "templateNode",
        position: {
          x: position.x + offset,
          y: position.y + offset,
        },
        data: {
          label: `${template.element_name} (Clone)`,
          image: template.image_url || "",
          category: template.category,
          meta: containerMeta.data || "",
          sampleText: containerMeta.sampleText || "",
          selected: false,
          status: template.status,
          onDelete: () => handleDelete(newId),
          onClone: () =>
            handleClone(template, {
              x: position.x + offset,
              y: position.y + offset,
            }),
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, handleDelete]
  );

  const createTemplateNode = useCallback(
    (template, position, isActive) => {
      const id = `template-${template.id}`;
      const containerMeta = template.container_meta || {};

      return {
        id,
        type: "templateNode",
        position,
        data: {
          label: template.element_name,
          image: template.image_url || "",
          category: template.category,
          meta: containerMeta.data || "",
          sampleText: containerMeta.sampleText || "",
          selected: isActive,
          status: template.status,
          onDelete: () => handleDelete(id),
          onClone: () => handleClone(template, position),
        },
      };
    },
    [handleDelete, handleClone]
  );


  const createEdgesFromSelectedNodes = (selectedNodes) => {
  if (selectedNodes.length === 0) return [];

  const edges = [
    {
      id: `start-${selectedNodes[0].id}`,
      source: "start",
      target: selectedNodes[0].id,
      type: "custom", // <- important: use CustomEdge.jsx
      animated: true,
      style: { stroke: "#0ea5e9", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#0ea5e9" }, // ✅ perfect
    },
  ];

  for (let i = 1; i < selectedNodes.length; i++) {
    edges.push({
      id: `${selectedNodes[i - 1].id}-${selectedNodes[i].id}`,
      source: selectedNodes[i - 1].id,
      target: selectedNodes[i].id,
      type: "custom",
      animated: true,
      style: { stroke: "#0ea5e9", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#0ea5e9" }, // ✅ perfect
    });
  }

  return edges;
};

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user?.customer_id) return;

      try {
        const templateRes = await fetch(
          `${API_ENDPOINTS.TEMPLATES.GET_ALL}?customer_id=${user.customer_id}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const templateData = await templateRes.json();

        const campaignRes = await fetch(
          `https://api.foodchow.com/api/UserMaster/GetWhatsappNotificationCampaign?shop_id=${user.customer_id}`
        );
        const campaignData = await campaignRes.json();

        const activeNotifications = new Set(
          campaignData?.data
            ?.filter((item) => item.status === 1)
            .map((item) => normalize(item.notification_type))
        );

        if (!Array.isArray(templateData.templates)) {
          console.error("Invalid template response format");
          return;
        }

        // Filter templates that match active notification types
        const matchedTemplates = templateData.templates.filter((template) =>
          activeNotifications.has(normalize(template.element_name))
        );

        // Show toast if no templates matched
        if (matchedTemplates.length === 0) {
          toast.info("No matching templates found for active notifications.");
        }

        const HORIZONTAL_GAP = 400; 
        const VERTICAL_GAP = 320;   
        const START_NODE_WIDTH = 300;

        const startNode = {
          id: "start",
          type: "flowStartNode",
          position: { x: 0, y: 100 },
          data: {
            keywords: [],
            substrings: [],
            caseSensitive: false,
            regex: [],
            onAddKeyword: (word) => {
              // Ensure word is a string and trim whitespace
              const keyword = String(word || '').trim();
              if (!keyword) return;
              
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === "start"
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          keywords: [...node.data.keywords],
                        },
                      }
                    : node
                )
              );
            },
            onRemoveKeyword: (index) =>
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === "start"
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          keywords: node.data.keywords.filter(
                            (_, i) => i !== index
                          ),
                        },
                      }
                    : node
                )
              ),
            onAddSubstring: (word) => {
              const substring = String(word || '').trim();
              if (!substring) return;
              
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === "start"
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          substrings: [...(node.data.substrings || []), substring],
                        },
                      }
                    : node
                )
              );
            },
            onRemoveSubstring: (index) =>
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === "start"
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          substrings: (node.data.substrings || []).filter(
                            (_, i) => i !== index
                          ),
                        },
                      }
                    : node
                )
              ),
            onChangeRegex: (value) =>
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === "start"
                    ? { ...node, data: { ...node.data, regex: value } }
                    : node
                )
              ),
            onToggleCaseSensitive: () =>
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === "start"
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          caseSensitive: !node.data.caseSensitive,
                        },
                      }
                    : node
                )
              ),
            onChooseTemplate: () => alert("Choose Template Clicked"),
            onFlowTriggered: (triggerData) => {
              console.log('Flow triggered:', triggerData);
              toast.success(`Flow triggered by message: "${triggerData.message}"`);
              
              // Execute the flow sequence when triggered
              const connectedEdges = edges.filter(edge => edge.source === 'start');
              if (connectedEdges.length > 0) {
                // Start the flow by triggering connected nodes
                connectedEdges.forEach((edge, index) => {
                  setTimeout(() => {
                    toast.info(`Step ${index + 1}: Executing ${edge.target}`);
                  }, (index + 1) * 1000);
                });
              } else {
                toast.warn('No flow connected to start node');
              }
            },
          },
        };

        const templateNodes = matchedTemplates.map((template, index) => {
          const col = index % COLUMNS;
          const row = Math.floor(index / COLUMNS);
          const position = {
            x: START_NODE_WIDTH + 50 + col * HORIZONTAL_GAP, // 50px gap after start node
            y: 100 + row * VERTICAL_GAP,
          };
          return createTemplateNode(template, position, true);
        });

        const selectedNodes = templateNodes.filter((n) => n.data.selected);
        const newEdges = createEdgesFromSelectedNodes(selectedNodes);

        if (isMounted) {
          setNodes([startNode, ...templateNodes]);
          setEdges(newEdges);
        }
      } catch (err) {
        console.error("Failed to fetch templates or campaigns:", err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.customer_id, createTemplateNode]);

  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;

      if (source === target) return;

      const targetNode = nodes.find((n) => n.id === target);
      if (targetNode?.type === "flowStartNode") return;

      const isDuplicate = edges.some(
        (edge) => edge.source === source && edge.target === target
      );
      if (isDuplicate) return;

      if (source === "start") {
        const alreadyConnected = edges.some((edge) => edge.source === "start");
        if (alreadyConnected) {
          toast.error("Only one template can be connected from Flow Start.");
          return;
        }
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            animated: true,
            style: { stroke: "#0ea5e9", strokeWidth: 2 },
            markerEnd: { type: "arrowclosed", color: "#0ea5e9" },
          },
          eds
        )
      );
    },
    [edges, nodes, setEdges]
  );

  // Save current flow to backend
  const handleSaveFlow = async () => {
    const name = prompt("Enter a name for this flow:");
    if (!name) return;
    
    const description = prompt("Enter a description (optional):") || "";
    
    setLoadingFlow(true);
    
    try {
      const flowMetadata = {
        name,
        description,
        customerId: user.customer_id,
        isActive: false // Default to inactive when first created
      };
      
      const result = await FlowService.saveFlow(nodes, edges, flowMetadata);
      
      if (result) {
        // Update local state with saved flow
        const savedFlow = {
          id: result.id || Date.now(),
          name: result.name,
          description: result.description,
          nodes: result.nodes,
          edges: result.edges,
          isActive: result.isActive,
          date: result.createdAt || new Date().toISOString()
        };
        
        setSavedFlows(prev => [savedFlow, ...prev]);
        setMode("table");
        setNodes([]); // Clear the flow editor after saving
        setEdges([]);
        
        // Also save to localStorage as backup
        const localFlows = JSON.parse(localStorage.getItem("savedFlows") || "[]");
        localStorage.setItem("savedFlows", JSON.stringify([savedFlow, ...localFlows]));
      }
    } catch (error) {
      console.error('Error saving flow:', error);
    } finally {
      setLoadingFlow(false);
    }
  };

  // Load a flow from the table
  const handleLoadFlow = (flow) => {
    setLoadingFlow(true);
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setMode("edit");
    setTimeout(() => setLoadingFlow(false), 500); 
    toast.info(`Loaded flow: ${flow.name}`);
  };

  // Delete a flow from the table
  const handleDeleteFlow = (id) => {
    const updated = savedFlows.filter((f) => f.id !== id);
    setSavedFlows(updated);
    localStorage.setItem("savedFlows", JSON.stringify(updated));
    toast.success("Flow deleted");
  };

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move"; // Shows move cursor while dragging
};

const onDrop = useCallback((event) => {
  try {
    event.preventDefault();

    if (!reactFlowWrapperRef.current) return;

    // Required to get correct canvas offset
    const reactFlowBounds = reactFlowWrapperRef.current.getBoundingClientRect();
    if (!reactFlowBounds) return;

    // Get node data
    const nodeData = event.dataTransfer.getData("application/reactflow");
    if (!nodeData) return;
    
    let parsedData;
    try {
      parsedData = JSON.parse(nodeData);
    } catch (e) {
      console.error('Failed to parse node data:', e);
      return;
    }

    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: `node-${Date.now()}`,
      type: parsedData.type || 'default',
      position,
      data: {
        label: parsedData.label || 'New Node',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  } catch (error) {
    console.error('Error in onDrop:', error);
  }
}, [project, setNodes, reactFlowWrapperRef]);

// ...

return (
  <div style={{ height: "100vh", width: "100%", display: "flex" }}>
    <ToastContainer position="top-right" autoClose={3000} />

    {/* Sidebar (Left Panel) */}
    <FlowSidebar templates={availableTemplates} />

    {/* Flow Canvas (Right Side) */}
    <div className="flex-1 relative" ref={reactFlowWrapperRef}>
      {mode === "table" && (
        <div className="mb-6 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Saved Flows</h2>
            <button
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-medium"
              onClick={() => {
                setMode("edit");
                // Create a new Flow Start node
                const newStartNode = {
                  id: "start",
                  type: "flowStartNode",
                  position: { x: 0, y: 100 },
                  data: {
                    keywords: [],
                    caseSensitive: false,
                    regex: "",
                    onAddKeyword: (word) => {
                      const keyword = String(word || '').trim();
                      if (!keyword) return;
                      
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === "start"
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  keywords: [...node.data.keywords, keyword],
                                },
                              }
                            : node
                        )
                      );
                    },
                    onRemoveKeyword: (index) =>
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === "start"
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  keywords: node.data.keywords.filter(
                                    (_, i) => i !== index
                                  ),
                                },
                              }
                            : node
                        )
                      ),
                    onChangeRegex: (value) =>
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === "start"
                            ? { ...node, data: { ...node.data, regex: value } }
                            : node
                        )
                      ),
                    onToggleCaseSensitive: () =>
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === "start"
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  caseSensitive: !node.data.caseSensitive,
                                },
                              }
                            : node
                        )
                      ),
                    onChooseTemplate: () => alert("Choose Template Clicked"),
                  },
                };
                setNodes([newStartNode]);
                setEdges([]);
              }}
            >
              Add Flow
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full bg-white rounded-2xl shadow overflow-hidden text-sm text-center table-auto">
              <thead className="bg-[#F4F4F4] border-b-2 border-gray-300">
                <tr>
                  <th className="px-2 py-3">Name</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Created Date</th>
                  <th className="px-2 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedFlows.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-gray-500 py-4">
                      No saved flows.
                    </td>
                  </tr>
                ) : (
                  savedFlows.map((flow) => (
                    <tr key={flow.id} className="border-b last:border-b-0">
                      <td className="px-2 py-2 font-medium">{flow.name}</td>
                      <td className="px-2 py-2">
                        {new Date(flow.date).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 flex items-center justify-center gap-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          onClick={() => handleLoadFlow(flow)}
                          disabled={loadingFlow}
                        >
                          Load
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                          onClick={() => handleDeleteFlow(flow.id)}
                          disabled={loadingFlow}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mode === "edit" && (
        <>
          <button
            className="absolute top-4 left-4 z-10 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded font-medium"
            onClick={handleSaveFlow}
            disabled={loadingFlow}
          >
            Save Current Flow
          </button>
          <div className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <MiniMap />
              <Controls />
              <Background color="#f0f0f0" gap={16} />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  </div>
  );
};

// Wrap the component with ReactFlowProvider
export default function FlowEditorWrapper() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
