import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Plus,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  ShieldCheck,
  Lock,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Address, PaymentMethod } from '../types';

export const CheckoutScreen: React.FC = () => {
  const {
    cart,
    subtotal,
    deliveryCharge,
    couponDiscount,
    rewardDiscount,
    totalAmount,
    appliedCoupon,
    addresses,
    saveAddress,
    placeOrder,
    navigateTo,
    goBack,
  } = useStore();

  const { userProfile, userId } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.is_default)?.id || addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Address form fields
  const [doorNo, setDoorNo] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bhimavaram');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('534201');
  const [mobile, setMobile] = useState(userProfile?.mobile || '+91 94401 23456');
  const [name, setName] = useState(userProfile?.name || 'Ramesh Varma');

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses[0] || {
      id: 'default-temp',
      user_id: userId || 'temp',
      address_type: 'Home',
      name: userProfile?.name || 'Customer',
      mobile: userProfile?.mobile || '+91 94401 23456',
      door_no: 'Flat 402, Shreshta Nilayam',
      street: 'Temple Road',
      city: 'Bhimavaram',
      state: 'Andhra Pradesh',
      pincode: '534201',
      is_default: true,
      created_at: new Date().toISOString(),
    };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doorNo || !street || !city || !pincode) {
      setErrorMessage('Please fill all mandatory address fields.');
      return;
    }
    const newAddr: Omit<Address, 'id' | 'user_id' | 'created_at'> = {
      address_type: 'Home',
      name,
      mobile,
      door_no: doorNo,
      street,
      locality,
      city,
      state,
      pincode,
      is_default: addresses.length === 0,
    };
    await saveAddress(newAddr);
    setIsAddingAddress(false);
  };

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      navigateTo('CART');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate backend payment verification & order creation
      const createdOrder = await placeOrder(selectedAddress, paymentMethod);
      navigateTo('ORDER_STATUS', { orderId: createdOrder.id });
    } catch (err: any) {
      setErrorMessage('Failed to place order: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pb-32 bg-[#F8F9FA] min-h-full">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-2">
        <button
          onClick={goBack}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-700 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold font-serif text-stone-900">
          Checkout & Payment
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Delivery Address Section */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <MapPin className="w-4 h-4 text-[#0b301c]" />
              <span>Select Shipping Address</span>
            </div>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="text-xs font-bold text-[#0b301c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* New Address Form Modal/Drawer */}
          {isAddingAddress ? (
            <form onSubmit={handleSaveNewAddress} className="space-y-2.5 pt-2 border-t border-stone-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                  Door No / Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={doorNo}
                  onChange={(e) => setDoorNo(e.target.value)}
                  placeholder="e.g. 12-4B, Ground Floor"
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                  Street & Locality *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Temple Street, Near Rythu Bazar"
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                    Pin Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#0b301c] text-[#D4AF37] text-xs font-bold rounded-lg shadow-sm cursor-pointer mt-1"
              >
                Save & Use Address
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#0b301c] bg-[#0b301c]' : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                      </div>
                    </div>

                    <div className="text-xs flex-1">
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        <span>{addr.name}</span>
                        <span className="text-[10px] bg-stone-100 px-1.5 py-0.2 rounded font-medium text-stone-600">
                          {addr.address_type}
                        </span>
                      </div>
                      <p className="text-stone-600 mt-0.5 leading-snug">
                        {addr.door_no}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-stone-500 text-[10px] mt-0.5 font-medium">
                        Mobile: {addr.mobile}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expected Delivery Slot */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-[#D4AF37]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900">
              Estimated Delivery: 24 - 48 Hours
            </div>
            <div className="text-[11px] text-stone-500">
              Freshly pressed batch packed directly from mill
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
            <Lock className="w-3.5 h-3.5 text-[#0b301c]" />
            <span>Select Payment Method</span>
          </div>

          <div className="space-y-2">
            {/* UPI Option */}
            <div
              onClick={() => setPaymentMethod('UPI')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'UPI'
                  ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Instant UPI / GPay / PhonePe / Paytm
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Fastest checkout with 0% gateway fee
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'UPI' ? 'border-[#0b301c] bg-[#0b301c]' : 'border-stone-300'
                }`}
              >
                {paymentMethod === 'UPI' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
              </div>
            </div>

            {/* Credit / Debit Card */}
            <div
              onClick={() => setPaymentMethod('CARD')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'CARD'
                  ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Credit / Debit Card
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Visa, MasterCard, RuPay (128-bit encrypted)
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'CARD' ? 'border-[#0b301c] bg-[#0b301c]' : 'border-stone-300'
                }`}
              >
                {paymentMethod === 'CARD' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
              </div>
            </div>

            {/* Net Banking */}
            <div
              onClick={() => setPaymentMethod('NETBANKING')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'NETBANKING'
                  ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-100 text-stone-700">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Net Banking
                  </div>
                  <div className="text-[10px] text-stone-500">
                    SBI, HDFC, ICICI, Axis and all major Indian banks
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'NETBANKING' ? 'border-[#0b301c] bg-[#0b301c]' : 'border-stone-300'
                }`}
              >
                {paymentMethod === 'NETBANKING' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'COD'
                  ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Cash on Delivery (COD)
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Pay securely in cash or UPI when package arrives
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'COD' ? 'border-[#0b301c] bg-[#0b301c]' : 'border-stone-300'
                }`}
              >
                {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
              </div>
            </div>
          </div>
        </div>

        {/* Order Price Summary */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2 text-xs">
          <div className="font-bold text-stone-900 uppercase text-[11px] tracking-wider mb-2 font-serif">
            Final Order Value
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Items Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping Charge</span>
            <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon Discount ({appliedCoupon?.code})</span>
              <span>-₹{couponDiscount}</span>
            </div>
          )}
          {rewardDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Loyalty Points Discount</span>
              <span>-₹{rewardDiscount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-stone-200 flex justify-between font-extrabold text-sm text-stone-900">
            <span>Amount to Pay</span>
            <span className="text-[#0b301c] text-base">₹{totalAmount}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBI-Compliant 256-Bit SSL Payment Protection</span>
        </div>
      </div>

      {/* Sticky Bottom Place Order Action */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg max-w-md mx-auto">
        <button
          onClick={handleCompleteOrder}
          disabled={isProcessing}
          className="w-full py-3.5 bg-[#0b301c] hover:bg-[#154c2d] disabled:opacity-60 text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              <span>Verifying & Confirming Order...</span>
            </div>
          ) : (
            <span>
              {paymentMethod === 'COD' ? `Place Order (Pay ₹${totalAmount} on Delivery)` : `Pay ₹${totalAmount} & Confirm Order`}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
