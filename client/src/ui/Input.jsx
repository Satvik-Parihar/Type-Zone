import React from 'react';
import './Input.css';

/**
 * Professional Input Component
 * Sizes: sm, base, lg
 */
const Input = React.forwardRef(({
  label,
  error,
  icon: IconComponent,
  size = 'base',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className="input-container">
        {IconComponent && (
          <div className="input-icon">
            <IconComponent size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`input input-${size} ${IconComponent ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="input-error-text">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Professional Textarea Component
 * Sizes: sm, base, lg
 */
const Textarea = React.forwardRef(({
  label,
  error,
  size = 'base',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="textarea-wrapper">
      {label && (
        <label className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`textarea textarea-${size} ${error ? 'textarea-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="textarea-error-text">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input, Textarea };
export default Input;
