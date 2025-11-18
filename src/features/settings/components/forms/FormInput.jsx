import { HelpCircle } from 'lucide-react';

const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  helpText,
  error,
  maxLength,
  className = '',
  ...props
}) => {
  const hasError = !!error;
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
          {helpText && (
            <div className="group relative">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {helpText}
              </div>
            </div>
          )}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2 text-sm border rounded-lg transition-all
          focus:outline-none focus:ring-2 focus:border-transparent
          ${hasError 
            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
          }
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
