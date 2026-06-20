// ============================================================
// AdminUsers.jsx — Admin user management table
// View all registered users, update roles, delete accounts.
// ============================================================

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiSearch, FiTrash2, FiShield, FiUser } from 'react-icons/fi'
import { fetchAdminUsers } from '../../redux/slices/adminSlice'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const dispatch = useDispatch()
  const { users, totalUsers, loading } = useSelector((state) => state.admin)
  const { user: currentAdmin } = useSelector((state) => state.auth)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchAdminUsers())
  }, [dispatch])

  // Promote/demote a user's role
  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      await api.put(`/users/${userId}`, { role: newRole })
      toast.success(`User role changed to ${newRole}`)
      dispatch(fetchAdminUsers()) // Refresh list
    } catch (err) {
      toast.error('Failed to update role')
    }
  }

  // Delete a user account (with guard against deleting yourself)
  const handleDelete = async (userId, userName) => {
    if (userId === currentAdmin._id) return toast.error("You can't delete your own account!")
    if (!window.confirm(`Delete user "${userName}"? This is irreversible.`)) return
    try {
      await api.delete(`/users/${userId}`)
      toast.success('User deleted')
      dispatch(fetchAdminUsers())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  // Client-side filter
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-white">👥 Users</h1>
          <p className="text-slate-400 text-sm">{totalUsers} registered customers</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader size="lg" /></div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(22,19,61,0.8)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map((col) => (
                    <th key={col} className="text-left px-5 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: 'rgba(15,13,46,0.9)' }}>
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b transition-colors"
                    style={{ borderColor: 'rgba(99,102,241,0.06)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar?.url || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff&size=36`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <p className="text-white text-sm font-medium">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-sm">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={u.role === 'admin' ? 'badge-primary' : 'badge-success'}>
                        {u.role === 'admin' ? '🔑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Role toggle — can't change your own role */}
                        {u._id !== currentAdmin._id && (
                          <button
                            onClick={() => toggleRole(u._id, u.role)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                            title={u.role === 'admin' ? 'Make User' : 'Make Admin'}
                          >
                            {u.role === 'admin' ? <FiUser size={14} /> : <FiShield size={14} />}
                          </button>
                        )}
                        {/* Delete — can't delete yourself or other admins */}
                        {u._id !== currentAdmin._id && u.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete user"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400">No users found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
