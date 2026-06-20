import { useState, useEffect } from 'react'
import { getPendingSellers, approveSeller, rejectSeller } from '../../services/sellerService'
import { FiCheckCircle, FiXCircle, FiShoppingBag, FiMail } from 'react-icons/fi'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const AdminSellers = () => {
  const [sellers, setSellers] = useState([])
  const [approvedSellers, setApprovedSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      const { data } = await getPendingSellers()
      setSellers(data.sellers || [])
    } catch (err) {
      toast.error('Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await approveSeller(id)
      setSellers(sellers.filter(s => s._id !== id))
      toast.success('Seller approved')
    } catch (err) { toast.error('Failed') }
  }

  const handleReject = async (id) => {
    try {
      await rejectSeller(id)
      setSellers(sellers.filter(s => s._id !== id))
      toast.success('Seller rejected')
    } catch (err) { toast.error('Failed') }
  }

  if (loading) return <div className="pt-32 flex justify-center"><Loader size="lg" /></div>

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Seller <span className="gradient-text">Management</span></h1>
        <p className="text-slate-400 mt-1">Approve and manage seller applications</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('pending')} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'pending' ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
          Pending ({sellers.length})
        </button>
      </div>

      {tab === 'pending' && (
        <div className="space-y-4">
          {sellers.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <FiShoppingBag size={28} className="text-primary-400 opacity-50" />
              </div>
              <p className="text-white font-bold mb-2">No pending applications</p>
              <p className="text-slate-400 text-sm">All seller applications have been processed</p>
            </div>
          ) : (
            sellers.map(seller => (
              <div key={seller._id} className="glass-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <img src={seller.avatar?.url || `https://ui-avatars.com/api/?name=${seller.name}&background=6366f1&color=fff&size=48`} alt={seller.name} className="w-12 h-12 rounded-xl" />
                    <div>
                      <h3 className="text-white font-bold">{seller.name}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1"><FiMail size={12} /> {seller.email}</p>
                      <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <p className="text-primary-400 font-bold text-sm">🏪 {seller.sellerInfo?.storeName}</p>
                        <p className="text-slate-400 text-xs mt-1">{seller.sellerInfo?.storeDescription}</p>
                        {seller.sellerInfo?.bankDetails?.accountHolder && (
                          <div className="mt-2 text-xs text-slate-500">
                            <p>Bank: {seller.sellerInfo.bankDetails.bankName}</p>
                            <p>Account: ****{seller.sellerInfo.bankDetails.accountNumber?.slice(-4)}</p>
                            <p>IFSC: {seller.sellerInfo.bankDetails.ifsc}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(seller._id)} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                      <FiCheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleReject(seller._id)} className="btn-secondary px-6 py-2.5 flex items-center gap-2 text-rose-400 border-rose-500/30">
                      <FiXCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AdminSellers
