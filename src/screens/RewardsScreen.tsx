import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Sparkles,
  Users,
  Coins,
  History,
  ArrowRight,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export const RewardsScreen: React.FC = () => {
  const { userProfile, userId } = useAuth();
  const { navigateTo } = useStore();
  const [copied, setCopied] = useState(false);

  const referralCode = userProfile?.referral_code || 'SHR4921';
  const referralLink = `https://shreshta.in/invite/${referralCode}`;
  const points = userProfile?.loyalty_points || 150;
  const rupeeValue = Math.round(points * 0.5);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Hey! I'm ordering 100% pure cold pressed oils and sacred Navaratnalu agro foods from Polumati's Shreshta™. Use my code ${referralCode} to get ₹100 off on your first order! ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Mock ledger history for demonstration
  const transactions = [
    {
      id: 'tx-1',
      title: 'Welcome Joining Bonus',
      date: 'Today',
      points: '+150',
      type: 'credit',
    },
    {
      id: 'tx-2',
      title: 'Referral Bonus: Suresh K.',
      date: 'Yesterday',
      points: '+200',
      type: 'credit',
    },
    {
      id: 'tx-3',
      title: 'Redeemed at Checkout',
      date: '3 days ago',
      points: '-100',
      type: 'debit',
    },
  ];

  return (
    <div className="pb-28 bg-[#F8F9FA] min-h-full">
      {/* Top Header */}
      <div className="bg-[#0b301c] text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
            Shreshta Family Club
          </span>
        </div>
        <h1 className="text-base font-bold font-serif">Refer & Earn Rewards</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Loyalty Points Balance Card */}
        <div className="bg-gradient-to-br from-[#0b301c] via-[#114529] to-[#072415] rounded-2xl p-5 text-white shadow-md border border-[#D4AF37]/30 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-300 font-medium">Your Points Balance</span>
            <span className="text-[10px] font-bold text-[#D4AF37] bg-white/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
              1 Pt = ₹0.50
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="text-3xl font-black font-serif text-[#D4AF37]">{points}</span>
            <span className="text-xs text-stone-300">Shreshta Points</span>
          </div>

          <p className="text-xs text-stone-200">
            Equivalent value of <span className="font-bold text-white">₹{rupeeValue}</span> applicable on your next order at checkout.
          </p>
        </div>

        {/* Refer & Earn Share Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-[#D4AF37]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-stone-900 font-serif">
                Invite Friends & Family
              </h2>
              <p className="text-[11px] text-stone-500">
                They get ₹100 off, you get 200 Loyalty Points!
              </p>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                Your Unique Code
              </span>
              <span className="text-base font-black tracking-widest text-[#0b301c]">
                {referralCode}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="py-1.5 px-3 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Share via WhatsApp</span>
          </button>
        </div>

        {/* How It Works Steps */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif">
            How Rewards Work
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0b301c] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <div className="font-bold text-stone-900">Share Your Code</div>
                <div className="text-[11px] text-stone-500">
                  Send your link or referral code to friends and neighbors.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0b301c] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <div className="font-bold text-stone-900">They Place an Order</div>
                <div className="text-[11px] text-stone-500">
                  Your friend receives flat ₹100 discount on minimum order of ₹599.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0b301c] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <div className="font-bold text-stone-900">Get 200 Points Credited</div>
                <div className="text-[11px] text-stone-500">
                  As soon as their package is delivered, 200 points get credited to your wallet.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Transaction Ledger */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-serif flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#0b301c]" />
              <span>Reward History Ledger</span>
            </h3>
            <span className="text-[10px] text-stone-500 font-semibold">Audited</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{tx.title}</div>
                  <div className="text-[10px] text-stone-400">{tx.date}</div>
                </div>
                <div
                  className={`font-black ${
                    tx.type === 'credit' ? 'text-emerald-700' : 'text-stone-700'
                  }`}
                >
                  {tx.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
