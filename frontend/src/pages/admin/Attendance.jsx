import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const AttendanceAdmin = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await api.get('/attendance');
        setRecords(res.data.data || []);
      } catch (err) {
        console.error('Failed to load attendance master:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  if (loading) return <Loading message="Loading attendance master..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Company Attendance Master</h4>
        <p className="text-muted small mb-3">Organization-wide employee attendance, clock-in records, and working hours.</p>
      </div>

      <div className="glass-card p-4">
        {records.length === 0 ? (
          <p className="text-muted text-center py-4">No attendance records recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-bold">{r.employee?.name}</div>
                      <small className="text-muted">{r.employee?.employeeId}</small>
                    </td>
                    <td className="small">{r.employee?.department?.name || 'N/A'}</td>
                    <td className="fw-semibold">{formatDate(r.attendanceDate)}</td>
                    <td className="small">{r.checkIn ? formatDateTime(r.checkIn) : '--'}</td>
                    <td className="small">{r.checkOut ? formatDateTime(r.checkOut) : '--'}</td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-dark fw-bold">{r.workingHours} hrs</span></td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAdmin;
