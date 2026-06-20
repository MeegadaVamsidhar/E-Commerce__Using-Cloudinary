import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiClock, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi'
import { getSellerDashboard, getSellerProducts, deleteSellerProduct } from '../services/sellerService'
import { formatPrice, formatDate } from '../utils/helpers'
import Loader from '../components/common/Loader'
import toast from 'react-hot-toast'

const SellerDashboard = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'
  const { user } = useSelector((state) => state.auth)
  const [dashboard, setDashboard] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentTab === 'overview') {
          const { data } = await getSellerDashboard()
          setDashboard(data)
        } else if (currentTab === 'products') {
          const { data } = await getSellerProducts()
          setProducts(data.products)
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentTab])

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteSellerProduct(id)
      setProducts(products.filter(p => p._id !== id))
      toast.success('Product deleted')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  if (loading) return <div className="pt-32 flex justify-center"><Loader size="lg" /></div>

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <FiTrendingUp size={18} /> },
    { id: 'products', label: 'My Products', icon: <FiPackage size={18} /> },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="mb-10 animate-fade-in">
        <Link to="/" className="text-slate-400 text-sm hover:text-white flex items-center gap-2 mb-4">
          <FiArrowLeft size={14} /> Back to Home
        </Link>
        <h1 className="font-display font-bold text-4xl text-white mb-2">
          Seller <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-slate-400">
          {dashboard?.seller?.storeName || user?.name}'s Store
          {dashboard?.seller?.status === 'pending' && (
            <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
              Awaiting Approval
            </span>
          )}
          {dashboard?.seller?.status === 'approved' && (
            <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
              Approved
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === tab.id
                ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {currentTab === 'overview' && dashboard && (
        <div className="animate-fade-in space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FiPackage size={24} />} label="Total Products" value={dashboard.stats.totalProducts} color="text-blue-400" />
            <StatCard icon={<FiCheckCircle size={24} />} label="Approved" value={dashboard.stats.approvedProducts} color="text-emerald-400" />
            <StatCard icon={<FiClock size={24} />} label="Pending" value={dashboard.stats.pendingProducts} color="text-amber-400" />
            <StatCard icon={<FiDollarSign size={24} />} label="Total Earnings" value={formatPrice(dashboard.stats.totalEarnings)} color="text-primary-400" />
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <span className="text-slate-300 text-sm">Total Revenue</span>
                  <span className="text-emerald-400 font-bold">{formatPrice(dashboard.stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <span className="text-slate-300 text-sm">Admin Commission ({dashboard.seller.commissionRate}%)</span>
                  <span className="text-rose-400 font-bold">-{formatPrice(dashboard.stats.totalCommission)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl border-2 border-primary-500/30" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <span className="text-white font-semibold">Your Earnings</span>
                  <span className="text-primary-400 font-bold text-2xl">{formatPrice(dashboard.stats.totalEarnings)}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4">Store Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Store Name</span><span className="text-white font-semibold">{dashboard.seller.storeName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Commission Rate</span><span className="text-white font-semibold">{dashboard.seller.commissionRate}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className={`font-bold capitalize ${dashboard.seller.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>{dashboard.seller.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Orders</span><span className="text-white font-semibold">{dashboard.stats.totalOrders}</span></div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          {dashboard.recentOrders?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {dashboard.recentOrders.slice(0, 5).map(order => (
                  <div key={order._id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)' }}>
                    <div>
                      <p className="text-white font-semibold text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-slate-500 text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className="text-white font-bold">{formatPrice(order.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentTab === 'products' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-xl">{products.length} Products</h3>
            <Link to="/seller/products/new" className="btn-primary px-5 py-2.5 flex items-center gap-2">
              <FiPlus size={16} /> Add Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <FiPackage size={28} className="text-primary-400 opacity-50" />
              </div>
              <p className="text-white font-bold mb-2">No products yet</p>
              <p className="text-slate-400 text-sm mb-6">Add your first product to start selling</p>
              <Link to="/seller/products/new" className="btn-primary px-6 py-3">Add Product</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="glass-card overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <ApprovalBadge status={product.approvalStatus} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-bold text-sm mb-1 truncate">{product.name}</h4>
                    <p className="text-primary-400 font-bold text-lg mb-3">{formatPrice(product.price)}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Stock: {product.stock}</span>
                      <div className="flex gap-2">
                        <Link to={`/seller/products/${product._id}/edit`} className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors" title="Edit">
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => handleDeleteProduct(product._id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`} style={{ background: 'rgba(99,102,241,0.1)' }}>{icon}</div>
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-white font-bold text-xl">{value}</p>
      </div>
    </div>
  </div>
)

const ApprovalBadge = ({ status }) => {
  const config = {
    approved: { bg: 'bg-emerald-500', text: 'Approved', icon: <FiCheckCircle size={12} /> },
    pending: { bg: 'bg-amber-500', text: 'Pending', icon: <FiClock size={12} /> },
    rejected: { bg: 'bg-rose-500', text: 'Rejected', icon: <FiXCircle size={12} /> },
  }
  const { bg, text, icon } = config[status] || config.pending
  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white ${bg}`}>
      {icon} {text}
    </span>
  )
}

export default SellerDashboard
