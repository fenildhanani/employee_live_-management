import React from 'react';

const DashboardCard = ({ title, value, subtitle, icon, variant = 'primary' }) => {
  return (
    <div className={`glass-card p-4 stat-card-gradient-${variant} h-100`}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted small fw-semibold text-uppercase tracking-wider mb-1">{title}</div>
          <h2 className="fw-bold mb-1">{value}</h2>
          {subtitle && <div className="extra-small text-muted">{subtitle}</div>}
        </div>
        <div className={`rounded-3 p-3 bg-${variant} bg-opacity-10 text-${variant}`}>
          <i className={`bi ${icon} fs-2`}></i>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
