import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Trash2, Plus } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const MultiProductNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    header: data?.header || "",
    body: data?.body || "",
    footer: data?.footer || "",
    sections: data?.sections || []
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        header: data.header || "",
        body: data.body || "",
        footer: data.footer || "",
        sections: data.sections || []
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    if (initialized && data?.updateNodeData) {
      data.updateNodeData(id, formData);
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
          products: []
        }
      ]
    }));
  };

  const removeSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const getPreviewData = () => formData;

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Multi Product"
        icon="🛒"
        subtitle="Showcase multiple products"
        onPreview={() => onPreviewRequest?.(id, 'multi-product')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Message Content */}
        <FormSection title="Message Content" icon="💬" defaultOpen={true}>
          <FormInput
            label="Header"
            value={formData.header}
            onChange={(e) => handleInputChange('header', e.target.value)}
            placeholder="e.g., Our Products"
            maxLength={CHAR_LIMITS.HEADER}
            helpText="Short header text for the message"
          />

          <FormTextarea
            label="Body Text"
            value={formData.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            placeholder="Check out our latest products..."
            maxLength={CHAR_LIMITS.BODY}
            rows={3}
            required
            helpText="Main message text"
            showCounter={true}
          />

          <FormTextarea
            label="Footer Text"
            value={formData.footer}
            onChange={(e) => handleInputChange('footer', e.target.value)}
            placeholder="e.g., Limited stock available"
            maxLength={CHAR_LIMITS.FOOTER}
            rows={2}
            helpText="Small text at the bottom"
            showCounter={true}
          />
        </FormSection>

        {/* Product Sections */}
        <FormSection 
          title="Product Sections" 
          icon="📦" 
          badge={formData.sections.length > 0 ? formData.sections.length : null}
          defaultOpen={true}
        >
          {formData.sections.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">No sections added yet</p>
              <p className="text-xs text-gray-400">Add sections to organize your products</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-3 bg-white hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Section {index + 1}</span>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remove section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={`Section title (e.g., "Electronics", "Clothing")`}
                    value={section.title}
                    onChange={(e) => {
                      const newSections = formData.sections.map(s =>
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      );
                      setFormData(prev => ({ ...prev, sections: newSections }));
                    }}
                    className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                  />
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

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>💡 Tip:</strong> Each section can contain multiple products. Configure products in your WhatsApp Business catalog.
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
      <Handle
        type="source"
        position={Position.Right}
        id="right-handle"
        isConnectable={isConnectable}
        style={sourceHandleStyle}
        className="hover:scale-125 transition-transform"
      />
    </div>
  );
};

export default MultiProductNode;
