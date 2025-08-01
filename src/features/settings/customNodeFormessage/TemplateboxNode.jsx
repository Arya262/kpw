import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Copy,
  MousePointerClick,
  Video,
  List,
  Box,
  Boxes,
  LayoutTemplate,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Handle, Position } from "reactflow";

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

const TemplateboxNode = ({ isConnectable = true }) => {
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const modalRef = useRef(null);

  // Sample templates - replace with your actual templates
  const templates = [
    { id: 'welcome', name: 'Welcome Template' },
    { id: 'order-confirmation', name: 'Order Confirmation' },
    { id: 'shipping-update', name: 'Shipping Update' },
    { id: 'promotional', name: 'Promotional' },
  ];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowTemplateModal(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowTemplateModal(false);
      }
    };

    if (showTemplateModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showTemplateModal]);

  const handleAddTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Here you would typically load the template content
    // For now, we'll just add it to the contents
    const newContent = {
      id: `template-${Date.now()}`,
      type: 'template',
      data: {
        templateId: template.id,
        name: template.name,
        // Add other template data as needed
      },
    };
    setContents([...contents, newContent]);
    setShowTemplateModal(false);
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
    <div className="bg-white rounded-xl shadow-md p-4 w-64 relative border border-[#e3eaf3]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700 text-sm">Template</h2>
        <div className="flex gap-2">
          <button aria-label="Delete Node">
            <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
          </button>
          <button aria-label="Duplicate Node">
            <Copy size={16} className="text-gray-500 hover:text-blue-500" />
          </button>
        </div>
      </div>

      {/* Add Template Button */}
      <div className="border-2  border-red-300 rounded-lg p-4 space-y-4 mb-4">
        <button 
          onClick={handleAddTemplate}
          className="w-full flex items-center justify-center gap-1 border border-blue-400 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Template
        </button>
      </div>

      {/* Add Content Button */}
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

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-dialog-title"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 id="template-dialog-title" className="text-lg font-semibold text-gray-800">
                Select a Template
              </h3>
            </div>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors active:scale-[0.98]"
                >
                  <div className="font-medium text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-500 mt-1">ID: {template.id}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{selectedTemplate.name}</div>
              <div className="text-xs text-blue-600">Template ID: {selectedTemplate.id}</div>
            </div>
            <button 
              onClick={() => setSelectedTemplate(null)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Render selected content previews */}
      {contents.map((content) => {
        const ContentComponent = contentComponents[content.type];
        return (
          <div key={content.id} className="mt-4">
            {ContentComponent ? <ContentComponent data={content.data} isConnectable={isConnectable} /> : null}
          </div>
        );
      })}

      {/* Left-side target handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        className="!right-[-12px]"
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

export default TemplateboxNode;
