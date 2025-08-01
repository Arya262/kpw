import React from "react";
import { Trash2, Copy } from "lucide-react";

const QuestionNode = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 w-[320px]">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-800 text-sm">Question</h2>
        <div className="flex gap-2">
          <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer" />
          <Copy className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
      </div>

      {/* Red border main area */}
      <div className="border border-red-300 rounded-xl p-4 space-y-4">
        {/* Message Input */}
        <div>
          <textarea
            placeholder="Enter Message"
            maxLength={1024}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter message here, only 0/1024 characters allowed.
          </p>
        </div>

        {/* Select Contact Custom Field */}
        <div>
          <select className="w-full border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select Contact Custom Field</option>
            {/* Add options dynamically */}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select contact custom field to store reply.
          </p>
        </div>

        {/* Select Format */}
        <div>
          <select className="w-full border px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select Format</option>
            {/* Add options dynamically */}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select format of the reply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionNode;
