import api from './axios';

/**
 * Submit an application to become a Seettu Organizer.
 * @param {Object} data 
 * {
 *   operatingDistrict: string,
 *   plannedSeettuModel: string,
 *   targetMemberCount: number,
 *   plannedContributionAmount: number,
 *   experienceLevel: string,
 *   proposalNotes: string,
 *   agreementAccepted: boolean
 * }
 */
export const applyForOrganizer = async (data) => {
  const response = await api.post('/users/apply-organizer', data);
  return response.data;
};

/**
 * Fetch list of pending organizer applications (ADMIN only).
 */
export const getPendingOrganizerApplications = async () => {
  const response = await api.get('/users/pending-organizer-applications');
  return response.data;
};

/**
 * Approve a pending organizer application (ADMIN only).
 * @param {number|string} userId 
 */
export const approveOrganizer = async (userId) => {
  const response = await api.put(`/users/${userId}/approve-organizer`);
  return response.data;
};

/**
 * Reject a pending organizer application (ADMIN only).
 * @param {number|string} userId 
 * @param {string} reason 
 */
export const rejectOrganizer = async (userId, reason) => {
  const response = await api.put(`/users/${userId}/reject-organizer`, null, {
    params: { reason }
  });
  return response.data;
};

export default {
  applyForOrganizer,
  getPendingOrganizerApplications,
  approveOrganizer,
  rejectOrganizer
};
