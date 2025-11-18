/**
 * Badge component for displaying counts, status, and labels
 * Provides visual indicators throughout the UI
 */
const Badge = ({
  children,
  variant = 'default', // 'default', 'primary', 'success', 'warning', 'error', 'info'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

/**
 * Count badge for displaying numbers
 */
export const CountBadge = ({ count, max, variant = 'primary' }) => {
  const displayCount = max && count > max ? `${max}+` : count;
  const badgeVariant = max && count >= max ? 'warning' : variant;
  
  return (
    <Badge variant={badgeVariant} size="sm">
      {displayCount}
    </Badge>
  );
};

/**
 * Status badge for displaying status
 */
export const StatusBadge = ({ status, label }) => {
  const statusVariants = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    error: 'error',
    draft: 'info',
  };

  return (
    <Badge variant={statusVariants[status] || 'default'} size="sm">
      {label || status}
    </Badge>
  );
};

/**
 * New badge for highlighting new features
 */
export const NewBadge = () => (
  <Badge variant="primary" size="sm">
    New
  </Badge>
);

/**
 * Required badge for required fields
 */
export const RequiredBadge = () => (
  <Badge variant="error" size="sm">
    Required
  </Badge>
);

/**
 * Optional badge for optional fields
 */
export const OptionalBadge = () => (
  <Badge variant="default" size="sm">
    Optional
  </Badge>
);

export default Badge;
