import React, { useEffect } from 'react';

export function Modal({ open, onClose, title, icon, width = '520px', footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ '--modal-w': width }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
            <div className="modal-head-icon">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', danger = true, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon="warning"
      width="400px"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className={'btn ' + (danger ? 'btn-danger' : 'btn-primary')}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="lead">{message}</p>
    </Modal>
  );
}
