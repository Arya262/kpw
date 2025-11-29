import { useState } from "react";
import { Tag } from "lucide-react";
import { getTagName, getTagColor } from "../utils/tagUtils";

const TagList = ({
  tags = [],
  size = "sm",
  maxDisplay = 2,
  emptyMessage = "No tags",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!tags || tags.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs whitespace-nowrap">
        <Tag size={11} className="opacity-40" />
        <span className="opacity-70">{emptyMessage}</span>
      </span>
    );
  }

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px]",
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const displayTags = tags.slice(0, maxDisplay);
  const hiddenTags = tags.slice(maxDisplay);
  const remainingCount = hiddenTags.length;

  return (
    <div className="flex items-center gap-1 flex-nowrap">
      {displayTags.map((tag, index) => {
        const tagName = getTagName(tag);
        const tagColor = getTagColor(tag);

        return (
          <span
            key={tag?.id || tag?.tag_id || `tag-${index}`}
            className={`inline-block rounded font-medium truncate max-w-[70px] ${sizeClasses[size] || sizeClasses.sm}`}
            style={{
              backgroundColor: `${tagColor}20`,
              color: tagColor,
              border: `1px solid ${tagColor}40`,
            }}
            title={tagName}
          >
            {tagName}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <div className="relative">
          <span
            className={`inline-block rounded bg-gray-100 text-gray-600 font-medium border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors ${sizeClasses[size] || sizeClasses.sm}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            +{remainingCount}
          </span>
          
          {/* Tooltip showing hidden tags */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                <div className="flex flex-col gap-1.5 min-w-[100px] max-w-[180px]">
                  {hiddenTags.map((tag, index) => {
                    const tagName = getTagName(tag);
                    const tagColor = getTagColor(tag);
                    return (
                      <span
                        key={tag?.id || tag?.tag_id || `hidden-${index}`}
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-medium truncate"
                        style={{
                          backgroundColor: `${tagColor}30`,
                          color: tagColor,
                        }}
                        title={tagName}
                      >
                        {tagName}
                      </span>
                    );
                  })}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagList;
