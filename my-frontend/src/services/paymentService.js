import api from './api';

export const paymentService = {
  deposit: async (amount) => {
    const response = await api.post('/payments/deposit', { amount });
    return response.data;
  },

  withdraw: async (amount) => {
    const response = await api.post('/payments/withdraw', { amount });
    return response.data;
  },

  transfer: async (amount, targetUserId) => {
    const response = await api.post('/payments/transfer', { amount, targetUserId });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  }
};
