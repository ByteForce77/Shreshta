import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calendar,
  Tag,
  MessageSquare,
  Image as ImageIcon,
  Users,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Product, OrderStatus, Category, Coupon, ProductVariant } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    products,
    categories,
    orders,
    subscriptions,
    coupons,
    supportTickets,
    updateOrderStatusAdmin,
    saveProductAdmin,
    deleteProductAdmin,
    saveCouponAdmin,
    replySupportTicketAdmin,
    resetDatabaseWithSeedData,
    setViewMode,
  } = useStore();

  const { userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'subscriptions' | 'coupons' | 'tickets'
  >('dashboard');

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Ticket reply state
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('RESOLVED');

  // KPI Calculations
  const totalRevenue = orders.reduce((acc, o) => (o.payment_status === 'PAID' ? acc + o.total_amount : acc), 0);
  const pendingOrders = orders.filter((o) => o.order_status === 'PLACED' || o.order_status === 'CONFIRMED' || o.order_status === 'PROCESSING');
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const lowStockProducts = products.filter((p) => p.variants.some((v) => v.stock_quantity <= 25));

  const handleOpenAddProduct = () => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      category_id: categories[0]?.id || 'cold-pressed-oils',
      name: '',
      name_telugu: '',
      slug: '',
      description: '',
      highlights: ['100% Traditional Cold-Pressed', 'Zero Chemicals'],
      ingredients: '100% Native Sun-Dried Kernels.',
      storage_information: 'Store in a cool, dry place away from direct sunlight.',
      delivery_information: 'Packed in food grade leak-proof container.',
      main_image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      featured: false,
      rating: 4.9,
      reviews_count: 50,
      variants: [
        {
          id: `var-${Date.now()}-1`,
          size: '1 Litre',
          unit: 'L',
          price: 350,
          mrp: 420,
          stock_quantity: 50,
          sku: `SHR-${Date.now().toString().slice(-4)}`,
          status: 'ACTIVE',
        },
      ],
    };
    setEditingProduct(newProd);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;
    await saveProductAdmin(editingProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!replyText) return;
    await replySupportTicketAdmin(ticketId, replyText, replyStatus);
    setReplyTicketId(null);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="bg-[#0b301c] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('mobile')}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-[#D4AF37] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Android App View</span>
          </button>

          <div className="h-5 w-[1px] bg-white/20" />

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <h1 className="text-sm font-bold font-serif uppercase tracking-wider text-white">
                POLUMATI'S SHRESHTA™
              </h1>
            </div>
            <p className="text-[10px] text-stone-300">
              Admin Web Operations Console • Real-time Firebase Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetDatabaseWithSeedData}
            title="Reset default catalogue in Firestore"
            className="flex items-center gap-1.5 py-1.5 px-3 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Seed Initial Data</span>
          </button>

          <div className="text-right text-xs">
            <span className="font-semibold text-white block">
              {userProfile?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">
              {userProfile?.role || 'SUPER_ADMIN'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 space-y-1 shrink-0">
          <div className="text-[10px] font-bold uppercase text-slate-400 px-3 mb-2 tracking-wider">
            Management Modules
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Fulfillment</span>
            </div>
            {pendingOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Products & Stock</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">{products.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>Family Subscriptions</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">{subscriptions.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons & Rewards</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Support Grievances</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">{supportTickets.length}</span>
          </button>
        </aside>

        {/* Content Workspace */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Operations Dashboard
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live overview of Polumati's Shreshta agro-commerce business
                  </p>
                </div>
              </div>

              {/* KPI Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">
                      Total Sales Revenue
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Real-time synced
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">
                      Orders Count
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {orders.length}
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                      {pendingOrders.length} pending processing
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">
                      Active Subscriptions
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {activeSubs.length}
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                      Monthly 10KG+5L Kits
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">
                      Low Stock Alerts
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {lowStockProducts.length}
                    </div>
                    <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                      Under 25 units in mill
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-serif text-slate-900">
                    Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#0b301c] hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{ord.order_number}</span>
                          <span className="text-slate-500 font-medium">{ord.user_name || 'Customer'}</span>
                          <span className="text-[10px] text-slate-400">({ord.items.length} items)</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Method: {ord.payment_method} • Destination: {ord.address?.city || 'AP'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-sm">₹{ord.total_amount}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ord.order_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Orders Management & Status Transitions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update order progress: PLACED → CONFIRMED → PROCESSING → PACKED → OUT_FOR_DELIVERY → DELIVERED
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5">Order No</th>
                      <th className="p-3.5">Customer & Address</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Order Status</th>
                      <th className="p-3.5">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">
                          {ord.order_number}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{ord.user_name || 'Customer'}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            {ord.address?.door_no}, {ord.address?.street}, {ord.address?.city}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-700 line-clamp-1 max-w-[200px]">
                            {ord.items.map((i: any) => `${i.product_name} (${i.variant_name}) × ${i.quantity}`).join(', ')}
                          </div>
                        </td>
                        <td className="p-3.5 font-extrabold text-slate-900">
                          ₹{ord.total_amount}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {ord.payment_status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0b301c]/10 text-[#0b301c] border border-[#0b301c]/20">
                            {ord.order_status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.order_status}
                            onChange={(e) => updateOrderStatusAdmin(ord.id, e.target.value as OrderStatus)}
                            className="p-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0b301c]"
                          >
                            <option value="PLACED">PLACED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="PACKED">PACKED</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="REFUNDED">REFUNDED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Product Catalogue & Mill Inventory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage prices, Telugu names, packaging sizes and available stock
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="py-2 px-3.5 bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3 justify-between"
                  >
                    <img
                      src={p.main_image}
                      alt={p.name}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 text-xs">
                      <div className="text-[10px] font-semibold text-[#0b301c]">
                        {p.name_telugu}
                      </div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Category: <span className="font-semibold">{p.category_id}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {p.variants.map((v) => (
                          <span
                            key={v.id}
                            className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700"
                          >
                            {v.size}: ₹{v.price} ({v.stock_quantity} left)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProductAdmin(p.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Monthly Family Essentials Subscriptions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recurring monthly deliveries of 10+ KG Navaratnalu & 5L cold-pressed oils
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5">Subscriber</th>
                      <th className="p-3.5">Plan</th>
                      <th className="p-3.5">Selected Oils</th>
                      <th className="p-3.5">Next Delivery</th>
                      <th className="p-3.5">Monthly Amount</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.user_name || 'Subscriber'}</div>
                          <div className="text-[10px] text-slate-400">{sub.user_id}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">{sub.plan_name}</td>
                        <td className="p-3.5 text-[11px] text-slate-600">
                          {sub.selected_oils.join(', ')}
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">{sub.next_delivery_date}</td>
                        <td className="p-3.5 font-bold text-slate-900">₹{sub.total_amount}/mo</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Coupons & Promotional Rules
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create discount voucher codes validated across checkout
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#0b301c] tracking-wider uppercase">
                        {c.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        {c.status}
                      </span>
                    </div>

                    <p className="text-slate-700 font-semibold">{c.title}</p>
                    <div className="text-[11px] text-slate-500">
                      Discount: {c.discount_type === 'FIXED' ? `₹${c.discount_value}` : `${c.discount_value}%`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Min Order: ₹{c.minimum_order}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Customer Grievances & Support Tickets
                  </h2>
                  <p className="text-xs text-slate-500">
                    Respond to tickets, resolve delivery issues and manage communications
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {supportTickets.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No open support tickets.
                  </div>
                ) : (
                  supportTickets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{t.ticket_number}</span>
                          <span className="font-semibold text-slate-700">— {t.subject}</span>
                          <span className="text-slate-400">({t.category})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {t.status}
                        </span>
                      </div>

                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {t.description}
                      </p>

                      {t.admin_reply && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-[11px]">
                          <span className="font-bold">Sent Staff Response:</span> {t.admin_reply}
                        </div>
                      )}

                      {replyTicketId === t.id ? (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type resolution reply for customer..."
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="flex items-center justify-between">
                            <select
                              value={replyStatus}
                              onChange={(e) => setReplyStatus(e.target.value as any)}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="IN_PROGRESS">Set IN_PROGRESS</option>
                              <option value="RESOLVED">Set RESOLVED</option>
                              <option value="CLOSED">Set CLOSED</option>
                            </select>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setReplyTicketId(null)}
                                className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplyTicket(t.id)}
                                className="px-3 py-1 bg-[#0b301c] text-[#D4AF37] font-bold rounded-lg"
                              >
                                Send Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyTicketId(t.id);
                            setReplyText(t.admin_reply || '');
                          }}
                          className="text-xs font-bold text-[#0b301c] hover:underline"
                        >
                          {t.admin_reply ? 'Update Reply / Status' : 'Reply to Customer'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Edit / Add Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold font-serif text-slate-900">
                {editingProduct.id.includes('prod-') ? 'Edit Product Details' : 'Add New Agro Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Name (Telugu) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_telugu}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_telugu: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Main Image URL</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.main_image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, main_image: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Primary Variant Pricing */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900">Packaging Size & Pricing (Variant 1)</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Size (e.g. 1 Litre)</label>
                    <input
                      type="text"
                      value={editingProduct.variants[0]?.size || '1 Litre'}
                      onChange={(e) => {
                        const next = [...editingProduct.variants];
                        if (next[0]) next[0].size = e.target.value;
                        setEditingProduct({ ...editingProduct, variants: next });
                      }}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.variants[0]?.price || 350}
                      onChange={(e) => {
                        const next = [...editingProduct.variants];
                        if (next[0]) next[0].price = Number(e.target.value);
                        setEditingProduct({ ...editingProduct, variants: next });
                      }}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">MRP (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.variants[0]?.mrp || 420}
                      onChange={(e) => {
                        const next = [...editingProduct.variants];
                        if (next[0]) next[0].mrp = Number(e.target.value);
                        setEditingProduct({ ...editingProduct, variants: next });
                      }}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Stock Qty</label>
                    <input
                      type="number"
                      value={editingProduct.variants[0]?.stock_quantity || 50}
                      onChange={(e) => {
                        const next = [...editingProduct.variants];
                        if (next[0]) next[0].stock_quantity = Number(e.target.value);
                        setEditingProduct({ ...editingProduct, variants: next });
                      }}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b301c] text-[#D4AF37] font-bold rounded-lg shadow-sm"
                >
                  Save to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
