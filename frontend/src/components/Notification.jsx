import React from 'react';

const Notification = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show shadow-sm`} role="alert">
      {message}
      {onClose && <button type="button" className="btn-close" onClick={onClose}></button>}
    </div>
  );
};

export default Notification;
