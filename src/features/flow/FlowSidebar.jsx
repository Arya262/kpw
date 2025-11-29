import {
  MessageSquare,
  Video,
  List,
  ShoppingCart,
  Boxes,
  Layout,
  HelpCircle,
  Type,
  Image,
  Tag,
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
    { label: "Text", type: "text", Icon: Type },
    { label: "Media", type: "media", Icon: Image },
    { label: "Text Button", type: "text-button", Icon: MessageSquare },
    { label: "Media Button", type: "media-button", Icon: Video },
    { label: "Add Tag", type: "add-tag", Icon: Tag },
  ];

  return (
    <div className="w-70 p-4 bg-[#f8f9fb] h-full space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>💡 Tip:</strong> Click to add to center or drag to position
        </p>
      </div>

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
