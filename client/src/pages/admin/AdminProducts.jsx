// ============================================================
// AdminProducts.jsx — Admin product management list
// Admins can view, search, and delete products from here.
// The "Add" and "Edit" buttons navigate to AdminProductForm.
// ============================================================

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import { fetchAdminProducts, deleteProduct } from '../../redux/slices/adminSlice'
import Loader from '../../components/common/Loader'
import { formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const dispatch = useDispatch()
  const { products, loading } = useSelector((state) => state.admin)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchAdminProducts())
  }, [dispatch])

  // Client-side search filter (fast, no extra API call)
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id, name) => {
    // Simple confirm before irreversible delete
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      dispatch(deleteProduct(id))
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">📦 Products</h1>
            <p className="text-slate-400 text-sm">{products.length} total products</p>
          </div>
          <Link to="/admin/products/new" className="btn-primary px-5 py-2.5 flex items-center gap-2">
            <FiPlus size={16} /> Add New Product
          </Link>
        </div>

        {/* ── Search bar ──────────────────────────────────── */}
        <div className="relative mb-6 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* ── Products Table ──────────────────────────────── */}
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
                    {['Image', 'Name', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map((col) => (
                      <th key={col} className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ background: 'rgba(15,13,46,0.9)' }}>
                  {filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b transition-colors"
                      style={{ borderColor: 'rgba(99,102,241,0.06)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium max-w-[200px] truncate">{product.name}</p>
                        {product.isFeatured && <span className="badge-warning text-xs">Featured</span>}
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="badge-primary text-xs">{product.category}</span>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3 text-primary-400 font-bold text-sm">{formatPrice(product.price)}</td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {product.stock === 0 ? '❌ Out' : product.stock}
                        </span>
                      </td>
                      {/* Rating */}
                      <td className="px-4 py-3 text-amber-400 text-sm">
                        ⭐ {product.ratings?.toFixed(1) || '0.0'} ({product.numReviews})
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                            title="Edit product"
                          >
                            <FiEdit2 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete product"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p>No products match your search.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
