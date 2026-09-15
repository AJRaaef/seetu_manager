import api from './axios';

export const generateReport = async (title, type, generatedById, content) => {
  const response = await api.post(`/reports?title=${title}&type=${type}&generatedById=${generatedById}`, content);
  return response.data;
};

export const getReportsByUser = async (userId) => {
  const response = await api.get(`/reports/user/${userId}`);
  return response.data;
};
