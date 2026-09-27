import React, { useEffect, useState } from 'react';
import { Droplet, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useStore();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    const timer = setTimeout(() => {
      navigateTo('HOME');
    }, 2400);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [navigateTo]);

  return (
    <div className="min-h-full h-full flex flex-col justify-between items-center bg-gradient-to-b from-[#0b301c] via-[#0f3d24] to-[#082214] text-white p-8 relative overflow-hidden select-none">
      {/* Background Decorative Traditional Motifs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

      {/* Top Quality Badge */}
      <div className="pt-6 flex items-center gap-1.5 text-xs text-[#D4AF37] tracking-widest uppercase font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>100% Traditional Cold Pressed</span>
      </div>

      {/* Main Center Brand Identity */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-xs">
        {/* Emblem Logo */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#071d11] shadow-[0_0_30px_rgba(212,175,55,0.25)]">
            <div className="w-20 h-20 rounded-full border border-[#D4AF37]/40 flex flex-col items-center justify-center">
              <Droplet className="w-9 h-9 text-[#D4AF37] fill-[#D4AF37]/20" />
            </div>
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#D4AF37] text-[#0b301c] text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
            Pure & Natural
          </span>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl font-extrabold tracking-wider font-serif uppercase text-white leading-tight">
          POLUMATI'S
        </h1>
        <div className="text-3xl font-black tracking-widest font-serif text-[#D4AF37] mt-0.5">
          SHRESHTA™
        </div>

        {/* Category Description */}
        <div className="text-xs font-medium tracking-widest uppercase text-stone-200 mt-2 border-y border-[#D4AF37]/30 py-1.5 px-3">
          COLD PRESSED OILS & AGRO FOODS
        </div>

        {/* Official Tagline */}
        <p className="text-sm font-serif italic text-amber-100/90 mt-4 tracking-wide">
          “Born to Add Value”
        </p>

        {/* Telugu Script Accent */}
        <div className="text-xs text-[#D4AF37]/80 mt-1 font-medium">
          స్వచ్ఛమైన కొయ్యగానుగ నూనెలు
        </div>
      </div>

      {/* Footer Status & Skip Button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4 pb-6 z-10">
        <div className="flex items-center gap-2 text-xs text-stone-300">
          <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing live harvest catalogue{dots}</span>
        </div>

        <button
          onClick={() => navigateTo('HOME')}
          className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#e2bd45] active:scale-98 text-[#0b301c] font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Enter Store</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>FSSAI Certified • Zero Heat Cold Pressed</span>
        </div>
      </div>
    </div>
  );
};
