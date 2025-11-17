import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import TagSelector from "../features/tags/components/TagSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FilterDialog = ({
  isOpen,
  onClose,
  filterOptions,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const dialogRef = useRef(null);

  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filterOptions,
      [field]: value,
    });
  };


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

  const isActive = (field, label) => filterOptions[field] === label;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl w-full max-w-4xl shadow-[0px_-0.91px_3.66px_0px_#00000042] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* --- Last Seen --- */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Last Seen
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {["In 24hr", "This Week", "This Month"].map((label) => (
                <button
                  key={label}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive("lastSeenQuick", label)
                      ? "bg-[#0AA89E] text-white shadow-md"
                      : "border border-gray-300 text-gray-700 hover:border-[#0AA89E] hover:text-[#0AA89E]"
                  }`}
                  onClick={() => handleInputChange("lastSeenQuick", label)}
                >
                  {label}
                </button>
              ))}

              {/* Date Range Picker */}
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={
                    filterOptions.lastSeenFrom
                      ? new Date(filterOptions.lastSeenFrom)
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange(
                      "lastSeenFrom",
                      date?.toISOString().split("T")[0]
                    )
                  }
                  placeholderText="From"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  dateFormat="yyyy-MM-dd"
                  popperPlacement="bottom-start"
                />
                <span className="text-gray-500 text-sm">to</span>
                <DatePicker
                  selected={
                    filterOptions.lastSeenTo
                      ? new Date(filterOptions.lastSeenTo)
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange(
                      "lastSeenTo",
                      date?.toISOString().split("T")[0]
                    )
                  }
                  placeholderText="To"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  dateFormat="yyyy-MM-dd"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>
          </div>

          {/* --- Created At --- */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Created At
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {["Today", "This Week", "This Month"].map((label) => (
                <button
                  key={label}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive("createdAtQuick", label)
                      ? "bg-[#0AA89E] text-white shadow-md"
                      : "border border-gray-300 text-gray-700 hover:border-[#0AA89E] hover:text-[#0AA89E]"
                  }`}
                  onClick={() => handleInputChange("createdAtQuick", label)}
                >
                  {label}
                </button>
              ))}

              {/* Date Range Picker */}
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={
                    filterOptions.createdAtFrom
                      ? new Date(filterOptions.createdAtFrom)
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange(
                      "createdAtFrom",
                      date?.toISOString().split("T")[0]
                    )
                  }
                  placeholderText="From"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  dateFormat="yyyy-MM-dd"
                  popperPlacement="bottom-start"
                />
                <span className="text-gray-500 text-sm">to</span>
                <DatePicker
                  selected={
                    filterOptions.createdAtTo
                      ? new Date(filterOptions.createdAtTo)
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange(
                      "createdAtTo",
                      date?.toISOString().split("T")[0]
                    )
                  }
                  placeholderText="To"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  dateFormat="yyyy-MM-dd"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>
          </div>

          {/* --- Radio Groups --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { field: "optedIn", label: "Opted In", options: ["Yes", "No", "All"] },
              {
                field: "incomingBlocked",
                label: "Incoming Blocked",
                options: ["Yes", "No", "All"],
              },
              { field: "readStatus", label: "Read Status", options: ["Read", "Unread", "All"] },
            ].map(({ field, label, options }) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {label}
                </label>
                <div className="flex flex-col gap-2 text-sm">
                  {options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#0AA89E] transition-colors"
                    >
                      <input
                        type="radio"
                        name={field}
                        value={option}
                        checked={filterOptions[field] === option}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        className="w-4 h-4 text-[#0AA89E] focus:ring-[#0AA89E] cursor-pointer"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* --- Attributes --- */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Attributes
            </label>
            <div className="flex gap-2 flex-wrap items-start">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                value={filterOptions.attribute || ""}
                onChange={(e) => handleInputChange("attribute", e.target.value)}
              >
                <option value="">Select Attribute</option>
                <option value="country">Country</option>
                <option value="language">Language</option>
                <option value="tag">Tag</option>
              </select>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                value={filterOptions.operator || "is"}
                onChange={(e) => handleInputChange("operator", e.target.value)}
              >
                <option value="is">is</option>
                <option value="isNot">is not</option>
                <option value="contains">contains</option>
              </select>

              {filterOptions.attribute === "tag" ? (
                <div className="flex-1 min-w-[250px]">
                  <TagSelector
                    selectedTags={filterOptions.selectedTags || []}
                    onTagsChange={(tags) =>
                      handleInputChange("selectedTags", tags)
                    }
                    placeholder="Select tags to filter by..."
                    allowCreate={false}
                    className="w-full"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  placeholder="Attribute Value"
                  value={filterOptions.attributeValue || ""}
                  onChange={(e) =>
                    handleInputChange("attributeValue", e.target.value)
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={onReset}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
          >
            Clear All
          </button>
          <button
            onClick={onApply}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;