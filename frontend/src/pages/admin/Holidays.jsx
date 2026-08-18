import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const HolidaysAdmin = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('All');
  const [holidayType, setHolidayType] = useState('National');
  const [description, setDescription] = useState('');

  const [msg, setMsg] = useState('');

  const loadHolidays = async () => {
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    setName('');
    setDate('');
    setLocation('All');
    setHolidayType('National');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (h) => {
    setEditingHoliday(h);
    setName(h.name);
    setDate(h.date ? h.date.split('T')[0] : '');
    setLocation(h.location || 'All');
    setHolidayType(h.holidayType || 'National');
    setDescription(h.description || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { name, date, location, holidayType, description };
    try {
      if (editingHoliday) {
        await api.put(`/holidays/${editingHoliday._id}`, payload);
        setMsg('Holiday updated.');
      } else {
        await api.post('/holidays', payload);
        setMsg('Holiday created.');
      }
      setShowModal(false);
      loadHolidays();
    } catch (err) {
      setMsg('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      setMsg('Holiday deleted.');
      loadHolidays();
    } catch (err) {
      setMsg('Failed to delete holiday.');
    }
  };

  if (loading) return <Loading message="Loading holidays master..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Company Holiday Master</h4>
          <p className="text-muted small mb-0">Add, edit, or delete organization holidays.</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Holiday
        </button>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Location</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h._id}>
                  <td className="fw-bold">{h.name}</td>
                  <td className="fw-semibold text-primary">{formatDate(h.date)}</td>
                  <td><span className="badge bg-info bg-opacity-20 text-info">{h.holidayType}</span></td>
                  <td className="small">{h.location}</td>
                  <td className="small text-muted">{h.description}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenEdit(h)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(h._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Holiday Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Date</label>
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small fw-semibold">Holiday Type</label>
              <select className="form-select" value={holidayType} onChange={(e) => setHolidayType(e.target.value)}>
                <option value="National">National</option>
                <option value="Regional">Regional</option>
                <option value="Company">Company</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Location</label>
              <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Description</label>
            <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="text-end gap-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm fw-bold">Save Holiday</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidaysAdmin;
