import React from "react";
import {
  MessageSquare,
  Video,
  List,
  ShoppingCart,
  Boxes,
  Layout,
  HelpCircle,
} from "lucide-react";

const DraggableCard = ({ type, label, Icon }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type, label })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      onDragStart={onDragStart}
      draggable
      role="button"
      aria-label={`Draggable card for ${label}`}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-move"
    >
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="text-sm text-gray-600 font-medium">{label}</span>
    </div>
  );
};

const FlowSidebar = () => {
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
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        {messageNodes.map(({ label, type, Icon }) => (
          <DraggableCard
            key={`${type}-${label}`}
            type={type}
            label={label}
            Icon={Icon}
          />
        ))}
      </div>
    </div>
  );
};

export default FlowSidebar;
