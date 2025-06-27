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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`glass-effect rounded-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-slate-900 relative`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">{title}</h2>
        {children}
        {actions && <div className="flex justify-end space-x-3 mt-6">{actions}</div>}
      </div>
    </div>
  );
};

export default EditModal; 