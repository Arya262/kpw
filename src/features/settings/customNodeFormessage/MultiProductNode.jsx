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
  X,
} from "lucide-react";

import TextButtonPreview from "./TextButtonPreview";
import MediaButtonPreview from "./MediaButtonPreview";
import MultiProductPreview from "./MultiProductPreview";
import SingleProductPreview from "./SingleProductPreview";
import ListPreview from "./ListPreview";
import TemplateboxPreview from "./Templateboxpreview";

// Component map for different content types
const contentComponents = {
  "text-button": TextButtonPreview,
  "media-button": MediaButtonPreview,
  list: ListPreview,
  "single-product": SingleProductPreview,
  "multi-product": MultiProductPreview,
  template: TemplateboxPreview,
  media: MediaButtonPreview,
};

const contentTypes = [
  {
    id: "text-button",
    label: "Text Button",
    icon: <MousePointerClick className="w-4 h-4" />,
  },
  { id: "media", label: "Media", icon: <Video className="w-4 h-4" /> },
  { id: "list", label: "List", icon: <List className="w-4 h-4" /> },
  {
    id: "single-product",
    label: "Single Product Message",
    icon: <Box className="w-4 h-4" />,
  },
  {
    id: "multi-product",
    label: "Multi Product Message",
    icon: <Boxes className="w-4 h-4" />,
  },
  {
    id: "template",
    label: "Template",
    icon: <LayoutTemplate className="w-4 h-4" />,
  },
];

const MultiProductNode = ({ data, isConnectable }) => {
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [contents, setContents] = useState([]);

  const handleContentSelect = (contentType) => {
    setShowContentMenu(false);

    const newContent = {
      id: `content-${Date.now()}`,
      type: contentType,
      data: {
        text: "",
        buttons: [],
      },
    };

    setContents((prev) => [...prev, newContent]);
  };

  const removeContent = (id) => {
    setContents((prev) => prev.filter((content) => content.id !== id));
  };

  return (
    <div
      className="relative rounded-2xl p-4 overflow-visible border border-transparent transition-all hover:border-blue-500"
      style={{
        color: "var(--palette-text-primary)",
        backgroundColor: "rgb(244, 246, 248)",
        boxShadow:
          "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        minWidth: "330px",
        maxWidth: "345px",
        zIndex: 0,
        backgroundImage: "none",
        borderRadius: "16px",
        transition: "border 0.3s, border-radius 0.3s",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Multi Product</h3>
        <div className="flex gap-2">
          <Copy size={16} className="cursor-pointer text-gray-500" />
          <Trash2 size={16} className="cursor-pointer text-red-500" />
        </div>
      </div>

      {/* Content */}
      <div className="border-2 border-red-500 rounded-lg p-4 space-y-4">
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

        <button className="w-full bg-white border border-blue-500 text-blue-500 rounded-md py-2 text-sm font-medium flex justify-center items-center gap-1 hover:bg-blue-50">
          <span className="text-lg">＋</span> Add Section
        </button>

        <button className="w-full bg-gray-100 text-gray-500 rounded-md py-2 text-sm font-medium cursor-default">
          View Items
        </button>
      </div>

      {/* Render Added Contents */}
      {contents.length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Added Contents:</h3>
          {contents.map((content) => {
            const ContentComponent = contentComponents[content.type];
            return (
              <div
                key={content.id}
                className="relative border border-gray-200 rounded-lg p-2 bg-white shadow-sm"
              >
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  onClick={() => removeContent(content.id)}
                >
                  <X size={16} />
                </button>
                {ContentComponent ? (
                  <ContentComponent data={content.data} />
                ) : (
                  <p className="text-red-500 text-sm">
                    Unsupported content type: {content.type}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Content Button */}
      <div className="mt-4 relative">
        <button
          onClick={() => setShowContentMenu((prev) => !prev)}
          className="w-full flex justify-center items-center gap-2 border border-blue-500 text-blue-500 font-medium rounded-lg py-2 hover:bg-blue-50 transition cursor-pointer"
        >
          <span className="text-xl">＋</span> Add Content
        </button>

        {showContentMenu && (
          <div className="absolute z-10 left-0 mt-2 w-full bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              Choose Content Type
            </h3>
            <div className="space-y-2">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleContentSelect(type.id)}
                  className="flex items-center gap-3 w-full text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none p-2 rounded-md transition-colors duration-150 cursor-pointer"
                >
                  <div className="text-xl text-gray-500">{type.icon}</div>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* React Flow Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={{
          background: "white",
          border: "2px solid rgb(7, 141, 238)",
          width: 12,
          height: 12,
          borderRadius: "50%",
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

export default MultiProductNode;
