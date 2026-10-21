import api from './axios';

export const getOutboxMessages = async () => {
  const response = await api.get('/emails/outbox');
  return response.data;
};

export const sendDemoEmail = async (to, type) => {
  const response = await api.post('/emails/test-send', null, {
    params: { to, type }
  });
  return response.data;
};

export const sendDirectMessage = async ({ to, subject, message, recipientName, channel }) => {
  const response = await api.post('/emails/direct-send', {
    to,
    subject,
    message,
    recipientName,
    channel
  });
  return response.data;
};

export const getEmailPreviewUrl = (fileName) => {
  return `http://localhost:8081/api/emails/outbox/${encodeURIComponent(fileName)}/preview`;
};
