import React from "react";

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  name,
  autoComplete = "off",
  className = "",
  error = "",
  touched = false,
}) => {
  const hasError = error && touched;
  
  const baseClassName = `w-full border p-2 rounded-md text-gray-700 h-[38px] focus:outline-none focus:ring-1 transition-all duration-150 ease-in-out ${className}`;
  
  const borderClassName = hasError 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-[#05A3A3] focus:ring-[#05A3A3]";
    
  const disabledClassName = disabled 
    ? "border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400" 
    : "";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${baseClassName} ${borderClassName} ${disabledClassName}`}
        required={required}
        disabled={disabled}
        name={name}
        autoComplete={autoComplete}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
