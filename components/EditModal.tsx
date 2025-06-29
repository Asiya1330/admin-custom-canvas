'use client'
import React from 'react';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'max-w-md',
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2">
      <div className={`glass-effect rounded-lg p-3 w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-slate-900 relative`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-base font-bold text-white mb-2">{title}</h2>
        {children}
        {actions && <div className="flex justify-end space-x-2 mt-3">{actions}</div>}
      </div>
    </div>
  );
};

export default EditModal; 