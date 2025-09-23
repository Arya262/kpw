import React, { useRef, useEffect } from "react";
import { X } from "lucide-react"; // for close icon

const FilterDialog = ({ isOpen, onClose, filterOptions, onFilterChange, onReset, onApply }) => {
  const dialogRef = useRef(null);

  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filterOptions,
      [field]: value,
    });
  };

  // Close on outside click + ESC key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleEscKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  // helper for quick button active state
  const isActive = (field, label) => filterOptions[field] === label;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
      <div ref={dialogRef} className="bg-white rounded-lg w-full max-w-4xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Last Seen */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Last Seen
            </label>
            <div className="flex flex-wrap gap-2">
              {["In 24hr", "This Week", "This Month"].map((label) => (
                <button
                  key={label}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    isActive("lastSeenQuick", label)
                      ? "bg-[#004D47] text-white border-[#004D47]"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleInputChange("lastSeenQuick", label)}
                >
                  {label}
                </button>
              ))}
              <input
                type="date"
                className="border rounded-md px-2 py-1 text-sm"
                value={filterOptions.lastSeenFrom || ""}
                onChange={(e) => handleInputChange("lastSeenFrom", e.target.value)}
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                className="border rounded-md px-2 py-1 text-sm"
                value={filterOptions.lastSeenTo || ""}
                onChange={(e) => handleInputChange("lastSeenTo", e.target.value)}
              />
            </div>
          </div>

          {/* Created At */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Created At
            </label>
            <div className="flex flex-wrap gap-2">
              {["Today", "This Week", "This Month"].map((label) => (
                <button
                  key={label}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    isActive("createdAtQuick", label)
                      ? "bg-[#004D47] text-white border-[#004D47]"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleInputChange("createdAtQuick", label)}
                >
                  {label}
                </button>
              ))}
              <input
                type="date"
                className="border rounded-md px-2 py-1 text-sm"
                value={filterOptions.createdAtFrom || ""}
                onChange={(e) => handleInputChange("createdAtFrom", e.target.value)}
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                className="border rounded-md px-2 py-1 text-sm"
                value={filterOptions.createdAtTo || ""}
                onChange={(e) => handleInputChange("createdAtTo", e.target.value)}
              />
            </div>
          </div>

          {/* Radio Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { field: "optedIn", label: "Opted In", options: ["Yes", "No", "All"] },
              { field: "incomingBlocked", label: "Incoming Blocked", options: ["Yes", "No", "All"] },
              { field: "readStatus", label: "Read Status", options: ["Read", "Unread", "All"] },
            ].map(({ field, label, options }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <div className="flex gap-4 text-sm">
                  {options.map((option) => (
                    <label key={option} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={field}
                        value={option}
                        checked={filterOptions[field] === option}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Attributes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attributes
            </label>
            <div className="flex gap-2 flex-wrap">
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={filterOptions.attribute || ""}
                onChange={(e) => handleInputChange("attribute", e.target.value)}
              >
                <option value="">Select Attribute</option>
                <option value="country">Country</option>
                <option value="language">Language</option>
                <option value="tag">Tag</option>
              </select>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={filterOptions.operator || "is"}
                onChange={(e) => handleInputChange("operator", e.target.value)}
              >
                <option value="is">is</option>
                <option value="isNot">is not</option>
                <option value="contains">contains</option>
              </select>
              <input
                type="text"
                className="border rounded-md px-2 py-1 text-sm"
                placeholder="Attribute Value"
                value={filterOptions.value || ""}
                onChange={(e) => handleInputChange("value", e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-md hover:bg-gray-100"
          >
            Clear All
          </button>
          <button
            onClick={onApply}
            className="px-6 py-2 bg-[#004D47] text-white text-sm font-medium rounded-md hover:bg-[#006d65]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;
