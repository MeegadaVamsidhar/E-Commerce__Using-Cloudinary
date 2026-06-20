import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiShoppingBag } from 'react-icons/fi'
import { register, clearError } from '../redux/slices/authSlice'
import toast from 'react-hot-toast'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => { 
    if (user) {
      navigate('/')
      toast.success('Account created successfully!')
    }
  }, [user, navigate])

  useEffect(() => { 
    return () => dispatch(clearError()) 
  }, [dispatch])

  const calculatePasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    return strength
  }

  const handlePasswordChange = (e) => {
    const pwd = e.target.value
    setFormData({...formData, password: pwd})
    setPasswordStrength(calculatePasswordStrength(pwd))
    if (formErrors.password) setFormErrors({...formErrors, password: ''})
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      dispatch(register({ 
        name: formData.name.trim(), 
        email: formData.email.trim(), 
        password: formData.password 
      }))
    } else {
      toast.error('Please fix the errors below')
    }
  }

  const getPasswordStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    return { label: labels[passwordStrength], color: colors[passwordStrength] }
  }

  const strength = getPasswordStrengthLabel()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)', top: '-10%', right: '-10%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.1), transparent)', bottom: '-10%', left: '-10%', animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>SN</div>
            <span className="font-display font-bold text-2xl text-white">Shop<span className="gradient-text">Nova</span></span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join the ShopNova community today</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 md:p-10">
          {error && (
            <div className="alert alert-danger mb-6 animate-slide-down">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    setFormData({...formData, name: e.target.value})
                    if (formErrors.name) setFormErrors({...formErrors, name: ''})
                  }}
                  placeholder="John Doe"
                  className={`input-field pl-10 ${formErrors.name ? 'error-state' : ''}`}
                />
              </div>
              {formErrors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {formErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => {
                    setFormData({...formData, email: e.target.value})
                    if (formErrors.email) setFormErrors({...formErrors, email: ''})
                  }}
                  placeholder="john@example.com"
                  className={`input-field pl-10 ${formErrors.email ? 'error-state' : ''}`}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Create a strong password"
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
              
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-500`} style={{width: `${(passwordStrength / 4) * 100}%`}} />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <p className={formData.password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                      {formData.password.length >= 8 ? '✓' : '○'} 8+ characters
                    </p>
                    <p className={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}>
                      {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? '✓' : '○'} Upper & lower
                    </p>
                    <p className={/[0-9]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'} Numbers
                    </p>
                    <p className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}>
                      {/[^a-zA-Z0-9]/.test(formData.password) ? '✓' : '○'} Special chars
                    </p>
                  </div>
                </div>
              )}
              
              {formErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => {
                    setFormData({...formData, confirmPassword: e.target.value})
                    if (formErrors.confirmPassword) setFormErrors({...formErrors, confirmPassword: ''})
                  }}
                  placeholder="Confirm password"
                  className={`input-field pl-10 pr-10 ${formErrors.confirmPassword ? 'error-state' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {formErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiCheck size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-slate-500">or</span>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
