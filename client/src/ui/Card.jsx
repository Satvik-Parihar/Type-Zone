import { useTheme } from '../context/ThemeContext';

export function Card({ 
  children, 
  className = '', 
  header,
  footer,
  variant = 'default',
  interactive = false,
  ...props 
}) {
  const { theme } = useTheme();

  const variantStyles = {
    default: {
      border: '1px solid #1e293b',
      background: 'linear-gradient(180deg, #0f172a, #020617)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    },
    elevated: {
      border: '1px solid #1e293b',
      background: 'linear-gradient(180deg, #0f172a, #020617)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
    },
    outlined: {
      border: '2px solid #38BDF8',
      backgroundColor: 'transparent',
      borderRadius: '16px',
      padding: '28px'
    },
    glass: {
      border: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '28px'
    }
  };

  const style = {
    borderRadius: '16px',
    padding: '28px',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    ...(interactive && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 15px 50px rgba(0,0,0,0.5)'
      }
    }),
    ...variantStyles[variant]
  };

  return (
    <div style={style} className={className} {...props}>
      {header && <div style={{ marginBottom: '16px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>{header}</div>}
      <div>{children}</div>
      {footer && <div style={{ marginTop: '16px', borderTop: '1px solid #1E293B', paddingTop: '16px' }}>{footer}</div>}
    </div>
  );
}
