import api from './api';

export const meetingService = {
  getMeetings: async () => {
    const response = await api.get('/meetings');
    return response.data;
  },
  
  createMeeting: async (meetingData) => {
    const response = await api.post('/meetings', meetingData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/meetings/${id}/status`, { status });
    return response.data;
  }
};
