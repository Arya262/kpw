import { useState } from "react";
import { Clock, Mail, Edit, Trash2, GripVertical } from "lucide-react";

const StepCard = ({ step, index, onEdit, onDelete, totalSteps }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getDelayText = () => {
    if (step.delay_value === 0) return "Immediately";
    const unit = step.delay_unit === "minutes" ? "min" : step.delay_unit === "hours" ? "hr" : "day";
    return `${step.delay_value} ${unit}${step.delay_value > 1 ? "s" : ""}`;
  };

  return (
    <div className="relative">
      {/* Connector Line */}
      {index < totalSteps - 1 && (
        <div className="absolute left-6 top-full w-0.5 h-8 bg-gray-300 z-0"></div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative z-10">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Step Number */}
          <div className="flex-shrink-0 w-8 h-8 bg-[#0AA89E] text-white rounded-full flex items-center justify-center font-semibold text-sm">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {step.step_name || `Step ${index + 1}`}
                </h4>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  Template: {step.template_name || "Not selected"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(step, index)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit step"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete step"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Delay Info */}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {index === 0 ? "Starts" : "Wait"} {getDelayText()}
                {index > 0 && " after previous step"}
              </span>
            </div>

            {/* Parameter Mappings */}
            {step.parameters && Object.keys(step.parameters).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Parameters:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(step.parameters).map(([key, value]) => {
                    if (!value) return null;
                    const paramNum = key.replace('param_', '');
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded"
                      >
                        {`{{${paramNum}}}`} → {value.replace('_', ' ')}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
