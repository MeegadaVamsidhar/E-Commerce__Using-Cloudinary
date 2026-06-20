export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price)
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const truncate = (str, len) => {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

export const calculateTax = (subtotal) => Math.round(subtotal * 0.18)
export const calculateShipping = (subtotal) => subtotal > 999 ? 0 : 99

export const getOrderStatusClass = (status) => {
  switch (status) {
    case 'Delivered': return 'badge-success'
    case 'Shipped': return 'badge-primary'
    case 'Processing': return 'badge-warning'
    case 'Cancelled': return 'badge-danger'
    default: return 'badge-warning'
  }
}

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  return Math.floor(seconds) + ' seconds ago'
}
