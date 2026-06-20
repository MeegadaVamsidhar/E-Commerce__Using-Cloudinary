import { useEffect, useState } from 'react'
import { FiBell, FiCheck, FiFilter, FiPackage } from 'react-icons/fi'
import Loader from '../../components/common/Loader'
import { formatPrice, formatDate } from '../../utils/helpers'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = filter ? { status: filter } : {}
      const { data } = await api.get('/admin/notifications', { params })
      setNotifications(data.notifications)
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkSent = async (id) => {
    try {
      await api.put(`/admin/notifications/${id}/sent`)
      setNotifications(notifications.map(n => n._id === id ? { ...n, notified: true, notifiedAt: new Date().toISOString() } : n))
      toast.success('Marked as notified')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2"><FiBell /> Back-in-Stock Notifications</h1>
            <p className="text-slate-400 text-sm">{notifications.length} total notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={16} className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field py-2 text-sm w-44"
            >
              <option value="" style={{ background: '#0a0820' }}>All</option>
              <option value="pending" style={{ background: '#0a0820' }}>Pending</option>
              <option value="sent" style={{ background: '#0a0820' }}>Sent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader size="lg" /></div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FiBell size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg">No notifications yet</p>
            <p className="text-slate-500 text-sm mt-2">Users will appear here when they subscribe to out-of-stock alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: 'rgba(22,19,61,0.6)',
                  border: `1px solid ${notif.notified ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={notif.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                      alt={notif.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{notif.product?.name || 'Unknown Product'}</p>
                    <p className="text-slate-400 text-xs">{notif.user?.name || 'Unknown'} ({notif.user?.email || notif.email})</p>
                    <p className="text-slate-500 text-xs mt-1">Subscribed {formatDate(notif.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {notif.notified ? (
                    <span className="badge-success text-xs flex items-center gap-1"><FiCheck size={12} /> Notified {notif.notifiedAt ? formatDate(notif.notifiedAt) : ''}</span>
                  ) : (
                    <button
                      onClick={() => handleMarkSent(notif._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors flex items-center gap-1"
                    >
                      <FiBell size={12} /> Notify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNotifications
