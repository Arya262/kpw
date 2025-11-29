import { memo, useCallback, useState } from "react";
import { Handle, Position } from "reactflow";
import { MessageSquare, ChevronDown, XCircle } from "lucide-react";
import { useNodeData } from "../../hooks/useNodeData";
import { NODE_DIMENSIONS } from "../../constants/nodeConstants";

const AddTagNode = memo(({ data, isConnectable, id }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Initialize form data with tag rows
  const initializeFormData = useCallback(
    (data) => ({
      tagRows: data?.tagRows || [{ id: 1, selectedTag: null }],
    }),
    []
  );

  const [formData, setFormData] = useNodeData(data, id, initializeFormData);

  // Available tags
  const availableTags = data?.availableTags || [
    { id: 1, name: "New Lead" },
    { id: 2, name: "Hot Lead" },
    { id: 3, name: "Customer" },
    { id: 4, name: "VIP" },
    { id: 5, name: "Follow Up" },
  ];

  // Add new tag row
  const handleAddTagRow = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      tagRows: [...prev.tagRows, { id: Date.now(), selectedTag: null }],
    }));
  }, [setFormData]);

  // Remove tag row
  const handleRemoveTagRow = useCallback(
    (rowId) => {
      setFormData((prev) => ({
        ...prev,
        tagRows: prev.tagRows.filter((row) => row.id !== rowId),
      }));
    },
    [setFormData]
  );

  // Select tag for a row
  const handleSelectTag = useCallback(
    (rowId, tag) => {
      setFormData((prev) => ({
        ...prev,
        tagRows: prev.tagRows.map((row) =>
          row.id === rowId ? { ...row, selectedTag: tag } : row
        ),
      }));
      setOpenDropdownIndex(null);
    },
    [setFormData]
  );

  // Get already selected tags to filter them out
  const getSelectedTagIds = () => {
    return formData.tagRows
      .filter((row) => row.selectedTag)
      .map((row) => row.selectedTag.id);
  };

  const handleCreateTag = useCallback(() => {
    data?.onCreateTag?.();
  }, [data]);

  return (
    <div
      style={{
        width: `${NODE_DIMENSIONS.WIDTH}px`,
        minWidth: `${NODE_DIMENSIONS.MIN_WIDTH}px`,
        maxWidth: `${NODE_DIMENSIONS.MAX_WIDTH}px`,
      }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 relative"
        style={{
          background: "linear-gradient(135deg, #e8f5f3 0%, #d4edea 100%)",
          borderLeft: "4px solid #0d9488",
        }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-teal-700" />
          <span className="font-semibold text-teal-800 text-base">Add Tag</span>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="source"
          isConnectable={isConnectable}
          style={{
            background: "white",
            border: "2px solid #0d9488",
            width: 14,
            height: 14,
            borderRadius: "50%",
            right: -7,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "crosshair",
          }}
          className="hover:scale-125 transition-transform"
        />
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="target"
        isConnectable={isConnectable}
        style={{
          background: "white",
          border: "2px solid #0d9488",
          width: 14,
          height: 14,
          borderRadius: "50%",
          left: -7,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "crosshair",
        }}
        className="hover:scale-125 transition-transform"
      />

      {/* Content */}
      <div className="p-4 space-y-3" style={{ backgroundColor: "#f5f0e8" }}>
        {formData.tagRows.map((row, index) => (
          <div key={row.id} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Select Tag</span>
              <button
                onClick={() => handleRemoveTagRow(row.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <XCircle size={22} className="text-gray-600" />
              </button>
            </div>

            <div className="relative nodrag">
              <button
                onClick={() =>
                  setOpenDropdownIndex(openDropdownIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-teal-600 font-medium">@</span>
                  <span>{row.selectedTag ? row.selectedTag.name : "Select tag"}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${openDropdownIndex === index ? "rotate-180" : ""}`}
                />
              </button>

              {openDropdownIndex === index && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto nowheel">
                  {availableTags
                    .filter((tag) => !getSelectedTagIds().includes(tag.id))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleSelectTag(row.id, tag)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-teal-600">@</span>
                        <span className="text-gray-700">{tag.name}</span>
                      </button>
                    ))}
                  {availableTags.filter((tag) => !getSelectedTagIds().includes(tag.id))
                    .length === 0 && (
                    <div className="px-3 py-2 text-gray-400 text-sm">
                      No more tags available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={handleAddTagRow}
          className="w-full py-3 bg-white rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          + Add Tag
        </button>

        <button
          onClick={handleCreateTag}
          className="w-full py-3 bg-white rounded-xl text-amber-600 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Create Tag
        </button>
      </div>
    </div>
  );
});

AddTagNode.displayName = "AddTagNode";

export default AddTagNode;
