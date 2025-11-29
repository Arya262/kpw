import { Plus, Inbox, Search, AlertCircle } from 'lucide-react';

/**
 * EmptyState component for displaying helpful messages when no content exists
 * Guides users on what to do next
 */
const EmptyState = ({
  icon: CustomIcon,
  title,
  description,
  action,
  actionLabel,
  variant = 'default', // 'default', 'search', 'error'
  size = 'md', // 'sm', 'md', 'lg'
}) => {
  const variants = {
    default: {
      icon: Inbox,
      iconColor: 'text-gray-400',
      titleColor: 'text-gray-700',
      descColor: 'text-gray-500',
    },
    search: {
      icon: Search,
      iconColor: 'text-blue-400',
      titleColor: 'text-gray-700',
      descColor: 'text-gray-500',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-400',
      titleColor: 'text-gray-700',
      descColor: 'text-gray-500',
    },
  };

  const sizes = {
    sm: {
      container: 'py-4',
      icon: 32,
      title: 'text-sm',
      desc: 'text-xs',
    },
    md: {
      container: 'py-6',
      icon: 40,
      title: 'text-base',
      desc: 'text-sm',
    },
    lg: {
      container: 'py-8',
      icon: 48,
      title: 'text-lg',
      desc: 'text-base',
    },
  };

  const config = variants[variant] || variants.default;
  const sizeConfig = sizes[size] || sizes.md;
  const Icon = CustomIcon || config.icon;

  return (
    <div className={`text-center ${sizeConfig.container} bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg`}>
      <Icon
        size={sizeConfig.icon}
        className={`mx-auto mb-3 ${config.iconColor}`}
      />
      
      {title && (
        <p className={`font-medium ${config.titleColor} ${sizeConfig.title} mb-1`}>
          {title}
        </p>
      )}
      
      {description && (
        <p className={`${config.descColor} ${sizeConfig.desc} mb-4 max-w-sm mx-auto`}>
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * Quick variants for common use cases
 */
export const NoItemsState = ({ itemName = 'items', onAdd, addLabel }) => (
  <EmptyState
    title={`No ${itemName} yet`}
    description={`Get started by adding your first ${itemName.toLowerCase()}`}
    action={onAdd}
    actionLabel={addLabel || `Add ${itemName}`}
    size="sm"
  />
);

export const NoResultsState = ({ searchTerm }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your search'}
    size="sm"
  />
);

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description={message || 'An error occurred while loading content'}
    action={onRetry}
    actionLabel="Try Again"
    size="sm"
  />
);

export default EmptyState;
