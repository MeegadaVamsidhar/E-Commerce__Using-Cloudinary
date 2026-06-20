import api from './api'
export const getWishlist = () => api.get('/wishlist')
export const toggle = (productId) => api.post(`/wishlist/${productId}`)
export const remove = (productId) => api.delete(`/wishlist/${productId}`)
