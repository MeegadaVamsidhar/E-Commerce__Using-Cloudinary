import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiDollarSign, FiShoppingBag, FiUsers, FiClock, FiArrowRight, FiPackage, FiCheckCircle, FiXCircle, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiBell, FiBarChart2, FiTruck, FiPercent, FiBox, FiActivity, FiMapPin, FiChevronDown, FiRefreshCw } from 'react-icons/fi'
import { fetchDashboardStats, fetchAdminOrders } from '../../redux/slices/adminSlice'
import { getPendingSellers, approveSeller, rejectSeller, getPendingProducts, approveProduct, rejectProduct } from '../../services/sellerService'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import { formatPrice, formatDate, getOrderStatusClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview', label: 'Overview', icon: <FiActivity size={16} /> },
  { id: 'inventory', label: 'Inventory', icon: <FiBox size={16} /> },
  { id: 'sales', label: 'Sales', icon: <FiBarChart2 size={16} /> },
  { id: 'delivery', label: 'Delivery', icon: <FiTruck size={16} /> },
  { id: 'commissions', label: 'Commissions', icon: <FiPercent size={16} /> },
]

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { stats, orders, loading } = useSelector((state) => state.admin)
  const [activeTab, setActiveTab] = useState('overview')
  const [pendingSellers, setPendingSellers] = useState([])
  const [pendingProducts, setPendingProducts] = useState([])
  const [inventoryData, setInventoryData] = useState(null)
  const [salesData, setSalesData] = useState(null)
  const [deliveryData, setDeliveryData] = useState(null)
  const [commissionData, setCommissionData] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [salesPeriod, setSalesPeriod] = useState('month')

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchAdminOrders({ limit: 5 }))
    loadPendingItems()
  }, [dispatch])

  useEffect(() => {
    loadTabData()
  }, [activeTab, salesPeriod])

  const loadPendingItems = async () => {
    try {
      const [sellersRes, productsRes] = await Promise.all([getPendingSellers(), getPendingProducts()])
      setPendingSellers(sellersRes.data.sellers)
      setPendingProducts(productsRes.data.products)
    } catch (err) {
      console.error('Failed to load pending items')
    }
  }

  const loadTabData = async () => {
    setDataLoading(true)
    try {
      if (activeTab === 'inventory') {
        const { data } = await api.get('/admin/inventory')
        setInventoryData(data)
      } else if (activeTab === 'sales') {
        const { data } = await api.get(`/admin/sales?period=${salesPeriod}`)
        setSalesData(data)
      } else if (activeTab === 'delivery') {
        const { data } = await api.get('/admin/delivery')
        setDeliveryData(data)
      } else if (activeTab === 'commissions') {
        const { data } = await api.get('/admin/commissions')
        setCommissionData(data)
      }
    } catch (err) {
      console.error(`Failed to load ${activeTab} data`)
    } finally {
      setDataLoading(false)
    }
  }

  const handleApproveSeller = async (id) => {
    try {
      await approveSeller(id)
      setPendingSellers(pendingSellers.filter(s => s._id !== id))
      toast.success('Seller approved')
    } catch (err) { toast.error('Failed to approve seller') }
  }

  const handleRejectSeller = async (id) => {
    try {
      await rejectSeller(id)
      setPendingSellers(pendingSellers.filter(s => s._id !== id))
      toast.success('Seller rejected')
    } catch (err) { toast.error('Failed to reject seller') }
  }

  const handleApproveProduct = async (id) => {
    try {
      await approveProduct(id)
      setPendingProducts(pendingProducts.filter(p => p._id !== id))
      toast.success('Product approved')
    } catch (err) { toast.error('Failed to approve product') }
  }

  const handleRejectProduct = async (id) => {
    try {
      await rejectProduct(id, 'Does not meet quality standards')
      setPendingProducts(pendingProducts.filter(p => p._id !== id))
      toast.success('Product rejected')
    } catch (err) { toast.error('Failed to reject product') }
  }

  if (loading && !stats) return <div className="pt-32 flex justify-center"><Loader size="lg" text="Loading dashboard..." /></div>

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Monitor sales, inventory, delivery & commissions</p>
          </div>
          <div className="flex items-center gap-3">
            {stats?.pendingNotifications > 0 && (
              <Link to="/admin/notifications" className="relative p-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
                <FiBell size={20} className="text-amber-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {stats.pendingNotifications}
                </span>
              </Link>
            )}
            <span className="badge-primary text-sm px-4 py-2">🔑 Admin Panel</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { to: '/admin/products', label: '📦 Products', sub: 'Manage inventory' },
            { to: '/admin/orders', label: '🛒 Orders', sub: 'Process orders' },
            { to: '/admin/users', label: '👥 Users', sub: 'Customer list' },
            { to: '/admin/products/new', label: '➕ Add Product', sub: 'Create listing' },
            { to: '/admin/sellers', label: '🏪 Sellers', sub: 'Manage sellers' },
          ].map(({ to, label, sub }) => (
            <Link
              key={to}
              to={to}
              className="p-4 rounded-2xl text-center transition-all hover:-translate-y-1"
              style={{
                background: 'rgba(22,19,61,0.6)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)' }}
            >
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-1">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && <OverviewTab stats={stats} orders={orders} pendingSellers={pendingSellers} pendingProducts={pendingProducts} handleApproveSeller={handleApproveSeller} handleRejectSeller={handleRejectSeller} handleApproveProduct={handleApproveProduct} handleRejectProduct={handleRejectProduct} />}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && <InventoryTab data={inventoryData} loading={dataLoading} />}

        {/* Sales Tab */}
        {activeTab === 'sales' && <SalesTab data={salesData} loading={dataLoading} period={salesPeriod} setPeriod={setSalesPeriod} />}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && <DeliveryTab data={deliveryData} loading={dataLoading} />}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && <CommissionsTab data={commissionData} loading={dataLoading} />}
      </div>
    </div>
  )
}

