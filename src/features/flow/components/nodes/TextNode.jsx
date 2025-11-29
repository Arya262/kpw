import { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { useNodeData } from "../../hooks/useNodeData";
import NodeHeader from "../ui/NodeHeader";
import FormTextarea from "../forms/FormTextarea";
import FormInput from "../forms/FormInput";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const TextNode = memo(({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  // Initialize form data
  const initializeFormData = useCallback((data) => ({
    text: data?.text || "",
    delay: typeof data?.delay === "number" ? data.delay : "",
  }), []);

  const [formData, setFormData] = useNodeData(data, id, initializeFormData);

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

  const handlePreview = useCallback(() => {
    if (onPreviewRequest) {
      onPreviewRequest(id, 'text');
    }
  }, [onPreviewRequest, id]);

  const charCount = formData.text.length;
  const textError = charCount > CHAR_LIMITS.BODY ? `Text exceeds ${CHAR_LIMITS.BODY} characters` : null;

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Text Message"
        icon="💬"
        subtitle="Send a simple text message"
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
});

TextNode.displayName = 'TextNode';

export default TextNode;
