import api from './api'
export const createOrder = (data) => api.post('/orders', data)
export const getUserOrders = () => api.get('/orders/me')
export const getOrder = (id) => api.get(`/orders/${id}`)
export const createStripeIntent = (amount) => api.post('/payment/stripe/create-intent', { amount })
export const createRazorpayOrder = (amount) => api.post('/payment/razorpay/create-order', { amount })
export const verifyRazorpay = (data) => api.post('/payment/razorpay/verify', data)
