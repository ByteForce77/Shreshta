import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';

const TIMELINE_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received & sent to agro-mill' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Payment verified & accepted' },
  { key: 'PROCESSING', label: 'Cold-Press Mill', desc: 'Fresh oil settling & batch check' },
  { key: 'PACKED', label: 'Sealed & Packed', desc: 'Food-grade leak-proof packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier partner dispatched' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over at your doorstep' },
];

export const OrderStatusScreen: React.FC = () => {
  const { orders, activeOrderId, navigateTo, goBack } = useStore();

  const currentOrder =
    orders.find((o) => o.id === activeOrderId) ||
    orders[0] || {
      id: 'demo-order',
      order_number: 'SHR-748921',
      items: [
        {
          product_name: 'Shreshta Traditional Wood Pressed Groundnut Oil',
          variant_name: '1 Litre',
          quantity: 1,
          unit_price: 340,
          total_price: 340,
        },
      ],
      total_amount: 340,
      payment_status: 'PAID',
      order_status: 'CONFIRMED' as OrderStatus,
      payment_method: 'UPI',
      address: {
        name: 'Ramesh Varma',
        door_no: '402, Shreshta Nilayam',
        street: 'Temple Road',
        city: 'Bhimavaram',
        pincode: '534201',
      },
      expected_delivery_date: 'In 2 Days',
      created_at: new Date().toISOString(),
    };

  const getStepStatus = (stepKey: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'PLACED',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    if (currentOrder.order_status === 'CANCELLED') return 'cancelled';
    if (currentOrder.order_status === 'REFUNDED') return 'refunded';

    const currentIndex = statusOrder.indexOf(currentOrder.order_status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const isSpecialState =
    currentOrder.order_status === 'CANCELLED' ||
    currentOrder.order_status === 'RETURNED' ||
    currentOrder.order_status === 'REFUNDED';

  return (
    <div className="pb-28 bg-[#F8F9FA] min-h-full">
      {/* Top Header */}
      <div className="bg-[#0b301c] text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('HOME')}
              className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold font-serif">Order Tracking</h1>
          </div>

          <span className="text-[11px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-white/10 border border-[#D4AF37]/30">
            {currentOrder.order_number}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Success Card Header */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500/20 text-[#0b301c] flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
            Payment & Booking Verified
          </span>
          <h2 className="text-lg font-bold font-serif text-stone-900 mt-0.5">
            Thank You for Your Order!
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Your pure agro foods & wood-pressed oils have entered our fulfillment queue.
          </p>

          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-stone-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-medium">Expected Delivery:</span>
            </div>
            <span className="font-bold text-[#0b301c]">
              {currentOrder.expected_delivery_date || 'Within 48 Hours'}
            </span>
          </div>
        </div>

        {/* Special Status Alert if Cancelled or Refunded */}
        {isSpecialState && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-xs text-red-800 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-bold">Status: {currentOrder.order_status}</div>
              <p className="text-[11px] text-red-600 mt-0.5">
                Our customer executive will reach out to you or process your reimbursement promptly.
              </p>
            </div>
          </div>
        )}

        {/* Visual Live Order Tracking Timeline */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#0b301c]" />
              <span>Live Delivery Timeline</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {currentOrder.order_status}
            </span>
          </div>

          <div className="pt-2 pl-2 space-y-4 relative">
            {TIMELINE_STEPS.map((step, idx) => {
              const status = getStepStatus(step.key);
              const isLast = idx === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[11px] top-6 w-0.5 h-10 transition-colors ${
                        status === 'completed' ? 'bg-[#0b301c]' : 'bg-stone-200'
                      }`}
                    />
                  )}

                  {/* Indicator Dot */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      status === 'completed'
                        ? 'bg-[#0b301c] text-[#D4AF37]'
                        : status === 'current'
                        ? 'bg-[#D4AF37] text-[#0b301c] ring-4 ring-amber-100 animate-pulse'
                        : 'bg-stone-100 border border-stone-300 text-stone-400'
                    }`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="text-xs flex-1">
                    <div
                      className={`font-bold ${
                        status === 'current'
                          ? 'text-[#0b301c] text-sm'
                          : status === 'completed'
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[11px] text-stone-500">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif">
            Items in This Order
          </h3>

          <div className="divide-y divide-stone-100 text-xs">
            {currentOrder.items.map((it: any, i: number) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{it.product_name}</div>
                  <div className="text-[11px] text-stone-500">
                    {it.variant_name} × {it.quantity}
                  </div>
                </div>
                <div className="font-black text-stone-900">
                  ₹{it.total_price || it.unit_price * it.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-between text-xs font-bold">
            <span className="text-stone-700">Total Paid ({currentOrder.payment_method})</span>
            <span className="text-[#0b301c] text-sm">₹{currentOrder.total_amount}</span>
          </div>
        </div>

        {/* Delivery Address */}
        {currentOrder.address && (
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-xs space-y-1">
            <h4 className="font-bold text-stone-900 uppercase text-[10px] tracking-wider text-stone-400">
              Shipping Destination
            </h4>
            <p className="font-bold text-stone-900">{currentOrder.address.name}</p>
            <p className="text-stone-600">
              {currentOrder.address.door_no}, {currentOrder.address.street}, {currentOrder.address.city} - {currentOrder.address.pincode}
            </p>
          </div>
        )}

        {/* Customer Support Quick Actions */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-serif">
            Need Help with This Order?
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://wa.me/919440123456?text=Hello%20Polumati%20Shreshta,%20I%20need%20assistance%20with%20order"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp Support</span>
            </a>

            <a
              href="tel:+919440123456"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4 text-stone-700" />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>

        {/* Back to Home / Orders */}
        <button
          onClick={() => navigateTo('HOME')}
          className="w-full py-3 bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
};
