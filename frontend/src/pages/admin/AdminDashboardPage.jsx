/**
 * AdminDashboard — Orchestrator for admin sub-pages.
 * Replaces the original monolith and routes dynamically to SaaS sub-pages.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../api/productService';
import { orderService } from '../../api/orderService';
import { userService } from '../../api/userService';
import { categoryService } from '../../api/categoryService';
import { contactService } from '../../api/contactService';

// Admin sub-pages
import AdminStats from './AdminStats';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminUsers from './AdminUsers';
import AdminCoupons from './AdminCoupons';
import AdminReviews from './AdminReviews';
import AdminBlogs from './AdminBlogs';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import AdminContacts from './AdminContacts';
import AdminSupportTickets from './AdminSupportTickets';
import AdminTeam from './AdminTeam';
import AdminPartnerships from './AdminPartnerships';

const AdminDashboardPage = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboard data state
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Auto-protect admin route (only after auth state is fully resolved)
  useEffect(() => {
    if (loading) return;
    if (!token) {
      navigate('/account/login?redirect=/admin/dashboard');
    } else if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, token, loading, navigate]);

  /**
   * Fetch all dashboard data.
   */
  const fetchDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    const [pRes, oRes, uRes, cRes, conRes, statsRes] = await Promise.allSettled([
      productService.getAll({ limit: 100 }),
      orderService.getAll(),
      userService.getAll(),
      categoryService.getAll(),
      contactService.getAll(),
      orderService.getStats(),
    ]);

    if (pRes.status === 'fulfilled' && pRes.value.success) {
      setProducts(pRes.value.data?.products || pRes.value.data || []);
    }
    if (oRes.status === 'fulfilled' && oRes.value.success) {
      setOrders(oRes.value.data || []);
    }
    if (uRes.status === 'fulfilled' && uRes.value.success) {
      setUsers(uRes.value.data || []);
    }
    if (cRes.status === 'fulfilled' && cRes.value.success) {
      setCategories(cRes.value.data || []);
    }
    if (conRes.status === 'fulfilled' && conRes.value.success) {
      setContacts(conRes.value.data || []);
    }
    if (statsRes.status === 'fulfilled' && statsRes.value.success) {
      setStats(statsRes.value.data);
    } else if (statsRes.status === 'rejected') {
      setStatsError(statsRes.reason?.message || 'Failed to load dashboard statistics');
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    if (token && user?.isAdmin) {
      fetchDashboardData();
    }
  }, [token, user, fetchDashboardData]);

  if (loading || !user || !user.isAdmin) return null;

  // Determine which sub-page to render based on current route
  const path = location.pathname;

  if (path === '/admin/products') {
    return <AdminProducts products={products} categories={categories} onRefresh={fetchDashboardData} />;
  }
  if (path === '/admin/categories') {
    return <AdminCategories categories={categories} onRefresh={fetchDashboardData} />;
  }
  if (path === '/admin/orders') {
    return <AdminOrders orders={orders} onRefresh={fetchDashboardData} />;
  }
  if (path === '/admin/customers') {
    return <AdminCustomers users={users} orders={orders} />;
  }
  if (path === '/admin/users') {
    return <AdminUsers users={users} onRefresh={fetchDashboardData} />;
  }
  if (path === '/admin/coupons') {
    return <AdminCoupons />;
  }
  if (path === '/admin/reviews') {
    return <AdminReviews />;
  }
  if (path === '/admin/blogs') {
    return <AdminBlogs />;
  }
  if (path === '/admin/analytics') {
    return <AdminAnalytics products={products} orders={orders} />;
  }
  if (path === '/admin/settings') {
    return <AdminSettings />;
  }
  if (path === '/admin/contacts') {
    return <AdminContacts contacts={contacts} />;
  }
  if (path === '/admin/support') {
    return <AdminSupportTickets />;
  }
  if (path === '/admin/team') {
    return <AdminTeam />;
  }
  if (path === '/admin/partnerships') {
    return <AdminPartnerships />;
  }

  // Default: Stats Overview
  return (
    <AdminStats
      stats={stats}
      products={products}
      orders={orders}
      users={users}
      categories={categories}
      loading={statsLoading}
      error={statsError}
      onRefresh={fetchDashboardData}
    />
  );
};

export default AdminDashboardPage;
