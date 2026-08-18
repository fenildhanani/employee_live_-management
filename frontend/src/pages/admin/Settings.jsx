import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Notification from '../../components/Notification';

const SettingsAdmin = () => {
  const { user } = useContext(AuthContext);
  const [companyName, setCompanyName] = useState(user?.company?.name || 'Mord Spark Pvt. Ltd.');
  const [timezone, setTimezone] = useState(user?.company?.timezone || 'Asia/Kolkata');
  const [weeklyOffs, setWeeklyOffs] = useState(['Saturday', 'Sunday']);
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('Company settings saved successfully.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="glass-card p-4 p-md-5">
        <h4 className="fw-bold text-primary mb-1">
          <i className="bi bi-gear me-2"></i>Company Settings
        </h4>
        <p className="text-muted small mb-4">Manage organization defaults and business rules.</p>

        <Notification type="success" message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Company Name</label>
            <input type="text" className="form-control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Default Timezone</label>
            <select className="form-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Default Weekly Offs</label>
            <div className="d-flex gap-3">
              {['Saturday', 'Sunday', 'Friday'].map((day) => (
                <div key={day} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={day}
                    checked={weeklyOffs.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) setWeeklyOffs([...weeklyOffs, day]);
                      else setWeeklyOffs(weeklyOffs.filter((d) => d !== day));
                    }}
                  />
                  <label className="form-check-label small" htmlFor={day}>{day}</label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary fw-bold">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsAdmin;
