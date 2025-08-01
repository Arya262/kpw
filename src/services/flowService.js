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
      substrings: startNode.data.substrings || [],
      regex: startNode.data.regex || '',
      caseSensitive: startNode.data.caseSensitive || false
    } : {};

    // Process nodes to extract message configurations
    const processedNodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        // Common node data
        label: node.data.label,
        
        // Message-specific configurations
        ...(node.type === 'text-button' && {
          messageType: 'text-button',
          text: node.data.text || '',
          buttons: node.data.buttons || []
        }),
        
        ...(node.type === 'media-button' && {
          messageType: 'media-button',
          mediaUrl: node.data.mediaUrl || '',
          mediaType: node.data.mediaType || 'image',
          caption: node.data.caption || '',
          buttons: node.data.buttons || []
        }),
        
        ...(node.type === 'list' && {
          messageType: 'list',
          headerText: node.data.headerText || '',
          bodyText: node.data.bodyText || '',
          footerText: node.data.footerText || '',
          buttonText: node.data.buttonText || '',
          sections: node.data.sections || []
        }),
        
        ...(node.type === 'template' && {
          messageType: 'template',
          templateName: node.data.templateName || '',
          templateParams: node.data.templateParams || []
        }),
        
        ...(node.type === 'single-product' && {
          messageType: 'single-product',
          product: node.data.product || {}
        }),
        
        ...(node.type === 'multi-product' && {
          messageType: 'multi-product',
          products: node.data.products || [],
          headerText: node.data.headerText || '',
          bodyText: node.data.bodyText || ''
        }),
        
        ...(node.type === 'catalog' && {
          messageType: 'catalog',
          catalogId: node.data.catalogId || '',
          bodyText: node.data.bodyText || '',
          footerText: node.data.footerText || ''
        })
      }
    }));

    // Process edges to define flow sequence
    const flowSequence = this.buildFlowSequence(processedNodes, edges);

    return {
      name: flowMetadata.name,
      description: flowMetadata.description || '',
      customerId: flowMetadata.customerId,
      triggerConfig,
      nodes: processedNodes,
      edges,
      flowSequence,
      isActive: flowMetadata.isActive || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Build execution sequence from nodes and edges
   */
  static buildFlowSequence(nodes, edges) {
    const sequence = [];
    const visited = new Set();
    
    // Find start node
    const startNode = nodes.find(node => node.id === 'start');
    if (!startNode) return sequence;

    // Build sequence using DFS
    const buildSequence = (nodeId, step = 1) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node || node.type === 'flowStartNode') {
        // Find connected nodes from start
        const connectedEdges = edges.filter(edge => edge.source === nodeId);
        connectedEdges.forEach(edge => {
          buildSequence(edge.target, step);
        });
        return;
      }

      sequence.push({
        step,
        nodeId: node.id,
        nodeType: node.type,
        messageConfig: node.data,
        delay: node.data.delay || 0 // Optional delay between messages
      });

      // Find next nodes
      const nextEdges = edges.filter(edge => edge.source === nodeId);
      nextEdges.forEach((edge, index) => {
        buildSequence(edge.target, step + index + 1);
      });
    };

    buildSequence('start');
    return sequence.sort((a, b) => a.step - b.step);
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
