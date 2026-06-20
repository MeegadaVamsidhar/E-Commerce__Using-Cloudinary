import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiShield, FiUser } from 'react-icons/fi'
import { login, clearError } from '../redux/slices/authSlice'
import toast from 'react-hot-toast'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [loginAs, setLoginAs] = useState('customer')
  const redirectTo = location.state?.from?.pathname || '/'

  useEffect(() => { 
    if (user) {
      if (loginAs === 'admin' && user.role !== 'admin') {
        toast.error('This account does not have admin access')
        dispatch(clearError())
        return
      }
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'seller') {
        navigate('/seller', { replace: true })
      } else if (redirectTo !== '/') {
        navigate(redirectTo, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
      toast.success('Welcome back!')
    }
  }, [user, navigate, redirectTo, loginAs, dispatch])

  useEffect(() => { 
    return () => dispatch(clearError()) 
  }, [dispatch])

  const validateForm = () => {
    const errors = {}
    
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      dispatch(login({ email, password }))
    } else {
      toast.error('Please fix the errors below')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)', top: '-10%', right: '-10%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.1), transparent)', bottom: '-10%', left: '-10%', animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>SN</div>
            <span className="font-display font-bold text-2xl text-white">Shop<span className="gradient-text">Nova</span></span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome Back!</h1>
          <p className="text-slate-400 text-sm">Sign in to access your account</p>
        </div>

        <div className="glass-card p-8 md:p-10">
          {error && (
            <div className="alert alert-danger mb-6 animate-slide-down">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Role Toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <button
              type="button"
              onClick={() => setLoginAs('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                loginAs === 'customer'
                  ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiUser size={16} className="flex-shrink-0" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginAs('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                loginAs === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiShield size={16} className="flex-shrink-0" />
              <span>Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (formErrors.email) setFormErrors({...formErrors, email: ''})
                  }}
                  placeholder={loginAs === 'admin' ? 'admin@shopnova.com' : 'you@example.com'}
                  className={`input-field pl-10 ${formErrors.email ? 'error-state' : ''}`}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    if (formErrors.password) setFormErrors({...formErrors, password: ''})
                  }}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${formErrors.password ? 'error-state' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {formErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {loginAs === 'admin' ? 'Admin' : 'Customer'}</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {loginAs === 'admin' && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs text-amber-400 flex items-center gap-2">
                <FiShield size={14} />
                Admin access requires an account with admin role. Contact support if you need access.
              </p>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-slate-500">or</span>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm">
            No account yet?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
