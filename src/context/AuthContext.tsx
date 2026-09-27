import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userId: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name: string,
    mobile?: string,
    referredBy?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  loginDemoUser: (role?: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'varmaisking460@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Generate random referral code like SHRESHTA-4921
  const generateReferralCode = (name: string) => {
    const clean = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SHR';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${clean}${rand}`;
  };

  // Sync user profile from Firestore or initialize default
  const fetchOrCreateProfile = async (fbUser: FirebaseUser, extraData?: { name?: string; mobile?: string; referredBy?: string }) => {
    const userRef = doc(db, 'users', fbUser.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        const isUserAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const newProfile: UserProfile = {
          id: fbUser.uid,
          name: extraData?.name || fbUser.displayName || (isUserAdmin ? 'Polumati Admin' : 'Shreshta Customer'),
          email: fbUser.email || '',
          mobile: extraData?.mobile || '+91 98765 43210',
          role: isUserAdmin ? 'ADMIN' : 'CUSTOMER',
          status: 'ACTIVE',
          referral_code: generateReferralCode(extraData?.name || fbUser.displayName || 'SHRESHTA'),
          referred_by: extraData?.referredBy || '',
          loyalty_points: 150, // Welcome gift loyalty points
          created_at: new Date().toISOString(),
          profile_image: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        };

        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Could not read/write user profile to Firestore:', err);
      // Fallback local profile if offline or rules blocked
      const isUserAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const fallback: UserProfile = {
        id: fbUser.uid,
        name: extraData?.name || fbUser.displayName || 'Customer',
        email: fbUser.email || '',
        mobile: extraData?.mobile || '+91 98765 43210',
        role: isUserAdmin ? 'ADMIN' : 'CUSTOMER',
        status: 'ACTIVE',
        referral_code: generateReferralCode('SHR'),
        loyalty_points: 100,
        created_at: new Date().toISOString(),
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setUser(fbUser);
        setUserId(fbUser.uid);
        await fetchOrCreateProfile(fbUser);
      } else {
        setUser(null);
        setUserId(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(cred.user);
      setUserId(cred.user.uid);
      await fetchOrCreateProfile(cred.user);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please try again or create an account.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few moments and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network error. Please check your internet connection.';
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    mobile?: string,
    referredBy?: string
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        setUser(cred.user);
        setUserId(cred.user.uid);
        await fetchOrCreateProfile(cred.user, { name, mobile, referredBy });
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      let msg = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      setUser(cred.user);
      setUserId(cred.user.uid);
      await fetchOrCreateProfile(cred.user);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      let msg = 'Failed to sign in with Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Google sign-in popup was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by browser. Please allow popups.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserId(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userId || !userProfile) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updated_at: new Date().toISOString(),
      });
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Quick Demo account login for effortless instant testing
  const loginDemoUser = async (role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    setIsLoading(true);
    setError(null);
    const demoEmail = role === 'ADMIN' ? ADMIN_EMAIL : 'customer.shreshta@gmail.com';
    const demoPass = 'Shreshta@2026';

    try {
      await loginWithEmail(demoEmail, demoPass);
    } catch {
      // If demo account doesn't exist yet, try creating it automatically
      try {
        await signUpWithEmail(
          demoEmail,
          demoPass,
          role === 'ADMIN' ? 'Polumati Super Admin' : 'Ramesh Varma',
          '+91 94401 23456'
        );
      } catch (e: any) {
        // Fallback local session state if Firebase Auth denies creation
        const demoUid = role === 'ADMIN' ? 'admin-polumati-01' : 'customer-ramesh-01';
        setUserId(demoUid);
        const profile: UserProfile = {
          id: demoUid,
          name: role === 'ADMIN' ? 'Polumati Super Admin' : 'Ramesh Varma',
          email: demoEmail,
          mobile: '+91 94401 23456',
          role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
          status: 'ACTIVE',
          referral_code: role === 'ADMIN' ? 'ADMIN01' : 'RAMESH26',
          loyalty_points: 250,
          created_at: new Date().toISOString(),
          profile_image: role === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        };
        setUserProfile(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        userProfile,
        isLoading,
        isAdmin,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfile,
        loginDemoUser,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
