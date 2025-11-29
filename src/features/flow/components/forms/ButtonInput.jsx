import { Trash2 } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import CharacterCounter from './CharacterCounter';
import { CHAR_LIMITS } from '../../constants/nodeConstants';
import { getSourceHandleStyle } from '../nodes/nodeStyles';

const ButtonInput = ({
  button,
  index,
  totalButtons,
  onTextChange,
  onRemove,
  isConnectable,
  placeholder,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={button.text}
              onChange={(e) => onTextChange(button.id, e.target.value)}
              placeholder={placeholder || `Button ${index + 1}`}
              maxLength={CHAR_LIMITS.BUTTON_TEXT}
              className={`nodrag w-full px-3 py-2.5 pr-10 text-sm border rounded-lg transition-all
                focus:outline-none focus:ring-2 focus:border-transparent
                ${button.isError 
                  ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
                }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className={`text-xs font-medium ${
                button.isError ? 'text-red-500' : 'text-gray-400'
              }`}>
                {button.charCount || 0}/{CHAR_LIMITS.BUTTON_TEXT}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(button.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Remove button"
            aria-label={`Remove button ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Source handle for button connection */}
        <Handle
          type="source"
          position={Position.Right}
          id={`btn-${button.id}`}
          isConnectable={isConnectable}
          style={getSourceHandleStyle(index, totalButtons)}
          className="hover:scale-125 transition-transform"
        />
      </div>
      
      {button.isError && (
        <p className="text-xs text-red-600 ml-1 flex items-center gap-1">
          <span>⚠️</span> Button text too long
        </p>
      )}
    </div>
  );
};

export default ButtonInput;
