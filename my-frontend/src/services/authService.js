import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  verifyOtp: async (data) => {
      const response = await api.post('/auth/verify-otp', data);
      if (response.data.token) {
          localStorage.setItem('token', response.data.token);
      }
      return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateDetails: async (data) => {
      const response = await api.put('/auth/updatedetails', data);
      return response;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
