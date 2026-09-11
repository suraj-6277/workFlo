import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`toast-item ${isError ? 'toast-error' : isInfo ? 'toast-info' : 'toast-success'}`}
          >
            <div className="toast-icon">
              {isError ? (
                <AlertCircle size={16} />
              ) : isInfo ? (
                <Info size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
