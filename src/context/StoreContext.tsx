import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  ScreenName,
  Product,
  Category,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  Subscription,
  Coupon,
  Address,
  SupportTicket,
  Banner,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
} from '../firebase/seedData';
import confetti from 'canvas-confetti';

interface StoreContextType {
  // Navigation
  currentScreen: ScreenName;
  screenHistory: ScreenName[];
  selectedProductId: string | null;
  activeOrderId: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'mobile' | 'expanded' | 'admin';
  setViewMode: (mode: 'mobile' | 'expanded' | 'admin') => void;
  navigateTo: (
    screen: ScreenName,
    params?: { productId?: string; orderId?: string; category?: string }
  ) => void;
  goBack: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (catId: string | null) => void;

  // Real-time Data
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  orders: Order[];
  subscriptions: Subscription[];
  addresses: Address[];
  supportTickets: SupportTicket[];
  wishlistIds: string[];
  isLoadingData: boolean;

  // Cart Management
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, qty?: number) => void;
  updateCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryCharge: number;
  couponDiscount: number;
  rewardDiscount: number;
  totalAmount: number;

  // Coupon & Rewards
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  useRewardPoints: boolean;
  toggleRewardPoints: () => void;

  // Actions
  toggleWishlist: (productId: string) => void;
  placeOrder: (address: Address, paymentMethod: PaymentMethod) => Promise<Order>;
  reorder: (prevOrder: Order) => void;
  updateOrderStatusAdmin: (orderId: string, status: OrderStatus, paymentStatus?: any) => Promise<void>;
  createSubscription: (
    planName: string,
    kitDesc: string,
    selectedOils: string[],
    deliveryDay: number,
    address: Address,
    total: number
  ) => Promise<Subscription>;
  pauseSubscription: (subId: string) => Promise<void>;
  resumeSubscription: (subId: string) => Promise<void>;
  cancelSubscription: (subId: string) => Promise<void>;
  saveAddress: (addressData: Omit<Address, 'id' | 'user_id' | 'created_at'>, addressId?: string) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  createSupportTicket: (
    category: any,
    subject: string,
    description: string,
    orderId?: string
  ) => Promise<void>;
  replySupportTicketAdmin: (ticketId: string, reply: string, status: any) => Promise<void>;

  // Admin Product & Catalog Management
  saveProductAdmin: (product: Product) => Promise<void>;
  deleteProductAdmin: (productId: string) => Promise<void>;
  saveCategoryAdmin: (category: Category) => Promise<void>;
  saveBannerAdmin: (banner: Banner) => Promise<void>;
  saveCouponAdmin: (coupon: Coupon) => Promise<void>;
  resetDatabaseWithSeedData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userId, userProfile, isAdmin, updateUserProfile } = useAuth();

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('SPLASH');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['HOME']);
  const [selectedProductId, setSelectedProductId] = useState<string | null>('prod-groundnut-oil');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'mobile' | 'expanded' | 'admin'>('mobile');

  // Real-time Database state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-groundnut-oil', 'prod-navaratnalu-kit']);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    {
      product_id: 'prod-groundnut-oil',
      variant_id: 'var-gn-1L',
      product_name: "Shreshta Traditional Wood Pressed Groundnut Oil",
      product_name_telugu: "శ్రేష్ట కొయ్యగానుగ వేరుశెనగ నూనె",
      variant_name: "1 Litre",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
      unit_price: 340,
      mrp: 400,
      quantity: 1,
    },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [useRewardPoints, setUseRewardPoints] = useState<boolean>(false);

  // Auto seed initial data if Firestore collections are empty
  const checkAndSeedData = async () => {
    try {
      await testFirestoreConnection();
      const prodSnap = await getDocs(collection(db, 'products'));
      if (prodSnap.empty) {
        console.log('Seeding initial catalogue to Firestore...');
        const batch = writeBatch(db);

        INITIAL_CATEGORIES.forEach((cat) => {
          batch.set(doc(db, 'categories', cat.id), cat);
        });

        INITIAL_PRODUCTS.forEach((prod) => {
          batch.set(doc(db, 'products', prod.id), prod);
        });

        INITIAL_BANNERS.forEach((ban) => {
          batch.set(doc(db, 'banners', ban.id), ban);
        });

        INITIAL_COUPONS.forEach((coup) => {
          batch.set(doc(db, 'coupons', coup.id), coup);
        });

        await batch.commit();
        console.log('Firestore seeding completed successfully.');
      }
    } catch (e) {
      console.warn('Seed verification bypassed or handled:', e);
    }
  };

  // Seed once on mount
  useEffect(() => {
    checkAndSeedData();
  }, []);

  // 1. Listen to real-time Products
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => list.push(docSnap.data() as Product));
          setProducts(list);
        }
        setIsLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );
    return () => unsub();
  }, []);

  // 2. Listen to real-time Categories
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((docSnap) => list.push(docSnap.data() as Category));
          list.sort((a, b) => a.sort_order - b.sort_order);
          setCategories(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );
    return () => unsub();
  }, []);

  // 3. Listen to real-time Banners
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'banners'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Banner[] = [];
          snapshot.forEach((docSnap) => list.push(docSnap.data() as Banner));
          list.sort((a, b) => a.sort_order - b.sort_order);
          setBanners(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'banners');
      }
    );
    return () => unsub();
  }, []);

  // 4. Listen to real-time Coupons
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Coupon[] = [];
          snapshot.forEach((docSnap) => list.push(docSnap.data() as Coupon));
          setCoupons(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'coupons');
      }
    );
    return () => unsub();
  }, []);

  // 5. Listen to real-time Orders
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Order;
          if (isAdmin || !userId || data.user_id === userId) {
            list.push(data);
          }
        });
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(list);
      },
      (error) => {
        console.warn('Orders listener error (safe fallback):', error);
      }
    );
    return () => unsub();
  }, [userId, isAdmin]);

  // 6. Listen to real-time Subscriptions
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'subscriptions'),
      (snapshot) => {
        const list: Subscription[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Subscription;
          if (isAdmin || !userId || data.user_id === userId) {
            list.push(data);
          }
        });
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setSubscriptions(list);
      },
      (error) => {
        console.warn('Subscriptions listener warning:', error);
      }
    );
    return () => unsub();
  }, [userId, isAdmin]);

  // 7. Listen to real-time Addresses
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'addresses'),
      (snapshot) => {
        const list: Address[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Address;
          if (!userId || data.user_id === userId) {
            list.push(data);
          }
        });
        setAddresses(list);
      },
      (error) => {
        console.warn('Addresses listener warning:', error);
      }
    );
    return () => unsub();
  }, [userId]);

  // 8. Listen to real-time Support Tickets
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'support_tickets'),
      (snapshot) => {
        const list: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as SupportTicket;
          if (isAdmin || !userId || data.user_id === userId) {
            list.push(data);
          }
        });
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setSupportTickets(list);
      },
      (error) => {
        console.warn('Tickets listener warning:', error);
      }
    );
    return () => unsub();
  }, [userId, isAdmin]);

  // Provide initial default address if none exists
  useEffect(() => {
    if (addresses.length === 0 && userId) {
      const defaultAddr: Address = {
        id: `addr-${userId}-default`,
        user_id: userId,
        address_type: 'Home',
        name: userProfile?.name || 'Ramesh Varma',
        mobile: userProfile?.mobile || '+91 94401 23456',
        door_no: 'Flat 402, Shreshta Nilayam',
        street: 'Main Temple Road, Opp. Rythu Bazar',
        locality: 'Bhimavaram',
        city: 'West Godavari',
        state: 'Andhra Pradesh',
        pincode: '534201',
        delivery_instructions: 'Ring bell or call before delivery',
        is_default: true,
        created_at: new Date().toISOString(),
      };
      setDoc(doc(db, 'addresses', defaultAddr.id), defaultAddr).catch(() => {
        setAddresses([defaultAddr]);
      });
    }
  }, [userId, addresses.length, userProfile]);

  // Navigation handlers
  const navigateTo = (
    screen: ScreenName,
    params?: { productId?: string; orderId?: string; category?: string }
  ) => {
    if (params?.productId) setSelectedProductId(params.productId);
    if (params?.orderId) setActiveOrderId(params.orderId);
    if (params?.category !== undefined) setSelectedCategory(params.category);

    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1] || 'HOME';
      setScreenHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('HOME');
    }
  };

  // Cart operations
  const addToCart = (product: Product, variantId?: string, qty = 1) => {
    const selectedVariant = variantId
      ? product.variants.find((v) => v.id === variantId) || product.variants[0]
      : product.variants[0];

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product_id === product.id && item.variant_id === selectedVariant.id
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          variant_id: selectedVariant.id,
          product_name: product.name,
          product_name_telugu: product.name_telugu,
          variant_name: selectedVariant.size,
          image: product.main_image,
          unit_price: selectedVariant.price,
          mrp: selectedVariant.mrp,
          quantity: qty,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, variantId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => !(item.product_id === productId && item.variant_id === variantId));
      }
      return prev.map((item) => {
        if (item.product_id === productId && item.variant_id === variantId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) => prev.filter((item) => !(item.product_id === productId && item.variant_id === variantId)));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  }, [cart]);

  // Delivery charge: Free above ₹799, otherwise ₹60
  const deliveryCharge = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 799 ? 0 : 60;
  }, [subtotal]);

  // Coupon Discount
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || subtotal < appliedCoupon.minimum_order) return 0;
    if (appliedCoupon.discount_type === 'FIXED') {
      return Math.min(appliedCoupon.discount_value, subtotal);
    }
    const percentAmount = (subtotal * appliedCoupon.discount_value) / 100;
    return Math.min(percentAmount, appliedCoupon.maximum_discount);
  }, [appliedCoupon, subtotal]);

  // Reward points discount: each point = ₹0.50 (Max ₹100 or 50% of subtotal)
  const rewardDiscount = useMemo(() => {
    if (!useRewardPoints || !userProfile?.loyalty_points) return 0;
    const maxRedeemPoints = Math.min(userProfile.loyalty_points, 200);
    const calculated = maxRedeemPoints * 0.5;
    return Math.min(calculated, subtotal * 0.4);
  }, [useRewardPoints, userProfile?.loyalty_points, subtotal]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + deliveryCharge - couponDiscount - rewardDiscount);
  }, [subtotal, deliveryCharge, couponDiscount, rewardDiscount]);

  const applyCoupon = (code: string) => {
    const found = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.status === 'ACTIVE'
    );
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    if (subtotal < found.minimum_order) {
      return {
        success: false,
        message: `Minimum cart value of ₹${found.minimum_order} required for coupon ${found.code}`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const toggleRewardPoints = () => setUseRewardPoints((prev) => !prev);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Place order with Realtime sync to Firestore
  const placeOrder = async (address: Address, paymentMethod: PaymentMethod): Promise<Order> => {
    const orderNumber = `SHR-${Date.now().toString().slice(-6)}`;
    const effectiveUserId = userId || 'guest-user';
    const now = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(now.getDate() + 2);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      user_id: effectiveUserId,
      user_name: userProfile?.name || address.name,
      user_email: userProfile?.email || 'customer@shreshta.in',
      user_phone: userProfile?.mobile || address.mobile,
      items: cart.map((c) => ({
        product_id: c.product_id,
        variant_id: c.variant_id,
        product_name: c.product_name,
        variant_name: c.variant_name,
        image: c.image,
        quantity: c.quantity,
        unit_price: c.unit_price,
        total_price: c.unit_price * c.quantity,
      })),
      subtotal,
      discount: couponDiscount + rewardDiscount,
      delivery_charge: deliveryCharge,
      reward_discount: rewardDiscount,
      coupon_discount: couponDiscount,
      coupon_code: appliedCoupon?.code,
      total_amount: totalAmount,
      payment_status: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      order_status: 'CONFIRMED',
      payment_method: paymentMethod,
      address,
      expected_delivery_date: deliveryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (err) {
      console.warn('Could not write order to Firestore directly, updating state locally:', err);
    }

    // Award loyalty points for purchase (10 points per ₹100)
    const earnedPoints = Math.floor(totalAmount / 10);
    if (userProfile && userId) {
      const updatedPoints = Math.max(0, userProfile.loyalty_points - (useRewardPoints ? 100 : 0) + earnedPoints);
      updateUserProfile({ loyalty_points: updatedPoints });
    }

    // Clear cart and confetti celebration
    clearCart();
    setAppliedCoupon(null);
    setUseRewardPoints(false);
    setActiveOrderId(newOrder.id);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0b301c', '#D4AF37', '#15803d', '#ffffff'],
      });
    } catch (e) {
      // non-blocking
    }

    return newOrder;
  };

  const reorder = (prevOrder: Order) => {
    prevOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        addToCart(prod, item.variant_id, item.quantity);
      }
    });
    navigateTo('CART');
  };

  const updateOrderStatusAdmin = async (orderId: string, status: OrderStatus, paymentStatus?: any) => {
    const updatePayload: any = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };
    if (paymentStatus) {
      updatePayload.payment_status = paymentStatus;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), updatePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Subscription management
  const createSubscription = async (
    planName: string,
    kitDesc: string,
    selectedOils: string[],
    deliveryDay: number,
    address: Address,
    total: number
  ): Promise<Subscription> => {
    const effectiveUserId = userId || 'guest-user';
    const now = new Date();
    const nextDelivery = new Date();
    nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    nextDelivery.setDate(deliveryDay);

    const nextBilling = new Date(nextDelivery);
    nextBilling.setDate(nextBilling.getDate() - 2);

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      user_id: effectiveUserId,
      user_name: userProfile?.name || address.name,
      plan_id: 'family-kit-monthly',
      plan_name: planName,
      kit_description: kitDesc,
      selected_oils: selectedOils,
      grains_kit: [
        'Toor Dal (కందులు) - 2 KG',
        'Moong Dal (పెసలు) - 1 KG',
        'Black Urad Dal (మినుములు) - 2 KG',
        'Bengal Gram (శనగలు) - 1 KG',
        'Native White Sesame (నువ్వులు) - 500 G',
        'Bansi Whole Wheat (గోధుమలు) - 2 KG',
        'Hand-Pounded Brown Rice (వరి) - 2 KG',
        'Horsegram (ఉలువలు) - 500 G',
        'Cowpeas (బొబ్బర్లు) - 500 G',
      ],
      status: 'ACTIVE',
      delivery_date_day: deliveryDay,
      next_delivery_date: nextDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      next_billing_date: nextBilling.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      auto_renew: true,
      payment_method: 'Auto-Debit UPI Mandate',
      total_amount: total,
      address,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    try {
      await setDoc(doc(db, 'subscriptions', newSub.id), newSub);
    } catch (err) {
      console.warn('Subscription write error:', err);
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#0b301c', '#D4AF37', '#10b981'],
      });
    } catch (e) {
      // non-blocking
    }

    return newSub;
  };

  const pauseSubscription = async (subId: string) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), {
        status: 'PAUSED',
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  };

  const resumeSubscription = async (subId: string) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), {
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  };

  const cancelSubscription = async (subId: string) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), {
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  };

  // Address management
  const saveAddress = async (
    addressData: Omit<Address, 'id' | 'user_id' | 'created_at'>,
    addressId?: string
  ) => {
    const id = addressId || `addr-${Date.now()}`;
    const target: Address = {
      ...addressData,
      id,
      user_id: userId || 'guest-user',
      created_at: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'addresses', id), target);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `addresses/${id}`);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await deleteDoc(doc(db, 'addresses', addressId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `addresses/${addressId}`);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const batch = writeBatch(db);
      addresses.forEach((addr) => {
        batch.update(doc(db, 'addresses', addr.id), {
          is_default: addr.id === addressId,
        });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Set default address warning:', err);
    }
  };

  // Support Tickets
  const createSupportTicket = async (
    category: any,
    subject: string,
    description: string,
    orderId?: string
  ) => {
    const id = `ticket-${Date.now()}`;
    const newTicket: SupportTicket = {
      id,
      ticket_number: `TKT-${Date.now().toString().slice(-5)}`,
      user_id: userId || 'guest-user',
      user_name: userProfile?.name || 'Customer',
      user_email: userProfile?.email || 'customer@shreshta.in',
      order_id: orderId || '',
      category,
      subject,
      description,
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'support_tickets', id), newTicket);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `support_tickets/${id}`);
    }
  };

  const replySupportTicketAdmin = async (ticketId: string, reply: string, status: any) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        admin_reply: reply,
        status,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${ticketId}`);
    }
  };

  // Admin catalog managers
  const saveProductAdmin = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const deleteProductAdmin = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  const saveCategoryAdmin = async (category: Category) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
    }
  };

  const saveBannerAdmin = async (banner: Banner) => {
    try {
      await setDoc(doc(db, 'banners', banner.id), banner);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`);
    }
  };

  const saveCouponAdmin = async (coupon: Coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.id}`);
    }
  };

  const resetDatabaseWithSeedData = async () => {
    setIsLoadingData(true);
    const batch = writeBatch(db);
    INITIAL_CATEGORIES.forEach((cat) => batch.set(doc(db, 'categories', cat.id), cat));
    INITIAL_PRODUCTS.forEach((prod) => batch.set(doc(db, 'products', prod.id), prod));
    INITIAL_BANNERS.forEach((ban) => batch.set(doc(db, 'banners', ban.id), ban));
    INITIAL_COUPONS.forEach((coup) => batch.set(doc(db, 'coupons', coup.id), coup));
    await batch.commit();
    setIsLoadingData(false);
  };

  return (
    <StoreContext.Provider
      value={{
        currentScreen,
        screenHistory,
        selectedProductId,
        activeOrderId,
        selectedCategory,
        searchQuery,
        viewMode,
        setViewMode,
        navigateTo,
        goBack,
        setSearchQuery,
        setSelectedCategory,
        products,
        categories,
        banners,
        coupons,
        orders,
        subscriptions,
        addresses,
        supportTickets,
        wishlistIds,
        isLoadingData,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        deliveryCharge,
        couponDiscount,
        rewardDiscount,
        totalAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        useRewardPoints,
        toggleRewardPoints,
        toggleWishlist,
        placeOrder,
        reorder,
        updateOrderStatusAdmin,
        createSubscription,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        createSupportTicket,
        replySupportTicketAdmin,
        saveProductAdmin,
        deleteProductAdmin,
        saveCategoryAdmin,
        saveBannerAdmin,
        saveCouponAdmin,
        resetDatabaseWithSeedData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
