import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown, FiSearch } from 'react-icons/fi'
import { fetchProducts, fetchCategories } from '../redux/slices/productSlice'
import ProductCard from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/common/SkeletonCard'
import useDebounce from '../hooks/useDebounce'

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Toys', 'Grocery', 'Automotive']

const Products = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, loading, total, pages } = useSelector((state) => state.product)
  const { user } = useSelector((state) => state.auth)

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '100000')
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const debouncedKeyword = useDebounce(keyword, 500)

  useEffect(() => {
    const params = { keyword: debouncedKeyword, category: selectedCategory, sort: sortBy, minPrice, maxPrice, page: currentPage, limit: 12 }
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k] })
    dispatch(fetchProducts(params))
    setSearchParams(params)
  }, [debouncedKeyword, selectedCategory, sortBy, minPrice, maxPrice, currentPage])

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const clearAllFilters = () => {
    setKeyword(''); setSelectedCategory(''); setSortBy('newest'); setMinPrice(''); setMaxPrice('100000'); setCurrentPage(1);
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-16 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">{selectedCategory || 'All Products'}</h1>
        <p className="text-slate-400">{loading ? 'Searching...' : `${total} products found`}</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <FilterPanel keyword={keyword} setKeyword={setKeyword} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} clearAll={clearAllFilters} />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setShowMobileFilters(true)} className="lg:hidden btn-secondary text-sm px-4 py-2 flex items-center gap-2"><FiFilter /> Filters</button>
            <div className="relative ml-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none input-field py-2 pr-10 pl-3 text-sm w-44">
                <option value="newest" style={{ background: '#0a0820' }}>Newest</option>
                <option value="price-asc" style={{ background: '#0a0820' }}>Price: Low to High</option>
                <option value="price-desc" style={{ background: '#0a0820' }}>Price: High to Low</option>
                <option value="rating" style={{ background: '#0a0820' }}>Rating</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          {loading ? <SkeletonGrid count={12} /> : products.length > 0 ? (
            <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          ) : (
            <div className="text-center py-20 text-slate-400">No products found.</div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Prev</button>
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm ${currentPage === i + 1 ? 'bg-primary-500 text-white' : 'text-slate-400 hover:bg-white/5'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(pages, p + 1))} disabled={currentPage === pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 p-6 overflow-y-auto bg-[#0a0820]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <FilterPanel keyword={keyword} setKeyword={setKeyword} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} clearAll={clearAllFilters} />
          </div>
        </div>
      )}
    </div>
  )
}

const FilterPanel = ({ keyword, setKeyword, selectedCategory, setSelectedCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, clearAll }) => (
  <div className="space-y-6">
    <div>
      <label className="input-label">Search</label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search..." className="input-field pl-9 py-2 text-sm" />
      </div>
    </div>
    <div>
      <label className="input-label">Category</label>
      <div className="space-y-1 max-h-52 overflow-y-auto">
        <button onClick={() => setSelectedCategory('')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!selectedCategory ? 'text-primary-400 bg-primary-500/10' : 'text-slate-400'}`}>All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === cat ? 'text-primary-400 bg-primary-500/10' : 'text-slate-400'}`}>{cat}</button>
        ))}
      </div>
    </div>
    <div>
      <label className="input-label">Price Range</label>
      <div className="flex gap-2">
        <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field py-2 text-sm" />
        <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field py-2 text-sm" />
      </div>
    </div>
    <button onClick={clearAll} className="btn-secondary w-full py-2 text-sm">Clear All</button>
  </div>
)

export default Products
