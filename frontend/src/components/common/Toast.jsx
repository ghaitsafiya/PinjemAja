import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    color: 'bg-red-50 border-red-100 text-red-600',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-amber-50 border-amber-100 text-amber-600',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    color: 'bg-blue-50 border-blue-100 text-blue-600',
    iconColor: 'text-blue-500',
  },
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        animate-slide-in pointer-events-auto min-w-[300px] max-w-md
        ${config.color}
      `}
    >
      <Icon size={20} className={config.iconColor} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
