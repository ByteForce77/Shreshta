import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, loginDemoUser, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !name) {
      setLocalError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name, mobile, referralCode);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'CUSTOMER' | 'ADMIN') => {
    setLoading(true);
    setLocalError(null);
    try {
      await loginDemoUser(role);
      onClose();
    } catch (err: any) {
      setLocalError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#D4AF37]/30 flex flex-col max-h-[90vh]">
        {/* Header with Traditional Green & Gold Accent */}
        <div className="bg-[#0b301c] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#D4AF37]">
              Polumati's Shreshta™
            </span>
          </div>

          <h2 className="text-xl font-bold font-serif">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {mode === 'signin'
              ? 'Access pure cold-pressed oils, orders & subscriptions'
              : 'Join our family and get 150 welcome loyalty reward points'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {(localError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Varma"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0b301c] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 94401 23456"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0b301c] focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0b301c] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0b301c] focus:border-transparent"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Minimum 6 characters</p>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. SHR500"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg uppercase focus:outline-hidden focus:ring-2 focus:ring-[#0b301c]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#0b301c] hover:bg-[#14482c] text-[#D4AF37] font-semibold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Account' : 'Register & Get 150 Points'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In Button */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[10px] uppercase font-semibold text-stone-400">or continue with</span>
              <div className="grow border-t border-stone-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-semibold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-stone-100">
            <p className="text-[11px] text-stone-500 text-center font-medium mb-2.5">
              Quick Test Login (No typing needed):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('CUSTOMER')}
                disabled={loading}
                className="py-1.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#0b301c]" />
                <span>Customer Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={loading}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>

          {/* Switch Mode */}
          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <p className="text-xs text-stone-600">
                New to Polumati's Shreshta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    clearError();
                    setLocalError(null);
                  }}
                  className="font-semibold text-[#0b301c] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-stone-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    clearError();
                    setLocalError(null);
                  }}
                  className="font-semibold text-[#0b301c] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
