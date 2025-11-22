import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { transformNodesToBackendFormat, transformEdgesToBackendFormat } from './flowTransformers';

export const flowAPI = {
  async save(nodes, edges, metadata) {
    try {
      const flowData = {
        customer_id: metadata.customer_id,
        flow_name: metadata.name,
        triggers: metadata.triggers || ['hi', 'hello'],
        priority: metadata.priority || 1,
        type: metadata.type || 'inbound',
        flow_json: {
          name: metadata.name,
          description: metadata.description || '',
          flowNodes: transformNodesToBackendFormat(nodes, edges),
          flowEdges: transformEdgesToBackendFormat(edges),
          triggerConfig: extractTriggerConfig(nodes),
          lastUpdated: new Date().toISOString(),
          isPro: metadata.isPro || false,
        }
      };

      const response = await axios.post(API_ENDPOINTS.FLOWS.CREATE, flowData, {
        withCredentials: true,
      });

      return response.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to save flow');
    }
  },

  async getAll(customerId) {
    try {
      const response = await axios.get(API_ENDPOINTS.FLOWS.GET_ALL(customerId), {
        withCredentials: true,
      });

      return response.data.data || response.data.flows || [];
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch flows');
    }
  },

  async update(flowId, nodes, edges, metadata) {
    try {
      const flowData = {
        flow_name: metadata.name,
        triggers: metadata.triggers || ['hi', 'hello'],
        priority: metadata.priority || 1,
        type: metadata.type || 'inbound',
        flow_json: {
          name: metadata.name,
          description: metadata.description || '',
          flowNodes: transformNodesToBackendFormat(nodes, edges),
          flowEdges: transformEdgesToBackendFormat(edges),
          triggerConfig: extractTriggerConfig(nodes),
          lastUpdated: new Date().toISOString(),
          isPro: metadata.isPro || false,
        }
      };

      const response = await axios.put(API_ENDPOINTS.FLOWS.UPDATE(flowId), flowData, {
        withCredentials: true,
      });

      return response.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to update flow');
    }
  },

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
