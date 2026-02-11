"use client";

import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-cyber-teal-primary to-cyber-teal-secondary border-cyber-teal-primary shadow-teal-glow";
      case "error":
        return "bg-gradient-to-r from-cyber-danger-primary to-cyber-danger-secondary border-cyber-danger-primary shadow-danger-glow";
      case "warning":
        return "bg-gradient-to-r from-cyber-warning-primary to-cyber-warning-secondary border-cyber-warning-primary";
      case "info":
        return "bg-gradient-to-r from-cyber-blue-primary to-cyber-purple-primary border-cyber-blue-primary shadow-cyber";
      default:
        return "bg-cyber-bg-secondary border-gray-600";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm text-white font-medium transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getToastStyles(type)}`}
    >
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-white/70 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
