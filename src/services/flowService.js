import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import {
  transformNodesToBackendFormat,
  transformEdgesToBackendFormat,
} from './flowTransformers';

export const flowAPI = {
  async save(nodes, edges, metadata, viewport) {
    try {
      // 1️⃣ Transform nodes/edges normally
      const transformedNodes = transformNodesToBackendFormat(nodes, edges);
      const transformedEdges = transformEdgesToBackendFormat(edges);

      // 2️⃣ Extract trigger config from real start node (not moved)
      const startNode = transformedNodes.find(n => n.id === 'start');

      const triggerConfig =
        startNode?.config?.triggerConfig ??
        startNode?.triggerConfig ?? {
          keywords: [],
          regex: '',
          caseSensitive: false,
        };

      // 3️⃣ Build backend flow_json exactly as you want
      const flow_json = {
        id: null,
        name: metadata.name,
        flowNodes: transformedNodes,
        flowEdges: transformedEdges,
        transform: viewport
          ? {
              posX: viewport.x.toString(),
              posY: viewport.y.toString(),
              zoom: viewport.zoom.toString(),
            }
          : { posX: '0', posY: '0', zoom: '1' },
      };

      // 4️⃣ Build backend triggers structure
      const triggers = [];

      if (triggerConfig.keywords?.length) {
        triggerConfig.keywords.forEach(keyword =>
          triggers.push({
            keyword,
            match_type: triggerConfig.caseSensitive ? 'exact' : 'contains',
          }),
        );
      }

      if (triggerConfig.regex) {
        triggers.push({
          keyword: triggerConfig.regex,
          match_type: 'regex',
        });
      }

      // 5️⃣ Final payload
      const flowData = {
        customer_id: metadata.customer_id,
        flow_name: metadata.name,
        flow_json,
        status: metadata.enabled ? 'ACTIVE' : 'INACTIVE',
        triggers,
        triggerConfig,
      };

      console.log('🚀 SAVING FLOW', JSON.stringify(flowData, null, 2));

      const response = await axios.post(API_ENDPOINTS.FLOWS.CREATE, flowData, {
        withCredentials: true,
      });

      return response.data;
    } catch (err) {
      console.error('❌ SAVE ERROR:', err?.response?.data || err.message);
      throw new Error(err?.response?.data?.message || 'Failed to save flow');
    }
  },

  async getAll(customerId) {
    try {
      const response = await axios.get(
        API_ENDPOINTS.FLOWS.GET_ALL(customerId),
        { withCredentials: true },
      );

      return response.data.data || response.data.flows || [];
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch flows');
    }
  },

  async update(flowId, nodes, edges, metadata, viewport) {
    try {
      const transformedNodes = transformNodesToBackendFormat(nodes, edges);
      const transformedEdges = transformEdgesToBackendFormat(edges);

      const startNode = transformedNodes.find(n => n.id === 'start');

      const triggerConfig =
        startNode?.config?.triggerConfig ??
        startNode?.triggerConfig ?? {
          keywords: [],
          regex: '',
          caseSensitive: false,
        };

      const flow_json = {
        id: flowId,
        name: metadata.name,
        flowNodes: transformedNodes,
        flowEdges: transformedEdges,
        transform: viewport
          ? {
              posX: viewport.x.toString(),
              posY: viewport.y.toString(),
              zoom: viewport.zoom.toString(),
            }
          : { posX: '0', posY: '0', zoom: '1' },
      };

      const triggers = [];

      if (triggerConfig.keywords?.length) {
        triggerConfig.keywords.forEach(k =>
          triggers.push({
            keyword: k,
            match_type: triggerConfig.caseSensitive ? 'exact' : 'contains',
          }),
        );
      }

      if (triggerConfig.regex) {
        triggers.push({
          keyword: triggerConfig.regex,
          match_type: 'regex',
        });
      }

      const flowData = {
        customer_id: metadata.customer_id,
        flow_name: metadata.name,
        flow_json,
        status: metadata.enabled ? 'ACTIVE' : 'INACTIVE',
        triggers,
        triggerConfig,
      };

      console.log('🔄 UPDATING FLOW', JSON.stringify(flowData, null, 2));

      const response = await axios.put(
        API_ENDPOINTS.FLOWS.UPDATE(flowId),
        flowData,
        { withCredentials: true },
      );

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

export default flowAPI;
