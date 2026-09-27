import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import {
  ShoppingBag,
  Clock,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  CreditCard,
  Droplet,
} from 'lucide-react';

interface PastOrdersListProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const PastOrdersList: React.FC<PastOrdersListProps> = ({ onClose, standalone = false }) => {
  const { userId, userProfile } = useAuth();
  const { reorder, navigateTo } = useStore();

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const effectiveUserId = userId || 'guest-user';

  useEffect(() => {
    setLoading(true);
    setError(null);

    const ordersCol = collection(db, 'orders');
    // Fetch user-specific order data from Firestore
    const q = query(ordersCol, where('user_id', '==', effectiveUserId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const fetchedOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            fetchedOrders.push(docSnap.data() as Order);
          });
          // Sort by creation date descending
          fetchedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setUserOrders(fetchedOrders);
          setLoading(false);
        } catch (err: any) {
          console.error('Error processing orders snapshot:', err);
          setError('Failed to parse orders data.');
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Firestore orders query error, falling back:', err);
        try {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        } catch (wrappedErr: any) {
          setError('Unable to load past orders from database.');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [effectiveUserId]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PACKED':
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PLACED':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'CANCELLED':
      case 'RETURNED':
      case 'REFUNDED':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const handleReorderClick = (order: Order) => {
    reorder(order);
    if (onClose) onClose();
  };

  const handleTrackClick = (orderId: string) => {
    navigateTo('ORDER_STATUS', { orderId });
    if (onClose) onClose();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-12 bg-stone-200 rounded animate-pulse" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2.5 animate-pulse">
            <div className="h-4 w-28 bg-stone-200 rounded" />
            <div className="h-3 w-48 bg-stone-100 rounded" />
            <div className="h-3 w-32 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 bg-[#0b301c] text-[#D4AF37] text-xs font-bold rounded-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 mx-auto mb-3">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold font-serif text-stone-900">No Past Orders Found</h3>
        <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed max-w-xs mx-auto">
          You haven't placed any orders yet. Explore our traditional wood-pressed oils and Navaratnalu agro foods!
        </p>
        <button
          onClick={() => {
            navigateTo('PRODUCTS');
            if (onClose) onClose();
          }}
          className="py-2.5 px-4 bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-[#0b301c]" />
          <span>Past Orders ({userOrders.length})</span>
        </div>
        <span className="text-[10px] text-stone-500 font-medium">Real-time sync</span>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {userOrders.map((ord) => {
          const isExpanded = expandedOrderId === ord.id;
          const formattedDate = new Date(ord.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all hover:border-stone-300"
            >
              {/* Order Card Summary Header */}
              <div
                onClick={() => toggleExpand(ord.id)}
                className="p-3.5 flex items-start justify-between cursor-pointer hover:bg-stone-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 font-serif">
                      {ord.order_number}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        ord.order_status
                      )}`}
                    >
                      {ord.order_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{formattedDate}</span>
                  </div>

                  <p className="text-[11px] text-stone-700 font-medium mt-1 line-clamp-1">
                    {ord.items.map((i) => `${i.product_name} (${i.variant_name})`).join(', ')}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end shrink-0">
                  <span className="text-sm font-black text-stone-900">
                    ₹{ord.total_amount}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                    <span>{ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Detailed Breakdown */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-stone-100 bg-stone-50/50 space-y-3 text-xs animate-in fade-in duration-150">
                  {/* Item Rows */}
                  <div className="space-y-2 pt-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center shrink-0">
                              <Droplet className="w-4 h-4 text-[#0b301c]" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 line-clamp-1">
                              {item.product_name}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              Size: {item.variant_name} × {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-stone-900">
                            ₹{item.total_price || item.unit_price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1 text-[11px] text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{ord.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{ord.delivery_charge === 0 ? 'FREE' : `₹${ord.delivery_charge}`}</span>
                    </div>
                    {ord.coupon_discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Coupon Discount ({ord.coupon_code || 'Voucher'})</span>
                        <span>-₹{ord.coupon_discount}</span>
                      </div>
                    )}
                    {ord.reward_discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Loyalty Points Discount</span>
                        <span>-₹{ord.reward_discount}</span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-stone-100 flex justify-between font-extrabold text-xs text-stone-900">
                      <span>Total Paid ({ord.payment_method})</span>
                      <span className="text-[#0b301c]">₹{ord.total_amount}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {ord.address && (
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <div className="text-stone-600">
                        <span className="font-bold text-stone-800">{ord.address.name}</span>: {ord.address.door_no}, {ord.address.street}, {ord.address.city} - {ord.address.pincode}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons: Reorder, Track, Invoice */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleReorderClick(ord)}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>

                    <button
                      onClick={() => handleTrackClick(ord.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoice(ord)}
                      className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 transition-colors"
                      title="View Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h4 className="font-bold font-serif text-stone-900 text-sm">Tax Invoice / Receipt</h4>
                <span className="text-[10px] text-stone-500">{selectedInvoice.order_number}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-stone-600 space-y-1">
              <div className="font-bold text-stone-900">POLUMATI'S SHRESHTA™ COLD PRESSED OILS</div>
              <div>Bhimavaram, West Godavari, Andhra Pradesh - 534201</div>
              <div>FSSAI Lic No: 10123000000492 • GSTIN: 37AAAAA0000A1Z5</div>
            </div>

            <div className="divide-y divide-stone-100 border-y border-stone-200 py-2">
              {selectedInvoice.items.map((it, i) => (
                <div key={i} className="py-1 flex justify-between">
                  <span>{it.product_name} ({it.variant_name}) × {it.quantity}</span>
                  <span className="font-bold">₹{it.total_price || it.unit_price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-sm text-stone-900 pt-1">
              <span>Total Paid</span>
              <span className="text-[#0b301c]">₹{selectedInvoice.total_amount}</span>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2 bg-[#0b301c] text-[#D4AF37] font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
