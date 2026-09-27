import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Droplet,
  Pause,
  Play,
  XCircle,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Clock,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export const SubscriptionScreen: React.FC = () => {
  const {
    subscriptions,
    createSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    addresses,
    navigateTo,
  } = useStore();

  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Configurable 5 Litre oils combination
  const [groundnutLitres, setGroundnutLitres] = useState(2);
  const [sesameLitres, setSesameLitres] = useState(2);
  const [coconutLitres, setCoconutLitres] = useState(1);
  const [poojaLitres, setPoojaLitres] = useState(0);

  const [deliveryDay, setDeliveryDay] = useState(1); // 1st of every month
  const [autoRenew, setAutoRenew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];

  const totalOilsSelected = groundnutLitres + sesameLitres + coconutLitres + poojaLitres;
  const targetOils = 5; // 5 Litres minimum

  // Pricing calculation
  // Base 10KG Navaratnalu kit: ₹1,550
  // Oils: Groundnut ₹340/L, Sesame ₹460/L, Coconut ₹390/L, Pooja ₹290/L
  const oilsPrice =
    groundnutLitres * 340 + sesameLitres * 460 + coconutLitres * 390 + poojaLitres * 290;
  const navaratnaluPrice = 1550;
  const regularTotal = oilsPrice + navaratnaluPrice;
  const subscriptionDiscount = Math.round(regularTotal * 0.15); // 15% discount for monthly subscription
  const finalMonthlyPrice = regularTotal - subscriptionDiscount;

  const handleSubscribe = async () => {
    if (totalOilsSelected !== targetOils) {
      setFeedback(`Please select exactly ${targetOils} Litres of oils (Currently: ${totalOilsSelected}L).`);
      return;
    }
    if (!defaultAddr) {
      setFeedback('Please add a delivery address first.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const selectedOilsSummary: string[] = [];
    if (groundnutLitres > 0) selectedOilsSummary.push(`${groundnutLitres}L Wood-Pressed Groundnut Oil`);
    if (sesameLitres > 0) selectedOilsSummary.push(`${sesameLitres}L Wood-Pressed Sesame Oil`);
    if (coconutLitres > 0) selectedOilsSummary.push(`${coconutLitres}L Wood-Pressed Coconut Oil`);
    if (poojaLitres > 0) selectedOilsSummary.push(`${poojaLitres}L Pancha Deepam Pooja Oil`);

    try {
      await createSubscription(
        'Shreshta Golden Monthly Family Essentials',
        '10+ KG Navaratnalu 9 Sacred Grains + 5 KG Cold-Pressed Oils',
        selectedOilsSummary,
        deliveryDay,
        defaultAddr,
        finalMonthlyPrice
      );
      setFeedback('Subscription activated successfully! Delivered every month.');
      setActiveTab('manage');
    } catch (err: any) {
      setFeedback('Failed to start subscription: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-28 bg-[#F8F9FA] min-h-full">
      {/* Top Header */}
      <div className="bg-[#0b301c] text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Recurring Farm Fresh</span>
            </div>
            <h1 className="text-base font-bold font-serif leading-tight">
              Monthly Family Essentials
            </h1>
          </div>

          <div className="flex bg-white/10 p-0.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'create' ? 'bg-[#D4AF37] text-[#0b301c]' : 'text-stone-300'
              }`}
            >
              Build Kit
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'manage' ? 'bg-[#D4AF37] text-[#0b301c]' : 'text-stone-300'
              }`}
            >
              My Plan ({subscriptions.length})
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.includes('success')
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {activeTab === 'create' ? (
          <>
            {/* Value Proposition Hero */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Save Flat 15% Monthly
                </span>
                <span className="text-xs text-stone-500 font-medium">Free Doorstep Delivery</span>
              </div>
              <h2 className="text-base font-bold font-serif text-stone-900 leading-snug">
                10+ KG Navaratnalu + 5 KG Cold-Pressed Oils
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Never run out of pure wood-pressed cooking oils or unpolished native grains. Fully configurable oil choices, hassle-free auto-delivery, pause or cancel anytime with one click.
              </p>
            </div>

            {/* Step 1: Configurable Oil Selection */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-[#0b301c]" />
                    <span>Select 5 Litres Oil Mix</span>
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Customize the 5L ratio for your kitchen
                  </span>
                </div>

                <div
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                    totalOilsSelected === targetOils
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {totalOilsSelected} / {targetOils} Litres
                </div>
              </div>

              {/* Oil Option 1: Groundnut */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Wood-Pressed Groundnut Oil
                  </div>
                  <div className="text-[10px] text-stone-500">
                    శ్రేష్ట వేరుశెనగ నూనె (₹340/L)
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200">
                  <button
                    onClick={() => setGroundnutLitres((l) => Math.max(0, l - 1))}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-stone-900 w-4 text-center">
                    {groundnutLitres}L
                  </span>
                  <button
                    onClick={() => {
                      if (totalOilsSelected < targetOils) setGroundnutLitres((l) => l + 1);
                    }}
                    disabled={totalOilsSelected >= targetOils}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Oil Option 2: Sesame */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Wood-Pressed Sesame (Til) Oil
                  </div>
                  <div className="text-[10px] text-stone-500">
                    శ్రేష్ట స్వచ్ఛమైన నువ్వుల నూనె (₹460/L)
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200">
                  <button
                    onClick={() => setSesameLitres((l) => Math.max(0, l - 1))}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-stone-900 w-4 text-center">
                    {sesameLitres}L
                  </span>
                  <button
                    onClick={() => {
                      if (totalOilsSelected < targetOils) setSesameLitres((l) => l + 1);
                    }}
                    disabled={totalOilsSelected >= targetOils}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Oil Option 3: Coconut */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Virgin Wood-Pressed Coconut Oil
                  </div>
                  <div className="text-[10px] text-stone-500">
                    శ్రేష్ట కొబ్బరి నూనె (₹390/L)
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200">
                  <button
                    onClick={() => setCoconutLitres((l) => Math.max(0, l - 1))}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-stone-900 w-4 text-center">
                    {coconutLitres}L
                  </span>
                  <button
                    onClick={() => {
                      if (totalOilsSelected < targetOils) setCoconutLitres((l) => l + 1);
                    }}
                    disabled={totalOilsSelected >= targetOils}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Oil Option 4: Pooja Oil */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Pancha Deepam Pooja Oil
                  </div>
                  <div className="text-[10px] text-stone-500">
                    శ్రేష్ట పంచ దీపారాధన నూనె (₹290/L)
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200">
                  <button
                    onClick={() => setPoojaLitres((l) => Math.max(0, l - 1))}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-stone-900 w-4 text-center">
                    {poojaLitres}L
                  </span>
                  <button
                    onClick={() => {
                      if (totalOilsSelected < targetOils) setPoojaLitres((l) => l + 1);
                    }}
                    disabled={totalOilsSelected >= targetOils}
                    className="w-5 h-5 rounded flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Included Navaratnalu 9 Grains Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#0b301c]" />
                  <span>10+ KG Navaratnalu Sacred Box Included</span>
                </h3>
                <span className="text-[10px] font-bold text-[#0b301c]">9 Sacred Items</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Toor Dal (కందులు)</div>
                  <div className="text-[10px] text-stone-500">2 KG • Native Unpolished</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Moong Dal (పెసలు)</div>
                  <div className="text-[10px] text-stone-500">1 KG • Whole Green Grain</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Black Urad (మినుములు)</div>
                  <div className="text-[10px] text-stone-500">2 KG • Rich Andhra Idli Taste</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Chana (శనగలు)</div>
                  <div className="text-[10px] text-stone-500">1 KG • Desi Brown Bengal Gram</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Sesame (నువ్వులు)</div>
                  <div className="text-[10px] text-stone-500">500 G • Native White Til</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Bansi Wheat (గోధుమలు)</div>
                  <div className="text-[10px] text-stone-500">2 KG • Whole Amber Grain</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Brown Rice (వరి)</div>
                  <div className="text-[10px] text-stone-500">2 KG • Hand-Pounded</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="font-bold text-stone-800">Horsegram (ఉలువలు)</div>
                  <div className="text-[10px] text-stone-500">500 G • High Iron & Fiber</div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 col-span-2">
                  <div className="font-bold text-stone-800">Cowpeas / Alasandalu (బొబ్బర్లు)</div>
                  <div className="text-[10px] text-stone-500">500 G • Protein Rich Agro Food</div>
                </div>
              </div>
            </div>

            {/* Step 3: Delivery Day & Auto-Renew */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0b301c]" />
                <span>Monthly Delivery Schedule</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryDay(1)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    deliveryDay === 1
                      ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-stone-900">1st of Every Month</div>
                  <div className="text-[10px] text-stone-500">Start of the month fresh supply</div>
                </button>

                <button
                  onClick={() => setDeliveryDay(5)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    deliveryDay === 5
                      ? 'border-[#0b301c] bg-[#0b301c]/5 ring-1 ring-[#0b301c]'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-stone-900">5th of Every Month</div>
                  <div className="text-[10px] text-stone-500">First week scheduled batch</div>
                </button>
              </div>

              {/* Auto Renew Switch */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Auto-Renew Monthly</div>
                  <div className="text-[10px] text-stone-500">
                    Cancel or pause anytime with zero fee
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0b301c]"></div>
                </label>
              </div>
            </div>

            {/* Price & Subscribe Button */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Kit Retail Value</span>
                <span className="line-through">₹{regularTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Monthly Subscription Discount (15%)</span>
                <span>-₹{subscriptionDiscount}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-extrabold text-sm text-stone-900">
                <span>Billed Monthly</span>
                <span className="text-base text-[#0b301c]">₹{finalMonthlyPrice}/month</span>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isSubmitting || totalOilsSelected !== targetOils}
                className="w-full mt-3 py-3.5 bg-[#0b301c] hover:bg-[#154c2d] disabled:opacity-50 text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Start Monthly Delivery (₹{finalMonthlyPrice}/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Manage Active Subscriptions Tab */
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
                <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-800 font-serif">
                  No Active Subscriptions Yet
                </h3>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  Create your family's recurring monthly kit of 10+ KG Navaratnalu & 5L cold-pressed oils.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-[#0b301c] text-[#D4AF37] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Configure Family Kit
                </button>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#D4AF37]">
                        Monthly Family Essentials
                      </span>
                      <h3 className="text-xs font-bold text-stone-900 font-serif">
                        {sub.plan_name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : sub.status === 'PAUSED'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-stone-600">
                    <p className="font-semibold text-stone-800">Selected Oils Combination:</p>
                    <ul className="list-disc list-inside text-[11px] text-stone-500 space-y-0.5">
                      {sub.selected_oils.map((oil, idx) => (
                        <li key={idx}>{oil}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                    <div>
                      <div className="text-[10px] text-stone-400">Next Delivery</div>
                      <div className="font-bold text-stone-900">{sub.next_delivery_date}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Next Billing</div>
                      <div className="font-bold text-stone-900">{sub.next_billing_date}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs font-bold text-stone-900">
                      ₹{sub.total_amount}/month
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.status === 'ACTIVE' ? (
                        <button
                          onClick={() => pauseSubscription(sub.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      ) : sub.status === 'PAUSED' ? (
                        <button
                          onClick={() => resumeSubscription(sub.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      ) : null}

                      {sub.status !== 'CANCELLED' && (
                        <button
                          onClick={() => cancelSubscription(sub.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
