import React, { useState } from "react";
import { Trash2, Copy, Plus } from "lucide-react";

const TemplateboxPreview = () => {
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contents, setContents] = useState([]);

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
    <>
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
      <div className="border-2 border-red-300 rounded-lg p-4 space-y-4">
        <button className="w-full flex items-center justify-center gap-1 border border-blue-400 text-blue-600 text-sm py-1 px-2 rounded hover:bg-blue-50">
          <Plus size={14} />
          Add Template
        </button>
      </div>
    </div>
         
  <div className="mt-4 relative">
    <button
      onClick={() => setShowContentMenu((prev) => !prev)}
      className="w-full flex justify-center items-center gap-2 border border-blue-500 text-blue-500 font-medium rounded-lg py-2 hover:bg-blue-50 transition"
    >
      <span className="text-xl">＋</span> Add Content
    </button>

    {/* Dropdown Menu */}
    {showContentMenu && (
      <div className="absolute z-10 left-0 mt-2 w-full bg-white rounded-xl shadow-md p-4 border">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          Choose Content Type
        </h3>
        <div className="space-y-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleContentSelect(type.id)}
              className="flex items-center gap-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-md"
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
    </>
    
  );
};

export default TemplateboxPreview;
