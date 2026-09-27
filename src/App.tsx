import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ProductDetailsScreen } from './screens/ProductDetailsScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { OrderStatusScreen } from './screens/OrderStatusScreen';
import { SubscriptionScreen } from './screens/SubscriptionScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { AccountScreen } from './screens/AccountScreen';
import { AdminPanel } from './admin/AdminPanel';
import { GeminiChatbot } from './components/GeminiChatbot';

const ScreenRouter: React.FC = () => {
  const { currentScreen, viewMode } = useStore();

  if (viewMode === 'admin') {
    return <AdminPanel />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'SPLASH':
        return <SplashScreen />;
      case 'HOME':
        return <HomeScreen />;
      case 'PRODUCTS':
        return <ProductsScreen />;
      case 'PRODUCT_DETAILS':
        return <ProductDetailsScreen />;
      case 'CART':
        return <CartScreen />;
      case 'CHECKOUT':
        return <CheckoutScreen />;
      case 'ORDER_STATUS':
        return <OrderStatusScreen />;
      case 'SUBSCRIPTION':
        return <SubscriptionScreen />;
      case 'REWARDS':
        return <RewardsScreen />;
      case 'ACCOUNT':
        return <AccountScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AndroidFrame>
      {renderCurrentScreen()}
      {currentScreen !== 'SPLASH' && <GeminiChatbot />}
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ScreenRouter />
      </StoreProvider>
    </AuthProvider>
  );
}
