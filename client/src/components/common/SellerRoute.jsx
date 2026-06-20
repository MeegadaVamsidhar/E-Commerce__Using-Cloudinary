import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from './Loader'

const SellerRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (loading) return <Loader fullScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has seller status
  if (!user?.isSeller) {
    return <Navigate to="/become-seller" state={{ from: location }} replace />
  }

  return children
}

export default SellerRoute
