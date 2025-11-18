import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormTextarea from "../forms/FormTextarea";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const CatalogNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    body: data?.body || "",
    footer: data?.footer || ""
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        body: data.body || "",
        footer: data.footer || ""
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (data?.updateNodeData) {
      data.updateNodeData(id, formData);
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPreviewData = () => {
    return {
      body: formData.body,
      footer: formData.footer
    };
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Product Catalog"
        icon="📦"
        subtitle="Share your product catalog"
        onPreview={() => onPreviewRequest?.(id, 'catalog')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        <FormTextarea
          label="Body Text"
          value={formData.body}
          onChange={(e) => handleInputChange('body', e.target.value)}
          placeholder="Browse our complete product catalog..."
          maxLength={CHAR_LIMITS.BODY}
          rows={3}
          required
          helpText="Main message text accompanying the catalog"
          showCounter={true}
        />

        <FormTextarea
          label="Footer Text"
          value={formData.footer}
          onChange={(e) => handleInputChange('footer', e.target.value)}
          placeholder="e.g., Free shipping on orders over $50"
          maxLength={CHAR_LIMITS.FOOTER}
          rows={2}
          helpText="Small text at the bottom of the message"
          showCounter={true}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>📱 Note:</strong> The catalog will display all products from your WhatsApp Business catalog
          </p>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
        className="hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-handle"
        isConnectable={isConnectable}
        style={sourceHandleStyle}
        className="hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default CatalogNode;
