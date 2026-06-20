import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiHeart, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'
import { fetchWishlist } from '../redux/slices/wishlistSlice'
import ProductCard from '../components/product/ProductCard'
import Loader from '../components/common/Loader'

const Wishlist = () => {
  const dispatch = useDispatch()
  const { products, loading } = useSelector((state) => state.wishlist)
  useEffect(() => { dispatch(fetchWishlist()) }, [dispatch])

  if (loading) return <div className="pt-32 flex justify-center"><Loader size="lg" /></div>

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display font-bold text-3xl text-white flex items-center gap-3"><FiHeart className="text-rose-500 fill-rose-500" /> My Wishlist ({products.length})</h1>
        <Link to="/products" className="text-slate-400 text-sm hover:text-white flex items-center gap-2"><FiArrowLeft /> Back to Shop</Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 glass-card">
          <p className="text-6xl mb-4 opacity-20">💖</p>
          <h2 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">Save items you like for later by clicking the heart icon on any product.</p>
          <Link to="/products" className="btn-primary text-base px-10 py-4 inline-flex">Explore Products</Link>
        </div>
      ) : (
        <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </div>
  )
}

export default Wishlist
