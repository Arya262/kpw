import React from "react";
import { Trash2, Copy } from "lucide-react";

const AddressNode = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 w-[320px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-800 text-sm">Address</h2>
        <div className="flex gap-2">
          <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer" />
          <Copy className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
      </div>

      {/* Content area with red border */}
      <div className="border border-red-300 rounded-xl p-4 space-y-4">
        {/* Question Message */}
        <div>
          <textarea
            placeholder="Question Message"
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter question message here.
          </p>
        </div>

        {/* Contact Custom Field Dropdown */}
        <div>
          <select className="w-full border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select Contact Custom Field</option>
            {/* Add more options dynamically as needed */}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select contact custom field to store address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressNode;
