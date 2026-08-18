import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Notification from '../../components/Notification';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        const role = res.user.role;
        if (role === 'hr_admin') navigate('/admin/dashboard');
        else if (role === 'manager') navigate('/manager/dashboard');
        else navigate('/employee/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ background: 'var(--bg-gradient)' }}>
      <div className="card glass-card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle p-3 mb-3">
            <i className="bi bi-briefcase-fill fs-1"></i>
          </div>
          <h3 className="fw-bold text-white mb-1">Mord Spark ELMS</h3>
          <p className="text-light opacity-75 small mb-1">Employee Leave Management System</p>
          <div className="badge bg-primary bg-opacity-30 text-info extra-small px-3 py-1">
            Developed by Fenil Dhanani
          </div>
        </div>

        <Notification type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white-50 small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-light">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-white-50 small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-light">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2.5 fw-bold shadow" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2"></span>Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
          <p className="text-white-50 extra-small mb-2 fw-semibold">Quick Demo Login Accounts:</p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button type="button" className="btn btn-outline-light btn-sm extra-small" onClick={() => fillDemo('hradmin@elms.com')}>
              <i className="bi bi-shield-lock me-1"></i> HR Admin
            </button>
            <button type="button" className="btn btn-outline-info btn-sm extra-small" onClick={() => fillDemo('manager1@elms.com')}>
              <i className="bi bi-person-badge me-1"></i> Manager
            </button>
            <button type="button" className="btn btn-outline-success btn-sm extra-small" onClick={() => fillDemo('employee@elms.com')}>
              <i className="bi bi-person me-1"></i> Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
