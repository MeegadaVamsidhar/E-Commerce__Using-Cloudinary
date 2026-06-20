import api from './api'
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const fetchProfile = () => api.get('/auth/profile')
export const updateUserProfile = (data) => api.put('/auth/profile', data)
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => api.put(`/auth/reset-password/${token}`, { password })
