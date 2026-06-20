import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiBell, FiUsers } from 'react-icons/fi'
import { addToCart } from '../../redux/slices/cartSlice'
import { toggleWishlist } from '../../redux/slices/wishlistSlice'
import StarRating from '../common/StarRating'
import { formatPrice, truncate } from '../../utils/helpers'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { products: wishlistProducts } = useSelector((state) => state.wishlist)
  const [imgError, setImgError] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const isWishlisted = wishlistProducts.some((p) => p._id === product._id)
  const discountPercent = product.lowestPrice > 0 && product.highestPrice > product.lowestPrice
    ? Math.round(((product.highestPrice - product.lowestPrice) / product.highestPrice) * 100)
    : 0
  const imageUrl = !imgError && product.images?.[0]?.url
    ? product.images[0].url
    : 'https://via.placeholder.com/400x400/1a1a2e/6366f1?text=No+Image'

  const handleNotifyMe = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Please login first')
      return navigate('/login')
    }
    setSubscribing(true)
    try {
      await api.post(`/notifications/subscribe/${product._id}`)
      setSubscribed(true)
      toast.success('You will be notified when this product is back in stock!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <Link to={`/products/${product._id}`} className="group block h-full">
      <div className="product-card h-full flex flex-col relative overflow-hidden rounded-2xl">
        <div className="relative h-[220px] overflow-hidden bg-white/5">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
                Featured
              </span>
            )}
          </div>

          {product.sellerCount > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white bg-black/60 backdrop-blur-sm">
              <FiUsers size={10} /> {product.sellerCount} sellers
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 backdrop-blur-md shadow-lg transition-all"
              onClick={() => {}}
            >
              <FiShoppingCart size={14} /> View Options
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <span className="badge-primary text-[10px] mb-2 inline-block w-fit">
            {product.category || 'Product'}
          </span>

          <h3 className="text-white font-semibold text-sm group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {truncate(product.name, 50)}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-1">
              <FiStar size={12} className={product.avgRating >= 4 ? 'text-amber-400 fill-amber-400' : product.avgRating >= 3 ? 'text-amber-400' : 'text-slate-600'} />
              <span className="text-xs font-semibold text-amber-400">{product.avgRating?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-xs text-slate-500">({product.totalReviews || 0})</span>
          </div>

          <div className="mt-auto flex items-baseline gap-2">
            <p className="text-lg font-bold text-white">{formatPrice(product.lowestPrice)}</p>
            {product.highestPrice > product.lowestPrice && (
              <p className="text-xs text-slate-500 line-through">{formatPrice(product.highestPrice)}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
