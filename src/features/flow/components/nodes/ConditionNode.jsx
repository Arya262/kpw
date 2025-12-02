import { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { GitBranch, Plus, X } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import { nodeContainerStyle, targetHandleStyle } from "./nodeStyles";

const ConditionNode = memo(({ data, isConnectable, id, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    conditionType: "tag", // "tag", "field", "button_click", "replied"
    conditions: [
      {
        id: Date.now(),
        field: "",
        operator: "equals",
        value: "",
      },
    ],
    matchType: "all", // "all" (AND) or "any" (OR)
  });

  const [initialized, setInitialized] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        conditionType: data.conditionType || "tag",
        conditions: data.conditions || [
          {
            id: Date.now(),
            field: "",
            operator: "equals",
            value: "",
          },
        ],
        matchType: data.matchType || "all",
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

  const handleConditionChange = (conditionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) =>
        c.id === conditionId ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: Date.now(),
          field: "",
          operator: "equals",
          value: "",
        },
      ],
    }));
  };

  const removeCondition = (conditionId) => {
    if (formData.conditions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        conditions: prev.conditions.filter((c) => c.id !== conditionId),
      }));
    }
  };

  const getConditionLabel = () => {
    const typeLabels = {
      tag: "Has Tag",
      field: "Custom Field",
      button_click: "Button Clicked",
      replied: "Replied to Message",
    };
    return typeLabels[formData.conditionType] || "Condition";
  };

  const operatorOptions = {
    tag: [
      { value: "has", label: "Has tag" },
      { value: "not_has", label: "Does not have tag" },
    ],
    field: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not equals" },
      { value: "contains", label: "Contains" },
      { value: "not_contains", label: "Does not contain" },
      { value: "is_empty", label: "Is empty" },
      { value: "is_not_empty", label: "Is not empty" },
    ],
    button_click: [
      { value: "clicked", label: "Clicked" },
      { value: "not_clicked", label: "Not clicked" },
    ],
    replied: [
      { value: "replied", label: "Replied" },
      { value: "not_replied", label: "Did not reply" },
    ],
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Condition"
        icon="🔀"
        subtitle={getConditionLabel()}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Condition Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Condition Type
          </label>
          <select
            value={formData.conditionType}
            onChange={(e) => handleInputChange("conditionType", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
          >
            <option value="tag">Has Tag</option>
            <option value="field">Custom Field</option>
            <option value="button_click">Button Clicked</option>
            <option value="replied">Replied to Message</option>
          </select>
        </div>

        {/* Match Type (for multiple conditions) */}
        {formData.conditions.length > 1 && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Match Type
            </label>
            <select
              value={formData.matchType}
              onChange={(e) => handleInputChange("matchType", e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
            >
              <option value="all">Match ALL conditions (AND)</option>
              <option value="any">Match ANY condition (OR)</option>
            </select>
          </div>
        )}

        {/* Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Conditions
            </label>
            <button
              onClick={addCondition}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Condition
            </button>
          </div>

          {formData.conditions.map((condition, index) => (
            <div
              key={condition.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  Condition {index + 1}
                </span>
                {formData.conditions.length > 1 && (
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Field/Tag Name */}
              <input
                type="text"
                placeholder={
                  formData.conditionType === "tag"
                    ? "Tag name"
                    : formData.conditionType === "field"
                    ? "Field name"
                    : formData.conditionType === "button_click"
                    ? "Button text"
                    : "Message text"
                }
                value={condition.field}
                onChange={(e) =>
                  handleConditionChange(condition.id, "field", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Operator */}
              <select
                value={condition.operator}
                onChange={(e) =>
                  handleConditionChange(condition.id, "operator", e.target.value)
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {operatorOptions[formData.conditionType]?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Value (only for certain operators) */}
              {formData.conditionType === "field" &&
                !["is_empty", "is_not_empty"].includes(condition.operator) && (
                  <input
                    type="text"
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) =>
                      handleConditionChange(condition.id, "value", e.target.value)
                    }
                    className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <GitBranch className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs font-semibold text-purple-800 mb-1">
                Branching Logic
              </p>
              <p className="text-xs text-purple-600">
                Connect the "Yes" handle to actions when conditions are met, and "No" handle for when they're not.
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

      {/* Yes/True Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes-handle"
        isConnectable={isConnectable}
        style={{
          ...targetHandleStyle,
          background: "#10b981",
          border: "2px solid #059669",
          top: "40%",
        }}
        className="hover:scale-125 transition-transform"
      />
      <div
        className="absolute right-[-50px] top-[40%] transform -translate-y-1/2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded"
        style={{ pointerEvents: "none" }}
      >
        Yes
      </div>

      {/* No/False Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="no-handle"
        isConnectable={isConnectable}
        style={{
          ...targetHandleStyle,
          background: "#ef4444",
          border: "2px solid #dc2626",
          top: "60%",
        }}
        className="hover:scale-125 transition-transform"
      />
      <div
        className="absolute right-[-45px] top-[60%] transform -translate-y-1/2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded"
        style={{ pointerEvents: "none" }}
      >
        No
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;
