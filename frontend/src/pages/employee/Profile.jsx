import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateUtils';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row align-items-center gap-4 border-bottom pb-4 mb-4">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-1" style={{ width: '100px', height: '100px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-center text-md-start">
            <h3 className="fw-bold text-primary mb-1">{user?.name}</h3>
            <p className="text-muted mb-2">{user?.email} • ID: <span className="fw-bold text-dark">{user?.employeeId}</span></p>
            <span className="badge bg-primary bg-opacity-20 text-primary text-uppercase px-3 py-2">
              Role: {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <h5 className="fw-bold text-secondary mb-3">Employment Details</h5>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border">
              <small className="text-muted d-block uppercase extra-small">Department</small>
              <span className="fw-bold text-dark">{user?.department?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border">
              <small className="text-muted d-block uppercase extra-small">Reporting Manager</small>
              <span className="fw-bold text-dark">{user?.manager?.name || 'None'}</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border">
              <small className="text-muted d-block uppercase extra-small">Grade Designation</small>
              <span className="fw-bold text-dark">{user?.grade?.name || 'Standard'}</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border">
              <small className="text-muted d-block uppercase extra-small">Joining Date</small>
              <span className="fw-bold text-dark">{formatDate(user?.joiningDate)}</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border">
              <small className="text-muted d-block uppercase extra-small">Work Location</small>
              <span className="fw-bold text-dark">{user?.location || 'Headquarters'}</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="p-3 bg-light rounded-3 border">
              <small className="text-muted d-block uppercase extra-small">Phone Number</small>
              <span className="fw-bold text-dark">{user?.phone || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
