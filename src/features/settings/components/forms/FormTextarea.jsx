import { HelpCircle } from 'lucide-react';
import CharacterCounter from './CharacterCounter';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea';

/**
 * Enhanced textarea with label, help text, character counter, validation, and auto-resize
 */
const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  helpText,
  error,
  maxLength,
  rows = 3,
  showCounter = true,
  autoResize = true,
  minHeight,
  maxHeight,
  className = '',
  ...props
}) => {
  const hasError = !!error;
  const charCount = (value || '').length;

  // Calculate minHeight from rows if not provided
  const calculatedMinHeight = minHeight || rows * 24;

  // Use auto-resize hook if enabled
  const textareaRef = useAutoResizeTextarea(
    autoResize ? value : null,
    calculatedMinHeight,
    maxHeight
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
          {helpText && (
            <div className="group relative">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {helpText}
              </div>
            </div>
          )}
        </label>
      )}

      <textarea
        ref={autoResize ? textareaRef : null}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-3 py-2 text-sm border rounded-lg transition-all
          focus:outline-none focus:ring-2 focus:border-transparent
          resize-none
          ${hasError 
            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
          }
          ${className}`}
        style={{
          minHeight: `${calculatedMinHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: 'hidden', // Hook handles when to show scroll
        }}
        {...props}
      />

      <div className="flex justify-between items-center">
        {error ? (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        ) : (
          <div />
        )}

        {showCounter && maxLength && (
          <CharacterCounter count={charCount} limit={maxLength} />
        )}
      </div>
    </div>
  );
};

export default FormTextarea;
