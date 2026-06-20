import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import api from '../services/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md glass-card p-8 animate-fade-in text-center">
        {sent ? (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto"><FiCheckCircle size={32} /></div>
            <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
            <p className="text-slate-400">We've sent a password reset link to {email}.</p>
            <Link to="/login" className="btn-primary w-full py-3 inline-block">Back to Login</Link>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 bg-primary-500/10 text-primary-400">🔑</div>
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-slate-400 text-sm mb-8">Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <label className="input-label">Email Address</label>
                <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" className="input-field pl-10" required /></div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-6 hover:text-white transition-colors"><FiArrowLeft size={14} /> Back to Login</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
