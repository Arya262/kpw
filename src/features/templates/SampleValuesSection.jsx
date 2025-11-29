import React from "react";

// Helper to format variable name for display (e.g., "order_id" -> "Order Id")
const formatVariableName = (varName) => {
  // Check if it's a number (old format)
  if (/^\d+$/.test(varName)) {
    return `Variable ${varName}`;
  }
  // Convert snake_case or camelCase to Title Case
  return varName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const SampleValuesSection = ({
  variables,
  sampleValues,
  handleSampleValueChange,
  errors,
}) => {
  if (!variables.length) return null;
  return (
    <div className="border border-[#CACACA] rounded p-4 mt-4">
      <div className="font-semibold mb-2 border-b border-[#CACACA] pb-2">
        Sample Values
      </div>
      {variables.map((variable, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formatVariableName(variable)}
            </label>
            <input
              type="text"
              value={`{{${variable}}}`}
              className=" rounded p-2 w-full bg-gray-100 focus:outline-none focus:border-teal-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be replaced with the sample value.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Value for {formatVariableName(variable)}
            </label>
            <input
              type="text"
              placeholder={`e.g., ${variable === 'name' ? 'John' : variable === 'order_id' ? 'ORD123' : variable === 'amount' ? '₹500' : 'Sample value'}`}
              value={sampleValues[variable] || ""}
              onChange={(e) =>
                handleSampleValueChange(variable, e.target.value)
              }
              className={`border rounded p-2 w-full  focus:outline-none focus:border-teal-500 ${
                errors.sampleValues?.[variable]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.sampleValues?.[variable] && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sampleValues[variable]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SampleValuesSection;