import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const LocationNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    questionText: data?.questionText || "",
    longitudeField: data?.longitudeField || "",
    latitudeField: data?.latitudeField || ""
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        questionText: data.questionText || "",
        longitudeField: data.longitudeField || "",
        latitudeField: data.latitudeField || ""
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

  const getPreviewData = () => formData;

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Location Request"
        icon="📍"
        subtitle="Request user's location"
        onPreview={() => onPreviewRequest?.(id, 'ask-location')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Question Message */}
        <FormTextarea
          label="Request Message"
          value={formData.questionText}
          onChange={(e) => handleInputChange('questionText', e.target.value)}
          placeholder="Please share your location so we can assist you better"
          rows={2}
          required
          helpText="Message asking the user to share their location"
        />

        {/* Location Storage Fields */}
        <FormSection title="Location Storage" icon="💾" defaultOpen={true}>
          <FormInput
            label="Longitude Field"
            value={formData.longitudeField}
            onChange={(e) => handleInputChange('longitudeField', e.target.value)}
            placeholder="e.g., user_longitude"
            required
            helpText="Custom field name to store longitude coordinate"
          />

          <FormInput
            label="Latitude Field"
            value={formData.latitudeField}
            onChange={(e) => handleInputChange('latitudeField', e.target.value)}
            placeholder="e.g., user_latitude"
            required
            helpText="Custom field name to store latitude coordinate"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>💡 Tip:</strong> Location data will be saved as decimal coordinates (e.g., 40.7128, -74.0060)
            </p>
          </div>
        </FormSection>
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

export default LocationNode;
