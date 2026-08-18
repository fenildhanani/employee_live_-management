import api from './api';

export const fetchLeaves = async (params) => {
  const response = await api.get('/leaves', { params });
  return response.data;
};

export const fetchLeaveById = async (id) => {
  const response = await api.get(`/leaves/${id}`);
  return response.data;
};

export const submitLeaveRequest = async (formData) => {
  const isMultipart = formData instanceof FormData;
  const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/leaves', formData, config);
  return response.data;
};

export const approveLeaveRequest = async (id, comment) => {
  const response = await api.post(`/leaves/${id}/approve`, { comment });
  return response.data;
};

export const rejectLeaveRequest = async (id, comment) => {
  const response = await api.post(`/leaves/${id}/reject`, { comment });
  return response.data;
};

export const cancelLeaveRequest = async (id, cancelReason) => {
  const response = await api.post(`/leaves/${id}/cancel`, { cancelReason });
  return response.data;
};

export const fetchMyLeaveBalances = async (year) => {
  const response = await api.get('/leaves/balances/my', { params: { year } });
  return response.data;
};

export const fetchAllLeaveBalances = async (params) => {
  const response = await api.get('/leaves/balances/all', { params });
  return response.data;
};
