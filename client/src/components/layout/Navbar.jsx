import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiShoppingCart, FiUser, FiSearch, FiMenu, FiX,
  FiHeart, FiPackage, FiLogOut, FiChevronDown, FiHome, FiShoppingBag
} from 'react-icons/fi'
import { MdAdminPanelSettings } from 'react-icons/md'
import { logout } from '../../redux/slices/authSlice'
import useScrollPosition from '../../hooks/useScrollPosition'
import toast from 'react-hot-toast'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { cart } = useSelector((state) => state.cart)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { isScrolled } = useScrollPosition()
  const dropdownRef = useRef(null)
  const cartItemCount = cart?.totalItems || 0

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }
    navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    setIsUserDropdownOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/')
    toast.success('Logged out successfully')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: isScrolled ? 'rgba(10, 8, 32, 0.95)' : 'rgba(10, 8, 32, 0.6)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(10px)',
        borderBottom: isScrolled ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(99, 102, 241, 0.05)',
        boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>SN</div>
            <span className="font-display font-bold text-xl text-white hidden sm:block">Shop<span className="gradient-text">Nova</span></span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-white placeholder-slate-400 outline-none transition-all duration-300"
                style={{ 
                  background: 'rgba(99,102,241,0.08)', 
                  border: '1px solid rgba(99,102,241,0.15)',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(99,102,241,0.12)'
                  e.target.style.borderColor = 'rgba(99,102,241,0.4)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(99,102,241,0.08)'
                  e.target.style.borderColor = 'rgba(99,102,241,0.15)'
                }}
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><FiHome size={16} className="inline mr-1" /> Home</NavLink>
              <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Shop</NavLink>
            </div>

            {/* Wishlist Button */}
            {user && (
              <Link to="/wishlist" className="btn-ghost relative p-2.5 rounded-xl transition-all duration-300 hover:text-rose-400 hover:bg-rose-500/10 group" title="Wishlist">
                <FiHeart size={20} className="group-hover:fill-current transition-transform group-hover:scale-110" />
              </Link>
            )}

            {/* Cart Button */}
            <Link to="/cart" className="btn-ghost relative p-2.5 rounded-xl transition-all duration-300 hover:text-primary-400 hover:bg-primary-500/10 group" title="Shopping Cart">
              <FiShoppingCart size={20} className="group-hover:fill-current transition-transform group-hover:scale-110" />
              {cartItemCount > 0 && (
                <span className="cart-badge animate-scale-in">{cartItemCount}</span>
              )}
            </Link>

            {/* User Menu / Auth Buttons */}
            {user ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/5 group"
                  aria-label="User menu"
                  aria-expanded={isUserDropdownOpen}
                >
                  <img 
                    src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=36`} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:border-primary-400 transition-colors" 
                  />
                  <span className="hidden sm:block text-sm font-medium text-slate-200">{user.name.split(' ')[0]}</span>
                  <FiChevronDown 
                    size={14} 
                    className={`text-slate-400 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isUserDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl py-2 z-50 animate-slide-down shadow-2xl"
                    style={{ 
                      background: 'rgba(16, 14, 45, 0.98)', 
                      border: '1px solid rgba(99,102,241,0.25)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-slate-400 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="py-2 space-y-1">
                      <DropdownItem 
                        to="/dashboard" 
                        icon={<FiUser size={16} />} 
                        label="Profile & Settings" 
                        onClick={() => setIsUserDropdownOpen(false)} 
                      />
                      <DropdownItem 
                        to="/dashboard?tab=orders" 
                        icon={<FiPackage size={16} />} 
                        label="My Orders" 
                        onClick={() => setIsUserDropdownOpen(false)} 
                      />
                    </div>
                    
                    {user.role === 'admin' && (
                      <>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="py-2 space-y-1">
                          <DropdownItem 
                            to="/admin" 
                            icon={<MdAdminPanelSettings size={16} />} 
                            label="Admin Dashboard"
                            accent 
                            onClick={() => setIsUserDropdownOpen(false)} 
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="h-px bg-white/10 my-2" />
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FiLogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2 rounded-xl hover:bg-white/5">Login</Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden btn-ghost p-2 ml-2 rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-down border-t border-white/10" style={{ background: 'rgba(10, 8, 32, 0.98)', backdropFilter: 'blur(20px)' }}>
          <div className="px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary px-4">
                <FiSearch size={16} />
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <FiHome size={18} /> Home
            </Link>
            <Link to="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <FiShoppingBag size={18} /> Shop
            </Link>
            
            {user && (
              <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <FiHeart size={18} /> Wishlist
              </Link>
            )}

            <div className="h-px bg-white/10 my-2" />

            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  <FiUser size={18} /> Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <MdAdminPanelSettings size={18} /> Admin Panel
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <FiLogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary flex-1 text-center py-2.5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary flex-1 text-center py-2.5 text-sm" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

const DropdownSection = ({ children }) => <div className="space-y-1">{children}</div>

const DropdownItem = ({ to, icon, label, onClick, accent = false }) => (
  <Link 
    to={to} 
    onClick={onClick} 
    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
      accent 
        ? 'text-primary-400 hover:bg-primary-500/15' 
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon} <span>{label}</span>
  </Link>
)

export default Navbar
