import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from './Loader'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  if (loading) return <Loader fullScreen />
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" replace />
}

export default AdminRoute
