import React from "react";
import { Trash2, Copy } from "lucide-react";

const ContactCustomFieldNode = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 w-[320px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-800 text-sm">Contact Custom Field</h2>
        <div className="flex gap-2">
          <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer" />
          <Copy className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
      </div>

      {/* Main content with red border */}
      <div className="border border-red-300 rounded-xl p-4 space-y-4">
        {/* Select Custom Field */}
        <div>
          <select className="w-full border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select Contact Custom Field</option>
            {/* Add dynamic options here */}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select contact custom field to store value.
          </p>
        </div>

        {/* Enter Value */}
        <div>
          <textarea
            placeholder="Enter Value"
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter or paste value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactCustomFieldNode;
