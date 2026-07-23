import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { orderService } from '../api/orderService';
import { addressService } from '../api/addressService';
import { authService } from '../api/authService';
import { productService } from '../api/productService';
import { useToast } from '../context/ToastContext';

// Account Sub-Components
import AccountLayout from '../components/account/AccountLayout';
import AccountDashboard from '../components/account/AccountDashboard';
import AccountOrders from '../components/account/AccountOrders';
import AccountAddresses from '../components/account/AccountAddresses';
import AccountWishlist from '../components/account/AccountWishlist';
import AccountRecentlyViewed from '../components/account/AccountRecentlyViewed';
import AccountRewards from '../components/account/AccountRewards';
import AccountNotifications from '../components/account/AccountNotifications';
import { useNotificationsQuery } from '../hooks/queries/useNotificationsQuery';
import AccountSettings from '../components/account/AccountSettings';
import AccountSecurity from '../components/account/AccountSecurity';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile, uploadAvatar, removeAvatar, setUser } = useAuth();
  const { wishlistItems } = useWishlist();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // API State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // Ref for account workspace container
  const workspaceRef = useRef(null);

  const handleTabChange = (tabId, fromMenu = true) => {
    setSearchParams({ tab: tabId });

    if (fromMenu && workspaceRef.current) {
      const headerHeight = 90; // Offset for sticky navbar
      const rect = workspaceRef.current.getBoundingClientRect();
      const targetY = rect.top + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'instant'
      });
    }
  };

  // Redirect if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate(`/account/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
    }
  }, [user, navigate, location]);

  // Fetch Profile / Me
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('[Profile] Failed to refresh profile:', err);
      }
    };
    if (user) {
      refreshProfile();
    }
  }, [setUser]);

  // Fetch Orders
  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const res = await orderService.getMyOrders();
      if (res.success) {
        const rawOrders = Array.isArray(res.data) ? res.data : Array.isArray(res.orders) ? res.orders : [];
        setOrders(rawOrders);
      }
    } catch (err) {
      console.error('[Profile] Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Fetch Addresses
  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setLoadingAddresses(true);
      const res = await addressService.getAddresses();
      if (res.success) {
        setAddresses(res.data || []);
      }
    } catch (err) {
      console.error('[Profile] Error loading addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Fetch Recommended Products
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await productService.getAllProducts({ limit: 4 });
        if (res.success) {
          setRecommendedProducts(res.data || []);
        }
      } catch (err) {
        console.error('[Profile] Error fetching recommended:', err);
      }
    };
    fetchRecommended();
  }, []);

  // Fetch Recently Viewed Products from localStorage
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(item => item && typeof item === 'object' && item._id);
            setRecentlyViewedProducts(valid);
          }
        }
      } catch (err) {
        console.error('[Profile] Error parsing recently viewed:', err);
      }
    };
    loadRecentlyViewed();
  }, [activeTab]);

  const handleClearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewedProducts([]);
    showToast('Browsing history cleared!', 'success');
  };

  // Address Handlers
  const handleAddAddress = async (formData) => {
    try {
      const res = await addressService.createAddress(formData);
      if (res.success) {
        showToast('Address added successfully!', 'success');
        fetchAddresses();
      } else {
        showToast(res.message || 'Failed to add address', 'error');
      }
    } catch (err) {
      showToast('Error saving address', 'error');
    }
  };

  const handleEditAddress = async (id, formData) => {
    try {
      const res = await addressService.updateAddress(id, formData);
      if (res.success) {
        showToast('Address updated successfully!', 'success');
        fetchAddresses();
      } else {
        showToast(res.message || 'Failed to update address', 'error');
      }
    } catch (err) {
      showToast('Error updating address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await addressService.deleteAddress(id);
      if (res.success) {
        showToast('Address deleted', 'success');
        fetchAddresses();
      } else {
        showToast(res.message || 'Failed to delete address', 'error');
      }
    } catch (err) {
      showToast('Error deleting address', 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await addressService.setDefaultAddress(id);
      if (res.success) {
        showToast('Default address updated!', 'success');
        fetchAddresses();
      } else {
        showToast(res.message || 'Failed to set default address', 'error');
      }
    } catch (err) {
      showToast('Error setting default address', 'error');
    }
  };

  if (!user) {
    return <Loader fullScreen />;
  }

  const { data: notifications = [] } = useNotificationsQuery();
  const unreadNotificationsCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.filter((n) => !n.isRead).length : 0),
    [notifications]
  );

  const counts = {
    ordersCount: orders.length,
    addressesCount: addresses.length,
    wishlistCount: wishlistItems.length,
    unreadNotificationsCount,
  };

  return (
    <AccountLayout
      user={user}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onAvatarUploadClick={() => handleTabChange('settings', true)}
      counts={counts}
      workspaceRef={workspaceRef}
    >
      {/* 1. Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <AccountDashboard
          user={user}
          orders={orders}
          wishlist={wishlistItems}
          addresses={addresses}
          recommendedProducts={recommendedProducts}
          onTabChange={(tab) => handleTabChange(tab, true)}
        />
      )}

      {/* 2. My Orders Tab */}
      {activeTab === 'orders' && (
        <AccountOrders
          orders={orders}
          isLoading={loadingOrders}
        />
      )}

      {/* 3. Addresses Tab */}
      {activeTab === 'addresses' && (
        <AccountAddresses
          addresses={addresses}
          isLoading={loadingAddresses}
          onAddAddress={handleAddAddress}
          onEditAddress={handleEditAddress}
          onDeleteAddress={handleDeleteAddress}
          onSetDefaultAddress={handleSetDefaultAddress}
        />
      )}

      {/* 4. Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <AccountWishlist
          wishlist={wishlistItems}
        />
      )}

      {/* 5. Recently Viewed Tab */}
      {activeTab === 'recently-viewed' && (
        <AccountRecentlyViewed
          products={recentlyViewedProducts}
          onClearHistory={handleClearRecentlyViewed}
        />
      )}

      {/* 6. Reward Points Tab */}
      {activeTab === 'rewards' && (
        <AccountRewards
          user={user}
        />
      )}

      {/* 7. Notifications Tab */}
      {activeTab === 'notifications' && (
        <AccountNotifications />
      )}

      {/* 8. Settings Tab */}
      {activeTab === 'settings' && (
        <AccountSettings
          user={user}
          onUpdateProfile={updateProfile}
          onUploadAvatar={uploadAvatar}
          onRemoveAvatar={removeAvatar}
        />
      )}

      {/* 9. Security Tab */}
      {activeTab === 'security' && (
        <AccountSecurity
          user={user}
          onUpdateProfile={updateProfile}
          onLogout={logout}
        />
      )}
    </AccountLayout>
  );
};

export default Profile;