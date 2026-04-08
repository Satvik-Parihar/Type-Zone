import { createContext, useContext, useCallback, useState } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ 
    message, 
    type = 'info', 
    duration = 4000,
    action = null,
    actionLabel = 'Undo'
  }) => {
    const id = toastId++;
    const newToast = { id, message, type, action, actionLabel };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = {
    addToast,
    removeToast,
    toasts,
    success: (message, options = {}) => addToast({ message, type: 'success', ...options }),
    error: (message, options = {}) => addToast({ message, type: 'error', ...options }),
    warning: (message, options = {}) => addToast({ message, type: 'warning', ...options }),
    info: (message, options = {}) => addToast({ message, type: 'info', ...options }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none sm:bottom-6 sm:right-6">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  const { removeToast } = useToast();

  const typeConfig = {
    success: {
      bg: 'bg-green-500/90',
      icon: CheckCircle,
      border: 'border-green-400',
    },
    error: {
      bg: 'bg-red-500/90',
      icon: AlertCircle,
      border: 'border-red-400',
    },
    warning: {
      bg: 'bg-amber-500/90',
      icon: AlertTriangle,
      border: 'border-amber-400',
    },
    info: {
      bg: 'bg-blue-500/90',
      icon: Info,
      border: 'border-blue-400',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div 
      className={`${config.bg} pointer-events-auto border ${config.border} rounded-lg px-4 py-3 text-white flex items-start gap-3 max-w-sm shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300`}
      role="alert"
    >
      <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button 
            onClick={() => {
              toast.action();
              removeToast(toast.id);
            }}
            className="text-xs mt-1 underline opacity-90 hover:opacity-100"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
      <button 
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 hover:opacity-75 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
