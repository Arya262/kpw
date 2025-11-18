import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const SummaryNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    title: data?.title || "Summary",
    messageText: data?.messageText || "",
    showVariables: data?.showVariables || [],
    customMessage: data?.customMessage || "",
    includeTimestamp: data?.includeTimestamp || false,
    includeUserInfo: data?.includeUserInfo || false,
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        title: data.title || "Summary",
        messageText: data.messageText || "",
        showVariables: data.showVariables || [],
        customMessage: data.customMessage || "",
        includeTimestamp: data.includeTimestamp || false,
        includeUserInfo: data.includeUserInfo || false,
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    if (initialized && data?.updateNodeData) {
      data.updateNodeData(id, formData);
    }
  }, [formData, id, initialized]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPreviewData = () => {
    return {
      title: formData.title,
      messageText: formData.messageText,
      showVariables: formData.showVariables,
      customMessage: formData.customMessage,
      includeTimestamp: formData.includeTimestamp,
      includeUserInfo: formData.includeUserInfo,
    };
  };

  const predefinedVariables = [
    { key: 'user_name', label: 'User Name', example: 'John Doe' },
    { key: 'email', label: 'Email', example: 'john@example.com' },
    { key: 'phone', label: 'Phone', example: '+1234567890' },
    { key: 'company', label: 'Company', example: 'Acme Corp' },
    { key: 'message', label: 'Message', example: 'Hello world' },
    { key: 'date', label: 'Date', example: '2024-01-15' },
  ];

  const toggleVariable = (variableKey) => {
    setFormData(prev => ({
      ...prev,
      showVariables: prev.showVariables.includes(variableKey)
        ? prev.showVariables.filter(v => v !== variableKey)
        : [...prev.showVariables, variableKey]
    }));
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Summary"
        icon="📋"
        subtitle="Display collected information"
        onPreview={() => onPreviewRequest?.(id, 'summary')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Summary Content */}
        <FormSection title="Summary Content" icon="📝" defaultOpen={true}>
          <FormInput
            label="Summary Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Order Summary, Contact Details"
            required
            helpText="Title shown at the top of the summary"
          />

          <FormTextarea
            label="Summary Message"
            value={formData.messageText}
            onChange={(e) => handleInputChange('messageText', e.target.value)}
            placeholder="Here's a summary of the information you provided..."
            rows={3}
            helpText="Introduction text for the summary"
          />
        </FormSection>

        {/* Variables Section */}
        <FormSection 
          title="Variables to Include" 
          icon="🔤" 
          badge={formData.showVariables.length > 0 ? formData.showVariables.length : null}
          defaultOpen={true}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {predefinedVariables.map(variable => (
              <div 
                key={variable.key} 
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  id={`var-${variable.key}`}
                  checked={formData.showVariables.includes(variable.key)}
                  onChange={() => toggleVariable(variable.key)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor={`var-${variable.key}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                  <span className="font-medium">{variable.label}</span>
                  <span className="text-gray-400 ml-2 text-xs">{`{{user.${variable.key}}}`}</span>
                </label>
              </div>
            ))}
          </div>

          {formData.showVariables.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-xs font-medium text-blue-700 mb-2">Selected Variables:</p>
              <div className="flex flex-wrap gap-2">
                {formData.showVariables.map(variableKey => {
                  const variable = predefinedVariables.find(v => v.key === variableKey);
                  return (
                    <span 
                      key={variableKey} 
                      className="inline-flex items-center px-2 py-1 bg-white border border-blue-300 rounded text-xs text-blue-700"
                    >
                      {variable?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </FormSection>

        {/* Additional Options */}
        <FormSection title="Additional Options" icon="⚙️" defaultOpen={false}>
          <FormTextarea
            label="Custom Message"
            value={formData.customMessage}
            onChange={(e) => handleInputChange('customMessage', e.target.value)}
            placeholder="Add any custom message or instructions..."
            rows={2}
            helpText="Optional additional text to include in the summary"
          />

          <div className="space-y-3 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeTimestamp"
                checked={formData.includeTimestamp}
                onChange={(e) => handleInputChange('includeTimestamp', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="includeTimestamp" className="text-sm text-gray-700 cursor-pointer">
                Include timestamp <span className="text-gray-400 text-xs">{`{{system.datetime}}`}</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeUserInfo"
                checked={formData.includeUserInfo}
                onChange={(e) => handleInputChange('includeUserInfo', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="includeUserInfo" className="text-sm text-gray-700 cursor-pointer">
                Include user info summary
              </label>
            </div>
          </div>
        </FormSection>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        style={targetHandleStyle}
        className="hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        style={sourceHandleStyle}
        className="hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default SummaryNode;
