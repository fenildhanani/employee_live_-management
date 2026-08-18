import api from './api';

export const fetchEmployees = async (params) => {
  const response = await api.get('/employees', { params });
  return response.data;
};

export const fetchEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const createEmployeeApi = async (data) => {
  const response = await api.post('/employees', data);
  return response.data;
};

export const updateEmployeeApi = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};

export const updateEmployeeStatusApi = async (id, status) => {
  const response = await api.patch(`/employees/${id}/status`, { status });
  return response.data;
};

export const deleteEmployeeApi = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};
