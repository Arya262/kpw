import React, { useState } from "react";
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

const ListNode = ({ data, isConnectable }) => {
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
  const [items, setItems] = useState([]);
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { title: "", description: "", id: Date.now() },
    ]);
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
          items: [],
        },
      ],
    }));
  };

  const addItemToSection = (sectionId) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            items: [
              ...section.items,
              {
                id: `item-${Date.now()}`,
                title: "",
                description: "",
              },
            ],
          }
          : section
      ),
    }));
  };

  const removeItemFromSection = (sectionId, itemId, e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    const updatedSections = formData.sections.map((section) => {
      if (section.id === sectionId) {
        const filteredItems = section.items.filter((item) => item.id !== itemId);
        return { ...section, items: filteredItems };
      }
      return section;
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeSection = (id) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== id),
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
    const handleClickOutside = (e) => {
      if (showContentMenu) {
        setShowContentMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showContentMenu]);

  return (
 <div
  className="relative rounded-2xl p-4 overflow-visible border border-transparent transition-all hover:border-blue-500"
  style={{
    color: 'var(--palette-text-primary)',
    backgroundColor: 'rgb(244, 246, 248)',
    boxShadow:
      'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
    minWidth: '330px',
    maxWidth: '345px',
    zIndex: 0,
    backgroundImage: 'none',
    borderRadius: '16px',
    transition: 'border 0.3s, border-radius 0.3s',
  }}
>
      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">List</h3>
        <div className="flex gap-2">
          <Copy size={16} className="cursor-pointer text-gray-500" />
          <Trash2 size={16} className="cursor-pointer text-red-500" />
        </div>
      </div>

      {/* Content Area */}
      <div
        className= "border-2 border-red-300 rounded-lg p-4 space-y-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Header <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="header"
              value={formData.header}
              onChange={handleInputChange}
              placeholder="Enter header text"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              maxLength={20}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.header.length}/20 characters
          </p>
        </div>

        {/* Body Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body <span className="text-red-500">*</span>
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            placeholder="Enter message body"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all min-h-[80px]"
            rows={3}
            maxLength={1024}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.body.length}/1024 characters
          </p>
        </div>

        {/* Footer Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Footer
          </label>
          <input
            type="text"
            name="footer"
            value={formData.footer}
            onChange={handleInputChange}
            placeholder="Enter footer text (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            maxLength={60}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.footer.length}/60 characters
          </p>
        </div>

        {/* Sections */}
        {formData.sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className="mb-3 p-4 border border-red-300 rounded-lg bg-white"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Section {sectionIndex + 1}
              </h3>
              <button
                onClick={() => removeSection(section.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Section Title */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  maxLength={24}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={section.title}
                  onChange={(e) => {
                    const newSections = formData.sections.map((s) =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    );
                    setFormData({ ...formData, sections: newSections });
                  }}
                />
                <p className="text-xs text-gray-400 mt-1 text-start">
                  Enter section title here, only {section.title.length}/24 characters
                  allowed.
                </p>
              </div>

              {/* Items in this section */}
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 mb-3 relative bg-white hover:bg-gray-50 transition-colors">
                  {/* Right-side source handle per item */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`item-${item.id}-source`}
                    isConnectable={isConnectable}
                    className="!w-3 !h-3 !right-[-6px] !top-1/2 !-translate-y-1/2 !bg-white !border-2 !border-blue-500"
                  />
                  
                  {/* Delete Item Button */}
                  <button
                    onClick={(e) => removeItemFromSection(section.id, item.id, e)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Title"
                        maxLength={24}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={item.title}
                        onChange={(e) => {
                          const updatedSections = formData.sections.map((s) => {
                            if (s.id === section.id) {
                              const updatedItems = s.items.map((it) =>
                                it.id === item.id ? { ...it, title: e.target.value } : it
                              );
                              return { ...s, items: updatedItems };
                            }
                            return s;
                          });
                          setFormData({ ...formData, sections: updatedSections });
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-start">
                        Enter title here, only {item.title.length}/24 characters allowed.
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Enter Description"
                        maxLength={72}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={item.description}
                        onChange={(e) => {
                          const updatedSections = formData.sections.map((s) => {
                            if (s.id === section.id) {
                              const updatedItems = s.items.map((it) =>
                                it.id === item.id ? { ...it, description: e.target.value } : it
                              );
                              return { ...s, items: updatedItems };
                            }
                            return s;
                          });
                          setFormData({ ...formData, sections: updatedSections });
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-start">
                        Enter description here, only {item.description.length}/72 characters allowed.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Item Button */}
              <button
                onClick={() => addItemToSection(section.id)}
                className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <button
          onClick={addSection}
          disabled={formData.sections.length >= 10}
          className={`w-full py-2 text-blue-600 border border-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition mb-3 flex items-center justify-center gap-2 ${formData.sections.length >= 10
              ? "opacity-50 cursor-not-allowed"
              : ""
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
          className="w-full flex justify-center items-center gap-2 border border-blue-500 text-blue-500 font-medium rounded-lg py-2 hover:bg-blue-50 transition"
        >
          <span className="text-xl">＋</span> Add Content
        </button>

        {/* Dropdown Menu */}
        {showContentMenu && (
          <div className="absolute z-10 left-0 mt-2 w-full bg-white rounded-xl shadow-md p-4 ">
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

export default ListNode;
