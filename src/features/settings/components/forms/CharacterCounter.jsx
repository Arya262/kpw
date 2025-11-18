import { getCharCountColor } from '../nodes/nodeStyles';

/**
 * Enhanced character counter with visual progress and color-coded feedback
 */
const CharacterCounter = ({ 
  count, 
  limit, 
  warningThreshold,
  showRemaining = false,
  showProgress = false,
  className = ''
}) => {
  const colorClass = getCharCountColor(count, limit, warningThreshold);
  const remaining = limit - count;
  const percentage = Math.min((count / limit) * 100, 100);
  
  const getProgressColor = () => {
    if (count > limit) return 'bg-red-500';
    if (count > (warningThreshold || limit * 0.9)) return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className={`space-y-1 ${className}`}>
      {showProgress && (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <p className={`text-xs font-medium ${colorClass}`}>
        {count}/{limit}
        {showRemaining && remaining >= 0 && ` (${remaining} left)`}
        {count > limit && ' ⚠️ Limit exceeded!'}
      </p>
    </div>
  );
};

export default CharacterCounter;
