import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Collapsible form section for better organization
 */
const FormSection = ({
  title,
  children,
  defaultOpen = true,
  badge,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="font-medium text-sm text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t border-gray-200 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;
