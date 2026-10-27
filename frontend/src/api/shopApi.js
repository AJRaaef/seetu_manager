import api from './axios';

export const getAllShops = async () => {
  const response = await api.get('/shops');
  return response.data;
};
