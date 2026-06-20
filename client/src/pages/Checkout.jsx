import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiChevronRight, FiCheck, FiMapPin, FiCreditCard, FiPackage, FiShoppingCart, FiAlertCircle } from 'react-icons/fi'
import { placeOrder, resetOrderSuccess } from '../redux/slices/orderSlice'
import { formatPrice, calculateShipping, calculateTax } from '../utils/helpers'
import Loader from '../components/common/Loader'
import api from '../services/api'
import toast from 'react-hot-toast'

const Checkout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { cart } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const { loading, success, currentOrder } = useSelector((state) => state.order)

  const [currentStep, setCurrentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [formErrors, setFormErrors] = useState({})
  const [shipping, setShipping] = useState({ 
    street: '', 
    city: '', 
    state: '', 
    zip: '', 
    country: 'India', 
    phone: user?.phone || '' 
  })

  const subtotal = cart?.totalPrice || 0
  const shippingCost = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const total = subtotal + shippingCost + tax

  useEffect(() => { 
    if (success && currentOrder) { 
      navigate(`/orders/${currentOrder._id}`)
      dispatch(resetOrderSuccess()) 
    }
  }, [success, currentOrder, navigate, dispatch])

  useEffect(() => { 
    if (!cart?.items?.length) navigate('/cart') 
  }, [cart, navigate])

  const validateShippingForm = () => {
    const errors = {}
    
    if (!shipping.street.trim()) errors.street = 'Street address is required'
    if (!shipping.city.trim()) errors.city = 'City is required'
    if (!shipping.state.trim()) errors.state = 'State is required'
    if (!shipping.zip.trim()) errors.zip = 'ZIP code is required'
    else if (!/^\d{6}$/.test(shipping.zip)) errors.zip = 'Please enter a valid 6-digit PIN'
    if (!shipping.phone.trim()) errors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(shipping.phone)) errors.phone = 'Please enter a valid 10-digit phone number'
    
    return errors
  }

  const handleShippingSubmit = () => {
    const errors = validateShippingForm()
    setFormErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      setCurrentStep(2)
    } else {
      toast.error('Please fill all fields correctly')
    }
  }

  const handlePlaceOrder = async () => {
    if (!shipping.street || !shipping.city) {
      toast.error('Please complete shipping address')
      return
    }

    if (paymentMethod === 'cod') {
      dispatch(placeOrder({ 
        orderItems: cart.items.map(i => ({ 
          product: i.product._id || i.product, 
          name: i.name, 
          image: i.image, 
          price: i.price, 
          quantity: i.quantity 
        })), 
        shippingAddress: shipping, 
        paymentInfo: { method: 'cod', status: 'pending' }, 
        itemsPrice: subtotal, 
        taxPrice: tax, 
        shippingPrice: shippingCost, 
        totalPrice: total 
      }))
      toast.success('Order placed successfully!')
    } else if (paymentMethod === 'razorpay') {
      try {
        const { data } = await api.post('/orders/razorpay', { amount: total * 100 })
        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: 'INR',
          order_id: data.order.id,
          handler: async (res) => {
            try {
              await api.post('/orders/razorpay/verify', res)
              dispatch(placeOrder({ 
                orderItems: cart.items.map(i => ({ 
                  product: i.product._id || i.product, 
                  name: i.name, 
                  image: i.image, 
                  price: i.price, 
                  quantity: i.quantity 
                })), 
                shippingAddress: shipping, 
                paymentInfo: { id: res.razorpay_payment_id, status: 'paid', method: 'razorpay' }, 
                itemsPrice: subtotal, 
                taxPrice: tax, 
                shippingPrice: shippingCost, 
                totalPrice: total 
              }))
              toast.success('Payment successful! Order placed.')
            } catch (err) {
              toast.error('Payment verification failed')
            }
          },
          prefill: { name: user.name, email: user.email, contact: shipping.phone },
          theme: { color: '#6366f1' }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err) { 
        toast.error('Payment initialization failed')
      }
    }
  }

  const StepIndicator = ({ step, title, completed }) => (
    <div className="flex items-center gap-3 mb-6 md:mb-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
        completed 
          ? 'bg-emerald-500 text-white' 
          : currentStep === step 
          ? 'bg-primary-500 text-white' 
          : 'bg-white/10 text-slate-400'
      }`}>
        {completed ? <FiCheck size={20} /> : step}
      </div>
      <span className={`font-semibold transition-colors ${
        currentStep === step || completed ? 'text-white' : 'text-slate-400'
      }`}>
        {title}
      </span>
    </div>
  )

  if (cart?.items?.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6 opacity-50">🛒</div>
        <h1 className="text-3xl font-bold text-white mb-4">Checkout</h1>
        <p className="text-slate-400 mb-8">Your cart is empty</p>
        <button onClick={() => navigate('/products')} className="btn-primary px-8 py-3 flex items-center gap-2">
          <FiShoppingCart /> Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-white mb-8">Checkout</h1>
        
        {/* Step Indicators */}
        <div className="flex flex-col md:flex-row gap-4">
          <StepIndicator step={1} title="Shipping Address" completed={currentStep > 1} />
          <div className="hidden md:block w-8 h-1 bg-white/20 self-center" />
          <StepIndicator step={2} title="Payment Method" completed={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping */}
          {currentStep === 1 && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">1</div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiMapPin size={24} /> Shipping Address
                </h2>
              </div>

              {/* Street Address */}
              <div>
                <label className="input-label">Street Address *</label>
                <input 
                  type="text" 
                  placeholder="123 Main Street"
                  value={shipping.street}
                  onChange={e => {
                    setShipping({...shipping, street: e.target.value})
                    if (formErrors.street) setFormErrors({...formErrors, street: ''})
                  }}
                  className={`input-field ${formErrors.street ? 'error-state' : ''}`}
                />
                {formErrors.street && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {formErrors.street}
                  </p>
                )}
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">City *</label>
                  <input 
                    type="text" 
                    placeholder="Kolkata"
                    value={shipping.city}
                    onChange={e => {
                      setShipping({...shipping, city: e.target.value})
                      if (formErrors.city) setFormErrors({...formErrors, city: ''})
                    }}
                    className={`input-field ${formErrors.city ? 'error-state' : ''}`}
                  />
                  {formErrors.city && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle size={12} /> {formErrors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label className="input-label">State *</label>
                  <input 
                    type="text" 
                    placeholder="West Bengal"
                    value={shipping.state}
                    onChange={e => {
                      setShipping({...shipping, state: e.target.value})
                      if (formErrors.state) setFormErrors({...formErrors, state: ''})
                    }}
                    className={`input-field ${formErrors.state ? 'error-state' : ''}`}
                  />
                  {formErrors.state && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle size={12} /> {formErrors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* ZIP & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">PIN Code *</label>
                  <input 
                    type="text" 
                    placeholder="700091"
                    value={shipping.zip}
                    onChange={e => {
                      setShipping({...shipping, zip: e.target.value})
                      if (formErrors.zip) setFormErrors({...formErrors, zip: ''})
                    }}
                    className={`input-field ${formErrors.zip ? 'error-state' : ''}`}
                    maxLength="6"
                  />
                  {formErrors.zip && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle size={12} /> {formErrors.zip}
                    </p>
                  )}
                </div>
                <div>
                  <label className="input-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="9876543210"
                    value={shipping.phone}
                    onChange={e => {
                      setShipping({...shipping, phone: e.target.value})
                      if (formErrors.phone) setFormErrors({...formErrors, phone: ''})
                    }}
                    className={`input-field ${formErrors.phone ? 'error-state' : ''}`}
                    maxLength="10"
                  />
                  {formErrors.phone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle size={12} /> {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={handleShippingSubmit}
                className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2"
              >
                Continue to Payment <FiChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiCreditCard size={24} /> Payment Method
                </h2>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-primary-500 bg-primary-500/10 shadow-lg-primary' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-primary-500 bg-primary-500' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'cod' && <FiCheck size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-white">💵 Cash on Delivery</p>
                      <p className="text-sm text-slate-400">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay' 
                      ? 'border-primary-500 bg-primary-500/10 shadow-lg-primary' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'razorpay' ? 'border-primary-500 bg-primary-500' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'razorpay' && <FiCheck size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-white">💳 Pay Online (Razorpay)</p>
                      <p className="text-sm text-slate-400">Card, UPI, Wallet & more</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  Back
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <span className="font-bold">{formatPrice(total)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-fit sticky top-24 shadow-lg-primary">
            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <FiShoppingCart /> Order Summary
            </h3>

            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10 max-h-64 overflow-y-auto">
              {cart.items.map(item => (
                <div key={item._id} className="flex justify-between">
                  <span className="text-slate-400 truncate">{item.name} x {item.quantity}</span>
                  <span className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-white/10">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className={`font-semibold ${shippingCost === 0 ? 'text-green-400' : 'text-white'}`}>
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (18%)</span>
                <span className="text-white font-semibold">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold text-white mb-6 pb-6 border-b border-white/10">
              <span>Total</span>
              <span className="text-gradient text-2xl">{formatPrice(total)}</span>
            </div>

            {shippingCost === 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400">
                ✓ Free shipping qualified!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
