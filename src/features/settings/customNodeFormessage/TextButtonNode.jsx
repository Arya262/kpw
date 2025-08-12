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

const TextButtonNode = ({ data, isConnectable }) => {
  const [formData, setFormData] = useState({
    text: "",
    charCount: 0,
    isError: false,
    buttons: [],
  });

  const [contents, setContents] = useState([]);
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const addButton = () => {
    if (formData.buttons.length >= 3) return;

    setFormData((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          id: `btn-${Date.now()}`,
          text: "",
          isSelected: false,
          charCount: 0,
          isError: false,
        },
      ],
    }));
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    const charCount = text.length;
    setFormData((prev) => ({
      ...prev,
      text,
      charCount,
      isError: charCount > 1024,
    }));
  };

  const handleButtonTextChange = (id, text) => {
    const charCount = text.length;
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.map((btn) =>
        btn.id === id
          ? {
              ...btn,
              text,
              charCount,
              isError: charCount > 20,
            }
          : btn
      ),
    }));
  };

  const removeButton = (id) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((btn) => btn.id !== id),
    }));
  };

  const handleContentSelect = (contentType) => {
    setSelectedContent(contentType);
    setShowContentMenu(false);

    // Add the new content to the contents array with default data
    const newContent = {
      id: `content-${Date.now()}`,
      type: contentType,
      data: {
        // Default data for each content type
        text: "",
        buttons: [],
        // Add other default properties as needed
      },
    };

    setContents([...contents, newContent]);
  };

  return (
    <div
      className="relative rounded-2xl p-4 overflow-visible transition-all"
      style={{
        color: "var(--palette-text-primary)",
        backgroundColor: "rgb(244, 246, 248)",
        boxShadow:
          "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        border: "1px solid transparent",
        minWidth: "330px",
        maxWidth: "345px",
        zIndex: 0,
        backgroundImage: "none",
        borderRadius: "16px",
        transition: "border 0.3s, border-radius 0.3s",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Text Button</h3>
        <div className="flex gap-2">
          <Copy size={16} className="cursor-pointer text-gray-500" />
          <Trash2 size={16} className="cursor-pointer text-red-500" />
        </div>
      </div>

      <div className="border-2 border-red-500 rounded-lg p-4 space-y-4">
        {/* Text Area */}
        <div>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
            placeholder="Enter Message"
            rows={3}
            value={formData.text}
            onChange={handleTextChange}
          />
          <p
            className={`text-xs mt-1 ${
              formData.isError ? "text-red-500" : "text-gray-400"
            }`}
          >
            {formData.charCount}/1024 characters
            {formData.isError && " - Character limit exceeded!"}
          </p>
        </div>

        {/* Buttons with right-side handles */}
        <div className="space-y-3">
          {formData.buttons.map((button) => (
            <div key={button.id} className="space-y-1 relative">
              <div className="flex items-center gap-2 pr-6">
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) =>
                    handleButtonTextChange(button.id, e.target.value)
                  }
                  placeholder="Button text"
                  className={`w-full border ${
                    button.isError
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } rounded px-3 py-2 text-sm focus:outline-none focus:ring-1`}
                  maxLength={20}
                />
                <button
                  onClick={() => removeButton(button.id)}
                  className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>

                {/* Right-side source handle per button */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`btn-${button.id}`}
                  isConnectable={isConnectable}
                  style={{
                    background: "white",
                    border: "2px solid rgb(7, 141, 238)",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    position: "absolute",
                    right: 0,
                    top: "25%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
              <p
                className={`text-xs pl-6 ${
                  button.isError ? "text-red-500" : "text-gray-400"
                }`}
              >
                Enter button text here, {button.charCount}/20 characters allowed
              </p>
            </div>
          ))}
        </div>

        {/* Add Button */}
        {formData.buttons.length < 3 && (
          <button
            type="button"
            onClick={addButton}
            className="w-full flex items-center justify-center gap-2 text-blue-500 border border-blue-500 rounded-lg py-2 hover:bg-blue-50 transition-colors text-sm font-medium mt-2  cursor-pointer"
          >
            <span className="text-xl">+</span> Add Button
          </button>
        )}
      </div>

      {/* Added Contents */}
      {contents.length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Added Contents:</h3>
          {contents.map((content) => {
            const ContentComponent = contentComponents[content.type];
            return (
              <div key={content.id} className="relative">
                {ContentComponent ? (
                  <div className="relative">
                    <ContentComponent
                      data={content.data}
                      isConnectable={isConnectable}
                    />
                    <button
                      onClick={() =>
                        setContents((prev) =>
                          prev.filter((c) => c.id !== content.id)
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      style={{
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {content.type} (No component available)
                      </span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          setContents((prev) =>
                            prev.filter((c) => c.id !== content.id)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
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

        {/* Dropdown Menu */}
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

      {/* Left-side target handle */}
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

export default TextButtonNode;
