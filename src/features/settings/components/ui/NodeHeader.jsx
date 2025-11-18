import React from 'react';
import { Trash2, Copy, Eye } from 'lucide-react';
import { buttonClasses } from '../nodes/nodeStyles';

/**
 * Standardized node header component
 * Provides consistent header with title and action buttons
 */
const NodeHeader = ({
  title,
  icon,
  onPreview,
  onDuplicate,
  onDelete,
  showPreview = true,
  showDuplicate = true,
  showDelete = true,
}) => {
  return (
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="flex gap-2">
        {showPreview && onPreview && (
          <button
            onClick={(e) => {
              console.log('👁️ Eye icon clicked in NodeHeader');
              e.stopPropagation();
              onPreview();
            }}
            className={buttonClasses.icon}
            title="Preview in WhatsApp"
            aria-label="Preview message"
          >
            <Eye size={16} className="text-blue-500" />
          </button>
        )}
        {showDuplicate && onDuplicate && (
          <button
            onClick={onDuplicate}
            className={buttonClasses.icon}
            title="Duplicate node"
            aria-label="Duplicate node"
          >
            <Copy size={16} className="text-gray-500 hover:text-blue-500" />
          </button>
        )}
        {showDelete && onDelete && (
          <button
            onClick={onDelete}
            className={buttonClasses.icon}
            title="Delete node"
            aria-label="Delete node"
          >
            <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeHeader;
