import api from './axios';

/**
 * Fetch financial discipline score details for a specific member
 * @param {number|string} memberId 
 */
export const getMemberScore = async (memberId) => {
  const response = await api.get(`/scores/member/${memberId}`);
  return response.data;
};

/**
 * Fetch financial discipline score details for current logged in user
 */
export const getMyScore = async () => {
  const response = await api.get('/scores/my');
  return response.data;
};
