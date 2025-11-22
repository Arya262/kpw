import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { flowAPI } from "../../../services/flowService";

export const useFlowOperations = (user, setNodes, setEdges, setMode) => {
  const [savedFlows, setSavedFlows] = useState(() => {
    const data = localStorage.getItem("savedFlows");
    return data ? JSON.parse(data) : [];
  });
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [flowTitle, setFlowTitle] = useState("Untitled");
  const [flowEnabled, setFlowEnabled] = useState(true);

  // Fetch flows when component mounts
  useEffect(() => {
    const fetchFlows = async () => {
      if (!user?.customer_id) {
        return;
      }
      
      try {
        setLoadingFlow(true);
        const flows = await flowAPI.getAll(user.customer_id);

        if (Array.isArray(flows)) {
          // Transform flows to match frontend expected structure
          const transformedFlows = flows.map(flow => {
            return {
              id: flow.id,
              name: flow.flow_name,
              description: flow.description || '',
              isActive: flow.status === 'ACTIVE',
              created_at: flow.created_at,
              updated_at: flow.updated_at,
              // Keep original flow_data for loading
              flow_data: flow.flow_data || flow.flow_json,
              // Also keep nodes/edges if they exist for backward compatibility
              nodes: flow.nodes,
              edges: flow.edges
            };
          });

          setSavedFlows(transformedFlows);
          localStorage.setItem("savedFlows", JSON.stringify(transformedFlows));
        } else {
          setSavedFlows([]);
        }
      } catch (error) {
        console.error('Error fetching flows:', error);
        setSavedFlows([]);
      } finally {
        setLoadingFlow(false);
      }
    };

    fetchFlows();
  }, [user?.customer_id]);

  // Clean nodes before saving - remove React Flow auto-added fields
  const cleanNodesForSave = (nodes) => {
    return nodes.map(node => {
      const { width, height, selected, dragging, ...cleanNode } = node;
      
      // Clean node data - remove empty/duplicate fields
      const cleanData = { ...cleanNode.data };
      
      // Remove empty buttons array if interactiveButtonsItems exists
      if (cleanData.interactiveButtonsItems && cleanData.interactiveButtonsItems.length > 0) {
        delete cleanData.buttons;
      }
      
      // Remove empty delay field
      if (cleanData.delay === "") {
        delete cleanData.delay;
      }
      
      // Remove updateNodeData function
      delete cleanData.updateNodeData;
      
      return {
        ...cleanNode,
        data: cleanData
      };
    });
  };

  // Clean edges before saving - ensure sourceHandle is at root level
  const cleanEdgesForSave = (edges) => {
    return edges.map(edge => {
      const { selected, ...cleanEdge } = edge;
      
      // Extract sourceHandle and targetHandle from nested data if exists
      const sourceHandle = edge.sourceHandle || edge.data?.sourceHandle;
      const targetHandle = edge.targetHandle || edge.data?.targetHandle;
      
      // Build clean edge object
      const result = {
        id: cleanEdge.id,
        source: cleanEdge.source,
        target: cleanEdge.target,
        type: edge.type || edge.data?.type || 'default',
        animated: cleanEdge.animated !== false
      };
      
      // Add handles only if they exist
      if (sourceHandle) {
        result.sourceHandle = sourceHandle;
      }
      if (targetHandle) {
        result.targetHandle = targetHandle;
      }
      
      return result;
    });
  };

  // Save current flow using header data
  const handleSaveFlowFromHeader = useCallback(async (title, enabled, nodes, edges) => {
    if (!title.trim()) {
      toast.error("Please enter a flow name");
      return;
    }

    // Clean nodes and edges before saving
    const cleanedNodes = cleanNodesForSave(nodes);
    const cleanedEdges = cleanEdgesForSave(edges);

    // 🔍 LOG ALL NODE JSON DATA
    console.log('=== SAVING FLOW - ALL NODE DATA ===');
    console.log('Flow Title:', title);
    console.log('Flow Enabled:', enabled);
    console.log('Total Nodes:', cleanedNodes.length);
    console.log('Total Edges:', cleanedEdges.length);
    console.log('\n--- CLEANED NODES JSON ---');
    console.log(JSON.stringify(cleanedNodes, null, 2));
    console.log('\n--- CLEANED EDGES JSON ---');
    console.log(JSON.stringify(cleanedEdges, null, 2));
    console.log('\n--- COMPLETE FLOW DATA ---');
    console.log(JSON.stringify({ 
      title, 
      enabled, 
      flowNodes: cleanedNodes, 
      flowEdges: cleanedEdges,
      timestamp: new Date().toISOString()
    }, null, 2));
    console.log('=== END FLOW DATA ===\n');

    setLoadingFlow(true);

    try {
      const flowMetadata = {
        customer_id: user?.customer_id,
        name: title.trim(),
        description: "",
        triggers: ['hi', 'hello'],
        priority: 1,
        type: 'inbound',
        isPro: false
      };

      const result = await flowAPI.save(cleanedNodes, cleanedEdges, flowMetadata);

      console.log('💾 Save result from API:', result);

      if (result) {
        // Transform the saved flow to match the expected format
        // Store the flow_json structure that contains nodes and edges
        const flowJsonData = {
          name: title.trim(),
          description: "",
          flowNodes: cleanedNodes,
          flowEdges: cleanedEdges,
          triggerConfig: extractTriggerConfig(cleanedNodes),
          lastUpdated: new Date().toISOString(),
          isPro: false
        };

        const savedFlow = {
          id: result.id || result.flow_id || Date.now(),
          name: result.flow_name || result.name || title.trim(),
          description: result.description || "",
          isActive: result.status === 'ACTIVE' || result.isActive || false,
          created_at: result.created_at || new Date().toISOString(),
          updated_at: result.updated_at || new Date().toISOString(),
          flow_data: result.flow_data || result.flow_json || flowJsonData,
          nodes: cleanedNodes,
          edges: cleanedEdges
        };

        console.log('💾 Saved flow object:', savedFlow);

        // ✅ Update State + LocalStorage together (prevents mismatch)
        setSavedFlows(prev => {
          const updated = [savedFlow, ...prev];
          localStorage.setItem("savedFlows", JSON.stringify(updated));
          return updated;
        });

        // Reset UI
        setMode("table");
        setNodes([]);
        setEdges([]);
        setFlowTitle("Untitled");
        setFlowEnabled(true);

        toast.success(`Flow "${title}" saved successfully!`);
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error("Failed to save flow");
    } finally {
      setLoadingFlow(false);
    }
  }, [user?.customer_id, setNodes, setEdges, setMode]);

  // Load a flow from the table
  const handleLoadFlow = useCallback((flow) => {
    setLoadingFlow(true);

    try {
      // Parse the flow_data or flow_json if it exists
      let flowData = {};
      const flowDataSource = flow.flow_data || flow.flow_json;
      
      if (flowDataSource) {
        try {
          flowData = typeof flowDataSource === 'string' 
            ? JSON.parse(flowDataSource) 
            : flowDataSource;
        } catch (error) {
          console.error('Error parsing flow data:', error);
          flowData = {};
        }
      }

      // Extract nodes and edges from the parsed data or directly from flow object
      const rawNodes = flowData.flowNodes || flowData.nodes || flow.nodes || [];
      const rawEdges = flowData.flowEdges || flowData.edges || flow.edges || [];
      
      if (rawNodes.length === 0) {
        toast.error('No flow data found to load');
        setLoadingFlow(false);
        return;
      }

      // Transform nodes to React Flow format
      const transformedNodes = rawNodes.map(node => {
        // Handle different position formats
        let position = { x: 0, y: 0 };
        
        if (node.position) {
          // Already in React Flow format
          position = {
            x: typeof node.position.x === 'string' ? parseFloat(node.position.x) : node.position.x,
            y: typeof node.position.y === 'string' ? parseFloat(node.position.y) : node.position.y
          };
        } else if (node.flowNodePosition) {
          // Database format: flowNodePosition: { posX: "0", posY: "0" }
          position = {
            x: parseFloat(node.flowNodePosition.posX || 0),
            y: parseFloat(node.flowNodePosition.posY || 0)
          };
        } else {
          // Generate random position if none exists
          position = {
            x: Math.random() * 400,
            y: Math.random() * 400
          };
        }

        // Ensure position values are valid numbers
        if (isNaN(position.x) || isNaN(position.y)) {
          position = { x: Math.random() * 400, y: Math.random() * 400 };
        }

        // Determine the correct node type first
        let nodeType = node.type || 'default';
        
        // Handle special cases for node type mapping
        // Only the actual start node should be flowStartNode, not nodes with isStartNode: true
        if (node.id === 'start' || node.type === 'flowStartNode') {
          nodeType = 'flowStartNode';
        } else if (node.flowNodeType) {
          // First check for special flowReplyType cases
          if (node.flowReplies && node.flowReplies.length > 0) {
            const firstReply = node.flowReplies[0];
            if (firstReply.flowReplyType === 'List') {
              nodeType = 'list';
            } else if (firstReply.flowReplyType === 'Image' || firstReply.flowReplyType === 'Video' || firstReply.flowReplyType === 'Document') {
              nodeType = 'media-button';
            } else if (firstReply.flowReplyType === 'Text' && node.expectedAnswers && node.expectedAnswers.length > 0) {
              nodeType = 'text-button';
            } else {
              nodeType = 'text-button';
            }
          } else {
            // Map database flowNodeType to React Flow node type
            const typeMapping = {
              'Message': 'text-button',
              'Question': 'ask-question',
              'InteractiveButtons': 'text-button',
              'MediaButton': 'media-button',
              'List': 'list',
              'SingleProduct': 'single-product',
              'MultiProduct': 'multi-product',
              'Catalog': 'catalog',
              'Template': 'template',
              'Address': 'ask-address',
              'Location': 'ask-location',
              'CustomField': 'set-custom-field'
            };
            nodeType = typeMapping[node.flowNodeType] || node.type || 'default';
          }
        }

        // Transform node data to match what the components expect
        let transformedData = { ...node.data };
        
        // Handle different node types and their expected data structure
        if (nodeType === 'flowStartNode') {
          // Handle start node data transformation
          // Get trigger config from flow level if not in node data
          const flowTriggerConfig = flowData?.triggerConfig || {};
          transformedData = {
            ...transformedData,
            keywords: node.data?.keywords || flowTriggerConfig.keywords || [],
            substrings: node.data?.substrings || [],
            caseSensitive: node.data?.caseSensitive || flowTriggerConfig.caseSensitive || false,
            regex: node.data?.regex || flowTriggerConfig.regex || "",
            onAddKeyword: (word) => {
              const keyword = String(word || "").trim();
              if (!keyword) return;
              setNodes((prevNodes) =>
                prevNodes.map((n) =>
                  n.id === node.id
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          keywords: [...(n.data.keywords || []), keyword],
                        },
                      }
                    : n
                )
              );
              // Also update the flow-level trigger config
              if (flowData?.triggerConfig) {
                flowData.triggerConfig.keywords = [...(flowData.triggerConfig.keywords || []), keyword];
              }
            },
            onRemoveKeyword: (index) => {
              setNodes((prevNodes) =>
                prevNodes.map((n) =>
                  n.id === node.id
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          keywords: (n.data.keywords || []).filter(
                            (_, i) => i !== index
                          ),
                        },
                      }
                    : n
                )
              );
              // Also update the flow-level trigger config
              if (flowData?.triggerConfig) {
                flowData.triggerConfig.keywords = (flowData.triggerConfig.keywords || []).filter(
                  (_, i) => i !== index
                );
              }
            },
            onAddSubstring: (word) => {
              const substring = String(word || "").trim();
              if (!substring) return;
              setNodes((prevNodes) =>
                prevNodes.map((n) =>
                  n.id === node.id
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          substrings: [...(n.data.substrings || []), substring],
                        },
                      }
                    : n
                )
              );
            },
            onRemoveSubstring: (index) => {
              setNodes((prevNodes) =>
                prevNodes.map((n) =>
                  n.id === node.id
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          substrings: (n.data.substrings || []).filter(
                            (_, i) => i !== index
                          ),
                        },
                      }
                    : n
                )
              );
            },
            onChangeRegex: (value) => {
              setNodes((prevNodes) =>
                prevNodes.map((n) =>
                  n.id === node.id
                    ? { ...n, data: { ...n.data, regex: value } }
                    : n
                )
              );
              // Also update the flow-level trigger config
              if (flowData?.triggerConfig) {
                flowData.triggerConfig.regex = value;
              }
            },
            onToggleCaseSensitive: () => {
              setNodes((prevNodes) =>
                prevNodes.map((n) =>
                  n.id === node.id
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          caseSensitive: !n.data.caseSensitive,
                        },
                      }
                    : n
                )
              );
              // Also update the flow-level trigger config
              if (flowData?.triggerConfig) {
                flowData.triggerConfig.caseSensitive = !flowData.triggerConfig.caseSensitive;
              }
            },
            onChooseTemplate: () => alert("Choose Template Clicked"),
            onFlowTriggered: (triggerData) => {
              console.log("Flow triggered:", triggerData);
            }
          };
        } else if (nodeType === 'text-button' || nodeType === 'media-button') {
          // Handle new flowReplies structure
          let text = '';
          let mediaUrl = '';
          let mediaType = '';
          let caption = '';
          let buttons = [];

          if (node.flowReplies && node.flowReplies.length > 0) {
            const firstReply = node.flowReplies[0];
            if (firstReply.flowReplyType === 'Text') {
              text = firstReply.data || '';
            } else if (firstReply.flowReplyType === 'Image' || firstReply.flowReplyType === 'Video' || firstReply.flowReplyType === 'Document') {
              mediaUrl = firstReply.data || '';
              mediaType = firstReply.mimeType || (firstReply.flowReplyType === 'Image' ? 'image' : firstReply.flowReplyType === 'Video' ? 'video' : 'document');
              caption = firstReply.caption || '';
            }
          }

          // Handle expectedAnswers as buttons
          if (node.expectedAnswers && node.expectedAnswers.length > 0) {
            buttons = node.expectedAnswers.map(btn => {
              console.log('🔘 Loading expectedAnswer button:', btn);
              return {
                id: btn.id || `btn-${Date.now()}`,
                text: btn.expectedInput || btn.text || btn.title || '',
                nodeResultId: btn.nodeResultId || ''
              };
            });
          }

          // Map database format to component format
          const rawButtons = node.interactiveButtonsItems || node.data?.interactiveButtonsItems || node.data?.buttons || [];
          console.log('🔘 Loading interactiveButtonsItems:', rawButtons);
          
          transformedData = {
            ...transformedData,
            text: text || node.interactiveButtonsBody || node.data?.interactiveButtonsBody || node.data?.text || '',
            mediaUrl: mediaUrl || node.mediaUrl || node.data?.mediaUrl || '',
            mediaType: mediaType || node.mediaType || node.data?.mediaType || '',
            caption: caption || node.caption || node.data?.caption || '',
            buttons: buttons.length > 0 ? buttons : rawButtons.map(btn => {
              const mappedButton = {
                id: btn.id || `btn-${Date.now()}`,
                text: btn.title || btn.buttonText || btn.text || '',
                nodeResultId: btn.nodeResultId || btn.targetNodeId || ''
              };
              console.log('🔘 Mapped button:', { original: btn, mapped: mappedButton });
              return mappedButton;
            }),
            interactiveButtonsBody: text || node.interactiveButtonsBody || node.data?.interactiveButtonsBody || node.data?.text || '',
            interactiveButtonsItems: buttons.length > 0 ? buttons : (node.interactiveButtonsItems || node.data?.interactiveButtonsItems || node.data?.buttons || []),
            interactiveButtonsHeader: node.interactiveButtonsHeader || node.data?.interactiveButtonsHeader || { type: "Text", text: text, media: null },
            interactiveButtonsFooter: node.interactiveButtonsFooter || node.data?.interactiveButtonsFooter || "",
            interactiveButtonsUserInputVariable: node.interactiveButtonsUserInputVariable || node.data?.interactiveButtonsUserInputVariable || "",
            interactiveButtonsDefaultNodeResultId: node.interactiveButtonsDefaultNodeResultId || node.data?.interactiveButtonsDefaultNodeResultId || ""
          };
        } else if (nodeType === 'ask-question') {
          transformedData = {
            ...transformedData,
            questionText: node.data?.questionText || node.data?.text || '',
            customField: node.data?.customField || node.data?.userInputVariable || '',
            validationType: node.data?.validationType || 'None',
            isMediaAccepted: node.data?.isMediaAccepted || false,
            expectedAnswers: node.data?.expectedAnswers || []
          };
        } else if (nodeType === 'ask-address') {
          transformedData = {
            ...transformedData,
            questionText: node.data?.questionText || node.data?.text || '',
            customField: node.data?.customField || node.data?.userInputVariable || ''
          };
        } else if (nodeType === 'ask-location') {
          transformedData = {
            ...transformedData,
            questionText: node.data?.questionText || node.data?.text || '',
            longitudeField: node.data?.longitudeField || '',
            latitudeField: node.data?.latitudeField || ''
          };
        } else if (nodeType === 'set-custom-field') {
          transformedData = {
            ...transformedData,
            customField: node.data?.customField || '',
            value: node.data?.value || ''
          };
        } else if (nodeType === 'list') {
          transformedData = {
            ...transformedData,
            listHeader: node.data?.listHeader || node.data?.header || '',
            listBody: node.data?.listBody || node.data?.body || '',
            listFooter: node.data?.listFooter || node.data?.footer || '',
            listSections: node.data?.listSections || node.data?.sections || []
          };
        } else if (nodeType === 'single-product') {
          transformedData = {
            ...transformedData,
            body: node.data?.body || '',
            footer: node.data?.footer || '',
            product: node.data?.product || {}
          };
        } else if (nodeType === 'multi-product') {
          transformedData = {
            ...transformedData,
            header: node.data?.header || '',
            body: node.data?.body || '',
            footer: node.data?.footer || '',
            products: node.data?.products || []
          };
        } else if (nodeType === 'catalog') {
          transformedData = {
            ...transformedData,
            body: node.data?.body || '',
            footer: node.data?.footer || ''
          };
        } else if (nodeType === 'template') {
          transformedData = {
            ...transformedData,
            templateId: node.data?.templateId || '',
            templateName: node.data?.templateName || ''
          };
        }

        return {
          id: node.id,
          type: nodeType,
          position,
          data: {
            ...transformedData,
            label: transformedData?.label || nodeType || 'Node',
            updateNodeData: (nodeId, newData) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId
                    ? { ...n, data: { ...n.data, ...newData } }
                    : n
                )
              );
            }
          }
        };
      });

      // Transform edges to React Flow format
      const transformedEdges = rawEdges.map(edge => {
        // Handle different edge formats from database
        let source = edge.source || edge.sourceNodeId;
        let target = edge.target || edge.targetNodeId;
        let sourceHandle = edge.sourceHandle;
        let targetHandle = edge.targetHandle;
        
        // Parse complex source IDs that include button information
        // Format: "node-welcomebtn-btn-cat1" should become source="node-welcome", sourceHandle="btn-btn-cat1"
        if (source && source.includes('btn-')) {
          // Try to match pattern: (node-id)(btn-btn-buttonid)
          const match = source.match(/^(.+?)(btn-btn-.+)$/);
          if (match) {
            source = match[1];
            sourceHandle = match[2];
          } else {
            // Fallback: split by 'btn-' and reconstruct
            const btnIndex = source.indexOf('btn-');
            if (btnIndex > 0) {
              sourceHandle = source.substring(btnIndex);
              source = source.substring(0, btnIndex);
            }
          }
        }
        
        // Parse complex target IDs that include handle information
        // Format: "node-category-electronicsleft-handle" should become target="node-category-electronics", targetHandle="left-handle"
        if (target && target.includes('left-handle')) {
          const nodeId = target.replace('left-handle', '');
          target = nodeId;
          targetHandle = 'left-handle';
        }
        
        // Clean up any remaining suffixes
        if (source && source.includes('__')) {
          const parts = source.split('__');
          source = parts[0];
          if (parts[1] && !sourceHandle) {
            sourceHandle = parts[1];
          }
        }
        if (target && target.includes('__')) {
          const parts = target.split('__');
          target = parts[0];
          if (parts[1] && !targetHandle) {
            targetHandle = parts[1];
          }
        }
        
        // Validate that we have valid source and target
        if (!source || !target) {
          console.warn('Skipping invalid edge:', { source, target, edge });
          return null;
        }

        return {
          id: edge.id || `edge-${Math.random().toString(36).substr(2, 9)}`,
          source,
          target,
          sourceHandle: sourceHandle || undefined,
          targetHandle: targetHandle || undefined,
          type: 'default',
          animated: edge.animated !== false,
          style: edge.style || { stroke: '#0ea5e9', strokeWidth: 2 },
          markerEnd: edge.markerEnd || { type: 'arrowclosed', color: '#0ea5e9' }
        };
      }).filter(edge => edge !== null);

      // Only switch to edit mode if we have valid data
      if (transformedNodes.length > 0) {
        setNodes(transformedNodes);
        setEdges(transformedEdges);
        setFlowTitle(flow.flow_name || flow.name || 'Untitled');
        setFlowEnabled(flow.status === 'ACTIVE' || flow.isActive === true);
        setMode("edit");
        toast.info(`Loaded flow: ${flow.flow_name || flow.name}`);
      } else {
        toast.error('Cannot load flow: No nodes found');
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      toast.error('Failed to load flow data');
    } finally {
      setLoadingFlow(false);
    }
  }, [setNodes, setEdges, setMode]);

  // Update a flow
  const handleUpdateFlow = useCallback(async (flowId, title, enabled, nodes, edges) => {
    if (!title.trim()) {
      toast.error("Please enter a flow name");
      return;
    }

    // Clean nodes and edges before updating
    const cleanedNodes = cleanNodesForSave(nodes);
    const cleanedEdges = cleanEdgesForSave(edges);

    // 🔍 LOG ALL NODE JSON DATA FOR UPDATE
    console.log('=== UPDATING FLOW - ALL NODE DATA ===');
    console.log('Flow ID:', flowId);
    console.log('Flow Title:', title);
    console.log('Flow Enabled:', enabled);
    console.log('Total Nodes:', cleanedNodes.length);
    console.log('Total Edges:', cleanedEdges.length);
    console.log('\n--- CLEANED NODES JSON ---');
    console.log(JSON.stringify(cleanedNodes, null, 2));
    console.log('\n--- CLEANED EDGES JSON ---');
    console.log(JSON.stringify(cleanedEdges, null, 2));
    console.log('\n--- COMPLETE FLOW DATA ---');
    console.log(JSON.stringify({ 
      flowId,
      title, 
      enabled, 
      flowNodes: cleanedNodes, 
      flowEdges: cleanedEdges,
      timestamp: new Date().toISOString()
    }, null, 2));
    console.log('=== END FLOW UPDATE DATA ===\n');

    setLoadingFlow(true);

    try {
      const flowMetadata = {
        name: title.trim(),
        description: "",
        triggers: ['hi', 'hello'],
        priority: 1,
        type: 'inbound',
        isPro: false
      };

      const result = await flowAPI.update(flowId, cleanedNodes, cleanedEdges, flowMetadata);

      if (result) {
        // Update the flow in the saved flows list with cleaned data
        setSavedFlows(prev => {
          const updated = prev.map(f => 
            f.id === flowId 
              ? { 
                  ...f, 
                  name: title.trim(), 
                  isActive: enabled,
                  nodes: cleanedNodes,
                  edges: cleanedEdges,
                  updatedAt: new Date().toISOString()
                }
              : f
          );
          localStorage.setItem("savedFlows", JSON.stringify(updated));
          return updated;
        });

        toast.success(`Flow "${title}" updated successfully!`);
        return true;
      }
    } catch (error) {
      console.error('Error updating flow:', error);
      toast.error("Failed to update flow");
      return false;
    } finally {
      setLoadingFlow(false);
    }
  }, [user?.customer_id]);

  // Delete a flow from the table
  const handleDeleteFlow = useCallback(async (id) => {
    try {
      setLoadingFlow(true);
      await flowAPI.delete(id);

      setSavedFlows(prev => {
        const updated = prev.filter(f => f.id !== id);
        localStorage.setItem("savedFlows", JSON.stringify(updated));
        return updated;
      });

      toast.success("Flow deleted successfully!");
    } catch (error) {
      toast.error(`Failed to delete flow: ${error.message}`);
    } finally {
      setLoadingFlow(false);
    }
  }, []);

  return {
    savedFlows,
    loadingFlow,
    flowTitle,
    flowEnabled,
    setFlowTitle,
    setFlowEnabled,
    handleSaveFlowFromHeader,
    handleLoadFlow,
    handleUpdateFlow,
    handleDeleteFlow
  };
};

// Helper: Extract trigger config from start node
function extractTriggerConfig(nodes) {
  const startNode = nodes.find(node => node.id === 'start');
  return startNode ? {
    keywords: startNode.data?.keywords || [],
    regex: startNode.data?.regex || '',
    caseSensitive: startNode.data?.caseSensitive || false,
  } : {
    keywords: [],
    regex: '',
    caseSensitive: false
  };
}
