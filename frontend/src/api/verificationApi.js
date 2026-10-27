import api from './axios';

/**
 * Submit initial verification or re-submit verification with primary docs
 * @param {FormData} formData - multipart form data with nicNumber, nicFront, nicBack, gnCert, etc.
 */
export const submitVerification = async (formData) => {
  const response = await api.post('/verifications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Fetch verification details for the currently logged in user
 */
export const getMyVerification = async (userId) => {
  const params = userId ? { userId } : {};
  const response = await api.get('/verifications/my', { params });
  return response.data;
};

/**
 * Fetch verification details by verification record ID
 */
export const getVerificationById = async (id) => {
  const response = await api.get(`/verifications/${id}`);
  return response.data;
};

/**
 * Fetch verifications for Organizers / Admins (with optional status & search filters)
 */
export const getPendingVerifications = async (status = '', search = '') => {
  const params = {};
  if (status && status !== 'ALL') params.status = status;
  if (search) params.search = search;
  const response = await api.get('/verifications/pending', { params });
  return response.data;
};

/**
 * Approve a member verification
 */
export const approveVerification = async (id, reviewerId) => {
  const params = reviewerId ? { reviewerId } : {};
  const response = await api.put(`/verifications/${id}/approve`, null, { params });
  return response.data;
};

/**
 * Reject a member verification with reason
 */
export const rejectVerification = async (id, reason, reviewerId) => {
  const params = reviewerId ? { reviewerId } : {};
  const response = await api.put(`/verifications/${id}/reject`, { reason }, { params });
  return response.data;
};

/**
 * Upload an additional supporting document to an existing verification
 */
export const uploadAdditionalDocument = async (verificationId, formData, userId) => {
  const params = userId ? { userId } : {};
  const response = await api.post(`/verifications/${verificationId}/documents`, formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete an additional supporting document
 */
export const deleteDocument = async (documentId, userId) => {
  const params = userId ? { userId } : {};
  const response = await api.delete(`/verifications/documents/${documentId}`, { params });
  return response.data;
};

/**
 * Build the URL to view/download a verification file securely.
 */
export const getVerificationFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `http://localhost:8081${cleanPath}`;
};
