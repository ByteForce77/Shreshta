import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
  Calendar,
  Gift,
  ArrowRight,
  Shield,
  Heart,
  Droplet,
  Flame,
  Award,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const {
    products,
    categories,
    banners,
    navigateTo,
    setSelectedCategory,
    setSearchQuery,
    addToCart,
    wishlistIds,
    toggleWishlist,
    addresses,
  } = useStore();
  const { userProfile } = useAuth();
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
  const featuredProducts = products.filter((p) => p.featured || p.rating >= 4.9);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      navigateTo('PRODUCTS');
    }
  };

  const handleAdd = (e: React.MouseEvent, prod: any) => {
    e.stopPropagation();
    addToCart(prod);
    setAddedNotice(`Added ${prod.name.split(' ')[0]} to cart!`);
    setTimeout(() => setAddedNotice(null), 2000);
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] text-[#1E293B]">
      {/* Toast Alert */}
      {addedNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b301c] text-[#D4AF37] px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-[#D4AF37]/40 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Top App Header with Location & Notification */}
      <div className="bg-[#0b301c] text-white px-4 pt-3 pb-4 rounded-b-2xl shadow-md">
        {/* Delivery Location */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => navigateTo('ACCOUNT')}
            className="flex items-center gap-1.5 text-left text-xs max-w-[260px] truncate group cursor-pointer"
          >
            <div className="p-1 rounded-full bg-white/10 text-[#D4AF37]">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] text-stone-300 font-medium leading-none">
                Delivering to
              </div>
              <div className="text-xs font-semibold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                {defaultAddr ? `${defaultAddr.locality || defaultAddr.city}, ${defaultAddr.pincode}` : 'Bhimavaram, AP 534201'}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </button>

          <button
            onClick={() => navigateTo('REWARDS')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37]/25 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>{userProfile?.loyalty_points || 150} pts</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search cold pressed groundnut, sesame, navaratnalu..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white text-stone-900 rounded-xl shadow-inner placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]"
          />
          {localSearch && (
            <button
              type="submit"
              className="absolute right-2 top-2 px-2.5 py-1 bg-[#0b301c] text-[#D4AF37] text-[10px] font-bold rounded-md"
            >
              Search
            </button>
          )}
        </form>
      </div>

      <div className="p-4 space-y-6">
        {/* Promotional Carousel Banners */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-900">
          <div className="relative h-44 w-full">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  idx === activeBannerIdx ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover brightness-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase mb-1">
                    {banner.highlight}
                  </span>
                  <h3 className="text-base font-bold font-serif text-white leading-tight mb-1">
                    {banner.title}
                  </h3>
                  <p className="text-[11px] text-stone-200 line-clamp-1 mb-2">
                    {banner.subtitle}
                  </p>
                  <button
                    onClick={() => {
                      if (banner.action_url.includes('subscription')) {
                        navigateTo('SUBSCRIPTION');
                      } else {
                        navigateTo('PRODUCTS');
                      }
                    }}
                    className="self-start px-3 py-1 bg-[#D4AF37] hover:bg-[#e4bd45] text-[#0b301c] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Dot Indicators */}
          <div className="absolute bottom-2 right-3 flex items-center gap-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIdx(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeBannerIdx ? 'w-4 bg-[#D4AF37]' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Categories Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-stone-900 font-serif tracking-wide">
              Product Categories
            </h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                navigateTo('PRODUCTS');
              }}
              className="text-xs font-semibold text-[#0b301c] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  navigateTo('PRODUCTS', { category: cat.id });
                }}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-200 shadow-xs group-hover:border-[#D4AF37] transition-all bg-white p-0.5">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[11px] font-medium text-stone-800 mt-1.5 leading-tight line-clamp-1 group-hover:text-[#0b301c]">
                  {cat.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-stone-600 line-clamp-1">
                  {cat.name_telugu}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Banner: Monthly Family Essentials (Screen 8 Teaser) */}
        <div className="bg-gradient-to-br from-[#0b301c] via-[#103e25] to-[#072415] rounded-2xl p-4 text-white shadow-md border border-[#D4AF37]/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Family Essentials</span>
          </div>

          <h3 className="text-base font-bold font-serif leading-tight">
            10+ KG Navaratnalu + 5 KG Cold-Pressed Oils
          </h3>
          <p className="text-xs text-stone-300 mt-1 mb-3 leading-relaxed">
            Curate your family's monthly oil combination & 9 sacred heirloom pulses. Delivered automatically with up to 25% savings.
          </p>

          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="text-stone-400">Starting at </span>
              <span className="text-sm font-bold text-[#D4AF37]">₹2,890/mo</span>
            </div>
            <button
              onClick={() => navigateTo('SUBSCRIPTION')}
              className="py-1.5 px-3.5 bg-[#D4AF37] hover:bg-[#e4bd45] text-[#0b301c] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Build Kit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif tracking-wide">
                Featured Cold Pressed Oils
              </h2>
              <p className="text-[11px] text-stone-600">Pure wood-pressed, zero chemical solvents</p>
            </div>
            <button
              onClick={() => navigateTo('PRODUCTS')}
              className="text-xs font-semibold text-[#0b301c] hover:underline flex items-center gap-0.5"
            >
              <span>More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 4).map((prod) => {
              const primaryVariant = prod.variants[0];
              const isWishlisted = wishlistIds.includes(prod.id);

              return (
                <div
                  key={prod.id}
                  onClick={() => navigateTo('PRODUCT_DETAILS', { productId: prod.id })}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>

                  {/* Image */}
                  <div className="relative h-32 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={prod.main_image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{prod.rating}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#0b301c] font-medium block truncate">
                        {prod.name_telugu}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-tight mt-0.5">
                        {prod.name}
                      </h4>
                      <div className="text-[10px] text-stone-600 mt-1">
                        Size: <span className="font-semibold text-stone-700">{primaryVariant?.size}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          ₹{primaryVariant?.price}
                        </div>
                        <div className="text-[10px] text-stone-400 line-through">
                          ₹{primaryVariant?.mrp}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleAdd(e, prod)}
                        className="p-1.5 bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer"
                        title="Add to cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why SHRESHTA Section */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="text-center mb-4">
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase">
              Pure Traditional Heritage
            </span>
            <h3 className="text-sm font-bold font-serif text-stone-900 mt-0.5">
              Why Polumati's Shreshta™?
            </h3>
            <p className="text-[11px] text-stone-600">
              The ancient science of cold-pressing vs commercial refined cooking oil
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col items-start">
              <Droplet className="w-5 h-5 text-[#0b301c] mb-1.5" />
              <h5 className="text-xs font-bold text-stone-900">Vaagai Wood Chekku</h5>
              <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                Extracted under 35°C on slow wooden expellers. No friction heat.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col items-start">
              <Shield className="w-5 h-5 text-[#D4AF37] mb-1.5" />
              <h5 className="text-xs font-bold text-stone-900">Zero Chemical Solvents</h5>
              <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                Zero hexane, no caustic soda, no bleaching, no artificial fragrance.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col items-start">
              <Flame className="w-5 h-5 text-amber-700 mb-1.5" />
              <h5 className="text-xs font-bold text-stone-900">Sunlight Settled</h5>
              <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                Naturally filtered through sunlight and pure cotton cloth.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col items-start">
              <Award className="w-5 h-5 text-emerald-800 mb-1.5" />
              <h5 className="text-xs font-bold text-stone-900">Direct From Farmers</h5>
              <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                Heirloom seeds harvested from Godavari & Rayalaseema black soils.
              </p>
            </div>
          </div>
        </div>

        {/* Google Maps Store & Mill Locator Banner */}
        <div
          onClick={() => {
            const chatbotTrigger = document.querySelector('button[title*="Ask Shreshta"]') as HTMLButtonElement;
            if (chatbotTrigger) chatbotTrigger.click();
          }}
          className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer hover:bg-blue-100/70 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Google Maps Grounding
                </span>
                <span className="text-[9px] bg-blue-200 text-blue-900 font-extrabold px-1.5 py-0.2 rounded-full">
                  gemini-3.5-flash
                </span>
              </div>
              <h3 className="text-xs font-bold text-stone-900 font-serif">
                Locate Nearby Shreshta Mills & Agro Outlets
              </h3>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Live maps lookup for cold-press stores and farmers markets
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Refer & Earn Banner (Screen 9 Teaser) */}
        <div
          onClick={() => navigateTo('REWARDS')}
          className="bg-gradient-to-r from-amber-500 to-[#D4AF37] rounded-2xl p-4 text-[#0b301c] shadow-sm flex items-center justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-[#0b301c] shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-950">
                Refer & Earn Loyalty Rewards
              </div>
              <div className="text-xs font-extrabold font-serif">
                Give ₹100, Get 200 Points on Next Order
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#0b301c] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
