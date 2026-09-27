import React from 'react';
import {
  Home,
  Grid,
  Calendar,
  Gift,
  User,
  ShoppingBag,
  Smartphone,
  Monitor,
  ShieldCheck,
  Wifi,
  Signal,
  Battery,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ScreenName } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const { currentScreen, navigateTo, cartCount, viewMode, setViewMode } = useStore();

  const isTabActive = (screen: ScreenName) => {
    if (screen === 'HOME') return currentScreen === 'HOME';
    if (screen === 'PRODUCTS') return currentScreen === 'PRODUCTS' || currentScreen === 'PRODUCT_DETAILS';
    if (screen === 'SUBSCRIPTION') return currentScreen === 'SUBSCRIPTION';
    if (screen === 'REWARDS') return currentScreen === 'REWARDS';
    if (screen === 'ACCOUNT') return currentScreen === 'ACCOUNT';
    return false;
  };

  const showBottomNav = currentScreen !== 'SPLASH';

  return (
    <div className="min-h-screen bg-[#E2E8F0] flex flex-col items-center justify-start p-0 md:py-6 selection:bg-[#D4AF37]/30">
      {/* Top Device Switcher Toolbar */}
      <div className="w-full max-w-4xl px-4 py-2.5 mb-3 flex items-center justify-between text-xs font-semibold text-slate-700 bg-white/80 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0b301c]" />
          <span className="font-serif font-bold text-slate-900">
            POLUMATI'S SHRESHTA™
          </span>
          <span className="text-[10px] text-[#0b301c] bg-emerald-100 font-bold px-2 py-0.5 rounded-full hidden sm:inline">
            Born to Add Value
          </span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white text-[#0b301c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android App (390px)</span>
          </button>

          <button
            onClick={() => setViewMode('expanded')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'expanded'
                ? 'bg-white text-[#0b301c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive Web</span>
          </button>

          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'admin'
                ? 'bg-[#0b301c] text-[#D4AF37] shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame or Full View */}
      <div
        className={`w-full transition-all duration-300 ${
          viewMode === 'mobile'
            ? 'max-w-[412px] h-[870px] max-h-[92vh] rounded-[42px] border-[10px] border-[#1E293B] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col relative overflow-hidden bg-white ring-1 ring-slate-900/10'
            : 'max-w-2xl min-h-[85vh] rounded-3xl border border-slate-300 shadow-xl flex flex-col relative overflow-hidden bg-white'
        }`}
      >
        {/* Android Punch Hole & Status Bar (in mobile frame mode) */}
        {viewMode === 'mobile' && (
          <div className="bg-[#0b301c] text-white px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-medium shrink-0 z-40 select-none">
            {/* Clock */}
            <span>9:41</span>

            {/* Camera Punch Hole */}
            <div className="w-4 h-4 rounded-full bg-black border border-stone-800/80 mx-auto" />

            {/* Android System Icons */}
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-white/90" />
              <Wifi className="w-3.5 h-3.5 text-white/90" />
              <Battery className="w-4 h-4 text-white/90" />
            </div>
          </div>
        )}

        {/* Screen Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar bg-[#F8F9FA]">
          {children}
        </div>

        {/* 5-Item Bottom Navigation Bar */}
        {showBottomNav && (
          <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 flex items-center justify-around z-40 shadow-lg">
            {/* 1. Home */}
            <button
              onClick={() => navigateTo('HOME')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isTabActive('HOME')
                  ? 'text-[#0b301c] font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Home className={`w-5 h-5 ${isTabActive('HOME') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">Home</span>
            </button>

            {/* 2. Products */}
            <button
              onClick={() => navigateTo('PRODUCTS')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isTabActive('PRODUCTS')
                  ? 'text-[#0b301c] font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Grid className={`w-5 h-5 ${isTabActive('PRODUCTS') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">Products</span>
            </button>

            {/* 3. Subscription (Family Kit) */}
            <button
              onClick={() => navigateTo('SUBSCRIPTION')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isTabActive('SUBSCRIPTION')
                  ? 'text-[#0b301c] font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className="relative">
                <Calendar className={`w-5 h-5 ${isTabActive('SUBSCRIPTION') ? 'stroke-[2.5]' : ''}`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium">Monthly Kit</span>
            </button>

            {/* 4. Rewards */}
            <button
              onClick={() => navigateTo('REWARDS')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isTabActive('REWARDS')
                  ? 'text-[#0b301c] font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Gift className={`w-5 h-5 ${isTabActive('REWARDS') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">Rewards</span>
            </button>

            {/* 5. Account */}
            <button
              onClick={() => navigateTo('ACCOUNT')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isTabActive('ACCOUNT')
                  ? 'text-[#0b301c] font-bold'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <User className={`w-5 h-5 ${isTabActive('ACCOUNT') ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">Account</span>
            </button>

            {/* Floating / Embedded Cart Icon with Count Badge */}
            <button
              onClick={() => navigateTo('CART')}
              className="relative p-2 rounded-xl bg-[#0b301c] text-[#D4AF37] shadow-sm hover:bg-[#154c2d] transition-transform active:scale-95 cursor-pointer ml-1"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#0b301c] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Android Gesture Bar */}
        {viewMode === 'mobile' && (
          <div className="bg-white py-1.5 flex justify-center shrink-0">
            <div className="w-32 h-1 bg-stone-300 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
