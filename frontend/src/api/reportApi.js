import api from './axios';

export const generateReport = async (title, type, generatedById, content) => {
  const safeTitle = encodeURIComponent(title || 'System Report');
  const safeType = encodeURIComponent(type || 'GENERAL');
  const safeUserId = generatedById || 1;
  const safeContent = content || 'System generated summary report.';

  const response = await api.post(
    `/reports?title=${safeTitle}&type=${safeType}&generatedById=${safeUserId}`,
    {
      title: title || 'System Report',
      type: type || 'GENERAL',
      generatedById: safeUserId,
      content: safeContent,
      notes: safeContent
    }
  );
  return response.data;
};

export const getAllReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const getReportsByUser = async (userId) => {
  const response = await api.get(`/reports/user/${userId}`);
  return response.data;
};

export const downloadReportCsv = async (reportId) => {
  const response = await api.get(`/reports/${reportId}/csv`, {
    responseType: 'blob'
  });
  return response.data;
};
