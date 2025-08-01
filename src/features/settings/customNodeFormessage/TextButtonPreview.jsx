import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Handle, Position } from "reactflow";

const TextButtonPreview = ({ data, isConnectable, onHandlesChange }) => {
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

    const newNode = {
      id: `node-${Date.now()}`,
      type: contentType, // Must match a registered node type like "text-button"
      position: { x: 250, y: 100 }, // You may want to dynamically set this
      data: {
        message: "",
        buttons: [],
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div
      className="relative rounded-2xl overflow-visible transition-all"
      style={{
        backgroundColor: "rgb(244, 246, 248)",
        boxShadow:
          "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        border: "1px solid transparent",
        backgroundImage: "none",
        borderRadius: "16px",
        transition: "border 0.3s, border-radius 0.3s",
      }}
    >
      <div className="border-2 border-red-500 rounded-lg p-4 space-y-4">
        {/* Message Textarea */}
        <div>
          <textarea
            className="w-full max-w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
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
                    button.isError ? "border-red-500" : "border-gray-300"
                  } rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  maxLength={20}
                />
                <button
                  onClick={() => removeButton(button.id)}
                  className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Right-side source handle per button - MOVED OUTSIDE flex container */}
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
                  right: -6,
                  top: "25%",
                  transform: "translateY(-50%)",
                }}
              />
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
            className="w-full flex items-center justify-center gap-2 text-blue-500 border border-blue-500 rounded-lg py-2 hover:bg-blue-50 transition-colors text-sm font-medium mt-2"
          >
            <span className="text-xl">+</span> Add Button
          </button>
        )}
      </div>
    </div>
  );
};

export default TextButtonPreview;
