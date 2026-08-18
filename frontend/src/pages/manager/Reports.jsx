import React, { useState } from 'react';
import api from '../../services/api';
import Notification from '../../components/Notification';

const ManagerReports = () => {
  const [reportType, setReportType] = useState('leaves');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleExportCSV = async () => {
    setError('');
    setDownloading(true);
    try {
      const url = `/reports/${reportType}?format=csv${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
      const res = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([res.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export report CSV');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="glass-card p-4 p-md-5">
        <h4 className="fw-bold text-primary mb-1">
          <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export Team Reports
        </h4>
        <p className="text-muted small mb-4">Generate and download CSV reports for team leave usage and expense claims.</p>

        <Notification type="danger" message={error} onClose={() => setError('')} />

        <div className="row g-3 mb-4">
          <div className="col-12">
            <label className="form-label small fw-semibold">Report Type</label>
            <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="leaves">Team Leave Applications Report</option>
              <option value="expenses">Team Expense Reimbursements Report</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold">From Date (Optional)</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold">To Date (Optional)</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary fw-bold shadow w-100 py-2.5" onClick={handleExportCSV} disabled={downloading}>
          <i className="bi bi-download me-2"></i>
          {downloading ? 'Generating CSV...' : 'Download CSV Report'}
        </button>
      </div>
    </div>
  );
};

export default ManagerReports;
