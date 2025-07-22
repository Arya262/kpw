import React from "react";

const SampleValuesSection = ({
  variables,
  sampleValues,
  handleSampleValueChange,
  errors,
}) => {
  if (!variables.length) return null;
  return (
    <div className="border border-[#CACACA] rounded p-4 mb-4">
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
              Field {index + 1}
            </label>
            <input
              type="text"
              value={`{{${variable}}}`}
              className="border rounded p-2 w-full bg-gray-100"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Specify the parameter to be replaced.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Value {index + 1}
            </label>
            <input
              type="text"
              placeholder={`Enter sample value for {{${variable}}}`}
              value={sampleValues[variable] || ""}
              onChange={(e) =>
                handleSampleValueChange(variable, e.target.value)
              }
              className={`border rounded p-2 w-full ${
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