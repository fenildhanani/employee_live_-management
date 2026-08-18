import React, { useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/dateUtils';

const NotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useContext(NotificationContext);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Notifications & System Alerts</h4>
          <p className="text-muted small mb-0">Stay updated on your leave requests, approvals, and comp-offs.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline-primary btn-sm fw-bold" onClick={markAllRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="glass-card p-4">
        {notifications.length === 0 ? (
          <p className="text-muted text-center py-4">No notifications present.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded-3 border d-flex justify-content-between align-items-start ${n.isRead ? 'bg-light' : 'bg-primary bg-opacity-10 border-primary'}`}
                onClick={() => markRead(n._id)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <h6 className="fw-bold mb-1">{n.title}</h6>
                  <p className="text-secondary small mb-1">{n.message}</p>
                  <small className="text-muted extra-small">{formatDateTime(n.createdAt)}</small>
                </div>
                {!n.isRead && <span className="badge bg-primary rounded-pill">New</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
