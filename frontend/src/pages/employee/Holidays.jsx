import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { formatDate } from '../../utils/dateUtils';

const HolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const res = await api.get(`/holidays?year=${year}`);
        setHolidays(res.data.data || []);
      } catch (err) {
        console.error('Failed to load holidays:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHolidays();
  }, [year]);

  if (loading) return <Loading message="Loading company holidays..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Company Holiday Calendar</h4>
          <p className="text-muted small mb-0">Official holidays list for the organization.</p>
        </div>
        <select className="form-select w-auto" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
        </select>
      </div>

      <div className="row g-3">
        {holidays.map((h) => (
          <div key={h._id} className="col-12 col-md-6 col-lg-4">
            <div className="glass-card p-3 d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 text-center p-3" style={{ minWidth: '70px' }}>
                <div className="fw-bold fs-4">{new Date(h.date).getDate()}</div>
                <div className="small text-uppercase">{new Date(h.date).toLocaleString('default', { month: 'short' })}</div>
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-1">{h.name}</h6>
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge bg-secondary bg-opacity-20 text-dark extra-small">{h.holidayType}</span>
                  <small className="text-muted">{new Date(h.date).toLocaleString('default', { weekday: 'long' })}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HolidaysPage;
