import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast HUD Overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const cfg = {
            success: { bg: 'bg-[#0a1628]/95', border: 'border-emerald-500/50', icon: CheckCircle, iconColor: 'text-emerald-400' },
            warning: { bg: 'bg-[#0a1628]/95', border: 'border-amber-500/50', icon: AlertTriangle, iconColor: 'text-amber-400' },
            danger:  { bg: 'bg-[#0a1628]/95', border: 'border-red-500/50', icon: XCircle, iconColor: 'text-red-400' },
            error:   { bg: 'bg-[#0a1628]/95', border: 'border-red-500/50', icon: XCircle, iconColor: 'text-red-400' },
            info:    { bg: 'bg-[#0a1628]/95', border: 'border-cyan-500/50', icon: Info, iconColor: 'text-[#00d4ff]' },
          }[toast.type] || { bg: 'bg-[#0a1628]/95', border: 'border-cyan-500/50', icon: Info, iconColor: 'text-[#00d4ff]' };

          const Icon = cfg.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${cfg.bg} ${cfg.border} text-white font-mono`}
            >
              <Icon size={18} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 text-xs text-slate-200 leading-relaxed font-medium">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#88a0c0] hover:text-white p-0.5 cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
