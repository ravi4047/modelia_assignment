// src/components/ui/ConfirmModal.tsx
import React from 'react';

interface ConfirmModalProps {
  title?: string;
  description?: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  title = 'Confirm',
  description = 'Are you sure?',
  open,
  onConfirm,
  onCancel,
  confirmText = 'Yes, log out',
  cancelText = 'Cancel',
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />

      <div className="bg-white rounded-lg shadow-xl mx-4 max-w-lg w-full z-10">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{description}</p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-gradient-to-r from-[#E98FA6] via-[#C47FD9] to-[#6556FF] text-white font-medium hover:opacity-95 transition"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
