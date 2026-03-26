import api from './api';

export const documentService = {
  uploadDocument: async (formData) => {
    const response = await api.post('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // Override default JSON content type for buffer uploads
        }
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  signDocument: async (id, signatureDataURI) => {
    const response = await api.put(`/documents/${id}/sign`, { signatureDataURI });
    return response.data;
  }
};
