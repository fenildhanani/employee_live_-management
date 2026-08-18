import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
    if (user?.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    if (user?.role === 'hr_admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
