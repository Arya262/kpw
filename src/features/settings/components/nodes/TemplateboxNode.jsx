import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Handle, Position } from "reactflow";
import { Plus } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle, contentAreaClasses } from "./nodeStyles";

const TemplateboxNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(data?.selectedTemplate || null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const modalRef = useRef(null);

  // Sample templates - replace with your actual templates from API
  const templates = [
    { id: 'welcome', name: 'Welcome Template', description: 'Welcome new users' },
    { id: 'order-confirmation', name: 'Order Confirmation', description: 'Confirm order details' },
    { id: 'shipping-update', name: 'Shipping Update', description: 'Notify shipping status' },
    { id: 'promotional', name: 'Promotional', description: 'Marketing messages' },
    { id: 'reminder', name: 'Reminder', description: 'Send reminders' },
  ];

  useEffect(() => {
    if (data && !initialized) {
      setSelectedTemplate(data.selectedTemplate || null);
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    if (initialized && data?.updateNodeData) {
      data.updateNodeData(id, { selectedTemplate });
    }
  }, [selectedTemplate, id, initialized, data]);

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
    setShowTemplateModal(false);
  };

  const handleRemoveTemplate = () => {
    setSelectedTemplate(null);
  };

  const getPreviewData = () => ({
    selectedTemplate,
    templateId: selectedTemplate?.id,
    templateName: selectedTemplate?.name
  });

  return (
    <div style={nodeContainerStyle} className="p-4">
      <NodeHeader
        title="Template"
        icon="📄"
        onPreview={() => onPreviewRequest?.(id, 'template')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      {/* Add Template Button */}
      <div className={contentAreaClasses}>
        {!selectedTemplate ? (
          <button 
            onClick={handleAddTemplate}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-400 text-blue-600 text-sm py-3 px-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus size={18} />
            Add Template
          </button>
        ) : (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{selectedTemplate.name}</div>
                <div className="text-sm text-gray-600 mt-1">{selectedTemplate.description}</div>
                <div className="text-xs text-blue-600 mt-2">ID: {selectedTemplate.id}</div>
              </div>
              <button
                onClick={handleRemoveTemplate}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                title="Remove template"
              >
                ×
              </button>
            </div>
            <button
              onClick={handleAddTemplate}
              className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Template
            </button>
          </div>
        )}
      </div>

      {/* Template Selection Modal - Rendered using Portal */}
      {showTemplateModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onMouseDown={(e) => {
            // Only close if clicking the backdrop, not the modal
            if (e.target === e.currentTarget) {
              setShowTemplateModal(false);
            }
          }}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {template.id}</div>
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
        </div>,
        document.body
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-handle"
        isConnectable={isConnectable}
        style={sourceHandleStyle}
      />
    </div>
  );
};

export default TemplateboxNode;
