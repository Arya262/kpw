import { useState, useRef, useEffect } from "react";
import { HelpCircle, Info, AlertCircle } from "lucide-react";

const Tooltip = ({
  content,
  children,
  variant = "help",
  position = "top",
  maxWidth = "200px",
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const getIcon = () => {
    switch (variant) {
      case "info":
        return <Info size={14} className="text-blue-500" />;
      case "warning":
        return <AlertCircle size={14} className="text-amber-500" />;
      default:
        return <HelpCircle size={14} className="text-gray-400" />;
    }
  };

  const tooltipClasses = `
    absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg 
    transition-opacity duration-200 pointer-events-none
    ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}
    ${
      {
        help: "bg-gray-900 text-white",
        info: "bg-blue-600 text-white",
        warning: "bg-amber-500 text-white",
      }[variant]
    }
    ${
      {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
      }[position]
    }
  `;

  const arrowClasses = `
    absolute w-2 h-2 rotate-45
    ${
      {
        help: "bg-gray-900",
        info: "bg-blue-600",
        warning: "bg-amber-500",
      }[variant]
    }
    ${
      {
        top: "top-full left-1/2 -translate-x-1/2 -mt-1",
        bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
        left: "left-full top-1/2 -translate-y-1/2 -ml-1",
        right: "right-full top-1/2 -translate-y-1/2 -mr-1",
      }[position]
    }
  `;

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children || getIcon()}
      </div>

      <div className={tooltipClasses} style={{ maxWidth }}>
        {content}
        <div className={arrowClasses} />
      </div>
    </div>
  );
};

export const QuickTooltip = ({ text, children }) => (
  <Tooltip content={text} variant="help">
    {children}
  </Tooltip>
);

export const InfoTooltip = ({ text, children }) => (
  <Tooltip content={text} variant="info">
    {children}
  </Tooltip>
);

export const WarningTooltip = ({ text, children }) => (
  <Tooltip content={text} variant="warning">
    {children}
  </Tooltip>
);

export default Tooltip;
