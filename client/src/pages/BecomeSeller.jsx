import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiDollarSign, FiTrendingUp, FiShield, FiCheck, FiArrowRight } from 'react-icons/fi'
import { applyForSeller } from '../services/sellerService'
import toast from 'react-hot-toast'

const BecomeSeller = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ storeName: '', storeDescription: '', accountHolder: '', accountNumber: '', ifsc: '', bankName: '' })
  const [loading, setLoading] = useState(false)

  const FEATURES = [
    { icon: <FiDollarSign size={24} />, title: 'Earn Money', desc: 'Sell your products to thousands of customers' },
    { icon: <FiTrendingUp size={24} />, title: 'Grow Your Business', desc: 'Reach a wider audience with our platform' },
    { icon: <FiShield size={24} />, title: 'Secure Payments', desc: 'Get paid safely with our escrow system' },
    { icon: <FiShoppingBag size={24} />, title: 'Your Own Store', desc: 'Customize your storefront and brand' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.storeName.trim() || !form.storeDescription.trim()) {
      return toast.error('Store name and description are required')
    }
    setLoading(true)
    try {
      await applyForSeller({
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription.trim(),
        bankDetails: {
          accountHolder: form.accountHolder.trim(),
          accountNumber: form.accountNumber.trim(),
          ifsc: form.ifsc.trim(),
          bankName: form.bankName.trim(),
        }
      })
      toast.success('Application submitted! Admin will review shortly.')
      navigate('/seller')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Become a <span className="gradient-text">Seller</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Start selling your products on ShopNova and reach thousands of customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Features */}
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="glass-card p-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-400 mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>{f.icon}</div>
                  <h3 className="text-white font-bold mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold text-lg mb-4">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Apply', desc: 'Fill out the seller application form' },
                  { step: '2', title: 'Get Approved', desc: 'Admin reviews and approves your application' },
                  { step: '3', title: 'List Products', desc: 'Add your products for admin approval' },
                  { step: '4', title: 'Start Selling', desc: 'Earn money on every sale minus commission' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>{item.step}</div>
                    <div>
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card p-8 sticky top-24">
              <h2 className="text-white font-bold text-xl mb-6">Seller Application</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="input-label">Store Name *</label>
                  <input type="text" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} placeholder="My Awesome Store" className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Store Description *</label>
                  <textarea value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} rows={3} placeholder="Tell customers about your store..." className="input-field resize-none" required />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-4 text-sm">Bank Details (for payouts)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="input-label">Account Holder Name</label>
                      <input type="text" value={form.accountHolder} onChange={e => setForm({...form, accountHolder: e.target.value})} placeholder="John Doe" className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Account Number</label>
                        <input type="text" value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} placeholder="1234567890" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">IFSC Code</label>
                        <input type="text" value={form.ifsc} onChange={e => setForm({...form, ifsc: e.target.value})} placeholder="SBIN0001234" className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Bank Name</label>
                      <input type="text" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} placeholder="State Bank of India" className="input-field" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <FiCheck size={14} className="text-primary-400" />
                    Admin commission: 10% per sale. Payouts processed weekly.
                  </p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-50">
                  {loading ? (
                    <><span className="loading-spinner" /> Submitting...</>
                  ) : (
                    <>Submit Application <FiArrowRight size={16} /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BecomeSeller
