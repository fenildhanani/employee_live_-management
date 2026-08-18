import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'paid':
      case 'present':
        return 'badge-approved';
      case 'pending':
        return 'badge-pending';
      case 'rejected':
      case 'inactive':
      case 'terminated':
      case 'absent':
        return 'badge-rejected';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-cancelled';
    }
  };

  return <span className={`badge-status ${getBadgeClass(status)}`}>{status || 'N/A'}</span>;
};

export default StatusBadge;
