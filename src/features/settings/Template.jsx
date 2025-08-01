import React from "react";
import { Trash2, Copy, Plus } from "lucide-react";

const TemplateBoxNode = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-64 relative border border-[#e3eaf3]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700 text-sm">Template</h2>
        <div className="flex gap-2">
          <button>
            <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
          </button>
          <button>
            <Copy size={16} className="text-gray-500 hover:text-blue-500" />
          </button>
        </div>
      </div>

      {/* Add Template Box */}
      <div className="border-2 border-red-400 border-dashed rounded-lg p-3 mb-3">
        <button className="w-full flex items-center justify-center gap-1 border border-blue-400 text-blue-600 text-sm py-1 px-2 rounded hover:bg-blue-50">
          <Plus size={14} />
          Add Template
        </button>
      </div>

      {/* Add Content Button */}
      <button className="w-full flex items-center justify-center gap-1 border border-blue-400 text-blue-600 text-sm py-1 px-2 rounded hover:bg-blue-50">
        <Plus size={14} />
        Add Content
      </button>
    </div>
  );
};

export default TemplateBoxNode;
