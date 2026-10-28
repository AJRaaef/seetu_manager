import api from './axios';

/**
 * Get rotation status, available numbers, assignments, and payment check for a cycle.
 * @param {number|string} cycleId
 */
export const getRotationStatus = async (cycleId) => {
  const response = await api.get(`/rotation/${cycleId}/status`);
  return response.data;
};

/**
 * Start rotation for a cycle (Organizer/Admin only).
 * Validates all payments PAID, sets rotation_status = 'IN_PROGRESS', assigns Organizer to position #1.
 * @param {number|string} cycleId
 */
export const startRotation = async (cycleId) => {
  const response = await api.post(`/rotation/${cycleId}/start`);
  return response.data;
};

/**
 * Set the monthly payout slots limit (e.g. 3).
 * @param {number|string} cycleId
 * @param {number} limit
 */
export const setPayoutLimit = async (cycleId, limit) => {
  const response = await api.post(`/rotation/${cycleId}/limit`, { limit });
  return response.data;
};

/**
 * Backward-compatible initialize function.
 * @param {number|string} cycleId
 * @param {Object} data { maxPayoutSlots?: number }
 */
export const initializeRotation = async (cycleId, data = {}) => {
  const response = await api.post(`/rotation/${cycleId}/initialize`, data);
  return response.data;
};

/**
 * Spin the wheel (Member only).
 * Randomly picks from available numbers from 2..N + "NO".
 * @param {number|string} cycleId
 * @param {number|string} [userId]
 */
export const spinWheel = async (cycleId, userId) => {
  const payload = userId ? { userId } : {};
  const response = await api.post(`/rotation/${cycleId}/spin`, payload);
  return response.data;
};

/**
 * Finalize and lock rotation order (Organizer/Admin only).
 * Updates payout_member_id on cycle.
 * @param {number|string} cycleId
 */
export const completeRotation = async (cycleId) => {
  const response = await api.post(`/rotation/${cycleId}/complete`);
  return response.data;
};
