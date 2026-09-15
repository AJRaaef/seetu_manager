import api from './axios';

export const queryChatbot = async (query) => {
  const response = await api.post('/chatbot/query', query, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
  return response.data;
};
