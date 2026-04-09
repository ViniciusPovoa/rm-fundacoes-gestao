import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import '../styles/confirm-modal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon confirm-modal-icon-${type}`}>
            <AlertCircle size={24} />
          </div>
          <h2 className="confirm-modal-title">{title}</h2>
          <button className="confirm-modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>

        <div className="confirm-modal-footer">
          <button className="btn-cancel" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn-confirm btn-confirm-${type}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
