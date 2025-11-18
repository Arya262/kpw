import {
  MessageSquare,
  Video,
  List,
  ShoppingCart,
  Boxes,
  Layout,
  HelpCircle,
} from "lucide-react";

const DraggableCard = ({ type, label, Icon, onAddNode }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type, label })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e) => {
    // Prevent drag from interfering with click
    e.stopPropagation();
    
    if (onAddNode) {
      onAddNode(type, label);
    }
  };

  return (
    <div
      onDragStart={onDragStart}
      onClick={handleClick}
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Add ${label} node - Click to add or drag to position`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-blue-400 transition cursor-pointer active:scale-95"
      title="Click to add to center or drag to position"
    >
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="text-sm text-gray-600 font-medium">{label}</span>
    </div>
  );
};

const FlowSidebar = ({ onAddNode }) => {
  const messageNodes = [
    { label: "Text Button", type: "text-button", Icon: MessageSquare },
    { label: "Media Button", type: "media-button", Icon: Video },
    { label: "List", type: "list", Icon: List },
    { label: "Catalog Message", type: "catalog", Icon: ShoppingCart },
    { label: "Single Product", type: "single-product", Icon: Boxes },
    { label: "Multi Product", type: "multi-product", Icon: Boxes },
    { label: "Template", type: "template", Icon: Layout },
    { label: "Ask Question", type: "ask-question", Icon: HelpCircle },
  ];

  return (
    <div className="w-70 p-4 bg-[#f8f9fb] h-full space-y-4">
      {/* Header with instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>💡 Tip:</strong> Click to add to center or drag to position
        </p>
      </div>

      {/* Message Types */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Message Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {messageNodes.map(({ label, type, Icon }) => (
            <DraggableCard
              key={`${type}-${label}`}
              type={type}
              label={label}
              Icon={Icon}
              onAddNode={onAddNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowSidebar;
