import api from './api';

export const uploadImage = (formData) => api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const uploadMultipleImages = (formData) => api.post('/upload/multiple', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const uploadVideo = (formData) => api.post('/upload/video', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const uploadAvatar = (formData) => api.post('/upload/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const deleteFile = (publicId, resourceType = 'image') => api.delete(`/upload/${publicId}?resource_type=${resourceType}`);
