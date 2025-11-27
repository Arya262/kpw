import { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Plus } from "lucide-react";
import { useButtonManager } from "../../hooks/useButtonManager";
import NodeHeader from "../ui/NodeHeader";
import FormTextarea from "../forms/FormTextarea";
import FormInput from "../forms/FormInput";
import ButtonInput from "../forms/ButtonInput";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const TextButtonNode = memo(({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {

  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    delay: "",
  });

  // Initialize buttons from data
  const initialButtons = data?.buttons || data?.interactiveButtonsItems || [];

  const {
    buttons,
    addButton,
    removeButton,
    updateButtonText,
    canAddMore,
  } = useButtonManager(initialButtons, CHAR_LIMITS.MAX_BUTTONS, CHAR_LIMITS.BUTTON_TEXT);

  // Initialize form data once
  useEffect(() => {
    if (!data || initialized) return;

    setFormData({
      text: data.text || data.interactiveButtonsBody || "",
      delay: typeof data.delay === "number" ? data.delay : "",
    });

    setInitialized(true);
  }, [data, initialized]);

  // Single useEffect to update ALL node data together
  useEffect(() => {
    if (!initialized || !data?.updateNodeData) return;

    data.updateNodeData(id, {
      text: formData.text,
      delay: Number(formData.delay) || 0,
      interactiveButtonsBody: formData.text,
      buttons: buttons,
    });
  }, [formData, buttons, initialized, id, data]);

  const handleTextChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, text: e.target.value }));
  }, []);

  const handleDelayChange = useCallback((e) => {
    let value = Number(e.target.value);
    if (isNaN(value)) value = 0;
    value = Math.max(0, value);
    setFormData(prev => ({ ...prev, delay: value }));
  }, []);

  const handlePreview = useCallback(() => {
    onPreviewRequest?.(id, 'text-button');
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
        <FormTextarea
          label="Message Text"
          value={formData.text}
          onChange={handleTextChange}
          placeholder="Enter your message..."
          maxLength={CHAR_LIMITS.BODY}
          rows={4}
          required
          error={textError}
          showCounter
        />

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Interactive Buttons ({buttons.length}/{CHAR_LIMITS.MAX_BUTTONS})
          </label>

          {buttons.map((button, index) => (
            <ButtonInput
              key={button.id}
              button={button}
              index={index}
              totalButtons={buttons.length}
              onTextChange={updateButtonText}
              onRemove={removeButton}
              isConnectable={isConnectable}
              placeholder={`Button ${index + 1}`}
            />
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={addButton}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed
                rounded-lg hover:bg-blue-100 transition-all"
            >
              <Plus size={16} />
              Add Button
            </button>
          )}
        </div>

        <FormInput
          label="Delay (Optional)"
          type="number"
          value={formData.delay}
          onChange={handleDelayChange}
          placeholder="0"
        />
      </div>

      <Handle type="target" position={Position.Left} id="left-handle" isConnectable={isConnectable} style={targetHandleStyle} />

      {buttons.length === 0 && (
        <Handle type="source" position={Position.Right} id="right-handle" isConnectable={isConnectable} style={sourceHandleStyle} />
      )}
    </div>
  );
});

TextButtonNode.displayName = 'TextButtonNode';

export default TextButtonNode;
