import React, { useState } from "react";
import {
  MessageSquare,
  Video,
  List,
  ShoppingCart,
  Boxes,
  Layout,
  Tag,
  MapPin,
  HelpCircle,
  Image,
  Code,
  Bot,
  Merge,
} from "lucide-react";
import clsx from "clsx";

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
  const [tab, setTab] = useState("actions");

  const messageNodes = [
    { label: "Text Button", type: "text-button", Icon: MessageSquare },
    { label: "Media Button", type: "media-button", Icon: Video },
    { label: "List", type: "list", Icon: List },
    { label: "Catalog Message", type: "catalog", Icon: ShoppingCart },
    { label: "Single Product", type: "single-product", Icon: Boxes },
    { label: "Multi Product", type: "multi-product", Icon: Boxes },
    { label: "Template", type: "template", Icon: Layout },
  ];

  const actionNodes = [
    { label: "Condition", type: "assign-tag", Icon: Merge },
    { label: "Ask Address", type: "ask-address", Icon: MapPin },
    { label: "Ask Location", type: "ask-location", Icon: MapPin },
    { label: "Ask Question", type: "ask-question", Icon: HelpCircle },
    { label: "Ask Media", type: "ask-media", Icon: Image },
    { label: "Set Custom Field", type: "set-custom-field", Icon: Tag },
    { label: "Add Tag", type: "add-tag", Icon: Tag },
    { label: "API Request", type: "api-request", Icon: Code },
    { label: "Single AI Message", type: "single-ai-message", Icon: Bot },
    { label: "Assign AI Assistant", type: "assign-ai", Icon: Bot },
    { label: "Connect Flow", type: "connect-flow", Icon: Merge },
  ];

  const nodes = tab === "messages" ? messageNodes : actionNodes;

  return (
    <div className="w-70 p-4 bg-[#f8f9fb] h-full  space-y-4">
      {/* Tabs */}
      <div className="flex justify-between mb-4 border-b border-gray-200 pb-2">
        {["messages", "actions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "capitalize font-medium text-gray-500 pb-1",
              tab === t && "text-black border-b-2 border-black"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        {nodes.map(({ label, type, Icon }) => (
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
