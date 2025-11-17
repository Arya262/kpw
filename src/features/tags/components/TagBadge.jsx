import React from "react";
import { X } from "lucide-react";

const TagBadge = ({ 
  tag, 
  size = "sm", 
  showRemove = false, 
  onRemove = null,
  className = "",
  style = {}
}) => {
  const tagName = tag?.tag_name || tag?.name || "Unknown";
  const tagColor = tag?.tag_color || tag?.color || "#0AA89E";
  
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const removeIconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: `${tagColor}20`, 
        color: tagColor,
        ...style
      }}
    >
      {tagName}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${tagName} tag`}
        >
          <X size={removeIconSizes[size]} />
        </button>
      )}
    </span>
  );
};

export default TagBadge;