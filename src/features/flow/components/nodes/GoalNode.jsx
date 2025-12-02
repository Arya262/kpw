import { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Target, TrendingUp } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";

const GoalNode = memo(({ data, isConnectable, id, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    goalName: "",
    goalDescription: "",
    goalType: "conversion", // "conversion", "engagement", "custom"
    actionOnComplete: "continue", // "continue", "stop", "tag"
    completionTag: "",
    trackMetrics: true,
  });

  const [initialized, setInitialized] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        goalName: data.goalName || "",
        goalDescription: data.goalDescription || "",
        goalType: data.goalType || "conversion",
        actionOnComplete: data.actionOnComplete || "continue",
        completionTag: data.completionTag || "",
        trackMetrics: data.trackMetrics !== false,
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

  const goalTypeOptions = [
    { value: "conversion", label: "🎯 Conversion", description: "Track purchases, signups, etc." },
    { value: "engagement", label: "💬 Engagement", description: "Track replies, clicks, etc." },
    { value: "custom", label: "⚙️ Custom", description: "Custom goal tracking" },
  ];

  const actionOptions = [
    { value: "continue", label: "Continue Flow", description: "Keep going to next step" },
    { value: "stop", label: "Stop Flow", description: "End the sequence here" },
    { value: "tag", label: "Add Tag & Continue", description: "Tag contact and continue" },
  ];

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Goal"
        icon="🎯"
        subtitle={formData.goalName || "Track goal completion"}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Goal Name */}
        <FormInput
          label="Goal Name"
          value={formData.goalName}
          onChange={(e) => handleInputChange("goalName", e.target.value)}
          placeholder="e.g., Purchase Complete, Lead Qualified"
          required
          helpText="Give your goal a descriptive name"
        />

        {/* Goal Description */}
        <FormTextarea
          label="Description (Optional)"
          value={formData.goalDescription}
          onChange={(e) => handleInputChange("goalDescription", e.target.value)}
          placeholder="Describe what this goal represents..."
          rows={2}
          helpText="Optional description for reporting"
        />

        {/* Goal Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Goal Type
          </label>
          <div className="space-y-2">
            {goalTypeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.goalType === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="goalType"
                  value={option.value}
                  checked={formData.goalType === option.value}
                  onChange={(e) => handleInputChange("goalType", e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action on Complete */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Action on Goal Completion
          </label>
          <select
            value={formData.actionOnComplete}
            onChange={(e) => handleInputChange("actionOnComplete", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-gray-400 transition-all"
          >
            {actionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {actionOptions.find((o) => o.value === formData.actionOnComplete)?.description}
          </p>
        </div>

        {/* Completion Tag (if action is "tag") */}
        {formData.actionOnComplete === "tag" && (
          <FormInput
            label="Completion Tag"
            value={formData.completionTag}
            onChange={(e) => handleInputChange("completionTag", e.target.value)}
            placeholder="e.g., goal-completed, converted"
            helpText="Tag to add when goal is reached"
          />
        )}

        {/* Track Metrics Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <div className="text-sm font-medium text-gray-700">
              Track Metrics
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Record goal completion in analytics
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.trackMetrics}
              onChange={(e) => handleInputChange("trackMetrics", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Target className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs font-semibold text-green-800 mb-1">
                Goal Tracking
              </p>
              <p className="text-xs text-green-600">
                When a contact reaches this node, the goal is marked as achieved. Use this to measure campaign success and conversion rates.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Preview (placeholder) */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Goal Stats</span>
            <TrendingUp className="text-gray-400" size={14} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500">Reached</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">0%</div>
              <div className="text-xs text-gray-500">Conversion</div>
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
      
      {formData.actionOnComplete !== "stop" && (
        <Handle
          type="source"
          position={Position.Right}
          id="right-handle"
          isConnectable={isConnectable}
          style={sourceHandleStyle}
          className="hover:scale-125 transition-transform"
        />
      )}
    </div>
  );
});

GoalNode.displayName = 'GoalNode';

export default GoalNode;