// ==================== OVERVIEW TAB ====================
const OverviewTab = ({ stats, orders, pendingSellers, pendingProducts, handleApproveSeller, handleRejectSeller, handleApproveProduct, handleRejectProduct }) => {
  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: <FiDollarSign size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', desc: 'All time paid orders' },
    { title: 'This Month', value: formatPrice(stats?.thisMonthRevenue || 0), icon: stats?.revenueGrowth >= 0 ? <FiTrendingUp size={22} /> : <FiTrendingDown size={22} />, color: stats?.revenueGrowth >= 0 ? '#10b981' : '#ef4444', bg: stats?.revenueGrowth >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', desc: stats?.revenueGrowth >= 0 ? `+${stats?.revenueGrowth}% vs last month` : `${stats?.revenueGrowth}% vs last month` },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: <FiShoppingBag size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)', desc: 'All time orders placed' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: <FiClock size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', desc: 'Awaiting processing' },
  ]

  const orderBreakdown = stats?.orderStatusBreakdown || []
  const topProducts = stats?.topProducts || []
  const lowStockProducts = stats?.lowStockProducts || []
  const maxOrderCount = Math.max(...orderBreakdown.map(o => o.count), 1)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ title, value, icon, color, bg, desc }) => (
          <div key={title} className="p-5 rounded-2xl transition-all hover:-translate-y-1" style={{ background: 'rgba(22,19,61,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: bg, color }}>{icon}</div>
            <p className="text-3xl font-bold text-white font-display mb-1">{value}</p>
            <p className="text-white text-sm font-medium mb-0.5">{title}</p>
            <p className="text-slate-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-white font-semibold font-display mb-6 flex items-center gap-2"><FiShoppingBag size={18} /> Orders by Status</h2>
          {orderBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orderBreakdown.map(({ _id: status, count }) => {
                const percentage = (count / maxOrderCount) * 100
                const statusColors = {
                  Pending: { bg: 'rgba(245,158,11,0.2)', bar: '#f59e0b', text: '#f59e0b' },
                  Processing: { bg: 'rgba(99,102,241,0.2)', bar: '#6366f1', text: '#6366f1' },
                  Shipped: { bg: 'rgba(59,130,246,0.2)', bar: '#3b82f6', text: '#3b82f6' },
                  Delivered: { bg: 'rgba(16,185,129,0.2)', bar: '#10b981', text: '#10b981' },
                  Cancelled: { bg: 'rgba(239,68,68,0.2)', bar: '#ef4444', text: '#ef4444' },
                }
                const colors = statusColors[status] || { bg: 'rgba(148,163,184,0.2)', bar: '#94a3b8', text: '#94a3b8' }
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: colors.text }}>{status}</span>
                      <span className="text-sm text-slate-400">{count} orders</span>
                    </div>
                    <div className="w-full h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: colors.bar }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-white font-semibold font-display mb-6 flex items-center gap-2"><FiAlertTriangle size={18} /> Stock Alerts</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-rose-400 text-2xl font-bold">{stats?.outOfStockProducts || 0}</p>
              <p className="text-slate-400 text-xs mt-1">Out of Stock Products</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-amber-400 text-2xl font-bold">{lowStockProducts.length}</p>
              <p className="text-slate-400 text-xs mt-1">Low Stock Products</p>
            </div>
          </div>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-white font-semibold font-display mb-6 flex items-center gap-2"><FiTrendingUp size={18} /> Top Selling Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProducts.map((product, idx) => (
              <div key={product.productId} className="p-4 rounded-xl text-center" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="relative w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden">
                  <img src={product.image || 'https://via.placeholder.com/100'} alt={product.name} className="w-full h-full object-cover" />
                  <span className="absolute -top-1 -left-1 w-6 h-6 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                </div>
                <p className="text-white text-xs font-medium truncate">{product.name}</p>
                <p className="text-emerald-400 text-xs font-bold mt-1">{product.totalSold} sold</p>
                <p className="text-slate-500 text-xs">{formatPrice(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold font-display mb-4 flex items-center gap-2"><FiShoppingBag size={18} /> Pending Sellers ({pendingSellers.length})</h2>
          {pendingSellers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No pending seller applications</p>
          ) : (
            <div className="space-y-3">
              {pendingSellers.map(seller => (
                <div key={seller._id} className="p-4 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{seller.name}</p>
                      <p className="text-slate-400 text-xs">{seller.email}</p>
                      <p className="text-primary-400 text-xs font-bold mt-1">🏪 {seller.sellerInfo?.storeName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveSeller(seller._id)} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve"><FiCheckCircle size={18} /></button>
                      <button onClick={() => handleRejectSeller(seller._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors" title="Reject"><FiXCircle size={18} /></button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs">{seller.sellerInfo?.storeDescription?.slice(0, 80)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-white font-semibold font-display mb-4 flex items-center gap-2"><FiPackage size={18} /> Pending Products ({pendingProducts.length})</h2>
          {pendingProducts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No pending product approvals</p>
          ) : (
            <div className="space-y-3">
              {pendingProducts.map(product => (
                <div key={product._id} className="p-4 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{product.name}</p>
                      <p className="text-primary-400 text-xs font-bold">{formatPrice(product.price)}</p>
                      <p className="text-slate-500 text-xs">Seller: {product.seller?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveProduct(product._id)} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve"><FiCheckCircle size={18} /></button>
                      <button onClick={() => handleRejectProduct(product._id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors" title="Reject"><FiXCircle size={18} /></button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs">{product.description?.slice(0, 80)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'rgba(22,19,61,0.8)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <h2 className="text-white font-semibold font-display">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        <div style={{ background: 'rgba(15,13,46,0.9)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((col) => (
                    <th key={col} className="text-left px-6 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="transition-colors border-b" style={{ borderColor: 'rgba(99,102,241,0.05)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-6 py-4">
                      <Link to={`/orders/${order._id}`} className="text-primary-400 font-mono text-sm hover:underline">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{order.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-white font-medium text-sm">{formatPrice(order.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`${getOrderStatusClass(order.orderStatus)} text-xs`}>{order.orderStatus}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <FiPackage size={32} className="mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== INVENTORY TAB ====================
const InventoryTab = ({ data, loading }) => {
  if (loading || !data) return <div className="flex justify-center py-16"><Loader size="lg" /></div>

  const summaryCards = [
    { title: 'Product Groups', value: data.groups, icon: <FiPackage size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { title: 'Seller Listings', value: data.totalListings, icon: <FiBox size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { title: 'Total Stock Units', value: data.totalStock.toLocaleString(), icon: <FiBarChart2 size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { title: 'Inventory Value', value: formatPrice(data.totalInventoryValue), icon: <FiDollarSign size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  ]

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ title, value, icon, color, bg }) => (
          <div key={title} className="p-5 rounded-2xl" style={{ background: 'rgba(22,19,61,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, color }}>{icon}</div>
            <p className="text-2xl font-bold text-white font-display">{value}</p>
            <p className="text-slate-400 text-xs mt-1">{title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stock Alerts */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiAlertTriangle size={18} /> Stock Alerts</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-rose-400 text-2xl font-bold">{data.outOfStockListings.length}</p>
              <p className="text-slate-400 text-xs mt-1">Out of Stock Listings</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-amber-400 text-2xl font-bold">{data.lowStockListings.length}</p>
              <p className="text-slate-400 text-xs mt-1">Low Stock Listings (≤10)</p>
            </div>
          </div>
          {data.outOfStockListings.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-400 text-xs mb-2">Out of Stock:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.outOfStockListings.map(p => (
                  <div key={p._id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 truncate mr-2">{p.name}</span>
                    <span className="text-rose-400 font-bold whitespace-nowrap">{p.seller?.name || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.lowStockListings.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-400 text-xs mb-2">Low Stock:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.lowStockListings.map(p => (
                  <div key={p._id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 truncate mr-2">{p.name}</span>
                    <span className="text-amber-400 font-bold whitespace-nowrap">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inventory by Category */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiBarChart2 size={18} /> Inventory by Category</h2>
          <div className="space-y-4">
            {Object.entries(data.inventoryByCategory).map(([category, info]) => (
              <div key={category} className="p-3 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-semibold">{category}</span>
                  <span className="text-slate-400 text-xs">{info.sellerCount} sellers</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Stock: {info.totalStock.toLocaleString()}</span>
                  <span>Value: {formatPrice(info.totalValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Groups Table */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiPackage size={18} /> Product Groups ({data.groups.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                {['Product', 'Category', 'Sellers', 'Price Range', 'Avg Rating', 'Reviews'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.groups.map((group) => (
                <tr key={group._id} className="border-b" style={{ borderColor: 'rgba(99,102,241,0.05)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={group.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={group.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-white text-sm font-medium">{group.name}</p>
                        <p className="text-slate-500 text-xs">{group.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="badge-primary text-xs">{group.category}</span></td>
                  <td className="px-4 py-3 text-white text-sm">{group.sellerCount}</td>
                  <td className="px-4 py-3 text-white text-sm">{formatPrice(group.lowestPrice)} - {formatPrice(group.highestPrice)}</td>
                  <td className="px-4 py-3 text-amber-400 text-sm">⭐ {group.avgRating?.toFixed(1) || '0.0'}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{group.totalReviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ==================== SALES TAB ====================
const SalesTab = ({ data, loading, period, setPeriod }) => {
  if (loading || !data) return <div className="flex justify-center py-16"><Loader size="lg" /></div>

  const summaryCards = [
    { title: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: <FiDollarSign size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { title: 'Total Orders', value: data.totalOrders, icon: <FiShoppingBag size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { title: 'Avg Order Value', value: formatPrice(data.avgOrderValue), icon: <FiTrendingUp size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { title: 'Active Sellers', value: data.sellerSales.length, icon: <FiUsers size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(({ title, value, icon, color, bg }) => (
            <div key={title} className="p-5 rounded-2xl" style={{ background: 'rgba(22,19,61,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, color }}>{icon}</div>
              <p className="text-2xl font-bold text-white font-display">{value}</p>
              <p className="text-slate-400 text-xs mt-1">{title}</p>
            </div>
          ))}
        </div>
        <div className="relative ml-6">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="appearance-none input-field py-3 pr-10 pl-4 text-sm" style={{ background: 'rgba(22,19,61,0.8)' }}>
            <option value="week" style={{ background: '#0a0820' }}>This Week</option>
            <option value="month" style={{ background: '#0a0820' }}>This Month</option>
            <option value="year" style={{ background: '#0a0820' }}>This Year</option>
            <option value="all" style={{ background: '#0a0820' }}>All Time</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Revenue Chart (simple bar visualization) */}
      {data.revenueChartData.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-white font-semibold mb-6 flex items-center gap-2"><FiBarChart2 size={18} /> Revenue Trend</h2>
          <div className="flex items-end gap-2 h-48">
            {data.revenueChartData.map((day, idx) => {
              const maxRevenue = Math.max(...data.revenueChartData.map(d => d.revenue), 1)
              const height = (day.revenue / maxRevenue) * 100
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatPrice(day.revenue)}
                    </div>
                  </div>
                  <div className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80" style={{ height: `${height}%`, background: 'linear-gradient(to top, #6366f1, #8b5cf6)', minHeight: day.revenue > 0 ? '4px' : '0' }} />
                  <span className="text-slate-500 text-[10px] mt-2 truncate w-full text-center">{day.date}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Seller Sales */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiUsers size={18} /> Sales by Seller</h2>
          {data.sellerSales.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.sellerSales.map((seller) => (
                <div key={seller.sellerId} className="p-4 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold text-sm">{seller.sellerName}</p>
                      <p className="text-slate-400 text-xs">{seller.totalItems} items sold • {seller.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-sm">{formatPrice(seller.totalRevenue)}</p>
                      <p className="text-slate-500 text-xs">Commission: {formatPrice(seller.commission)}</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${data.sellerSales[0]?.totalRevenue > 0 ? (seller.totalRevenue / data.sellerSales[0].totalRevenue) * 100 : 0}%`, background: '#6366f1' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiTrendingUp size={18} /> Top Selling Items</h2>
          {data.topSellingItems.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topSellingItems.map((item, idx) => (
                <div key={item.productId} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <span className="text-slate-500 text-sm font-bold w-6 text-center">{idx + 1}</span>
                  <img src={item.image || 'https://via.placeholder.com/40'} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs">{item.totalSold} sold</p>
                  </div>
                  <p className="text-emerald-400 font-bold text-sm">{formatPrice(item.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ==================== DELIVERY TAB ====================
const DeliveryTab = ({ data, loading }) => {
  if (loading || !data) return <div className="flex justify-center py-16"><Loader size="lg" /></div>

  const summaryCards = [
    { title: 'Total Orders', value: data.totalOrders, icon: <FiShoppingBag size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { title: 'Pending', value: data.pendingCount, icon: <FiClock size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { title: 'Shipped', value: data.shippedCount, icon: <FiTruck size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { title: 'Delivered', value: data.deliveredCount, icon: <FiCheckCircle size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { title: 'Cancelled', value: data.cancelledCount, icon: <FiXCircle size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { title: 'Avg Delivery', value: `${data.avgDeliveryTime}h`, icon: <FiRefreshCw size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ]

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {summaryCards.map(({ title, value, icon, color, bg }) => (
          <div key={title} className="p-5 rounded-2xl" style={{ background: 'rgba(22,19,61,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, color }}>{icon}</div>
            <p className="text-2xl font-bold text-white font-display">{value}</p>
            <p className="text-slate-400 text-xs mt-1">{title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Delivery Performance */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiActivity size={18} /> Delivery Performance</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-emerald-400 text-2xl font-bold">{data.deliveryPerformance.onTimePercentage}%</p>
                  <p className="text-slate-400 text-xs mt-1">On-Time Delivery Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm">{data.deliveryPerformance.onTime} on time</p>
                  <p className="text-rose-400 text-sm">{data.deliveryPerformance.delayed} delayed</p>
                </div>
              </div>
              <div className="mt-3 w-full h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: `${data.deliveryPerformance.onTimePercentage}%`, background: '#10b981' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-primary-400 text-2xl font-bold">{data.avgDeliveryTime}h</p>
              <p className="text-slate-400 text-xs mt-1">Average Delivery Time</p>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiBarChart2 size={18} /> Order Status Breakdown</h2>
          <div className="space-y-4">
            {data.statusBreakdown.map(({ _id: status, count, totalValue }) => {
              const statusColors = {
                Pending: { bar: '#f59e0b', text: '#f59e0b' },
                Processing: { bar: '#6366f1', text: '#6366f1' },
                Shipped: { bar: '#3b82f6', text: '#3b82f6' },
                Delivered: { bar: '#10b981', text: '#10b981' },
                Cancelled: { bar: '#ef4444', text: '#ef4444' },
              }
              const colors = statusColors[status] || { bar: '#94a3b8', text: '#94a3b8' }
              const percentage = data.totalOrders > 0 ? (count / data.totalOrders) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: colors.text }}>{status}</span>
                    <span className="text-sm text-slate-400">{count} ({percentage.toFixed(0)}%) — {formatPrice(totalValue)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: colors.bar }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      {data.pendingOrders.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiClock size={18} /> Pending Orders — Action Required</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Action'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.pendingOrders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="border-b" style={{ borderColor: 'rgba(99,102,241,0.05)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="text-primary-400 font-mono text-sm hover:underline">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{order.orderItems.length} items</td>
                    <td className="px-4 py-3 text-white font-medium text-sm">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="badge-warning text-xs">Needs Processing</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shipped Orders */}
      {data.shippedOrders.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiMapPin size={18} /> Currently Shipped</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Shipped Date'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.shippedOrders.map((order) => (
                  <tr key={order._id} className="border-b" style={{ borderColor: 'rgba(99,102,241,0.05)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="text-blue-400 font-mono text-sm hover:underline">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{order.orderItems.length} items</td>
                    <td className="px-4 py-3 text-white font-medium text-sm">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{formatDate(order.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

// ==================== COMMISSIONS TAB ====================
const CommissionsTab = ({ data, loading }) => {
  if (loading || !data) return <div className="flex justify-center py-16"><Loader size="lg" /></div>

  const summaryCards = [
    { title: 'Gross Revenue', value: formatPrice(data.totalGrossRevenue), icon: <FiDollarSign size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { title: 'Platform Commission', value: formatPrice(data.totalPlatformCommission), icon: <FiPercent size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { title: 'Seller Earnings', value: formatPrice(data.totalSellerEarnings), icon: <FiUsers size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { title: 'Platform Margin', value: `${data.platformMargin}%`, icon: <FiTrendingUp size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ]

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ title, value, icon, color, bg }) => (
          <div key={title} className="p-5 rounded-2xl" style={{ background: 'rgba(22,19,61,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, color }}>{icon}</div>
            <p className="text-2xl font-bold text-white font-display">{value}</p>
            <p className="text-slate-400 text-xs mt-1">{title}</p>
          </div>
        ))}
      </div>

      {/* Revenue Distribution */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-white font-semibold mb-6 flex items-center gap-2"><FiBarChart2 size={18} /> Revenue Distribution</h2>
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <div className="w-full h-8 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${data.platformMargin}%`, background: '#10b981' }} />
              <div className="h-full transition-all duration-700" style={{ width: `${100 - data.platformMargin}%`, background: '#6366f1' }} />
            </div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
                <span className="text-sm text-slate-400">Platform: {formatPrice(data.totalPlatformCommission)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#6366f1' }} />
                <span className="text-sm text-slate-400">Sellers: {formatPrice(data.totalSellerEarnings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commission by Seller */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiPercent size={18} /> Commission by Seller</h2>
          {data.commissionData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No commission data yet</p>
          ) : (
            <div className="space-y-3">
              {data.commissionData.map((seller) => (
                <div key={seller.sellerId} className="p-4 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{seller.sellerName}</p>
                      <p className="text-slate-400 text-xs">{seller.sellerEmail}</p>
                    </div>
                    <span className="badge-primary text-xs">{seller.commissionRate}% commission</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                    <div>
                      <p className="text-slate-500">Revenue</p>
                      <p className="text-white font-bold">{formatPrice(seller.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Commission</p>
                      <p className="text-emerald-400 font-bold">{formatPrice(seller.totalCommission)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Seller Gets</p>
                      <p className="text-blue-400 font-bold">{formatPrice(seller.totalEarnings)}</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">{seller.itemsSold} items • {seller.ordersCount} orders</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Earners */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiTrendingUp size={18} /> Top Earners (Seller Payout)</h2>
          {data.topEarners.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No earnings data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topEarners.map((seller, idx) => (
                <div key={seller.sellerId} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{seller.sellerName}</p>
                    <p className="text-slate-400 text-xs">{seller.itemsSold} items sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">{formatPrice(seller.totalEarnings)}</p>
                    <p className="text-slate-500 text-xs">Seller payout</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commission Settlement Table */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><FiPercent size={18} /> Commission Settlement Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                {['Seller', 'Email', 'Commission Rate', 'Total Revenue', 'Platform Commission', 'Seller Earnings', 'Items Sold', 'Orders', 'Status'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.commissionData.map((seller) => (
                <tr key={seller.sellerId} className="border-b" style={{ borderColor: 'rgba(99,102,241,0.05)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3 text-white text-sm font-medium">{seller.sellerName}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{seller.sellerEmail}</td>
                  <td className="px-4 py-3 text-primary-400 text-sm">{seller.commissionRate}%</td>
                  <td className="px-4 py-3 text-white text-sm">{formatPrice(seller.totalRevenue)}</td>
                  <td className="px-4 py-3 text-emerald-400 text-sm font-bold">{formatPrice(seller.totalCommission)}</td>
                  <td className="px-4 py-3 text-blue-400 text-sm font-bold">{formatPrice(seller.totalEarnings)}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{seller.itemsSold}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{seller.ordersCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${seller.sellerStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : seller.sellerStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {seller.sellerStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
