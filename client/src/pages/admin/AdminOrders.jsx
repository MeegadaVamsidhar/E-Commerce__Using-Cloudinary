// ============================================================
// AdminOrders.jsx — Admin order management table
// View all orders, filter by status, update order status.
// ============================================================

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiFilter } from 'react-icons/fi'
import { fetchAdminOrders, updateOrderStatus } from '../../redux/slices/adminSlice'
import Loader from '../../components/common/Loader'
import { formatPrice, formatDate, getOrderStatusClass } from '../../utils/helpers'

const STATUS_OPTIONS = ['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const AdminOrders = () => {
  const dispatch = useDispatch()
  const { orders, loading, totalOrders } = useSelector((state) => state.admin)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    dispatch(fetchAdminOrders({ status: statusFilter || undefined, limit: 50 }))
  }, [dispatch, statusFilter])

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }))
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">🛒 Orders</h1>
            <p className="text-slate-400 text-sm">{totalOrders} total orders</p>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <FiFilter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field py-2 text-sm w-44"
            >
              <option value="" style={{ background: '#0a0820' }}>All Statuses</option>
              {STATUS_OPTIONS.slice(1).map((s) => (
                <option key={s} value={s} style={{ background: '#0a0820' }}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader size="lg" /></div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(22,19,61,0.8)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((col) => (
                      <th key={col} className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ background: 'rgba(15,13,46,0.9)' }}>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b transition-colors"
                      style={{ borderColor: 'rgba(99,102,241,0.06)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-primary-400 font-mono text-xs hover:underline"
                        >
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{order.user?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm text-center">{order.orderItems.length}</td>
                      <td className="px-4 py-3 text-white font-bold text-sm">{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={order.isPaid ? 'badge-success text-xs' : 'badge-warning text-xs'}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Inline status changer — dropdown in the table row */}
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="py-1 px-2 rounded-lg text-xs font-medium cursor-pointer outline-none"
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            color: 'white',
                          }}
                        >
                          {STATUS_OPTIONS.slice(1).map((s) => (
                            <option key={s} value={s} style={{ background: '#0a0820' }}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link to={`/orders/${order._id}`} className="text-primary-400 hover:underline text-xs">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="text-center py-12 text-slate-400">No orders found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
