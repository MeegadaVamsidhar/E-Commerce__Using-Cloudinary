import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { createProduct, updateProduct, fetchAdminProducts } from '../../redux/slices/adminSlice';
import FileUpload from '../../components/common/FileUpload';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Books',
  'Toys',
  'Grocery',
  'Automotive',
  'Other',
];

const DARK_BG = { background: '#0a0820' };

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: 'Electronics',
  brand: '',
  stock: '',
  isFeatured: false,
  tags: '',
  images: [],
  videos: [],
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state) => state.admin);

  const [form, setForm] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (isEditing) {
      if (products.length === 0) dispatch(fetchAdminProducts());
      const existingProduct = products.find((p) => p._id === id);
      if (existingProduct) {
        setForm({
          name: existingProduct.name,
          description: existingProduct.description,
          price: existingProduct.price,
          originalPrice: existingProduct.originalPrice || '',
          category: existingProduct.category,
          brand: existingProduct.brand || '',
          stock: existingProduct.stock,
          isFeatured: existingProduct.isFeatured,
          tags: existingProduct.tags?.join(', ') || '',
          images: existingProduct.images || [],
          videos: existingProduct.videos || [],
        });
      }
    }
  }, [id, products, dispatch, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImagesUploaded = (uploadedImages) => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
  };

  const handleVideosUploaded = (uploadedVideos) => {
    setForm((prev) => ({ ...prev, videos: [...prev.videos, ...uploadedVideos] }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index) => {
    setForm((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock) {
      return toast.error('Please fill in all required fields');
    }
    if (form.images.length === 0) {
      return toast.error('Please upload at least one product image');
    }

    const productData = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : 0,
      stock: Number(form.stock),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (isEditing) {
      await dispatch(updateProduct({ id, data: productData }));
    } else {
      await dispatch(createProduct(productData));
    }

    navigate('/admin/products');
  };

  const discountPercent =
    form.originalPrice && form.price && Number(form.originalPrice) > Number(form.price)
      ? Math.round(
          ((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100
        )
      : 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <PageHeader isEditing={isEditing} onBack={() => navigate('/admin/products')} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoSection form={form} onChange={handleChange} CATEGORIES={CATEGORIES} />
          <PricingSection form={form} onChange={handleChange} discountPercent={discountPercent} />
          <ImagesSection
            images={form.images}
            onUploaded={handleImagesUploaded}
            onRemove={removeImage}
          />
          <VideosSection
            videos={form.videos}
            onUploaded={handleVideosUploaded}
            onRemove={removeVideo}
          />
          <SubmitButton loading={loading} isEditing={isEditing} />
        </form>
      </div>
    </div>
  );
};

function PageHeader({ isEditing, onBack }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button onClick={onBack} className="btn-ghost p-2 text-slate-400">
        <FiArrowLeft size={20} />
      </button>
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-slate-400 text-sm">
          {isEditing
            ? 'Update product details below'
            : 'Fill in the details to create a new listing'}
        </p>
      </div>
    </div>
  );
}

function BasicInfoSection({ form, onChange, CATEGORIES }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-white font-semibold mb-2">Basic Information</h2>

      <FormField label="Product Name" required>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="e.g. Apple MacBook Pro 14-inch"
          className="input-field"
          required
        />
      </FormField>

      <FormField label="Description" required>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={4}
          placeholder="Describe the product in detail..."
          className="input-field resize-none"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category" required>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="input-field"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category} style={DARK_BG}>
                {category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Brand">
          <input
            name="brand"
            value={form.brand}
            onChange={onChange}
            placeholder="e.g. Apple, Samsung"
            className="input-field"
          />
        </FormField>
      </div>

      <FormField label="Tags (comma-separated)">
        <input
          name="tags"
          value={form.tags}
          onChange={onChange}
          placeholder="e.g. laptop, macbook, apple, pro"
          className="input-field"
        />
      </FormField>

      <ToggleSwitch
        label="Mark as Featured Product"
        checked={form.isFeatured}
        onChange={onChange}
      />
    </div>
  );
}

function PricingSection({ form, onChange, discountPercent }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-white font-semibold mb-2">Pricing & Inventory</h2>
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Selling Price (₹)" required>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={onChange}
            placeholder="999"
            min={0}
            className="input-field"
            required
          />
        </FormField>

        <FormField label="Original Price (₹)">
          <input
            type="number"
            name="originalPrice"
            value={form.originalPrice}
            onChange={onChange}
            placeholder="1499 (for discount badge)"
            min={0}
            className="input-field"
          />
        </FormField>

        <FormField label="Stock Quantity" required>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={onChange}
            placeholder="50"
            min={0}
            className="input-field"
            required
          />
        </FormField>
      </div>

      {discountPercent > 0 && (
        <p className="text-emerald-400 text-sm">Discount: {discountPercent}% off</p>
      )}
    </div>
  );
}

function ImagesSection({ images, onUploaded, onRemove }) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-semibold mb-4">
        Product Images <span className="text-red-400">*</span>
      </h2>
      <FileUpload
        type="image"
        multiple
        onFilesUploaded={onUploaded}
        existingFiles={images}
        onRemoveFile={onRemove}
      />
      <p className="text-slate-500 text-xs mt-2">
        Upload up to 5 images. JPG, PNG, WebP, GIF (max 10MB each)
      </p>
    </div>
  );
}

function VideosSection({ videos, onUploaded, onRemove }) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-semibold mb-4">Product Videos (Optional)</h2>
      <FileUpload
        type="video"
        multiple
        onFilesUploaded={onUploaded}
        existingFiles={videos}
        onRemoveFile={onRemove}
      />
      <p className="text-slate-500 text-xs mt-2">
        Upload up to 3 videos. MP4, MOV, AVI, WebM (max 100MB each)
      </p>
    </div>
  );
}

function SubmitButton({ loading, isEditing }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-60">
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <FiSave size={18} />
          {isEditing ? 'Update Product' : 'Create Product'}
        </span>
      )}
    </button>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="input-label">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className="relative w-11 h-6 rounded-full transition-all"
        style={{ background: checked ? '#6366f1' : 'rgba(99,102,241,0.15)' }}
      >
        <input
          type="checkbox"
          name="isFeatured"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </div>
      <span className="text-slate-300 text-sm">{label}</span>
    </label>
  );
}

export default AdminProductForm;
