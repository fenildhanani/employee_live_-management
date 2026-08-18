import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markRead, markAllRead } = useContext(NotificationContext);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <nav className="app-navbar d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-outline-secondary d-lg-none border-0" onClick={onToggleSidebar}>
          <i className="bi bi-list fs-4"></i>
        </button>
        <div>
          <h5 className="fw-bold mb-0 text-primary">{user?.company?.name || 'Mord Spark ELMS'}</h5>
          <small className="text-muted d-none d-md-block" style={{ fontSize: '0.78rem' }}>
            Mord Spark • Developed by <strong className="text-primary">Fenil Dhanani</strong>
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Theme Toggle */}
        <button className="btn btn-light rounded-circle shadow-sm" onClick={toggleTheme} title="Toggle Theme">
          <i className={`bi bi-${theme === 'light' ? 'moon-stars-fill' : 'sun-fill'} text-primary`}></i>
        </button>

        {/* Notifications Dropdown */}
        <div className="dropdown">
          <button className="btn btn-light rounded-circle shadow-sm position-relative" data-bs-toggle="dropdown">
            <i className="bi bi-bell-fill text-secondary"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-3" style={{ width: '320px', maxHeight: '420px', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <h6 className="fw-bold mb-0">Notifications</h6>
              {unreadCount > 0 && (
                <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={markAllRead}>
                  Mark all as read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted small text-center my-3">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`p-2 mb-2 rounded ${n.isRead ? 'bg-light' : 'bg-primary bg-opacity-10'}`} onClick={() => markRead(n._id)} style={{ cursor: 'pointer' }}>
                  <div className="fw-bold small">{n.title}</div>
                  <div className="text-muted extra-small">{n.message}</div>
                  <small className="text-secondary" style={{ fontSize: '0.7rem' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="d-flex align-items-center gap-2 border-start ps-3">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="d-none d-md-block">
            <div className="fw-bold small mb-0">{user?.name}</div>
            <div className="text-muted extra-small text-uppercase badge bg-secondary bg-opacity-20 text-secondary" style={{ fontSize: '0.65rem' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
          <button className="btn btn-outline-danger btn-sm border-0 ms-2" onClick={logout} title="Logout">
            <i className="bi bi-box-arrow-right fs-5"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
