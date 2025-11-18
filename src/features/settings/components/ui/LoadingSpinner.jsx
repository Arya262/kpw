/**
 * LoadingSpinner component for displaying loading states
 * Provides visual feedback during async operations
 */
const LoadingSpinner = ({
  size = 'md', // 'sm', 'md', 'lg'
  color = 'blue', // 'blue', 'gray', 'white'
  text,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const colors = {
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Inline loading spinner for buttons
 */
export const ButtonSpinner = () => (
  <LoadingSpinner size="sm" color="white" />
);

/**
 * Loading overlay for sections
 */
export const LoadingOverlay = ({ text = 'Loading...' }) => (
  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
    <LoadingSpinner size="md" text={text} />
  </div>
);

/**
 * Skeleton loader for content
 */
export const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: `${100 - i * 10}%` }}
      />
    ))}
  </div>
);

export default LoadingSpinner;
