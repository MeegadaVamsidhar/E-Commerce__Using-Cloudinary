import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiArrowRight, FiShoppingBag, FiStar, FiShield, FiTruck, FiHeadphones, FiZap, FiAward, FiTrendingUp } from 'react-icons/fi'
import { fetchFeatured, fetchCategories } from '../redux/slices/productSlice'
import { fetchCart } from '../redux/slices/cartSlice'
import { fetchWishlist } from '../redux/slices/wishlistSlice'
import ProductCard from '../components/product/ProductCard'
import SkeletonCard from '../components/common/SkeletonCard'

const CATEGORY_CONFIG = [
  { name: 'Electronics', emoji: '💻', gradient: 'from-blue-600 to-cyan-500', count: '2.5K+' },
  { name: 'Fashion', emoji: '👗', gradient: 'from-pink-600 to-rose-500', count: '3.2K+' },
  { name: 'Home & Living', emoji: '🏡', gradient: 'from-emerald-600 to-teal-500', count: '1.8K+' },
  { name: 'Beauty', emoji: '✨', gradient: 'from-purple-600 to-fuchsia-500', count: '900+' },
  { name: 'Sports', emoji: '⚽', gradient: 'from-orange-600 to-amber-500', count: '1.2K+' },
  { name: 'Books', emoji: '📚', gradient: 'from-indigo-600 to-violet-500', count: '5K+' },
  { name: 'Toys', emoji: '🧸', gradient: 'from-yellow-500 to-orange-400', count: '800+' },
  { name: 'Grocery', emoji: '🛒', gradient: 'from-green-600 to-lime-500', count: '4K+' },
]

const FEATURES = [
  { icon: <FiTruck size={24} />, title: 'Free Delivery', desc: 'On orders above ₹999', color: 'text-blue-400' },
  { icon: <FiShield size={24} />, title: 'Secure Payments', desc: '100% safe & encrypted', color: 'text-emerald-400' },
  { icon: <FiStar size={24} />, title: 'Premium Quality', desc: 'Curated products', color: 'text-amber-400' },
  { icon: <FiHeadphones size={24} />, title: '24/7 Support', desc: 'Always here for you', color: 'text-purple-400' },
]

const STATS = [
  { icon: <FiTrendingUp size={20} />, value: '50K+', label: 'Happy Customers' },
  { icon: <FiAward size={20} />, value: '10K+', label: 'Products' },
  { icon: <FiZap size={20} />, value: '99.9%', label: 'Uptime' },
  { icon: <FiStar size={20} />, value: '4.9', label: 'Average Rating' },
]

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { featured, loading } = useSelector((state) => state.product)
  const { user } = useSelector((state) => state.auth)
  const [visibleCategories, setVisibleCategories] = useState(0)

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
      return
    }
    if (user?.role === 'seller') {
      navigate('/seller', { replace: true })
      return
    }
    dispatch(fetchFeatured())
    dispatch(fetchCategories())
    if (user) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
    }

    const timer = setInterval(() => {
      setVisibleCategories((prev) => (prev < CATEGORY_CONFIG.length ? prev + 1 : prev))
    }, 100)

    return () => clearInterval(timer)
  }, [dispatch, user])

  return (
    <div className="pt-16">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-noise" />
        
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent)', top: '-10%', left: '-5%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.2), transparent)', bottom: '10%', right: '-5%', animationDelay: '2s' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent)', top: '40%', left: '60%', animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-300 mb-8 animate-fade-in" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            New arrivals every week
          </div>

          <h1 className="font-display font-bold leading-tight mb-6 animate-slide-up text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Discover <span className="gradient-text-animated">Premium</span><br />Shopping Experience
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Explore thousands of curated products with fast delivery, secure payments, and unbeatable prices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/products" className="btn-primary text-base px-8 py-4 rounded-2xl text-lg">
              <FiShoppingBag size={20} /> Start Shopping <FiArrowRight size={18} />
            </Link>
            <Link to="/products?isFeatured=true" className="btn-secondary text-base px-8 py-4 rounded-2xl text-lg">
              View Featured
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 p-4 rounded-xl" style={{ background: 'rgba(22,19,61,0.4)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="text-primary-400 mb-1">{stat.icon}</div>
                <p className="text-white font-bold text-xl md:text-2xl">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-primary-400 animate-pulse" />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title text-3xl md:text-4xl mb-3">Shop by <span className="gradient-text">Category</span></h2>
          <p className="text-slate-400 max-w-lg mx-auto">Browse our extensive collection across multiple categories</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORY_CONFIG.map(({ name, emoji, gradient, count }, index) => (
            <Link 
              key={name} 
              to={`/products?category=${name}`} 
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-2"
              style={{ 
                background: 'rgba(22,19,61,0.5)', 
                border: '1px solid rgba(99,102,241,0.1)',
                opacity: index < visibleCategories ? 1 : 0,
                transform: index < visibleCategories ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.4s ease'
              }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${gradient} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>{emoji}</div>
              <p className="text-white text-xs font-semibold">{name}</p>
              <p className="text-slate-500 text-[10px]">{count}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="section-title text-3xl md:text-4xl">Featured <span className="gradient-text">Products</span></h2>
            <p className="text-slate-400 mt-2">Handpicked items just for you</p>
          </div>
          <Link to="/products" className="btn-secondary px-6 py-3">
            View All <FiArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="product-grid">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : featured.length > 0 ? (
          <div className="product-grid">{featured.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        ) : (
          <div className="text-center py-20 glass-card">
            <p className="text-5xl mb-4 opacity-30">🛍️</p>
            <h3 className="text-xl font-bold text-white mb-2">No featured products yet</h3>
            <p className="text-slate-400 mb-6">Check back soon for amazing deals!</p>
            <Link to="/products" className="btn-primary px-6 py-3">Browse All Products</Link>
          </div>
        )}
      </section>

      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, rgba(22,19,61,0.3) 0%, transparent 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title text-3xl md:text-4xl mb-3">Why Choose <span className="gradient-text">ShopNova</span></h2>
            <p className="text-slate-400 max-w-lg mx-auto">We provide the best shopping experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, index) => (
              <div 
                key={f.title} 
                className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ 
                  background: 'rgba(22,19,61,0.5)', 
                  border: '1px solid rgba(99,102,241,0.1)',
                }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${f.color}`} style={{ background: 'rgba(99,102,241,0.1)' }}>
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">Ready to Start Shopping?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of happy customers and discover amazing products at unbeatable prices.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-base px-8 py-4 rounded-2xl">
                  Create Free Account <FiArrowRight size={18} />
                </Link>
                <Link to="/products" className="btn-secondary text-base px-8 py-4 rounded-2xl">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
