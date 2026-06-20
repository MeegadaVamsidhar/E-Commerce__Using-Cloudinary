import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiUpload, FiSave } from 'react-icons/fi'
import { getSellerProducts, createSellerProduct, updateSellerProduct } from '../services/sellerService'
import api from '../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Toys', 'Grocery', 'Automotive', 'Other']

const SellerProductForm = () => {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: 'Electronics', brand: '', stock: '',
    isFeatured: false, images: [],
  })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditing) {
      const loadProduct = async () => {
        try {
          const { data } = await getSellerProducts()
          const product = data.products.find(p => p._id === id)
          if (product) {
            setForm({
              name: product.name,
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice || '',
              category: product.category,
              brand: product.brand || '',
              stock: product.stock,
              isFeatured: product.isFeatured,
              images: product.images || [],
            })
          }
        } catch (err) {
          toast.error('Failed to load product')
        }
      }
      loadProduct()
    }
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm((prev) => ({ ...prev, images: [...prev.images, { public_id: res.data.public_id, url: res.data.url }] }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock) {
      return toast.error('Please fill in all required fields')
    }
    if (form.images.length === 0) {
      return toast.error('Please upload at least one product image')
    }

    const productData = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : 0,
      stock: Number(form.stock),
    }

    setLoading(true)
    try {
      if (isEditing) {
        await updateSellerProduct(id, productData)
        toast.success('Product updated and resubmitted for approval')
      } else {
        await createSellerProduct(productData)
        toast.success('Product submitted for admin approval')
      }
      navigate('/seller')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/seller')} className="btn-ghost p-2 text-slate-400">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isEditing ? 'Update product details' : 'Fill in details to list your product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-white font-semibold mb-2">Basic Information</h2>
          <div>
            <label className="input-label">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Handmade Ceramic Vase" className="input-field" required />
          </div>
          <div>
            <label className="input-label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe your product..." className="input-field resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#0a0820' }}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Your Brand" className="input-field" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-white font-semibold mb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label">Selling Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="999" min={0} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Original Price (₹)</label>
              <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="1499" min={0} className="input-field" />
            </div>
            <div>
              <label className="input-label">Stock *</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="50" min={0} className="input-field" required />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Product Images *</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {form.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img.url} alt={`Product ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                {idx === 0 && <span className="absolute bottom-1 left-1 text-xs bg-primary-500 text-white px-1 rounded">Main</span>}
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all" style={{ border: '2px dashed rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              {uploading ? (
                <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiUpload size={18} className="text-primary-400" />
                  <span className="text-primary-400 text-xs mt-1">Upload</span>
                </>
              )}
            </label>
          </div>
          <p className="text-slate-500 text-xs">Max 5MB per image. JPG, PNG, WebP accepted.</p>
        </div>

        <button type="submit" disabled={loading || uploading} className="btn-primary w-full py-4 text-base disabled:opacity-60">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><FiSave size={18} /> {isEditing ? 'Update Product' : 'Submit for Approval'}</>
          )}
        </button>
      </form>
    </div>
  )
}

export default SellerProductForm
