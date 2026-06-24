'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen:    boolean;
  title:     string;
  message:   string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel:  () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Delete',
  onConfirm, onCancel, isLoading,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>

        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
