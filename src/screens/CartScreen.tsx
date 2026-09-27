import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Tag,
  Gift,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export const CartScreen: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryCharge,
    couponDiscount,
    rewardDiscount,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    useRewardPoints,
    toggleRewardPoints,
    coupons,
    addresses,
    navigateTo,
    goBack,
  } = useStore();

  const { userProfile } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-full pb-20 flex flex-col items-center justify-center p-6 text-center bg-[#F8F9FA]">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4 border border-stone-200">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h2 className="text-base font-bold font-serif text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500 mt-1 mb-6 max-w-xs leading-relaxed">
          Add pure wood-pressed oils and wholesome Navaratnalu agro foods to your basket.
        </p>
        <button
          onClick={() => navigateTo('PRODUCTS')}
          className="py-3 px-6 bg-[#0b301c] hover:bg-[#14482c] text-[#D4AF37] font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#F8F9FA] min-h-full">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-700 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold font-serif text-stone-900">
            Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Free Delivery Bar Progress */}
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            {subtotal >= 799 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>You unlocked FREE Delivery!</span>
              </span>
            ) : (
              <span className="text-stone-700">
                Add <span className="font-bold text-[#0b301c]">₹{799 - subtotal}</span> more for FREE Delivery
              </span>
            )}
            <span className="text-stone-500 font-bold">₹799 Threshold</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0b301c] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (subtotal / 799) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Item Cards */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={`${item.product_id}-${item.variant_id}`}
              className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex gap-3"
            >
              <img
                src={item.image}
                alt={item.product_name}
                className="w-20 h-20 object-cover rounded-xl border border-stone-100 shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[10px] text-[#0b301c] font-medium block">
                        {item.product_name_telugu}
                      </span>
                      <h3 className="text-xs font-bold text-stone-900 line-clamp-1 leading-tight">
                        {item.product_name}
                      </h3>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Size: {item.variant_name}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id, item.variant_id)}
                      className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-stone-900">
                      ₹{item.unit_price * item.quantity}
                    </span>
                    <span className="text-[10px] text-stone-400 line-through">
                      ₹{item.mrp * item.quantity}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product_id, item.variant_id, item.quantity - 1)
                      }
                      className="w-5 h-5 rounded bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-stone-900 w-3 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product_id, item.variant_id, item.quantity + 1)
                      }
                      className="w-5 h-5 rounded bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Address Quick Selector */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0b301c]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                Delivery Location
              </div>
              <div className="text-xs font-bold text-stone-800 line-clamp-1">
                {defaultAddr
                  ? `${defaultAddr.door_no}, ${defaultAddr.street}, ${defaultAddr.city} (${defaultAddr.pincode})`
                  : 'Add shipping address'}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigateTo('ACCOUNT')}
            className="text-xs font-bold text-[#0b301c] hover:underline shrink-0"
          >
            Change
          </button>
        </div>

        {/* Coupons & Discounts Section */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
            <Tag className="w-3.5 h-3.5 text-[#0b301c]" />
            <span>Apply Coupon Code</span>
          </div>

          {appliedCoupon ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  {appliedCoupon.code}
                </span>
                <p className="text-[11px] text-emerald-700">
                  Applied! You saved ₹{couponDiscount}
                </p>
              </div>
              <button
                onClick={removeCoupon}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SHRESHTA100"
                  className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl uppercase font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0b301c]"
                />
                <button
                  onClick={() => handleApplyCoupon(couponInput)}
                  disabled={!couponInput.trim()}
                  className="px-4 py-2 bg-[#0b301c] disabled:opacity-40 text-[#D4AF37] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponFeedback && (
                <p
                  className={`text-[11px] font-medium ${
                    couponFeedback.success ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}

              {/* Clickable Recommended Coupons */}
              <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {coupons.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleApplyCoupon(c.code)}
                    className="p-2 rounded-xl border border-dashed border-[#D4AF37] bg-amber-50/50 hover:bg-amber-100/50 text-left shrink-0 transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] font-extrabold text-[#0b301c]">
                      {c.code}
                    </div>
                    <div className="text-[9px] text-stone-600">{c.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loyalty Points Redemption Toggle */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">
                Redeem Loyalty Points
              </div>
              <div className="text-[11px] text-stone-500">
                Balance: <span className="font-semibold text-stone-800">{userProfile?.loyalty_points || 150} points</span> (Save ₹{Math.min(userProfile?.loyalty_points || 150, 200) * 0.5})
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useRewardPoints}
              onChange={toggleRewardPoints}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0b301c]"></div>
          </label>
        </div>

        {/* Price Summary */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-serif">
            Price Breakdown
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Items Total (Subtotal)</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Delivery Charge</span>
              <span>{deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryCharge}`}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}

            {rewardDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Loyalty Rewards Redemption</span>
                <span>-₹{rewardDiscount}</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
              <span>Total Payable</span>
              <span className="text-base text-[#0b301c]">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout Action */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-xs text-stone-500">Grand Total:</div>
          <div className="text-lg font-black text-[#0b301c]">₹{totalAmount}</div>
        </div>

        <button
          onClick={() => navigateTo('CHECKOUT')}
          className="w-full py-3 bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
        >
          <span>Proceed to Checkout</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
