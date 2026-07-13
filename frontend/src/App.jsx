import React, { Suspense, lazy } from 'react';
import Loader from './components/ui/Loader';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CategoryProvider } from './context/CategoryContext';

// Error Boundary — prevents blank white screen on render crashes
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components (not lazy — needed immediately for shell)
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

// Lazy-loaded pages — code splitting for better initial load performance
const Home = lazy(() => import('./pages/Home'));
const Collections = lazy(() => import('./pages/Collections'));
const ProductListing = lazy(() => import('./pages/ProductListing'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));

function App() {
  return (
    /* Added secure fallback string to prevent rendering-phase crashes when environment variable is empty/undefined */
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <ToastProvider>
        <AuthProvider>
          <CategoryProvider>
            <CartProvider>
              <WishlistProvider>
                <Router>
                  <ScrollToTop />
                  <ErrorBoundary>
                    <Suspense fallback={<Loader fullScreen />}>
                      <Routes>
                        {/* Public routes with MainLayout (Header + Footer + AnnouncementBar) */}
                        <Route element={<MainLayout />}>
                          <Route path="/" element={<Home />} />
                          <Route path="/collections" element={<Collections />} />
                          <Route path="/collections/:categorySlug" element={<ProductListing />} />
                          <Route path="/products/:slug" element={<ProductDetail />} />
                          <Route path="/pages/about-us" element={<AboutUs />} />
                          <Route path="/pages/contact" element={<Contact />} />
                          <Route path="/pages/faq" element={<FAQ />} />
                          <Route path="/blogs/news" element={<Blog />} />
                          {/* Added route for single blog details to prevent wildcard home redirection */}
                          <Route path="/blogs/news/:slug" element={<Blog />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/account/profile" element={<Profile />} />
                          <Route path="/orders/track" element={<OrderTracking />} />
                          <Route path="/unauthorized" element={<Unauthorized />} />
                        </Route>

                        {/* Authentication Layout Routes (Minimal Centered, No Header/Footer) */}
                        <Route element={<AuthLayout />}>
                          <Route path="/account/login" element={<Login />} />
                          <Route path="/account/register" element={<Register />} />
                          <Route path="/account/forgot-password" element={<ForgotPassword />} />
                          <Route path="/account/reset-password/:token" element={<ResetPassword />} />
                          <Route path="/account/verify-otp" element={<OTPVerification />} />
                          <Route path="/account/verify-email" element={<EmailVerification />} />
                        </Route>

                        {/* Admin routes with AdminLayout (tab navigation) */}
                        <Route element={<AdminLayout />}>
                          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                          <Route path="/admin/products" element={<AdminDashboardPage />} />
                          <Route path="/admin/categories" element={<AdminDashboardPage />} />
                          <Route path="/admin/orders" element={<AdminDashboardPage />} />
                          <Route path="/admin/customers" element={<AdminDashboardPage />} />
                          <Route path="/admin/users" element={<AdminDashboardPage />} />
                          <Route path="/admin/coupons" element={<AdminDashboardPage />} />
                          <Route path="/admin/reviews" element={<AdminDashboardPage />} />
                          <Route path="/admin/blogs" element={<AdminDashboardPage />} />
                          <Route path="/admin/analytics" element={<AdminDashboardPage />} />
                          <Route path="/admin/settings" element={<AdminDashboardPage />} />
                          <Route path="/admin/contacts" element={<AdminDashboardPage />} />
                        </Route>

                        {/* Fallback redirects */}
                        <Route path="/account" element={<Navigate to="/" replace />} />
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Router>
              </WishlistProvider>
            </CartProvider>
          </CategoryProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;