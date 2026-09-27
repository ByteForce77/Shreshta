import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Check,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

export const ProductsScreen: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    navigateTo,
    addToCart,
    wishlistIds,
    toggleWishlist,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category match
      if (selectedCategory && prod.category_id !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesTelugu = prod.name_telugu?.toLowerCase().includes(query);
        const matchesDesc = prod.description?.toLowerCase().includes(query);
        const matchesIng = prod.ingredients?.toLowerCase().includes(query);
        if (!matchesName && !matchesTelugu && !matchesDesc && !matchesIng) {
          return false;
        }
      }
      // In stock
      if (inStockOnly && prod.status === 'OUT_OF_STOCK') {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const getPrice = (p: Product) => p.variants[0]?.price || 0;
      if (sortBy === 'price-low') return getPrice(a) - getPrice(b);
      if (sortBy === 'price-high') return getPrice(b) - getPrice(a);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const handleVariantSelect = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    const vId = selectedVariants[prod.id] || prod.variants[0]?.id;
    addToCart(prod, vId, 1);
    setToastMessage(`Added ${prod.name.split(' ')[0]} to cart!`);
    setTimeout(() => setToastMessage(null), 1800);
  };

  const handleBuyNow = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    const vId = selectedVariants[prod.id] || prod.variants[0]?.id;
    addToCart(prod, vId, 1);
    navigateTo('CHECKOUT');
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-full">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b301c] text-[#D4AF37] px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-[#D4AF37]/40 flex items-center gap-1.5 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Search & Title */}
      <div className="bg-[#0b301c] text-white p-4 sticky top-0 z-20 shadow-sm">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search oils, navaratnalu grains, spices..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-white text-stone-900 rounded-xl placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#D4AF37] text-[#0b301c] font-bold shadow-xs'
                : 'bg-white/10 text-stone-200 hover:bg-white/20'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF37] text-[#0b301c] font-bold shadow-xs'
                  : 'bg-white/10 text-stone-200 hover:bg-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Sorting Bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-900">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] text-[#0b301c] bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-stone-200"
            >
              <span>Filtered</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* In Stock Filter */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-colors ${
              inStockOnly
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>In Stock</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-7 pr-2 py-1 text-[11px] bg-stone-50 border border-stone-200 rounded-md font-medium text-stone-700 focus:outline-hidden focus:ring-1 focus:ring-[#0b301c]"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 my-6">
            <Filter className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800 font-serif">No products found</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Try adjusting your search query or clear the active category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="px-4 py-2 bg-[#0b301c] text-[#D4AF37] text-xs font-bold rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((prod) => {
              const currentVariantId = selectedVariants[prod.id] || prod.variants[0]?.id;
              const activeVariant =
                prod.variants.find((v) => v.id === currentVariantId) || prod.variants[0];
              const isWishlisted = wishlistIds.includes(prod.id);
              const discountPercent = Math.round(
                ((activeVariant.mrp - activeVariant.price) / activeVariant.mrp) * 100
              );

              return (
                <div
                  key={prod.id}
                  onClick={() => navigateTo('PRODUCT_DETAILS', { productId: prod.id })}
                  className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col gap-3 group cursor-pointer"
                >
                  <div className="flex gap-3">
                    {/* Image with Badges */}
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                      <img
                        src={prod.main_image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {discountPercent > 0 && (
                        <div className="absolute top-1 left-1 bg-[#0b301c] text-[#D4AF37] px-1.5 py-0.5 rounded text-[9px] font-black">
                          {discountPercent}% OFF
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-stone-400 hover:text-red-500"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isWishlisted ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-[#0b301c] font-semibold truncate">
                            {prod.name_telugu}
                          </span>
                          <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{prod.rating}</span>
                          </div>
                        </div>

                        <h3 className="text-xs font-bold text-stone-900 leading-tight mt-0.5 line-clamp-2">
                          {prod.name}
                        </h3>

                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                          {prod.highlights?.[0] || prod.description}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-stone-900">
                          ₹{activeVariant?.price}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          ₹{activeVariant?.mrp}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Save ₹{activeVariant?.mrp - activeVariant?.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Variant Selection Tabs */}
                  {prod.variants.length > 1 && (
                    <div
                      className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] text-stone-500 font-medium shrink-0">
                        Size:
                      </span>
                      {prod.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelect(prod.id, v.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer shrink-0 ${
                            activeVariant.id === v.id
                              ? 'bg-[#0b301c] text-[#D4AF37] border-[#0b301c]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions: Add to Cart & Buy Now */}
                  <div
                    className="grid grid-cols-2 gap-2 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="py-2 px-3 rounded-xl border border-[#0b301c] text-[#0b301c] text-xs font-bold hover:bg-[#0b301c]/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={(e) => handleBuyNow(e, prod)}
                      className="py-2 px-3 rounded-xl bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Zap className="w-3.5 h-3.5 fill-[#D4AF37]" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
