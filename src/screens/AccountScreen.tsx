import React, { useState } from 'react';
import {
  User,
  ShoppingBag,
  Calendar,
  MapPin,
  Heart,
  Gift,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AuthModal } from './AuthModal';
import { PastOrdersList } from '../components/PastOrdersList';

export const AccountScreen: React.FC = () => {
  const { userProfile, userId, logout, isAdmin } = useAuth();
  const {
    orders,
    subscriptions,
    addresses,
    wishlistIds,
    products,
    reorder,
    navigateTo,
    createSupportTicket,
    supportTickets,
    setViewMode,
  } = useStore();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<
    'orders' | 'addresses' | 'wishlist' | 'support' | 'faqs' | 'policies' | null
  >(null);

  // New Support Ticket Form
  const [ticketCategory, setTicketCategory] = useState<any>('Order Status');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setTicketSubmitting(true);
    try {
      await createSupportTicket(
        ticketCategory,
        ticketSubject,
        ticketDescription,
        ticketOrderId || undefined
      );
      setTicketNotice('Support ticket created successfully! We will update you shortly.');
      setTicketSubject('');
      setTicketDescription('');
      setTicketOrderId('');
    } catch (err: any) {
      setTicketNotice('Failed to raise ticket: ' + err.message);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="pb-28 bg-[#F8F9FA] min-h-full">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Top Profile Header */}
      <div className="bg-[#0b301c] text-white p-5 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-[#072415] shrink-0">
              <img
                src={
                  userProfile?.profile_image ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold font-serif leading-tight">
                  {userProfile?.name || 'Guest Customer'}
                </h1>
                {isAdmin && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#0b301c]">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300">{userProfile?.mobile || '+91 94401 23456'}</p>
              <p className="text-[10px] text-stone-400">{userProfile?.email || 'customer@shreshta.in'}</p>
            </div>
          </div>

          {!userId ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="py-1.5 px-3 bg-[#D4AF37] text-[#0b301c] text-xs font-bold rounded-lg cursor-pointer shadow-xs"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Loyalty Card */}
        <div className="mt-4 p-2.5 rounded-xl bg-white/10 border border-[#D4AF37]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Loyalty Points:</span>
            <span className="font-bold text-[#D4AF37]">{userProfile?.loyalty_points || 150}</span>
          </div>
          <button
            onClick={() => navigateTo('REWARDS')}
            className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
          >
            Refer & Earn
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Past Orders Section (Fetched live from Firestore) */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <PastOrdersList standalone={true} />
        </div>

        {/* Main Navigation Menu Cards */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden text-xs">
          {/* My Orders with Reorder Flow */}
          <button
            onClick={() => setActiveSubModal('orders')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#0b301c]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">My Orders</div>
                <div className="text-[11px] text-stone-500">
                  Track delivery, previous orders & reorder
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="text-[11px] font-bold text-stone-700">{orders.length}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Subscriptions */}
          <button
            onClick={() => navigateTo('SUBSCRIPTION')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-[#D4AF37]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Monthly Subscriptions</div>
                <div className="text-[11px] text-stone-500">
                  Manage 10+ KG Navaratnalu & 5L oil kit
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="text-[11px] font-bold text-stone-700">{subscriptions.length}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Saved Delivery Addresses */}
          <button
            onClick={() => setActiveSubModal('addresses')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-800">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Saved Addresses</div>
                <div className="text-[11px] text-stone-500">
                  Manage home and work delivery locations
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="text-[11px] font-bold text-stone-700">{addresses.length}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setActiveSubModal('wishlist')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">My Wishlist</div>
                <div className="text-[11px] text-stone-500">
                  Saved oils and agro food favorites
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="text-[11px] font-bold text-stone-700">{wishlistIds.length}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Customer Support & Tickets */}
          <button
            onClick={() => setActiveSubModal('support')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-800">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Customer Support & Grievances</div>
                <div className="text-[11px] text-stone-500">
                  Raise ticket, WhatsApp & Call support
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* FAQs */}
          <button
            onClick={() => setActiveSubModal('faqs')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Frequently Asked Questions</div>
                <div className="text-[11px] text-stone-500">
                  Storage, shelf life, delivery & methods
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* Legal Policies */}
          <button
            onClick={() => setActiveSubModal('policies')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Policies & Terms</div>
                <div className="text-[11px] text-stone-500">
                  Return, refund, shipping, privacy & FSSAI
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Switch to Admin Panel Link */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-xs font-bold text-amber-950 font-serif flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Polumati Admin Panel</span>
            </div>
            <p className="text-[11px] text-amber-900 mt-0.5">
              Manage inventory, update orders, coupons & view real-time metrics.
            </p>
          </div>
          <button
            onClick={() => setViewMode('admin')}
            className="py-1.5 px-3 bg-[#0b301c] hover:bg-[#154c2d] text-[#D4AF37] text-xs font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
          >
            Open Admin
          </button>
        </div>
      </div>

      {/* Sub-Modal / Drawer Views */}
      {activeSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-xs font-bold uppercase tracking-wider font-serif text-stone-900">
                {activeSubModal === 'orders' && 'My Orders & Reorder'}
                {activeSubModal === 'addresses' && 'Shipping Addresses'}
                {activeSubModal === 'wishlist' && 'My Wishlist'}
                {activeSubModal === 'support' && 'Customer Support & Tickets'}
                {activeSubModal === 'faqs' && 'Frequently Asked Questions'}
                {activeSubModal === 'policies' && 'Legal & Store Policies'}
              </h3>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold p-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* 1. ORDERS VIEW WITH REORDER */}
              {activeSubModal === 'orders' && (
                <PastOrdersList onClose={() => setActiveSubModal(null)} />
              )}

              {/* 2. SAVED ADDRESSES */}
              {activeSubModal === 'addresses' && (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{a.name} ({a.address_type})</span>
                        {a.is_default && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600">
                        {a.door_no}, {a.street}, {a.locality ? `${a.locality}, ` : ''}{a.city}, {a.state} - {a.pincode}
                      </p>
                      <p className="text-stone-500 text-[10px]">Mobile: {a.mobile}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. WISHLIST */}
              {activeSubModal === 'wishlist' && (
                <div className="space-y-3">
                  {wishlistedProducts.length === 0 ? (
                    <p className="text-xs text-stone-500 text-center py-6">Your wishlist is empty.</p>
                  ) : (
                    wishlistedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          navigateTo('PRODUCT_DETAILS', { productId: p.id });
                          setActiveSubModal(null);
                        }}
                        className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between cursor-pointer hover:border-[#0b301c]"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.main_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-bold text-stone-900">{p.name}</div>
                            <div className="text-[11px] font-bold text-[#0b301c]">₹{p.variants[0]?.price}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 4. CUSTOMER SUPPORT & TICKETS */}
              {activeSubModal === 'support' && (
                <div className="space-y-4">
                  {ticketNotice && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{ticketNotice}</span>
                    </div>
                  )}

                  {/* Immediate WhatsApp / Phone Contacts */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://wa.me/919440123456?text=Hello%20Polumati%20Shreshta%20Support"
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Help</span>
                    </a>
                    <a
                      href="tel:+919440123456"
                      className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-4 h-4 text-stone-700" />
                      <span>Call +91 9440123456</span>
                    </a>
                  </div>

                  {/* Raise Ticket Form */}
                  <form onSubmit={handleCreateTicket} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5 text-xs">
                    <div className="font-bold text-stone-900 uppercase text-[10px] tracking-wider">
                      Raise an Official Support Ticket
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-600 block mb-0.5">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value as any)}
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
                      >
                        <option>Order Status</option>
                        <option>Payment Issue</option>
                        <option>Delivery Delay</option>
                        <option>Product Quality</option>
                        <option>Subscription</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-600 block mb-0.5">Subject</label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="e.g. Question regarding wood-pressed shelf life"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-600 block mb-0.5">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={ticketDescription}
                        onChange={(e) => setTicketDescription(e.target.value)}
                        placeholder="Describe the issue or query in detail..."
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={ticketSubmitting}
                      className="w-full py-2 bg-[#0b301c] text-[#D4AF37] text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
                    </button>
                  </form>

                  {/* Existing User Tickets */}
                  {supportTickets.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-stone-400">
                        Your Recent Support Tickets
                      </div>
                      {supportTickets.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl border border-stone-200 bg-white text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">{t.ticket_number} - {t.subject}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                              {t.status}
                            </span>
                          </div>
                          <p className="text-stone-600 text-[11px]">{t.description}</p>
                          {t.admin_reply && (
                            <div className="mt-1 p-2 rounded-lg bg-emerald-50 text-emerald-900 text-[11px]">
                              <span className="font-bold">Staff Response:</span> {t.admin_reply}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. FAQS */}
              {activeSubModal === 'faqs' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <h4 className="font-bold text-stone-900 mb-1">How is Shreshta Wood-Pressed Oil extracted?</h4>
                    <p className="text-stone-600 leading-relaxed">
                      We use heavy Vaagai wood expellers (Chekku) operating under 14 RPM. Temperature never exceeds 35°C, ensuring vital antioxidants like Sesamol and natural Vitamin E remain intact.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <h4 className="font-bold text-stone-900 mb-1">What is the shelf life of cold pressed oil?</h4>
                    <p className="text-stone-600 leading-relaxed">
                      Because our oils contain zero artificial preservatives, they are best consumed within 6-9 months from pressing when stored in a cool, dark pantry.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <h4 className="font-bold text-stone-900 mb-1">What is the Navaratnalu 10+ KG kit?</h4>
                    <p className="text-stone-600 leading-relaxed">
                      It is our signature monthly family staple containing 9 sacred native grains: Toor dal, Moong, Urad, Chana, Sesame, Bansi Wheat, Hand-Pounded Rice, Horsegram, and Cowpeas.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. POLICIES */}
              {activeSubModal === 'policies' && (
                <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <h4 className="font-bold text-stone-900 mb-1">Return & Refund Guarantee</h4>
                    <p>
                      If any container shows damage or leakage upon arrival, we offer immediate free replacement or 100% refund within 24 hours of reporting.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                    <h4 className="font-bold text-stone-900 mb-1">FSSAI & Regulatory Compliance</h4>
                    <p>
                      Polumati's Shreshta™ is processed in certified hygienic agro facilities complying with all FSSAI and food safety standards.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
