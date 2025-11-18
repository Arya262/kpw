import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const SetVariableNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    variableName: data?.variableName || "",
    variableValue: data?.variableValue || "",
    variableType: data?.variableType || "text",
    messageText: data?.messageText || "",
    isUserInput: data?.isUserInput || false,
    validationType: data?.validationType || "None",
    placeholder: data?.placeholder || "Enter your response...",
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        variableName: data.variableName || "",
        variableValue: data.variableValue || "",
        variableType: data.variableType || "text",
        messageText: data.messageText || "",
        isUserInput: data.isUserInput || false,
        validationType: data.validationType || "None",
        placeholder: data.placeholder || "Enter your response...",
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
      variableName: formData.variableName,
      variableValue: formData.variableValue,
      variableType: formData.variableType,
      messageText: formData.messageText,
      isUserInput: formData.isUserInput,
      validationType: formData.validationType,
      placeholder: formData.placeholder,
    };
  };

  const variableTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes/No" },
  ];

  const validationTypes = [
    { value: "None", label: "No Validation" },
    { value: "Text", label: "Text" },
    { value: "Number", label: "Number" },
    { value: "Email", label: "Email" },
    { value: "Phone", label: "Phone" },
    { value: "Required", label: "Required" },
  ];

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Set Variable"
        icon="💾"
        subtitle="Store or collect variable data"
        onPreview={() => onPreviewRequest?.(id, 'set-variable')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Variable Configuration */}
        <FormSection title="Variable Configuration" icon="🔤" defaultOpen={true}>
          <FormInput
            label="Variable Name"
            value={formData.variableName}
            onChange={(e) => handleInputChange('variableName', e.target.value)}
            placeholder="e.g., user_name, email, phone"
            required
            helpText={`Use in messages: {{user.${formData.variableName || 'variable_name'}}}`}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Variable Type</label>
            <select
              value={formData.variableType}
              onChange={(e) => handleInputChange('variableType', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
            >
              {variableTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Data type for this variable</p>
          </div>
        </FormSection>

        {/* Message & Input Mode */}
        <FormSection title="Message & Input Mode" icon="💬" defaultOpen={true}>
          <FormTextarea
            label="Message Text"
            value={formData.messageText}
            onChange={(e) => handleInputChange('messageText', e.target.value)}
            placeholder="Enter the message to show to user..."
            rows={3}
            helpText="Message displayed when setting this variable"
          />

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="isUserInput"
                checked={formData.isUserInput}
                onChange={(e) => handleInputChange('isUserInput', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="isUserInput" className="text-sm font-medium text-gray-700 cursor-pointer block">
                  Collect from user input
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  User will type their response
                </p>
              </div>
            </div>
          </div>
        </FormSection>

        {/* User Input Settings */}
        {formData.isUserInput ? (
          <FormSection title="Input Settings" icon="⌨️" defaultOpen={true}>
            <FormInput
              label="Placeholder Text"
              value={formData.placeholder}
              onChange={(e) => handleInputChange('placeholder', e.target.value)}
              placeholder="Enter your response..."
              helpText="Hint text shown to the user"
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Validation Type</label>
              <select
                value={formData.validationType}
                onChange={(e) => handleInputChange('validationType', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
              >
                {validationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Validate user input format</p>
            </div>
          </FormSection>
        ) : (
          <FormSection title="Static Value" icon="📌" defaultOpen={true}>
            <FormInput
              label="Variable Value"
              value={formData.variableValue}
              onChange={(e) => handleInputChange('variableValue', e.target.value)}
              placeholder="Enter the value to set..."
              required
              helpText="The value that will be stored in this variable"
            />
          </FormSection>
        )}

        {/* Variable Usage Preview */}
        {formData.variableName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-700 mb-1">Variable Usage:</p>
            <code className="text-sm text-blue-600 font-mono">
              {`{{user.${formData.variableName}}}`}
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Use this syntax in any message to display the variable value
            </p>
          </div>
        )}
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

export default SetVariableNode;
