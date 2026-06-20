import api from './api';

export const applyForSeller = (data) => api.post('/seller/apply', data);
export const getSellerDashboard = () => api.get('/seller/dashboard');
export const getSellerProducts = () => api.get('/seller/products');
export const createSellerProduct = (data) => api.post('/seller/products', data);
export const updateSellerProduct = (id, data) => api.put(`/seller/products/${id}`, data);
export const deleteSellerProduct = (id) => api.delete(`/seller/products/${id}`);
export const getSellerOrders = () => api.get('/seller/orders');

export const getPendingSellers = () => api.get('/admin/sellers/pending');
export const approveSeller = (id) => api.put(`/admin/sellers/${id}/approve`);
export const rejectSeller = (id) => api.put(`/admin/sellers/${id}/reject`);
export const getPendingProducts = () => api.get('/admin/products/pending');
export const approveProduct = (id) => api.put(`/admin/products/${id}/approve`);
export const rejectProduct = (id, reason) => api.put(`/admin/products/${id}/reject`, { reason });
