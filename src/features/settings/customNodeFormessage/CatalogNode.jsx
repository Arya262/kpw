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

const CatalogNode = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 w-[320px]">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-800 text-sm">Catalog</h2>
        <div className="flex gap-2">
          <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer" />
          <Copy className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
      </div>

      {/* Red bordered content area */}
      <div className="border-2 border-red-300 rounded-lg p-4 space-y-4">
        {/* Body Input */}
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

        {/* Footer Input */}
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
      </div>
    </div>
  );
};

export default CatalogNode;
