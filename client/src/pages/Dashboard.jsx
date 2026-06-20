import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiUser, FiPackage, FiHeart, FiLogOut, FiEdit2, FiChevronRight, FiMail, FiCalendar, FiShoppingBag, FiClock } from 'react-icons/fi'
import { fetchUserOrders } from '../redux/slices/orderSlice'
import { updateProfile, logout } from '../redux/slices/authSlice'
import { formatPrice, formatDate, getOrderStatusClass } from '../utils/helpers'
import Loader from '../components/common/Loader'
import ProductCard from '../components/product/ProductCard'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'profile'

  const { user } = useSelector((state) => state.auth)
  const { orders, loading: ordersLoading } = useSelector((state) => state.order)
  const { products: wishlist } = useSelector((state) => state.wishlist)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  useEffect(() => { if (currentTab === 'orders') dispatch(fetchUserOrders()) }, [dispatch, currentTab])
  useEffect(() => { if (user) { setName(user.name); setEmail(user.email) } }, [user])

  const handleUpdate = (e) => {
    e.preventDefault()
    dispatch(updateProfile({ name, email }))
    setIsEditing(false)
    toast.success('Profile updated!')
  }

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={18} />, desc: 'Account settings' },
    { id: 'orders', label: 'My Orders', icon: <FiPackage size={18} />, desc: `${orders.length} orders` },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart size={18} />, desc: `${wishlist.length} items` },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="font-display font-bold text-4xl text-white mb-2">
          My <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-slate-400">Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-3">
          {/* Profile Card */}
          <div className="glass-card p-6 text-center mb-4">
            <div className="relative inline-block mb-4">
              <img 
                src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=80`} 
                className="w-20 h-20 rounded-2xl border-2 border-primary-500/30 shadow-lg" 
                alt={user?.name}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0a0820]" />
            </div>
            <h2 className="text-white font-bold text-lg">{user?.name}</h2>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              {user?.role}
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setSearchParams({ tab: tab.id })} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  currentTab === tab.id 
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon} 
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className={`text-[10px] ${currentTab === tab.id ? 'text-white/70' : 'text-slate-600'}`}>{tab.desc}</div>
                </div>
              </button>
            ))}
          </nav>

          <button 
            onClick={() => { dispatch(logout()); toast.success('Logged out') }} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <FiLogOut size={18} /> Logout
          </button>

          {!user?.isSeller && user?.role !== 'admin' && (
            <Link to="/become-seller" className="block mt-4 p-4 rounded-xl text-center transition-all hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
              <p className="text-white font-bold text-sm mb-1">🏪 Become a Seller</p>
              <p className="text-slate-400 text-xs">Start selling your products</p>
            </Link>
          )}

          {user?.isSeller && (
            <Link to="/seller" className="block mt-4 p-4 rounded-xl text-center transition-all hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-white font-bold text-sm mb-1">📊 Seller Dashboard</p>
              <p className="text-slate-400 text-xs">Manage your store</p>
            </Link>
          )}
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {currentTab === 'profile' && (
            <div className="glass-card p-8 animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-bold text-xl font-display">Account Settings</h3>
                  <p className="text-slate-400 text-sm mt-1">Manage your personal information</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                    <FiEdit2 size={12} /> Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><FiUser size={14} /> Full Name</div>
                  <p className="text-white font-semibold">{user?.name}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><FiMail size={14} /> Email</div>
                  <p className="text-white font-semibold">{user?.email}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><FiShoppingBag size={14} /> Total Orders</div>
                  <p className="text-white font-semibold">{orders.length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><FiHeart size={14} /> Wishlist</div>
                  <p className="text-white font-semibold">{wishlist.length} items</p>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <form onSubmit={handleUpdate} className="space-y-6 p-6 rounded-2xl animate-slide-up" style={{ background: 'rgba(22,19,61,0.5)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div>
                    <label className="input-label">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary px-8">Save Changes</button>
                    <button type="button" onClick={() => { setIsEditing(false); setName(user?.name || ''); setEmail(user?.email || '') }} className="btn-secondary px-8">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {currentTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-white font-bold text-xl font-display">Order History</h3>
                  <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
                </div>
              </div>
              {ordersLoading ? <div className="flex justify-center py-16"><Loader size="lg" /></div> : orders.length === 0 ? (
                <div className="text-center py-20 glass-card">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <FiPackage size={28} className="text-primary-400 opacity-50" />
                  </div>
                  <p className="text-white font-bold mb-2">No orders yet</p>
                  <p className="text-slate-400 text-sm mb-6">Start shopping to see your orders here</p>
                  <Link to="/products" className="btn-primary px-6 py-3">Browse Products</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Link key={order._id} to={`/orders/${order._id}`} className="block p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all duration-300 group hover:-translate-y-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500 font-mono mb-1">ORDER #{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-white font-bold text-lg">{formatPrice(order.totalPrice)}</p>
                        </div>
                        <span className={`${getOrderStatusClass(order.orderStatus)} px-3 py-1 text-[10px] font-bold rounded-full`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><FiCalendar size={12} /> {formatDate(order.createdAt)}</span>
                          <span className="flex items-center gap-1"><FiShoppingBag size={12} /> {order.orderItems.length} Items</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary-400 text-xs font-bold group-hover:gap-2 transition-all">
                          View Details <FiChevronRight />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'wishlist' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-bold text-xl font-display">My Wishlist</h3>
                  <p className="text-slate-400 text-sm mt-1">{wishlist.length} saved items</p>
                </div>
              </div>
              {wishlist.length === 0 ? (
                <div className="text-center py-20 glass-card">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(244,114,182,0.1)' }}>
                    <FiHeart size={28} className="text-rose-400 opacity-50" />
                  </div>
                  <p className="text-white font-bold mb-2">Wishlist is empty</p>
                  <p className="text-slate-400 text-sm mb-6">Save items you love for later</p>
                  <Link to="/products" className="btn-primary px-6 py-3">Explore Products</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{wishlist.map(p => <ProductCard key={p._id} product={p} />)}</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
