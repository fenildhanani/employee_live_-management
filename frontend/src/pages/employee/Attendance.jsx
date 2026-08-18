import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await api.get('/attendance');
        setRecords(res.data.data || []);
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  if (loading) return <Loading message="Loading attendance logs..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Attendance Logs</h4>
        <p className="text-muted small mb-3">Track your daily clock-in/out records and working hours.</p>
      </div>

      <div className="glass-card p-4">
        {records.length === 0 ? (
          <p className="text-muted text-center py-4">No attendance records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
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
                    <td className="fw-bold">{formatDate(r.attendanceDate)}</td>
                    <td className="small">{r.checkIn ? formatDateTime(r.checkIn) : '--'}</td>
                    <td className="small">{r.checkOut ? formatDateTime(r.checkOut) : '--'}</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-dark fw-bold">{r.workingHours} hrs</span>
                    </td>
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

export default AttendancePage;
