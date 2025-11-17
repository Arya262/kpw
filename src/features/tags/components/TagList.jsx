import React from "react";
import TagBadge from "./TagBadge";

const TagList = ({ 
  tags = [], 
  size = "sm", 
  showRemove = false, 
  onRemove = null,
  maxDisplay = null,
  className = "",
  emptyMessage = "No tags"
}) => {
  if (!tags || tags.length === 0) {
    return (
      <span className={`text-gray-400 text-sm italic ${className}`}>
        {emptyMessage}
      </span>
    );
  }

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  return (
    <div className={`flex flex-wrap gap-1 items-center ${className}`}>
      {displayTags.map((tag, index) => (
        <TagBadge
          key={tag.tag_id || tag.id || index}
          tag={tag}
          size={size}
          showRemove={showRemove}
          onRemove={onRemove}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default TagList;