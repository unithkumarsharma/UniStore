import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import type { Product, ProductVariant } from '../types';
import { formatCurrency, calculateDiscount } from '../utils/currency';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PincodeEstimator } from '../components/product/PincodeEstimator';
import { FrequentlyBoughtTogether } from '../components/product/FrequentlyBoughtTogether';

// ── Deterministic Color Swatches ────────────────────────────────────────────
const getSwatches = (categorySlug?: string, name?: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('chair') || n.includes('desk') || n.includes('wood'))
    return [
      { name: 'Walnut', color: '#5c3a21' },
      { name: 'Matte Black', color: '#18181b' },
      { name: 'Natural Oak', color: '#c49a6c' },
    ];
  if (categorySlug === 'tech-audio' || n.includes('headphone') || n.includes('speaker'))
    return [
      { name: 'Obsidian', color: '#09090b' },
      { name: 'Platinum', color: '#d4d4d8' },
      { name: 'Midnight', color: '#1e293b' },
    ];
  return [
    { name: 'Graphite', color: '#18181b' },
    { name: 'Smoke', color: '#71717a' },
    { name: 'Arctic', color: '#f4f4f5' },
  ];
};

// ── Image Zoom Component ────────────────────────────────────────────────────
const ZoomableImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-zoom-in rounded-2xl bg-zinc-50"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
        }}
      />
      {isZoomed && (
        <div
          className="absolute inset-0 z-10 hidden sm:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: '250%',
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};


export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  useDocumentTitle(product ? `${product.name} — ₹${product.base_price}` : 'Product Details');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState(0);

  const loadProduct = React.useCallback(async () => {
    if (!slug) return;
    try {
      const prod = await api.getProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        setSelectedVariant(prod.variants?.[0] || undefined);
        const allProds = await api.getProducts();
        setRelatedProducts(allProds.filter((p) => p.id !== prod.id).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load product from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [loadProduct]);

  useRealtimeSync({
    onProductChange: () => loadProduct(),
  });

  // Customer reviews
  const [reviews, setReviews] = useState([
    {
      id: 'r1',
      author: 'Vikram Mehta',
      avatar: 'VM',
      rating: 5,
      date: '2 days ago',
      title: 'Remarkable craftsmanship and tactile feel',
      comment: 'The materials are top-notch. It fits perfectly in my minimalist studio apartment. Packaging was also recyclable and premium.',
      verified: true,
    },
    {
      id: 'r2',
      author: 'Ananya Roy',
      avatar: 'AR',
      rating: 5,
      date: '1 week ago',
      title: 'Exceeded expectations',
      comment: 'Super fast dispatch to Bangalore, arrived in under 24 hours. The sound acoustic balance is warm and detailed.',
      verified: true,
    },
    {
      id: 'r3',
      author: 'Rahul Sharma',
      avatar: 'RS',
      rating: 4,
      date: '2 weeks ago',
      title: 'Great quality, worth the price',
      comment: 'Very impressed with the build quality. The packaging was eco-friendly and the product looks exactly as shown. Minor improvement possible in the color accuracy.',
      verified: true,
    },
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <div className="aspect-square rounded-3xl bg-zinc-100 animate-pulse" />
              <div className="flex gap-3 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-20 h-20 rounded-xl bg-zinc-100 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-4 bg-zinc-100 rounded-full w-1/3 animate-pulse" />
              <div className="h-8 bg-zinc-100 rounded-full w-3/4 animate-pulse" />
              <div className="h-6 bg-zinc-100 rounded-full w-1/4 animate-pulse" />
              <div className="h-32 bg-zinc-100 rounded-2xl animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto mb-6 rotate-6">
            <span className="material-symbols-outlined text-[48px] text-zinc-400">search_off</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-zinc-500 mb-6">The requested item could not be found or may be currently unavailable.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white text-sm font-bold shadow-md hover:bg-zinc-800 transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const currentComparePrice = selectedVariant?.compare_at_price || product.compare_at_price;
  const discountPercent = calculateDiscount(currentPrice, currentComparePrice);
  const swatches = getSwatches(product.category_slug, product.name);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'img-1', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', display_order: 1, is_primary: true }];

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;
    const newRev = {
      id: `r-${Date.now()}`,
      author: newReviewAuthor,
      avatar: (newReviewAuthor.trim().split(/\s+/).filter(Boolean).map(w => w[0] || '').join('').toUpperCase().slice(0, 2)) || 'U',
      rating: newReviewRating,
      date: 'Just now',
      title: 'Customer Review',
      comment: newReviewComment,
      verified: false,
    };
    setReviews([newRev, ...reviews]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setShowReviewForm(false);
  };

  // Average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : (product?.rating || 5.0).toFixed(1);

  return (
    <div className="min-h-screen pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] md:pb-12" style={{ background: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* ══════════════════════════════════════════════════════════════════
            BREADCRUMB — Minimal editorial style
            ══════════════════════════════════════════════════════════════════ */}
        <nav className="flex items-center gap-2 text-[11px] text-zinc-400 mb-6">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <Link to="/shop" className="hover:text-zinc-900 transition-colors">Shop</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <Link to={`/shop?category=${product.category_slug}`} className="hover:text-zinc-900 transition-colors">
            {product.category_name}
          </Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-zinc-700 font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ══════════════════════════════════════════════════════════════════
            MAIN PRODUCT SHOWCASE — Magazine Editorial Layout
            ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── LEFT: Image Gallery ─────────────────────────────────────── */}
          <div className="lg:col-span-7">
            {/* Primary Hero Image with Zoom */}
            <div className="relative aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-200/60 shadow-sm">
              <ZoomableImage
                src={images[selectedImageIndex]?.image_url}
                alt={product.name}
              />

              {/* Badges — Top Left */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
                {product.badge && (
                  <span className="bg-zinc-900 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider backdrop-blur-md">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist + Share — Top Right */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-90 ${
                    isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md text-zinc-400 hover:text-zinc-900 transition-all hover:scale-110 active:scale-90"
                  aria-label="Share"
                  onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})}
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>

              {/* Image Counter — Bottom Right */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 tabular-nums">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Zoom hint — Bottom Left */}
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md text-zinc-600 text-[10px] font-medium px-2.5 py-1 rounded-full z-20 hidden sm:flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                Hover to zoom
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto no-scrollbar">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-zinc-900 shadow-md ring-2 ring-zinc-900/10'
                        : 'border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400'
                    }`}
                  >
                    <img src={img.image_url} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* ── RIGHT: Product Details & Purchase ───────────────────────── */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Category Tag */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em]">
                  {product.category_name}
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className="text-[11px] text-zinc-400 font-medium">SKU: {product.sku}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black text-zinc-900 leading-[1.15] tracking-tight">
                {product.name}
              </h1>

              {/* Rating Bar */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-[18px]"
                      style={{
                        color: star <= Math.round(product.rating) ? '#f59e0b' : '#d4d4d8',
                        fontVariationSettings: star <= Math.round(product.rating) ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-900">{(product.rating || 0).toFixed(1)}</span>
                <span className="text-xs text-zinc-400">({(product.review_count || 0).toLocaleString('en-IN')} reviews)</span>
              </div>

              {/* Price Block */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-xs">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-zinc-900 tabular-nums tracking-tight">
                    {formatCurrency(currentPrice)}
                  </span>
                  {currentComparePrice && currentComparePrice > currentPrice && (
                    <span className="text-base text-zinc-400 line-through tabular-nums font-medium">
                      {formatCurrency(currentComparePrice)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Inclusive of all taxes • EMI from ₹{Math.ceil(currentPrice / 6).toLocaleString('en-IN')}/mo
                </p>
              </div>

              {/* Short Description */}
              <p className="text-sm text-zinc-500 leading-relaxed">
                {product.description.length > 180
                  ? product.description.slice(0, 180) + '...'
                  : product.description
                }
              </p>

              {/* Color Swatches */}
              <div>
                <h3 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-3">
                  Finish — <span className="text-zinc-700">{swatches[selectedSwatch]?.name}</span>
                </h3>
                <div className="flex gap-2.5">
                  {swatches.map((swatch, idx) => (
                    <button
                      key={swatch.name}
                      onClick={() => setSelectedSwatch(idx)}
                      title={swatch.name}
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-90 ${
                        selectedSwatch === idx
                          ? 'border-zinc-900 ring-2 ring-zinc-900/10 scale-110'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-3">
                    Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 ${
                          selectedVariant?.id === v.id
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-white border border-zinc-200 rounded-full shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 font-bold transition-colors text-lg"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-black text-zinc-900 tabular-nums">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 font-bold transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-300 active:scale-[0.97] ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        <span>Add to Bag • {formatCurrency(currentPrice * quantity)}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buy Now */}
                <button
                  onClick={() => {
                    addToCart(product, selectedVariant, quantity);
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 px-6 rounded-full bg-white text-zinc-900 font-bold text-sm border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Buy Now — Instant Checkout
                </button>
              </div>

              {/* Pincode & Delivery Availability Checker */}
              <PincodeEstimator currentPrice={currentPrice} />

              {/* Delivery & Trust Strip */}
              <div className="bg-white rounded-2xl border border-zinc-100 divide-y divide-zinc-100 shadow-xs overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">local_shipping</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Free Express Delivery</p>
                    <p className="text-[11px] text-zinc-400">On orders above ₹999 • Estimated 2-4 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">verified_user</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">1-Year Manufacturer Warranty</p>
                    <p className="text-[11px] text-zinc-400">Comprehensive coverage with hassle-free claims</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <span className="material-symbols-outlined text-[20px] text-amber-600">autorenew</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">7-Day Easy Returns</p>
                    <p className="text-[11px] text-zinc-400">No questions asked with free reverse pickup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <span className="material-symbols-outlined text-[20px] text-violet-600">lock</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Secure Checkout</p>
                    <p className="text-[11px] text-zinc-400">256-bit SSL • Razorpay • UPI • All Cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Bundle Upsell */}
        {product && <FrequentlyBoughtTogether currentProduct={product} />}


        {/* ══════════════════════════════════════════════════════════════════
            TABS: Overview | Specifications | Reviews
            ══════════════════════════════════════════════════════════════════ */}
        <div className="mt-16">
          {/* Tab Headers */}
          <div className="flex border-b border-zinc-200 gap-0 overflow-x-auto no-scrollbar">
            {(['details', 'specs', 'reviews'] as const).map((tab) => {
              const labels = {
                details: 'Overview',
                specs: 'Specifications',
                reviews: `Reviews (${reviews.length})`,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative ${
                    activeTab === tab
                      ? 'text-zinc-900'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  {labels[tab]}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-3xl border border-t-0 border-zinc-200/60 p-6 sm:p-8 lg:p-10 shadow-xs">
            {activeTab === 'details' && (
              <div className="max-w-3xl space-y-6">
                <div className="prose max-w-none">
                  <p className="text-base text-zinc-600 leading-relaxed">{product.description}</p>
                </div>
                {/* Curated Quality Highlight */}
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                  <h4 className="text-sm font-black text-zinc-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    UniStore Quality Promise
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Every UniStore selection undergoes our 5-point quality assessment for material durability, acoustic or ergonomic excellence, and cohesive modern aesthetics. Each piece is individually inspected before dispatch.
                  </p>
                </div>
                {/* Key Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: 'eco', label: 'Eco-Friendly Materials' },
                    { icon: 'precision_manufacturing', label: 'Precision Engineered' },
                    { icon: 'inventory_2', label: 'Sustainable Packaging' },
                    { icon: 'workspace_premium', label: 'Premium Quality' },
                    { icon: 'handshake', label: 'Ethically Sourced' },
                    { icon: 'design_services', label: 'Award-Winning Design' },
                  ].map(feat => (
                    <div key={feat.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <span className="material-symbols-outlined text-[18px] text-zinc-500">{feat.icon}</span>
                      <span className="text-[11px] font-bold text-zinc-700">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <div className="divide-y divide-zinc-100">
                  {[
                    { label: 'Product Name', value: product.name },
                    { label: 'SKU', value: product.sku },
                    { label: 'Category', value: product.category_name || '—' },
                    { label: 'Base Price', value: formatCurrency(product.base_price) },
                    { label: 'Delivery', value: 'Standard (2-4 business days)' },
                    { label: 'Origin', value: 'Curated Import / Verified Domestic' },
                    { label: 'Warranty', value: '1-Year Manufacturer Warranty' },
                    { label: 'Return Policy', value: '7-Day No-Questions-Asked' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between py-3.5 text-sm">
                      <span className="text-zinc-400 font-medium">{spec.label}</span>
                      <span className="font-bold text-zinc-900 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating Summary */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center">
                  <div className="text-center">
                    <div className="text-5xl font-black text-zinc-900 leading-none">{avgRating}</div>
                    <div className="flex items-center gap-0.5 mt-2 justify-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[16px]"
                          style={{
                            color: star <= Math.round(Number(avgRating)) ? '#f59e0b' : '#e4e4e7',
                            fontVariationSettings: star <= Math.round(Number(avgRating)) ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{reviews.length} reviews</p>
                  </div>

                  {/* Rating Breakdown Bars */}
                  <div className="flex-1 space-y-1.5 max-w-xs">
                    {[5, 4, 3, 2, 1].map(n => {
                      const cnt = reviews.filter(r => r.rating === n).length;
                      const pct = reviews.length > 0 ? (cnt / reviews.length) * 100 : 0;
                      return (
                        <div key={n} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-zinc-500 font-medium text-right">{n}</span>
                          <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-zinc-400 font-medium">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-black text-zinc-600">
                            {rev.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-900">{rev.author}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                  <span className="material-symbols-outlined text-[10px]">verified</span>
                                  Verified
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400">{rev.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span
                              key={s}
                              className="material-symbols-outlined text-[14px]"
                              style={{
                                color: s <= rev.rating ? '#f59e0b' : '#e4e4e7',
                                fontVariationSettings: s <= rev.rating ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <h5 className="text-sm font-bold text-zinc-900 mb-1">{rev.title}</h5>
                      <p className="text-sm text-zinc-500 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write Review CTA / Form */}
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    Write a Review
                  </button>
                ) : (
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                    <h4 className="text-sm font-black text-zinc-900 mb-4">Share Your Experience</h4>
                    <form onSubmit={handleAddReview} className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Name</label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          placeholder="e.g. Rohan V."
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewReviewRating(s)}
                              className="transition-transform hover:scale-125 active:scale-90"
                            >
                              <span
                                className="material-symbols-outlined text-[28px]"
                                style={{
                                  color: s <= newReviewRating ? '#f59e0b' : '#d4d4d8',
                                  fontVariationSettings: s <= newReviewRating ? "'FILL' 1" : "'FILL' 0",
                                }}
                              >
                                star
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Review</label>
                        <textarea
                          required
                          rows={3}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-2.5 rounded-full bg-white text-zinc-700 text-xs font-bold border border-zinc-200 hover:border-zinc-400 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════════════════
            RELATED PRODUCTS — "Complete the Collection"
            ══════════════════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-[0.15em] mb-1">Curated For You</div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Complete the Collection</h2>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-zinc-600 group">
                <span>View All</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STICKY MOBILE BUY BAR
          ══════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] left-0 w-full z-40 md:hidden" style={{ background: 'rgba(250,250,250,0.95)', backdropFilter: 'blur(16px) saturate(180%)' }}>
        <div className="border-t border-zinc-200 p-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <img
              src={images[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
              alt={product.name}
              className="w-11 h-11 rounded-xl object-cover bg-zinc-100 border border-zinc-200"
            />
            <div>
              <div className="text-sm font-black text-zinc-900 tabular-nums">
                {formatCurrency(currentPrice)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                <span className="material-symbols-outlined text-[12px]">bolt</span>
                Ready to Ship
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 max-w-[180px] py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>Added!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
