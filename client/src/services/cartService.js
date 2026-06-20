import api from './api'
export const getCart = () => api.get('/cart')
export const addItem = (data) => api.post('/cart', data)
export const updateItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity })
export const removeItem = (itemId) => api.delete(`/cart/${itemId}`)
export const clearCart = () => api.delete('/cart/clear')
