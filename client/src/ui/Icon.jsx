/**
 * Icon Wrapper Component
 * Provides consistent icon sizing and styling throughout the app
 */

import React from 'react';

export function Icon({ 
  icon: IconComponent, 
  size = 'md', 
  color = 'currentColor',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  return IconComponent ? (
    <IconComponent 
      className={`${sizeClasses[size]} ${className}`}
      color={color}
      {...props}
    />
  ) : null;
}

/**
 * Icon Button Component
 * Combines icon with button functionality
 */
export function IconButton({
  icon: IconComponent,
  size = 'md',
  variant = 'ghost',
  onClick,
  className = '',
  disabled = false,
  title,
  ...props
}) {
  const baseClasses = 'flex items-center justify-center rounded-lg transition-all duration-200';
  
  const sizeClasses = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
    lg: 'p-3 w-12 h-12',
  };

  const variantClasses = {
    ghost: 'hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
    primary: 'bg-[var(--color-accent)] text-white hover:shadow-lg hover:scale-105',
    secondary: 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-card)]',
    danger: 'text-red-500 hover:bg-red-500/10',
  };

  const iconSizes = { sm: 'sm', md: 'md', lg: 'lg' };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      <Icon icon={IconComponent} size={iconSizes[size]} />
    </button>
  );
}
