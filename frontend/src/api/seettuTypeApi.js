import api from './axios';

export const getSeettuTypes = async () => {
  const response = await api.get('/seettu-types');
  return response.data;
};
