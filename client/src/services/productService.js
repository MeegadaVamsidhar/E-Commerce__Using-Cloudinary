import api from './api'
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const getFeatured = () => api.get('/products/featured')
export const getCategories = () => api.get('/products/categories')
