import React from "react";
import { Handle, Position } from "reactflow";
import { Trash2, CopyPlus } from "lucide-react";

const TemplateNode = ({ data }) => {
  const outputColor = data.status === 1 ? "#16a34a" : "#dc2626";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm w-[280px] border relative p-4 transition-all duration-200 hover:shadow-md
        ${data.selected ? "border-teal-500 ring-2 ring-teal-400" : "border-gray-300"}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#0d9488",
          top: "50%",
          transform: "translateY(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: outputColor,
          top: "50%",
          transform: "translateY(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate" title={data.label}>
          {data.label || "Untitled Template"}
        </h3>
        <div className="flex items-center space-x-2 text-gray-400">
          <button
            className="hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
          >
            <Trash2 size={16} />
          </button>
          <button
            className="hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              data.onClone?.();
            }}
          >
            <CopyPlus size={16} />
          </button>
        </div>
      </div>

      {/* Optional: Image Section */}
      {/* {data.image ? (
        <img
          src={data.image}
          alt={data.label}
          className="w-full h-28 object-cover rounded-md mb-3"
          onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
        />
      ) : (
        <div className="w-full h-28 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400 text-sm">
          No Image
        </div>
      )} */}

      {/* Optional: Category */}
      {/* {data.category && (
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-2">
          {data.category}
        </span>
      )} */}

      {/* Optional: Meta */}
      {/* {data.meta && (
        <p className="text-xs text-gray-700 break-words">
          {data.meta}
        </p>
      )} */}

      {/* Sample Text */}
      {data.sampleText ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
          <pre className="text-[11px] text-gray-800 whitespace-pre-wrap leading-snug font-mono">
            {data.sampleText}
          </pre>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No preview available</p>
      )}
    </div>
  );
};

export default TemplateNode;
