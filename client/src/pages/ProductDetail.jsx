import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiMinus,
  FiPlus,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowLeft,
  FiBell,
  FiBellOff,
  FiPlay,
  FiStore,
  FiTrendingDown,
  FiAward,
} from 'react-icons/fi';
import { fetchProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import { formatPrice, timeAgo } from '../utils/helpers';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Media Gallery ─────────────────────────────────────────────────────────────

function MediaGallery({ product, selectedImageIndex, setSelectedImageIndex, mediaView, setMediaView }) {
  const hasVideos = product.videos?.length > 0;
  const hasMultipleImages = product.images?.length > 1;
  const allOutOfStock = product.sellers?.every(seller => seller.stock === 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden relative h-[420px] bg-white/5 border border-white/10 flex items-center justify-center p-6">
        {mediaView === 'videos' && hasVideos ? (
          <video src={product.videos[0].url} controls className="max-w-full max-h-full object-contain rounded-lg" />
        ) : (
          <img
            src={product.images?.[selectedImageIndex]?.url || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
        )}
        {allOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="font-bold text-white uppercase bg-rose-500/80 px-6 py-2 rounded-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {hasVideos && (
        <div className="flex gap-2">
          <MediaTabButton
            label={`Images (${product.images?.length || 0})`}
            isActive={mediaView === 'images'}
            onClick={() => setMediaView('images')}
          />
          <MediaTabButton
            label={
              <span className="flex items-center gap-1"><FiPlay size={10} /> Videos ({product.videos.length})</span>
            }
            isActive={mediaView === 'videos'}
            onClick={() => setMediaView('videos')}
          />
        </div>
      )}

      {mediaView === 'images' && hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                index === selectedImageIndex ? 'border-primary-500' : 'border-white/10'
              }`}
            >
              <img src={image.url} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {mediaView === 'videos' && product.videos?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {product.videos.map((video, index) => (
            <button
              key={index}
              className="w-24 h-16 rounded-xl overflow-hidden border-2 border-white/10 relative flex-shrink-0"
            >
              <video src={video.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <FiPlay className="text-white" />
              </div>
              {video.duration && (
                <span className="absolute bottom-0.5 right-0.5 text-white text-[9px] bg-black/60 px-1 rounded">
                  {Math.floor(video.duration)}s
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaTabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Seller Selector ───────────────────────────────────────────────────────────

function SellerSelector({ sellers, selectedSeller, onSelect, cheapestSeller, highestRatedSeller }) {
  if (!sellers || sellers.length <= 1) return null;

  return (
    <>
      <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <FiStore className="text-primary-400" />
          <span className="text-white font-semibold text-sm">{sellers.length} sellers available</span>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1 text-emerald-400">
            <FiTrendingDown size={12} /> Best price: {formatPrice(cheapestSeller.price)}
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <FiAward size={12} /> Top rated: {highestRatedSeller.ratings.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-white font-semibold text-sm">Choose a Seller</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {sellers.map((seller) => {
            const isSelected = selectedSeller?._id === seller._id;
            const isCheapest = seller.price === sellers[0]?.price;
            const isTopRated = seller.ratings >= highestRatedSeller.ratings && seller.ratings > 0;

            return (
              <button
                key={seller._id}
                onClick={() => onSelect(seller)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-primary-500/15 border-2 border-primary-500'
                    : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {seller.seller?.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{seller.seller?.name || 'Seller'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <FiStar
                            size={10}
                            className={seller.ratings >= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                          />
                          {seller.ratings?.toFixed(1) || '0.0'}
                        </span>
                        <span>({seller.numReviews || 0})</span>
                        <span className={seller.stock > 0 ? 'text-emerald-400' : 'text-rose-500'}>
                          {seller.stock > 0 ? `In Stock (${seller.stock})` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatPrice(seller.price)}</p>
                    {seller.originalPrice > seller.price && (
                      <p className="text-xs text-slate-500 line-through">{formatPrice(seller.originalPrice)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {isCheapest && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-500/10">
                      Best Price
                    </span>
                  )}
                  {isTopRated && seller.ratings > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-amber-400 bg-amber-500/10">
                      Top Rated
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Quantity Selector ─────────────────────────────────────────────────────────

function QuantitySelector({ quantity, stock, onIncrement, onDecrement }) {
  return (
    <div className="flex items-center rounded-xl border border-white/20">
      <button
        onClick={onDecrement}
        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
      >
        <FiMinus />
      </button>
      <span className="w-10 text-center font-bold text-white">{quantity}</span>
      <button
        onClick={onIncrement}
        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
      >
        <FiPlus />
      </button>
    </div>
  );
}

// ─── Actions ───────────────────────────────────────────────────────────────────

function ProductActions({ allInStock, isWishlisted, handleAddToCart, handleWishlist, handleShare }) {
  return (
    <div className="flex gap-3">
      <button onClick={handleAddToCart} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
        <FiShoppingCart /> Add to Cart
      </button>
      <ActionIconButton onClick={handleWishlist} isActive={isWishlisted} activeClass="border-rose-500/50 bg-rose-500/10 text-rose-400">
        <FiHeart className={isWishlisted ? 'fill-current' : ''} />
      </ActionIconButton>
      <ActionIconButton onClick={handleShare}>
        <FiShare2 />
      </ActionIconButton>
    </div>
  );
}

function OutOfStockActions({ subscribed, subscribing, user, handleSubscribe, handleUnsubscribe, handleWishlist, isWishlisted }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={subscribed ? handleUnsubscribe : handleSubscribe}
          disabled={subscribing || !user}
          className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
            subscribed
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
          } disabled:opacity-50`}
        >
          {subscribing
            ? 'Please wait...'
            : subscribed
              ? <><FiBellOff /> Subscribed — Click to Unsubscribe</>
              : <><FiBell /> Notify Me When Available</>}
        </button>
        <ActionIconButton onClick={handleWishlist} isActive={isWishlisted} activeClass="border-rose-500/50 bg-rose-500/10 text-rose-400">
          <FiHeart className={isWishlisted ? 'fill-current' : ''} />
        </ActionIconButton>
      </div>
      {!user && (
        <p className="text-slate-400 text-sm text-center">
          <Link to="/login" className="text-primary-400 hover:underline">Login</Link> to get notified when this product is back in stock.
        </p>
      )}
    </div>
  );
}

