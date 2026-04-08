/**
 * Responsive Wrapper Component
 * Handles breakpoint-specific layouts
 */

export function ResponsiveGrid({ 
  children, 
  columns = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = ''
}) {
  const gridClasses = `gap-${gap}`;
  
  // Build responsive column classes
  const colClasses = [
    'grid',
    'grid-cols-1',
    columns.sm && 'sm:grid-cols-' + columns.sm,
    columns.md && 'md:grid-cols-' + columns.md,
    columns.lg && 'lg:grid-cols-' + columns.lg,
    columns.xl && 'xl:grid-cols-' + columns.xl,
  ].filter(Boolean).join(' ');

  return (
    <div className={`${colClasses} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveContainer({ children, className = '' }) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveText({ 
  children, 
  size = 'base',
  className = '' 
}) {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
