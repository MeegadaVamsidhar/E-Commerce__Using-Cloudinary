import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from './Loader'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)
  const location = useLocation()
  if (loading) return <Loader fullScreen />
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />
}

export default PrivateRoute