function ActionIconButton({ onClick, isActive, activeClass, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
        isActive ? activeClass : 'border-white/10 text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Info Badges ───────────────────────────────────────────────────────────────

function InfoBadges() {
  return (
    <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs text-slate-400">
      <div className="flex flex-col items-center gap-2">
        <FiTruck className="text-primary-400 text-lg" />
        <p>Free Shipping</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <FiShield className="text-primary-400 text-lg" />
        <p>Warranty</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <FiRefreshCw className="text-primary-400 text-lg" />
        <p>Returns</p>
      </div>
    </div>
  );
}

// ─── Product Info ──────────────────────────────────────────────────────────────

function ProductInfo({ product, selectedSeller, quantity, setQuantity, isWishlisted, handleAddToCart, handleWishlist, handleShare, subscribed, subscribing, handleSubscribe, handleUnsubscribe }) {
  const allInStock = product.sellers?.some(seller => seller.stock > 0);
  const cheapestSeller = product.sellers?.reduce((min, seller) =>
    seller.price < min.price ? seller : min, product.sellers[0]
  );
  const highestRatedSeller = product.sellers?.reduce((max, seller) =>
    seller.ratings > max.ratings ? seller : max, product.sellers[0]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="badge-primary">{product.category}</span>
        <StarRating rating={product.avgRating} size="sm" />
      </div>

      <h1 className="font-display font-bold text-3xl text-white leading-snug">{product.name}</h1>

      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-white">{formatPrice(product.lowestPrice)}</span>
        {product.highestPrice > product.lowestPrice && (
          <span className="text-lg text-slate-500 line-through">{formatPrice(product.highestPrice)}</span>
        )}
      </div>

      <SellerSelector
        sellers={product.sellers}
        selectedSeller={selectedSeller}
        onSelect={(seller) => { setSelectedSeller(seller); setQuantity(1); }}
        cheapestSeller={cheapestSeller}
        highestRatedSeller={highestRatedSeller}
      />

      {selectedSeller && (
        <QuantitySelector
          quantity={quantity}
          stock={selectedSeller.stock}
          onIncrement={() => setQuantity(prev => Math.min(selectedSeller.stock, prev + 1))}
          onDecrement={() => setQuantity(prev => Math.max(1, prev - 1))}
        />
      )}

      {allInStock ? (
        <ProductActions
          allInStock={allInStock}
          isWishlisted={isWishlisted}
          handleAddToCart={handleAddToCart}
          handleWishlist={handleWishlist}
          handleShare={handleShare}
        />
      ) : (
        <OutOfStockActions
          subscribed={subscribed}
          subscribing={subscribing}
          user={user}
          handleSubscribe={handleSubscribe}
          handleUnsubscribe={handleUnsubscribe}
          handleWishlist={handleWishlist}
          isWishlisted={isWishlisted}
        />
      )}

      <InfoBadges />
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

function DescriptionTab({ product }) {
  return <p className="text-slate-300 leading-relaxed whitespace-pre-line">{product.description}</p>;
}

function VideosTab({ product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {product.videos.map((video, index) => (
        <div key={index} className="rounded-xl overflow-hidden bg-black/30">
          <video src={video.url} controls className="w-full aspect-video" />
          {video.duration && <p className="text-slate-500 text-xs p-2">Duration: {Math.floor(video.duration)}s</p>}
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ product, user, selectedSeller, reviewRating, reviewComment, setReviewRating, setReviewComment, submittingReview, handleReviewSubmit, id, dispatch }) {
  return (
    <div className="space-y-8">
      {user ? (
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <h3 className="text-white font-semibold">Write a Review</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className="transition-transform hover:scale-110"
              >
                <FiStar className={`text-2xl ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="input-field min-h-[100px]"
          />
          <button type="submit" disabled={submittingReview} className="btn-primary px-8 py-3 text-sm">
            {submittingReview ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      ) : (
        <p className="text-slate-400 text-sm">
          <Link to="/login" className="text-primary-400 hover:underline">Login</Link> to write a review.
        </p>
      )}

      {selectedSeller?.reviews?.map((review) => (
        <div key={review._id} className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-bold">{review.name}</p>
              <StarRating rating={review.rating} size="xs" showCount={false} />
            </div>
            <span className="text-slate-500 text-xs">{timeAgo(review.createdAt)}</span>
          </div>
          <p className="text-slate-400 text-sm">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, loading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mediaView, setMediaView] = useState('images');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const isWishlisted = wishlistProducts.some((p) => p._id === id);

  useEffect(() => {
    dispatch(fetchProduct(id));
    setSelectedImageIndex(0);
    setQuantity(1);
    setSubscribed(false);
    setMediaView('images');
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.sellers?.length > 0) {
      setSelectedSeller(product.sellers[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product && product.sellers?.every((s) => s.stock === 0) && user) {
      checkSubscription();
    }
  }, [product, user]);

  const checkSubscription = async () => {
    try {
      const { data } = await api.get('/notifications/my');
      const isSubscribed = data.notifications.some((n) => n.product === id && !n.notified);
      setSubscribed(isSubscribed);
    } catch {
      console.error('Failed to check subscription status');
    }
  };

  if (loading) return <div className="pt-32 flex justify-center"><Loader size="lg" /></div>;
  if (!product) return <div className="min-h-screen pt-32 text-center text-white">Product not found.</div>;

  const handleAddToCart = () => {
    if (!user) return navigate('/login');
    if (!selectedSeller) return toast.error('Please select a seller');
    dispatch(addToCart({ productId: selectedSeller._id, quantity }));
  };

  const handleWishlist = () => {
    if (!user) return navigate('/login');
    dispatch(toggleWishlist(product._id));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleSubscribe = async () => {
    if (!user) return navigate('/login');
    setSubscribing(true);
    try {
      await api.post(`/notifications/subscribe/${product._id}`);
      setSubscribed(true);
      toast.success('You will be notified when this product is back in stock!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setSubscribing(true);
    try {
      await api.delete(`/notifications/unsubscribe/${product._id}`);
      setSubscribed(false);
      toast.success('Unsubscribed from notifications');
    } catch {
      toast.error('Failed to unsubscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!reviewComment.trim()) return toast.error('Please write a review comment');
    if (!selectedSeller) return toast.error('Please select a seller');

    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${product._id}`, {
        rating: reviewRating,
        comment: reviewComment,
        sellerId: selectedSeller._id,
      });
      toast.success('Review added successfully!');
      setReviewComment('');
      setReviewRating(5);
      dispatch(fetchProduct(id));
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <Link to="/products" className="flex items-center gap-2 text-sm text-slate-400 mb-6 hover:text-white">
        <FiArrowLeft /> Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <MediaGallery
          product={product}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          mediaView={mediaView}
          setMediaView={setMediaView}
        />

        <ProductInfo
          product={product}
          selectedSeller={selectedSeller}
          quantity={quantity}
          setQuantity={setQuantity}
          isWishlisted={isWishlisted}
          handleAddToCart={handleAddToCart}
          handleWishlist={handleWishlist}
          handleShare={handleShare}
          subscribed={subscribed}
          subscribing={subscribing}
          handleSubscribe={handleSubscribe}
          handleUnsubscribe={handleUnsubscribe}
        />
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10">
        <div className="flex border-b border-white/10 bg-white/5">
          <TabButton label="Description" isActive={activeTab === 'description'} onClick={() => setActiveTab('description')} />
          {product.videos?.length > 0 && (
            <TabButton
              label={<span className="flex items-center gap-1"><FiPlay size={12} /> Videos ({product.videos.length})</span>}
              isActive={activeTab === 'videos'}
              onClick={() => setActiveTab('videos')}
            />
          )}
          <TabButton
            label={`Reviews (${product.totalReviews || 0})`}
            isActive={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          />
        </div>

        <div className="p-8">
          {activeTab === 'description' && <DescriptionTab product={product} />}
          {activeTab === 'videos' && <VideosTab product={product} />}
          {activeTab === 'reviews' && (
            <ReviewsTab
              product={product}
              user={user}
              selectedSeller={selectedSeller}
              reviewRating={reviewRating}
              reviewComment={reviewComment}
              setReviewRating={setReviewRating}
              setReviewComment={setReviewComment}
              submittingReview={submittingReview}
              handleReviewSubmit={handleReviewSubmit}
              id={id}
              dispatch={dispatch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-medium transition-all ${
        isActive ? 'text-white border-b-2 border-primary-500' : 'text-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

export default ProductDetail;
