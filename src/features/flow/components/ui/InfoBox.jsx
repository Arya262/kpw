import { Info, AlertCircle, CheckCircle, Lightbulb, Zap } from 'lucide-react';

/**
 * InfoBox component for displaying contextual information, tips, and alerts
 * Provides visual feedback and guidance to users
 */
const InfoBox = ({
  children,
  variant = 'info', // 'info', 'tip', 'success', 'warning', 'feature'
  icon: CustomIcon,
  title,
  className = '',
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: Info,
      iconColor: 'text-blue-500',
    },
    tip: {
      container: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: Lightbulb,
      iconColor: 'text-amber-500',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      container: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700',
      icon: AlertCircle,
      iconColor: 'text-orange-500',
    },
    feature: {
      container: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700',
      icon: Zap,
      iconColor: 'text-purple-500',
    },
  };

  const config = variants[variant] || variants.info;
  const Icon = CustomIcon || config.icon;

  return (
    <div className={`border rounded-lg p-3 ${config.container} ${className}`}>
      <div className="flex gap-2">
        <Icon size={16} className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          {title && (
            <p className={`text-xs font-semibold ${config.text} mb-1`}>
              {title}
            </p>
          )}
          <div className={`text-xs ${config.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Quick variants for common use cases
 */
export const TipBox = ({ children, title = '💡 Tip' }) => (
  <InfoBox variant="tip" title={title}>
    {children}
  </InfoBox>
);

export const InfoNote = ({ children, title }) => (
  <InfoBox variant="info" title={title}>
    {children}
  </InfoBox>
);

export const SuccessBox = ({ children, title = '✅ Success' }) => (
  <InfoBox variant="success" title={title}>
    {children}
  </InfoBox>
);

export const WarningBox = ({ children, title = '⚠️ Warning' }) => (
  <InfoBox variant="warning" title={title}>
    {children}
  </InfoBox>
);

export const FeatureBox = ({ children, title = '✨ Feature' }) => (
  <InfoBox variant="feature" title={title}>
    {children}
  </InfoBox>
);

export default InfoBox;
