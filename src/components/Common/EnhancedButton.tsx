import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  mobileOptimized?: boolean; // New prop for mobile optimization
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  className = '',
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  ariaLabel,
  title,
  mobileOptimized = false,
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Mobile-optimized classes for touch interaction
  const mobileClasses = mobileOptimized
    ? 'touch-manipulation select-none active:scale-95 transition-transform duration-150'
    : '';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500',
    secondary: 'bg-white text-purple-700 hover:bg-purple-100 focus:ring-purple-500',
    ghost: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 focus:ring-purple-500',
  };

  // Enhanced size classes with mobile-optimized touch targets
  const sizeClasses = {
    sm: mobileOptimized ? 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm rounded-md' : 'px-3 py-1.5 text-sm rounded-md',
    md: mobileOptimized ? 'min-h-[48px] min-w-[48px] px-5 py-3 text-sm rounded-lg' : 'px-4 py-2 text-sm rounded-lg',
    lg: mobileOptimized ? 'min-h-[56px] min-w-[56px] px-6 py-4 text-base rounded-lg' : 'px-6 py-3 text-base rounded-lg',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${mobileClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      aria-label={ariaLabel}
      title={title}
    >
      {loading ? (
        <div className={`${iconSizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
      ) : (
        <>
          {Icon && (
            <Icon className={`${iconSizeClasses[size]} ${children ? 'mr-2' : ''}`} />
          )}
          {children}
        </>
      )}
    </button>
  );
};

// Badge component for notifications, cart count, etc.
interface BadgeProps {
  count: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'default',
  className = ''
}) => {
  if (count <= 0) return null;

  const variantClasses = {
    default: 'bg-neutral-900 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-orange-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`absolute -top-1 -right-1 h-4 w-4 text-xs rounded-full flex items-center justify-center font-medium ${variantClasses[variant]} ${className}`}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
};

// Tooltip component for enhanced UX
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'bottom'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-neutral-900 rounded-md whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-neutral-900 rotate-45 ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
                'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`} />
        </motion.div>
      )}
    </div>
  );
};
