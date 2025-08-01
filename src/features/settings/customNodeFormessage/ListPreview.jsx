import React, { useState } from "react";
import { Trash2, Copy, MousePointerClick, Video, List, Box, Boxes, LayoutTemplate, ChevronDown, Plus, } from "lucide-react";
import { Handle, Position } from "reactflow";
import TextButtonPreview from "./TextButtonPreview";


const ListPreview = ({ data, isConnectable }) => {
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({
    header: "",
    body: "",
    footer: "",
    sections: [],
  });
  const [isDragging, setIsDragging] = useState(false);

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
      },
    };
    setContents([...contents, newContent]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `section-${Date.now()}`,
          title: "",
          description: "",
        },
      ],
    }));
  };

  const removeSection = (id) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop if needed
  };

  // Close content menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showContentMenu) {
        setShowContentMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContentMenu]);

  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative">
      {/* Node Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />

      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-medium">List</h2>
        <div className="flex gap-2">
          <Copy size={16} className="cursor-pointer text-gray-500 hover:text-gray-700" />
          <Trash2 size={16} className="cursor-pointer text-red-500 hover:text-red-700" />
        </div>
      </div>

      {/* Content Area */}
      <div 
        className={`border-2 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-red-400'} rounded-lg p-4 transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              name="header"
              value={formData.header}
              onChange={handleInputChange}
              placeholder="Enter Header"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              maxLength={20}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
          Enter header here, only {formData.header.length}/20 characters allowed.
          </p>
        </div>

        {/* Body Input */}
        <div className="mb-4">
          <textarea
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            placeholder="Enter Body"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all min-h-[80px]"
            rows={3}
            maxLength={1024}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
          Enter body here, only {formData.body.length}/1024 characters allowed.
          </p>
        </div>

        {/* Footer Input */}
        <div className="mb-4">
          <input
            type="text"
            name="footer"
            value={formData.footer}
            onChange={handleInputChange}
            placeholder="Enter Footer"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            maxLength={60}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
          Enter footer here, only {formData.footer.length}/60 characters allowed.
          </p>
        </div>

        {/* Sections */}
        {formData.sections.map((section, index) => (
          <div key={section.id} className="mb-3 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Section {index + 1}</h3>
              <button 
                onClick={() => removeSection(section.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={section.title}
                  onChange={(e) => {
                    const newSections = formData.sections.map((s) =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    );
                    setFormData({ ...formData, sections: newSections });
                  }}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                   {section.title.length}/24 characters
                </p>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter description"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none min-h-[80px]"
                  value={section.description}
                  onChange={(e) => {
                    const newSections = formData.sections.map((s) =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    );
                    setFormData({ ...formData, sections: newSections });
                  }}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {section.description.length}/72 characters
                </p>
              </div> */}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <button
          onClick={addSection}
          disabled={formData.sections.length >= 10}
          className={`w-full py-2 text-blue-600 border border-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition mb-3 flex items-center justify-center gap-2 ${
            formData.sections.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus size={16} />
          Add Section
        </button>
        {formData.sections.length > 0 && (
          <p className="text-xs text-gray-400 text-center mb-3">
            {formData.sections.length} of 10 sections added
          </p>
        )}

        <button className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed opacity-50">
          Open List
        </button>
      </div>

      {/* Add Content Button */}
      <div className="mt-4 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowContentMenu(!showContentMenu);
          }}
          className="text-blue-600 font-medium text-sm flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-100 w-full"
        >
          <Plus size={16} className="flex-shrink-0" />
          <span>Add Content</span>
          <ChevronDown size={16} className="flex-shrink-0 ml-auto" />
        </button>

        {/* Content Type Dropdown */}
        {showContentMenu && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="p-1">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleContentSelect(type.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPreview;
