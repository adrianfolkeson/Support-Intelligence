"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info" | "warning", duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((message: string, duration?: number) => showToast(message, "success", duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, "error", duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, "info", duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, "warning", duration), [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type?: "success" | "error" | "info" | "warning") => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 flex-shrink-0" />;
      case "error":
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      case "info":
      default:
        return <Info className="h-5 w-5 flex-shrink-0" />;
    }
  };

  const getStyles = (type?: "success" | "error" | "info" | "warning") => {
    switch (type) {
      case "success":
        return "bg-emerald-600 text-white shadow-emerald-200";
      case "error":
        return "bg-red-600 text-white shadow-red-200";
      case "warning":
        return "bg-amber-500 text-white shadow-amber-200";
      case "info":
      default:
        return "bg-neutral-900 text-white shadow-neutral-300";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 flex flex-col items-end max-w-md w-full px-4 sm:px-0">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={cn(
              "slide-up flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl min-w-[300px] max-w-full",
              "transition-all duration-200 ease-out",
              "hover:scale-[1.02] active:scale-[0.98]",
              getStyles(toast.type)
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {getIcon(toast.type)}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              aria-label="Close toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
