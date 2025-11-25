import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { transformNodesToBackendFormat, transformEdgesToBackendFormat } from './flowTransformers';

export const flowAPI = {
  async save(nodes, edges, metadata, viewport) {
    try {
      const transformedNodes = transformNodesToBackendFormat(nodes, edges);
      
      // Extract trigger config from start node
      const startNode = transformedNodes.find(n => n.id === 'start');
      const triggerConfig = startNode?.triggerConfig || {
        keywords: [],
        regex: '',
        caseSensitive: false
      };
      
      // Remove triggerConfig from start node (it's stored at flow level)
      const cleanedNodes = transformedNodes.map(n => {
        if (n.id === 'start') {
          const { triggerConfig, ...rest } = n;
          return rest;
        }
        return n;
      });
      
      const flow_json = {
        id: null,
        name: metadata.name,
        flowNodes: cleanedNodes,
        flowEdges: transformEdgesToBackendFormat(edges, nodes),
        triggerConfig: triggerConfig,
        transform: viewport ? {
          posX: viewport.x.toString(),
          posY: viewport.y.toString(),
          zoom: viewport.zoom.toString()
        } : {
          posX: "0",
          posY: "0",
          zoom: "1"
        }
      };

      const flowData = {
        customer_id: metadata.customer_id,
        flow_name: metadata.name,
        flow_json: flow_json
      };

      console.log('🚀 SAVING FLOW TO BACKEND:');
      console.log('📦 Full Payload:', JSON.stringify(flowData, null, 2));
      console.log('📝 Flow Name:', flowData.flow_name);
      console.log('🔢 Customer ID:', flowData.customer_id);
      console.log('📊 Nodes Count:', flow_json.flowNodes.length);
      console.log('🔗 Edges Count:', flow_json.flowEdges.length);
      console.log('📐 Transform:', flow_json.transform);
      console.log('🌳 Flow Nodes:', flow_json.flowNodes);
      console.log('🔗 Flow Edges:', flow_json.flowEdges);

      const response = await axios.post(API_ENDPOINTS.FLOWS.CREATE, flowData, {
        withCredentials: true,
      });

      console.log('✅ SAVE RESPONSE:', response.data);

      return response.data;
    } catch (err) {
      console.error('❌ SAVE ERROR:', err?.response?.data || err.message);
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

  async update(flowId, nodes, edges, metadata, viewport) {
    try {
      const transformedNodes = transformNodesToBackendFormat(nodes, edges);
      
      // Extract trigger config from start node
      const startNode = transformedNodes.find(n => n.id === 'start');
      const triggerConfig = startNode?.triggerConfig || {
        keywords: [],
        regex: '',
        caseSensitive: false
      };
      
      // Remove triggerConfig from start node (it's stored at flow level)
      const cleanedNodes = transformedNodes.map(n => {
        if (n.id === 'start') {
          const { triggerConfig, ...rest } = n;
          return rest;
        }
        return n;
      });
      
      const flow_json = {
        id: flowId,
        name: metadata.name,
        flowNodes: cleanedNodes,
        flowEdges: transformEdgesToBackendFormat(edges, nodes),
        triggerConfig: triggerConfig,
        transform: viewport ? {
          posX: viewport.x.toString(),
          posY: viewport.y.toString(),
          zoom: viewport.zoom.toString()
        } : {
          posX: "0",
          posY: "0",
          zoom: "1"
        }
      };

      const flowData = {
        customer_id: metadata.customer_id,
        flow_name: metadata.name,
        flow_json: flow_json
      };

      console.log('🔄 UPDATING FLOW TO BACKEND:');
      console.log('🆔 Flow ID:', flowId);
      console.log('📦 Full Payload:', JSON.stringify(flowData, null, 2));
      console.log('📝 Flow Name:', flowData.flow_name);
      console.log('🔢 Customer ID:', flowData.customer_id);
      console.log('📊 Nodes Count:', flow_json.flowNodes.length);
      console.log('🔗 Edges Count:', flow_json.flowEdges.length);
      console.log('📐 Transform:', flow_json.transform);
      console.log('🌳 Flow Nodes:', flow_json.flowNodes);
      console.log('🔗 Flow Edges:', flow_json.flowEdges);

      const response = await axios.put(API_ENDPOINTS.FLOWS.UPDATE(flowId), flowData, {
        withCredentials: true,
      });

      console.log('✅ UPDATE RESPONSE:', response.data);

      return response.data;
    } catch (err) {
      console.error('❌ UPDATE ERROR:', err?.response?.data || err.message);
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
