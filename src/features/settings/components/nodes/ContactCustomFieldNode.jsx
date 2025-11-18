import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const ContactCustomFieldNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    customField: data?.customField || "",
    value: data?.value || ""
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        customField: data.customField || "",
        value: data.value || ""
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
      customField: formData.customField,
      value: formData.value
    };
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Set Custom Field"
        icon="🏷️"
        subtitle="Store data in contact field"
        onPreview={() => onPreviewRequest?.(id, 'set-custom-field')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        <FormInput
          label="Custom Field Name"
          value={formData.customField}
          onChange={(e) => handleInputChange('customField', e.target.value)}
          placeholder="e.g., user_status, subscription_tier"
          required
          helpText="The contact field where the value will be stored"
        />

        <FormTextarea
          label="Value"
          value={formData.value}
          onChange={(e) => handleInputChange('value', e.target.value)}
          placeholder="Enter the value to store (can use variables like {{contact.name}})"
          rows={3}
          required
          helpText="The value to save in the custom field. Supports variables and dynamic content."
        />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>💡 Tip:</strong> Use variables like {`{{contact.name}}`} or {`{{custom.field_name}}`} for dynamic values
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

export default ContactCustomFieldNode;
