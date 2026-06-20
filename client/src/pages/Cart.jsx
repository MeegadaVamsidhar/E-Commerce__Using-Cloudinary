import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiAlertCircle, FiCreditCard } from 'react-icons/fi'
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/slices/cartSlice'
import Loader from '../components/common/Loader'
import { formatPrice, calculateShipping, calculateTax } from '../utils/helpers'
import toast from 'react-hot-toast'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { cart, loading } = useSelector((state) => state.cart)

  useEffect(() => { 
    dispatch(fetchCart()) 
  }, [dispatch])

  const items = cart?.items || []
  const subtotal = cart?.totalPrice || 0
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const total = subtotal + shipping + tax

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    dispatch(updateCartItem({ itemId, quantity: newQuantity }))
    toast.success('Cart updated')
  }

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId))
    toast.success('Item removed from cart')
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart())
      toast.success('Cart cleared')
    }
  }

  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">
            Shopping <span className="gradient-text">Cart</span>
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <FiShoppingBag size={18} />
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <Link to="/products" className="text-slate-400 text-sm hover:text-white flex items-center gap-2 transition-colors">
          <FiArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <FiShoppingBag size={40} className="text-primary-400 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-400 mb-8">Start adding products to get started</p>
          <Link to="/products" className="btn-primary text-base px-10 py-4 inline-flex gap-2">
            <FiShoppingBag /> Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <FiCreditCard size={14} /> Free shipping on orders over ₹999
              </span>
              <button 
                onClick={handleClearCart}
                className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <FiTrash2 size={14} /> Clear All
              </button>
            </div>

            {items.map((item, index) => (
              <div 
                key={item._id} 
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 items-center hover:border-primary-500/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <Link to={`/products/${item.product.productGroup?._id || item.product.productGroup}`} className="flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover hover:opacity-80 transition-opacity" 
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link 
                    to={`/products/${item.product.productGroup?._id || item.product.productGroup}`}
                    className="text-white text-base font-bold block truncate hover:text-primary-400 transition-colors mb-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-primary-400 font-bold text-lg">
                    {formatPrice(item.price)}
                  </p>
                  {item.quantity === 0 && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 justify-center sm:justify-start">
                      <FiAlertCircle size={12} /> Out of stock
                    </p>
                  )}
                </div>

                {/* Quantity Control */}
                <div className="flex items-center border border-white/20 rounded-xl overflow-hidden bg-white/5">
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity === 1}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Item Total & Delete */}
                <div className="text-right space-y-2">
                  <p className="text-white font-bold text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="text-slate-500 hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/10 rounded-lg"
                    title="Remove from cart"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-fit sticky top-24 shadow-lg-primary animate-slide-up">
              <h2 className="text-xl font-bold mb-6 text-white">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (18%)</span>
                  <span className="text-white font-semibold">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-white mb-8 pb-6 border-b border-white/10">
                <span>Total</span>
                <span className="text-gradient text-2xl">{formatPrice(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-4 text-base font-bold mb-3 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <FiArrowLeft size={18} className="rotate-180" />
              </button>

              <button
                onClick={() => navigate('/products')}
                className="btn-secondary w-full py-3 text-sm font-medium"
              >
                Continue Shopping
              </button>

              {shipping === 0 && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <p className="text-xs text-emerald-400">
                    ✓ Free shipping applied! You've qualified for free delivery
                  </p>
                </div>
              )}

              {shipping > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <p className="text-xs text-amber-400">
                    Add {formatPrice(999 - subtotal)} more for free shipping
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
