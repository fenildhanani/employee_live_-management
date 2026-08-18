import React from 'react';

const Modal = ({ show, title, onClose, children, footer }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card border-0 shadow-lg">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-primary">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer border-top">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
