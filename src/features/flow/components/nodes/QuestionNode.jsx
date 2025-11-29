import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Trash2, Plus } from "lucide-react";
import NodeHeader from "../ui/NodeHeader";
import FormInput from "../forms/FormInput";
import FormTextarea from "../forms/FormTextarea";
import FormSection from "../forms/FormSection";
import { nodeContainerStyle, targetHandleStyle, sourceHandleStyle } from "./nodeStyles";
import { CHAR_LIMITS } from "../../constants/nodeConstants";

const QuestionNode = ({ data, isConnectable, id, onPreviewRequest, onDelete, onDuplicate }) => {
  const [formData, setFormData] = useState({
    questionText: data?.questionText || "",
    customField: data?.customField || "",
    validationType: data?.validationType || "None",
    isMediaAccepted: data?.isMediaAccepted || false,
    expectedAnswers: data?.expectedAnswers || []
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setFormData({
        questionText: data.questionText || "",
        customField: data.customField || "",
        validationType: data.validationType || "None",
        isMediaAccepted: data.isMediaAccepted || false,
        expectedAnswers: data.expectedAnswers || []
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (data?.updateNodeData) {
      data.updateNodeData(id, formData);
    }
  }, [formData, id, initialized, data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExpectedAnswer = () => {
    if (formData.expectedAnswers.length >= 5) return;
    
    setFormData(prev => ({
      ...prev,
      expectedAnswers: [
        ...prev.expectedAnswers,
        {
          id: `answer-${Date.now()}`,
          expectedInput: "",
          isDefault: false,
          nodeResultId: ""
        }
      ]
    }));
  };

  const updateExpectedAnswer = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      expectedAnswers: prev.expectedAnswers.map((answer, i) => 
        i === index ? { ...answer, [field]: value } : answer
      )
    }));
  };

  const removeExpectedAnswer = (index) => {
    setFormData(prev => ({
      ...prev,
      expectedAnswers: prev.expectedAnswers.filter((_, i) => i !== index)
    }));
  };

  const getPreviewData = () => {
    return {
      questionText: formData.questionText,
      customField: formData.customField,
      validationType: formData.validationType,
      isMediaAccepted: formData.isMediaAccepted,
      expectedAnswers: formData.expectedAnswers
    };
  };

  return (
    <div style={nodeContainerStyle}>
      <NodeHeader
        title="Question"
        icon="❓"
        subtitle="Ask a question and collect response"
        onPreview={() => onPreviewRequest?.(id, 'ask-question')}
        onDuplicate={() => onDuplicate?.(id)}
        onDelete={() => onDelete?.(id)}
      />

      <div className="space-y-4">
        {/* Question Message */}
        <FormTextarea
          label="Question Message"
          value={formData.questionText}
          onChange={(e) => handleInputChange('questionText', e.target.value)}
          placeholder="What is your name?"
          maxLength={CHAR_LIMITS.BODY}
          rows={3}
          required
          helpText="The question you want to ask the user"
          showCounter={true}
        />

        {/* Data Collection Settings */}
        <FormSection title="Data Collection" icon="💾" defaultOpen={true}>
          <FormInput
            label="Custom Field Name"
            value={formData.customField}
            onChange={(e) => handleInputChange('customField', e.target.value)}
            placeholder="e.g., user_name, email, phone"
            required
            helpText="Field name to store the user's response"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Validation Type
            </label>
            <select 
              value={formData.validationType}
              onChange={(e) => handleInputChange('validationType', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
            >
              <option value="None">No Validation</option>
              <option value="Text">Text Only</option>
              <option value="Number">Number Only</option>
              <option value="Email">Email Address</option>
              <option value="Phone">Phone Number</option>
              <option value="Regex">Custom Regex</option>
            </select>
            <p className="text-xs text-gray-500">Validate user response format</p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="mediaAccepted"
              checked={formData.isMediaAccepted}
              onChange={(e) => handleInputChange('isMediaAccepted', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="mediaAccepted" className="text-sm text-gray-700 cursor-pointer">
              Accept media files (images, videos, documents)
            </label>
          </div>
        </FormSection>

        {/* Expected Answers Section */}
        <FormSection 
          title="Expected Answers" 
          icon="✅" 
          badge={formData.expectedAnswers.length > 0 ? formData.expectedAnswers.length : null}
          defaultOpen={formData.expectedAnswers.length > 0}
        >
          {formData.expectedAnswers.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">No expected answers defined</p>
              <p className="text-xs text-gray-400">Add specific answers to create conditional flows</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.expectedAnswers.map((answer, index) => (
                <div key={answer.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`Answer ${index + 1} (e.g., "yes", "no")`}
                    value={answer.expectedInput}
                    onChange={(e) => updateExpectedAnswer(index, 'expectedInput', e.target.value)}
                    className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                  />
                  <button
                    onClick={() => removeExpectedAnswer(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove answer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={addExpectedAnswer}
            disabled={formData.expectedAnswers.length >= 5}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
              text-blue-600 bg-blue-50 border-2 border-blue-200 border-dashed
              rounded-lg hover:bg-blue-100 hover:border-blue-300 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all text-sm font-medium"
          >
            <Plus size={16} />
            Add Expected Answer ({formData.expectedAnswers.length}/5)
          </button>
        </FormSection>
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

export default QuestionNode;
