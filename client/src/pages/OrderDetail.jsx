import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiPackage, FiMapPin, FiCreditCard, FiClock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { fetchOrder } from '../redux/slices/orderSlice'
import { formatPrice, formatDate, getOrderStatusClass } from '../utils/helpers'
import Loader from '../components/common/Loader'

const OrderDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentOrder: order, loading } = useSelector((state) => state.order)

  useEffect(() => { dispatch(fetchOrder(id)) }, [dispatch, id])

  if (loading) return <div className="pt-32 flex justify-center"><Loader size="lg" /></div>
  if (!order) return <div className="pt-32 text-center text-white">Order not found.</div>

  const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered']
  const currentStepIdx = STEPS.indexOf(order.orderStatus)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <Link to="/dashboard?tab=orders" className="flex items-center gap-2 text-sm text-slate-400 mb-6 hover:text-white"><FiArrowLeft /> Back to Orders</Link>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div><h1 className="font-display font-bold text-3xl text-white">Order Details</h1><p className="text-slate-500 text-sm font-mono mt-1">ID: #{order._id.toUpperCase()}</p></div>
        <div className="text-right"><span className={`${getOrderStatusClass(order.orderStatus)} px-4 py-1.5 text-xs font-bold rounded-full`}>{order.orderStatus}</span><p className="text-slate-400 text-xs mt-2">{formatDate(order.createdAt)}</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex flex-col items-center gap-2 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${idx <= currentStepIdx ? 'bg-primary-500 border-primary-500 text-white' : 'border-white/10 text-slate-600'}`}>{idx < currentStepIdx ? <FiCheckCircle size={20} /> : <FiClock size={20} />}</div>
            <span className={`text-[10px] font-bold uppercase ${idx <= currentStepIdx ? 'text-primary-400' : 'text-slate-600'}`}>{step}</span>
            {idx < 3 && <div className={`hidden sm:block absolute left-[70%] top-5 w-[60%] h-0.5 ${idx < currentStepIdx ? 'bg-primary-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6"><h3 className="flex items-center gap-2 text-white font-bold mb-4"><FiMapPin /> Delivery Address</h3><p className="text-slate-400 text-sm leading-relaxed">{order.shippingAddress.street}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />{order.shippingAddress.country}<br />Phone: {order.shippingAddress.phone}</p></div>
        <div className="glass-card p-6"><h3 className="flex items-center gap-2 text-white font-bold mb-4"><FiCreditCard /> Payment Status</h3><div className="space-y-2"><div className="flex justify-between text-sm"><span>Method</span><span className="text-white uppercase font-bold">{order.paymentInfo.method}</span></div><div className="flex justify-between text-sm"><span>Status</span><span className={order.paymentInfo.status === 'paid' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{order.paymentInfo.status.toUpperCase()}</span></div>{order.paidAt && <div className="flex justify-between text-xs text-slate-500"><span>Paid At</span><span>{formatDate(order.paidAt)}</span></div>}</div></div>
      </div>

      <div className="glass-card overflow-hidden"><h3 className="flex items-center gap-2 text-white font-bold p-6 border-b border-white/10"><FiPackage /> Order Items</h3><div className="divide-y divide-white/10">
        {order.orderItems.map(item => (
          <div key={item.product} className="flex gap-4 p-6 items-center">
            <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0"><p className="text-white text-sm font-bold truncate">{item.name}</p><p className="text-slate-400 text-xs">{item.quantity} x {formatPrice(item.price)}</p></div>
            <p className="text-white font-bold">{formatPrice(item.quantity * item.price)}</p>
          </div>
        ))}
      </div><div className="p-6 bg-white/5 space-y-3 text-sm">
        <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Shipping</span><span>{formatPrice(order.shippingPrice)}</span></div>
        <div className="flex justify-between text-slate-400"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
        <div className="flex justify-between text-lg font-bold text-primary-400 border-t border-white/10 pt-3"><span>Grand Total</span><span>{formatPrice(order.totalPrice)}</span></div>
      </div></div>
    </div>
  )
}

export default OrderDetail
