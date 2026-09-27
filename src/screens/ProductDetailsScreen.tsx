import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  Droplet,
  CheckCircle,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetailsScreen: React.FC = () => {
  const {
    products,
    selectedProductId,
    goBack,
    navigateTo,
    addToCart,
    wishlistIds,
    toggleWishlist,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [pincodeInput, setPincodeInput] = useState('534201');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(
    'Delivery available in 24-48 hrs'
  );
  const [addedAlert, setAddedAlert] = useState(false);

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-stone-600">Product not found.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-[#0b301c] text-[#D4AF37] text-xs font-bold rounded-lg"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const isWishlisted = wishlistIds.includes(product.id);
  const discountPercent = Math.round(
    ((activeVariant.mrp - activeVariant.price) / activeVariant.mrp) * 100
  );

  const images = [
    product.main_image,
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80',
  ];

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      setPincodeStatus('Express 24-Hour delivery available to your location!');
    } else {
      setPincodeStatus('Please enter a valid 6-digit pin code.');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, activeVariant.id, quantity);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, activeVariant.id, quantity);
    navigateTo('CHECKOUT');
  };

  return (
    <div className="pb-28 bg-[#F8F9FA] min-h-full">
      {/* Toast Alert */}
      {addedAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b301c] text-[#D4AF37] px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-[#D4AF37]/50 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Added to your cart!</span>
        </div>
      )}

      {/* Top Floating App Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={goBack}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold font-serif uppercase tracking-wider text-[#0b301c] truncate max-w-[200px]">
          {product.name}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleWishlist(product.id)}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Main Image Showcase */}
      <div className="bg-stone-100 relative">
        <div className="w-full h-72 overflow-hidden flex items-center justify-center">
          <img
            src={images[activeImageIdx] || product.main_image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnail Selector */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                activeImageIdx === idx ? 'border-[#D4AF37] scale-110' : 'border-transparent opacity-70'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-[#0b301c] text-[#D4AF37] text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-md">
            {discountPercent}% SAVINGS
          </div>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Title, Telugu Subtitle & Rating */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0b301c] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              {product.name_telugu}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating}</span>
              <span className="text-[10px] text-stone-600">({product.reviews_count} reviews)</span>
            </div>
          </div>

          <h1 className="text-lg font-bold font-serif text-stone-900 leading-snug">
            {product.name}
          </h1>

          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Variant Selector */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-stone-900">
                ₹{activeVariant.price}
              </span>
              <span className="text-sm text-stone-400 line-through">
                ₹{activeVariant.mrp}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                (Save ₹{activeVariant.mrp - activeVariant.price})
              </span>
            </div>
            <span className="text-[10px] text-stone-600 font-medium">Inclusive of all taxes</span>
          </div>

          {/* Select Size / Variant */}
          <div>
            <div className="text-xs font-semibold text-stone-800 mb-2">
              Select Quantity / Pack Size:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.variants.map((v) => {
                const isSelected = v.id === activeVariant.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900">{v.size}</div>
                    <div className="text-[11px] font-extrabold text-[#0b301c] mt-0.5">
                      ₹{v.price}
                    </div>
                    <div className="text-[9px] text-stone-400 line-through">₹{v.mrp}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800">Quantity:</span>
            <div className="flex items-center gap-3 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 shadow-xs cursor-pointer hover:bg-stone-50"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-stone-900 w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 shadow-xs cursor-pointer hover:bg-stone-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Pure Cold-Pressed Highlights</span>
            </h3>
            <div className="space-y-1.5">
              {product.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle className="w-3.5 h-3.5 text-[#0b301c] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients & Storage Info */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div>
            <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-[#0b301c]" />
              <span>Ingredients</span>
            </h4>
            <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              {product.ingredients || '100% Native Sun-Dried Unrefined Kernels.'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Storage Instructions</span>
            </h4>
            <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              {product.storage_information || 'Store in a cool, dry place. Reseal tightly after use.'}
            </p>
          </div>
        </div>

        {/* Delivery Checker */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
            <Truck className="w-4 h-4 text-[#0b301c]" />
            <span>Delivery & Availability</span>
          </div>

          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit pin code"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#0b301c]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded-lg hover:bg-stone-900 cursor-pointer"
            >
              Check
            </button>
          </form>

          {pincodeStatus && (
            <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{pincodeStatus}</span>
            </p>
          )}

          <div className="text-[10px] text-stone-500 space-y-0.5 pt-1">
            <p>• Free shipping on all orders above ₹799</p>
            <p>• Farm direct dispatch within 24 hours</p>
            <p>• Zero transit leakage guarantee</p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="text-[10px] text-stone-500">Total Price:</div>
            <div className="text-base font-black text-stone-900">
              ₹{activeVariant.price * quantity}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className="py-2.5 px-3 rounded-xl border-2 border-[#0b301c] text-[#0b301c] text-xs font-bold hover:bg-[#0b301c]/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="py-2.5 px-3 rounded-xl bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 fill-[#D4AF37]" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
