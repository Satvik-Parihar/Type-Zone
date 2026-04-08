import React from 'react';
import './Button.css';

/**
 * Professional Button Component
 * Variants: primary, secondary, ghost, danger, success
 * Sizes: sm, base, lg
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon: IconComponent = null,
  iconPosition = 'left',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-loader" aria-hidden="true" />}
      <span className={`btn-content ${loading ? 'btn-content-hidden' : ''}`}>
        {IconComponent &&iconPosition === 'left' && <IconComponent className="btn-icon" />}
        {children}
        {IconComponent && iconPosition === 'right' && <IconComponent className="btn-icon" />}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;
