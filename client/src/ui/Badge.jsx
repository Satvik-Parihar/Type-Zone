import { useTheme } from '../context/ThemeContext';

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) {
  const variants = {
    primary: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30',
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    error: 'bg-[var(--color-error)]/20 text-[var(--color-error)] border border-[var(--color-error)]/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    muted: 'bg-[var(--color-muted)]/20 text-[var(--color-muted)] border border-[var(--color-muted)]/30',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-block font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
