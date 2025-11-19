import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { transformNodesToBackendFormat, transformEdgesToBackendFormat } from './flowTransformers';

// Flow API functions
export const flowAPI = {
  // Save new flow
  async save(nodes, edges, metadata) {
    try {
      const flowData = {
        name: metadata.name,
        description: metadata.description || '',
        flowNodes: transformNodesToBackendFormat(nodes, edges),
        flowEdges: transformEdgesToBackendFormat(edges),
        triggerConfig: extractTriggerConfig(nodes),
        lastUpdated: new Date().toISOString(), 
        isPro: metadata.isPro || false, 
      };

      // 🔍 LOG TRANSFORMED BACKEND DATA
      console.log('=== BACKEND FORMAT (AFTER TRANSFORMATION) ===');
      console.log(JSON.stringify(flowData, null, 2));
      console.log('=== END BACKEND FORMAT ===\n');

      const response = await axios.post(API_ENDPOINTS.FLOWS.CREATE, flowData, {
        withCredentials: true,
      });

      return response.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to save flow');
    }
  },

  // Get all flows
  async getAll(customerId) {
    try {
      const response = await axios.get(API_ENDPOINTS.FLOWS.GET_ALL(customerId), {
        withCredentials: true,
      });

      return response.data.flows || [];
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch flows');
    }
  },

  // Update existing flow
  async update(flowId, nodes, edges, metadata) {
    try {
      const flowData = {
        name: metadata.name,
        description: metadata.description || '',
        flowNodes: transformNodesToBackendFormat(nodes, edges),
        flowEdges: transformEdgesToBackendFormat(edges),
        triggerConfig: extractTriggerConfig(nodes),
        lastUpdated: new Date().toISOString(), 
        isPro: metadata.isPro || false, 
      };

      const response = await axios.put(API_ENDPOINTS.FLOWS.UPDATE(flowId), flowData, {
        withCredentials: true,
      });

      return response.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to update flow');
    }
  },

  // Delete flow
  async delete(flowId) {
    try {
      await axios.delete(API_ENDPOINTS.FLOWS.DELETE(flowId), {
        withCredentials: true,
      });

      return true;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to delete flow');
    }
  },

  // Toggle flow status
  async toggleStatus(flowId, isActive) {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.FLOWS.TOGGLE_STATUS(flowId),
        { isActive },
        { withCredentials: true }
      );

      return response.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to toggle flow status');
    }
  },

  // Execute flow (for testing)
  async execute(flowId, testData = {}) {
    try {
      const response = await axios.post(
        API_ENDPOINTS.FLOWS.EXECUTE(flowId),
        {
          ...testData,
          executionType: 'manual',
          timestamp: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      return response.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to execute flow');
    }
  },

  // Get execution logs
  async getExecutionLog(flowId) {
    try {
      const response = await axios.get(API_ENDPOINTS.FLOWS.GET_EXECUTION_LOG(flowId), {
        withCredentials: true,
      });

      return response.data.executions || [];
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch execution log');
    }
  },
};

// Helper: Extract trigger config from start node
function extractTriggerConfig(nodes) {
  const startNode = nodes.find(node => node.id === 'start');
  return startNode ? {
    keywords: startNode.data.keywords || [],
    regex: startNode.data.regex || '',
    caseSensitive: startNode.data.caseSensitive || false,
  } : {};
}

export default flowAPI;
