import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, useReactFlow } from "reactflow";
import { Plus, FileText, X, Search, Check } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import ButtonInput from "../forms/ButtonInput";
import { useNodeTemplate } from "../../hooks/useNodeTemplate";
import {
  nodeContainerStyle,
  targetHandleStyle,
  contentAreaClasses,
  sourceHandleStyle,
} from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const TemplateboxNode = ({
  data,
  isConnectable,
  id,
  onPreviewRequest,
  onDelete,
  onDuplicate,
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef(null);

  const { setEdges } = useReactFlow();

  // ===== Use your hook =====
  const {
    templates,
    loading,
    setSearchTerm: setTemplateSearchTerm,
    loadMoreTemplates,
    pagination,
  } = useNodeTemplate();

  // Always use data from props - single source of truth
  const selectedTemplate = data?.selectedTemplate || null;
  const buttons = useMemo(() => {
    // First try to use buttons from data
    if (data?.buttons && data.buttons.length > 0) {
      return data.buttons;
    }
    // Then try interactiveButtonsItems
    if (
      data?.interactiveButtonsItems &&
      data.interactiveButtonsItems.length > 0
    ) {
      return data.interactiveButtonsItems.map((item) => ({
        id: item.id || `btn-${Date.now()}-${Math.random()}`,
        text: item.buttonText || "",
        type: item.type || "QUICK_REPLY",
        charCount: (item.buttonText || "").length,
        isError: (item.buttonText || "").length > CHAR_LIMITS.BUTTON_TEXT,
        isTemplateButton: item.isTemplateButton || false,
        nodeResultId: item.nodeResultId || "",
      }));
    }
    return [];
  }, [data?.buttons, data?.interactiveButtonsItems]);

  // Filter templates by search (showing all approved templates)
  const filteredTemplates = useMemo(() => {
    // Only show approved templates
    let approvedTemplates = templates.filter(
      (template) => template.status?.toLowerCase() === "approved"
    );
    
    if (!searchTerm) return approvedTemplates;

    return approvedTemplates.filter(
      (template) =>
        template.element_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        template.data?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.sub_category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);
  const removeNodeEdges = useCallback(() => {
    setEdges((edges) =>
      edges.filter(
        (edge) =>
          edge.source !== id && !edge.sourceHandle?.includes(`btn-`)
      )
    );
  }, [id, setEdges]);
  // Initialize template and buttons when data changes
  useEffect(() => {
    if (
      data?.selectedTemplate &&
      !data.buttons &&
      !data.interactiveButtonsItems
    ) {
      // Only initialize if we have a template but no buttons data
      const templateButtons =
        data.selectedTemplate?.container_meta?.buttons ||
        data.selectedTemplate?.buttons ||
        [];

      const newButtons =
        templateButtons.length > 0
          ? templateButtons.map((btn, index) => ({
              id: `template-${data.selectedTemplate.id}-btn-${index}`,
              text: btn.text || btn.buttonText || "",
              type: btn.type || "QUICK_REPLY",
              charCount: (btn.text || btn.buttonText || "").length,
              isError:
                (btn.text || btn.buttonText || "").length >
                CHAR_LIMITS.BUTTON_TEXT,
              isTemplateButton: true,
              nodeResultId: btn.nodeResultId || "",
            }))
          : [
              {
                id: `default-${Date.now()}`,
                text: "",
                type: "QUICK_REPLY",
                charCount: 0,
                isError: false,
                isTemplateButton: false,
                nodeResultId: "",
              },
            ];

      // Update parent with initialized buttons
      if (data?.updateNodeData) {
        data.updateNodeData(id, {
          selectedTemplate: data.selectedTemplate,
          buttons: newButtons,
          interactiveButtonsItems: newButtons.map((btn) => ({
            id: btn.id,
            buttonText: btn.text,
            type: btn.type,
            nodeResultId: btn.nodeResultId || "",
            isTemplateButton: btn.isTemplateButton,
          })),
        });
      }
    }
  }, [
    data?.selectedTemplate,
    data?.buttons,
    data?.interactiveButtonsItems,
    id,
    data,
  ]);

  // Modal outside click / escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target))
        setShowTemplateModal(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowTemplateModal(false);
    };
    if (showTemplateModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showTemplateModal]);

  const handleAddTemplate = () => {
    setShowTemplateModal(true);
    removeNodeEdges();
  };

  const handleTemplateSelect = (template) => {
    const templateButtons =
      template?.container_meta?.buttons || template?.buttons || [];

    const newButtons =
      templateButtons.length > 0
        ? templateButtons.map((btn, index) => ({
            id: `template-${template.id}-btn-${index}`,
            text: btn.text || btn.buttonText || "",
            type: btn.type || "QUICK_REPLY",
            charCount: (btn.text || btn.buttonText || "").length,
            isError:
              (btn.text || btn.buttonText || "").length >
              CHAR_LIMITS.BUTTON_TEXT,
            isTemplateButton: true,
            nodeResultId: btn.nodeResultId || "",
          }))
        : [
            {
              id: `default-${Date.now()}`,
              text: "",
              type: "QUICK_REPLY",
              charCount: 0,
              isError: false,
              isTemplateButton: false,
              nodeResultId: "",
            },
          ];

    // Update parent immediately
    if (data?.updateNodeData) {
      data.updateNodeData(id, {
        selectedTemplate: template,
        buttons: newButtons,
        interactiveButtonsItems: newButtons.map((btn) => ({
          id: btn.id,
          buttonText: btn.text,
          type: btn.type,
          nodeResultId: btn.nodeResultId || "",
          isTemplateButton: btn.isTemplateButton,
        })),
      });
    }

    setShowTemplateModal(false);
  };

  const handleRemoveTemplate = () => {
    if (data?.updateNodeData) {
      data.updateNodeData(id, {
        selectedTemplate: null,
        buttons: [],
        interactiveButtonsItems: [],
      });
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setTemplateSearchTerm(value);
  };

  // Button handlers - update parent data immediately
  const handleButtonTextChange = useCallback(
    (buttonId, newText) => {
      if (!data?.updateNodeData) return;

      const updatedButtons = buttons.map((btn) =>
        btn.id === buttonId && !btn.isTemplateButton
          ? {
              ...btn,
              text: newText,
              charCount: newText.length,
              isError: newText.length > CHAR_LIMITS.BUTTON_TEXT,
            }
          : btn
      );

      data.updateNodeData(id, {
        selectedTemplate,
        buttons: updatedButtons,
        interactiveButtonsItems: updatedButtons.map((btn) => ({
          id: btn.id,
          buttonText: btn.text,
          type: btn.type,
          nodeResultId: btn.nodeResultId || "",
          isTemplateButton: btn.isTemplateButton,
        })),
      });
    },
    [buttons, selectedTemplate, id, data]
  );

  const handleButtonConnectionChange = useCallback(
    (buttonId, nodeResultId) => {
      if (!data?.updateNodeData) return;

      const updatedButtons = buttons.map((btn) =>
        btn.id === buttonId ? { ...btn, nodeResultId } : btn
      );

      data.updateNodeData(id, {
        selectedTemplate,
        buttons: updatedButtons,
        interactiveButtonsItems: updatedButtons.map((btn) => ({
          id: btn.id,
          buttonText: btn.text,
          type: btn.type,
          nodeResultId: btn.nodeResultId || "",
          isTemplateButton: btn.isTemplateButton,
        })),
      });
    },
    [buttons, selectedTemplate, id, data]
  );

  const handleButtonDelete = useCallback(
    (buttonId) => {
      const btnToDelete = buttons.find((btn) => btn.id === buttonId);
      if (
        btnToDelete &&
        !btnToDelete.isTemplateButton &&
        data?.updateNodeData
      ) {
        setEdges((edges) =>
          edges.filter(
            (edge) =>
              !(
                edge.source === id && edge.sourceHandle === `btn-${buttonId}`
              )
          )
        );

        const filteredButtons = buttons.filter((b) => b.id !== buttonId);
        const updatedButtons =
          filteredButtons.length === 0 && selectedTemplate
            ? [
                {
                  id: `default-${Date.now()}`,
                  text: "",
                  type: "QUICK_REPLY",
                  charCount: 0,
                  isError: false,
                  isTemplateButton: false,
                  nodeResultId: "",
                },
              ]
            : filteredButtons;

        data.updateNodeData(id, {
          selectedTemplate,
          buttons: updatedButtons,
          interactiveButtonsItems: updatedButtons.map((btn) => ({
            id: btn.id,
            buttonText: btn.text,
            type: btn.type,
            nodeResultId: btn.nodeResultId || "",
            isTemplateButton: btn.isTemplateButton,
          })),
        });
      }
    },
    [buttons, selectedTemplate, id, data, setEdges]
  );

  const getPreviewData = useCallback(
    () => ({
      selectedTemplate,
      buttons: buttons.map((btn) => ({
        id: btn.id,
        text: btn.text,
        buttonText: btn.text,
        type: btn.type,
        isTemplateButton: btn.isTemplateButton,
        nodeResultId: btn.nodeResultId || "",
      })),
      interactiveButtonsItems: buttons.map((btn) => ({
        id: btn.id,
        buttonText: btn.text,
        type: btn.type,
        nodeResultId: btn.nodeResultId || "",
        isTemplateButton: btn.isTemplateButton,
      })),
    }),
    [selectedTemplate, buttons]
  );

  const handlePreview = useCallback(() => {
    if (onPreviewRequest) onPreviewRequest(id, "template", getPreviewData());
  }, [onPreviewRequest, id, getPreviewData]);

  const hasButtons = buttons.length > 0;
  const hasTemplateButtons = buttons.some((btn) => btn.isTemplateButton);
  const buttonHandles = useMemo(
    () =>
      buttons.map((btn, index) => ({
        id: `btn-${btn.id}`,
        position: Position.Right,
        style: { ...sourceHandleStyle, top: `${20 + index * 60}px` },
      })),
    [buttons]
  );

  const canLoadMore = pagination.hasMore && !loading;

  return (
    <div style={nodeContainerStyle} className="p-4">
      <NodeHeader
        title="Template"
        icon="📄"
        onPreview={handlePreview}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className={contentAreaClasses}>
        {!selectedTemplate ? (
          <button
            onClick={handleAddTemplate}
            className="w-full flex items-center justify-center gap-3 p-6 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Plus size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-blue-700">Add Template</div>
              <div className="text-sm text-blue-500 mt-0.5">
                Select a WhatsApp template
              </div>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 bg-white/50 rounded-lg p-3 mb-1 border border-gray-100">
                    {selectedTemplate.container_meta?.data ||
                      selectedTemplate.data}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddTemplate}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-all duration-200"
              >
                <Plus size={16} /> Change Template
              </button>
            </div>

            {hasButtons && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <label className="text-sm font-semibold text-gray-800">
                      {hasTemplateButtons
                        ? "Template Buttons"
                        : "Interactive Buttons"}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {buttons.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {buttons.map((button, index) => (
                    <ButtonInput
                      key={button.id}
                      button={button}
                      index={index}
                      totalButtons={buttons.length}
                      onTextChange={handleButtonTextChange}
                      onConnectionChange={handleButtonConnectionChange}
                      onDelete={handleButtonDelete}
                      isConnectable={isConnectable}
                      placeholder={
                        button.isTemplateButton
                          ? `${button.type || "Button"} ${index + 1}`
                          : "Enter button text"
                      }
                      readOnly={button.isTemplateButton}
                      nodeId={id}
                      handleId={`btn-${button.id}`}
                    />
                  ))}
                </div>

                {hasTemplateButtons && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    Template buttons are read-only
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showTemplateModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div
              ref={modalRef}
              className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl transform animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Select Template
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Choose an approved WhatsApp template
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Templates */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                      Loading templates...
                    </span>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No approved templates found
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or create approved templates first
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => {
                      const templateBtnCount =
                        template.container_meta?.buttons?.length || 0;
                      const isSelected = selectedTemplate?.id === template.id;
                      return (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group hover:border-blue-300 hover:shadow-md ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                  {template.element_name}
                                </h3>
                                {isSelected && (
                                  <Check
                                    size={16}
                                    className="text-blue-600 flex-shrink-0"
                                  />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {template.data}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {template.sub_category && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 uppercase">
                                  {template.sub_category}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {templateBtnCount} btn
                                {templateBtnCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Load More */}
                {canLoadMore && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={loadMoreTemplates}
                      className="px-6 py-2 text-sm font-medium text-white  rounded-lg bg-teal-500 hover:bg-teal-600 transition-all"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-handle"
        isConnectable={isConnectable}
        style={targetHandleStyle}
      />
    </div>
  );
};

export default TemplateboxNode;
