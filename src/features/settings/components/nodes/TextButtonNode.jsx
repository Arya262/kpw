import { memo, useCallback, useMemo, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Plus } from "lucide-react";
import { useNodeData } from "../../hooks/useNodeData";
import { useButtonManager } from "../../hooks/useButtonManager";
import NodeHeader from "../ui/NodeHeader";
import FormTextarea from "../forms/FormTextarea";
import FormInput from "../forms/FormInput";
import ButtonInput from "../forms/ButtonInput";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const TextButtonNode = memo(({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  // Initialize form data
  const initializeFormData = useCallback((data) => ({
    text: data?.text || data?.interactiveButtonsBody || "",
    delay: typeof data?.delay === "number" ? data.delay : "",
  }), []);

  const [formData, setFormData] = useNodeData(data, id, initializeFormData);

  // Initialize buttons
const initialButtons = useMemo(() => {
  return (data?.buttons || data?.interactiveButtonsItems || []).map(btn => ({
    id: btn.id || crypto.randomUUID(),
    text: btn.text || btn.buttonText || "",
    charCount: (btn.text || btn.buttonText || "").length,
    isError: (btn.text || btn.buttonText || "").length > CHAR_LIMITS.BUTTON_TEXT,
    nodeResultId: btn.nodeResultId || "",
  }));
}, [data?.buttons, data?.interactiveButtonsItems]);

  const { buttons, addButton, removeButton, updateButtonText } = 
  useButtonManager(initialButtons, CHAR_LIMITS.MAX_BUTTONS, CHAR_LIMITS.BUTTON_TEXT);


  // Update parent when buttons change
useEffect(() => {
  data?.updateNodeData?.(id, {
    text: formData.text,
    delay: Number(formData.delay),
    interactiveButtonsBody: formData.text,
    interactiveButtonsItems: buttons.map(btn => ({
      id: btn.id,
      buttonText: btn.text,
      nodeResultId: btn.nodeResultId || "",
    })),
  });
}, [formData.text, formData.delay, buttons]);


  // Handlers
  const handleTextChange = useCallback((e) => {
    const text = e.target.value;
    setFormData(prev => ({ ...prev, text }));
  }, [setFormData]);

const handleDelayChange = useCallback((e) => {
  let value = Number(e.target.value);
  if (isNaN(value)) value = 0;
  value = Math.max(0, value);
  setFormData(prev => ({ ...prev, delay: value }));
}, [setFormData]);

  const getPreviewData = useCallback(() => ({
    interactiveButtonsBody: formData.text,
    interactiveButtonsItems: buttons.map(btn => ({
      id: btn.id,
      text: btn.text,
      buttonText: btn.text,
      nodeResultId: btn.nodeResultId || "",
    })),
    delay: Number(formData.delay),
  }), [formData, buttons]);

  const handlePreview = useCallback(() => {
    console.log('🎯 TextButtonNode handlePreview called');
    console.log('onPreviewRequest exists?', !!onPreviewRequest);
    if (onPreviewRequest) {
      console.log('📤 Sending node ID for live preview:', id);
      onPreviewRequest(id, 'text-button');
    } else {
      console.error('❌ onPreviewRequest is not defined!');
    }
  }, [onPreviewRequest, id]);

  const charCount = formData.text.length;
  const textError = charCount > CHAR_LIMITS.BODY ? `Text exceeds ${CHAR_LIMITS.BODY} characters` : null;

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Text Button"
        icon="💬"
        subtitle="Send text message with interactive buttons"
        onPreview={handlePreview}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Message Text */}
        <FormTextarea
          label="Message Text"
          value={formData.text}
          onChange={handleTextChange}
          placeholder="Enter your message here... You can use *bold*, _italic_, ~strikethrough~"
          maxLength={CHAR_LIMITS.BODY}
          rows={4}
          required
          helpText="This is the main message text that will be sent to the user. Supports WhatsApp formatting."
          error={textError}
          showCounter={true}
        />

        {/* Buttons Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Interactive Buttons
              {buttons.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">({buttons.length}/{CHAR_LIMITS.MAX_BUTTONS})</span>
              )}
            </label>
          </div>

          {buttons.length === 0 && (
            <div className="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">No buttons added yet</p>
              <p className="text-xs text-gray-400">Add up to {CHAR_LIMITS.MAX_BUTTONS} interactive buttons</p>
            </div>
          )}

          {buttons.map((button, index) => (
            <ButtonInput
              key={button.id}
              button={button}
              index={index}
              totalButtons={buttons.length}
              onTextChange={updateButtonText}
              onRemove={removeButton}
              isConnectable={isConnectable}
              placeholder={`Button ${index + 1} (e.g., "Yes", "No", "Learn More")`}
            />
          ))}

          {buttons.length < CHAR_LIMITS.MAX_BUTTONS && (
            <button
              type="button"
              onClick={addButton}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed
                rounded-lg hover:bg-blue-100 hover:border-blue-300 
                transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Add Button ({buttons.length}/{CHAR_LIMITS.MAX_BUTTONS})
            </button>
          )}
        </div>

        {/* Delay Input */}
        <FormInput
          label="Delay (Optional)"
          type="number"
          value={formData.delay}
          onChange={handleDelayChange}
          placeholder="0"
          min="0"
          helpText="Wait time in seconds before sending this message"
        />
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
      {buttons.length === 0 && (
        <Handle
          type="source"
          position={Position.Right}
          id="right-handle"
          isConnectable={isConnectable}
          style={sourceHandleStyle}
          className="hover:scale-125 transition-transform"
        />
      )}
    </div>
  );
});

TextButtonNode.displayName = 'TextButtonNode';

export default TextButtonNode;
