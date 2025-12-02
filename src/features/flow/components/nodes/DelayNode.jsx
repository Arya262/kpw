import { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Clock } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const DelayNode = memo(({ data, isConnectable, id, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    delayValue: 1,
    delayUnit: "hours",
    delayType: "duration", // "duration" or "until"
    specificTime: "",
    specificDate: "",
  });

  const [initialized, setInitialized] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        delayValue: data.delayValue || 1,
        delayUnit: data.delayUnit || "hours",
        delayType: data.delayType || "duration",
        specificTime: data.specificTime || "",
        specificDate: data.specificDate || "",
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  // Update parent when data changes
  useEffect(() => {
    if (!initialized) return;
    if (data?.updateNodeData) {
      data.updateNodeData(id, formData);
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getDelayDescription = () => {
    if (formData.delayType === "until") {
      if (formData.specificDate && formData.specificTime) {
        return `Until ${formData.specificDate} at ${formData.specificTime}`;
      }
      if (formData.specificTime) {
        return `Until ${formData.specificTime} today`;
      }
      return "Until specific time";
    }

    const unit = formData.delayValue === 1 
      ? formData.delayUnit.slice(0, -1) 
      : formData.delayUnit;
    return `Wait ${formData.delayValue} ${unit}`;
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Delay"
        icon="⏱️"
        subtitle={getDelayDescription()}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Delay Type Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Delay Type
          </label>
          <select
            value={formData.delayType}
            onChange={(e) => handleInputChange("delayType", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
          >
            <option value="duration">Wait for duration</option>
            <option value="until">Wait until specific time</option>
          </select>
        </div>

        {/* Duration-based delay */}
        {formData.delayType === "duration" && (
          <div className="space-y-3">
            <FormInput
              label="Wait Duration"
              type="number"
              value={formData.delayValue}
              onChange={(e) => handleInputChange("delayValue", Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              helpText="How long to wait before continuing"
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Time Unit
              </label>
              <select
                value={formData.delayUnit}
                onChange={(e) => handleInputChange("delayUnit", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
        )}

        {/* Time-based delay */}
        {formData.delayType === "until" && (
          <div className="space-y-3">
            <FormInput
              label="Specific Time"
              type="time"
              value={formData.specificTime}
              onChange={(e) => handleInputChange("specificTime", e.target.value)}
              helpText="Wait until this time"
            />

            <FormInput
              label="Specific Date (Optional)"
              type="date"
              value={formData.specificDate}
              onChange={(e) => handleInputChange("specificDate", e.target.value)}
              helpText="Leave empty for today"
            />
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Clock className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs font-semibold text-blue-800 mb-1">
                Delay Info
              </p>
              <p className="text-xs text-blue-600">
                {formData.delayType === "duration" 
                  ? "The flow will pause for the specified duration before continuing to the next step."
                  : "The flow will wait until the specified time before continuing. If the time has passed, it continues immediately."}
              </p>
            </div>
          </div>
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
});

DelayNode.displayName = 'DelayNode';

export default DelayNode;
