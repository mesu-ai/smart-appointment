/**
 * Toast Context
 * 
 * Simple toast notification system for user feedback.
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    // Check if identical toast already exists (within last 3 seconds)
    setToasts((prev) => {
      const now = Date.now();
      const recentIdentical = prev.find(
        (t) => t.type === type && t.message === message && (now - parseInt(t.id.split('-')[0] || '0', 36)) < 3000
      );
      
      if (recentIdentical) {
        return prev;
      }
      
      const id = `${now.toString(36)}-${Math.random().toString(36).substring(7)}`;
      const toast: Toast = { id, type, message };
      
      const newToasts = [...prev, toast];

      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 5000);
      
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
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
