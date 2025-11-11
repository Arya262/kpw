import React from "react";

const Tooltip = ({ 
  children, 
  text, 
  position = "bottom",
  className = "" 
}) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900",
    bottom: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 border-4 border-transparent border-b-gray-900",
    left: "absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900",
    right: "absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-gray-900",
  };

  return (
    <div className={`relative group ${className}`}>
      {children}
      {text && (
        <div
          className={`absolute ${positionClasses[position]} px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50`}
        >
          {text}
          <div className={arrowClasses[position]}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
