import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const AddressNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    questionText: data?.questionText || "",
    customField: data?.customField || ""
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        questionText: data.questionText || "",
        customField: data.customField || ""
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
      questionText: formData.questionText,
      customField: formData.customField
    };
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Address Request"
        icon="🏠"
        subtitle="Request user's address"
        onPreview={() => onPreviewRequest?.(id, 'ask-address')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        <FormTextarea
          label="Request Message"
          value={formData.questionText}
          onChange={(e) => handleInputChange('questionText', e.target.value)}
          placeholder="Please provide your delivery address..."
          rows={3}
          required
          helpText="Message asking the user to share their address"
        />

        <FormSection title="Address Storage" icon="💾" defaultOpen={true}>
          <FormInput
            label="Custom Field Name"
            value={formData.customField}
            onChange={(e) => handleInputChange('customField', e.target.value)}
            placeholder="e.g., delivery_address, billing_address"
            required
            helpText="Field name to store the complete address"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>📍 Address Format:</strong> The address will be stored as a complete text string including street, city, state, and postal code.
            </p>
          </div>
        </FormSection>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>💡 Tip:</strong> Users can type their address or use WhatsApp's location sharing feature
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

export default AddressNode;
