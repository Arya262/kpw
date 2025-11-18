import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { Handle, Position } from "reactflow";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const ListNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    header: "",
    body: "",
    footer: "",
    sections: [],
  });
  const [initialized, setInitialized] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        header: data.listHeader || "",
        body: data.listBody || "",
        footer: data.listFooter || "",
        sections: data.listSections || [],
      });
      setInitialized(true);
    }
  }, [data, initialized]);
  // Update parent when data changes
  useEffect(() => {
    if (!initialized) return;
    if (data?.updateNodeData) {
      data.updateNodeData(id, {
        listHeader: formData.header,
        listBody: formData.body,
        listFooter: formData.footer,
        listSections: formData.sections,
      });
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSection = () => {
    if (formData.sections.length >= 10) return;
    
    setFormData(prev => ({
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
    setFormData(prev => ({
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
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          return { ...section, items: section.items.filter((item) => item.id !== itemId) };
        }
        return section;
      }),
    }));
  };

  const removeSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const getPreviewData = () => {
    return {
      header: formData.header,
      body: formData.body,
      footer: formData.footer,
      sections: formData.sections
    };
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Interactive List"
        icon="📋"
        subtitle="Create a list menu with options"
        onPreview={() => onPreviewRequest?.(id, 'list')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Message Content */}
        <FormSection title="Message Content" icon="💬" defaultOpen={true}>
          <FormInput
            label="Button Text"
            value={formData.header}
            onChange={handleInputChange}
            name="header"
            placeholder="e.g., View Menu, Select Option"
            maxLength={20}
            required
            helpText="Text shown on the list button (max 20 chars)"
          />

          <FormTextarea
            label="Body Text"
            value={formData.body}
            onChange={handleInputChange}
            name="body"
            placeholder="Choose from the options below..."
            maxLength={CHAR_LIMITS.BODY}
            rows={3}
            required
            helpText="Main message text"
            showCounter={true}
          />

          <FormInput
            label="Footer Text"
            value={formData.footer}
            onChange={handleInputChange}
            name="footer"
            placeholder="Optional footer text"
            maxLength={CHAR_LIMITS.FOOTER}
            helpText="Small text at the bottom (optional)"
          />
        </FormSection>

        {/* List Sections */}
        <FormSection 
          title="List Sections" 
          icon="📑" 
          badge={formData.sections.length > 0 ? formData.sections.length : null}
          defaultOpen={true}
        >
          {formData.sections.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">No sections added yet</p>
              <p className="text-xs text-gray-400">Add sections to organize list items</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-3 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-gray-500">
                      Section {sectionIndex + 1}
                    </span>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remove section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder={`Section title (e.g., "Main Dishes", "Drinks")`}
                        maxLength={24}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                        value={section.title}
                        onChange={(e) => {
                          const newSections = formData.sections.map((s) =>
                            s.id === section.id ? { ...s, title: e.target.value } : s
                          );
                          const newFormData = { ...formData, sections: newSections };
                          setFormData(newFormData);
                          
                          if (data.updateNodeData) {
                            data.updateNodeData(data.id, {
                              listHeader: newFormData.header,
                              listBody: newFormData.body,
                              listFooter: newFormData.footer,
                              listSections: newFormData.sections,
                            });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {section.title.length}/24 characters
                      </p>
                    </div>

                    {/* List Items */}
                    {section.items.length === 0 ? (
                      <div className="text-center py-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-xs text-gray-500">No items yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-2 relative bg-gray-50 hover:bg-white transition-colors">
                            <Handle
                              type="source"
                              position={Position.Right}
                              id={`item-${item.id}-source`}
                              isConnectable={isConnectable}
                              className="!w-3 !h-3 !right-[-6px] !top-1/2 !-translate-y-1/2 !bg-white !border-2 !border-blue-500 hover:!scale-125 transition-transform"
                            />
                            
                            <button
                              onClick={(e) => removeItemFromSection(section.id, item.id, e)}
                              className="absolute top-1 right-1 p-1 text-red-500 hover:bg-red-100 rounded transition-colors z-10"
                              title="Remove item"
                            >
                              <Trash2 size={12} />
                            </button>
                            
                            <div className="space-y-2 pr-6">
                              <input
                                type="text"
                                placeholder={`Item ${itemIndex + 1} title`}
                                maxLength={24}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
                                  const newFormData = { ...formData, sections: updatedSections };
                                  setFormData(newFormData);
                                  
                                  if (data.updateNodeData) {
                                    data.updateNodeData(data.id, {
                                      listHeader: newFormData.header,
                                      listBody: newFormData.body,
                                      listFooter: newFormData.footer,
                                      listSections: newFormData.sections,
                                    });
                                  }
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                maxLength={72}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
                                  const newFormData = { ...formData, sections: updatedSections };
                                  setFormData(newFormData);
                                  
                                  if (data.updateNodeData) {
                                    data.updateNodeData(data.id, {
                                      listHeader: newFormData.header,
                                      listBody: newFormData.body,
                                      listFooter: newFormData.footer,
                                      listSections: newFormData.sections,
                                    });
                                  }
                                }}
                              />
                              <p className="text-xs text-gray-400">
                                {item.title.length}/24 • {item.description.length}/72
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => addItemToSection(section.id)}
                      className="w-full py-2 text-blue-600 bg-blue-50 border border-blue-200 border-dashed rounded-lg font-medium text-xs hover:bg-blue-100 transition flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addSection}
            disabled={formData.sections.length >= 10}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
              text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed
              rounded-lg hover:bg-blue-100 hover:border-blue-300 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Add Section ({formData.sections.length}/10)
          </button>
        </FormSection>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>💡 Tip:</strong> Each list item can trigger a different flow path when selected
          </p>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
        className="hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default ListNode;
