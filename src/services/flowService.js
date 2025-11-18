import { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';

class FlowService {
  /**
   * Transform nodes and edges data for backend storage
   */
  static transformFlowData(nodes, edges, flowMetadata) {
    // Extract trigger configuration from start node
    const startNode = nodes.find(node => node.id === 'start');
    const triggerConfig = startNode ? {
      keywords: startNode.data.keywords || [],
      regex: startNode.data.regex || '',
      caseSensitive: startNode.data.caseSensitive || false
    } : {};

    // Transform nodes to backend format
    const flowNodes = nodes.map(node => {
      // Start node
      if (node.type === 'flowStartNode' || node.id === 'start') {
        return {
          id: node.id,
          flowNodeType: 'flowStartNode',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          data: {
            label: node.data.label || ''
          }
        };
      }

      // Text Button Node
      if (node.type === 'text-button') {
        const buttons = node.data.interactiveButtonsItems || node.data.buttons || [];
        return {
          interactiveButtonsHeader: node.data.interactiveButtonsHeader || { type: 'Text', text: '', media: null },
          interactiveButtonsBody: node.data.text || node.data.interactiveButtonsBody || '',
          interactiveButtonsFooter: node.data.interactiveButtonsFooter || '',
          interactiveButtonsItems: buttons.map(btn => ({
            id: btn.id,
            buttonText: btn.text || btn.buttonText,
            nodeResultId: btn.targetNodeId || btn.nodeResultId
          })),
          interactiveButtonsUserInputVariable: node.data.interactiveButtonsUserInputVariable || '',
          interactiveButtonsDefaultNodeResultId: node.data.interactiveButtonsDefaultNodeResultId || '',
          id: node.id,
          type: 'text-button',
          flowNodeType: 'InteractiveButtons',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          flowNodesContent: [],
          isStartNode: false
        };
      }

      // Media Button Node
      if (node.type === 'media-button') {
        const buttons = node.data.interactiveButtonsItems || node.data.buttons || [];
        return {
          flowReplies: [{
            flowReplyType: node.data.mediaType === 'video' ? 'Video' : node.data.mediaType === 'document' ? 'Document' : 'Image',
            data: node.data.mediaUrl || '',
            caption: node.data.caption || '',
            mimeType: node.data.mediaType || 'image',
            interactiveButtonsItems: buttons.map(btn => ({
              buttonId: btn.id,
              buttonText: btn.text || btn.buttonText,
              nodeResultId: btn.targetNodeId || btn.nodeResultId
            }))
          }],
          id: node.id,
          flowNodeType: 'media-button',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          isStartNode: false
        };
      }

      // List Node
      if (node.type === 'list') {
        return {
          flowReplies: [{
            flowReplyType: 'List',
            data: '',
            caption: '',
            mimeType: '',
            listHeader: node.data.listHeader || '',
            listBody: node.data.listBody || '',
            listFooter: node.data.listFooter || '',
            listSections: node.data.listSections || [],
            interactiveButtonsItems: []
          }],
          id: node.id,
          flowNodeType: 'list',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          isStartNode: false
        };
      }

      // Question Node
      if (node.type === 'ask-question') {
        return {
          flowReplies: [{
            flowReplyType: 'Text',
            data: node.data.questionText || '',
            caption: '',
            mimeType: 'text'
          }],
          id: node.id,
          flowNodeType: 'ask-question',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          customField: node.data.customField || '',
          validationType: node.data.validationType || 'None',
          isMediaAccepted: node.data.isMediaAccepted || false,
          expectedAnswers: node.data.expectedAnswers || [],
          isStartNode: false
        };
      }

      // Address Node
      if (node.type === 'ask-address') {
        return {
          flowReplies: [{
            flowReplyType: 'Text',
            data: node.data.questionText || '',
            caption: '',
            mimeType: 'text'
          }],
          id: node.id,
          flowNodeType: 'ask-address',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          customField: node.data.customField || '',
          isStartNode: false
        };
      }

      // Location Node
      if (node.type === 'ask-location') {
        return {
          flowReplies: [{
            flowReplyType: 'Text',
            data: node.data.questionText || '',
            caption: '',
            mimeType: 'text'
          }],
          id: node.id,
          flowNodeType: 'ask-location',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          longitudeField: node.data.longitudeField || '',
          latitudeField: node.data.latitudeField || '',
          isStartNode: false
        };
      }

      // Single Product Node
      if (node.type === 'single-product') {
        return {
          flowReplies: [{
            flowReplyType: 'Product',
            data: '',
            caption: node.data.body || '',
            mimeType: 'product',
            product: node.data.product || {}
          }],
          id: node.id,
          flowNodeType: 'single-product',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          footer: node.data.footer || '',
          isStartNode: false
        };
      }

      // Multi Product Node
      if (node.type === 'multi-product') {
        return {
          flowReplies: [{
            flowReplyType: 'MultiProduct',
            data: '',
            caption: node.data.body || '',
            mimeType: 'multi-product',
            header: node.data.header || '',
            products: node.data.products || []
          }],
          id: node.id,
          flowNodeType: 'multi-product',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          footer: node.data.footer || '',
          isStartNode: false
        };
      }

      // Catalog Node
      if (node.type === 'catalog') {
        return {
          flowReplies: [{
            flowReplyType: 'Catalog',
            data: node.data.body || '',
            caption: '',
            mimeType: 'catalog'
          }],
          id: node.id,
          flowNodeType: 'catalog',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          footer: node.data.footer || '',
          isStartNode: false
        };
      }

      // Summary Node
      if (node.type === 'summary') {
        return {
          flowReplies: [{
            flowReplyType: 'Text',
            data: node.data.messageText || '',
            caption: '',
            mimeType: 'text'
          }],
          id: node.id,
          flowNodeType: 'summary',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          title: node.data.title || 'Summary',
          includeTimestamp: node.data.includeTimestamp || false,
          isStartNode: false
        };
      }

      // Set Variable Node
      if (node.type === 'set-variable') {
        return {
          flowReplies: [{
            flowReplyType: 'Text',
            data: '',
            caption: '',
            mimeType: 'text'
          }],
          id: node.id,
          flowNodeType: 'set-variable',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          variableName: node.data.variableName || '',
          value: node.data.value || '',
          isStartNode: false
        };
      }

      // Set Custom Field Node
      if (node.type === 'set-custom-field') {
        return {
          flowReplies: [{
            flowReplyType: 'Text',
            data: '',
            caption: '',
            mimeType: 'text'
          }],
          id: node.id,
          flowNodeType: 'set-custom-field',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          customField: node.data.customField || '',
          value: node.data.value || '',
          isStartNode: false
        };
      }

      // Template Node
      if (node.type === 'template') {
        return {
          flowReplies: [{
            flowReplyType: 'Template',
            data: '',
            caption: '',
            mimeType: 'template',
            templateId: node.data.templateId || '',
            templateName: node.data.templateName || ''
          }],
          id: node.id,
          flowNodeType: 'template',
          flowNodePosition: {
            posX: node.position.x.toString(),
            posY: node.position.y.toString()
          },
          selectedTemplate: node.data.selectedTemplate || null,
          isStartNode: false
        };
      }

      // Default fallback for unknown node types
      console.warn(`Unknown node type: ${node.type}`, node);
      return {
        flowReplies: [{
          flowReplyType: 'Text',
          data: node.data.text || node.data.questionText || '',
          caption: '',
          mimeType: 'text'
        }],
        id: node.id,
        flowNodeType: node.type,
        flowNodePosition: {
          posX: node.position.x.toString(),
          posY: node.position.y.toString()
        },
        isStartNode: false
      };
    });

    // Transform edges to backend format
    const flowEdges = edges.map(edge => ({
      id: edge.id,
      sourceNodeId: edge.sourceHandle ? `${edge.source}${edge.sourceHandle}` : edge.source,
      targetNodeId: edge.targetHandle ? `${edge.target}${edge.targetHandle}` : edge.target
    }));

    return {
      name: flowMetadata.name,
      description: flowMetadata.description || '',
      flowNodes,
      flowEdges,
      triggerConfig,
      lastUpdated: new Date().toLocaleString(),
      isPro: false
    };
  }

  /**
   * Save flow to backend
   */
  static async saveFlow(nodes, edges, flowMetadata) {
    try {
      const flowData = this.transformFlowData(nodes, edges, flowMetadata);
      
      const response = await fetch(API_ENDPOINTS.FLOWS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flowData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success('Flow saved successfully!');
      return result;
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow: ' + error.message);
      return null;
    }
  }

  /**
   * Get all flows for a customer
   */
  static async getFlows(customerId) {
    try {
      const response = await fetch(API_ENDPOINTS.FLOWS.GET_ALL(customerId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.flows || [];
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Failed to fetch flows: ' + error.message);
      return [];
    }
  }

  /**
   * Update flow
   */
  static async updateFlow(flowId, nodes, edges, flowMetadata) {
    try {
      const flowData = this.transformFlowData(nodes, edges, {
        ...flowMetadata,
        updatedAt: new Date().toISOString()
      });
      
      const response = await fetch(API_ENDPOINTS.FLOWS.UPDATE(flowId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(flowData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success('Flow updated successfully!');
      return result;
    } catch (error) {
      console.error('Error updating flow:', error);
      toast.error('Failed to update flow: ' + error.message);
      return null;
    }
  }

  /**
   * Delete flow
   */
  static async deleteFlow(flowId) {
    try {
      const response = await fetch(API_ENDPOINTS.FLOWS.DELETE(flowId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Flow deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast.error('Failed to delete flow: ' + error.message);
      return false;
    }
  }

  /**
   * Toggle flow active/inactive status
   */
  static async toggleFlowStatus(flowId, isActive) {
    try {
      const response = await fetch(API_ENDPOINTS.FLOWS.TOGGLE_STATUS(flowId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(`Flow ${isActive ? 'activated' : 'deactivated'} successfully!`);
      return result;
    } catch (error) {
      console.error('Error toggling flow status:', error);
      toast.error('Failed to toggle flow status: ' + error.message);
      return null;
    }
  }

  /**
   * Execute a flow manually (for testing)
   */
  static async executeFlow(flowId, testData = {}) {
    try {
      const response = await fetch(API_ENDPOINTS.FLOWS.EXECUTE(flowId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...testData,
          executionType: 'manual',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success('Flow executed successfully!');
      return result;
    } catch (error) {
      console.error('Error executing flow:', error);
      toast.error('Failed to execute flow: ' + error.message);
      return null;
    }
  }

  /**
   * Check if message matches flow trigger
   */
  static checkMessageTrigger(message, triggerConfig) {
    if (!message || !triggerConfig) return false;

    const normalizedMsg = triggerConfig.caseSensitive 
      ? message 
      : message.toLowerCase();

    // Check keywords (exact match)
    const keywordMatch = triggerConfig.keywords.length > 0
      ? triggerConfig.keywords.every(keyword => 
          normalizedMsg.includes(triggerConfig.caseSensitive ? keyword : keyword.toLowerCase())
        )
      : true; // If no keywords, consider it a match

    // Check substrings (partial match)
    const substringMatch = triggerConfig.substrings.length > 0
      ? triggerConfig.substrings.every(substring => 
          normalizedMsg.includes(triggerConfig.caseSensitive ? substring : substring.toLowerCase())
        )
      : true; // If no substrings, consider it a match

    // Check regex if provided
    const regexMatch = triggerConfig.regex
      ? new RegExp(triggerConfig.regex, triggerConfig.caseSensitive ? 'g' : 'gi').test(message)
      : true; // If no regex, consider it a match

    // Must match all conditions
    return keywordMatch && substringMatch && regexMatch;
  }

  /**
   * Get execution logs for a flow
   */
  static async getExecutionLog(flowId) {
    try {
      const response = await fetch(API_ENDPOINTS.FLOWS.GET_EXECUTION_LOG(flowId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.executions || [];
    } catch (error) {
      console.error('Error fetching execution log:', error);
      toast.error('Failed to fetch execution log: ' + error.message);
      return [];
    }
  }
}

export default FlowService;
