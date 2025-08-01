import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import {
  Trash2,
  Copy,
  MousePointerClick,
  Video,
  List,
  Box,
  Boxes,
  LayoutTemplate,
} from "lucide-react";

const MultiProductPreview = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 w-[320px]">
      {/* Main content area with red border */}
      <div className="border-2 border-red-300 rounded-lg p-4 space-y-4">
        {/* Header input */}
        <div>
          <textarea
            placeholder="Enter Header"
            maxLength={20}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter header here, only 0/20 characters allowed.
          </p>
        </div>

        {/* Body input */}
        <div>
          <textarea
            placeholder="Enter Body"
            maxLength={1024}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter body here, only 0/1024 characters allowed.
          </p>
        </div>

        {/* Footer input */}
        <div>
          <textarea
            placeholder="Enter Footer"
            maxLength={60}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter footer here, only 0/60 characters allowed.
          </p>
        </div>

        {/* Add Section Button */}
        <button className="w-full bg-white border border-blue-500 text-blue-500 rounded-md py-2 text-sm font-medium flex justify-center items-center gap-1 hover:bg-blue-50">
          <span className="text-lg">＋</span> Add Section
        </button>

        {/* View Items Button (Disabled look) */}
        <button className="w-full bg-gray-100 text-gray-500 rounded-md py-2 text-sm font-medium cursor-default">
          View Items
        </button>
      </div>

      {/* Add Content Button */}
      <button className="mt-4 w-full bg-white border border-blue-500 text-blue-500 rounded-md py-2 text-sm font-medium flex justify-center items-center gap-1 hover:bg-blue-50">
        <span className="text-lg">＋</span> Add Content
      </button>
    </div>
  );
};

export default MultiProductPreview;
